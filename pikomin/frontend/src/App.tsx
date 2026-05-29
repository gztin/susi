import { useCallback, useEffect, useRef, useState } from 'react'
import { Download, FolderOpen, Save, Trash2 } from 'lucide-react'
import './app.css'
import { apiClient } from './api/client'
import { DeviceStatus } from './components/DeviceStatus'
import MapInterface from './components/MapInterface'
import { RoutePanel } from './components/RoutePanel'
import { useDevice } from './hooks/useDevice'
import { useRoute } from './hooks/useRoute'
import type { GPSCoordinate, SavedLandmark, SavedRoute } from './types'

type Mode = 'single' | 'route'
type FlyMode = 'coordinate' | 'landmark'

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

let toastIdCounter = 0

function parseCoordinateInput(value: string): GPSCoordinate | null {
  const normalized = value
    .replace(/，/g, ',')
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
  const [landmarkTypeInput, setLandmarkTypeInput] = useState<'flower' | 'mushroom'>('mushroom')
  const [landmarkTypeFilter, setLandmarkTypeFilter] = useState<'all' | 'flower' | 'mushroom'>('all')
  const [landmarkFormTouched, setLandmarkFormTouched] = useState(false)
  const [landmarkSaving, setLandmarkSaving] = useState(false)
  const [editingLandmarkId, setEditingLandmarkId] = useState('')
  const [selectedLandmarkId, setSelectedLandmarkId] = useState('')
  const [routeNameInput, setRouteNameInput] = useState('')
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([])
  const [routeSaving, setRouteSaving] = useState(false)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [isFlySettingsOpen, setIsFlySettingsOpen] = useState(false)
  const [isLandmarkManagerOpen, setIsLandmarkManagerOpen] = useState(false)
  const [isRouteLibraryOpen, setIsRouteLibraryOpen] = useState(false)
  const [flyMode, setFlyMode] = useState<FlyMode>('coordinate')
  const [savedLandmarks, setSavedLandmarks] = useState<SavedLandmark[]>([])
  const showToastRef = useRef<(message: string) => void>(() => {})
  const routeImportInputRef = useRef<HTMLInputElement | null>(null)

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
  } = useRoute(selectedDevice?.id ?? null, myPosition, (message) => {
    showToastRef.current(`路徑推送失敗：${message}`)
  })

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
    [addWaypoint, isMapClickArmed, mode, selectedDevice?.id, sendLocationFast, showToast, syncCurrentPosition],
  )

  const handleStartRoute = useCallback(
    async (speed: number, loop: boolean) => {
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
    [showToast, startRoute, stopRoute],
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

  const handleSelectLandmarkToFly = useCallback((landmarkName: string) => {
    setDestinationInput(landmarkName)
    const target = savedLandmarks.find((item) => item.name === landmarkName)
    if (!target) return
    setSelectedLandmarkId(target.id)
  }, [savedLandmarks])

  const handleSaveRoute = useCallback(async () => {
    const name = routeNameInput.trim()
    if (!name) {
      showToast('請輸入路徑名稱')
      return
    }
    if (waypoints.length < 2) {
      showToast('路徑至少需要 2 個路徑點')
      return
    }

    try {
      setRouteSaving(true)
      const created = await apiClient.createSavedRoute({ name, waypoints })
      setSavedRoutes((prev) => [created, ...prev])
      setRouteNameInput('')
      showToast('路徑已儲存')
    } catch (err) {
      showToast(err instanceof Error ? err.message : '儲存路徑失敗')
    } finally {
      setRouteSaving(false)
    }
  }, [routeNameInput, showToast, waypoints])

  const handleLoadSavedRoute = useCallback((route: SavedRoute) => {
    if (routeStatus.state !== 'idle') {
      showToast('路徑執行中，請先停止後再載入')
      return
    }
    replaceWaypoints(route.waypoints)
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
      version: 1,
      name: route.name,
      exportedAt: new Date().toISOString(),
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

  const currentPosition = mode === 'single'
    ? (myPosition ?? routeStatus.currentPosition)
    : (routeStatus.currentPosition ?? myPosition)
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
  const filteredLandmarks = savedLandmarks.filter((landmark) => {
    const typeMatched = landmarkTypeFilter === 'all' || landmark.landmarkType === landmarkTypeFilter
    if (!normalizedSearchKeyword) return typeMatched
    const nameMatched = landmark.name.toLowerCase().includes(normalizedSearchKeyword)
    const coordText = formatCoordinate(landmark.coordinate).toLowerCase()
    const coordMatched = coordText.includes(normalizedSearchKeyword)
    return typeMatched && (nameMatched || coordMatched)
  })

  return (
    <div className="app-shell">
      <section className="map-stage map-stage-full">
        <MapInterface
          mode={mode}
          currentPosition={currentPosition}
          viewTarget={viewTarget}
          waypoints={waypoints}
          savedLandmarks={savedLandmarks}
          onMapClick={handleMapClick}
          onWaypointMove={updateWaypoint}
          canEditWaypoints={mode === 'route' && routeStatus.state === 'idle'}
        />
      </section>

      <div className="overlay-shell">
        <main className="workspace workspace-overlay">
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
                  {showDisconnectBanner && <span className="inline-alert">未偵測到裝置</span>}
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
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as Mode)}
                aria-label="操作模式"
              >
                <option value="single">單點定位</option>
                <option value="route">路徑模式</option>
              </select>
            </label>
            <p className="helper-text" aria-live="polite">
              {!isMapClickArmed
                ? '地圖點擊目前已鎖定，開啟「點圖生效」後才會寫入位置或新增路徑點'
                : mode === 'single'
                  ? '點擊地圖直接移動裝置定位'
                  : '點擊地圖加入路徑點'}
            </p>

            <div className="action-row">
              <button
                className={`secondary-button${isMapClickArmed ? ' is-active' : ''}`}
                onClick={() => setIsMapClickArmed((prev) => !prev)}
                aria-pressed={isMapClickArmed}
              >
                {isMapClickArmed ? '點圖生效中' : '點圖已鎖定'}
              </button>
              <button className="secondary-button" onClick={() => setIsManageModalOpen(true)}>位置設定</button>
            </div>

            <div className="inline-route-panel">
              <RoutePanel
                waypoints={waypoints}
                routeStatus={routeStatus}
                onStartRoute={handleStartRoute}
                onPauseRoute={handlePauseRoute}
                onResumeRoute={handleResumeRoute}
                onStopRoute={handleStopRoute}
              />
            </div>
          </section>
          </aside>
        </main>

        {mode === 'route' && (
          <aside className="route-data-sidebar">
            <section className="route-data-panel">
              <div className="panel-heading compact">
                <div>
                  <p className="panel-kicker">新增路徑點</p>
                  <h2>路線資料</h2>
                </div>
                <div className="route-panel-tools">
                  <button
                    className="icon-button"
                    onClick={() => void handleSaveRoute()}
                    disabled={routeStatus.state !== 'idle' || waypoints.length < 2 || !routeNameInput.trim() || routeSaving}
                    aria-label="儲存目前路徑"
                    title="儲存目前路徑"
                    type="button"
                  >
                    <Save aria-hidden="true" size={16} strokeWidth={2.4} />
                  </button>
                  <button
                    className="icon-button danger"
                    onClick={clearWaypoints}
                    disabled={routeStatus.state !== 'idle' || waypoints.length === 0}
                    aria-label="清除全部路徑點"
                    title="清除全部路徑點"
                    type="button"
                  >
                    <Trash2 aria-hidden="true" size={16} strokeWidth={2.4} />
                  </button>
                </div>
              </div>
              {routeStatus.state === 'idle' && (
                <div className="saved-route-form">
                  <label className="field">
                    <span>路徑名稱</span>
                    <input
                      value={routeNameInput}
                      onChange={(e) => setRouteNameInput(e.target.value)}
                      placeholder="例如：機場巡點 A"
                    />
                  </label>
                  <div className="route-file-actions">
                    <button
                      className="secondary-button"
                      onClick={() => setIsRouteLibraryOpen(true)}
                      type="button"
                    >
                      讀取路徑
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => routeImportInputRef.current?.click()}
                      type="button"
                    >
                      匯入路徑
                    </button>
                  </div>
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
              )}
              <div className="route-section-title">
                <span>目前路徑點</span>
                <small>{waypoints.length} 點</small>
              </div>
              <div className="waypoint-list">
                {waypoints.length === 0 ? (
                  <p className="route-empty">還沒有路徑點。點擊地圖新增，或讀取已儲存路徑。</p>
                ) : (
                  waypoints.map((wp, index) => (
                    <div key={`${wp.latitude}-${wp.longitude}-${index}`} className="waypoint-item">
                      <div className="waypoint-index">{index + 1}</div>
                      <div className="waypoint-text">
                        <strong>{wp.latitude.toFixed(5)}</strong>
                        <span>{wp.longitude.toFixed(5)}</span>
                      </div>
                      {(routeStatus.state === 'idle') && (
                        <button className="waypoint-remove" onClick={() => removeWaypoint(index)}>
                          移除
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>
        )}
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
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>位置資訊設定</h3>
            </div>
            <div className="modal-body">
              <section className="modal-section">
                <button className="primary-button" onClick={handleLocateMe} disabled={isLocating}>
                  {isLocating ? '定位中...' : '重新取得目前位置'}
                </button>
                <button className="ghost-button modal-stack-button" onClick={() => setIsLandmarkManagerOpen(true)}>地標管理</button>
                <button className="secondary-button modal-stack-button" onClick={() => setIsFlySettingsOpen(true)}>飛行設定</button>
                <p className="helper-text">已儲存 {savedLandmarks.length} 個地標，可在飛行設定中直接搜尋。</p>
              </section>
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
                        <button
                          type="button"
                          className={landmarkTypeFilter === 'all' ? 'is-active' : ''}
                          onClick={() => setLandmarkTypeFilter('all')}
                        >
                          全部
                        </button>
                        <button
                          type="button"
                          className={landmarkTypeFilter === 'flower' ? 'is-active' : ''}
                          onClick={() => setLandmarkTypeFilter('flower')}
                        >
                          花點
                        </button>
                        <button
                          type="button"
                          className={landmarkTypeFilter === 'mushroom' ? 'is-active' : ''}
                          onClick={() => setLandmarkTypeFilter('mushroom')}
                        >
                          菇點
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="landmark-section-head">
                    <span>已新增地標</span>
                    <small>{filteredLandmarks.length} / {savedLandmarks.length} 筆</small>
                  </div>
                  {savedLandmarks.length === 0 ? (
                    <p className="landmark-empty">目前還沒有地標，先到「地標管理」新增一筆。</p>
                  ) : filteredLandmarks.length === 0 ? (
                    <p className="landmark-empty">找不到符合條件的地標，請調整搜尋關鍵字。</p>
                  ) : (
                    <div className="landmark-list">
                      {filteredLandmarks.map((landmark) => (
                        <div key={landmark.id} className="landmark-item">
                          <button className="landmark-main" onClick={() => handleSelectLandmarkToFly(landmark.name)} type="button">
                            <strong>{landmark.name}</strong>
                          </button>
                          <button
                            className="waypoint-remove landmark-remove-icon"
                            onClick={() => void handleDeleteLandmark(landmark.id)}
                            aria-label={`刪除地標 ${landmark.name}`}
                            title={`刪除 ${landmark.name}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
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
            <div className="modal-header"><h3>地標管理</h3></div>
            <div className="modal-body modal-body-split landmark-manager-layout">
              <section className="modal-section">
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
                {editingLandmarkId && (
                  <button className="ghost-button modal-stack-button" onClick={handleCancelLandmarkEdit}>
                    取消編輯
                  </button>
                )}
                <p className="helper-text">{editingLandmarkId ? '更新成功後欄位會自動清空，右側清單會同步更新。' : '儲存成功後欄位會自動清空，點選地標可帶入目的地。'}</p>
              </section>

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
                      <button
                        type="button"
                        className={landmarkTypeFilter === 'all' ? 'is-active' : ''}
                        onClick={() => setLandmarkTypeFilter('all')}
                      >
                        全部
                      </button>
                      <button
                        type="button"
                        className={landmarkTypeFilter === 'flower' ? 'is-active' : ''}
                        onClick={() => setLandmarkTypeFilter('flower')}
                      >
                        花點
                      </button>
                      <button
                        type="button"
                        className={landmarkTypeFilter === 'mushroom' ? 'is-active' : ''}
                        onClick={() => setLandmarkTypeFilter('mushroom')}
                      >
                        菇點
                      </button>
                    </div>
                  </div>
                </div>
                <div className="landmark-section-head">
                  <span>已儲存地標</span>
                  <small>{filteredLandmarks.length} / {savedLandmarks.length} 筆</small>
                </div>
                {savedLandmarks.length === 0 ? (
                  <p className="landmark-empty">目前還沒有地標，先在左側新增一筆。</p>
                ) : filteredLandmarks.length === 0 ? (
                  <p className="landmark-empty">找不到符合條件的地標。</p>
                ) : (
                  <div className="landmark-edit-list">
                    {filteredLandmarks.map((landmark) => (
                      <div key={landmark.id} className={`landmark-edit-item${editingLandmarkId === landmark.id ? ' is-editing' : ''}`}>
                        <button className="landmark-edit-main" onClick={() => handleSelectLandmarkToFly(landmark.name)} type="button">
                          <strong>{landmark.name}</strong>
                          <span>{formatCoordinate(landmark.coordinate)}</span>
                          <small>{landmark.landmarkType === 'flower' ? '花點' : '菇點'}</small>
                        </button>
                        <div className="landmark-edit-actions">
                          <button className="secondary-button" onClick={() => handleEditLandmark(landmark)} type="button">
                            編輯
                          </button>
                          <button
                            className="ghost-button danger"
                            onClick={() => void handleDeleteLandmark(landmark.id)}
                            type="button"
                          >
                            刪除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}
