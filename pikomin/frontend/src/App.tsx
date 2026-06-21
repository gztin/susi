import { useCallback, useEffect, useRef, useState } from 'react'
import { Church, Copy, Download, FileInput, FolderOpen, HelpCircle, Layers3, Loader2, Lock, Mail, Map, MoreHorizontal, MousePointerClick, Pencil, Radar, Save, Send, Trees, Trash2, X, Zap, ZoomIn } from 'lucide-react'
import './app.css'
import { apiClient } from './api/client'
import { DeviceStatus } from './components/DeviceStatus'
import MapInterface from './components/MapInterface'
import { RoutePanel } from './components/RoutePanel'
import { useDevice } from './hooks/useDevice'
import { useRoute } from './hooks/useRoute'
import type { GPSCoordinate, MushroomElementType, MushroomType, PostcardLandmark, SavedLandmark, SavedMushroom, SavedRoute } from './types'

type Mode = 'single' | 'route'
type FlyMode = 'coordinate' | 'landmark'
type ManagerTab = 'landmarks' | 'routes'
type MushroomManagerTab = 'createGiant' | 'createElement' | 'giantList' | 'elementList'
type LandmarkManagerTab = 'create' | 'search' | MushroomManagerTab
type LandmarkTypeFilter = 'flower' | 'mushroom' | 'giant' | 'element'
type PostcardFilterType = 'temple' | 'transformer' | 'church' | 'park'
const LANDMARKS_PER_PAGE = 12
const ROUTES_PER_PAGE = 12

function formatRouteCoordinates(waypoints: GPSCoordinate[]): string {
  return waypoints
    .map((point) => `${point.latitude.toFixed(6)},${point.longitude.toFixed(6)}`)
    .join('\n')
}

function routeDistance(a: GPSCoordinate, b: GPSCoordinate): number {
  const lat1 = a.latitude * Math.PI / 180
  const lat2 = b.latitude * Math.PI / 180
  const deltaLat = (b.latitude - a.latitude) * Math.PI / 180
  const deltaLon = (b.longitude - a.longitude) * Math.PI / 180
  const h = Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function cycleDistance(points: GPSCoordinate[]): number {
  let total = 0
  for (let index = 0; index < points.length; index += 1) {
    total += routeDistance(points[index], points[(index + 1) % points.length])
  }
  return total
}

function optimizeRouteExact(points: GPSCoordinate[]): GPSCoordinate[] {
  const [start, ...rest] = points
  let best = points
  let bestDistance = cycleDistance(points)

  function visit(prefix: GPSCoordinate[], remaining: GPSCoordinate[]) {
    if (remaining.length === 0) {
      const candidate = [start, ...prefix]
      const distance = cycleDistance(candidate)
      if (distance < bestDistance) {
        best = candidate
        bestDistance = distance
      }
      return
    }

    remaining.forEach((point, index) => {
      visit(
        [...prefix, point],
        [...remaining.slice(0, index), ...remaining.slice(index + 1)],
      )
    })
  }

  visit([], rest)
  return best
}

function optimizeRouteHeuristic(points: GPSCoordinate[]): GPSCoordinate[] {
  const [start, ...rest] = points
  const route = [start]
  const remaining = [...rest]

  while (remaining.length > 0) {
    const current = route[route.length - 1]
    let nearestIndex = 0
    let nearestDistance = routeDistance(current, remaining[0])
    for (let index = 1; index < remaining.length; index += 1) {
      const distance = routeDistance(current, remaining[index])
      if (distance < nearestDistance) {
        nearestIndex = index
        nearestDistance = distance
      }
    }
    route.push(remaining.splice(nearestIndex, 1)[0])
  }

  let improved = true
  while (improved) {
    improved = false
    for (let i = 1; i < route.length - 2; i += 1) {
      for (let k = i + 1; k < route.length - 1; k += 1) {
        const candidate = [
          ...route.slice(0, i),
          ...route.slice(i, k + 1).reverse(),
          ...route.slice(k + 1),
        ]
        if (cycleDistance(candidate) + 0.001 < cycleDistance(route)) {
          route.splice(0, route.length, ...candidate)
          improved = true
        }
      }
    }
  }

  return route
}

function optimizeRouteCycle(points: GPSCoordinate[]): GPSCoordinate[] {
  if (points.length < 3) return points
  return points.length <= 9 ? optimizeRouteExact(points) : optimizeRouteHeuristic(points)
}

function formatDuration(seconds: number): string {
  const rounded = Math.max(1, Math.round(seconds))
  const hours = Math.floor(rounded / 3600)
  const minutes = Math.floor((rounded % 3600) / 60)
  const secs = rounded % 60

  if (hours > 0) {
    return `${hours} 小時 ${minutes} 分`
  }
  if (minutes > 0) {
    return `${minutes} 分 ${secs} 秒`
  }
  return `${secs} 秒`
}

interface Toast {
  id: number
  message: string
}

interface RouteFilePayload {
  version?: unknown
  name?: unknown
  exportedAt?: unknown
  waypoints?: unknown
}

interface LandmarkFilePayload {
  version?: unknown
  name?: unknown
  exportedAt?: unknown
  coordinate?: unknown
  landmarkType?: unknown
  imageUrl?: unknown
}

interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

const POSTCARD_FILTERS: { id: PostcardFilterType; label: string; keywords: string[] }[] = [
  { id: 'temple', label: '廟宇', keywords: ['廟', '宮', '寺', '佛教', '蓮社', '精舍', '聖母', 'temple', 'shrine'] },
  { id: 'transformer', label: '變電箱', keywords: ['變電箱', '配電箱', '電箱', '電氣箱', '光纖電箱', 'transformer'] },
  { id: 'church', label: '教堂', keywords: ['教堂', '教會', '基督', '召會', 'church', 'cathedral', 'chapel'] },
  { id: 'park', label: '公園', keywords: ['公園', '涼亭', '遊戲區', 'park', 'pavilion'] },
]

const INITIAL_POSTCARD_FILTERS: Record<PostcardFilterType, boolean> = {
  temple: true,
  transformer: true,
  church: true,
  park: true,
}

const LANDMARK_TYPE_FILTERS: { id: LandmarkTypeFilter; label: string }[] = [
  { id: 'flower', label: '花點' },
  { id: 'mushroom', label: '菇點' },
  { id: 'giant', label: '巨菇' },
  { id: 'element', label: '元素菇' },
]

const MUSHROOM_ELEMENT_OPTIONS: { id: MushroomElementType; label: string }[] = [
  { id: 'water', label: '水' },
  { id: 'fire', label: '火' },
  { id: 'electric', label: '雷' },
  { id: 'poison', label: '毒' },
  { id: 'crystal', label: '水晶' },
]

const MUSHROOM_TAB_LABELS: Record<MushroomManagerTab, string> = {
  createGiant: '新增巨菇',
  createElement: '新增元素菇',
  giantList: '巨菇',
  elementList: '元素菇',
}

const LANDMARK_MANAGER_TAB_LABELS: Record<LandmarkManagerTab, string> = {
  create: '新增地標',
  search: '搜尋地標',
  ...MUSHROOM_TAB_LABELS,
}

const elementLabelMap = Object.fromEntries(
  MUSHROOM_ELEMENT_OPTIONS.map((option) => [option.id, option.label]),
) as Record<MushroomElementType, string>

function TempleIcon({ size = 18 }: { size?: number }) {


  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.5 4 7v2h16V7l-8-4.5Zm-7.5 8A4.4 4.4 0 0 0 8 12.2h8a4.4 4.4 0 0 0 3.5-1.7H21v2H3v-2h1.5ZM5 14h3v5H5v-5Zm5 0h4v5h-1.2v-2.2a.8.8 0 0 0-1.6 0V19H10v-5Zm6 0h3v5h-3v-5ZM3 20h18v2H3v-2Z"
      />
    </svg>
  )
}

let toastIdCounter = 0

function parseCoordinateInput(value: string): GPSCoordinate | null {
  const normalized = value
    .replace(/，/g, ',')
    .replace(/[()（）]/g, '')
    .trim()
    .replace(/\s+/g, ' ')

  const byComma = normalized.split(',').map((segment) => segment.trim()).filter(Boolean)
  const partsText = byComma.length === 2 ? byComma : normalized.split(' ').map((segment) => segment.trim()).filter(Boolean)
  const parts = partsText.map((segment) => Number.parseFloat(segment))
  if (parts.length !== 2 || parts.some((part) => Number.isNaN(part))) {
    return null
  }

  return { latitude: parts[0], longitude: parts[1] }
}

function formatCoordinate(coord: GPSCoordinate | null): string {
  if (!coord) return '尚未設定'
  return `${coord.latitude.toFixed(6)}, ${coord.longitude.toFixed(6)}`
}

function formatMushroomCountdown(expiresAt: string, nowMs: number): string {
  const expiresMs = new Date(expiresAt).getTime()
  if (!Number.isFinite(expiresMs)) return '時間未設定'
  const diffMs = expiresMs - nowMs
  if (diffMs <= 0) return '已結束'
  const totalSeconds = Math.ceil(diffMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const paddedMinutes = String(minutes).padStart(2, '0')
  const paddedSeconds = String(seconds).padStart(2, '0')
  if (days > 0) return `${days}天 ${String(hours).padStart(2, '0')}:${paddedMinutes}:${paddedSeconds}`
  if (hours > 0) return `${hours}:${paddedMinutes}:${paddedSeconds}`
  return `${minutes}:${paddedSeconds}`
}

function getMushroomTag(item: SavedMushroom): string {
  if (item.mushroomType === 'giant') return '巨菇'
  return item.elementType ? `${elementLabelMap[item.elementType]}菇` : '元素菇'
}

function distanceMeters(a: GPSCoordinate, b: GPSCoordinate): number {
  const earthRadius = 6371000
  const toRadians = (value: number) => (value * Math.PI) / 180
  const dLat = toRadians(b.latitude - a.latitude)
  const dLng = toRadians(b.longitude - a.longitude)
  const lat1 = toRadians(a.latitude)
  const lat2 = toRadians(b.latitude)
  const h = (
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  )
  return earthRadius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function boundsCenter(bounds: MapBounds): GPSCoordinate {
  return {
    latitude: (bounds.north + bounds.south) / 2,
    longitude: (bounds.east + bounds.west) / 2,
  }
}

function boundsRadiusMeters(bounds: MapBounds): number {
  const center = boundsCenter(bounds)
  const corner = { latitude: bounds.north, longitude: bounds.east }
  return Math.min(Math.max(distanceMeters(center, corner), 500), 120000)
}

function postcardLimitForRadius(radiusM: number): number {
  if (radiusM < 1500) return 80
  if (radiusM < 4000) return 160
  if (radiusM < 10000) return 260
  return 300
}

function formatPostcardFilterLabel(filters: Record<PostcardFilterType, boolean>): string {
  const enabled = POSTCARD_FILTERS.filter((filter) => filters[filter.id])
  if (enabled.length === POSTCARD_FILTERS.length) return '明信片'
  if (enabled.length === 1) return enabled[0].label
  if (enabled.length === 0) return '明信片'
  return enabled.map((filter) => filter.label).join('、')
}

function filterPostcardsInBounds(
  items: PostcardLandmark[],
  bounds: MapBounds,
  filters: Record<PostcardFilterType, boolean>,
): PostcardLandmark[] {
  const allEnabled = POSTCARD_FILTERS.every((filter) => filters[filter.id])
  return items.filter((postcard) => {
    const type = getPostcardFilterType(postcard)
    const typeMatched = allEnabled ? true : type !== null && filters[type]
    return (
      typeMatched &&
      postcard.coordinate.latitude <= bounds.north &&
      postcard.coordinate.latitude >= bounds.south &&
      postcard.coordinate.longitude <= bounds.east &&
      postcard.coordinate.longitude >= bounds.west
    )
  })
}

function mergePostcardSources(primary: PostcardLandmark[], secondary: PostcardLandmark[]): PostcardLandmark[] {
  const merged = [...primary]
  const seenIds = new Set(primary.map((postcard) => postcard.id))
  for (const postcard of secondary) {
    if (seenIds.has(postcard.id)) continue
    const duplicate = merged.some((item) => (
      distanceMeters(item.coordinate, postcard.coordinate) <= 20 ||
      (
        item.name.trim().toLowerCase() === postcard.name.trim().toLowerCase() &&
        distanceMeters(item.coordinate, postcard.coordinate) <= 80
      )
    ))
    if (duplicate) continue
    seenIds.add(postcard.id)
    merged.push(postcard)
  }
  return merged
}

function getPostcardFilterType(postcard: PostcardLandmark): PostcardFilterType | null {
  const haystack = `${postcard.name} ${postcard.tags.join(' ')}`.toLowerCase()
  return POSTCARD_FILTERS.find((filter) => (
    filter.keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))
  ))?.id ?? null
}

