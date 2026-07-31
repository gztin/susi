import { Activity, ChevronDown, Radio, Server, Smartphone } from 'lucide-react'
import { useState } from 'react'
import type { WebSocketConnectionState } from '../hooks/useRoute'
import { useConnectionStatus } from '../hooks/useConnectionStatus'

interface ConnectionStatusProps {
  websocketState: WebSocketConnectionState
}

function endpointPort(endpoint: string): string {
  try {
    const url = new URL(endpoint)
    if (url.port) return url.port
    return url.protocol === 'https:' || url.protocol === 'wss:' ? '443' : '80'
  } catch {
    return '未設定'
  }
}

function StatusDot({ state }: { state: 'online' | 'pending' | 'offline' }) {
  return <span className={`connection-dot is-${state}`} aria-hidden="true" />
}

export function ConnectionStatus({ websocketState }: ConnectionStatusProps) {
  const [isOpen, setIsOpen] = useState(false)
  const status = useConnectionStatus()
  const websocketOnline = websocketState === 'connected'
  const isHealthy = status.apiOnline && websocketOnline && status.tunneldAvailable
  const isPending = status.isLoading || websocketState === 'reconnecting'
  const summary = isPending ? '連線確認中' : isHealthy ? '系統正常' : '連線異常'
  const summaryState = isPending ? 'pending' : isHealthy ? 'online' : 'offline'

  return (
    <aside className={`connection-status${isOpen ? ' is-open' : ''}`} aria-label="系統連線狀態">
      <button
        type="button"
        className="connection-status-trigger"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        <StatusDot state={summaryState} />
        <span>{summary}</span>
        <ChevronDown aria-hidden="true" size={15} strokeWidth={2.4} />
      </button>

      {isOpen && (
        <div className="connection-status-panel">
          <div className="connection-status-heading">
            <div>
              <span>運作狀態</span>
              <strong>{status.endpoints.integrated ? 'Pikmin 整合服務' : '前後端連線'}</strong>
            </div>
            <Activity aria-hidden="true" size={18} strokeWidth={2.2} />
          </div>

          <dl className="connection-status-list">
            <div>
              <dt><StatusDot state="online" />前台</dt>
              <dd><code>{endpointPort(status.endpoints.frontend)}</code><span>此頁運作中</span></dd>
            </div>
            <div>
              <dt><StatusDot state={status.apiOnline ? 'online' : status.isLoading ? 'pending' : 'offline'} />後台 API</dt>
              <dd><code>{endpointPort(status.endpoints.api)}</code><span>{status.apiOnline ? '已連線' : status.isLoading ? '確認中' : '無回應'}</span></dd>
            </div>
            <div>
              <dt><StatusDot state={websocketOnline ? 'online' : websocketState === 'reconnecting' ? 'pending' : 'offline'} />即時連線</dt>
              <dd>
                <Radio aria-hidden="true" size={13} />
                <span>{websocketOnline ? 'WebSocket 正常' : websocketState === 'reconnecting' ? '重新連線中' : '已中斷'}</span>
              </dd>
            </div>
            <div>
              <dt><StatusDot state={status.tunneldAvailable ? 'online' : status.isLoading ? 'pending' : 'offline'} />tunneld</dt>
              <dd>
                <Server aria-hidden="true" size={13} />
                <span>{status.tunneldAvailable ? '運作中' : status.isLoading ? '確認中' : '未運作'}</span>
              </dd>
            </div>
          </dl>

          <div className="connection-tunnels">
            <span className="connection-tunnels-label">
              <Smartphone aria-hidden="true" size={14} />
              裝置 tunnel
            </span>
            {status.tunnels.length > 0 ? status.tunnels.map((tunnel) => (
              <div className="connection-tunnel-row" key={`${tunnel.udid}-${tunnel.port}`}>
                <code>{tunnel.address}:{tunnel.port}</code>
                <span>{tunnel.interface || '已建立'}</span>
              </div>
            )) : (
              <p>{status.apiOnline ? '目前沒有已建立的 tunnel' : '後台恢復後會自動更新'}</p>
            )}
          </div>

          <p className="connection-last-check">
            {status.lastCheckedAt
              ? `上次確認 ${status.lastCheckedAt.toLocaleTimeString('zh-TW', { hour12: false })}`
              : '正在取得狀態'}
          </p>
        </div>
      )}
    </aside>
  )
}
