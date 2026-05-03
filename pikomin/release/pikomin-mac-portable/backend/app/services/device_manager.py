"""
DeviceManager：封裝 pymobiledevice3 操作，管理 iOS 裝置連線與 GPS 指令傳送。

iOS 17+ (含 iOS 26) 需透過 RSD tunnel 方式操作，無法在 Docker 容器內運作。
請先在主機執行：sudo pymobiledevice3 lockdown start-tunnel
取得 RSD address/port 後，透過 set_rsd_info() 設定。
"""
from __future__ import annotations

import asyncio
import logging
import os
from typing import Callable, Awaitable

from app.models.schemas import DeviceInfo, GPSCoordinate

PMD3 = "/Users/ggt/Library/Python/3.9/bin/pymobiledevice3"
logger = logging.getLogger(__name__)

# ── 自訂例外 ──────────────────────────────────────────────────────────────────

class DeviceNotFoundError(Exception):
    """指定的 device_id 不存在於已連線裝置清單中。"""

    def __init__(self, device_id: str) -> None:
        self.device_id = device_id
        super().__init__(f"Device not found: {device_id}")


class LocationSetError(Exception):
    """pymobiledevice3 設定 GPS 位置失敗。"""

    def __init__(self, device_id: str, reason: str = "") -> None:
        self.device_id = device_id
        self.reason = reason
        super().__init__(f"Failed to set location on {device_id}: {reason}")


# ── Mock 裝置常數 ─────────────────────────────────────────────────────────────

_MOCK_DEVICE = DeviceInfo(
    id="mock-device-001",
    name="Mock iPhone",
    is_connected=True,
    model="iPhone (Mock)",
)


# ── DeviceManager ─────────────────────────────────────────────────────────────

