import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeviceStatus } from './DeviceStatus'
import * as useDeviceModule from '../hooks/useDevice'
import type { DeviceInfo } from '../types'

vi.mock('../hooks/useDevice')

const mockUseDevice = vi.spyOn(useDeviceModule, 'useDevice')

const mockDevice: DeviceInfo = {
  id: 'device-001',
  name: 'My iPhone',
  isConnected: true,
  model: 'iPhone 15',
}

const disconnectedDevice: DeviceInfo = {
  id: 'device-002',
  name: 'Old iPhone',
  isConnected: false,
}

function setupMock(overrides: Partial<ReturnType<typeof useDeviceModule.useDevice>>) {
  mockUseDevice.mockReturnValue({
    devices: [],
    selectedDevice: null,
    selectDevice: vi.fn(),
    isLoading: false,
    error: null,
    ...overrides,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DeviceStatus', () => {
  it('載入中時顯示載入狀態', () => {
    setupMock({ isLoading: true })
    render(<DeviceStatus />)
    expect(screen.getByText('載入裝置中...')).toBeTruthy()
  })

  it('發生錯誤時顯示錯誤訊息', () => {
    setupMock({ error: 'Network error' })
    render(<DeviceStatus />)
    expect(screen.getByText(/Network error/)).toBeTruthy()
  })

  it('無裝置時顯示提示訊息', () => {
    setupMock({ devices: [] })
    render(<DeviceStatus />)
    expect(screen.getByText('未偵測到裝置，請透過 USB 連接 iPhone')).toBeTruthy()
  })

  it('有裝置時顯示下拉選單', () => {
    setupMock({ devices: [mockDevice] })
    render(<DeviceStatus />)
    expect(screen.getByRole('combobox')).toBeTruthy()
    expect(screen.getByText('My iPhone (iPhone 15)')).toBeTruthy()
  })

  it('已選裝置且已連線時顯示綠色指示燈', () => {
    setupMock({ devices: [mockDevice], selectedDevice: mockDevice })
    render(<DeviceStatus />)
    expect(screen.getByText('已連線')).toBeTruthy()
  })

  it('已選裝置但未連線時顯示紅色指示燈', () => {
    setupMock({ devices: [disconnectedDevice], selectedDevice: disconnectedDevice })
    render(<DeviceStatus />)
    expect(screen.getByText('未連線')).toBeTruthy()
  })

  it('選擇裝置時呼叫 selectDevice', async () => {
    const selectDevice = vi.fn()
    setupMock({ devices: [mockDevice], selectDevice })
    render(<DeviceStatus />)
    const select = screen.getByRole('combobox')
    await userEvent.selectOptions(select, 'device-001')
    expect(selectDevice).toHaveBeenCalledWith('device-001')
  })

  it('selectedDevice 變更時呼叫 onDeviceSelect', () => {
    const onDeviceSelect = vi.fn()
    setupMock({ devices: [mockDevice], selectedDevice: mockDevice })
    render(<DeviceStatus onDeviceSelect={onDeviceSelect} />)
    expect(onDeviceSelect).toHaveBeenCalledWith(mockDevice)
  })

  it('selectedDevice 為 null 時呼叫 onDeviceSelect(null)', () => {
    const onDeviceSelect = vi.fn()
    setupMock({ devices: [mockDevice], selectedDevice: null })
    render(<DeviceStatus onDeviceSelect={onDeviceSelect} />)
    expect(onDeviceSelect).toHaveBeenCalledWith(null)
  })
})
