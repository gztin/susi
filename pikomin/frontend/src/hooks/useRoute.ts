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

  useEffect(() => {
    if (initialPosition && !currentPositionRef.current) {
      currentPositionRef.current = initialPosition
    }
  }, [initialPosition])

  const handleWsMessage = useCallback((update: StatusUpdate) => {
    if (update.type === 'position') {
      const data = update.data as { latitude?: number; longitude?: number; progress?: number }
      if (data.latitude !== undefined && data.longitude !== undefined) {
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
