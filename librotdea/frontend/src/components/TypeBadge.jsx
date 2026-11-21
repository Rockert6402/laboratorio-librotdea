import { typeInfo } from './bookFormat'

/**
 * Pill showing a book type with its icon, label and color (never color alone).
 * @param {object} props
 * @param {string} props.type book type value (EBOOK, SOFTCOPY, HARDCOVER)
 */
export default function TypeBadge({ type }) {
  const { label, icon: Icon } = typeInfo(type)
  return (
    <span className={`type-badge type-${type}`}>
      <Icon size={14} strokeWidth={2} aria-hidden="true" />
      {label}
    </span>
  )
}
