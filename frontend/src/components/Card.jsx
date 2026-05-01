export default function Card({ className = '', children, ...props }) {
  return (
    <section
      className={`ui-card backdrop-blur-sm ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}

