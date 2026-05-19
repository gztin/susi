#!/usr/bin/env python3
from __future__ import annotations

import os
import subprocess
import urllib.request
import json
from datetime import datetime
from threading import Lock

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

PMD3 = os.environ.get("PMD3_PATH", "pymobiledevice3")
DEFAULT_RSD_HOST = os.environ.get("RSD_HOST", "127.0.0.1")
TUNNELD_URL = os.environ.get("TUNNELD_URL", "http://127.0.0.1:49151")
LOG_PATH = os.environ.get("HOST_BRIDGE_LOG_PATH", "/tmp/host_location_bridge.log")

app = FastAPI(title="Host Location Bridge", version="0.1.0")
_device_locks: dict[str, Lock] = {}


class SetLocationReq(BaseModel):
    device_id: str
    latitude: float
    longitude: float


class ClearLocationReq(BaseModel):
    device_id: str


def _run(cmd: list[str], timeout_sec: int = 30) -> None:
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(f"\n[{datetime.now().isoformat()}] RUN {' '.join(cmd)} timeout={timeout_sec}\n")
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout_sec)
    except subprocess.TimeoutExpired as exc:
        with open(LOG_PATH, "a", encoding="utf-8") as f:
            f.write(f"[{datetime.now().isoformat()}] TIMEOUT after {timeout_sec}s\n")
        raise HTTPException(status_code=504, detail=f"[cmd={' '.join(cmd)}] timeout after {timeout_sec}s") from exc
    if proc.returncode != 0:
        detail = (proc.stderr or proc.stdout or "command failed").strip()
        with open(LOG_PATH, "a", encoding="utf-8") as f:
            f.write(f"[{datetime.now().isoformat()}] FAIL code={proc.returncode}\nSTDERR:\n{proc.stderr}\nSTDOUT:\n{proc.stdout}\n")
        raise HTTPException(status_code=400, detail=f"[cmd={' '.join(cmd)}] {detail}")
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(f"[{datetime.now().isoformat()}] OK\n")


def _resolve_rsd(device_id: str) -> tuple[str, int]:
    try:
        with urllib.request.urlopen(TUNNELD_URL, timeout=3) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"讀取 tunneld 失敗: {exc}") from exc

    details = payload.get(device_id) or []
    if not details:
        raise HTTPException(status_code=404, detail=f"找不到裝置 tunnel: {device_id}")

    info = details[0]
    address = info.get("tunnel-address")
    port = info.get("tunnel-port")
    if not address or not port:
        raise HTTPException(status_code=500, detail=f"tunnel 資訊不完整: {device_id}")
    return str(address), int(port)


def _get_device_lock(device_id: str) -> Lock:
    lock = _device_locks.get(device_id)
    if lock is None:
        lock = Lock()
        _device_locks[device_id] = lock
    return lock


@app.post("/set-location")
def set_location(req: SetLocationReq) -> dict:
    address, port = _resolve_rsd(req.device_id)
    clear_cmd = [PMD3, "developer", "dvt", "simulate-location", "clear", "--rsd", address, str(port)]
    cmd = [
        PMD3, "developer", "dvt", "simulate-location", "set",
        "--rsd", address, str(port),
        "--",
        str(req.latitude), str(req.longitude),
    ]
    lock = _get_device_lock(req.device_id)
    with lock:
        try:
            _run(clear_cmd, timeout_sec=12)
            _run(cmd, timeout_sec=25)
        except HTTPException as exc:
            # 常見是前一次 set 卡住，先 clear 後重試一次
            try:
                _run(clear_cmd, timeout_sec=15)
                _run(cmd, timeout_sec=25)
            except HTTPException:
                raise exc
    return {"success": True}


@app.post("/clear-location")
def clear_location(req: ClearLocationReq) -> dict:
    address, port = _resolve_rsd(req.device_id)
    cmd = [PMD3, "developer", "dvt", "simulate-location", "clear", "--rsd", address, str(port)]
    lock = _get_device_lock(req.device_id)
    with lock:
        _run(cmd, timeout_sec=20)
    return {"success": True}
