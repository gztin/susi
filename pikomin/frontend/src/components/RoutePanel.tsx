import { useState } from 'react'
import type { GPSCoordinate, RouteStatus } from '../types'

interface RoutePanelProps {
  waypoints: GPSCoordinate[]
  routeStatus: RouteStatus
  onStartRoute: (speed: number, loop: boolean) => Promise<void>
  onPauseRoute: () => Promise<void>
  onResumeRoute: () => Promise<void>
  onStopRoute: () => Promise<void>
}

type MoveStyle = 'walk' | 'fast_walk'

const MOVE_STYLE_OPTIONS: Record<MoveStyle, { label: string; helper: string; speedMs: number }> = {
  walk: { label: '走路', helper: '2 km/h', speedMs: 2 / 3.6 },
  fast_walk: { label: '快步走', helper: '3.5 km/h', speedMs: 3.5 / 3.6 },
}

export function RoutePanel({
  waypoints,
  routeStatus,
  onStartRoute,
  onPauseRoute,
  onResumeRoute,
  onStopRoute,
}: RoutePanelProps) {
  const [moveStyle, setMoveStyle] = useState<MoveStyle>('walk')
  const [loop, setLoop] = useState(false)
  const [loading, setLoading] = useState(false)

  const speed = MOVE_STYLE_OPTIONS[moveStyle].speedMs
  const canStart = waypoints.length >= 2
  const isMoving = routeStatus.state === 'moving'
  const isPaused = routeStatus.state === 'paused'
  const isRunning = isMoving || isPaused
  const locked = isRunning || loading

  async function withLoading(action: () => Promise<void>) {
    setLoading(true)
    try {
      await action()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="route-panel">
      <label className="field">
        <span>移動方式</span>
        <select
          value={moveStyle}
          onChange={(e) => setMoveStyle(e.target.value as MoveStyle)}
          disabled={locked}
        >
          <option value="walk">走路 (2 km/h)</option>
          <option value="fast_walk">快步走 (3.5 km/h)</option>
        </select>
      </label>

      <label className="toggle-row">
        <input
          type="checkbox"
          checked={loop}
          onChange={(e) => setLoop(e.target.checked)}
          disabled={locked}
        />
        <span>循環模式</span>
      </label>

      {isRunning && (
        <div className="progress-block">
          <div className="progress-label">
            <span>{isPaused ? '路徑已暫停' : '路徑執行中'}</span>
            <strong>{Math.round(routeStatus.progress * 100)}%</strong>
          </div>
          <div className="progress-bar">
            <div style={{ transform: `scaleX(${routeStatus.progress})` }} />
          </div>
        </div>
      )}

      <div className="route-actions">
        {!isRunning ? (
          <button
            className="primary-button"
            onClick={() => void withLoading(() => onStartRoute(speed, loop))}
            disabled={!canStart || loading}
          >
            開始種花
          </button>
        ) : (
          <>
            {isMoving ? (
              <button className="secondary-button" onClick={() => void withLoading(onPauseRoute)} disabled={loading}>
                暫停
              </button>
            ) : (
              <button className="secondary-button" onClick={() => void withLoading(onResumeRoute)} disabled={loading}>
                繼續
              </button>
            )}
            <button className="accent-button" onClick={() => void withLoading(onStopRoute)} disabled={loading}>
              停止
            </button>
          </>
        )}
      </div>
    </div>
  )
}
