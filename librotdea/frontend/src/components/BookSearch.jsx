import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import BookService from '../services/BookService'

const DEBOUNCE_MS = 300

/**
 * Search field that calls `searchByName` as the user types.
 * Reports `null` when the field is empty so the full list is shown again.
 * The search is repeated whenever `refreshKey` changes (after saving or deleting).
 *
 * @param {object} props
 * @param {number} props.refreshKey change it to repeat the current search
 * @param {(results: Array<object>|null) => void} props.onResults receives the matches, or null when empty
 * @param {(error: unknown) => void} props.onError called if the search request fails
 */
export default function BookSearch({ refreshKey, onResults, onError }) {
  const [term, setTerm] = useState('')

  useEffect(() => {
    const name = term.trim()
    if (!name) return undefined
    let ignore = false
    const timer = setTimeout(() => {
      BookService.searchByName(name)
        .then((results) => {
          if (!ignore) onResults(results)
        })
        .catch((error) => {
          if (!ignore) onError(error)
        })
    }, DEBOUNCE_MS)
    return () => {
      ignore = true
      clearTimeout(timer)
    }
  }, [term, refreshKey, onResults, onError])

  const updateTerm = (value) => {
    setTerm(value)
    if (!value.trim()) onResults(null) // empty field: show the full list again
  }

  return (
    <form role="search" className="search-field flex-grow-1" onSubmit={(e) => e.preventDefault()}>
      <Search size={18} className="search-icon" aria-hidden="true" />
      <input
        type="search"
        className="form-control"
        placeholder="Buscar por nombre del libro…"
        aria-label="Buscar libros por nombre"
        value={term}
        onChange={(e) => updateTerm(e.target.value)}
      />
      {term && (
        <button type="button" className="btn search-clear" aria-label="Limpiar búsqueda" onClick={() => updateTerm('')}>
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </form>
  )
}
