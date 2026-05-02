import { useCallback, useEffect, useRef, useState } from 'react'
import './app.css'
import { Navigation, Save, X } from 'lucide-react'
import { apiClient } from './api/client'
import { DeviceStatus } from './components/DeviceStatus'
import MapInterface from './components/MapInterface'
import { RoutePanel } from './components/RoutePanel'
import { useDevice } from './hooks/useDevice'
import { useRoute } from './hooks/useRoute'
import { useTunnel } from './hooks/useTunnel'
import type { GPSCoordinate } from './types'

type Mode = 'single' | 'route'

interface Toast {
  id: number
  message: string
}

let toastIdCounter = 0

function parseCoordinateInput(value: string): GPSCoordinate | null {
  const parts = value.split(',').map((segment) => Number.parseFloat(segment.trim()))
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
  const [manualCoordInput, setManualCoordInput] = useState('')
  const [destinationInput, setDestinationInput] = useState('')
  const [rsdInput, setRsdInput] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [isFlying, setIsFlying] = useState(false)
  const [isSavingRsd, setIsSavingRsd] = useState(false)
  const [hasResetGPS, setHasResetGPS] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const statusTriggerRef = useRef<HTMLButtonElement>(null)
  const showToastRef = useRef<(message: string) => void>(() => {})

  const { devices, selectedDevice, selectDevice, isLoading, error } = useDevice()
  const tunnel = useTunnel()
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
    resetLocation,
  } = useRoute(selectedDevice?.id ?? null, myPosition, (message) => {
    showToastRef.current(`路徑推送失敗：${message}`)
  })

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
        setManualCoordInput(formatCoordinate(coord))
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

  const handleApplyManualPosition = useCallback(async () => {
    const coord = parseCoordinateInput(manualCoordInput)
    if (!coord) {
      showToast('請輸入正確座標格式：25.033, 121.565')
      return
    }

    setMyPosition(coord)
    setHasResetGPS(false)
    showToast('起始座標已更新')
  }, [manualCoordInput, showToast])

  const handleFlyTo = useCallback(async () => {
    if (!selectedDevice) {
      showToast('請先選擇裝置')
      return
    }

    const coord = parseCoordinateInput(destinationInput)
    if (!coord) {
      showToast('請輸入正確目的地座標')
      return
    }

    setIsFlying(true)
    try {
      await apiClient.setLocation({ ...coord, deviceId: selectedDevice.id })
      setMyPosition(coord)
      setDestinationInput('')
      setHasResetGPS(false)
      showToast('已飛行到目的地')
    } catch (err) {
      showToast(err instanceof Error ? err.message : '飛行失敗')
    } finally {
      setIsFlying(false)
    }
  }, [destinationInput, selectedDevice, showToast])

  const handleResetGps = useCallback(async () => {
    try {
      await resetLocation()
      setMyPosition(null)
      setManualCoordInput('')
      setDestinationInput('')
      setHasResetGPS(true)
      showToast('GPS 已重置，可重新設定位置')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Reset 失敗')
    }
  }, [resetLocation, showToast])

  const handleSaveRsd = useCallback(async () => {
    if (!selectedDevice) {
      showToast('請先選擇裝置')
      return
    }

    let address: string
    let port: number

    const spaceParts = rsdInput.trim().split(/\s+/)
    if (spaceParts.length === 2) {
      address = spaceParts[0]
      port = Number.parseInt(spaceParts[1], 10)
    } else {
      // 支援 "address:port" 格式（如 RSD ready 輸出）
      const lastColon = rsdInput.lastIndexOf(':')
      const maybPort = Number.parseInt(rsdInput.slice(lastColon + 1), 10)
      if (lastColon === -1 || Number.isNaN(maybPort) || maybPort < 1 || maybPort > 65535) {
        showToast('格式錯誤，請輸入：fd2f:e968:f9d3::1:62112')
        return
      }
      address = rsdInput.slice(0, lastColon)
      port = maybPort
    }

    if (Number.isNaN(port)) {
      showToast('Port 必須是數字')
      return
    }

    setIsSavingRsd(true)
    try {
      await apiClient.setRsd(selectedDevice.id, address, port)
      showToast('RSD 設定完成')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'RSD 設定失敗')
    } finally {
      setIsSavingRsd(false)
    }
  }, [rsdInput, selectedDevice, showToast])

  const currentPosition = routeStatus.currentPosition ?? myPosition
  const showDisconnectBanner = !isLoading && selectedDevice === null

  useEffect(() => {
    if (!isStatusModalOpen) return
    const panel = document.getElementById('status-modal-panel')
    if (!panel) return
    const getFocusables = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])'
      ))
    getFocusables()[0]?.focus()
    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusables = getFocusables()
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', trapFocus)
    return () => {
      document.removeEventListener('keydown', trapFocus)
      statusTriggerRef.current?.focus()
    }
  }, [isStatusModalOpen])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsStatusModalOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="app-shell">
      <section className="map-stage map-stage-full">
        <MapInterface
          mode={mode}
          currentPosition={currentPosition}
          waypoints={waypoints}
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
              <button ref={statusTriggerRef} className="secondary-button" onClick={() => setIsStatusModalOpen(true)}>
                定位設定
              </button>
              {currentPosition && (
                <button className="ghost-button danger" onClick={handleResetGps}>
                  Reset GPS
                </button>
              )}
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
                <button className="ghost-button" onClick={clearWaypoints}>
                  清除全部
                </button>
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

      {isStatusModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsStatusModalOpen(false)}>
          <div
            id="status-modal-panel"
            className="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="status-modal-title">定位設定</h3>
              <button className="ghost-button modal-close-btn" onClick={() => setIsStatusModalOpen(false)} aria-label="關閉">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="modal-body">
              <button className="primary-button" onClick={handleLocateMe} disabled={isLocating}>
                {isLocating ? '定位中...' : '重新取得目前位置'}
              </button>

              {/* Tunnel 狀態區塊 */}
              <div className={`tunnel-status ${tunnel.tunneldAvailable ? 'tunnel-status--online' : 'tunnel-status--offline'}`}>
                <span className={`device-led ${tunnel.tunneldAvailable ? 'is-online' : 'is-offline'}`} aria-hidden="true" />
                <div className="tunnel-status-text">
                  {tunnel.tunneldAvailable ? (
                    <>
                      <strong>Tunneld 自動管理中</strong>
                      <span className="helper-text">
                        已偵測到 {tunnel.tunnels.length} 個 tunnel，RSD 自動設定，無需手動輸入。
                      </span>
                    </>
                  ) : (
                    <>
                      <strong>Tunneld 未啟動</strong>
                      <span className="helper-text">
                        執行一次 <code>sudo pymobiledevice3 remote tunneld</code> 即可自動管理所有裝置。
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* 手動 RSD 輸入（tunneld 未在線時才顯示） */}
              {!tunnel.tunneldAvailable && (
                <label className="field">
                  <span>手動設定 RSD Address 與 Port</span>
                  <div className="field-inline">
                    <input
                      value={rsdInput}
                      onChange={(e) => setRsdInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          void handleSaveRsd()
                        }
                      }}
                      placeholder="例如：fd2f:e968:f9d3::1:62112"
                      disabled={!selectedDevice || isSavingRsd}
                    />
                    <button
                      className="secondary-button"
                      onClick={() => void handleSaveRsd()}
                      disabled={!selectedDevice || isSavingRsd}
                      aria-label={isSavingRsd ? '儲存中' : '儲存 RSD 設定'}
                    >
                      {isSavingRsd ? '…' : <Save size={18} aria-hidden="true" />}
                    </button>
                  </div>
                </label>
              )}
              <label className="field">
                <span>起始座標</span>
                <div className="field-inline">
                  <input
                    value={manualCoordInput}
                    onChange={(e) => setManualCoordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        void handleApplyManualPosition()
                      }
                    }}
                    placeholder="請輸入起始座標，例如：25.033, 121.565"
                  />
                  <button className="secondary-button" onClick={() => void handleApplyManualPosition()} aria-label="套用起始座標">
                    <Save size={18} aria-hidden="true" />
                  </button>
                </div>
              </label>
              <label className="field">
                <span>飛行到目的地</span>
                <div className="field-inline">
                  <input
                    value={destinationInput}
                    onChange={(e) => setDestinationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        void handleFlyTo()
                      }
                    }}
                    placeholder="請輸入目的地座標，例如：25.033, 121.565"
                    disabled={!selectedDevice || isFlying}
                  />
                  <button
                    className="accent-button"
                    onClick={() => void handleFlyTo()}
                    disabled={!selectedDevice || isFlying}
                    aria-label={isFlying ? '移動中' : '飛行'}
                  >
                    {isFlying ? '…' : <Navigation size={18} aria-hidden="true" />}
                  </button>
                </div>
              </label>
              <p className="helper-text">直接貼上 RSD ready 輸出的位址即可，每次重連後需重新更新。</p>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}
