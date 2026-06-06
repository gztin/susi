import { useState } from 'react'
import { CircleStop, Pause, Play, RefreshCw } from 'lucide-react'
import type { GPSCoordinate, RouteStatus } from '../types'

interface RoutePanelProps {
  waypoints: GPSCoordinate[]
  routeStatus: RouteStatus
  isRouteOptimized: boolean
  routeCycleDuration: string | null
  onOptimizeRoute: () => void
  onStartRoute: (speed: number, loop: boolean) => Promise<void>
  onPauseRoute: () => Promise<void>
  onResumeRoute: () => Promise<void>
  onStopRoute: () => Promise<void>
}

const JOG_SPEED = 20 / 3.6
const JOG_SPEED_LABEL = '小跑步 20 km/h'

export function RoutePanel({
  waypoints,
  routeStatus,
  isRouteOptimized,
  routeCycleDuration,
  onOptimizeRoute,
  onStartRoute,
  onPauseRoute,
  onResumeRoute,
  onStopRoute,
}: RoutePanelProps) {
  const [loop, setLoop] = useState(false)
  const [loading, setLoading] = useState(false)

  const canOptimize = waypoints.length >= 3
  const canStart = canOptimize && isRouteOptimized
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
          onChange={(event) => setLoop(event.target.checked)}
          disabled={locked}
        />
        <span>循環路線</span>
      </label>

      {!isRunning && (
        <button
          className={`secondary-button route-optimize-button${isRouteOptimized ? ' is-active' : ''}`}
          onClick={onOptimizeRoute}
          disabled={!canOptimize || locked}
          type="button"
        >
          最佳路線規劃
        </button>
      )}

      {routeCycleDuration && !isRunning && (
        <p className="route-duration-summary">
          走完一圈約 {routeCycleDuration}
        </p>
      )}

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
            type="button"
          >
            <span>{loading ? '啟動中' : '開始種花'}</span>
            <small>{isRouteOptimized ? JOG_SPEED_LABEL : '先完成最佳路線規劃'}</small>
          </button>
        ) : (
          <>
            {isMoving ? (
              <button
                className="icon-button route-control-icon-button"
                onClick={() => void withLoading(onPauseRoute)}
                disabled={loading}
                aria-label="??"
                title="??"
                type="button"
              >
                <Pause aria-hidden="true" size={22} strokeWidth={2.4} />
              </button>
            ) : (
              <>
                <button
                  className={`icon-button route-control-icon-button route-optimize-button${isRouteOptimized ? ' is-active' : ''}`}
                  onClick={onOptimizeRoute}
                  disabled={!canOptimize || loading}
                  aria-label="????"
                title="????"
                type="button"
              >
                <RefreshCw aria-hidden="true" size={22} strokeWidth={2.4} />
                </button>
                <button
                  className="icon-button route-control-icon-button"
                  onClick={() => void withLoading(onResumeRoute)}
                  disabled={loading}
                  aria-label="??"
                title="??"
                type="button"
              >
                <Play aria-hidden="true" size={22} strokeWidth={2.4} />
                </button>
              </>
            )}
            <button
              className="icon-button route-control-icon-button danger"
              onClick={() => void withLoading(onStopRoute)}
              disabled={loading}
              aria-label="??"
                title="??"
                type="button"
              >
                <CircleStop aria-hidden="true" size={22} strokeWidth={2.4} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
