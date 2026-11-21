import { Calculator, Layers, Library, Wallet } from 'lucide-react'
import { BOOK_TYPES, formatPrice } from './bookFormat'

/**
 * Summary cards for the catalog: total books, inventory value, average price and type split.
 * @param {object} props
 * @param {Array<object>|null} props.books every book in the catalog, or null while loading
 */
export default function BookStats({ books }) {
  const loading = books === null
  const list = books ?? []
  const total = list.length
  const value = list.reduce((sum, b) => sum + (b.price ?? 0), 0)
  const average = total ? value / total : 0
  const byType = BOOK_TYPES.map((t) => ({ ...t, count: list.filter((b) => b.type === t.value).length }))

  const stat = (label, display, Icon, tone) => (
    <div className="col-sm-6 col-xl-3">
      <div className="panel h-100 p-3 d-flex align-items-center gap-3">
        <div className={`icon-tile ${tone ?? ''}`}>
          <Icon size={20} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="stat-label">{label}</div>
          <div className="stat-value tabular text-truncate">
            {loading ? <span className="placeholder col-8 rounded" /> : display}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <section aria-label="Resumen del catálogo" className="row g-3 mb-4 placeholder-glow">
      {stat('Total de libros', total, Library)}
      {stat('Valor del inventario', formatPrice(value), Wallet, 'is-success')}
      {stat('Precio promedio', formatPrice(average), Calculator, 'is-warning')}

      <div className="col-sm-6 col-xl-3">
        <div className="panel h-100 p-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <Layers size={16} className="text-body-secondary" aria-hidden="true" />
            <span className="stat-label">Distribución por tipo</span>
          </div>
          <div className="type-bar mb-2" aria-hidden="true">
            {total > 0 &&
              byType.map((t) => (
                <span key={t.value} className={`bg-type-${t.value}`} style={{ inlineSize: `${(t.count / total) * 100}%` }} />
              ))}
          </div>
          <ul className="list-unstyled d-flex flex-wrap column-gap-3 row-gap-1 mb-0 small">
            {byType.map((t) => (
              <li key={t.value} className="d-flex align-items-center gap-1 text-body-secondary">
                <span className={`legend-dot bg-type-${t.value}`} aria-hidden="true" />
                {t.label}: <strong className="text-body tabular">{loading ? '–' : t.count}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
