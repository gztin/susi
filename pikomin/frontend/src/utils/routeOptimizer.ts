import type { GPSCoordinate } from '../types'

const EARTH_RADIUS_METERS = 6371000

function toRadians(value: number): number {
  return (value * Math.PI) / 180
}

export function calculateDistanceMeters(a: GPSCoordinate, b: GPSCoordinate): number {
  const dLat = toRadians(b.latitude - a.latitude)
  const dLng = toRadians(b.longitude - a.longitude)
  const lat1 = toRadians(a.latitude)
  const lat2 = toRadians(b.latitude)
  const h = (
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  )
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h))
}

export function calculateCycleDistanceMeters(points: GPSCoordinate[]): number {
  if (points.length < 2) return 0
  return points.reduce((total, point, index) => {
    const next = points[(index + 1) % points.length]
    return total + calculateDistanceMeters(point, next)
  }, 0)
}

function nearestNeighborOrder(points: GPSCoordinate[], startIndex: number): GPSCoordinate[] {
  const remaining = points.map((point, index) => ({ point, index }))
  const ordered: GPSCoordinate[] = []
  let currentIndex = startIndex

  while (remaining.length > 0) {
    const selectedIndex = remaining.findIndex((item) => item.index === currentIndex)
    const [selected] = remaining.splice(selectedIndex >= 0 ? selectedIndex : 0, 1)
    ordered.push(selected.point)
    if (remaining.length === 0) break

    let nearest = remaining[0]
    let nearestDistance = calculateDistanceMeters(selected.point, nearest.point)
    for (const candidate of remaining.slice(1)) {
      const distance = calculateDistanceMeters(selected.point, candidate.point)
      if (distance < nearestDistance) {
        nearest = candidate
        nearestDistance = distance
      }
    }
    currentIndex = nearest.index
  }

  return ordered
}

function twoOptCycle(points: GPSCoordinate[]): GPSCoordinate[] {
  if (points.length < 4) return [...points]

  let best = [...points]
  let improved = true

  while (improved) {
    improved = false
    for (let i = 1; i < best.length - 2; i += 1) {
      for (let k = i + 1; k < best.length - 1; k += 1) {
        const currentDistance = (
          calculateDistanceMeters(best[i - 1], best[i]) +
          calculateDistanceMeters(best[k], best[k + 1])
        )
        const swappedDistance = (
          calculateDistanceMeters(best[i - 1], best[k]) +
          calculateDistanceMeters(best[i], best[k + 1])
        )
        if (swappedDistance + 0.0001 < currentDistance) {
          best = [
            ...best.slice(0, i),
            ...best.slice(i, k + 1).reverse(),
            ...best.slice(k + 1),
          ]
          improved = true
        }
      }
    }
  }

  return best
}

function rotateToOriginalStart(points: GPSCoordinate[], originalStart: GPSCoordinate): GPSCoordinate[] {
  const startIndex = points.findIndex((point) => point === originalStart)
  if (startIndex <= 0) return points
  return [...points.slice(startIndex), ...points.slice(0, startIndex)]
}

export function optimizeFlowerRoute(points: GPSCoordinate[]): GPSCoordinate[] {
  if (points.length < 3) return [...points]

  let bestRoute = twoOptCycle(nearestNeighborOrder(points, 0))
  let bestDistance = calculateCycleDistanceMeters(bestRoute)

  for (let startIndex = 1; startIndex < points.length; startIndex += 1) {
    const candidate = twoOptCycle(nearestNeighborOrder(points, startIndex))
    const distance = calculateCycleDistanceMeters(candidate)
    if (distance < bestDistance) {
      bestRoute = candidate
      bestDistance = distance
    }
  }

  return rotateToOriginalStart(bestRoute, points[0])
}
