import Card from '../../components/Card.jsx'
import { SectionHeader } from '../../components/Section.jsx'
import MonthGrid from '../../features/calendar/MonthGrid.jsx'

export default function CalendarPage() {
  return (
    <Card className="p-5">
      <SectionHeader title="Calendario" subtitle="V1: vista simple (grid mensual) sin interacción compleja." />
      <div className="mt-6">
        <MonthGrid />
      </div>
    </Card>
  )
}

