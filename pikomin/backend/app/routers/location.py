from fastapi import APIRouter, Depends, HTTPException

from pydantic import BaseModel
from app.dependencies import get_device_manager
from app.models.schemas import SetLocationRequest, GPSCoordinate, ErrorResponse
from app.services.device_manager import DeviceManager, DeviceNotFoundError, LocationSetError

router = APIRouter()


@router.post("", responses={
    404: {"model": ErrorResponse},
    400: {"model": ErrorResponse},
})
async def set_location(
    request: SetLocationRequest,
    device_manager: DeviceManager = Depends(get_device_manager),
) -> dict:
    """設定裝置 GPS 位置。"""
    coordinate = GPSCoordinate(latitude=request.latitude, longitude=request.longitude)
    try:
        await device_manager.set_location(request.device_id, coordinate)
    except DeviceNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=ErrorResponse(error=str(exc), code="DEVICE_NOT_FOUND").model_dump(),
        ) from exc
    except LocationSetError as exc:
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(error=str(exc), code="LOCATION_SET_FAILED").model_dump(),
        ) from exc
    return {"success": True}


class ResetRequest(BaseModel):
    device_id: str


@router.post("/reset", responses={404: {"model": ErrorResponse}, 400: {"model": ErrorResponse}})
async def reset_location(
    request: ResetRequest,
    device_manager: DeviceManager = Depends(get_device_manager),
) -> dict:
    """停止 GPS 模擬，恢復真實位置。"""
    try:
        await device_manager.stop_simulation(request.device_id)
    except DeviceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=ErrorResponse(error=str(exc), code="DEVICE_NOT_FOUND").model_dump()) from exc
    except LocationSetError as exc:
        raise HTTPException(status_code=400, detail=ErrorResponse(error=str(exc), code="LOCATION_SET_FAILED").model_dump()) from exc
    return {"success": True}
