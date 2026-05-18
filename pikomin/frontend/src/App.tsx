import { useCallback, useEffect, useRef, useState } from 'react'
import './app.css'
import { apiClient } from './api/client'
import { DeviceStatus } from './components/DeviceStatus'
import MapInterface from './components/MapInterface'
import { RoutePanel } from './components/RoutePanel'
import { useDevice } from './hooks/useDevice'
import { useRoute } from './hooks/useRoute'
import type { GPSCoordinate, SavedLandmark } from './types'

type Mode = 'single' | 'route'

interface Toast {
  id: number
  message: string
}

let toastIdCounter = 0

function parseCoordinateInput(value: string): GPSCoordinate | null {
  const normalized = value.replace(/，/g, ',').trim()
  const parts = normalized.split(',').map((segment) => Number.parseFloat(segment.trim()))
  if (parts.length !== 2 || parts.some((part) => Number.isNaN(part))) {
    return null
  }

  return { latitude: parts[0], longitude: parts[1] }
}

function formatCoordinate(coord: GPSCoordinate | null): string {
  if (!coord) return '尚未設定'
  return `${coord.latitude.toFixed(6)}, ${coord.longitude.toFixed(6)}`
}

export default function App() {
  const [mode, setMode] = useState<Mode>('single')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [myPosition, setMyPosition] = useState<GPSCoordinate | null>(null)
  const [destinationInput, setDestinationInput] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [isFlying, setIsFlying] = useState(false)
  const [hasResetGPS, setHasResetGPS] = useState(false)
  const [landmarkNameInput, setLandmarkNameInput] = useState('')
  const [landmarkCoordInput, setLandmarkCoordInput] = useState('')
  const [landmarkFormTouched, setLandmarkFormTouched] = useState(false)
  const [landmarkSaving, setLandmarkSaving] = useState(false)
  const [selectedLandmarkId, setSelectedLandmarkId] = useState('')
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [isFlySettingsOpen, setIsFlySettingsOpen] = useState(false)
  const [isLandmarkManagerOpen, setIsLandmarkManagerOpen] = useState(false)
  const [savedLandmarks, setSavedLandmarks] = useState<SavedLandmark[]>([])
  const showToastRef = useRef<(message: string) => void>(() => {})

  const { devices, selectedDevice, selectDevice, isLoading, error } = useDevice()
  const {
    waypoints,
    addWaypoint,
    removeWaypoint,
    clearWaypoints,
    routeStatus,
    startRoute,
    pauseRoute,
    resumeRoute,
    stopRoute,
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
    if (navigator.geolocation && selectedDevice && !myPosition && !hasResetGPS) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMyPosition({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
        },
        () => {},
      )
    }
  }, [selectedDevice, myPosition, hasResetGPS])

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

  const handleMapClick = useCallback(
    async (coord: GPSCoordinate) => {
      if (mode === 'route') {
        addWaypoint(coord)
        return
      }

      if (!selectedDevice) {
        showToast('請先選擇裝置')
        return
      }

      try {
        await apiClient.setLocation({
          latitude: coord.latitude,
          longitude: coord.longitude,
          deviceId: selectedDevice.id,
        })
        setMyPosition(coord)
        setHasResetGPS(false)
        showToast('位置已更新')
      } catch (err) {
        showToast(err instanceof Error ? err.message : '設定位置失敗')
      }
    },
    [addWaypoint, mode, selectedDevice, showToast],
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
    if (!navigator.geolocation) {
      showToast('瀏覽器不支援定位')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coord = { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
        setMyPosition(coord)
        setHasResetGPS(false)
        setIsLocating(false)
        showToast('位置取得成功')
      },
      (err) => {
        setIsLocating(false)
        showToast(`無法取得位置：${err.message}`)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [showToast])

  const handleFlyTo = useCallback(async () => {
    if (!selectedDevice) {
      showToast('請先選擇裝置')
      return
    }

    const landmark = savedLandmarks.find((item) => item.name === destinationInput.trim())
    const coord = landmark?.coordinate ?? parseCoordinateInput(destinationInput)
    if (!coord) {
      showToast('請輸入正確目的地座標')
      return
    }

    setIsFlying(true)
    try {
      await apiClient.setLocation({ ...coord, deviceId: selectedDevice.id })
      setMyPosition(coord)
      setDestinationInput(landmark ? landmark.name : '')
      setHasResetGPS(false)
      showToast('已飛行到目的地')
    } catch (err) {
      showToast(err instanceof Error ? err.message : '飛行失敗')
    } finally {
      setIsFlying(false)
    }
  }, [destinationInput, savedLandmarks, selectedDevice, showToast])

  const handleSaveLandmark = useCallback(async () => {
    setLandmarkFormTouched(true)
    const target = parseCoordinateInput(landmarkCoordInput)
    if (!target) {
      showToast('請輸入正確座標格式：25.033, 121.565')
      return
    }
    const name = landmarkNameInput.trim()
    if (!name) {
      showToast('請先輸入地標名稱')
      return
    }

    try {
      setLandmarkSaving(true)
      const created = await apiClient.createLandmark({ name, coordinate: target })
      setSavedLandmarks((prev) => [created, ...prev])
      setLandmarkNameInput('')
      setLandmarkCoordInput('')
      setLandmarkFormTouched(false)
      showToast('地標已儲存')
    } catch (err) {
      showToast(err instanceof Error ? err.message : '儲存地標失敗')
    } finally {
      setLandmarkSaving(false)
    }
  }, [landmarkCoordInput, landmarkNameInput, showToast])

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
  }, [selectedLandmarkId, showToast])

  const handleSelectLandmarkToFly = useCallback((landmarkName: string) => {
    setDestinationInput(landmarkName)
    const target = savedLandmarks.find((item) => item.name === landmarkName)
    if (!target) return
    setSelectedLandmarkId(target.id)
  }, [savedLandmarks])

  const currentPosition = routeStatus.currentPosition ?? myPosition
  const showDisconnectBanner = !isLoading && selectedDevice === null
  const trimmedLandmarkName = landmarkNameInput.trim()
  const parsedLandmarkCoord = parseCoordinateInput(landmarkCoordInput)
  const nameError = landmarkFormTouched && !trimmedLandmarkName ? '請輸入地標名稱' : ''
  const coordError = landmarkFormTouched && !parsedLandmarkCoord ? '座標格式錯誤，請用 25.033, 121.565' : ''
  const isLandmarkFormValid = Boolean(trimmedLandmarkName && parsedLandmarkCoord)

  return (
    <div className="app-shell">
      <section className="map-stage map-stage-full">
        <MapInterface
          mode={mode}
          currentPosition={currentPosition}
          waypoints={waypoints}
          savedLandmarks={savedLandmarks}
          onMapClick={handleMapClick}
        />
      </section>

      <div className="overlay-shell">
        {showDisconnectBanner && (
          <div className="disconnect-banner" role="alert" aria-live="assertive">未偵測到裝置，請透過 USB 連接 iPhone 或確認 tunneld 已啟動</div>
        )}

        <main className="workspace workspace-overlay">
          <aside className="sidebar sidebar-floating">
          <section className="panel panel-hero">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">裝置與狀態</p>
                <h2>{currentPosition ? formatCoordinate(currentPosition) : '尚未設定定位座標'}</h2>
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
              {mode === 'single'
                ? '點擊地圖直接移動裝置定位'
                : '點擊地圖加入路徑點'}
            </p>

            <div className="action-row">
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

        <aside className="route-data-sidebar">
          <section className="route-data-panel">
            <div className="panel-heading compact">
              <div>
                <p className="panel-kicker">新增路徑點</p>
                <h2>路線資料</h2>
              </div>
              {waypoints.length > 0 && routeStatus.state === 'idle' && (
                <button className="ghost-button" onClick={clearWaypoints}>清除全部</button>
              )}
            </div>
            <div className="waypoint-list">
              {waypoints.length === 0 ? (
                <div className="empty-note">先點地圖加入路徑點，這裡會顯示已加入的路線資料。</div>
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

      {isFlySettingsOpen && (
        <div className="modal-backdrop" onClick={() => setIsFlySettingsOpen(false)}>
          <div className="modal-panel modal-panel-narrow" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>飛行設定</h3></div>
            <div className="modal-body">
              <section className="modal-section">
                <label className="field">
                  <span>目的地</span>
                  <div className="field-inline flow-row">
                    <input list="saved-landmarks" value={destinationInput} onChange={(e) => setDestinationInput(e.target.value)} placeholder="地標名稱或座標" />
                    <datalist id="saved-landmarks">
                      {savedLandmarks.map((landmark) => (
                        <option key={landmark.id} value={landmark.name} />
                      ))}
                    </datalist>
                    <button className="accent-button" onClick={() => void handleFlyTo()} disabled={!selectedDevice || isFlying}>
                      {isFlying ? '執行中' : '飛行'}
                    </button>
                  </div>
                </label>
                <p className="helper-text">可直接輸入座標，或輸入已儲存地標名稱快速飛行。</p>
              </section>
            </div>
          </div>
        </div>
      )}

      {isLandmarkManagerOpen && (
        <div className="modal-backdrop" onClick={() => setIsLandmarkManagerOpen(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>地標管理</h3></div>
            <div className="modal-body">
              <section className="modal-section">
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
                      {landmarkSaving ? '儲存中' : '儲存'}
                    </button>
                  </div>
                  {coordError && <p className="helper-text helper-text--error">{coordError}</p>}
                </label>
                <div className="landmark-section-head">
                  <span>已新增地標</span>
                  <small>{savedLandmarks.length} 筆</small>
                </div>
                {savedLandmarks.length === 0 ? (
                  <p className="landmark-empty">目前尚無地標，先新增一筆開始使用。</p>
                ) : (
                  <div className="landmark-list">
                    {savedLandmarks.map((landmark) => (
                      <div key={landmark.id} className="landmark-item">
                        <button className="landmark-main" onClick={() => handleSelectLandmarkToFly(landmark.name)} type="button">
                          <strong>{landmark.name}</strong>
                          <span>{formatCoordinate(landmark.coordinate)}</span>
                        </button>
                        <button className="waypoint-remove" onClick={() => void handleDeleteLandmark(landmark.id)}>刪除</button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="helper-text">儲存成功後欄位會自動清空，點選地標可帶入目的地。</p>
              </section>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}
