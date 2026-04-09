from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field


class GPSCoordinate(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class DeviceInfo(BaseModel):
    id: str
    name: str
    is_connected: bool
    model: str | None = None


class SetLocationRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    device_id: str


class RouteRequest(BaseModel):
    device_id: str
    waypoints: list[GPSCoordinate] = Field(..., min_length=2)
    speed: float = Field(..., ge=1.0, le=10.0)  # m/s
    loop: bool = False


class SimulationState(str, Enum):
    IDLE = "idle"
    MOVING = "moving"
    PAUSED = "paused"


class RouteStatus(BaseModel):
    state: SimulationState
    current_position: GPSCoordinate | None = None
    progress: float = 0.0  # 0.0 ~ 1.0
    device_id: str | None = None


class StatusUpdate(BaseModel):
    """WebSocket 推送訊息"""
    type: str  # "position" | "status" | "device"
    data: dict


class ErrorResponse(BaseModel):
    error: str
    code: str  # "DEVICE_NOT_FOUND" | "LOCATION_SET_FAILED" | "INVALID_COORDINATE" 等
