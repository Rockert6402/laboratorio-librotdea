import { BookOpen, BookPlus, CircleAlert, CircleCheck, Moon, Pencil, Sun, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import BookForm from './components/BookForm'
import BookList from './components/BookList'
import BookSearch from './components/BookSearch'
import BookStats from './components/BookStats'
import { errorMessage } from './components/bookFormat'
import BookService from './services/BookService'

const MESSAGE_TIMEOUT_MS = 4000

const currentTheme = () => document.documentElement.dataset.bsTheme ?? 'light'

/**
 * Single screen: catalog summary, searchable table and the create/edit form.
 * After saving or deleting it refreshes the table and shows a success or error toast.
 */
export default function App() {
  const [editingBook, setEditingBook] = useState(null)
  const [searchResults, setSearchResults] = useState(null)
  const [allBooks, setAllBooks] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [message, setMessage] = useState(null) // { type: 'success' | 'danger', title, text }
  const [theme, setTheme] = useState(currentTheme)
  const firstFieldRef = useRef(null)
  const formPanelRef = useRef(null)

  useEffect(() => {
    if (!message) return undefined
    const timer = setTimeout(() => setMessage(null), MESSAGE_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [message])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.bsTheme = next
    try {
      localStorage.setItem('theme', next)
    } catch {
      // Storage may be unavailable (private mode); the theme still applies for this visit.
    }
    setTheme(next)
  }

  const refresh = () => setRefreshKey((k) => k + 1)

  const showError = useCallback(
    (error) => setMessage({ type: 'danger', title: 'No se pudo completar la acción', text: errorMessage(error) }),
    [],
  )

  const startCreate = () => {
    setEditingBook(null)
    formPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // Wait for the form to re-render as "new" before focusing its first field.
    requestAnimationFrame(() => firstFieldRef.current?.focus({ preventScroll: true }))
  }

  const startEdit = (book) => {
    setEditingBook(book)
    formPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    requestAnimationFrame(() => firstFieldRef.current?.focus({ preventScroll: true }))
  }

  const handleSaved = (book, isEdit) => {
    setMessage({
      type: 'success',
      title: isEdit ? 'Libro actualizado' : 'Libro registrado',
      text: `«${book.name}» se ${isEdit ? 'actualizó' : 'agregó al catálogo'} correctamente.`,
    })
    setEditingBook(null)
    refresh()
  }

  const handleDelete = async (book) => {
    try {
      await BookService.remove(book.id)
      setMessage({ type: 'success', title: 'Libro eliminado', text: `«${book.name}» se eliminó del catálogo.` })
      if (editingBook?.id === book.id) setEditingBook(null)
    } catch (error) {
      showError(error)
    } finally {
      refresh()
    }
  }

  const ThemeIcon = theme === 'dark' ? Sun : Moon

  return (
    <>
      <a href="#main" className="visually-hidden-focusable btn btn-primary position-absolute m-2" style={{ zIndex: 30 }}>
        Saltar al contenido
      </a>

      <header className="app-header">
        <div className="container-xxl d-flex align-items-center gap-3 py-2">
          <div className="d-flex align-items-center gap-2 me-auto">
            <span className="brand-mark" aria-hidden="true"><BookOpen size={20} /></span>
            <div>
              <div className="brand-name">LibroTdeA</div>
              <div className="brand-sub">Gestión de catálogo</div>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-icon" onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}>
            <ThemeIcon size={18} aria-hidden="true" />
          </button>
        </div>
      </header>

      <main id="main" className="container-xxl py-4">
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
          <div>
            <h1 className="page-title mb-1">Catálogo de libros</h1>
            <p className="text-body-secondary mb-0">Registra, busca y mantén actualizado el inventario de la biblioteca.</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={startCreate}>
            <BookPlus size={18} aria-hidden="true" /> Nuevo libro
          </button>
        </div>

        <BookStats books={allBooks} />

        <div className="row g-4 align-items-start">
          <div className="col-xl-8 col-xxl-9">
            <section className="panel" aria-labelledby="list-title">
              <div className="panel-header flex-wrap">
                <div className="me-auto">
                  <h2 id="list-title" className="panel-title">Inventario</h2>
                  <p className="panel-subtitle">Busca por nombre, edita o elimina registros.</p>
                </div>
                <div className="w-100" style={{ maxInlineSize: '22rem' }}>
                  <BookSearch refreshKey={refreshKey} onResults={setSearchResults} onError={showError} />
                </div>
              </div>
              <BookList
                refreshKey={refreshKey}
                searchResults={searchResults}
                editingId={editingBook?.id ?? null}
                onEdit={startEdit}
                onDelete={handleDelete}
                onLoaded={setAllBooks}
                onCreate={startCreate}
              />
            </section>
          </div>

          <div className="col-xl-4 col-xxl-3">
            <section ref={formPanelRef} className="panel form-sticky" aria-labelledby="form-title" style={{ scrollMarginTop: '5rem' }}>
              <div className="panel-header">
                <div className="icon-tile">
                  {editingBook ? <Pencil size={18} aria-hidden="true" /> : <BookPlus size={18} aria-hidden="true" />}
                </div>
                <div className="min-w-0">
                  <h2 id="form-title" className="panel-title">{editingBook ? 'Editar libro' : 'Nuevo libro'}</h2>
                  <p className="panel-subtitle">Todos los campos son obligatorios.</p>
                </div>
              </div>
              <div className="p-3 p-sm-4">
                <BookForm
                  key={editingBook?.id ?? 'new'}
                  book={editingBook}
                  firstFieldRef={firstFieldRef}
                  onSaved={handleSaved}
                  onError={showError}
                  onCancel={() => setEditingBook(null)}
                />
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Always-present live region: only its content changes, so each toast is announced. */}
      <div className="toast-region" role="status" aria-live="polite">
        {message && (
          <div className={`app-toast${message.type === 'danger' ? ' is-danger' : ''}`}>
            {message.type === 'danger'
              ? <CircleAlert size={20} className="toast-icon" aria-hidden="true" />
              : <CircleCheck size={20} className="toast-icon" aria-hidden="true" />}
            <div className="flex-grow-1 min-w-0">
              <div className="toast-title">{message.title}</div>
              <div className="toast-text">{message.text}</div>
            </div>
            <button type="button" className="btn btn-icon border-0 text-body-secondary"
              style={{ inlineSize: '1.75rem', blockSize: '1.75rem' }}
              aria-label="Cerrar notificación" onClick={() => setMessage(null)}>
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </>
  )
}
