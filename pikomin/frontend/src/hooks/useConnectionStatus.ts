import { useCallback, useEffect, useRef, useState } from 'react'
import { apiClient, getConnectionEndpoints } from '../api/client'
import type { TunnelInfo } from './useTunnel'

export interface ConnectionStatusState {
  apiOnline: boolean
  tunneldAvailable: boolean
  tunnels: TunnelInfo[]
  isLoading: boolean
  lastCheckedAt: Date | null
  endpoints: ReturnType<typeof getConnectionEndpoints>
}

const POLL_INTERVAL_MS = 5000

export function useConnectionStatus(): ConnectionStatusState {
  const [state, setState] = useState<ConnectionStatusState>({
    apiOnline: false,
    tunneldAvailable: false,
    tunnels: [],
    isLoading: true,
    lastCheckedAt: null,
    endpoints: getConnectionEndpoints(),
  })
  const mountedRef = useRef(true)

  const refresh = useCallback(async () => {
    try {
      const [, tunnelStatus] = await Promise.all([
        apiClient.getStatus(),
        apiClient.getTunnelStatus(),
      ])
      if (!mountedRef.current) return
      setState((previous) => ({
        ...previous,
        apiOnline: true,
        tunneldAvailable: tunnelStatus.tunneldAvailable,
        tunnels: tunnelStatus.tunnels,
        isLoading: false,
        lastCheckedAt: new Date(),
      }))
    } catch {
      if (!mountedRef.current) return
      setState((previous) => ({
        ...previous,
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
    const timer = window.setInterval(() => void refresh(), POLL_INTERVAL_MS)
    return () => {
      mountedRef.current = false
      window.clearInterval(timer)
    }
  }, [refresh])

  return state
}
