import Card from '../../components/Card.jsx'
import Button from '../../components/Button.jsx'
import { SectionHeader } from '../../components/Section.jsx'
import DailyChecklist from '../../features/daily/DailyChecklist.jsx'
import DailyNotes from '../../features/daily/DailyNotes.jsx'

export default function DailyLogPage() {
  return (
    <Card className="p-5">
      <SectionHeader title="Registro diario" subtitle="V1: checklist y notas." right={<Button variant="secondary">Guardar</Button>} />
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DailyChecklist />
        <DailyNotes />
      </div>
    </Card>
  )
}

