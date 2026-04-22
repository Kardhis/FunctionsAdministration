export default function Card({ className = '', children, ...props }) {
  return (
    <section
      className={`rounded-2xl border border-border bg-bg/80 shadow-soft backdrop-blur-sm ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}

