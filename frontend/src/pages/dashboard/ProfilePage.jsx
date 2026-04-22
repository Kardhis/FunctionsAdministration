import Card from '../../components/Card.jsx'
import Button from '../../components/Button.jsx'
import { SectionHeader } from '../../components/Section.jsx'
import AccountSummary from '../../features/profile/AccountSummary.jsx'
import PreferencesPanel from '../../features/profile/PreferencesPanel.jsx'

export default function ProfilePage() {
  return (
    <Card className="p-5">
      <SectionHeader title="Perfil de usuario" subtitle="V1: vista de cuenta y preferencias base." right={<Button variant="secondary">Guardar cambios</Button>} />
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AccountSummary />
        <PreferencesPanel />
      </div>
    </Card>
  )
}

