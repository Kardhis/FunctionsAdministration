import './auth-layout.css'

/**
 * Shell compartido para páginas de autenticación pública.
 * Gestiona el fondo animado y el contenedor de tarjeta centrado.
 *
 * @param {{
 *   sectionLabel: string
 *   cardLabel: string
 *   children: import('react').ReactNode
 * }} props
 */
export default function AuthLayout({ sectionLabel, cardLabel, children }) {
  return (
    <main className="cpLogin">
      <div className="cpBackgroundGrid" aria-hidden="true" />
      <div className="cpGlowOrbs" aria-hidden="true" />

      <section className="cpShell" aria-label={sectionLabel}>
        <div className="cpCard" role="region" aria-label={cardLabel}>
          <div className="cpCardInner">
            {children}
          </div>
        </div>
      </section>
    </main>
  )
}
