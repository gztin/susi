import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient, createStatusWebSocket } from '../api/client'
import type { GPSCoordinate, RouteStatus, StatusUpdate } from '../types'

const INITIAL_ROUTE_STATUS: RouteStatus = {
  state: 'idle',
  currentPosition: null,
  progress: 0,
}

export function useRoute(
  deviceId: string | null,
  initialPosition?: GPSCoordinate | null,
  onRouteError?: (message: string) => void,
): {
  waypoints: GPSCoordinate[]
  addWaypoint: (coord: GPSCoordinate) => void
  removeWaypoint: (index: number) => void
  clearWaypoints: () => void
  routeStatus: RouteStatus
  startRoute: (speed: number, loop: boolean) => Promise<void>
  pauseRoute: () => Promise<void>
  resumeRoute: () => Promise<void>
  stopRoute: () => Promise<void>
  resetLocation: () => Promise<void>
} {
  const [waypoints, setWaypoints] = useState<GPSCoordinate[]>([])
  const [routeStatus, setRouteStatus] = useState<RouteStatus>(INITIAL_ROUTE_STATUS)
  const currentPositionRef = useRef<GPSCoordinate | null>(initialPosition ?? null)
  const lastWsPositionAtRef = useRef(0)

  useEffect(() => {
    if (initialPosition && !currentPositionRef.current) {
      currentPositionRef.current = initialPosition
    }
  }, [initialPosition])

  const handleWsMessage = useCallback((update: StatusUpdate) => {
    if (update.type === 'position') {
      const data = update.data as { latitude?: number; longitude?: number; progress?: number }
      if (data.latitude !== undefined && data.longitude !== undefined) {
        lastWsPositionAtRef.current = Date.now()
        const coord: GPSCoordinate = { latitude: data.latitude, longitude: data.longitude }
        currentPositionRef.current = coord
        setRouteStatus((prev) => ({
          ...prev,
          state: 'moving',
          currentPosition: coord,
          progress: data.progress ?? prev.progress,
        }))
      }
      return
    }

    if (update.type === 'status') {
      const data = update.data as Partial<{
        state: RouteStatus['state']
        current_position: GPSCoordinate | null
        progress: number
      }>

      setRouteStatus((prev) => {
        const next: RouteStatus = {
          state: (data.state as RouteStatus['state']) ?? prev.state,
          currentPosition: data.current_position ?? prev.currentPosition,
          progress: data.progress ?? prev.progress,
        }
        currentPositionRef.current = next.currentPosition
        return next
      })
      return
    }

    if (update.type === 'route_error') {
      const data = update.data as { message?: string }
      if (data.message) {
        onRouteError?.(data.message)
      }
    }
  }, [onRouteError])

  useEffect(() => {
    const ws = createStatusWebSocket(handleWsMessage)
    return () => {
      ws.close()
    }
  }, [handleWsMessage])

  useEffect(() => {
    if (routeStatus.state !== 'moving' && routeStatus.state !== 'paused') return

    let cancelled = false
    const timer = setInterval(async () => {
      // WS 仍在穩定推送時，不要用輪詢結果覆蓋，避免位置拉扯
      if (Date.now() - lastWsPositionAtRef.current < 1500) return

      try {
        const status = await apiClient.getStatus()
        if (cancelled) return
        setRouteStatus((prev) => {
          const next: RouteStatus = {
            state: status.state ?? prev.state,
            currentPosition: status.currentPosition ?? prev.currentPosition,
            progress: status.progress ?? prev.progress,
          }
          currentPositionRef.current = next.currentPosition
          return next
        })
      } catch {
        // fallback polling should be silent
      }
    }, 500)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [routeStatus.state])

  const addWaypoint = useCallback((coord: GPSCoordinate) => {
    setWaypoints((prev) => [...prev, coord])
  }, [])

  const removeWaypoint = useCallback((index: number) => {
    setWaypoints((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clearWaypoints = useCallback(() => {
    setWaypoints([])
  }, [])

  const startRoute = useCallback(
    async (speed: number, loop: boolean) => {
      if (!deviceId) throw new Error('No device selected')
      await apiClient.startRoute({ deviceId, waypoints, speed, loop })
      setRouteStatus((prev) => ({ ...prev, state: 'moving', progress: 0 }))
    },
    [deviceId, waypoints],
  )

  const pauseRoute = useCallback(async () => {
    await apiClient.pauseRoute()
  }, [])

  const resumeRoute = useCallback(async () => {
    await apiClient.resumeRoute()
  }, [])

  const stopRoute = useCallback(async () => {
    await apiClient.stopRoute()
    setRouteStatus((prev) => ({ ...prev, state: 'idle', progress: 0 }))
  }, [])

  const resetLocation = useCallback(async () => {
    if (!deviceId) throw new Error('No device selected')
    await apiClient.resetLocation(deviceId)
    setRouteStatus((prev) => ({ ...prev, currentPosition: null, state: 'idle', progress: 0 }))
    currentPositionRef.current = null
  }, [deviceId])

  return {
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
  }
}
