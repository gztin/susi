from fastapi import APIRouter, Depends

from app.dependencies import get_device_manager
from app.models.schemas import DeviceInfo
from app.services.device_manager import DeviceManager

router = APIRouter()


@router.get("", response_model=list[DeviceInfo])
async def list_devices(
    device_manager: DeviceManager = Depends(get_device_manager),
) -> list[DeviceInfo]:
    """取得已連線裝置清單。"""
    return await device_manager.list_devices()