class DeviceManager:
    """管理 iOS 裝置連線狀態與 GPS 模擬指令。

    Args:
        mock_mode: 若為 True，不呼叫 pymobiledevice3，以假裝置回應所有操作。
                   預設從環境變數 ``MOCK_MODE`` 讀取（值為 ``"true"`` 時啟用）。
    """

    def __init__(self, mock_mode: bool | None = None) -> None:
        if mock_mode is None:
            mock_mode = os.environ.get("MOCK_MODE", "").lower() == "true"
        self.mock_mode: bool = mock_mode

        # device_id -> DeviceInfo
        self._registry: dict[str, DeviceInfo] = {}

        # device_id -> (rsd_address, rsd_port)
        self._rsd_info: dict[str, tuple[str, int]] = {}

        # device_id -> 正在執行的 simulate-location 程序
        self._location_procs: dict[str, asyncio.subprocess.Process] = {}

        # tunneld 自動加入的裝置 ID（WiFi 裝置，非 USB 掃描）
        self._tunneld_device_ids: set[str] = set()

        # 事件回呼（可由外部設定）
        self.on_device_connected: Callable[[DeviceInfo], Awaitable[None]] | None = None
        self.on_device_disconnected: Callable[[DeviceInfo], Awaitable[None]] | None = None

        if self.mock_mode:
            logger.warning("DeviceManager 以 mock mode 啟動，不會存取實體 USB 裝置。")
            self._registry[_MOCK_DEVICE.id] = _MOCK_DEVICE

    # ── 公開介面 ──────────────────────────────────────────────────────────────

    async def list_devices(self) -> list[DeviceInfo]:
        """回傳目前已連線的裝置清單。

        Mock mode 下固定回傳 mock-device-001。
        """
        if self.mock_mode:
            return [_MOCK_DEVICE]
        return list(self._registry.values())

    async def set_location(
        self,
        device_id: str,
        coordinate: GPSCoordinate,
    ) -> None:
        """設定指定裝置的模擬 GPS 位置。

        Args:
            device_id: 目標裝置 ID。
            coordinate: 目標 GPS 座標。

        Raises:
            DeviceNotFoundError: 裝置不存在。
            LocationSetError: pymobiledevice3 呼叫失敗（非 mock mode）。
        """
        device = self.get_device(device_id)
        if device is None:
            raise DeviceNotFoundError(device_id)

        if self.mock_mode:
            logger.info(
                "[mock] set_location device=%s lat=%.6f lng=%.6f",
                device_id,
                coordinate.latitude,
                coordinate.longitude,
            )
            return

        await self._pymobiledevice_set_location(device_id, coordinate)

    async def stop_simulation(self, device_id: str) -> None:
        """停止指定裝置的 GPS 模擬，恢復真實位置。

        Args:
            device_id: 目標裝置 ID。

        Raises:
            DeviceNotFoundError: 裝置不存在。
        """
        device = self.get_device(device_id)
        if device is None:
            raise DeviceNotFoundError(device_id)

        if self.mock_mode:
            logger.info("[mock] stop_simulation device=%s", device_id)
            return

        await self._pymobiledevice_stop_simulation(device_id)

    def get_device(self, device_id: str) -> DeviceInfo | None:
        """取得單一裝置資訊，不存在回傳 None。"""
        if self.mock_mode:
            return _MOCK_DEVICE if device_id == _MOCK_DEVICE.id else None
        return self._registry.get(device_id)

    def set_rsd_info(self, device_id: str, address: str, port: int) -> None:
        """設定裝置的 RSD tunnel 資訊（iOS 17+ 必須）。

        在主機執行 ``sudo pymobiledevice3 lockdown start-tunnel`` 後，
        將取得的 address 與 port 透過此方法傳入。

        Args:
            device_id: 目標裝置 ID。
            address: RSD tunnel 的 IPv6/IPv4 位址。
            port: RSD tunnel 的 port 號。
        """
        self._rsd_info[device_id] = (address, port)
        logger.info("RSD info 已設定 device=%s addr=%s port=%d", device_id, address, port)

    def ensure_device(self, device_id: str) -> None:
        """確保裝置存在於 registry（供 tunneld WiFi 裝置使用）。

        若裝置已在 registry 則不做任何事；
        若不存在則建立一筆記錄，並嘗試透過 pymobiledevice3 查詢真實裝置名稱。
        """
        if self.mock_mode:
            return
        if device_id not in self._registry:
            device = DeviceInfo(
                id=device_id,
                name=device_id,  # 先用 UDID，背景任務會更新為真實名稱
                is_connected=True,
                model=None,
            )
            self._registry[device_id] = device
            self._tunneld_device_ids.add(device_id)
            logger.info("tunneld 裝置加入 registry: %s", device_id)
            if self.on_device_connected is not None:
                asyncio.ensure_future(self.on_device_connected(device))
            # 背景查詢真實裝置名稱
            asyncio.ensure_future(self._fetch_device_name(device_id))

    async def _fetch_device_name(self, device_id: str) -> None:
        """背景查詢裝置真實名稱，更新 registry。"""
        import json as _json
        try:
            proc = await asyncio.create_subprocess_exec(
                PMD3, "usbmux", "list",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, _ = await proc.communicate()
            raw = stdout.decode().strip()
            lines = raw.splitlines()
            json_start = next((i for i, l in enumerate(lines) if l.strip().startswith("[")), None)
            if json_start is None:
                return
            data = _json.loads("\n".join(lines[json_start:]))
            for entry in data:
                if entry.get("Identifier") == device_id:
                    name = entry.get("DeviceName", device_id)
                    model = entry.get("ProductType")
                    if device_id in self._registry:
                        self._registry[device_id] = DeviceInfo(
                            id=device_id,
                            name=name,
                            is_connected=True,
                            model=model,
                        )
                        logger.info("裝置名稱已更新: %s → %s", device_id, name)
                    return
        except Exception as exc:  # noqa: BLE001
            logger.debug("查詢裝置名稱失敗 %s: %s", device_id, exc)

    def remove_tunneld_device(self, device_id: str) -> None:
        """移除由 tunneld 管理、且 tunnel 已消失的裝置。

        只移除透過 ensure_device 加入的裝置，不影響 USB 掃描到的裝置。
        """
        if device_id not in self._tunneld_device_ids:
            return
        self._tunneld_device_ids.discard(device_id)
        device = self._registry.pop(device_id, None)
        if device is not None:
            logger.info("tunneld 裝置移出 registry: %s", device_id)
            disconnected = DeviceInfo(
                id=device.id, name=device.name,
                is_connected=False, model=device.model,
            )
            if self.on_device_disconnected is not None:
                asyncio.ensure_future(self.on_device_disconnected(disconnected))

    # ── 背景輪詢 ──────────────────────────────────────────────────────────────

    async def start_device_polling(self) -> None:
        """背景任務：每 5 秒掃描一次 USB 裝置，更新內部裝置清單。

        Mock mode 下不掃描 USB，直接維持假裝置。
        """
        if self.mock_mode:
            logger.info("[mock] start_device_polling：維持假裝置，不掃描 USB。")
            # mock mode 不需要輪詢，直接 idle
            while True:
                await asyncio.sleep(5)

        while True:
            try:
                connected = await self._scan_usb_devices()
                self._update_device_registry(connected)
            except Exception as exc:  # noqa: BLE001
                logger.warning("裝置掃描失敗: %s", exc)
            await asyncio.sleep(5)

    # ── 內部方法 ──────────────────────────────────────────────────────────────

    def _update_device_registry(self, connected: list[DeviceInfo]) -> None:
        """比對新舊裝置清單，觸發連線/斷線事件。

        Args:
            connected: 最新掃描到的裝置清單。
        """
        connected_ids = {d.id for d in connected}
        existing_ids = set(self._registry.keys())

        # 新增裝置
        for device in connected:
            if device.id not in existing_ids:
                self._registry[device.id] = device
                logger.info("裝置連線: %s (%s)", device.id, device.name)
                if self.on_device_connected is not None:
                    asyncio.ensure_future(self.on_device_connected(device))

        # 消失裝置
        for device_id in existing_ids - connected_ids:
            device = self._registry.pop(device_id)
            device = DeviceInfo(
                id=device.id,
                name=device.name,
                is_connected=False,
                model=device.model,
            )
            logger.info("裝置斷線: %s (%s)", device.id, device.name)
            if self.on_device_disconnected is not None:
                asyncio.ensure_future(self.on_device_disconnected(device))

    async def _scan_usb_devices(self) -> list[DeviceInfo]:
        """呼叫 pymobiledevice3 CLI 掃描 USB 裝置，回傳裝置清單。"""
        import json
        import sys
        pmd3 = "/Users/ggt/Library/Python/3.9/bin/pymobiledevice3"
        try:
            proc = await asyncio.create_subprocess_exec(
                pmd3, "usbmux", "list", "--usb",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, _ = await proc.communicate()
            raw = stdout.decode().strip()
            # 去掉 urllib3 warning 行，只取 JSON 部分
            lines = raw.splitlines()
            json_start = next((i for i, l in enumerate(lines) if l.strip().startswith("[")), None)
            if json_start is None:
                return []
            data = json.loads("\n".join(lines[json_start:]))
            devices: list[DeviceInfo] = []
            for entry in data:
                if entry.get("ConnectionType") != "USB":
                    continue
                devices.append(DeviceInfo(
                    id=entry["Identifier"],
                    name=entry.get("DeviceName", entry["Identifier"]),
                    is_connected=True,
                    model=entry.get("ProductType"),
                ))
            return devices
        except Exception as exc:  # noqa: BLE001
            logger.warning("USB 掃描失敗: %s", exc)
            return []

    async def _pymobiledevice_set_location(
        self,
        device_id: str,
        coordinate: GPSCoordinate,
    ) -> None:
        """透過 RSD tunnel 呼叫 pymobiledevice3 CLI 設定 GPS 位置（iOS 17+）。"""
        rsd = self._rsd_info.get(device_id)
        if not rsd:
            raise LocationSetError(
                device_id,
                "RSD tunnel not available. "
                "請先執行 'sudo pymobiledevice3 lockdown start-tunnel' "
                "並呼叫 set_rsd_info() 設定 address/port。",
            )
        addr, port = rsd

        # 先終止舊的 simulate-location 程序
        if device_id in self._location_procs:
            old_proc = self._location_procs.pop(device_id)
            try:
                old_proc.terminate()
            except Exception:
                pass

        cmd = [
            PMD3, "developer", "dvt", "simulate-location", "set",
            "--rsd", addr, str(port), "--",
            str(coordinate.latitude), str(coordinate.longitude),
        ]
        logger.debug("執行指令: %s", " ".join(cmd))
        try:
            # 背景執行，不等待結束
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.DEVNULL,
                stderr=asyncio.subprocess.DEVNULL,
            )
            self._location_procs[device_id] = proc
        except Exception as exc:
            raise LocationSetError(device_id, str(exc)) from exc

    async def _pymobiledevice_stop_simulation(self, device_id: str) -> None:
        """透過 RSD tunnel 呼叫 pymobiledevice3 CLI 停止 GPS 模擬（iOS 17+）。"""
        rsd = self._rsd_info.get(device_id)
        if not rsd:
            raise LocationSetError(
                device_id,
                "RSD tunnel not available. "
                "請先執行 'sudo pymobiledevice3 lockdown start-tunnel' "
                "並呼叫 set_rsd_info() 設定 address/port。",
            )
        addr, port = rsd

        # 先終止正在執行的 simulate-location 程序
        if device_id in self._location_procs:
            old_proc = self._location_procs.pop(device_id)
            try:
                old_proc.terminate()
            except Exception:
                pass

        cmd = [
            PMD3, "developer", "dvt", "simulate-location", "clear",
            "--rsd", addr, str(port),
        ]
        try:
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.DEVNULL,
                stderr=asyncio.subprocess.DEVNULL,
            )
            # clear 指令會持續執行，不等待結束
            self._location_procs[device_id] = proc
        except Exception as exc:
            raise LocationSetError(device_id, str(exc)) from exc
