import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { GPSCoordinate } from '../types'

// 修正 Vite 環境下 Leaflet 預設 icon 路徑問題
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface MapInterfaceProps {
  mode: 'single' | 'route'
  currentPosition: GPSCoordinate | null
  waypoints: GPSCoordinate[]
  onMapClick: (coord: GPSCoordinate) => void
}

export default function MapInterface({
  mode,
  currentPosition,
  waypoints,
  onMapClick,
}: MapInterfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const currentMarkerRef = useRef<L.CircleMarker | null>(null)
  const waypointMarkersRef = useRef<L.Marker[]>([])
  const polylineRef = useRef<L.Polyline | null>(null)
  const prevPositionRef = useRef<GPSCoordinate | null>(null)

  // 初始化地圖
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      doubleClickZoom: false,
    }).setView([23.5, 121.0], 8)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick({ latitude: e.latlng.lat, longitude: e.latlng.lng })
    })

    mapRef.current = map

    // 嘗試用瀏覽器定位移到使用者位置
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.setView([pos.coords.latitude, pos.coords.longitude], 15)
        },
        () => { /* 拒絕授權時維持預設位置 */ }
      )
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 更新 click handler（避免 stale closure）
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const handler = (e: L.LeafletMouseEvent) => {
      onMapClick({ latitude: e.latlng.lat, longitude: e.latlng.lng })
    }

    map.off('click')
    map.on('click', handler)
  }, [onMapClick])

  // 更新目前位置標記（藍色圓形），首次設定時自動置中
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (currentMarkerRef.current) {
      currentMarkerRef.current.remove()
      currentMarkerRef.current = null
    }

    if (currentPosition) {
      currentMarkerRef.current = L.circleMarker(
        [currentPosition.latitude, currentPosition.longitude],
        { radius: 10, color: '#1d4ed8', fillColor: '#3b82f6', fillOpacity: 0.9, weight: 2 }
      ).addTo(map)

      // 首次設定位置（prevPosition 為 null）時，自動把地圖移到該位置並置中
      if (!prevPositionRef.current) {
        map.setView([currentPosition.latitude, currentPosition.longitude], 16, { animate: true })
      }
      prevPositionRef.current = currentPosition
    } else {
      prevPositionRef.current = null
    }
  }, [currentPosition])

  // 更新路徑點標記（橘色數字）與連線
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // 清除舊標記
    waypointMarkersRef.current.forEach((m) => m.remove())
    waypointMarkersRef.current = []

    // 清除舊連線
    if (polylineRef.current) {
      polylineRef.current.remove()
      polylineRef.current = null
    }

    // 建立橘色數字標記
    waypoints.forEach((wp, index) => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          background: #f97316;
          color: white;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: bold;
          border: 2px solid #ea580c;
          box-shadow: 0 1px 4px rgba(0,0,0,0.4);
        ">${index + 1}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })

      const marker = L.marker([wp.latitude, wp.longitude], { icon }).addTo(map)
      waypointMarkersRef.current.push(marker)
    })

    // route 模式下繪製連線
    if (mode === 'route' && waypoints.length >= 2) {
      const latlngs = waypoints.map((wp) => [wp.latitude, wp.longitude] as L.LatLngTuple)
      polylineRef.current = L.polyline(latlngs, {
        color: '#f97316',
        weight: 3,
        opacity: 0.8,
        dashArray: '6, 4',
      }).addTo(map)
    }
  }, [waypoints, mode])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
