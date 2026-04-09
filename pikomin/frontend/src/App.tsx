import { useState, useCallback, useEffect } from 'react'
import { useDevice } from './hooks/useDevice'
import { useRoute } from './hooks/useRoute'
import { apiClient } from './api/client'
import { DeviceStatus } from './components/DeviceStatus'
import { RoutePanel } from './components/RoutePanel'
import JoystickController from './components/JoystickController'
import MapInterface from './components/MapInterface'
import type { GPSCoordinate, MoveVector } from './types'

type Mode = 'single' | 'route'

interface Toast {
  id: number
  message: string
}

let toastIdCounter = 0

export default function App() {
  const [mode, setMode] = useState<Mode>('single')
  const [joystickSpeed, setJoystickSpeed] = useState(3)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [myPosition, setMyPosition] = useState<GPSCoordinate | null>(null)

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
    joystickMove,
  } = useRoute(selectedDevice?.id ?? null, myPosition)

  // 取得瀏覽器定位作為初始位置
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coord = { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
          setMyPosition(coord)
          // 自動設定為搖桿的初始位置
          if (selectedDevice) {
            apiClient.setLocation({ ...coord, deviceId: selectedDevice.id }).catch(() => {})
          }
        },
        () => {}
      )
    }
  }, [selectedDevice])

  const showToast = useCallback((message: string) => {
    const id = ++toastIdCounter
    setToasts((prev) => [...prev, { id, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const handleMapClick = useCallback(
    async (coord: GPSCoordinate) => {
      if (mode === 'route') {
        addWaypoint(coord)
        return
      }
      // single mode
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
      } catch (err) {
        showToast(err instanceof Error ? err.message : '設定位置失敗')
      }
    },
    [mode, selectedDevice, addWaypoint, showToast],
  )

  const handleJoystickMove = useCallback(
    async (vector: MoveVector) => {
      if (routeStatus.state === 'moving') {
        try {
          await pauseRoute()
        } catch {
          // ignore pause errors
        }
      }
      try {
        await joystickMove(vector, joystickSpeed)
      } catch (err) {
        showToast(err instanceof Error ? err.message : '搖桿移動失敗')
      }
    },
    [routeStatus.state, pauseRoute, joystickMove, joystickSpeed, showToast],
  )

  const handleJoystickRelease = useCallback(() => {
    // nothing needed on release
  }, [])

  const handleStartRoute = useCallback(
    async (speed: number, loop: boolean) => {
      try {
        await startRoute(speed, loop)
      } catch (err) {
        // 409 代表路徑已在執行，先停止再重試
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
    [startRoute, stopRoute, showToast],
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
      showToast('✅ 已停止種花')
    } catch (err) {
      showToast(err instanceof Error ? err.message : '停止路徑失敗')
    }
  }, [stopRoute, showToast])

  const showDisconnectBanner = !isLoading && selectedDevice === null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#F8FAFC', color: '#0F172A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Top toolbar */}
      <div style={styles.toolbar}>
        <span style={styles.appName}>📍 iOS GPS 模擬器</span>
        <div style={styles.modeToggle}>
          <button
            onClick={() => setMode('single')}
            style={{ ...styles.modeBtn, ...(mode === 'single' ? styles.modeBtnActive : {}) }}
          >
            單點模式
          </button>
          <button
            onClick={() => setMode('route')}
            style={{ ...styles.modeBtn, ...(mode === 'route' ? styles.modeBtnActive : {}) }}
          >
            路徑模式
          </button>
        </div>
      </div>

      {/* Disconnect warning banner */}
      {showDisconnectBanner && (
        <div style={styles.disconnectBanner}>
          ⚠️ 未偵測到裝置，請透過 USB 連接 iPhone
        </div>
      )}

      {/* Main content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left panel */}
        <div style={styles.leftPanel}>
          <div style={styles.section}>
            <DeviceStatus devices={devices} selectedDevice={selectedDevice} onSelectDevice={selectDevice} isLoading={isLoading} error={error} />
            {(routeStatus.currentPosition || myPosition) && (
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>
                  <div style={{ fontWeight: 500, color: '#374151', marginBottom: 2 }}>📍 {routeStatus.currentPosition ? '模擬位置' : '目前位置'}</div>
                  <div>緯度：{(routeStatus.currentPosition ?? myPosition)!.latitude.toFixed(6)}</div>
                  <div>經度：{(routeStatus.currentPosition ?? myPosition)!.longitude.toFixed(6)}</div>
                </div>
                <button
                  style={{ fontSize: 11, padding: '4px 10px', cursor: 'pointer', borderRadius: 6, background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', fontWeight: 500 }}
                  onClick={async () => {
                    if (!selectedDevice) return
                    try {
                      await apiClient.resetLocation(selectedDevice.id)
                      setMyPosition(null)
                      showToast('GPS 已重置，恢復真實位置')
                    } catch (err) {
                      showToast(err instanceof Error ? err.message : 'Reset 失敗')
                    }
                  }}
                >
                  Reset GPS
                </button>
              </div>
            )}
            {!myPosition && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 6, fontWeight: 500 }}>📍 設備目前座標：</div>
                <button
                  style={{ width: '100%', fontSize: 13, padding: '8px', cursor: 'pointer', borderRadius: 6, background: '#3B82F6', color: '#fff', border: 'none', marginBottom: 8, fontWeight: 500 }}
                  onClick={() => {
                    if (!navigator.geolocation) {
                      showToast('瀏覽器不支援定位')
                      return
                    }
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setMyPosition({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
                        showToast('位置取得成功')
                      },
                      (err) => showToast(`無法取得位置：${err.message}，請手動輸入`),
                      { enableHighAccuracy: true, timeout: 10000 }
                    )
                  }}
                >
                  📡 使用瀏覽器定位
                </button>
                <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6 }}>或手動輸入：</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    id="coord-input"
                    type="text"
                    placeholder="25.033, 121.565"
                    style={{ flex: 1, fontSize: 13, padding: '7px 10px', borderRadius: 6, border: '1px solid #E2E8F0', background: '#fff', color: '#0F172A', outline: 'none' }}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value
                        const parts = val.split(',').map(s => parseFloat(s.trim()))
                        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                          setMyPosition({ latitude: parts[0], longitude: parts[1] })
                        }
                      }
                    }}
                  />
                  <button
                    style={{ fontSize: 13, padding: '7px 14px', cursor: 'pointer', borderRadius: 6, background: '#3B82F6', color: '#fff', border: 'none', fontWeight: 500 }}
                    onClick={() => {
                      const input = document.getElementById('coord-input') as HTMLInputElement
                      const val = input?.value ?? ''
                      const parts = val.split(',').map(s => parseFloat(s.trim()))
                      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                        setMyPosition({ latitude: parts[0], longitude: parts[1] })
                      }
                    }}
                  >
                    設定
                  </button>
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>從手機地圖複製座標貼上</div>
              </div>
            )}
            {myPosition && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 6, fontWeight: 500 }}>✈️ 飛行到目的地：</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    id="dest-input"
                    type="text"
                    placeholder="25.033, 121.565"
                    style={{ flex: 1, fontSize: 13, padding: '7px 10px', borderRadius: 6, border: '1px solid #E2E8F0', background: '#fff', color: '#0F172A', outline: 'none' }}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value
                        const parts = val.split(',').map(s => parseFloat(s.trim()))
                        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && selectedDevice) {
                          const coord = { latitude: parts[0], longitude: parts[1] }
                          try {
                            await apiClient.setLocation({ ...coord, deviceId: selectedDevice.id })
                            setMyPosition(coord)
                          } catch (err) { showToast(err instanceof Error ? err.message : '飛行失敗') }
                        }
                      }
                    }}
                  />
                  <button
                    style={{ fontSize: 13, padding: '7px 14px', cursor: 'pointer', borderRadius: 6, background: '#10B981', color: '#fff', border: 'none', fontWeight: 500 }}
                    onClick={async () => {
                      const input = document.getElementById('dest-input') as HTMLInputElement
                      const val = input?.value ?? ''
                      const parts = val.split(',').map(s => parseFloat(s.trim()))
                      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && selectedDevice) {
                        const coord = { latitude: parts[0], longitude: parts[1] }
                        try {
                          await apiClient.setLocation({ ...coord, deviceId: selectedDevice.id })
                          setMyPosition(coord)
                        } catch (err) { showToast(err instanceof Error ? err.message : '飛行失敗') }
                      }
                    }}
                  >
                    飛行
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={styles.section}>
            {/* RSD 設定 */}
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 6, fontWeight: 500 }}>🔗 RSD Tunnel（每次重連後更新）</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                id="rsd-input"
                type="text"
                placeholder="fd60:90c7:8df9::1 56177"
                style={{ flex: 1, fontSize: 13, padding: '7px 10px', borderRadius: 6, border: '1px solid #E2E8F0', background: '#fff', color: '#0F172A', outline: 'none' }}
              />
              <button
                style={{ fontSize: 13, padding: '7px 14px', cursor: 'pointer', borderRadius: 6, background: '#3B82F6', color: '#fff', border: 'none', whiteSpace: 'nowrap', fontWeight: 500 }}
                onClick={async () => {
                  const input = document.getElementById('rsd-input') as HTMLInputElement
                  const val = input?.value.trim() ?? ''
                  const parts = val.split(/\s+/)
                  if (parts.length !== 2 || !selectedDevice) {
                    alert('格式錯誤，請輸入：address port\n例如：fd60:90c7:8df9::1 56177')
                    return
                  }
                  const port = parseInt(parts[1])
                  if (isNaN(port)) {
                    alert('Port 必須是數字')
                    return
                  }
                  try {
                    await apiClient.setRsd(selectedDevice.id, parts[0], port)
                    alert(`✅ RSD 設定成功！\n裝置：${selectedDevice.name}\nAddress：${parts[0]}\nPort：${port}`)
                  } catch (e) {
                    alert(`❌ RSD 設定失敗：${e instanceof Error ? e.message : '未知錯誤'}`)
                  }
                }}
              >
                設定
              </button>
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>格式：address 空格 port</div>
          </div>

          <div style={styles.section}>
            <RoutePanel
              waypoints={waypoints}
              routeStatus={routeStatus}
              onRemoveWaypoint={removeWaypoint}
              onClearWaypoints={clearWaypoints}
              onAddWaypoint={addWaypoint}
              onStartRoute={handleStartRoute}
              onPauseRoute={handlePauseRoute}
              onResumeRoute={handleResumeRoute}
              onStopRoute={handleStopRoute}
            />
          </div>

          <div style={{ ...styles.section, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: '#64748B', whiteSpace: 'nowrap', fontWeight: 500 }}>搖桿速度</label>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={joystickSpeed}
                onChange={(e) => setJoystickSpeed(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#3B82F6' }}
              />
              <span style={{ fontSize: '13px', color: '#374151', minWidth: '48px', fontWeight: 600 }}>{joystickSpeed} m/s</span>
            </div>
            <JoystickController
              speed={joystickSpeed}
              onMove={handleJoystickMove}
              onRelease={handleJoystickRelease}
              disabled={!selectedDevice}
            />
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1, height: '100%' }}>
          <MapInterface
            mode={mode}
            currentPosition={routeStatus.currentPosition ?? myPosition}
            waypoints={waypoints}
            onMapClick={handleMapClick}
          />
        </div>
      </div>

      {/* Toast notifications */}
      <div style={styles.toastContainer}>
        {toasts.map((toast) => (
          <div key={toast.id} style={{
            ...styles.toast,
            background: toast.message.startsWith('✅') ? '#10B981' : '#0F172A',
          }}>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    height: '52px',
    background: '#ffffff',
    borderBottom: '1px solid #E2E8F0',
    flexShrink: 0,
  },
  appName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: '-0.01em',
  },
  modeToggle: {
    display: 'flex',
    gap: '2px',
    background: '#F1F5F9',
    borderRadius: '8px',
    padding: '3px',
  },
  modeBtn: {
    padding: '5px 14px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    background: 'transparent',
    color: '#64748B',
    fontWeight: '500',
    transition: 'all 0.15s',
  },
  modeBtnActive: {
    background: '#ffffff',
    color: '#0F172A',
    fontWeight: '600',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  disconnectBanner: {
    background: '#FEF2F2',
    color: '#DC2626',
    padding: '8px 20px',
    fontSize: '13px',
    textAlign: 'center',
    flexShrink: 0,
    borderBottom: '1px solid #FECACA',
    fontWeight: '500',
  },
  leftPanel: {
    width: '300px',
    flexShrink: 0,
    height: '100%',
    overflowY: 'auto',
    background: '#F8FAFC',
    borderRight: '1px solid #E2E8F0',
    display: 'flex',
    flexDirection: 'column',
  },
  section: {
    borderBottom: '1px solid #E2E8F0',
    padding: '14px 16px',
    background: '#ffffff',
  },
  toastContainer: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    zIndex: 9999,
    pointerEvents: 'none',
  },
  toast: {
    background: '#0F172A',
    color: '#ffffff',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    maxWidth: '300px',
    fontWeight: '500',
  },
}
