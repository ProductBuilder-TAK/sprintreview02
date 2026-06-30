import type { Meta, StoryObj } from '@storybook/react-vite'
import { KpiGrid } from '@/components/kpi/KpiGrid'
import { KpiCard } from '@/components/kpi/KpiCard'
import { ThroughputKpi, CycleTimeKpi, BugsKpi, MidSprintKpi, MttrKpi, CfrKpi } from '@/components/kpi/KpiCards'
import { SpCompletionBlock } from '@/components/kpi/SpCompletionBlock'

const meta: Meta = { title: 'Components/KPI Editorial' }
export default meta

export const KPIGridRow1: StoryObj = {
  name: 'KPI Grid Row 1 (Throughput, CT, Bugs)',
  render: () => (
    <KpiGrid>
      <ThroughputKpi value={24} benchmark={21} trend={12} />
      <CycleTimeKpi avg={5.2} median={4.8} trend={-8} />
      <BugsKpi stock={7} created={3} closed={5} />
    </KpiGrid>
  ),
}

export const KPIGridRow2: StoryObj = {
  name: 'KPI Grid Row 2 (Mid-Sprint, MTTR, CFR)',
  render: () => (
    <KpiGrid>
      <MidSprintKpi count={3} throughputValue={24} additions={[{ type: 'Story' }, { type: 'Story' }, { type: 'Bug' }]} />
      <MttrKpi value={2.1} median={1.5} periodAvg={2.8} />
      <CfrKpi value={12.5} periodAvg={14.5} bugsClosed={3} itemsDelivered={24} />
    </KpiGrid>
  ),
}

export const GenericKpiCard: StoryObj = {
  render: () => (
    <KpiGrid>
      <KpiCard label="Métrique" value={42} hint="Valeur de demo" featured />
      <KpiCard label="Avec unité" value={5.2} unit="j" trend={-15} trendIsGood="down" />
      <KpiCard label="Simple" value="WIP" hint="En cours" />
    </KpiGrid>
  ),
}

export const StoryPointsBlock: StoryObj = {
  name: 'Story Points',
  render: () => (
    <div style={{ maxWidth: 500 }}>
      <SpCompletionBlock
        currentDelivered={38}
        currentCommitted={45}
        currentCompletion={84}
        currentSprintLabel="Sprint 18"
        avgDelivered={34.2}
        avgCompletion={88}
        previousSprintsCount={5}
        recommendedVelocity={36}
      />
    </div>
  ),
}
