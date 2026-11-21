import { BookMarked, BookOpen, Tablet } from 'lucide-react'

/** Book types accepted by the backend, with the label and icon shown to the user. */
export const BOOK_TYPES = [
  { value: 'EBOOK', label: 'E-book', icon: Tablet },
  { value: 'SOFTCOPY', label: 'Tapa blanda', icon: BookOpen },
  { value: 'HARDCOVER', label: 'Tapa dura', icon: BookMarked },
]

const priceFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

/**
 * Formats a price for display.
 * @param {number} price
 * @returns {string}
 */
export const formatPrice = (price) => priceFormatter.format(price)

/**
 * Formats an ISO calendar date (yyyy-MM-dd) for display.
 * Uses Temporal.PlainDate, which has no time zone, so the day never shifts.
 * @param {string} isoDate
 * @returns {string}
 */
export const formatDate = (isoDate) =>
  Temporal.PlainDate.from(isoDate).toLocaleString('es-CO', { dateStyle: 'medium' })

/**
 * Today's date in the user's time zone, as yyyy-MM-dd (for the date input's max).
 * @returns {string}
 */
export const todayIso = () => Temporal.Now.plainDateISO().toString()

/**
 * Returns the display data (label and icon) of a book type.
 * @param {string} type
 * @returns {{ value: string, label: string, icon: Function }}
 */
export const typeInfo = (type) => BOOK_TYPES.find((t) => t.value === type) ?? { value: type, label: type, icon: BookOpen }

/**
 * Builds a readable message from an Axios error returned by the backend.
 * @param {unknown} error
 * @returns {string}
 */
export function errorMessage(error) {
  const data = error?.response?.data
  if (!error?.response) {
    return 'No se pudo conectar con el servidor. Comprueba que el backend esté en marcha.'
  }
  const fields = data?.fieldErrors ? Object.values(data.fieldErrors) : []
  const base = data?.message ?? `Error ${error.response.status}`
  return fields.length ? `${base}: ${fields.join(', ')}` : base
}
