from __future__ import annotations

import sys
from pathlib import Path
from types import SimpleNamespace

import pytest

PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = PROJECT_ROOT / "backend"
for path in (BACKEND_ROOT, PROJECT_ROOT):
    if str(path) not in sys.path:
        sys.path.insert(0, str(path))

from app.models.schemas import DeviceInfo
from app.services import device_manager as device_manager_module
from app.services.device_manager import DeviceManager


class _FakeBridgeResponse:
    def __init__(self, payload: list[dict]) -> None:
        self._payload = payload

    def raise_for_status(self) -> None:
        return None

    def json(self) -> list[dict]:
        return self._payload


class _FakeAsyncClient:
    def __init__(self, *args, **kwargs) -> None:
        return None

    async def __aenter__(self) -> _FakeAsyncClient:
        return self

    async def __aexit__(self, *args) -> None:
        return None

    async def get(self, url: str) -> _FakeBridgeResponse:
        assert url == "http://bridge/usb-devices"
        return _FakeBridgeResponse([
            {
                "id": "usb-device-001",
                "name": "USB iPhone",
                "is_connected": True,
                "model": "iPhone15,3",
            }
        ])


@pytest.mark.asyncio
async def test_host_bridge_devices_include_tunneld_registry(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(device_manager_module, "HOST_BRIDGE_URL", "http://bridge")
    monkeypatch.setattr(device_manager_module.httpx, "AsyncClient", _FakeAsyncClient)

    manager = DeviceManager(mock_mode=False)
    manager.ensure_device("wifi-device-001", name="Wi-Fi iPhone", model="iPhone16,2")

    devices = await manager.list_devices()

    assert [device.id for device in devices] == ["usb-device-001", "wifi-device-001"]
    assert devices[1] == DeviceInfo(
        id="wifi-device-001",
        name="Wi-Fi iPhone",
        is_connected=True,
        model="iPhone16,2",
    )


def test_host_bridge_usb_devices_parse_warning_prefixed_json(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    from scripts import host_location_bridge

    output = """
urllib3 v2 warning that is not JSON
[
  {
    "Identifier": "usb-device-001",
    "DeviceName": "USB iPhone",
    "ConnectionType": "USB",
    "ProductType": "iPhone15,3"
  }
]
"""
    monkeypatch.setattr(host_location_bridge, "LOG_PATH", str(tmp_path / "bridge.log"))
    monkeypatch.setattr(
        host_location_bridge.subprocess,
        "run",
        lambda *args, **kwargs: SimpleNamespace(returncode=0, stdout=output, stderr=""),
    )

    devices = host_location_bridge.list_usb_devices()

    assert len(devices) == 1
    assert devices[0].id == "usb-device-001"
    assert devices[0].name == "USB iPhone"
