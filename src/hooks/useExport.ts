import { useCallback, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { toast } from 'sonner'

export function useExport() {
  const [isExporting, setIsExporting] = useState(false)
  const sprintMetrics = useAppStore((s) => s.sprintMetrics) as Record<string, any> | null
  const selectedSprint = useAppStore((s) => s.selectedSprint)

  const exportPdf = useCallback(async (elementId: string) => {
    setIsExporting(true)
    toast.info('Génération du PDF en cours...')

    try {
      const element = document.getElementById(elementId)
      if (!element) throw new Error('Element not found: ' + elementId)

      const html2canvas = (await import('html2canvas-pro')).default
      const { jsPDF } = await import('jspdf')

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#fafaf7',
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      // Handle multi-page if content is tall
      let position = 0
      const pageHeight = pdf.internal.pageSize.getHeight()

      if (pdfHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      } else {
        while (position < pdfHeight) {
          pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, pdfHeight)
          position += pageHeight
          if (position < pdfHeight) {
            pdf.addPage()
          }
        }
      }

      const filename = `sprint-review${selectedSprint ? '-' + String(selectedSprint).replace(/\s+/g, '-').toLowerCase() : ''}.pdf`
      pdf.save(filename)
      toast.success('PDF exporté')
    } catch (err) {
      console.error('[useExport] PDF error:', err)
      toast.error('Erreur lors de l\'export PDF')
    } finally {
      setIsExporting(false)
    }
  }, [selectedSprint])

  const exportMarkdown = useCallback(() => {
    if (!sprintMetrics) {
      toast.error('Aucune donnée à exporter')
      return
    }

    const { throughput, cycleTime, bugs, storyPoints } = sprintMetrics as any
    const lines: string[] = []

    lines.push(`# Sprint Review — ${selectedSprint || 'Sprint'}`)
    lines.push('')

    if (throughput) {
      lines.push('## Throughput')
      lines.push(`- **${throughput.currentValue}** tickets fermés (médiane 6 sprints : ${throughput.benchmarkMedian})`)
      lines.push(`- Tendance : ${throughput.trend > 0 ? '+' : ''}${throughput.trend}%`)
      if (throughput.midSprintCount > 0) {
        lines.push(`- ${throughput.midSprintCount} ajouts mid-sprint`)
      }
      lines.push('')
    }

    if (cycleTime) {
      lines.push('## Cycle Time')
      lines.push(`- **${cycleTime.currentValue?.toFixed(1)}j** moyenne (hors bugs)`)
      lines.push(`- Tendance : ${cycleTime.trend > 0 ? '+' : ''}${cycleTime.trend}%`)
      lines.push('')
    }

    if (storyPoints) {
      lines.push('## Story Points')
      lines.push(`- **${storyPoints.currentDelivered}** livrés / ${storyPoints.currentCommitted} engagés (${storyPoints.currentCompletion}%)`)
      if (storyPoints.initialCompletion != null) {
        lines.push(`- Engagement initial : ${storyPoints.initialCompletion}%`)
      }
      lines.push('')
    }

    if (bugs) {
      lines.push('## Bugs')
      lines.push(`- Stock : **${bugs.stock || 0}** (+${bugs.sprintCreated || 0} créés, -${bugs.sprintClosed || 0} résolus)`)
      if (bugs.mttr) lines.push(`- MTTR : ${bugs.mttr.toFixed(1)}j`)
      if (bugs.changeFailureRate) lines.push(`- CFR : ${bugs.changeFailureRate.toFixed(1)}%`)
      lines.push('')
    }

    lines.push('---')
    lines.push('*Généré par Sprint Review Dashboard*')

    const markdown = lines.join('\n')
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sprint-review${selectedSprint ? '-' + String(selectedSprint).replace(/\s+/g, '-').toLowerCase() : ''}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Markdown exporté')
  }, [sprintMetrics, selectedSprint])

  return { exportPdf, exportMarkdown, isExporting }
}
