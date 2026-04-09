import type {
  DeviceInfo,
  SetLocationRequest,
  RouteRequest,
  RouteStatus,
  StatusUpdate,
} from '../types'

const BASE_URL = (typeof import.meta !== 'undefined' && (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL) || ''

// 空字串 = 相對路徑，走 Vite proxy；有設定 VITE_API_URL 時用絕對路徑
const WS_BASE_URL = BASE_URL ? BASE_URL.replace(/^http/, 'ws') : `ws://${window.location.host}`

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw Object.assign(new Error(body.error ?? `HTTP ${res.status}`), {
      status: res.status,
      code: body.code,
    })
  }
  // 204 No Content
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// Snake_case → camelCase mapping for DeviceInfo
function mapDevice(d: {
  id: string
  name: string
  is_connected: boolean
  model?: string
}): DeviceInfo {
  return {
    id: d.id,
    name: d.name,
    isConnected: d.is_connected,
    model: d.model,
  }
}

// Snake_case → camelCase mapping for RouteStatus
function mapRouteStatus(s: {
  state: string
  current_position: { latitude: number; longitude: number } | null
  progress: number
  device_id?: string | null
}): RouteStatus {
  return {
    state: s.state as RouteStatus['state'],
    currentPosition: s.current_position,
    progress: s.progress,
  }
}

export const apiClient = {
  async getDevices(): Promise<DeviceInfo[]> {
    const data = await request<
      { id: string; name: string; is_connected: boolean; model?: string }[]
    >('/api/devices')
    return data.map(mapDevice)
  },

  async setLocation(req: SetLocationRequest): Promise<void> {
    await request<void>('/api/location', {
      method: 'POST',
      body: JSON.stringify({
        latitude: req.latitude,
        longitude: req.longitude,
        device_id: req.deviceId,
      }),
    })
  },

  async startRoute(req: RouteRequest): Promise<void> {
    await request<void>('/api/route/start', {
      method: 'POST',
      body: JSON.stringify({
        device_id: req.deviceId,
        waypoints: req.waypoints,
        speed: req.speed,
        loop: req.loop,
      }),
    })
  },

  async pauseRoute(): Promise<void> {
    await request<void>('/api/route/pause', { method: 'POST' })
  },

  async resumeRoute(): Promise<void> {
    await request<void>('/api/route/resume', { method: 'POST' })
  },

  async stopRoute(): Promise<void> {
    await request<void>('/api/route/stop', { method: 'POST' })
  },

  async getStatus(): Promise<RouteStatus> {
    const data = await request<{
      state: string
      current_position: { latitude: number; longitude: number } | null
      progress: number
      device_id?: string | null
    }>('/api/status')
    return mapRouteStatus(data)
  },

  async setRsd(deviceId: string, address: string, port: number): Promise<void> {
    await request<void>('/api/rsd', {
      method: 'POST',
      body: JSON.stringify({ device_id: deviceId, address, port }),
    })
  },

  async resetLocation(deviceId: string): Promise<void> {
    await request<void>('/api/location/reset', {
      method: 'POST',
      body: JSON.stringify({ device_id: deviceId }),
    })
  },

  async getGeolocation(): Promise<{ latitude: number; longitude: number; city: string }> {
    return request('/api/geolocation')
  },
}

const MAX_RETRIES = 5
const BASE_DELAY_MS = 1000

export function createStatusWebSocket(
  onMessage: (status: StatusUpdate) => void
): WebSocket {
  let ws: WebSocket
  let retryCount = 0
  let closed = false

  function connect(): WebSocket {
    const socket = new WebSocket(`${WS_BASE_URL}/ws/status`)

    socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data as string) as StatusUpdate
        onMessage(data)
      } catch {
        // ignore malformed messages
      }
    })

    socket.addEventListener('close', () => {
      if (closed) return
      if (retryCount >= MAX_RETRIES) {
        onMessage({ type: 'status', data: { connected: false, reconnecting: false } })
        return
      }
      const delay = BASE_DELAY_MS * Math.pow(2, retryCount) // 1s, 2s, 4s, 8s, 16s
      retryCount++
      onMessage({ type: 'status', data: { connected: false, reconnecting: true, attempt: retryCount } })
      setTimeout(() => {
        if (!closed) {
          ws = connect()
        }
      }, delay)
    })

    socket.addEventListener('open', () => {
      retryCount = 0
      onMessage({ type: 'status', data: { connected: true, reconnecting: false } })
    })

    socket.addEventListener('error', () => {
      // error is always followed by close; handled there
    })

    return socket
  }

  ws = connect()

  // Proxy object so callers can call ws.close() to stop reconnecting
  return new Proxy({} as WebSocket, {
    get(_target, prop) {
      if (prop === 'close') {
        return () => {
          closed = true
          ws.close()
        }
      }
      const value = (ws as unknown as Record<string | symbol, unknown>)[prop]
      return typeof value === 'function' ? value.bind(ws) : value
    },
  })
}
