export interface GPSCoordinate {
  latitude: number
  longitude: number
}

export interface DeviceInfo {
  id: string
  name: string
  isConnected: boolean
  model?: string
}

export interface SetLocationRequest {
  latitude: number
  longitude: number
  deviceId: string
}

export interface RouteRequest {
  deviceId: string
  waypoints: GPSCoordinate[]
  speed: number
  loop: boolean
}

export type SimulationState = 'idle' | 'moving' | 'paused'

export interface RouteStatus {
  state: SimulationState
  currentPosition: GPSCoordinate | null
  progress: number // 0.0 ~ 1.0
}

export interface MoveVector {
  angle: number     // 方位角，0 = 正北，順時針，單位：度
  magnitude: number // 0.0 ~ 1.0，搖桿偏移比例
}

export interface StatusUpdate {
  type: string
  data: Record<string, unknown>
}
