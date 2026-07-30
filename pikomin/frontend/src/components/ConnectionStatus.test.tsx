import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ConnectionStatus } from './ConnectionStatus'
import * as connectionStatusModule from '../hooks/useConnectionStatus'

vi.mock('../hooks/useConnectionStatus')

const useConnectionStatusMock = vi.mocked(connectionStatusModule.useConnectionStatus)

describe('ConnectionStatus', () => {
  beforeEach(() => {
    useConnectionStatusMock.mockReturnValue({
      apiOnline: true,
      tunneldAvailable: true,
      tunnels: [{
        udid: 'device-1',
        address: 'fd00::1',
        port: 62078,
        interface: 'utun4',
      }],
      isLoading: false,
      lastCheckedAt: new Date('2026-07-27T08:00:00+08:00'),
      endpoints: {
        frontend: 'http://localhost:5678',
        api: 'http://localhost:5679',
        websocket: 'ws://localhost:5678',
        integrated: false,
      },
    })
  })

  it('shows a healthy summary while collapsed', () => {
    render(<ConnectionStatus websocketState="connected" />)

    expect(screen.getByRole('button', { name: /系統正常/ })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('後台 API')).not.toBeInTheDocument()
  })

  it('reveals ports and tunnel details when expanded', async () => {
    const user = userEvent.setup()
    render(<ConnectionStatus websocketState="connected" />)

    await user.click(screen.getByRole('button', { name: /系統正常/ }))

    expect(screen.getByText('前後台連線')).toBeInTheDocument()
    expect(screen.getByText('5678')).toBeInTheDocument()
    expect(screen.getByText('5679')).toBeInTheDocument()
    expect(screen.getByText('fd00::1:62078')).toBeInTheDocument()
    expect(screen.getByText('WebSocket 正常')).toBeInTheDocument()
  })

  it('reports an error when the API and websocket are offline', () => {
    useConnectionStatusMock.mockReturnValue({
      apiOnline: false,
      tunneldAvailable: false,
      tunnels: [],
      isLoading: false,
      lastCheckedAt: new Date(),
      endpoints: {
        frontend: 'http://127.0.0.1:5688',
        api: 'http://127.0.0.1:5688',
        websocket: 'ws://127.0.0.1:5688',
        integrated: true,
      },
    })

    render(<ConnectionStatus websocketState="disconnected" />)

    expect(screen.getByRole('button', { name: /連線異常/ })).toBeInTheDocument()
  })
})
