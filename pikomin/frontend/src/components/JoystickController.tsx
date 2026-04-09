import { useEffect, useRef } from 'react'
import nipplejs, { JoystickManager, JoystickOutputData } from 'nipplejs'
import { MoveVector } from '../types'

interface JoystickControllerProps {
  speed: number           // m/s，1~10
  onMove: (vector: MoveVector) => void
  onRelease: () => void
  disabled?: boolean
}

/**
 * 將 nipplejs 數學角度（0 = 右，逆時針）轉換為方位角（0 = 正北，順時針）
 */
export function nippleAngleToBearing(nippleAngle: number): number {
  return (90 - nippleAngle + 360) % 360
}

export default function JoystickController({
  onMove,
  onRelease,
  disabled = false,
}: JoystickControllerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const managerRef = useRef<JoystickManager | null>(null)
  const throttleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastVectorRef = useRef<MoveVector | null>(null)

  useEffect(() => {
    if (!containerRef.current || disabled) return

    const manager = nipplejs.create({
      zone: containerRef.current,
      mode: 'static',
      position: { left: '50%', top: '50%' },
      size: 120,
      color: '#3b82f6',
    })
    managerRef.current = manager

    const handleMove = (_: unknown, data: JoystickOutputData) => {
      if (!data.angle || data.distance === undefined) return

      const bearing = nippleAngleToBearing(data.angle.degree)
      const magnitude = Math.min(data.distance / 60, 1.0) // 60 = size/2

      lastVectorRef.current = { angle: bearing, magnitude }

      // 若尚未排程，立即發送並設定 200ms throttle
      if (!throttleTimerRef.current) {
        onMove({ angle: bearing, magnitude })
        throttleTimerRef.current = setTimeout(() => {
          throttleTimerRef.current = null
          // 若搖桿仍在移動，發送最新向量
          if (lastVectorRef.current) {
            onMove(lastVectorRef.current)
          }
        }, 200)
      }
    }

    const handleEnd = () => {
      lastVectorRef.current = null
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current)
        throttleTimerRef.current = null
      }
      onRelease()
    }

    manager.on('move', handleMove)
    manager.on('end', handleEnd)

    return () => {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current)
        throttleTimerRef.current = null
      }
      manager.destroy()
      managerRef.current = null
    }
  }, [disabled, onMove, onRelease])

  return (
    <div
      style={{
        position: 'relative',
        width: 160,
        height: 160,
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        userSelect: 'none',
      }}
    >
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#1e293b' }}
      />
    </div>
  )
}
