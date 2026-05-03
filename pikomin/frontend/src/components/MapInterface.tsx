import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { GPSCoordinate } from '../types'

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
})

const TILE_STYLES = [
  {
    id: 'osm',
    label: 'OSM',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    id: 'positron',
    label: '簡潔',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    id: 'dark',
    label: '深色',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
  },
] as const

type TileStyleId = (typeof TILE_STYLES)[number]['id']

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
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const currentMarkerRef = useRef<L.CircleMarker | null>(null)
  const waypointMarkersRef = useRef<L.Marker[]>([])
  const polylineRef = useRef<L.Polyline | null>(null)
  const prevPositionRef = useRef<GPSCoordinate | null>(null)
  const [styleId, setStyleId] = useState<TileStyleId>('positron')

  // 初始化地圖
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      doubleClickZoom: false,
    }).setView([23.5, 121.0], 8)

    const style = TILE_STYLES.find((s) => s.id === styleId) ?? TILE_STYLES[0]
    tileLayerRef.current = L.tileLayer(style.url, { attribution: style.attribution }).addTo(map)

    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick({ latitude: e.latlng.lat, longitude: e.latlng.lng })
    })

    mapRef.current = map

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.setView([pos.coords.latitude, pos.coords.longitude], 15)
        },
        () => {}
      )
    }

    return () => {
      map.remove()
      mapRef.current = null
      tileLayerRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 切換 tile 樣式
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const style = TILE_STYLES.find((s) => s.id === styleId)
    if (!style) return

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current)
    }
    tileLayerRef.current = L.tileLayer(style.url, { attribution: style.attribution }).addTo(map)
  }, [styleId])

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

  // 更新目前位置標記
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

      if (!prevPositionRef.current) {
        map.setView([currentPosition.latitude, currentPosition.longitude], 16, { animate: true })
      }
      prevPositionRef.current = currentPosition
    } else {
      prevPositionRef.current = null
    }
  }, [currentPosition])

  // 更新路徑點標記與連線
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    waypointMarkersRef.current.forEach((m) => m.remove())
    waypointMarkersRef.current = []

    if (polylineRef.current) {
      polylineRef.current.remove()
      polylineRef.current = null
    }

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

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <div className="map-style-switcher">
        {TILE_STYLES.map((s) => (
          <button
            key={s.id}
            className={`map-style-btn${styleId === s.id ? ' is-active' : ''}`}
            onClick={() => setStyleId(s.id)}
            aria-pressed={styleId === s.id}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
