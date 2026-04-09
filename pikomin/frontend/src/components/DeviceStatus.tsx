import type { DeviceInfo } from '../types'

interface DeviceStatusProps {
  devices: DeviceInfo[]
  selectedDevice: DeviceInfo | null
  onSelectDevice: (id: string) => void
  isLoading: boolean
  error?: string | null
}

export function DeviceStatus({ devices, selectedDevice, onSelectDevice, isLoading, error }: DeviceStatusProps) {
  if (isLoading) {
    return <div style={{ fontSize: 13, color: '#94A3B8', padding: '4px 0' }}>載入裝置中...</div>
  }

  if (error) {
    return <div style={{ fontSize: 13, color: '#EF4444' }}>錯誤：{error}</div>
  }

  if (devices.length === 0) {
    return (
      <div style={{ fontSize: 13, color: '#94A3B8', padding: '4px 0' }}>
        未偵測到裝置，請透過 USB 連接 iPhone
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <select
        style={{
          flex: 1, padding: '7px 10px', borderRadius: 6, border: '1px solid #E2E8F0',
          background: '#fff', color: '#0F172A', fontSize: 13, cursor: 'pointer', outline: 'none',
        }}
        value={selectedDevice?.id ?? ''}
        onChange={(e) => onSelectDevice(e.target.value)}
      >
        <option value="" disabled>選擇裝置</option>
        {devices.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}{d.model ? ` (${d.model})` : ''}
          </option>
        ))}
      </select>
      {selectedDevice && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: selectedDevice.isConnected ? '#10B981' : '#EF4444',
            display: 'inline-block', flexShrink: 0,
          }} />
          <span style={{ fontSize: 12, color: '#64748B', whiteSpace: 'nowrap' }}>
            {selectedDevice.isConnected ? '已連線' : '未連線'}
          </span>
        </div>
      )}
    </div>
  )
}
