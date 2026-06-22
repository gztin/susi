from __future__ import annotations

import json
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Literal
from zoneinfo import ZoneInfo

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.models.schemas import GPSCoordinate

router = APIRouter()

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
DATA_FILE = DATA_DIR / "mushrooms.json"
TAIWAN_TZ = ZoneInfo("Asia/Taipei")
MAX_REMAINING_MINUTES = 40 * 24 * 60

MushroomType = Literal["giant", "element"]
ElementType = Literal["water", "fire", "electric", "poison", "crystal"]


class SavedMushroom(BaseModel):
    id: str
    name: str = Field(..., min_length=1)
    coordinate: GPSCoordinate
    mushroomType: MushroomType
    elementType: ElementType | None = None
    remainingSlots: int | None = Field(default=None, ge=0, le=5)
    expiresAt: str
    createdAt: str
    updatedAt: str


class MushroomCreateRequest(BaseModel):
    name: str = Field(..., min_length=1)
    coordinate: GPSCoordinate
    mushroomType: MushroomType
    elementType: ElementType | None = None
    remainingSlots: int | None = Field(default=None, ge=0, le=5)
    remainingMinutes: int | None = Field(default=None, ge=1, le=MAX_REMAINING_MINUTES)


def _now() -> datetime:
    return datetime.now(TAIWAN_TZ).replace(microsecond=0)


def _now_text() -> str:
    return _now().isoformat()


def _default_expiry() -> datetime:
    now = _now()
    tomorrow = (now + timedelta(days=1)).date()
    return datetime.combine(tomorrow, datetime.min.time(), tzinfo=TAIWAN_TZ).replace(hour=2)


def _expiry_from_request(req: MushroomCreateRequest) -> str:
    if req.remainingMinutes is not None:
        return (_now() + timedelta(minutes=req.remainingMinutes)).isoformat()
    return _default_expiry().isoformat()


def _clean_name(name: str) -> str:
    cleaned = name.strip()
    if not cleaned:
        raise HTTPException(status_code=400, detail={"error": "Mushroom name is required", "code": "MUSHROOM_NAME_REQUIRED"})
    return cleaned


def _validate_kind(req: MushroomCreateRequest) -> None:
    if req.mushroomType == "element" and req.elementType is None:
        raise HTTPException(status_code=400, detail={"error": "Element mushroom requires elementType", "code": "ELEMENT_TYPE_REQUIRED"})
    if req.mushroomType == "giant" and req.elementType is not None:
        raise HTTPException(status_code=400, detail={"error": "Giant mushroom cannot have elementType", "code": "GIANT_ELEMENT_NOT_ALLOWED"})


def _read_mushrooms() -> list[SavedMushroom]:
    if not DATA_FILE.exists():
        return []
    raw = DATA_FILE.read_text(encoding="utf-8")
    if not raw.strip():
        return []
    data = json.loads(raw)
    if not isinstance(data, list):
        return []
    mushrooms = [SavedMushroom.model_validate(item) for item in data]
    active = [item for item in mushrooms if _parse_expiry(item.expiresAt) > _now()]
    if len(active) != len(mushrooms):
        _write_mushrooms(active)
    return active


def _parse_expiry(value: str) -> datetime:
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError:
        return _now()
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=TAIWAN_TZ)
    return parsed.astimezone(TAIWAN_TZ)


def _write_mushrooms(mushrooms: list[SavedMushroom]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    payload = [item.model_dump(exclude_none=True) for item in mushrooms]
    DATA_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


@router.get("", response_model=list[SavedMushroom])
async def list_mushrooms() -> list[SavedMushroom]:
    return _read_mushrooms()


@router.post("", response_model=SavedMushroom)
async def create_mushroom(req: MushroomCreateRequest) -> SavedMushroom:
    _validate_kind(req)
    mushrooms = _read_mushrooms()
    timestamp = _now_text()
    item = SavedMushroom(
        id=f"{int(time.time() * 1000)}-{len(mushrooms) + 1}",
        name=_clean_name(req.name),
        coordinate=req.coordinate,
        mushroomType=req.mushroomType,
        elementType=req.elementType,
        remainingSlots=req.remainingSlots,
        expiresAt=_expiry_from_request(req),
        createdAt=timestamp,
        updatedAt=timestamp,
    )
    mushrooms.insert(0, item)
    _write_mushrooms(mushrooms)
    return item


@router.put("/{mushroom_id}", response_model=SavedMushroom)
async def update_mushroom(mushroom_id: str, req: MushroomCreateRequest) -> SavedMushroom:
    _validate_kind(req)
    mushrooms = _read_mushrooms()
    for index, item in enumerate(mushrooms):
        if item.id != mushroom_id:
            continue
        updated = SavedMushroom(
            id=item.id,
            name=_clean_name(req.name),
            coordinate=req.coordinate,
            mushroomType=req.mushroomType,
            elementType=req.elementType,
            remainingSlots=req.remainingSlots,
            expiresAt=_expiry_from_request(req),
            createdAt=item.createdAt,
            updatedAt=_now_text(),
        )
        mushrooms[index] = updated
        _write_mushrooms(mushrooms)
        return updated
    raise HTTPException(status_code=404, detail={"error": "Mushroom not found", "code": "MUSHROOM_NOT_FOUND"})


@router.delete("/{mushroom_id}")
async def delete_mushroom(mushroom_id: str) -> dict:
    mushrooms = _read_mushrooms()
    next_items = [item for item in mushrooms if item.id != mushroom_id]
    _write_mushrooms(next_items)
    return {"success": True}
