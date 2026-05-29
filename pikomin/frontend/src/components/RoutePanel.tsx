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

const JOG_SPEED = 15 / 3.6
const JOG_SPEED_LABEL = '小跑步 15 km/h'

export function RoutePanel({
  waypoints,
  routeStatus,
  onStartRoute,
  onPauseRoute,
  onResumeRoute,
  onStopRoute,
}: RoutePanelProps) {
  const [loop, setLoop] = useState(false)
  const [loading, setLoading] = useState(false)

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
      <label className="toggle-row">
        <input
          type="checkbox"
          checked={loop}
          onChange={(e) => setLoop(e.target.checked)}
          disabled={locked}
        />
        <span>循環路線</span>
      </label>

      {isRunning && (
        <div className="progress-block">
          <div className="progress-label">
            <span>{isPaused ? '路線已暫停' : '路線移動中'}</span>
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
            className="primary-button route-start-button"
            onClick={() => void withLoading(() => onStartRoute(JOG_SPEED, loop))}
            disabled={!canStart || loading}
          >
            <span>{loading ? '啟動中' : '開始種花'}</span>
            <small>{JOG_SPEED_LABEL}</small>
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
