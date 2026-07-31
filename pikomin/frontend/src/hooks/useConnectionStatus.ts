import { useCallback, useEffect, useRef, useState } from 'react'
import { apiClient } from '../api/client'

export interface ConnectionStatusState {
  apiOnline: boolean
  tunneldAvailable: boolean
  tunnels: { udid: string; address: string; port: number; interface: string }[]
  isLoading: boolean
  lastCheckedAt: Date | null
  endpoints: {
    frontend: string
    api: string
    websocket: string
    integrated: boolean
  }
}

function getEndpoints(): ConnectionStatusState['endpoints'] {
  const frontend = window.location.origin
  const configuredApi = (typeof import.meta !== 'undefined' && (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL) || ''
  const api = configuredApi || (
    window.location.port === '5678'
      ? `${window.location.protocol}//${window.location.hostname}:5679`
      : frontend
  )
  const websocket = configuredApi
    ? configuredApi.replace(/^http/, 'ws')
    : `ws://${window.location.host}`

  return {
    frontend,
    api,
    websocket,
    integrated: !configuredApi && window.location.port !== '5678',
  }
}

export function useConnectionStatus(): ConnectionStatusState {
  const [status, setStatus] = useState<ConnectionStatusState>({
    apiOnline: false,
    tunneldAvailable: false,
    tunnels: [],
    isLoading: true,
    lastCheckedAt: null,
    endpoints: getEndpoints(),
  })
  const mountedRef = useRef(true)

  const refresh = useCallback(async () => {
    try {
      const [, tunnelStatus] = await Promise.all([
        apiClient.getStatus(),
        apiClient.getTunnelStatus(),
      ])
      if (!mountedRef.current) return
      setStatus((current) => ({
        ...current,
        apiOnline: true,
        tunneldAvailable: tunnelStatus.tunneldAvailable,
        tunnels: tunnelStatus.tunnels,
        isLoading: false,
        lastCheckedAt: new Date(),
      }))
    } catch {
      if (!mountedRef.current) return
      setStatus((current) => ({
        ...current,
        apiOnline: false,
        tunneldAvailable: false,
        tunnels: [],
        isLoading: false,
        lastCheckedAt: new Date(),
      }))
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    void refresh()
    const timer = window.setInterval(() => void refresh(), 5000)

    return () => {
      mountedRef.current = false
      window.clearInterval(timer)
    }
  }, [refresh])

  return status
}
