import { useState } from 'react'
import type { GPSCoordinate, RouteStatus } from '../types'

interface RoutePanelProps {
  waypoints: GPSCoordinate[]
  routeStatus: RouteStatus
  onRemoveWaypoint: (index: number) => void
  onClearWaypoints: () => void
  onAddWaypoint: (coord: GPSCoordinate) => void
  onStartRoute: (speed: number, loop: boolean) => Promise<void>
  onPauseRoute: () => Promise<void>
  onResumeRoute: () => Promise<void>
  onStopRoute: () => Promise<void>
}

type SpeedPreset = 'walk' | 'jog' | 'run' | 'bike' | 'fast'

const SPEED_PRESETS: Record<SpeedPreset, { label: string; value: number }> = {
  walk: { label: '🚶 步行 5 km/h', value: 5 / 3.6 },
  jog:  { label: '🏃 慢跑 10 km/h', value: 10 / 3.6 },
  run:  { label: '💨 快跑 15 km/h', value: 15 / 3.6 },
  bike: { label: '🚲 騎車 18 km/h', value: 18 / 3.6 },
  fast: { label: '🏎️ 極速 20 km/h', value: 20 / 3.6 },
}

const inp: React.CSSProperties = {
  flex: 1, fontSize: 13, padding: '7px 10px', borderRadius: 6,
  border: '1px solid #E2E8F0', background: '#fff', color: '#0F172A', outline: 'none',
}
const btnPrimary: React.CSSProperties = {
  fontSize: 13, padding: '7px 14px', cursor: 'pointer', borderRadius: 6,
  background: '#3B82F6', color: '#fff', border: 'none', fontWeight: 500,
}

export function RoutePanel({
  waypoints, routeStatus, onRemoveWaypoint, onClearWaypoints,
  onAddWaypoint, onStartRoute, onPauseRoute, onResumeRoute, onStopRoute,
}: RoutePanelProps) {
  const [speedPreset, setSpeedPreset] = useState<SpeedPreset>('walk')
  const [loop, setLoop] = useState(false)
  const [loading, setLoading] = useState(false)
  const [waypointInput, setWaypointInput] = useState('')

  const speed = SPEED_PRESETS[speedPreset].value
  const canStart = waypoints.length >= 2
  const isRunning = routeStatus.state === 'moving' || routeStatus.state === 'paused'
  const locked = isRunning // 執行中鎖定所有設定

  async function handleAction(fn: () => Promise<void>) {
    setLoading(true)
    try { await fn() } finally { setLoading(false) }
  }

  function addFromInput() {
    const parts = waypointInput.split(',').map(s => parseFloat(s.trim()))
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      onAddWaypoint({ latitude: parts[0], longitude: parts[1] })
      setWaypointInput('')
    }
  }

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 14, color: '#0F172A' }}>

      {/* Waypoint list */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>路徑點 ({waypoints.length})</span>
          {waypoints.length > 0 && (
            <button onClick={onClearWaypoints} style={{ fontSize: 12, padding: '3px 10px', cursor: 'pointer', borderRadius: 5, border: '1px solid #E2E8F0', background: '#fff', color: '#64748B' }}>
              清除全部
            </button>
          )}
        </div>
        {waypoints.length === 0 ? (
          <div style={{ color: '#94A3B8', fontSize: 12, padding: '8px 0' }}>尚未選擇路徑點</div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 140, overflowY: 'auto' }}>
            {waypoints.map((wp, i) => (
              <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: 12, color: '#475569' }}>
                  {i + 1}. {wp.latitude.toFixed(5)}, {wp.longitude.toFixed(5)}
                </span>
                <button onClick={() => onRemoveWaypoint(i)} style={{ fontSize: 12, padding: '2px 7px', cursor: 'pointer', color: '#EF4444', background: 'transparent', border: 'none' }}>✕</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add waypoint */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        <input
          type="text" value={waypointInput}
          onChange={(e) => !locked && setWaypointInput(e.target.value)}
          placeholder="貼上座標：25.033, 121.565"
          disabled={locked}
          style={{ ...inp, opacity: locked ? 0.4 : 1, cursor: locked ? 'not-allowed' : 'text' }}
          onKeyDown={(e) => { if (e.key === 'Enter' && !locked) addFromInput() }}
        />
        <button onClick={() => !locked && addFromInput()} disabled={locked} style={{ ...btnPrimary, opacity: locked ? 0.4 : 1, cursor: locked ? 'not-allowed' : 'pointer' }}>新增</button>
      </div>

      {/* Speed selector */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: locked ? '#94A3B8' : '#374151', marginBottom: 6 }}>速度</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, opacity: locked ? 0.4 : 1, pointerEvents: locked ? 'none' : 'auto' }}>
          {(Object.keys(SPEED_PRESETS) as SpeedPreset[]).map((key) => (
            <button
              key={key}
              onClick={() => !locked && setSpeedPreset(key)}
              disabled={locked}
              style={{
                padding: '7px 12px', cursor: locked ? 'not-allowed' : 'pointer', borderRadius: 6, textAlign: 'left', fontSize: 13,
                border: speedPreset === key ? '1.5px solid #3B82F6' : '1px solid #E2E8F0',
                background: speedPreset === key ? '#EFF6FF' : '#fff',
                color: speedPreset === key ? '#1D4ED8' : '#374151',
                fontWeight: speedPreset === key ? 600 : 400,
              }}
            >
              {SPEED_PRESETS[key].label}
            </button>
          ))}
        </div>
      </div>

      {/* Loop toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, opacity: locked ? 0.4 : 1 }}>
        <input id="loop-cb" type="checkbox" checked={loop} onChange={(e) => !locked && setLoop(e.target.checked)} disabled={locked} style={{ accentColor: '#3B82F6', width: 15, height: 15, cursor: locked ? 'not-allowed' : 'pointer' }} />
        <label htmlFor="loop-cb" style={{ fontSize: 13, color: '#374151', cursor: locked ? 'not-allowed' : 'pointer' }}>循環模式</label>
      </div>

      {!canStart && !isRunning && (
        <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 10 }}>請至少選擇兩個路徑點</div>
      )}

      {/* 開始種花 / 停止種花 */}
      <button
        disabled={(!canStart && !isRunning) || loading}
        onClick={() => handleAction(isRunning ? onStopRoute : () => onStartRoute(speed, loop))}
        style={{
          width: '100%', padding: '10px', cursor: (canStart || isRunning) && !loading ? 'pointer' : 'not-allowed',
          background: isRunning ? '#EF4444' : canStart ? '#10B981' : '#E2E8F0',
          color: (canStart || isRunning) ? '#fff' : '#94A3B8',
          border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14,
          transition: 'background 0.15s',
        }}
      >
        {isRunning ? '🛑 停止種花' : '🌸 開始種花'}
      </button>

      {/* Progress */}
      {isRunning && (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748B', marginBottom: 4 }}>
            <span>進度</span>
            <span style={{ fontWeight: 600, color: '#374151' }}>{Math.round(routeStatus.progress * 100)}%{routeStatus.state === 'paused' ? ' · 暫停中' : ''}</span>
          </div>
          <div style={{ background: '#F1F5F9', borderRadius: 4, height: 5, overflow: 'hidden' }}>
            <div style={{ width: `${routeStatus.progress * 100}%`, height: '100%', background: '#3B82F6', transition: 'width 0.3s ease', borderRadius: 4 }} />
          </div>
        </div>
      )}
    </div>
  )
}