function togglePostcardFilter(
  current: Record<PostcardFilterType, boolean>,
  target: PostcardFilterType,
): Record<PostcardFilterType, boolean> {
  const allEnabled = POSTCARD_FILTERS.every((filter) => current[filter.id])
  if (allEnabled) {
    return {
      temple: target === 'temple',
      transformer: target === 'transformer',
      church: target === 'church',
      park: target === 'park',
    }
  }
  return {
    ...current,
    [target]: !current[target],
  }
}

function isValidCoordinate(value: unknown): value is GPSCoordinate {
  if (!value || typeof value !== 'object') return false
  const coord = value as Partial<GPSCoordinate>
  return (
    typeof coord.latitude === 'number' &&
    typeof coord.longitude === 'number' &&
    Number.isFinite(coord.latitude) &&
    Number.isFinite(coord.longitude) &&
    coord.latitude >= -90 &&
    coord.latitude <= 90 &&
    coord.longitude >= -180 &&
    coord.longitude <= 180
  )
}

function normalizeImportedRoute(payload: RouteFilePayload): { name: string; waypoints: GPSCoordinate[] } {
  if (!Array.isArray(payload.waypoints)) {
    throw new Error('檔案格式錯誤，找不到路徑點資料')
  }
  const waypoints = payload.waypoints
  if (waypoints.length < 2) {
    throw new Error('路徑至少需要 2 個路徑點')
  }
  if (!waypoints.every(isValidCoordinate)) {
    throw new Error('路徑檔案內有無效座標，請確認經緯度')
  }
  const name = typeof payload.name === 'string' && payload.name.trim()
    ? payload.name.trim()
    : '匯入的種花路徑'
  return { name, waypoints }
}

function normalizeImportedLandmark(payload: LandmarkFilePayload): {
  name: string
  coordinate: GPSCoordinate
  landmarkType: 'flower' | 'mushroom'
  imageUrl?: string
} {
  const name = typeof payload.name === 'string' ? payload.name.trim() : ''
  if (!name) {
    throw new Error('地標檔案格式錯誤，缺少地標名稱')
  }
  if (!isValidCoordinate(payload.coordinate)) {
    throw new Error('地標檔案格式錯誤，座標必須包含有效 latitude 與 longitude')
  }
  if (payload.landmarkType !== 'flower' && payload.landmarkType !== 'mushroom') {
    throw new Error('地標檔案格式錯誤，地標類型必須是 flower 或 mushroom')
  }
  const imageUrl = typeof payload.imageUrl === 'string' ? payload.imageUrl.trim() : ''
  if (payload.imageUrl !== undefined) {
    try {
      const parsed = new URL(imageUrl)
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('unsupported protocol')
      }
    } catch {
      throw new Error('地標檔案格式錯誤，圖片網址必須是有效的 http 或 https URL')
    }
  }
  return {
    name,
    coordinate: payload.coordinate,
    landmarkType: payload.landmarkType,
    ...(imageUrl ? { imageUrl } : {}),
  }
}

function sanitizeFilename(value: string): string {
  const normalized = value.trim().replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '-')
  return normalized || '未命名路徑'
}

