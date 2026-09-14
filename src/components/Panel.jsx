export default function Panel({ title, children, className = '', danger = false }) {
  return (
    <section className={`panel ${danger ? 'panel--danger' : ''} ${className}`.trim()}>
      {title && <header className="panel__title">{title}</header>}
      <div className="panel__body">{children}</div>
    </section>
  )
}
