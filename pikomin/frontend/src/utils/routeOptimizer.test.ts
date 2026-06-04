import { describe, expect, it } from 'vitest'
import {
  calculateCycleDistanceMeters,
  optimizeFlowerRoute,
} from './routeOptimizer'
import type { GPSCoordinate } from '../types'

function coord(latitude: number, longitude: number): GPSCoordinate {
  return { latitude, longitude }
}

describe('optimizeFlowerRoute', () => {
  it('keeps routes with fewer than three points unchanged', () => {
    const points = [coord(25, 121), coord(25.001, 121.001)]

    expect(optimizeFlowerRoute(points)).toEqual(points)
  })

  it('does not mutate the original points array', () => {
    const points = [
      coord(0, 0),
      coord(1, 1),
      coord(0, 1),
      coord(1, 0),
    ]
    const original = [...points]

    optimizeFlowerRoute(points)

    expect(points).toEqual(original)
  })

  it('keeps the original first flower point as the displayed first node', () => {
    const first = coord(0, 0)
    const points = [
      first,
      coord(1, 1),
      coord(0, 1),
      coord(1, 0),
    ]

    const optimized = optimizeFlowerRoute(points)

    expect(optimized[0]).toBe(first)
  })

  it('can improve a simple four-point cycle without mutating the first point', () => {
    const crossing = [
      coord(0, 0),
      coord(1, 1),
      coord(0, 1),
      coord(1, 0),
    ]

    const optimized = optimizeFlowerRoute(crossing)

    expect(calculateCycleDistanceMeters(optimized)).toBeLessThan(calculateCycleDistanceMeters(crossing))
  })
})
