from contextlib import asynccontextmanager
import asyncio
import json
import logging
import os

logger = logging.getLogger(__name__)

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.routers import devices, location, route, status, rsd, geolocation
from app.services.device_manager import DeviceManager
from app.services.route_engine import RouteEngine
from app.services.ws_manager import WebSocketManager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 初始化單例
    device_manager = DeviceManager()
    route_engine = RouteEngine(device_manager)
    ws_manager = WebSocketManager()

    app.state.device_manager = device_manager
    app.state.route_engine = route_engine
    app.state.ws_manager = ws_manager

    # 從環境變數讀取 RSD tunnel 資訊（iOS 17+）
    rsd_address = os.environ.get("RSD_ADDRESS", "")
    rsd_port = int(os.environ.get("RSD_PORT", "0"))
    if rsd_address and rsd_port:
        pmd3 = "/Users/ggt/Library/Python/3.9/bin/pymobiledevice3"
        try:
            proc = await asyncio.create_subprocess_exec(
                pmd3, "usbmux", "list", "--usb",
                stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
            )
            stdout, _ = await proc.communicate()
            lines = stdout.decode().splitlines()
            json_start = next((i for i, l in enumerate(lines) if l.strip().startswith("[")), None)
            if json_start is not None:
                data = json.loads("\n".join(lines[json_start:]))
                for entry in data:
                    if entry.get("ConnectionType") == "USB":
                        device_manager.set_rsd_info(entry["Identifier"], rsd_address, rsd_port)
                        print(f"RSD 已設定裝置 {entry['Identifier']} → {rsd_address}:{rsd_port}")
        except Exception as e:
            print(f"RSD 自動設定失敗: {e}")

    # 啟動裝置輪詢背景任務
    polling_task = asyncio.create_task(device_manager.start_device_polling())

    yield

    # 清理
    polling_task.cancel()
    await route_engine.stop_route()


app = FastAPI(title="iOS GPS Simulator", version="0.1.0", lifespan=lifespan)

# CORS 設定：允許前端 origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 掛載 API 路由
app.include_router(devices.router, prefix="/api/devices", tags=["devices"])
app.include_router(location.router, prefix="/api/location", tags=["location"])
app.include_router(route.router, prefix="/api/route", tags=["route"])
app.include_router(status.router, prefix="/api/status", tags=["status"])
app.include_router(rsd.router, prefix="/api/rsd", tags=["rsd"])
app.include_router(geolocation.router, prefix="/api/geolocation", tags=["geolocation"])


@app.websocket("/ws/status")
async def websocket_status(websocket: WebSocket):
    ws_manager: WebSocketManager = websocket.app.state.ws_manager
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket)
