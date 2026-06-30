import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KpiGrid } from '@/components/kpi/KpiGrid'
import { KpiCard } from '@/components/kpi/KpiCard'
import { ThroughputKpi, BugsKpi, MidSprintKpi } from '@/components/kpi/KpiCards'
import { SpCompletionBlock } from '@/components/kpi/SpCompletionBlock'
import { GoalItem } from '@/components/GoalItem'

describe('KpiCard', () => {
  it('renders label and value', () => {
    render(<KpiCard label="Test Metric" value={42} />)
    expect(screen.getByText('Test Metric')).toBeDefined()
    expect(screen.getByText('42')).toBeDefined()
  })

  it('renders unit', () => {
    render(<KpiCard label="Cycle Time" value={5.2} unit="j" />)
    expect(screen.getByText('j')).toBeDefined()
  })

  it('renders trend', () => {
    render(<KpiCard label="Test" value={10} trend={12} trendIsGood="up" />)
    expect(screen.getByText(/12%/)).toBeDefined()
  })
})

describe('ThroughputKpi', () => {
  it('renders throughput value and benchmark', () => {
    render(
      <ThroughputKpi value={24} benchmark={21} trend={12} />
    )
    expect(screen.getByText('24')).toBeDefined()
    expect(screen.getByText(/21/)).toBeDefined()
  })
})

describe('BugsKpi', () => {
  it('renders stock, created and closed', () => {
    render(<BugsKpi stock={7} created={3} closed={5} />)
    expect(screen.getByText('7')).toBeDefined()
    expect(screen.getByText(/\+3/)).toBeDefined()
    expect(screen.getByText(/−5/)).toBeDefined()
  })
})

describe('MidSprintKpi', () => {
  it('renders scope preserved when no additions', () => {
    render(<MidSprintKpi count={0} throughputValue={24} additions={[]} />)
    expect(screen.getByText('Scope préservé')).toBeDefined()
  })

  it('renders type breakdown', () => {
    render(
      <MidSprintKpi
        count={3}
        throughputValue={24}
        additions={[{ type: 'Story' }, { type: 'Story' }, { type: 'Bug' }]}
      />
    )
    expect(screen.getByText('Story')).toBeDefined()
    expect(screen.getByText('Bug')).toBeDefined()
  })
})

describe('SpCompletionBlock', () => {
  it('renders delivered, committed and global completion', () => {
    render(
      <SpCompletionBlock
        currentDelivered={38}
        currentCommitted={45}
        currentCompletion={84}
        currentSprintLabel="Sprint 18"
      />
    )
    expect(screen.getByText('38')).toBeDefined()
    expect(screen.getByText(/45 engagés/)).toBeDefined()
    expect(screen.getByText('84%')).toBeDefined()
    expect(screen.getByText('Complétion')).toBeDefined()
  })

  it('shows the current sprint label', () => {
    render(
      <SpCompletionBlock
        currentDelivered={42}
        currentCommitted={45}
        currentCompletion={93}
        currentSprintLabel="Sprint 17"
      />
    )
    expect(screen.getByText('Sprint 17')).toBeDefined()
  })
})

describe('GoalItem', () => {
  it('renders goal text and status', () => {
    render(<GoalItem text="Livrer le MVP" status="achieved" />)
    expect(screen.getByText('Livrer le MVP')).toBeDefined()
    expect(screen.getByText('Atteint')).toBeDefined()
  })

  it('renders different statuses', () => {
    const { rerender } = render(<GoalItem text="Test" status="partial" />)
    expect(screen.getByText('Partiel')).toBeDefined()

    rerender(<GoalItem text="Test" status="missed" />)
    expect(screen.getByText('Non atteint')).toBeDefined()

    rerender(<GoalItem text="Test" status="pending" />)
    expect(screen.getByText('En cours')).toBeDefined()
  })
})

describe('KpiGrid', () => {
  it('renders children in grid', () => {
    render(
      <KpiGrid>
        <div data-testid="child-1">A</div>
        <div data-testid="child-2">B</div>
      </KpiGrid>
    )
    expect(screen.getByTestId('child-1')).toBeDefined()
    expect(screen.getByTestId('child-2')).toBeDefined()
  })
})