export default function App() {
  const [mode, setMode] = useState<Mode>('single')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [myPosition, setMyPosition] = useState<GPSCoordinate | null>(null)
  const [viewTarget, setViewTarget] = useState<GPSCoordinate | null>(null)
  const [isMapClickArmed, setIsMapClickArmed] = useState(false)
  const [destinationInput, setDestinationInput] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [isFlying, setIsFlying] = useState(false)
  const [hasResetGPS, setHasResetGPS] = useState(false)
  const [landmarkNameInput, setLandmarkNameInput] = useState('')
  const [landmarkCoordInput, setLandmarkCoordInput] = useState('')
  const [landmarkSearchInput, setLandmarkSearchInput] = useState('')
  const [routeSearchInput, setRouteSearchInput] = useState('')
  const [landmarkTypeInput, setLandmarkTypeInput] = useState<'flower' | 'mushroom'>('mushroom')
  const [landmarkTypeFilter, setLandmarkTypeFilter] = useState<LandmarkTypeFilter>('mushroom')
  const [landmarkFormTouched, setLandmarkFormTouched] = useState(false)
  const [landmarkSaving, setLandmarkSaving] = useState(false)
  const [editingLandmarkId, setEditingLandmarkId] = useState('')
  const [selectedLandmarkId, setSelectedLandmarkId] = useState('')
  const [openLandmarkActionId, setOpenLandmarkActionId] = useState('')
  const [openRouteActionId, setOpenRouteActionId] = useState('')
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([])
  const [savedMushrooms, setSavedMushrooms] = useState<SavedMushroom[]>([])
  const [routeSaving, setRouteSaving] = useState(false)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [isFlySettingsOpen, setIsFlySettingsOpen] = useState(false)
  const [isLandmarkManagerOpen, setIsLandmarkManagerOpen] = useState(false)
  const [isMushroomOnlyManager, setIsMushroomOnlyManager] = useState(false)
  const [isRouteLibraryOpen, setIsRouteLibraryOpen] = useState(false)
  const [isSaveRouteModalOpen, setIsSaveRouteModalOpen] = useState(false)
  const [isDisconnectHelpOpen, setIsDisconnectHelpOpen] = useState(false)
  const [managerTab, setManagerTab] = useState<ManagerTab>('landmarks')
  const [landmarkManagerTab, setLandmarkManagerTab] = useState<LandmarkManagerTab>('create')
  const [mushroomManagerTab, setMushroomManagerTab] = useState<MushroomManagerTab>('giantList')
  const [landmarkPage, setLandmarkPage] = useState(1)
  const [routePage, setRoutePage] = useState(1)
  const [waypointStartIndex, setWaypointStartIndex] = useState(0)
  const [isRouteOptimized, setIsRouteOptimized] = useState(false)
  const [showPostcards, setShowPostcards] = useState(false)
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null)
  const [postcards, setPostcards] = useState<PostcardLandmark[]>([])
  const [postcardFilters, setPostcardFilters] = useState<Record<PostcardFilterType, boolean>>(INITIAL_POSTCARD_FILTERS)
  const [isScanningPostcards, setIsScanningPostcards] = useState(false)
  const [routeNameInput, setRouteNameInput] = useState('')
  const [mushroomNameInput, setMushroomNameInput] = useState('')
  const [mushroomCoordInput, setMushroomCoordInput] = useState('')
  const [mushroomSlotsInput, setMushroomSlotsInput] = useState('')
  const [mushroomDaysInput, setMushroomDaysInput] = useState('')
  const [mushroomHoursInput, setMushroomHoursInput] = useState('')
  const [mushroomMinutesInput, setMushroomMinutesInput] = useState('')
  const [mushroomElementInput, setMushroomElementInput] = useState<MushroomElementType>('water')
  const [mushroomFormTouched, setMushroomFormTouched] = useState(false)
  const [mushroomSaving, setMushroomSaving] = useState(false)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [flyMode, setFlyMode] = useState<FlyMode>('coordinate')
  const [savedLandmarks, setSavedLandmarks] = useState<SavedLandmark[]>([])
  const [previewLandmark, setPreviewLandmark] = useState<SavedLandmark | null>(null)
  const showToastRef = useRef<(message: string) => void>(() => {})
  const routeImportInputRef = useRef<HTMLInputElement | null>(null)
  const landmarkImportInputRef = useRef<HTMLInputElement | null>(null)
  const handleRouteError = useCallback((message: string) => {
    showToastRef.current(`路徑推送失敗：${message}`)
  }, [])

  const { devices, selectedDevice, selectDevice, isLoading, error } = useDevice()
  const {
    waypoints,
    addWaypoint,
    updateWaypoint,
    replaceWaypoints,
    removeWaypoint,
    clearWaypoints,
    routeStatus,
    startRoute,
    pauseRoute,
    resumeRoute,
    stopRoute,
    syncCurrentPosition,
  } = useRoute(selectedDevice?.id ?? null, myPosition, handleRouteError)

  useEffect(() => {
    let cancelled = false
    void apiClient.getLandmarks()
      .then((items) => {
        if (!cancelled) setSavedLandmarks(items)
      })
      .catch(() => {
        if (!cancelled) setSavedLandmarks([])
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    void apiClient.getSavedRoutes()
      .then((items) => {
        if (!cancelled) setSavedRoutes(items)
      })
      .catch(() => {
        if (!cancelled) setSavedRoutes([])
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    void apiClient.getMushrooms()
      .then((items) => {
        if (!cancelled) setSavedMushrooms(items)
      })
      .catch(() => {
        if (!cancelled) setSavedMushrooms([])
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => setNowMs(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (navigator.geolocation && selectedDevice && !myPosition && !hasResetGPS) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coord = { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
          setMyPosition(coord)
          syncCurrentPosition(coord, 'idle')
        },
        () => {},
      )
    }
  }, [selectedDevice, myPosition, hasResetGPS, syncCurrentPosition])

  const showToast = useCallback((message: string) => {
    const id = ++toastIdCounter
    setToasts((prev) => [...prev, { id, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }, [])

  useEffect(() => {
    showToastRef.current = showToast
  }, [showToast])

  useEffect(() => {
    const expired = savedMushrooms.filter((item) => {
      const expiresMs = new Date(item.expiresAt).getTime()
      return Number.isFinite(expiresMs) && expiresMs <= nowMs
    })
    if (expired.length === 0) return
    setSavedMushrooms((prev) => prev.filter((item) => !expired.some((expiredItem) => expiredItem.id === item.id)))
    expired.forEach((item) => {
      void apiClient.deleteMushroom(item.id).catch(() => {})
    })
    showToast(`已自動移除 ${expired.length} 筆倒數結束的蘑菇資料`)
  }, [nowMs, savedMushrooms, showToast])

  const handleScanPostcards = useCallback(async () => {
    if (!mapBounds) {
      showToast('目前還沒有可掃描的地圖範圍')
      return
    }

    const radiusM = boundsRadiusMeters(mapBounds)
    const limit = postcardLimitForRadius(radiusM)
    const boundsPayload = {
      north: mapBounds.north,
      south: mapBounds.south,
      east: mapBounds.east,
      west: mapBounds.west,
      limit,
    }
    setIsScanningPostcards(true)
    try {
      const [atlasItems, pikoohiongResult] = await Promise.all([
        apiClient.getPostcardsInBounds(boundsPayload),
        apiClient.getPostcardsInBounds(boundsPayload, 'pikoohiong').then(
          (items) => ({ ok: true as const, items }),
          () => ({ ok: false as const, items: [] as PostcardLandmark[] }),
        ),
      ])
      const items = mergePostcardSources(atlasItems, pikoohiongResult.items)
      setPostcards(items)
      const visibleCount = filterPostcardsInBounds(items, mapBounds, postcardFilters).length
      const supplementText = pikoohiongResult.ok
        ? `，輔助 ${pikoohiongResult.items.length} 筆`
        : '，輔助來源讀取失敗'
      showToast(`偵測到 ${visibleCount} 個${formatPostcardFilterLabel(postcardFilters)}（Atlas ${atlasItems.length} 筆${supplementText}）`)
    } catch (err) {
      setPostcards([])
      showToast(err instanceof Error ? err.message : '明信片掃描失敗')
    } finally {
      setIsScanningPostcards(false)
    }
  }, [mapBounds, postcardFilters, showToast])

  useEffect(() => {
    if (!showPostcards) {
      setPostcards([])
    }
  }, [showPostcards])

  useEffect(() => {
    setLandmarkPage(1)
  }, [landmarkSearchInput, landmarkTypeFilter])

  useEffect(() => {
    setRoutePage(1)
  }, [routeSearchInput])

  const resolveActiveDevice = useCallback(async () => {
    const latestDevices = await apiClient.getDevices()
    if (latestDevices.length === 0) return null
    const connected = latestDevices.find((item) => item.isConnected) ?? latestDevices[0]
    selectDevice(connected.id)
    return connected
  }, [selectDevice])

  const sendLocationFast = useCallback(async (coord: GPSCoordinate, preferredDeviceId?: string | null) => {
    let deviceId = preferredDeviceId ?? selectedDevice?.id ?? null
    if (!deviceId) {
      const refreshed = await resolveActiveDevice()
      if (!refreshed) {
        showToast('請先選擇裝置')
        return false
      }
      deviceId = refreshed.id
    }

    try {
      await apiClient.setLocation({
        latitude: coord.latitude,
        longitude: coord.longitude,
        deviceId,
      })
      return true
    } catch (err) {
      const status = typeof err === 'object' && err && 'status' in err ? (err as { status?: number }).status : undefined
      const code = typeof err === 'object' && err && 'code' in err ? (err as { code?: string }).code : undefined
      const message = err instanceof Error ? err.message : '設定位置失敗'

      if (code === 'LOCATION_BRIDGE_FAILED') {
        showToast('定位橋接失敗，請重試')
        return false
      }

      if (!(err instanceof Error) || !/Device not found|DEVICE_NOT_FOUND|HTTP 404|HTTP 400/i.test(message) || (status === 400 && code !== 'DEVICE_NOT_FOUND')) {
        showToast(message)
        return false
      }
      const refreshed = await resolveActiveDevice()
      if (!refreshed) {
        // 裝置清單偶發抖動時，先用原本 device 再補一次短重試，避免誤判為已變更
        if (deviceId) {
          try {
            await new Promise((resolve) => window.setTimeout(resolve, 800))
            await apiClient.setLocation({
              latitude: coord.latitude,
              longitude: coord.longitude,
              deviceId,
            })
            return true
          } catch (retryErr) {
            const retryCode = typeof retryErr === 'object' && retryErr && 'code' in retryErr ? (retryErr as { code?: string }).code : undefined
            if (retryCode === 'LOCATION_BRIDGE_FAILED') {
              showToast('定位橋接失敗，請重試')
            } else {
              showToast(retryErr instanceof Error ? retryErr.message : '設定位置失敗')
            }
            return false
          }
        }
        showToast('裝置連線已變更，請重新選擇裝置後再試一次')
        return false
      }
      try {
        await apiClient.setLocation({
          latitude: coord.latitude,
          longitude: coord.longitude,
          deviceId: refreshed.id,
        })
        return true
      } catch (retryErr) {
        const retryCode = typeof retryErr === 'object' && retryErr && 'code' in retryErr ? (retryErr as { code?: string }).code : undefined
        if (retryCode === 'LOCATION_BRIDGE_FAILED') {
          showToast('定位橋接失敗，請重試')
        } else {
          showToast(retryErr instanceof Error ? retryErr.message : '設定位置失敗')
        }
        return false
      }
    }
  }, [resolveActiveDevice, selectedDevice?.id, showToast])

  const handleMapClick = useCallback(
    async (coord: GPSCoordinate) => {
      if (!isMapClickArmed) return

      if (mode === 'route') {
        if (waypoints.length === 0) setWaypointStartIndex(0)
        setIsRouteOptimized(false)
        addWaypoint(coord)
        return
      }

      const ok = await sendLocationFast(coord, selectedDevice?.id)
      if (!ok) return
      try {
        setMyPosition(coord)
        syncCurrentPosition(coord, 'idle')
        setViewTarget(coord)
        setHasResetGPS(false)
        showToast('位置已更新')
      } catch (err) {
        showToast(err instanceof Error ? err.message : '設定位置失敗')
      }
    },
    [addWaypoint, isMapClickArmed, mode, selectedDevice?.id, sendLocationFast, showToast, syncCurrentPosition, waypoints.length],
  )

  const handleToggleMapClickArmed = useCallback(() => {
    setIsMapClickArmed((prev) => {
      const next = !prev
      showToast(next ? '點圖生效中' : '點圖已鎖定')
      return next
    })
  }, [showToast])

  const handleRemoveWaypoint = useCallback((index: number) => {
    removeWaypoint(index)
    showToast('已移除路徑節點')
  }, [removeWaypoint, showToast])

  const handleUpdateWaypoint = useCallback((index: number, coord: GPSCoordinate) => {
    const nextWaypoints = waypoints.map((wp, wpIndex) => (wpIndex === index ? coord : wp))

    if (routeStatus.state === 'paused' || isRouteOptimized) {
      if (nextWaypoints.length >= 3) {
        replaceWaypoints(optimizeRouteCycle(nextWaypoints))
        setWaypointStartIndex(0)
        setIsRouteOptimized(true)
        showToast('已依新節點位置重新規劃路線')
        return
      }

      replaceWaypoints(nextWaypoints)
      setWaypointStartIndex(0)
      setIsRouteOptimized(false)
      return
    }

    updateWaypoint(index, coord)
    setWaypointStartIndex(0)
    setIsRouteOptimized(false)
  }, [isRouteOptimized, replaceWaypoints, routeStatus.state, showToast, updateWaypoint, waypoints])

  const handleOptimizeRoute = useCallback(() => {
    if (waypoints.length < 3) {
      showToast('最佳路線規劃至少需要 3 個中繼點')
      return
    }

    replaceWaypoints(optimizeRouteCycle(waypoints))
    setWaypointStartIndex(0)
    setIsRouteOptimized(true)
    showToast('已完成最佳路線規劃')
  }, [replaceWaypoints, showToast, waypoints])

  const handleStartRoute = useCallback(
    async (speed: number, loop: boolean) => {
      if (!isRouteOptimized) {
        showToast('請先執行最佳路線規劃')
        return
      }

      try {
        await startRoute(speed, loop)
      } catch (err) {
        if (err instanceof Error && 'status' in err && (err as { status: number }).status === 409) {
          try {
            await stopRoute()
            await startRoute(speed, loop)
          } catch (retryErr) {
            showToast(retryErr instanceof Error ? retryErr.message : '啟動路徑失敗')
          }
        } else {
          showToast(err instanceof Error ? err.message : '啟動路徑失敗')
        }
      }
    },
    [isRouteOptimized, showToast, startRoute, stopRoute],
  )

  const handlePauseRoute = useCallback(async () => {
    try {
      await pauseRoute()
    } catch (err) {
      showToast(err instanceof Error ? err.message : '暫停路徑失敗')
    }
  }, [pauseRoute, showToast])

  const handleResumeRoute = useCallback(async () => {
    try {
      await resumeRoute()
    } catch (err) {
      showToast(err instanceof Error ? err.message : '繼續路徑失敗')
    }
  }, [resumeRoute, showToast])

  const handleStopRoute = useCallback(async () => {
    try {
      await stopRoute()
      showToast('✅ 已停止路徑')
    } catch (err) {
      showToast(err instanceof Error ? err.message : '停止路徑失敗')
    }
  }, [showToast, stopRoute])

  const handleLocateMe = useCallback(() => {
    setIsLocating(true)
    const locateByBrowser = () => {
      if (!navigator.geolocation) {
        setIsLocating(false)
        showToast('無法取得位置：瀏覽器不支援定位')
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coord = { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
          setMyPosition(coord)
          syncCurrentPosition(coord, 'idle')
          setViewTarget(coord)
          setHasResetGPS(false)
          setIsLocating(false)
          showToast('位置取得成功')
        },
        () => {
          setIsLocating(false)
          showToast('無法取得位置：目前無法從裝置或瀏覽器定位')
        },
        { enableHighAccuracy: true, timeout: 10000 },
      )
    }

    if (selectedDevice) {
      void apiClient.getGeolocation()
        .then((geo) => {
          const coord = { latitude: geo.latitude, longitude: geo.longitude }
          setMyPosition(coord)
          syncCurrentPosition(coord, 'idle')
          setViewTarget(coord)
          setHasResetGPS(false)
          setIsLocating(false)
          showToast('位置取得成功')
        })
        .catch(() => {
          locateByBrowser()
        })
      return
    }

    locateByBrowser()
  }, [selectedDevice, showToast, syncCurrentPosition])

  const handleFlyTo = useCallback(async () => {
    const landmark = savedLandmarks.find((item) => item.name === destinationInput.trim())
    const coord = landmark?.coordinate ?? parseCoordinateInput(destinationInput)
    if (!coord) {
      showToast('請輸入正確目的地座標')
      return
    }

    setIsFlying(true)
    try {
      const ok = await sendLocationFast(coord, selectedDevice?.id)
      if (!ok) return
      setMode('single')
      setMyPosition(coord)
      syncCurrentPosition(coord, 'idle')
      setViewTarget(coord)
      setDestinationInput(landmark ? landmark.name : '')
      setHasResetGPS(false)
      showToast('已飛行到目的地')
    } catch (err) {
      showToast(err instanceof Error ? err.message : '飛行失敗')
    } finally {
      setIsFlying(false)
    }
  }, [destinationInput, savedLandmarks, selectedDevice?.id, sendLocationFast, showToast, syncCurrentPosition])

  const handleFlyToMushroom = useCallback(async (mushroom: SavedMushroom) => {
    setIsFlying(true)
    try {
      const ok = await sendLocationFast(mushroom.coordinate, selectedDevice?.id)
      if (!ok) return
      setMode('single')
      setMyPosition(mushroom.coordinate)
      syncCurrentPosition(mushroom.coordinate, 'idle')
      setViewTarget(mushroom.coordinate)
      setDestinationInput(mushroom.name)
      setHasResetGPS(false)
      showToast(`已飛行到${getMushroomTag(mushroom)}：${mushroom.name}`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : '飛行失敗')
    } finally {
      setIsFlying(false)
    }
  }, [selectedDevice?.id, sendLocationFast, showToast, syncCurrentPosition])

  const resetMushroomForm = useCallback(() => {
    setMushroomNameInput('')
    setMushroomCoordInput('')
    setMushroomSlotsInput('')
    setMushroomDaysInput('')
    setMushroomHoursInput('')
    setMushroomMinutesInput('')
    setMushroomElementInput('water')
    setMushroomFormTouched(false)
  }, [])

  const handleCreateMushroom = useCallback(async (mushroomType: MushroomType) => {
    setMushroomFormTouched(true)
    const name = mushroomNameInput.trim()
    const coordinate = parseCoordinateInput(mushroomCoordInput)
    if (!name || !coordinate) {
      showToast('請輸入蘑菇名稱與正確座標')
      return
    }

    const trimmedSlots = mushroomSlotsInput.trim()
    let remainingSlots: number | null = null
    if (trimmedSlots) {
      const slotValue = Number.parseInt(trimmedSlots, 10)
      if (!Number.isInteger(slotValue) || slotValue < 0 || slotValue > 5) {
        showToast('剩餘空位請輸入 0 到 5')
        return
      }
      remainingSlots = slotValue
    }

    const shouldReadTime = remainingSlots !== null && remainingSlots < 5
    const trimmedDays = mushroomDaysInput.trim()
    const trimmedHours = mushroomHoursInput.trim()
    const trimmedMinutes = mushroomMinutesInput.trim()
    let remainingMinutes: number | null = null
    if (shouldReadTime) {
      const dayValue = trimmedDays ? Number.parseInt(trimmedDays, 10) : 0
      const hourValue = trimmedHours ? Number.parseInt(trimmedHours, 10) : 0
      const minuteValue = trimmedMinutes ? Number.parseInt(trimmedMinutes, 10) : Number.NaN
      if (
        (trimmedDays && (!Number.isInteger(dayValue) || dayValue < 0)) ||
        (trimmedHours && (!Number.isInteger(hourValue) || hourValue < 0 || hourValue > 23)) ||
        !Number.isInteger(minuteValue) ||
        minuteValue < 0 ||
        minuteValue > 59
      ) {
        showToast('剩餘時間請輸入有效的日、時、分')
        return
      }
      remainingMinutes = dayValue * 1440 + hourValue * 60 + minuteValue
      if (remainingMinutes <= 0) {
        showToast('剩餘時間至少要 1 分鐘')
        return
      }
    }

    setMushroomSaving(true)
    try {
      const created = await apiClient.createMushroom({
        name,
        coordinate,
        mushroomType,
        elementType: mushroomType === 'element' ? mushroomElementInput : null,
        remainingSlots,
        remainingMinutes,
      })
      setSavedMushrooms((prev) => [created, ...prev])
      setNowMs(Date.now())
      resetMushroomForm()
      setMushroomManagerTab(mushroomType === 'giant' ? 'giantList' : 'elementList')
      setLandmarkManagerTab(mushroomType === 'giant' ? 'giantList' : 'elementList')
      showToast(`已新增${getMushroomTag(created)}：${created.name}`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : '新增蘑菇資料失敗')
    } finally {
      setMushroomSaving(false)
    }
  }, [mushroomCoordInput, mushroomDaysInput, mushroomElementInput, mushroomHoursInput, mushroomMinutesInput, mushroomNameInput, mushroomSlotsInput, resetMushroomForm, showToast])

  const handleDeleteMushroom = useCallback(async (mushroomId: string) => {
    try {
      await apiClient.deleteMushroom(mushroomId)
      setSavedMushrooms((prev) => prev.filter((item) => item.id !== mushroomId))
      showToast('已刪除蘑菇資料')
    } catch (err) {
      showToast(err instanceof Error ? err.message : '刪除蘑菇資料失敗')
    }
  }, [showToast])

  const selectedFlyLandmark = savedLandmarks.find((item) => item.id === selectedLandmarkId) ?? null
  const flyTargetText = flyMode === 'landmark'
    ? (selectedFlyLandmark?.name || '尚未選擇地標')
    : (parseCoordinateInput(destinationInput) ? destinationInput.trim() : '尚未輸入有效座標')

  const handleSaveLandmark = useCallback(async () => {
    setLandmarkFormTouched(true)
    const target = parseCoordinateInput(landmarkCoordInput)
    if (!target) {
      setLandmarkCoordInput('')
      showToast('座標無效，請重新輸入，例如：25.033, 121.565')
      return
    }
    const name = landmarkNameInput.trim()
    if (!name) {
      showToast('請先輸入地標名稱')
      return
    }

    try {
      setLandmarkSaving(true)
      if (editingLandmarkId) {
        const updated = await apiClient.updateLandmark(editingLandmarkId, { name, coordinate: target, landmarkType: landmarkTypeInput })
        setSavedLandmarks((prev) => prev.map((landmark) => landmark.id === updated.id ? updated : landmark))
        if (selectedLandmarkId === updated.id) {
          setDestinationInput(updated.name)
        }
        showToast('地標已更新')
      } else {
        const created = await apiClient.createLandmark({ name, coordinate: target, landmarkType: landmarkTypeInput })
        setSavedLandmarks((prev) => [created, ...prev])
        showToast('地標已儲存')
      }
      setLandmarkNameInput('')
      setLandmarkCoordInput('')
      setLandmarkTypeInput('mushroom')
      setEditingLandmarkId('')
      setLandmarkFormTouched(false)
    } catch (err) {
      showToast(err instanceof Error ? err.message : editingLandmarkId ? '更新地標失敗' : '儲存地標失敗')
    } finally {
      setLandmarkSaving(false)
    }
  }, [editingLandmarkId, landmarkCoordInput, landmarkNameInput, landmarkTypeInput, selectedLandmarkId, showToast])

  const handleEditLandmark = useCallback((landmark: SavedLandmark) => {
    setEditingLandmarkId(landmark.id)
    setLandmarkManagerTab('create')
    setLandmarkNameInput(landmark.name)
    setLandmarkCoordInput(formatCoordinate(landmark.coordinate))
    setLandmarkTypeInput(landmark.landmarkType)
    setLandmarkFormTouched(false)
  }, [])

  const handleCancelLandmarkEdit = useCallback(() => {
    setEditingLandmarkId('')
    setLandmarkNameInput('')
    setLandmarkCoordInput('')
    setLandmarkTypeInput('mushroom')
    setLandmarkFormTouched(false)
  }, [])

  const handleDeleteLandmark = useCallback(async (id: string) => {
    try {
      await apiClient.deleteLandmark(id)
      setSavedLandmarks((prev) => prev.filter((landmark) => landmark.id !== id))
    } catch (err) {
      showToast(err instanceof Error ? err.message : '刪除地標失敗')
      return
    }
    if (selectedLandmarkId === id) {
      setSelectedLandmarkId('')
    }
    if (editingLandmarkId === id) {
      handleCancelLandmarkEdit()
    }
  }, [editingLandmarkId, handleCancelLandmarkEdit, selectedLandmarkId, showToast])

  const handleExportLandmark = useCallback((landmark: SavedLandmark) => {
    const payload = {
      name: landmark.name,
      coordinate: landmark.coordinate,
      landmarkType: landmark.landmarkType,
      ...(landmark.imageUrl ? { imageUrl: landmark.imageUrl } : {}),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pikomin-landmark-${sanitizeFilename(landmark.name)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    showToast(`已匯出地標：${landmark.name}`)
  }, [showToast])

  const handleImportLandmarkFile = useCallback(async (file: File | null) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.json')) {
      showToast('檔案格式錯誤，請選擇地標 JSON 檔')
      return
    }

    try {
      const text = await file.text()
      const payload = JSON.parse(text) as LandmarkFilePayload
      const imported = normalizeImportedLandmark(payload)
      const created = await apiClient.createLandmark(imported)
      setSavedLandmarks((prev) => [created, ...prev])
      showToast(`地標已匯入：${created.name}`)
    } catch (err) {
      if (err instanceof SyntaxError) {
        showToast('檔案格式錯誤，請選擇地標 JSON 檔')
        return
      }
      showToast(err instanceof Error ? err.message : '匯入地標失敗')
    }
  }, [showToast])

  const handleAddPostcardLandmark = useCallback(async (postcard: PostcardLandmark) => {
    try {
      const created = await apiClient.createLandmark({
        name: postcard.name,
        coordinate: postcard.coordinate,
        landmarkType: 'flower',
      })
      setSavedLandmarks((prev) => {
        if (prev.some((landmark) => landmark.id === created.id)) return prev
        return [created, ...prev]
      })
      showToast(`已加入地標：${postcard.name}`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : '加入地標失敗')
    }
  }, [showToast])

  const handleSelectLandmarkToFly = useCallback((landmarkName: string) => {
    setDestinationInput(landmarkName)
    const target = savedLandmarks.find((item) => item.name === landmarkName)
    if (!target) return
    setSelectedLandmarkId(target.id)
  }, [savedLandmarks])

  const handleOpenSaveRouteModal = useCallback(() => {
    if (waypoints.length < 2) {
      showToast('路徑至少需要 2 個路徑點')
      return
    }

    setRouteNameInput('')
    setIsSaveRouteModalOpen(true)
  }, [showToast, waypoints.length])

  const handleCloseSaveRouteModal = useCallback(() => {
    if (routeSaving) return
    setIsSaveRouteModalOpen(false)
    setRouteNameInput('')
  }, [routeSaving])

  const handleConfirmSaveRoute = useCallback(async () => {
    if (routeSaving) return
    if (waypoints.length < 2) {
      showToast('路徑至少需要 2 個路徑點')
      setIsSaveRouteModalOpen(false)
      return
    }

    const name = routeNameInput.trim()
    if (!name) {
      showToast('請輸入路徑名稱')
      return
    }

    try {
      setRouteSaving(true)
      const created = await apiClient.createSavedRoute({ name, waypoints })
      setSavedRoutes((prev) => [created, ...prev])
      setIsSaveRouteModalOpen(false)
      setRouteNameInput('')
      showToast('路徑已儲存')
    } catch (err) {
      showToast(err instanceof Error ? err.message : '儲存路徑失敗')
    } finally {
      setRouteSaving(false)
    }
  }, [routeNameInput, routeSaving, showToast, waypoints])

  const handleLoadSavedRoute = useCallback((route: SavedRoute) => {
    if (routeStatus.state !== 'idle') {
      showToast('路徑執行中，請先停止後再載入')
      return
    }
    replaceWaypoints(route.waypoints)
    setWaypointStartIndex(0)
    setIsRouteOptimized(false)
    setMode('route')
    setIsRouteLibraryOpen(false)
    showToast(`已載入路徑：${route.name}`)
  }, [replaceWaypoints, routeStatus.state, showToast])

  const handleDeleteSavedRoute = useCallback(async (id: string) => {
    try {
      await apiClient.deleteSavedRoute(id)
      setSavedRoutes((prev) => prev.filter((route) => route.id !== id))
      showToast('路徑已刪除')
    } catch (err) {
      showToast(err instanceof Error ? err.message : '刪除路徑失敗')
    }
  }, [showToast])

  const handleExportSavedRoute = useCallback((route: SavedRoute) => {
    const payload = {
      name: route.name,
      waypoints: route.waypoints,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pikomin-route-${sanitizeFilename(route.name)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    showToast(`已匯出路徑：${route.name}`)
  }, [showToast])

  const handleCopySavedRouteCoordinates = useCallback(async (route: SavedRoute) => {
    const text = formatRouteCoordinates(route.waypoints)
    try {
      await navigator.clipboard.writeText(text)
      showToast(`已複製路徑座標：${route.name}`)
    } catch {
      showToast('複製失敗，請確認瀏覽器剪貼簿權限')
    }
  }, [showToast])

  const handleCopyMushroomCoordinate = useCallback(async (mushroom: SavedMushroom) => {
    const text = formatCoordinate(mushroom.coordinate)
    try {
      await navigator.clipboard.writeText(text)
      showToast(`已複製座標：${mushroom.name}`)
    } catch {
      showToast('複製失敗，請確認瀏覽器剪貼簿權限')
    }
  }, [showToast])

  const handleImportRouteFile = useCallback(async (file: File | null) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.json')) {
      showToast('檔案格式錯誤，請選擇種花路徑 JSON 檔')
      return
    }

    try {
      const text = await file.text()
      const payload = JSON.parse(text) as RouteFilePayload
      const imported = normalizeImportedRoute(payload)
      const created = await apiClient.createSavedRoute(imported)
      setSavedRoutes((prev) => [created, ...prev])
      showToast('路徑已匯入，可從讀取路徑選擇')
    } catch (err) {
      if (err instanceof SyntaxError) {
        showToast('檔案格式錯誤，請選擇種花路徑 JSON 檔')
        return
      }
      showToast(err instanceof Error ? err.message : '匯入路徑失敗')
    }
  }, [showToast])

  const currentPosition = routeStatus.currentPosition ?? myPosition
  const handleSwitchFlyMode = useCallback((nextMode: FlyMode) => {
    if (nextMode === flyMode) return
    setFlyMode(nextMode)
    setDestinationInput('')
    setSelectedLandmarkId('')
  }, [flyMode])

  const showDisconnectBanner = !isLoading && selectedDevice === null
  const trimmedLandmarkName = landmarkNameInput.trim()
  const parsedLandmarkCoord = parseCoordinateInput(landmarkCoordInput)
  const nameError = landmarkFormTouched && !trimmedLandmarkName ? '請輸入地標名稱' : ''
  const coordError = landmarkFormTouched && !parsedLandmarkCoord ? '座標格式錯誤，請用 25.033, 121.565' : ''
  const isLandmarkFormValid = Boolean(trimmedLandmarkName && parsedLandmarkCoord)
  const normalizedSearchKeyword = landmarkSearchInput.trim().toLowerCase()
  const isMushroomTypeFilter = landmarkTypeFilter === 'giant' || landmarkTypeFilter === 'element'
  const filteredLandmarks = savedLandmarks.filter((landmark) => {
    if (isMushroomTypeFilter) return false
    const typeMatched = landmark.landmarkType === landmarkTypeFilter
    if (!normalizedSearchKeyword) return typeMatched
    const nameMatched = landmark.name.toLowerCase().includes(normalizedSearchKeyword)
    const coordText = formatCoordinate(landmark.coordinate).toLowerCase()
    const coordMatched = coordText.includes(normalizedSearchKeyword)
    return typeMatched && (nameMatched || coordMatched)
  })
  const landmarkPageCount = Math.max(1, Math.ceil(filteredLandmarks.length / LANDMARKS_PER_PAGE))
  const safeLandmarkPage = Math.min(landmarkPage, landmarkPageCount)
  const pagedLandmarks = filteredLandmarks.slice(
    (safeLandmarkPage - 1) * LANDMARKS_PER_PAGE,
    safeLandmarkPage * LANDMARKS_PER_PAGE,
  )
  const normalizedRouteSearchKeyword = routeSearchInput.trim().toLowerCase()
  const filteredSavedRoutes = savedRoutes.filter((route) => {
    if (!normalizedRouteSearchKeyword) return true
    return route.name.toLowerCase().includes(normalizedRouteSearchKeyword)
  })
  const routePageCount = Math.max(1, Math.ceil(filteredSavedRoutes.length / ROUTES_PER_PAGE))
  const safeRoutePage = Math.min(routePage, routePageCount)
  const pagedSavedRoutes = filteredSavedRoutes.slice(
    (safeRoutePage - 1) * ROUTES_PER_PAGE,
    safeRoutePage * ROUTES_PER_PAGE,
  )
  const trimmedMushroomName = mushroomNameInput.trim()
  const parsedMushroomCoord = parseCoordinateInput(mushroomCoordInput)
  const trimmedMushroomSlots = mushroomSlotsInput.trim()
  const parsedMushroomSlotsValue = trimmedMushroomSlots ? Number.parseInt(trimmedMushroomSlots, 10) : Number.NaN
  const mushroomSlotsInvalid = Boolean(trimmedMushroomSlots) && (
    !Number.isInteger(parsedMushroomSlotsValue) ||
    parsedMushroomSlotsValue < 0 ||
    parsedMushroomSlotsValue > 5
  )
  const shouldShowMushroomTimeInput = Boolean(trimmedMushroomSlots) && !mushroomSlotsInvalid && parsedMushroomSlotsValue < 5
  const trimmedMushroomDays = mushroomDaysInput.trim()
  const trimmedMushroomHours = mushroomHoursInput.trim()
  const trimmedMushroomMinutes = mushroomMinutesInput.trim()
  const parsedMushroomDaysValue = trimmedMushroomDays ? Number.parseInt(trimmedMushroomDays, 10) : 0
  const parsedMushroomHoursValue = trimmedMushroomHours ? Number.parseInt(trimmedMushroomHours, 10) : 0
  const parsedMushroomMinutesValue = trimmedMushroomMinutes ? Number.parseInt(trimmedMushroomMinutes, 10) : Number.NaN
  const mushroomTimeInvalid = shouldShowMushroomTimeInput && (
    (Boolean(trimmedMushroomDays) && (!Number.isInteger(parsedMushroomDaysValue) || parsedMushroomDaysValue < 0)) ||
    (Boolean(trimmedMushroomHours) && (!Number.isInteger(parsedMushroomHoursValue) || parsedMushroomHoursValue < 0 || parsedMushroomHoursValue > 23)) ||
    !Number.isInteger(parsedMushroomMinutesValue) ||
    parsedMushroomMinutesValue < 0 ||
    parsedMushroomMinutesValue > 59 ||
    (parsedMushroomDaysValue * 1440 + parsedMushroomHoursValue * 60 + parsedMushroomMinutesValue <= 0)
  )
  const mushroomNameError = mushroomFormTouched && !trimmedMushroomName ? '請輸入蘑菇名稱' : ''
  const mushroomCoordError = mushroomFormTouched && !parsedMushroomCoord ? '座標格式錯誤，請用 25.033, 121.565' : ''
  const mushroomSlotsError = mushroomFormTouched && mushroomSlotsInvalid ? '空位請輸入 0 到 5' : ''
  const mushroomTimeError = mushroomFormTouched && mushroomTimeInvalid ? '剩餘時間請輸入有效的日、時、分，且至少 1 分鐘' : ''
  const isMushroomFormValid = Boolean(trimmedMushroomName && parsedMushroomCoord && !mushroomSlotsInvalid && !mushroomTimeInvalid)
  const giantMushrooms = savedMushrooms.filter((item) => item.mushroomType === 'giant')
  const elementMushrooms = savedMushrooms.filter((item) => item.mushroomType === 'element')
  const filteredMushroomSearchResults = savedMushrooms.filter((mushroom) => {
    if (!isMushroomTypeFilter) return false
    if (landmarkTypeFilter === 'giant' && mushroom.mushroomType !== 'giant') return false
    if (landmarkTypeFilter === 'element' && mushroom.mushroomType !== 'element') return false
    if (!normalizedSearchKeyword) return true
    const nameMatched = mushroom.name.toLowerCase().includes(normalizedSearchKeyword)
    const coordMatched = formatCoordinate(mushroom.coordinate).toLowerCase().includes(normalizedSearchKeyword)
    const tagMatched = getMushroomTag(mushroom).toLowerCase().includes(normalizedSearchKeyword)
    return nameMatched || coordMatched || tagMatched
  })
  const activeMushroomTotal = landmarkTypeFilter === 'giant' ? giantMushrooms.length : elementMushrooms.length
  const canEditRouteWaypoints = mode === 'route' && (
    routeStatus.state === 'idle' ||
    routeStatus.state === 'paused'
  )
  const allPostcardFiltersEnabled = POSTCARD_FILTERS.every((filter) => postcardFilters[filter.id])
  const visiblePostcards = showPostcards && mapBounds
    ? filterPostcardsInBounds(postcards, mapBounds, postcardFilters)
    : []
  const routeCycleSeconds = isRouteOptimized && waypoints.length >= 3
    ? cycleDistance(waypoints) / (20 / 3.6)
    : null
  const shouldShowRouteLine = mode === 'route' &&
    waypoints.length >= 3 &&
    (isRouteOptimized || routeStatus.state === 'moving' || routeStatus.state === 'paused')

  const mushroomManagementSection = (
    mushroomManagerTab === 'createGiant' || mushroomManagerTab === 'createElement' ? (
      <section className="modal-section mushroom-create-panel">
        <label className="field">
          <span>名稱</span>
          <input
            value={mushroomNameInput}
            onChange={(e) => setMushroomNameInput(e.target.value)}
            onBlur={() => setMushroomFormTouched(true)}
            placeholder={mushroomManagerTab === 'createGiant' ? '例如：中央公園巨菇' : '例如：水晶菇集合點'}
            aria-invalid={Boolean(mushroomNameError)}
          />
          {mushroomNameError && <p className="helper-text helper-text--error">{mushroomNameError}</p>}
        </label>
        <label className="field">
          <span>座標</span>
          <input
            value={mushroomCoordInput}
            onChange={(e) => setMushroomCoordInput(e.target.value)}
            onBlur={() => setMushroomFormTouched(true)}
            placeholder="例如：(46.7608330, 8.6511050)"
            aria-invalid={Boolean(mushroomCoordError)}
          />
          {mushroomCoordError && <p className="helper-text helper-text--error">{mushroomCoordError}</p>}
        </label>
        {mushroomManagerTab === 'createElement' && (
          <label className="field">
            <span>元素類型</span>
            <select value={mushroomElementInput} onChange={(e) => setMushroomElementInput(e.target.value as MushroomElementType)}>
              {MUSHROOM_ELEMENT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
        )}
        <label className="field">
          <span>剩餘空位（選填）</span>
          <input
            value={mushroomSlotsInput}
            onChange={(e) => setMushroomSlotsInput(e.target.value)}
            onBlur={() => setMushroomFormTouched(true)}
            inputMode="numeric"
            placeholder="0 到 5，不填則直接倒數到凌晨 2 點"
            aria-invalid={Boolean(mushroomSlotsError)}
          />
          {mushroomSlotsError && <p className="helper-text helper-text--error">{mushroomSlotsError}</p>}
        </label>
        {shouldShowMushroomTimeInput && (
          <label className="field">
            <span>剩餘時間（日 / 時 / 分，分必填）</span>
            <div className="mushroom-time-grid">
              <label>
                <span>日</span>
                <input
                  value={mushroomDaysInput}
                  onChange={(e) => setMushroomDaysInput(e.target.value)}
                  onBlur={() => setMushroomFormTouched(true)}
                  inputMode="numeric"
                  placeholder="0"
                  aria-invalid={Boolean(mushroomTimeError)}
                />
              </label>
              <label>
                <span>時</span>
                <input
                  value={mushroomHoursInput}
                  onChange={(e) => setMushroomHoursInput(e.target.value)}
                  onBlur={() => setMushroomFormTouched(true)}
                  inputMode="numeric"
                  placeholder="0"
                  aria-invalid={Boolean(mushroomTimeError)}
                />
              </label>
              <label>
                <span>分</span>
                <input
                  value={mushroomMinutesInput}
                  onChange={(e) => setMushroomMinutesInput(e.target.value)}
                  onBlur={() => setMushroomFormTouched(true)}
                  inputMode="numeric"
                  placeholder="至少 1"
                  aria-invalid={Boolean(mushroomTimeError)}
                />
              </label>
            </div>
            {mushroomTimeError && <p className="helper-text helper-text--error">{mushroomTimeError}</p>}
          </label>
        )}
        <div className="mushroom-form-preview">
          <span className={`mushroom-tag ${mushroomManagerTab === 'createGiant' ? 'is-giant' : 'is-element'}`}>
            {mushroomManagerTab === 'createGiant' ? '巨菇' : `${elementLabelMap[mushroomElementInput]}菇`}
          </span>
          <small>{shouldShowMushroomTimeInput ? '空位少於 5 時需填剩餘時間，會換算成總分鐘。' : '未填空位時，會預設倒數到下一個凌晨 2 點。'}</small>
        </div>
        <button
          className="primary-button"
          onClick={() => void handleCreateMushroom(mushroomManagerTab === 'createElement' ? 'element' : 'giant')}
          disabled={!isMushroomFormValid || mushroomSaving}
          type="button"
        >
          {mushroomSaving ? '新增中...' : `新增${mushroomManagerTab === 'createElement' ? '元素菇' : '巨菇'}`}
        </button>
      </section>
    ) : (
      <section className="modal-section mushroom-list-panel">
        <div className="landmark-section-head">
          <span>{mushroomManagerTab === 'giantList' ? '巨菇列表' : '元素菇列表'}</span>
          <small>{mushroomManagerTab === 'giantList' ? giantMushrooms.length : elementMushrooms.length} 筆</small>
        </div>
        {(mushroomManagerTab === 'giantList' ? giantMushrooms : elementMushrooms).length === 0 ? (
          <p className="landmark-empty">目前還沒有{mushroomManagerTab === 'giantList' ? '巨菇' : '元素菇'}資料。</p>
        ) : (
          <div className="mushroom-list">
            {(mushroomManagerTab === 'giantList' ? giantMushrooms : elementMushrooms).map((mushroom) => (
              <div key={mushroom.id} className="mushroom-item">
                <div className="mushroom-item-main">
                  <div className="mushroom-title-row">
                    <div className="mushroom-name-group">
                      <strong>{mushroom.name}</strong>
                      <span className={`mushroom-tag ${mushroom.mushroomType === 'giant' ? 'is-giant' : 'is-element'}`}>{getMushroomTag(mushroom)}</span>
                    </div>
                  </div>
                  <span>{formatCoordinate(mushroom.coordinate)}</span>
                  <div className="mushroom-meta-row">
                    {mushroom.remainingSlots !== null && mushroom.remainingSlots !== undefined && (
                      <small>{mushroom.remainingSlots} 空位</small>
                    )}
                  </div>
                </div>
                <small className="mushroom-countdown">倒數 {formatMushroomCountdown(mushroom.expiresAt, nowMs)}</small>
                <div className="mushroom-actions">
                  <button
                    className="icon-button mushroom-fly-button"
                    onClick={() => void handleFlyToMushroom(mushroom)}
                    disabled={isFlying}
                    aria-label={`飛行到 ${mushroom.name}`}
                    title={`飛行到 ${mushroom.name}`}
                    type="button"
                  >
                    <Send aria-hidden="true" size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    className="icon-button"
                    onClick={() => void handleCopyMushroomCoordinate(mushroom)}
                    aria-label={`複製座標：${mushroom.name}`}
                    title={`複製 ${mushroom.name} 座標`}
                    type="button"
                  >
                    <Copy aria-hidden="true" size={16} strokeWidth={2.4} />
                  </button>
                  <button
                    className="icon-button danger"
                    onClick={() => void handleDeleteMushroom(mushroom.id)}
                    aria-label={`刪除蘑菇資料：${mushroom.name}`}
                    title={`刪除 ${mushroom.name}`}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" size={16} strokeWidth={2.4} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    )
  )

  return (
    <div className="app-shell">
      <section className="map-stage map-stage-full">
        <MapInterface
          mode={mode}
          currentPosition={currentPosition}
          viewTarget={viewTarget}
          waypoints={waypoints}
          waypointStartIndex={waypointStartIndex}
          showRouteLine={shouldShowRouteLine}
          savedLandmarks={savedLandmarks}
          savedMushrooms={savedMushrooms}
          mushroomNowMs={nowMs}
          postcardLandmarks={visiblePostcards}
          showPostcards={showPostcards}
          onViewportChange={setMapBounds}
          onPostcardAddLandmark={handleAddPostcardLandmark}
          onPostcardAction={showToast}
          onMapClick={handleMapClick}
          onWaypointMove={handleUpdateWaypoint}
          onWaypointRemove={(index) => {
            handleRemoveWaypoint(index)
            setWaypointStartIndex(0)
            setIsRouteOptimized(false)
          }}
          onWaypointSetAsStart={(index) => {
            if (index <= 0 || index >= waypoints.length) return
            setWaypointStartIndex(index)
            setIsRouteOptimized(false)
          }}
          onWaypointSetAsEnd={(index) => {
            if (index < 0 || index >= waypoints.length - 1) return
            setWaypointStartIndex((index + 1) % waypoints.length)
            setIsRouteOptimized(false)
          }}
          canEditWaypoints={canEditRouteWaypoints}
        />
      </section>

      {showPostcards && (
        <div className="postcard-filter-toolbar" aria-label="明信片類型篩選">
          <button
            type="button"
            className={`postcard-filter-chip${allPostcardFiltersEnabled ? ' is-active' : ''}`}
            aria-pressed={allPostcardFiltersEnabled}
            aria-label="顯示全部類型明信片"
            title="全部"
            onClick={() => setPostcardFilters(INITIAL_POSTCARD_FILTERS)}
          >
            <Layers3 aria-hidden="true" size={18} strokeWidth={2.4} />
          </button>
          {POSTCARD_FILTERS.map((filter) => {
            const icon = filter.id === 'temple'
              ? <TempleIcon />
              : filter.id === 'transformer'
                ? <Zap aria-hidden="true" size={18} strokeWidth={2.5} />
                : filter.id === 'church'
                  ? <Church aria-hidden="true" size={18} strokeWidth={2.4} />
                  : <Trees aria-hidden="true" size={18} strokeWidth={2.4} />
            return (
              <button
                key={filter.id}
                type="button"
                className={`postcard-filter-chip${postcardFilters[filter.id] ? ' is-active' : ''}`}
                aria-pressed={postcardFilters[filter.id]}
                aria-label={`${postcardFilters[filter.id] ? '隱藏' : '顯示'}${filter.label}明信片`}
                title={filter.label}
                onClick={() => setPostcardFilters((current) => togglePostcardFilter(current, filter.id))}
              >
                {icon}
              </button>
            )
          })}
          <button
            type="button"
            className={`postcard-filter-chip postcard-scan-button${isScanningPostcards ? ' is-loading' : ''}`}
            aria-label="掃描目前畫面明信片"
            title="掃描目前畫面"
            disabled={isScanningPostcards}
            onClick={() => void handleScanPostcards()}
          >
            {isScanningPostcards ? (
              <Loader2 aria-hidden="true" size={18} strokeWidth={2.4} />
            ) : (
              <Radar aria-hidden="true" size={18} strokeWidth={2.4} />
            )}
          </button>
        </div>
      )}

      <div className="overlay-shell">
        <main className="workspace workspace-overlay">
          {!showPostcards && (
          <aside className="sidebar sidebar-floating">
          <section className="panel panel-hero">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">
                  裝置與狀態
                  <span className="version-badge">v{__APP_VERSION__}</span>
                </p>
                <h2>
                  {currentPosition ? formatCoordinate(currentPosition) : '尚未設定定位座標'}
                  {showDisconnectBanner && (
                    <span className="disconnect-status">
                      <span className="inline-alert">未偵測到裝置</span>
                      <button
                        className="inline-help-button"
                        onClick={() => setIsDisconnectHelpOpen(true)}
                        aria-label="顯示未偵測到裝置指引"
                        title="顯示未偵測到裝置指引"
                        type="button"
                      >
                        <HelpCircle aria-hidden="true" size={14} strokeWidth={2.4} />
                      </button>
                    </span>
                  )}
                </h2>
              </div>
            </div>

            <DeviceStatus
              devices={devices}
              selectedDevice={selectedDevice}
              onSelectDevice={selectDevice}
              isLoading={isLoading}
              error={error}
            />

            <label className="field">
              <span>操作模式</span>
              <div className="mode-control-row">
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as Mode)}
                  aria-label="操作模式"
                >
                  <option value="single">單點定位</option>
                  <option value="route">路徑模式</option>
                </select>
                <div className="mode-field-actions">
                  <button
                    className={`icon-button mode-action-button${isMapClickArmed ? ' is-active' : ''}`}
                    onClick={handleToggleMapClickArmed}
                    aria-label={isMapClickArmed ? '關閉點圖生效' : '開啟點圖生效'}
                    aria-pressed={isMapClickArmed}
                    title={isMapClickArmed ? '點圖生效中' : '點圖已鎖定'}
                    type="button"
                  >
                    {isMapClickArmed ? (
                      <MousePointerClick aria-hidden="true" size={16} strokeWidth={2.4} />
                    ) : (
                      <Lock aria-hidden="true" size={16} strokeWidth={2.4} />
                    )}
                  </button>
                  <button
                    className="icon-button mode-action-button"
                    onClick={() => setIsManageModalOpen(true)}
                    aria-label="位置設定"
                    title="位置設定"
                    type="button"
                  >
                    <Map aria-hidden="true" size={16} strokeWidth={2.4} />
                  </button>
                </div>
              </div>
            </label>
            <p className="helper-text" aria-live="polite">
              {!isMapClickArmed
                ? '地圖點擊目前已鎖定，開啟「點圖生效」後才會寫入位置或新增路徑點'
                : mode === 'single'
                  ? '點擊地圖直接移動裝置定位'
                : '點擊地圖加入路徑點'}
            </p>

            <div className="inline-route-panel">
              <RoutePanel
                waypoints={waypoints}
                routeStatus={routeStatus}
                isRouteOptimized={isRouteOptimized}
                routeCycleDuration={routeCycleSeconds === null ? null : formatDuration(routeCycleSeconds)}
                onOptimizeRoute={handleOptimizeRoute}
                onStartRoute={handleStartRoute}
                onPauseRoute={handlePauseRoute}
                onResumeRoute={handleResumeRoute}
                onStopRoute={handleStopRoute}
              />
            </div>
          </section>
          </aside>
          )}
        </main>

        <aside className="route-data-sidebar">
          <section className="route-data-panel">
            <div className="route-toolbar" aria-label="路徑工具">
              <button
                className={`icon-button route-toolbar-button${showPostcards ? ' is-active' : ''}`}
                onClick={() => setShowPostcards((current) => !current)}
                aria-label={showPostcards ? `關閉明信片圖層，目前顯示 ${visiblePostcards.length} 張` : '開啟明信片圖層'}
                aria-pressed={showPostcards}
                title={showPostcards ? `明信片：${visiblePostcards.length} 張` : '明信片圖層'}
                type="button"
              >
                <Mail aria-hidden="true" size={28} strokeWidth={3} />
              </button>
              <button
                className="icon-button route-toolbar-button"
                onClick={() => {
                  setManagerTab('landmarks')
                  setLandmarkManagerTab('giantList')
                  setMushroomManagerTab('giantList')
                  setIsMushroomOnlyManager(true)
                  setIsLandmarkManagerOpen(true)
                }}
                aria-label={`開啟蘑菇資料，共 ${savedMushrooms.length} 筆`}
                title={`蘑菇資料：${savedMushrooms.length} 筆`}
                type="button"
              >
                <Trees aria-hidden="true" size={22} strokeWidth={2.8} />
              </button>
              {mode === 'route' && routeStatus.state === 'idle' && (
                  <>
                    {waypoints.length > 0 && (
                      <button
                        className="icon-button route-toolbar-button"
                        onClick={handleOpenSaveRouteModal}
                        disabled={routeSaving}
                        aria-label="儲存目前路徑"
                        title="儲存目前路徑"
                        type="button"
                      >
                        <Save aria-hidden="true" size={16} strokeWidth={2.4} />
                      </button>
                    )}
                    <button
                      className="icon-button route-toolbar-button"
                      onClick={() => routeImportInputRef.current?.click()}
                      aria-label="匯入路徑"
                      title="匯入路徑"
                      type="button"
                    >
                      <FileInput aria-hidden="true" size={16} strokeWidth={2.4} />
                    </button>
                    <button
                      className="icon-button route-toolbar-button"
                      onClick={() => setIsRouteLibraryOpen(true)}
                      aria-label="讀取路徑"
                      title="讀取路徑"
                      type="button"
                    >
                      <FolderOpen aria-hidden="true" size={16} strokeWidth={2.4} />
                    </button>
                    {waypoints.length > 0 && (
                      <button
                        className="icon-button danger route-toolbar-button"
                        onClick={() => {
                          clearWaypoints()
                          setWaypointStartIndex(0)
                          setIsRouteOptimized(false)
                        }}
                        aria-label="清除全部路徑點"
                        title="清除全部路徑點"
                        type="button"
                      >
                        <Trash2 aria-hidden="true" size={16} strokeWidth={2.4} />
                      </button>
                    )}
                  </>
              )}
              <input
                ref={routeImportInputRef}
                className="sr-only"
                type="file"
                accept="application/json,.json"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  void handleImportRouteFile(file)
                  e.currentTarget.value = ''
                }}
              />
            </div>
          </section>
        </aside>
      </div>

      <div className="toast-container" role="status" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast ${toast.message.startsWith('✅') ? 'is-success' : ''}`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {isManageModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsManageModalOpen(false)}>
          <div className="modal-panel fly-settings-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>位置資訊設定</h3>
            </div>
            <div className="modal-body">
              <section className="modal-section">
                <button className="primary-button" onClick={handleLocateMe} disabled={isLocating}>
                  {isLocating ? '定位中...' : '重新取得目前位置'}
                </button>
                <button
                  className="ghost-button modal-stack-button"
                  onClick={() => {
                    setManagerTab('landmarks')
                    setIsMushroomOnlyManager(false)
                    setIsLandmarkManagerOpen(true)
                  }}
                >
                  地標 / 路徑管理
                </button>
                <button className="secondary-button modal-stack-button" onClick={() => setIsFlySettingsOpen(true)}>飛行設定</button>
                <p className="helper-text">已儲存 {savedLandmarks.length} 個地標，可在飛行設定中直接搜尋。</p>
              </section>
            </div>
          </div>
        </div>
      )}

      {isDisconnectHelpOpen && (
        <div className="modal-backdrop" onClick={() => setIsDisconnectHelpOpen(false)}>
          <div className="modal-panel modal-panel-narrow" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>裝置連線指引</h3>
            </div>
            <div className="modal-body">
              <p className="helper-text">未偵測到裝置，請用 USB 連接 iPhone 並確認 tunnel 已啟動。</p>
              <button
                className="primary-button"
                onClick={() => setIsDisconnectHelpOpen(false)}
                type="button"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {isSaveRouteModalOpen && (
        <div className="modal-backdrop" onClick={handleCloseSaveRouteModal}>
          <div className="modal-panel modal-panel-narrow" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>儲存路徑</h3>
            </div>
            <div className="modal-body">
              <label className="field">
                <span>路徑名稱</span>
                <input
                  value={routeNameInput}
                  onChange={(e) => setRouteNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleConfirmSaveRoute()
                    if (e.key === 'Escape') handleCloseSaveRouteModal()
                  }}
                  placeholder="例如：機場巡點 A"
                  disabled={routeSaving}
                  autoFocus
                />
              </label>
              <p className="helper-text">目前路徑共有 {waypoints.length} 個路徑點。</p>
              <div className="modal-actions">
                <button
                  className="ghost-button"
                  onClick={handleCloseSaveRouteModal}
                  disabled={routeSaving}
                  type="button"
                >
                  取消
                </button>
                <button
                  className="primary-button"
                  onClick={() => void handleConfirmSaveRoute()}
                  disabled={routeSaving || !routeNameInput.trim()}
                  type="button"
                >
                  {routeSaving ? '儲存中...' : '確認儲存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRouteLibraryOpen && (
        <div className="modal-backdrop" onClick={() => setIsRouteLibraryOpen(false)}>
          <div className="modal-panel route-library-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header route-library-header">
              <div>
                <p className="panel-kicker">已儲存路徑</p>
                <h3>讀取路徑</h3>
              </div>
              <span className="route-count-pill">{savedRoutes.length} 筆</span>
            </div>
            <div className="modal-body">
              {savedRoutes.length === 0 ? (
                <p className="route-empty">還沒有儲存路徑，先儲存目前路徑或匯入路徑檔案。</p>
              ) : (
                <div className="saved-route-list route-library-list">
                  {savedRoutes.map((route) => (
                    <div key={route.id} className="saved-route-item">
                      <button
                        className="saved-route-main"
                        onClick={() => handleLoadSavedRoute(route)}
                        disabled={routeStatus.state !== 'idle'}
                        type="button"
                      >
                        <strong>{route.name}</strong>
                        <span>{route.waypoints.length} 個路徑點</span>
                      </button>
                      <div className="saved-route-actions">
                        <button
                          className="icon-button"
                          onClick={() => handleLoadSavedRoute(route)}
                          disabled={routeStatus.state !== 'idle'}
                          aria-label={`載入路徑：${route.name}`}
                          title={`載入路徑：${route.name}`}
                          type="button"
                        >
                          <FolderOpen aria-hidden="true" size={16} strokeWidth={2.4} />
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => void handleCopySavedRouteCoordinates(route)}
                          aria-label={`複製路徑座標：${route.name}`}
                          title={`複製路徑座標：${route.name}`}
                          type="button"
                        >
                          <Copy aria-hidden="true" size={16} strokeWidth={2.4} />
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => handleExportSavedRoute(route)}
                          aria-label={`匯出路徑：${route.name}`}
                          title={`匯出路徑：${route.name}`}
                          type="button"
                        >
                          <Download aria-hidden="true" size={16} strokeWidth={2.4} />
                        </button>
                        <button
                          className="icon-button danger"
                          onClick={() => void handleDeleteSavedRoute(route.id)}
                          aria-label={`刪除路徑：${route.name}`}
                          title={`刪除路徑：${route.name}`}
                          type="button"
                        >
                          <Trash2 aria-hidden="true" size={16} strokeWidth={2.4} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isFlySettingsOpen && (
        <div className="modal-backdrop" onClick={() => setIsFlySettingsOpen(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>飛行設定</h3></div>
            <div className="modal-body modal-body-split fly-settings-layout">
              <section className="modal-section">
                <div className="field">
                  <span>輸入方式</span>
                  <div className="segmented-control" role="tablist" aria-label="飛行輸入方式">
                    <button type="button" className={flyMode === 'coordinate' ? 'is-active' : ''} onClick={() => handleSwitchFlyMode('coordinate')}>座標輸入</button>
                    <button type="button" className={flyMode === 'landmark' ? 'is-active' : ''} onClick={() => handleSwitchFlyMode('landmark')}>已儲存地標</button>
                  </div>
                </div>
                <label className="field">
                  <span>目的地</span>
                  <div className="field-inline flow-row">
                    {flyMode === 'coordinate' ? (
                      <input value={destinationInput} onChange={(e) => setDestinationInput(e.target.value)} placeholder="例如：25.033, 121.565" />
                    ) : (
                      <input value={destinationInput} onChange={(e) => setDestinationInput(e.target.value)} placeholder="從右側點選地標或輸入名稱" />
                    )}
                    <button className="accent-button" onClick={() => void handleFlyTo()} disabled={isFlying}>
                      {isFlying ? '執行中' : '飛行'}
                    </button>
                  </div>
                </label>
                <p className="helper-text">將飛往：{flyTargetText}</p>
              </section>
              {flyMode === 'landmark' && (
                <section className="modal-section landmark-browser">
                  <div className="landmark-toolbar">
                    <label className="field landmark-search-field">
                      <span>搜尋地標</span>
                      <input
                        value={landmarkSearchInput}
                        onChange={(e) => setLandmarkSearchInput(e.target.value)}
                        placeholder="輸入名稱或座標快速搜尋"
                      />
                    </label>
                    <div className="field">
                      <span>篩選</span>
                      <div className="segmented-control" role="tablist" aria-label="地標類型篩選">
                        {LANDMARK_TYPE_FILTERS.map((filter) => (
                          <button
                            key={filter.id}
                            type="button"
                            className={landmarkTypeFilter === filter.id ? 'is-active' : ''}
                            onClick={() => setLandmarkTypeFilter(filter.id)}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="landmark-section-head">
                    <span>{isMushroomTypeFilter ? (landmarkTypeFilter === 'giant' ? '巨菇資料' : '元素菇資料') : '已新增地標'}</span>
                    <small>
                      {isMushroomTypeFilter
                        ? `${filteredMushroomSearchResults.length} / ${activeMushroomTotal} 筆`
                        : `${filteredLandmarks.length} / ${savedLandmarks.length} 筆`}
                    </small>
                  </div>
                  {isMushroomTypeFilter ? (
                    activeMushroomTotal === 0 ? (
                      <p className="landmark-empty">目前還沒有{landmarkTypeFilter === 'giant' ? '巨菇' : '元素菇'}資料，先到「地標管理」新增一筆。</p>
                    ) : filteredMushroomSearchResults.length === 0 ? (
                      <p className="landmark-empty">找不到符合條件的{landmarkTypeFilter === 'giant' ? '巨菇' : '元素菇'}資料，請調整搜尋關鍵字。</p>
                    ) : (
                      <div className="mushroom-list fly-mushroom-list">
                        {filteredMushroomSearchResults.map((mushroom) => (
                          <div key={mushroom.id} className="mushroom-item">
                            <div className="mushroom-item-main">
                              <div className="mushroom-title-row">
                                <div className="mushroom-name-group">
                                  <strong>{mushroom.name}</strong>
                                  <span className={`mushroom-tag ${mushroom.mushroomType === 'giant' ? 'is-giant' : 'is-element'}`}>{getMushroomTag(mushroom)}</span>
                                </div>
                              </div>
                              <span>{formatCoordinate(mushroom.coordinate)}</span>
                              <div className="mushroom-meta-row">
                                {mushroom.remainingSlots !== null && mushroom.remainingSlots !== undefined && (
                                  <small>{mushroom.remainingSlots} 空位</small>
                                )}
                              </div>
                            </div>
                            <small className="mushroom-countdown">倒數 {formatMushroomCountdown(mushroom.expiresAt, nowMs)}</small>
                            <div className="mushroom-actions">
                              <button
                                className="icon-button mushroom-fly-button"
                                onClick={() => void handleFlyToMushroom(mushroom)}
                                disabled={isFlying}
                                aria-label={`飛行到 ${mushroom.name}`}
                                title={`飛行到 ${mushroom.name}`}
                                type="button"
                              >
                                <Send aria-hidden="true" size={16} strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : savedLandmarks.length === 0 ? (
                    <p className="landmark-empty">目前還沒有地標，先到「地標管理」新增一筆。</p>
                  ) : filteredLandmarks.length === 0 ? (
                    <p className="landmark-empty">找不到符合條件的地標，請調整搜尋關鍵字。</p>
                  ) : (
                    <>
                      <div className="landmark-edit-list fly-landmark-list">
                        {pagedLandmarks.map((landmark) => (
                          <div key={landmark.id} className={`landmark-edit-item${destinationInput.trim() === landmark.name ? ' is-editing' : ''}`}>
                            <div className="landmark-edit-content">
                              {landmark.imageUrl ? (
                                <button
                                  className="landmark-thumb-button"
                                  onClick={() => setPreviewLandmark(landmark)}
                                  type="button"
                                  aria-label={`放大查看 ${landmark.name} 的圖片`}
                                  title={`放大查看 ${landmark.name}`}
                                >
                                  <img
                                    src={landmark.imageUrl}
                                    alt={`${landmark.name} 縮圖`}
                                    loading="lazy"
                                    onError={(event) => {
                                      event.currentTarget.style.display = 'none'
                                      event.currentTarget.parentElement?.classList.add('is-image-missing')
                                    }}
                                  />
                                  <span className="landmark-thumb-zoom" aria-hidden="true">
                                    <ZoomIn size={13} strokeWidth={2.6} />
                                  </span>
                                </button>
                              ) : (
                                <span className="landmark-thumb-placeholder" title="這筆地標沒有圖片資料" aria-label="沒有圖片資料">
                                  無圖
                                </span>
                              )}
                              <button className="landmark-edit-main" onClick={() => handleSelectLandmarkToFly(landmark.name)} type="button">
                                <strong>{landmark.name}</strong>
                              </button>
                            </div>
                            <button
                              className="ghost-button fly-landmark-select"
                              onClick={() => handleSelectLandmarkToFly(landmark.name)}
                              type="button"
                            >
                              選取
                            </button>
                          </div>
                        ))}
                      </div>
                      {landmarkPageCount > 1 && (
                        <div className="landmark-pagination" aria-label="地標分頁">
                          <button
                            className="ghost-button"
                            type="button"
                            onClick={() => setLandmarkPage((page) => Math.max(1, page - 1))}
                            disabled={safeLandmarkPage <= 1}
                          >
                            上一頁
                          </button>
                          <span>{safeLandmarkPage} / {landmarkPageCount}</span>
                          <button
                            className="ghost-button"
                            type="button"
                            onClick={() => setLandmarkPage((page) => Math.min(landmarkPageCount, page + 1))}
                            disabled={safeLandmarkPage >= landmarkPageCount}
                          >
                            下一頁
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>
      )}

      {isLandmarkManagerOpen && (
        <div className="modal-backdrop" onClick={() => setIsLandmarkManagerOpen(false)}>
          <div className="modal-panel landmark-manager-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header manager-modal-header">
              <h3>{isMushroomOnlyManager ? '蘑菇資料' : '地標 / 路徑管理'}</h3>
              {!isMushroomOnlyManager && (
                <div className="segmented-control manager-tabs" role="tablist" aria-label="管理類型">
                  <button
                    type="button"
                    className={managerTab === 'landmarks' ? 'is-active' : ''}
                    onClick={() => setManagerTab('landmarks')}
                  >
                    地標
                  </button>
                  <button
                    type="button"
                    className={managerTab === 'routes' ? 'is-active' : ''}
                    onClick={() => setManagerTab('routes')}
                  >
                    路徑
                  </button>
                </div>
              )}
            </div>
            {managerTab === 'landmarks' ? (
              <div className="modal-body landmark-manager-layout">
                <div className="segmented-control landmark-subtabs" role="tablist" aria-label="地標管理功能">
                  {(isMushroomOnlyManager
                    ? (['giantList', 'elementList'] as LandmarkManagerTab[])
                    : (['create', 'search', 'createGiant', 'createElement', 'giantList', 'elementList'] as LandmarkManagerTab[])
                  ).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      className={landmarkManagerTab === tab ? 'is-active' : ''}
                      onClick={() => {
                        setLandmarkManagerTab(tab)
                        if (tab !== 'create' && tab !== 'search') {
                          setMushroomManagerTab(tab)
                        }
                      }}
                    >
                      {LANDMARK_MANAGER_TAB_LABELS[tab]}
                    </button>
                  ))}
                </div>
                {landmarkManagerTab === 'create' ? (
                  <section className="modal-section landmark-create-panel">
                    {editingLandmarkId && <p className="helper-text editing-hint">正在編輯已儲存地標</p>}
                    <label className="field">
                      <span>名稱</span>
                      <input
                        value={landmarkNameInput}
                        onChange={(e) => setLandmarkNameInput(e.target.value)}
                        onBlur={() => setLandmarkFormTouched(true)}
                        placeholder="例如：台北車站"
                        aria-invalid={Boolean(nameError)}
                      />
                      {nameError && <p className="helper-text helper-text--error">{nameError}</p>}
                    </label>
                    <label className="field">
                      <span>座標</span>
                      <div className="field-inline flow-row">
                        <input
                          value={landmarkCoordInput}
                          onChange={(e) => setLandmarkCoordInput(e.target.value)}
                          onBlur={() => setLandmarkFormTouched(true)}
                          placeholder="25.047924, 121.517081"
                          aria-invalid={Boolean(coordError)}
                        />
                        <button className="secondary-button" onClick={() => void handleSaveLandmark()} disabled={!isLandmarkFormValid || landmarkSaving}>
                          {landmarkSaving ? (editingLandmarkId ? '更新中' : '儲存中') : (editingLandmarkId ? '更新' : '儲存')}
                        </button>
                      </div>
                      {coordError && <p className="helper-text helper-text--error">{coordError}</p>}
                    </label>
                    <label className="field">
                      <span>地標類型</span>
                      <select value={landmarkTypeInput} onChange={(e) => setLandmarkTypeInput(e.target.value as 'flower' | 'mushroom')}>
                        <option value="mushroom">菇點</option>
                        <option value="flower">花點</option>
                      </select>
                    </label>
                    <button
                      className="secondary-button modal-stack-button landmark-import-button"
                      onClick={() => landmarkImportInputRef.current?.click()}
                      type="button"
                    >
                      <FileInput aria-hidden="true" size={16} strokeWidth={2.4} />
                      匯入地標 JSON
                    </button>
                    <input
                      ref={landmarkImportInputRef}
                      className="sr-only"
                      type="file"
                      accept="application/json,.json"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null
                        void handleImportLandmarkFile(file)
                        e.currentTarget.value = ''
                      }}
                    />
                    {editingLandmarkId && (
                      <button className="ghost-button modal-stack-button" onClick={handleCancelLandmarkEdit}>
                        取消編輯
                      </button>
                    )}
                    <p className="helper-text">{editingLandmarkId ? '更新成功後欄位會自動清空，搜尋分頁清單會同步更新。' : '儲存成功後欄位會自動清空，點選地標可帶入目的地。'}</p>
                  </section>
                ) : landmarkManagerTab === 'search' ? (
                  <section className="modal-section landmark-manager-list-panel">
                    <div className="landmark-toolbar">
                      <label className="field landmark-search-field">
                        <span>搜尋地標</span>
                        <input
                          value={landmarkSearchInput}
                          onChange={(e) => setLandmarkSearchInput(e.target.value)}
                          placeholder="輸入名稱或座標"
                        />
                      </label>
                      <div className="field">
                        <span>篩選</span>
                        <div className="segmented-control" role="tablist" aria-label="地標管理類型篩選">
                          {LANDMARK_TYPE_FILTERS.map((filter) => (
                            <button
                              key={filter.id}
                              type="button"
                              className={landmarkTypeFilter === filter.id ? 'is-active' : ''}
                              onClick={() => setLandmarkTypeFilter(filter.id)}
                            >
                              {filter.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="landmark-section-head">
                      <span>已儲存地標</span>
                      <small>{filteredLandmarks.length} / {savedLandmarks.length} 筆</small>
                    </div>
                    {savedLandmarks.length === 0 ? (
                      <p className="landmark-empty">目前還沒有地標，先到新增地標分頁建立一筆。</p>
                    ) : filteredLandmarks.length === 0 ? (
                      <p className="landmark-empty">找不到符合條件的地標。</p>
                    ) : (
                      <>
                        <div className="landmark-edit-list">
                          {pagedLandmarks.map((landmark) => (
                            <div key={landmark.id} className={`landmark-edit-item${editingLandmarkId === landmark.id ? ' is-editing' : ''}`}>
                              <div className="landmark-edit-content">
                                {landmark.imageUrl ? (
                                  <button
                                    className="landmark-thumb-button"
                                    onClick={() => setPreviewLandmark(landmark)}
                                    type="button"
                                    aria-label={`放大查看 ${landmark.name} 的圖片`}
                                    title={`放大查看 ${landmark.name}`}
                                  >
                                    <img
                                      src={landmark.imageUrl}
                                      alt={`${landmark.name} 縮圖`}
                                      loading="lazy"
                                      onError={(event) => {
                                        event.currentTarget.style.display = 'none'
                                        event.currentTarget.parentElement?.classList.add('is-image-missing')
                                      }}
                                    />
                                    <span className="landmark-thumb-zoom" aria-hidden="true">
                                      <ZoomIn size={13} strokeWidth={2.6} />
                                    </span>
                                  </button>
                                ) : (
                                  <span className="landmark-thumb-placeholder" title="這筆地標沒有圖片資料" aria-label="沒有圖片資料">
                                    無圖
                                  </span>
                                )}
                                <button className="landmark-edit-main" onClick={() => handleSelectLandmarkToFly(landmark.name)} type="button">
                                  <strong>{landmark.name}</strong>
                                </button>
                              </div>
                              <div className="landmark-edit-actions">
                                <button
                                  className="icon-button"
                                  onClick={() => setOpenLandmarkActionId((current) => current === landmark.id ? '' : landmark.id)}
                                  aria-label={`開啟地標選單：${landmark.name}`}
                                  aria-expanded={openLandmarkActionId === landmark.id}
                                  title={`地標選單：${landmark.name}`}
                                  type="button"
                                >
                                  <MoreHorizontal aria-hidden="true" size={16} strokeWidth={2.4} />
                                </button>
                                {openLandmarkActionId === landmark.id && (
                                  <div className="landmark-action-menu">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleExportLandmark(landmark)
                                        setOpenLandmarkActionId('')
                                      }}
                                    >
                                      <Download aria-hidden="true" size={15} strokeWidth={2.4} />
                                      匯出
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleEditLandmark(landmark)
                                        setOpenLandmarkActionId('')
                                      }}
                                    >
                                      <Pencil aria-hidden="true" size={15} strokeWidth={2.4} />
                                      編輯
                                    </button>
                                    <button
                                      className="danger"
                                      type="button"
                                      onClick={() => {
                                        setOpenLandmarkActionId('')
                                        void handleDeleteLandmark(landmark.id)
                                      }}
                                    >
                                      <Trash2 aria-hidden="true" size={15} strokeWidth={2.4} />
                                      刪除
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        {landmarkPageCount > 1 && (
                          <div className="landmark-pagination" aria-label="地標分頁">
                            <button
                              className="ghost-button"
                              type="button"
                              onClick={() => setLandmarkPage((page) => Math.max(1, page - 1))}
                              disabled={safeLandmarkPage <= 1}
                            >
                              上一頁
                            </button>
                            <span>{safeLandmarkPage} / {landmarkPageCount}</span>
                            <button
                              className="ghost-button"
                              type="button"
                              onClick={() => setLandmarkPage((page) => Math.min(landmarkPageCount, page + 1))}
                              disabled={safeLandmarkPage >= landmarkPageCount}
                            >
                              下一頁
                            </button>
                          </div>
                        )}
                      </>
                    )}
                    {filteredMushroomSearchResults.length > 0 && (
                      <>
                        <div className="landmark-section-head mushroom-search-head">
                          <span>{landmarkTypeFilter === 'giant' ? '巨菇資料' : landmarkTypeFilter === 'element' ? '元素菇資料' : '符合搜尋的蘑菇'}</span>
                          <small>{filteredMushroomSearchResults.length} / {savedMushrooms.length} 筆</small>
                        </div>
                        <div className="mushroom-list mushroom-search-list">
                          {filteredMushroomSearchResults.map((mushroom) => (
                            <div key={mushroom.id} className="mushroom-item">
                              <div className="mushroom-item-main">
                                <div className="mushroom-title-row">
                                  <div className="mushroom-name-group">
                                    <strong>{mushroom.name}</strong>
                                    <span className={`mushroom-tag ${mushroom.mushroomType === 'giant' ? 'is-giant' : 'is-element'}`}>{getMushroomTag(mushroom)}</span>
                                  </div>
                                </div>
                                <span>{formatCoordinate(mushroom.coordinate)}</span>
                                <div className="mushroom-meta-row">
                                  {mushroom.remainingSlots !== null && mushroom.remainingSlots !== undefined && (
                                    <small>{mushroom.remainingSlots} 空位</small>
                                  )}
                                </div>
                              </div>
                              <small className="mushroom-countdown">倒數 {formatMushroomCountdown(mushroom.expiresAt, nowMs)}</small>
                              <div className="mushroom-actions">
                                <button
                                  className="icon-button mushroom-fly-button"
                                  onClick={() => void handleFlyToMushroom(mushroom)}
                                  disabled={isFlying}
                                  aria-label={`飛行到 ${mushroom.name}`}
                                  title={`飛行到 ${mushroom.name}`}
                                  type="button"
                                >
                                  <Send aria-hidden="true" size={16} strokeWidth={2.5} />
                                </button>
                                <button
                                  className="icon-button"
                                  onClick={() => void handleCopyMushroomCoordinate(mushroom)}
                                  aria-label={`複製座標：${mushroom.name}`}
                                  title={`複製 ${mushroom.name} 座標`}
                                  type="button"
                                >
                                  <Copy aria-hidden="true" size={16} strokeWidth={2.4} />
                                </button>
                                <button
                                  className="icon-button danger"
                                  onClick={() => void handleDeleteMushroom(mushroom.id)}
                                  aria-label={`刪除蘑菇資料：${mushroom.name}`}
                                  title={`刪除 ${mushroom.name}`}
                                  type="button"
                                >
                                  <Trash2 aria-hidden="true" size={16} strokeWidth={2.4} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </section>
                ) : (
                  mushroomManagementSection
                )}
              </div>
            ) : (
              <div className="modal-body route-manager-body">
                <section className="modal-section landmark-manager-list-panel route-manager-panel">
                  <div className="route-manager-toolbar">
                    <label className="field route-search-field">
                      <span>搜尋路徑</span>
                      <input
                        value={routeSearchInput}
                        onChange={(e) => setRouteSearchInput(e.target.value)}
                        placeholder="輸入路徑標題"
                      />
                    </label>
                    <button
                      className="icon-button route-manager-import-button"
                      onClick={() => routeImportInputRef.current?.click()}
                      aria-label="匯入路徑資料"
                      title="匯入路徑資料"
                      type="button"
                    >
                      <FileInput aria-hidden="true" size={16} strokeWidth={2.4} />
                    </button>
                  </div>
                  <div className="landmark-section-head">
                    <span>已儲存路徑</span>
                    <small>{filteredSavedRoutes.length} / {savedRoutes.length} 筆</small>
                  </div>
                  {savedRoutes.length === 0 ? (
                    <p className="route-empty route-manager-empty">還沒有儲存路徑，先在路徑模式儲存目前路徑，或匯入路徑 JSON 檔案。</p>
                  ) : filteredSavedRoutes.length === 0 ? (
                    <p className="route-empty route-manager-empty">找不到符合標題的路徑。</p>
                  ) : (
                    <>
                      <div className="saved-route-list route-manager-list">
                        {pagedSavedRoutes.map((route) => (
                          <div key={route.id} className="saved-route-item route-manager-pill">
                            <div className="saved-route-main route-manager-main">
                              <strong>{route.name}</strong>
                            </div>
                            <div className="saved-route-actions">
                              <button
                                className="icon-button"
                                onClick={() => setOpenRouteActionId((current) => current === route.id ? '' : route.id)}
                                aria-label={`開啟路徑選單：${route.name}`}
                                aria-expanded={openRouteActionId === route.id}
                                title={`路徑選單：${route.name}`}
                                type="button"
                              >
                                <MoreHorizontal aria-hidden="true" size={16} strokeWidth={2.4} />
                              </button>
                              {openRouteActionId === route.id && (
                                <div className="landmark-action-menu">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleExportSavedRoute(route)
                                      setOpenRouteActionId('')
                                    }}
                                  >
                                    <Download aria-hidden="true" size={15} strokeWidth={2.4} />
                                    匯出
                                  </button>
                                  <button
                                    className="danger"
                                    type="button"
                                    onClick={() => {
                                      setOpenRouteActionId('')
                                      void handleDeleteSavedRoute(route.id)
                                    }}
                                  >
                                    <Trash2 aria-hidden="true" size={15} strokeWidth={2.4} />
                                    刪除
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {routePageCount > 1 && (
                        <div className="landmark-pagination" aria-label="路徑分頁">
                          <button
                            className="ghost-button"
                            type="button"
                            onClick={() => setRoutePage((page) => Math.max(1, page - 1))}
                            disabled={safeRoutePage <= 1}
                          >
                            上一頁
                          </button>
                          <span>{safeRoutePage} / {routePageCount}</span>
                          <button
                            className="ghost-button"
                            type="button"
                            onClick={() => setRoutePage((page) => Math.min(routePageCount, page + 1))}
                            disabled={safeRoutePage >= routePageCount}
                          >
                            下一頁
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </section>
              </div>
            )}
          </div>
        </div>
      )}

      {previewLandmark?.imageUrl && (
        <div className="image-preview-backdrop" onClick={() => setPreviewLandmark(null)}>
          <figure className="image-preview-panel" onClick={(e) => e.stopPropagation()}>
            <button
              className="icon-button image-preview-close"
              onClick={() => setPreviewLandmark(null)}
              type="button"
              aria-label="關閉圖片預覽"
              title="關閉圖片預覽"
            >
              <X aria-hidden="true" size={18} strokeWidth={2.4} />
            </button>
            <img src={previewLandmark.imageUrl} alt={`${previewLandmark.name} 圖片預覽`} />
            <figcaption>
              <strong>{previewLandmark.name}</strong>
              <span>{formatCoordinate(previewLandmark.coordinate)}</span>
            </figcaption>
          </figure>
        </div>
      )}


    </div>
  )
}
