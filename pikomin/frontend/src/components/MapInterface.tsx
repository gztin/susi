import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { GPSCoordinate, SavedLandmark } from '../types'

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
  viewTarget: GPSCoordinate | null
  waypoints: GPSCoordinate[]
  savedLandmarks: SavedLandmark[]
  onMapClick: (coord: GPSCoordinate) => void
  onWaypointMove?: (index: number, coord: GPSCoordinate) => void
  onWaypointRemove?: (index: number) => void
  onWaypointSetAsStart?: (index: number) => void
  onWaypointSetAsEnd?: (index: number) => void
  canEditWaypoints?: boolean
}

interface WaypointContextMenu {
  index: number
  x: number
  y: number
  showCoordinate: boolean
}

export default function MapInterface({
  mode,
  currentPosition,
  viewTarget,
  waypoints,
  savedLandmarks,
  onMapClick,
  onWaypointMove,
  onWaypointRemove,
  onWaypointSetAsStart,
  onWaypointSetAsEnd,
  canEditWaypoints = false,
}: MapInterfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const currentMarkerRef = useRef<L.CircleMarker | null>(null)
  const waypointMarkersRef = useRef<L.Marker[]>([])
  const landmarkMarkersRef = useRef<L.Marker[]>([])
  const polylineRef = useRef<L.Polyline | null>(null)
  const prevPositionRef = useRef<GPSCoordinate | null>(null)
  const isDraggingWaypointRef = useRef(false)
  const [styleId, setStyleId] = useState<TileStyleId>('positron')
  const [waypointMenu, setWaypointMenu] = useState<WaypointContextMenu | null>(null)

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
      if (isDraggingWaypointRef.current) return
      setWaypointMenu(null)
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

  useEffect(() => {
    const map = mapRef.current
    if (!map || !viewTarget) return

    map.setView([viewTarget.latitude, viewTarget.longitude], 16, { animate: true })
  }, [viewTarget])

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
      if (canEditWaypoints && onWaypointMove) {
        marker.dragging?.enable()
        marker.on('dragstart', () => {
          setWaypointMenu(null)
          isDraggingWaypointRef.current = true
        })
        marker.on('dragend', () => {
          const next = marker.getLatLng()
          onWaypointMove(index, { latitude: next.lat, longitude: next.lng })
          window.setTimeout(() => {
            isDraggingWaypointRef.current = false
          }, 0)
        })
      }
      if (canEditWaypoints) {
        marker.on('contextmenu', (event: L.LeafletMouseEvent) => {
          const originalEvent = event.originalEvent
          originalEvent.preventDefault()
          originalEvent.stopPropagation()
          const bounds = containerRef.current?.getBoundingClientRect()
          const x = bounds ? originalEvent.clientX - bounds.left : event.containerPoint.x
          const y = bounds ? originalEvent.clientY - bounds.top : event.containerPoint.y
          setWaypointMenu({ index, x, y, showCoordinate: false })
        })
      }
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
  }, [waypoints, mode, canEditWaypoints, onWaypointMove])

  useEffect(() => {
    setWaypointMenu(null)
  }, [waypoints.length, canEditWaypoints])

  useEffect(() => {
    if (!waypointMenu) return

    const closeMenu = () => setWaypointMenu(null)
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }

    window.addEventListener('click', closeMenu)
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.removeEventListener('click', closeMenu)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [waypointMenu])

  const selectedWaypoint = waypointMenu ? waypoints[waypointMenu.index] : null

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    landmarkMarkersRef.current.forEach((m) => m.remove())
    landmarkMarkersRef.current = []

    savedLandmarks.forEach((landmark) => {
      const marker = L.marker([landmark.coordinate.latitude, landmark.coordinate.longitude]).addTo(map)
      marker.bindPopup(
        `<strong>${landmark.name}</strong><br/>${landmark.coordinate.latitude.toFixed(6)}, ${landmark.coordinate.longitude.toFixed(6)}`
      )
      landmarkMarkersRef.current.push(marker)
    })
  }, [savedLandmarks])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {waypointMenu && selectedWaypoint && (
        <div
          className="waypoint-context-menu"
          style={{ left: waypointMenu.x, top: waypointMenu.y }}
          onClick={(event) => event.stopPropagation()}
          onContextMenu={(event) => event.preventDefault()}
        >
          <button
            type="button"
            onClick={() => {
              setWaypointMenu((current) => current ? { ...current, showCoordinate: true } : current)
            }}
          >
            顯示座標
          </button>
          {waypointMenu.showCoordinate && (
            <div className="waypoint-coordinate-info">
              <span>{selectedWaypoint.latitude.toFixed(6)}</span>
              <span>{selectedWaypoint.longitude.toFixed(6)}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              onWaypointSetAsStart?.(waypointMenu.index)
              setWaypointMenu(null)
            }}
            disabled={waypointMenu.index === 0}
          >
            設為起點
          </button>
          <button
            type="button"
            onClick={() => {
              onWaypointSetAsEnd?.(waypointMenu.index)
              setWaypointMenu(null)
            }}
            disabled={waypointMenu.index === waypoints.length - 1}
          >
            設為終點
          </button>
          <button
            type="button"
            className="is-danger"
            onClick={() => {
              onWaypointRemove?.(waypointMenu.index)
              setWaypointMenu(null)
            }}
          >
            移除節點
          </button>
        </div>
      )}
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
