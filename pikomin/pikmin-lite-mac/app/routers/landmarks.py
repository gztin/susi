from __future__ import annotations

import json
from pathlib import Path
from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.models.schemas import GPSCoordinate

router = APIRouter()

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
DATA_FILE = DATA_DIR / "landmarks.json"
TAIWAN_TZ = ZoneInfo("Asia/Taipei")
LandmarkType = Literal["flower", "mushroom", "giant_mushroom", "element_mushroom"]
ElementType = Literal["water", "fire", "electric", "crystal", "poison"]


class Landmark(BaseModel):
    id: str
    name: str = Field(..., min_length=1)
    coordinate: GPSCoordinate
    landmarkType: LandmarkType = "mushroom"
    elementType: ElementType | None = None
    participantCount: int | None = Field(default=None, ge=1, le=5)
    expiresAt: str | None = None
    imageUrl: str | None = None


class LandmarkCreateRequest(BaseModel):
    name: str = Field(..., min_length=1)
    coordinate: GPSCoordinate
    landmarkType: LandmarkType = "mushroom"
    elementType: ElementType | None = None
    participantCount: int | None = Field(default=None, ge=1, le=5)
    expiresAt: str | None = None
    imageUrl: str | None = None


class LandmarkUpdateRequest(BaseModel):
    name: str = Field(..., min_length=1)
    coordinate: GPSCoordinate
    landmarkType: LandmarkType = "mushroom"
    elementType: ElementType | None = None
    participantCount: int | None = Field(default=None, ge=1, le=5)
    expiresAt: str | None = None
    imageUrl: str | None = None


def _parse_expires_at(expires_at: str) -> datetime:
    try:
        return datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail={"error": "Invalid expiresAt", "code": "INVALID_EXPIRES_AT"}) from exc


def _next_taiwan_2am(now: datetime | None = None) -> str:
    base = now.astimezone(TAIWAN_TZ) if now else datetime.now(TAIWAN_TZ)
    deadline = datetime.combine(base.date(), time(hour=2), tzinfo=TAIWAN_TZ)
    if base >= deadline:
        deadline += timedelta(days=1)
    return deadline.isoformat()


def _normalize_landmark_fields(
    landmark_type: str,
    element_type: str | None,
    participant_count: int | None,
    expires_at: str | None,
) -> tuple[str | None, int | None, str | None]:
    if landmark_type == "giant_mushroom":
        if expires_at:
            _parse_expires_at(expires_at)
        return None, participant_count or 1, expires_at
    if landmark_type == "element_mushroom":
        if expires_at:
            _parse_expires_at(expires_at)
        return element_type or "water", None, expires_at or _next_taiwan_2am()
    return None, None, None


def _normalize_image_url(image_url: str | None) -> str | None:
    if not image_url:
        return "none"
    normalized = image_url.strip()
    if normalized.startswith("https://images.pikoohiong.com/uploads/") and "?" not in normalized:
        return "none"
    return normalized or "none"


def _is_expired_element_mushroom(landmark: Landmark) -> bool:
    if landmark.landmarkType != "element_mushroom" or not landmark.expiresAt:
        return False
    expires_at = _parse_expires_at(landmark.expiresAt)
    return expires_at <= datetime.now(expires_at.tzinfo or TAIWAN_TZ)


def _read_landmarks() -> list[Landmark]:
    if not DATA_FILE.exists():
        return []
    raw = DATA_FILE.read_text(encoding="utf-8")
    if not raw.strip():
        return []
    data = json.loads(raw)
    if not isinstance(data, list):
        return []
    return [Landmark.model_validate(item) for item in data]


def _write_landmarks(landmarks: list[Landmark]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    payload = [item.model_dump() for item in landmarks]
    DATA_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def _prune_expired_element_mushrooms(landmarks: list[Landmark]) -> list[Landmark]:
    next_items = [item for item in landmarks if not _is_expired_element_mushroom(item)]
    if len(next_items) != len(landmarks):
        _write_landmarks(next_items)
    return next_items


@router.get("", response_model=list[Landmark])
async def list_landmarks() -> list[Landmark]:
    return _prune_expired_element_mushrooms(_read_landmarks())


@router.post("", response_model=Landmark)
async def create_landmark(req: LandmarkCreateRequest) -> Landmark:
    landmarks = _read_landmarks()
    new_id = f"{int(__import__('time').time() * 1000)}-{len(landmarks) + 1}"
    element_type, participant_count, expires_at = _normalize_landmark_fields(
        req.landmarkType,
        req.elementType,
        req.participantCount,
        req.expiresAt,
    )
    item = Landmark(
        id=new_id,
        name=req.name.strip(),
        coordinate=req.coordinate,
        landmarkType=req.landmarkType,
        elementType=element_type,
        participantCount=participant_count,
        expiresAt=expires_at,
        imageUrl=_normalize_image_url(req.imageUrl),
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
        element_type, participant_count, expires_at = _normalize_landmark_fields(
            req.landmarkType,
            req.elementType,
            req.participantCount,
            req.expiresAt,
        )
        updated = Landmark(
            id=item.id,
            name=req.name.strip(),
            coordinate=req.coordinate,
            landmarkType=req.landmarkType,
            elementType=element_type,
            participantCount=participant_count,
            expiresAt=expires_at,
            imageUrl=_normalize_image_url(req.imageUrl),
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
