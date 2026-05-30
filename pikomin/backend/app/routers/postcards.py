from __future__ import annotations

import asyncio
import json
import time
import urllib.error
import urllib.request
from typing import Any

from fastapi import APIRouter, HTTPException

from app.models.schemas import GPSCoordinate, PostcardLandmark, PostcardNearbyRequest

router = APIRouter()

ATLAS_NEARBY_URL = "https://pikmin-atlas.com/api/postcards/nearby"
CACHE_TTL_SECONDS = 90
_nearby_cache: dict[str, tuple[float, list[PostcardLandmark]]] = {}


def _cache_key(req: PostcardNearbyRequest) -> str:
    # Quantize to reduce duplicate requests while panning slightly.
    lat = round(req.latitude, 4)
    lng = round(req.longitude, 4)
    radius = int(round(req.radius_m / 250) * 250)
    return f"{lat}:{lng}:{radius}:{req.limit}"


def _normalize_postcard(item: dict[str, Any]) -> PostcardLandmark | None:
    lat = item.get("latitude", item.get("lat"))
    lng = item.get("longitude", item.get("lng"))
    image_url = item.get("image_url") or item.get("imageUrl")
    guid = item.get("guid") or item.get("id")
    name = item.get("name") or "未命名明信片"
    if guid is None or lat is None or lng is None or not image_url:
        return None

    try:
        coordinate = GPSCoordinate(latitude=float(lat), longitude=float(lng))
    except Exception:
        return None

    tags = item.get("tags") or []
    if not isinstance(tags, list):
        tags = []

    return PostcardLandmark(
        id=str(guid),
        name=str(name),
        coordinate=coordinate,
        image_url=str(image_url),
        tags=[str(tag) for tag in tags],
        distance_m=item.get("distance_m"),
        holder_count=int(item.get("holder_count") or 0),
    )


def _fetch_nearby_from_atlas(req: PostcardNearbyRequest) -> list[PostcardLandmark]:
    payload = json.dumps(
        {
            "user_lat": req.latitude,
            "user_lng": req.longitude,
            "radius_m": req.radius_m,
            "limit": req.limit,
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        ATLAS_NEARBY_URL,
        data=payload,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "pikomin-local-dev/1.0",
        },
    )
    with urllib.request.urlopen(request, timeout=12) as response:
        data = json.loads(response.read().decode("utf-8"))

    if not isinstance(data, list):
        return []

    postcards: list[PostcardLandmark] = []
    seen: set[str] = set()
    for item in data:
        if not isinstance(item, dict):
            continue
        postcard = _normalize_postcard(item)
        if postcard is None or postcard.id in seen:
            continue
        seen.add(postcard.id)
        postcards.append(postcard)
    return postcards


@router.post("/nearby", response_model=list[PostcardLandmark])
async def get_nearby_postcards(req: PostcardNearbyRequest) -> list[PostcardLandmark]:
    key = _cache_key(req)
    cached = _nearby_cache.get(key)
    now = time.time()
    if cached and now - cached[0] < CACHE_TTL_SECONDS:
        return cached[1]

    try:
        postcards = await asyncio.to_thread(_fetch_nearby_from_atlas, req)
    except urllib.error.HTTPError as exc:
        raise HTTPException(
            status_code=502,
            detail={"error": f"Pikmin Atlas 回應錯誤：HTTP {exc.code}", "code": "POSTCARD_ATLAS_FAILED"},
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail={"error": "無法取得 Pikmin Atlas 明信片資料", "code": "POSTCARD_ATLAS_FAILED"},
        ) from exc

    _nearby_cache[key] = (now, postcards)
    return postcards
