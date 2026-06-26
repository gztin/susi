from __future__ import annotations

import json
from pathlib import Path
from typing import Literal

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from app.models.schemas import GPSCoordinate

router = APIRouter()

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
DATA_FILE = DATA_DIR / "landmarks.json"
LANDMARK_IMAGE_DIR = DATA_DIR / "landmark-images" / "mushrooms"
LANDMARK_IMAGE_INDEX = LANDMARK_IMAGE_DIR / "index.json"


class Landmark(BaseModel):
    id: str
    name: str = Field(..., min_length=1)
    coordinate: GPSCoordinate
    landmarkType: Literal["flower", "mushroom"] = "mushroom"
    imageUrl: str | None = None


class LandmarkCreateRequest(BaseModel):
    name: str = Field(..., min_length=1)
    coordinate: GPSCoordinate
    landmarkType: Literal["flower", "mushroom"] = "mushroom"
    imageUrl: str | None = None


class LandmarkUpdateRequest(BaseModel):
    name: str = Field(..., min_length=1)
    coordinate: GPSCoordinate
    landmarkType: Literal["flower", "mushroom"] = "mushroom"


def _read_mushroom_image_index() -> dict[str, str]:
    if not LANDMARK_IMAGE_INDEX.exists():
        return {}
    try:
        data = json.loads(LANDMARK_IMAGE_INDEX.read_text(encoding="utf-8"))
    except Exception:
        return {}
    if not isinstance(data, list):
        return {}

    index: dict[str, str] = {}
    for item in data:
        if not isinstance(item, dict) or not item.get("ok"):
            continue
        source_url = item.get("sourceUrl")
        filename = item.get("file")
        if not isinstance(source_url, str) or not isinstance(filename, str):
            continue
        image_path = LANDMARK_IMAGE_DIR / filename
        if image_path.exists() and image_path.is_file():
            index[source_url] = f"/api/landmarks/images/mushrooms/{filename}"
    return index


def _with_local_image_fallback(landmark: Landmark, image_index: dict[str, str]) -> Landmark:
    if not landmark.imageUrl:
        return landmark
    local_url = image_index.get(landmark.imageUrl)
    if local_url is None:
        return landmark
    return Landmark(
        id=landmark.id,
        name=landmark.name,
        coordinate=landmark.coordinate,
        landmarkType=landmark.landmarkType,
        imageUrl=local_url,
    )


def _read_landmarks(apply_image_fallback: bool = False) -> list[Landmark]:
    if not DATA_FILE.exists():
        return []
    raw = DATA_FILE.read_text(encoding="utf-8")
    if not raw.strip():
        return []
    data = json.loads(raw)
    if not isinstance(data, list):
        return []
    landmarks = [Landmark.model_validate(item) for item in data]
    if not apply_image_fallback:
        return landmarks
    image_index = _read_mushroom_image_index()
    return [_with_local_image_fallback(item, image_index) for item in landmarks]


def _write_landmarks(landmarks: list[Landmark]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    payload = [item.model_dump(exclude_none=True) for item in landmarks]
    DATA_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


@router.get("", response_model=list[Landmark])
async def list_landmarks() -> list[Landmark]:
    return _read_landmarks(apply_image_fallback=True)


@router.get("/images/mushrooms/{filename}")
async def get_mushroom_landmark_image(filename: str) -> FileResponse:
    image_path = (LANDMARK_IMAGE_DIR / filename).resolve()
    image_root = LANDMARK_IMAGE_DIR.resolve()
    if image_root not in image_path.parents or not image_path.is_file():
        raise HTTPException(status_code=404, detail={"error": "Image not found", "code": "IMAGE_NOT_FOUND"})
    return FileResponse(image_path)


@router.post("", response_model=Landmark)
async def create_landmark(req: LandmarkCreateRequest) -> Landmark:
    landmarks = _read_landmarks()
    new_id = f"{int(__import__('time').time() * 1000)}-{len(landmarks) + 1}"
    item = Landmark(
        id=new_id,
        name=req.name.strip(),
        coordinate=req.coordinate,
        landmarkType=req.landmarkType,
        imageUrl=req.imageUrl.strip() if req.imageUrl else None,
    )
    landmarks.insert(0, item)
    _write_landmarks(landmarks)
    return item


@router.put("/{landmark_id}", response_model=Landmark)
async def update_landmark(landmark_id: str, req: LandmarkUpdateRequest) -> Landmark:
    landmarks = _read_landmarks()
    for index, item in enumerate(landmarks):
        if item.id != landmark_id:
            continue
        updated = Landmark(
            id=item.id,
            name=req.name.strip(),
            coordinate=req.coordinate,
            landmarkType=req.landmarkType,
            imageUrl=item.imageUrl,
        )
        landmarks[index] = updated
        _write_landmarks(landmarks)
        return updated
    raise HTTPException(status_code=404, detail={"error": "Landmark not found", "code": "LANDMARK_NOT_FOUND"})


@router.delete("/{landmark_id}")
async def delete_landmark(landmark_id: str) -> dict:
    landmarks = _read_landmarks()
    next_items = [item for item in landmarks if item.id != landmark_id]
    _write_landmarks(next_items)
    return {"success": True}
