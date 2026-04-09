import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient, createStatusWebSocket } from '../api/client'
import type { GPSCoordinate, RouteStatus, MoveVector, StatusUpdate } from '../types'

// Calculate new GPS coordinate from current position, bearing (degrees), and speed (m/s)
// over a 200ms interval using spherical trigonometry.
function calcOffset(current: GPSCoordinate, angleDeg: number, speedMs: number): GPSCoordinate {
  const R = 6371000
  const d = speedMs * 0.2 // 200ms
  const bearing = (angleDeg * Math.PI) / 180
  const lat1 = (current.latitude * Math.PI) / 180
  const lng1 = (current.longitude * Math.PI) / 180
  const ad = d / R
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(ad) + Math.cos(lat1) * Math.sin(ad) * Math.cos(bearing),
  )
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(ad) * Math.cos(lat1),
      Math.cos(ad) - Math.sin(lat1) * Math.sin(lat2),
    )
  return { latitude: (lat2 * 180) / Math.PI, longitude: (lng2 * 180) / Math.PI }
}

const INITIAL_ROUTE_STATUS: RouteStatus = {
  state: 'idle',
  currentPosition: null,
  progress: 0,
}

export function useRoute(deviceId: string | null, initialPosition?: GPSCoordinate | null): {
  waypoints: GPSCoordinate[]
  addWaypoint: (coord: GPSCoordinate) => void
  removeWaypoint: (index: number) => void
  clearWaypoints: () => void
  routeStatus: RouteStatus
  startRoute: (speed: number, loop: boolean) => Promise<void>
  pauseRoute: () => Promise<void>
  resumeRoute: () => Promise<void>
  stopRoute: () => Promise<void>
  joystickMove: (vector: MoveVector, speed: number) => Promise<void>
} {
  const [waypoints, setWaypoints] = useState<GPSCoordinate[]>([])
  const [routeStatus, setRouteStatus] = useState<RouteStatus>(INITIAL_ROUTE_STATUS)

  // Keep a ref to the latest currentPosition for joystick calculations
  const currentPositionRef = useRef<GPSCoordinate | null>(initialPosition ?? null)

  // Update ref when initialPosition changes
  useEffect(() => {
    if (initialPosition && !currentPositionRef.current) {
      currentPositionRef.current = initialPosition
    }
  }, [initialPosition])

  // WebSocket ref so we can close it on cleanup
  const wsRef = useRef<WebSocket | null>(null)

  // Handle incoming WebSocket status updates
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
    } else if (update.type === 'status') {
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
    }
  }, [])

  // Connect WebSocket on mount
  useEffect(() => {
    const ws = createStatusWebSocket(handleWsMessage)
    wsRef.current = ws
    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [handleWsMessage])

  // Waypoint management
  const addWaypoint = useCallback((coord: GPSCoordinate) => {
    setWaypoints((prev) => [...prev, coord])
  }, [])

  const removeWaypoint = useCallback((index: number) => {
    setWaypoints((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clearWaypoints = useCallback(() => {
    setWaypoints([])
  }, [])

  // Route control
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

  // Joystick control: calculate new coordinate from bearing + speed and push to backend
  const joystickMove = useCallback(
    async (vector: MoveVector, speed: number) => {
      if (!deviceId) return
      const current = currentPositionRef.current
      if (!current) return

      const effectiveSpeed = speed * vector.magnitude
      if (effectiveSpeed <= 0) return

      const newCoord = calcOffset(current, vector.angle, effectiveSpeed)
      await apiClient.setLocation({
        latitude: newCoord.latitude,
        longitude: newCoord.longitude,
        deviceId,
      })
      // Optimistically update local position
      currentPositionRef.current = newCoord
      setRouteStatus((prev) => ({ ...prev, currentPosition: newCoord }))
    },
    [deviceId],
  )

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
    joystickMove,
  }
}
