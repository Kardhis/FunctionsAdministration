import Card from '../../components/Card.jsx'
import { SectionHeader } from '../../components/Section.jsx'
import KpiGrid from '../../features/stats/KpiGrid.jsx'
import ChartPlaceholder from '../../features/stats/ChartPlaceholder.jsx'

export default function StatsPage() {
  return (
    <Card className="p-5">
      <SectionHeader title="Estadísticas" subtitle="V1: placeholders de KPIs y gráficas." />
      <div className="mt-6">
        <KpiGrid />
      </div>
      <div className="mt-4">
        <ChartPlaceholder />
      </div>
    </Card>
  )
}

