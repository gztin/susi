from fastapi import APIRouter, Request
import urllib.request
import json

router = APIRouter()

@router.get("")
async def get_geolocation(request: Request) -> dict:
    """用 IP 估算目前位置（不精確，誤差可能數公里）。"""
    try:
        with urllib.request.urlopen("http://ip-api.com/json/?fields=lat,lon,city", timeout=5) as resp:
            data = json.loads(resp.read())
            return {"latitude": data["lat"], "longitude": data["lon"], "city": data.get("city", "")}
    except Exception:
        # 備用：台北市中心
        return {"latitude": 25.0330, "longitude": 121.5654, "city": "台北（預設）"}
