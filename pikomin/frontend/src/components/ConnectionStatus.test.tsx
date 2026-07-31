import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ConnectionStatus } from './ConnectionStatus'

vi.mock('../hooks/useConnectionStatus', () => ({
  useConnectionStatus: () => ({
    apiOnline: true,
    tunneldAvailable: true,
    tunnels: [{ udid: 'device-001', address: 'fd00::1', port: 49152, interface: 'utun6' }],
    isLoading: false,
    lastCheckedAt: new Date('2026-07-31T08:00:00+08:00'),
    endpoints: {
      frontend: 'http://localhost:5678',
      api: 'http://localhost:5679',
      websocket: 'ws://localhost:5678',
      integrated: false,
    },
  }),
}))

describe('ConnectionStatus', () => {
  it('shows a healthy summary when every required service is online', () => {
    render(<ConnectionStatus websocketState="connected" />)
    expect(screen.getByRole('button', { name: /系統正常/ })).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the detail panel and shows endpoint and tunnel information', async () => {
    const user = userEvent.setup()
    render(<ConnectionStatus websocketState="connected" />)

    await user.click(screen.getByRole('button', { name: /系統正常/ }))

    expect(screen.getByText('後台 API')).toBeInTheDocument()
    expect(screen.getByText('5679')).toBeInTheDocument()
    expect(screen.getByText('fd00::1:49152')).toBeInTheDocument()
    expect(screen.getByText('utun6')).toBeInTheDocument()
  })

  it('shows a connection error when the websocket is disconnected', () => {
    render(<ConnectionStatus websocketState="disconnected" />)
    expect(screen.getByRole('button', { name: /連線異常/ })).toBeInTheDocument()
  })
})
