import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

// @ts-expect-error — JS services
import { parseUnifiedCSV } from '../services/csvParserV2.js'
// @ts-expect-error — JS services
import monteCarloService from '../services/monteCarloService.js'
// @ts-expect-error — JS services
import forecastService from '../services/forecastDataService.js'

const csv = readFileSync(join(__dirname, 'fixtures', 'sprint-review-demo.csv'), 'utf-8')
const parsed = parseUnifiedCSV(csv)

describe('monteCarloService', () => {
  it('runs simulation without errors', () => {
    const tickets = parsed.tickets
    // Get sprint numbers from tickets
    const sprintNums = [...new Set(
      tickets.filter((t: any) => t.isFinished && t.sprint).map((t: any) => t.sprint)
    )].sort((a, b) => (a as number) - (b as number)).slice(-6) as number[]

    if (sprintNums.length < 2) return // Skip if not enough data

    const result = monteCarloService.analyzeForecast(tickets, sprintNums, {})
    expect(result).toBeDefined()
    expect(result.simulation).toBeDefined()
    expect(result.simulation.throughput).toBeDefined()
    expect(result.simulation.throughput.p50).toBeGreaterThan(0)
  })

  it('returns percentiles in correct order', () => {
    const tickets = parsed.tickets
    const sprintNums = [...new Set(
      tickets.filter((t: any) => t.isFinished && t.sprint).map((t: any) => t.sprint)
    )].sort((a, b) => (a as number) - (b as number)).slice(-6) as number[]

    if (sprintNums.length < 2) return

    const result = monteCarloService.analyzeForecast(tickets, sprintNums, {})
    const tp = result.simulation.throughput
    // P15 <= P50 <= P85
    expect(tp.p15).toBeLessThanOrEqual(tp.p50)
    expect(tp.p50).toBeLessThanOrEqual(tp.p85)
  })

  it('returns contributors list', () => {
    const tickets = parsed.tickets
    const sprintNums = [...new Set(
      tickets.filter((t: any) => t.isFinished && t.sprint).map((t: any) => t.sprint)
    )].sort((a, b) => (a as number) - (b as number)).slice(-6) as number[]

    if (sprintNums.length < 2) return

    const result = monteCarloService.analyzeForecast(tickets, sprintNums, {})
    expect(Array.isArray(result.contributors)).toBe(true)
  })
})

describe('forecastDataService', () => {
  it('validates forecast data', () => {
    const validation = forecastService.validateForecastData(parsed.tickets)
    expect(validation).toBeDefined()
    expect(typeof validation.isValid).toBe('boolean')
    expect(typeof validation.hasAssignee).toBe('boolean')
  })

  it('prepares forecast data when valid', () => {
    const validation = forecastService.validateForecastData(parsed.tickets)
    if (!validation.isValid) return // Skip if demo data has no assignees

    const result = forecastService.prepareForecastData(parsed.tickets, {})
    expect(result.isValid).toBe(true)
    expect(result.simulation).toBeDefined()
    expect(result.charts).toBeDefined()
  })
})
