import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import { useDevice } from '../hooks/useDevice'
import type { DeviceInfo } from '../types'

interface DeviceStatusProps {
  devices?: DeviceInfo[]
  selectedDevice?: DeviceInfo | null
  onSelectDevice?: (id: string) => void
  onDeviceSelect?: (device: DeviceInfo | null) => void
  isLoading?: boolean
  error?: string | null
}

export function DeviceStatus({
  devices,
  selectedDevice,
  onSelectDevice,
  onDeviceSelect,
  isLoading,
  error,
}: DeviceStatusProps) {
  const [developerModeMessage, setDeveloperModeMessage] = useState<string | null>(null)
  const [developerModeError, setDeveloperModeError] = useState<string | null>(null)
  const [isRevealingDeveloperMode, setIsRevealingDeveloperMode] = useState(false)

  const needsFallback =
    devices === undefined ||
    selectedDevice === undefined ||
    onSelectDevice === undefined ||
    isLoading === undefined ||
    error === undefined

  const deviceState = useDevice(needsFallback)
  const resolvedDevices = devices ?? deviceState.devices
  const resolvedSelectedDevice = selectedDevice ?? deviceState.selectedDevice
  const resolvedSelectDevice = onSelectDevice ?? deviceState.selectDevice
  const resolvedLoading = isLoading ?? deviceState.isLoading
  const resolvedError = error ?? deviceState.error

  useEffect(() => {
    onDeviceSelect?.(resolvedSelectedDevice)
    setDeveloperModeMessage(null)
    setDeveloperModeError(null)
  }, [onDeviceSelect, resolvedSelectedDevice])

  async function handleRevealDeveloperMode() {
    if (!resolvedSelectedDevice) return
    setIsRevealingDeveloperMode(true)
    setDeveloperModeMessage(null)
    setDeveloperModeError(null)
    try {
      await apiClient.revealDeveloperMode(resolvedSelectedDevice.id)
      setDeveloperModeMessage('已請 iPhone 顯示 Developer Mode 選項，請到設定 > 隱私權與安全性開啟並重開機確認。')
    } catch (err) {
      setDeveloperModeError(err instanceof Error ? err.message : '無法顯示 Developer Mode 選項')
    } finally {
      setIsRevealingDeveloperMode(false)
    }
  }

  if (resolvedLoading) {
    return <div className="helper-text">載入裝置中...</div>
  }

  if (resolvedError) {
    return <div className="helper-text helper-text--error">錯誤：{resolvedError}</div>
  }

  if (resolvedDevices.length === 0) {
    return <div className="helper-text">未偵測到裝置，請用 USB 連接 iPhone 並確認 tunnel 已啟動。</div>
  }

  return (
    <div className="device-select">
      <label className="field">
        <span>選擇裝置</span>
        <div className="device-select-wrap">
          <span className={`device-led select-led ${resolvedSelectedDevice?.isConnected ? 'is-online' : 'is-offline'}`} />
          <span className="sr-only">{resolvedSelectedDevice?.isConnected ? '已連線' : '未連線'}</span>
          <select
            value={resolvedSelectedDevice?.id ?? ''}
            onChange={(e) => resolvedSelectDevice(e.target.value)}
            className="device-select-input"
          >
            <option value="" disabled>
              請選擇裝置
            </option>
            {resolvedDevices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name}
                {device.model ? ` (${device.model})` : ''}
              </option>
            ))}
          </select>
        </div>
      </label>

      {resolvedSelectedDevice && resolvedSelectedDevice.developerModeEnabled !== true && (
        <div className="developer-mode-tools">
          <button
            type="button"
            className="secondary-button"
            onClick={handleRevealDeveloperMode}
            disabled={isRevealingDeveloperMode}
          >
            {isRevealingDeveloperMode ? '處理中...' : '顯示 Developer Mode'}
          </button>
          {developerModeMessage && <p className="helper-text">{developerModeMessage}</p>}
          {developerModeError && <p className="helper-text helper-text--error">{developerModeError}</p>}
        </div>
      )}
    </div>
  )
}
