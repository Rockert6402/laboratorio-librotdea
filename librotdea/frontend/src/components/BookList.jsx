import { BookPlus, Pencil, SearchX, Trash2, TriangleAlert } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import BookService from '../services/BookService'
import { formatDate, formatPrice, typeInfo } from './bookFormat'
import TypeBadge from './TypeBadge'

const SKELETON_ROWS = 5

/**
 * Table of books. Loads every book on mount and whenever `refreshKey` changes.
 * When `searchResults` is an array it is shown instead of the full list.
 * Deleting asks for confirmation in a native modal <dialog>.
 *
 * @param {object} props
 * @param {number} props.refreshKey change it to reload the list
 * @param {Array<object>|null} props.searchResults results of an active search, or null
 * @param {(book: object) => void} props.onEdit called when "Editar" is clicked
 * @param {(book: object) => void} props.onDelete called after the user confirms the deletion
 * @param {(books: Array<object>) => void} [props.onLoaded] receives the full list after each load
 * @param {() => void} [props.onCreate] called from the empty state to start creating a book
 * @param {number|null} props.editingId id of the book being edited, to highlight its row
 */
export default function BookList({ refreshKey, searchResults, onEdit, onDelete, onLoaded, onCreate, editingId }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const dialogRef = useRef(null)
  const uid = useId()
  const captionId = `${uid}-caption`
  const dialogTitleId = `${uid}-dialog-title`

  useEffect(() => {
    let ignore = false
    BookService.getAll()
      .then((data) => {
        if (ignore) return
        setBooks(data)
        setLoadError(null)
        onLoaded?.(data)
      })
      .catch(() => {
        if (!ignore) setLoadError('No se pudo cargar el catálogo. Comprueba que el backend esté en marcha.')
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [refreshKey, onLoaded])

  const askDelete = (book) => {
    setPendingDelete(book)
    dialogRef.current.showModal()
  }

  // Fired for every way of closing: the two buttons, Esc, back gesture or a click outside.
  const handleDialogClose = () => {
    const dialog = dialogRef.current
    const choice = dialog.returnValue
    dialog.returnValue = '' // Esc sets no value, so clear it to avoid reusing a stale one
    if (choice === 'delete' && pendingDelete) onDelete(pendingDelete)
    setPendingDelete(null)
  }

  // React's autoFocus only focuses on mount; the native attribute is what showModal() looks for.
  const nativeAutofocus = (el) => el?.setAttribute('autofocus', '')

  const rows = searchResults ?? books
  const showSkeleton = loading && books.length === 0

  const header = (
    <thead>
      <tr>
        <th scope="col">Libro</th>
        <th scope="col">ISBN</th>
        <th scope="col">Autor</th>
        <th scope="col">Publicación</th>
        <th scope="col" className="text-end">Precio</th>
        <th scope="col">Tipo</th>
        <th scope="col" className="text-end">
          <span className="visually-hidden">Acciones</span>
        </th>
      </tr>
    </thead>
  )

  let content
  if (loadError) {
    content = (
      <div className="empty-state">
        <div className="icon-tile" style={{ background: 'var(--app-danger-soft)', color: 'var(--app-danger)' }}>
          <TriangleAlert size={24} aria-hidden="true" />
        </div>
        <p className="fw-semibold mb-0">Error de conexión</p>
        <p className="text-body-secondary small mb-0">{loadError}</p>
      </div>
    )
  } else if (showSkeleton) {
    content = (
      <div className="table-wrapper placeholder-glow" aria-busy="true">
        <table className="table data-table">
          <caption className="caption-top">Cargando catálogo…</caption>
          {header}
          <tbody>
            {Array.from({ length: SKELETON_ROWS }, (_, i) => (
              <tr key={i} aria-hidden="true">
                <th><span className="placeholder col-10 rounded" /></th>
                <td><span className="placeholder col-12 rounded" /></td>
                <td><span className="placeholder col-10 rounded" /></td>
                <td><span className="placeholder col-8 rounded" /></td>
                <td><span className="placeholder col-8 rounded" /></td>
                <td><span className="placeholder col-10 rounded-pill" /></td>
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  } else if (rows.length === 0) {
    content = searchResults ? (
      <div className="empty-state">
        <div className="icon-tile"><SearchX size={24} aria-hidden="true" /></div>
        <p className="fw-semibold mb-0">Sin resultados</p>
        <p className="text-body-secondary small mb-0">Ningún libro coincide con la búsqueda. Prueba con otro nombre.</p>
      </div>
    ) : (
      <div className="empty-state">
        <div className="icon-tile"><BookPlus size={24} aria-hidden="true" /></div>
        <p className="fw-semibold mb-0">Tu catálogo está vacío</p>
        <p className="text-body-secondary small mb-2">Registra el primer libro para empezar a gestionar el inventario.</p>
        {onCreate && (
          <button type="button" className="btn btn-primary" onClick={onCreate}>
            <BookPlus size={16} aria-hidden="true" /> Registrar libro
          </button>
        )}
      </div>
    )
  } else {
    content = (
      // Keyboard users can focus and scroll the region; its name comes from the caption.
      <div className="table-wrapper" role="region" aria-labelledby={captionId} tabIndex={0}>
        <table className="table table-hover data-table">
          <caption id={captionId} className="caption-top">
            {searchResults
              ? `${rows.length} ${rows.length === 1 ? 'resultado' : 'resultados'} de búsqueda`
              : `${rows.length} ${rows.length === 1 ? 'libro registrado' : 'libros registrados'}`}
          </caption>
          {header}
          <tbody>
            {rows.map((book) => {
              const { icon: TypeIcon } = typeInfo(book.type)
              return (
                <tr key={book.id} className={book.id === editingId ? 'is-editing' : undefined}>
                  <th scope="row">
                    <div className="d-flex align-items-center gap-3">
                      <span className={`book-cover type-${book.type}`} aria-hidden="true">
                        <TypeIcon size={18} />
                      </span>
                      <span>{book.name}</span>
                    </div>
                  </th>
                  <td className="isbn text-nowrap">{book.isbnNumber}</td>
                  <td className="text-nowrap">{book.author}</td>
                  <td className="text-nowrap text-body-secondary">{formatDate(book.publishDate)}</td>
                  <td className="text-end text-nowrap tabular fw-semibold">{formatPrice(book.price)}</td>
                  <td><TypeBadge type={book.type} /></td>
                  <td className="text-end text-nowrap">
                    <div className="d-inline-flex gap-2">
                      <button type="button" className="btn btn-ghost btn-icon btn-edit" onClick={() => onEdit(book)}
                        aria-label={`Editar ${book.name}`} title="Editar">
                        <Pencil size={16} aria-hidden="true" />
                      </button>
                      <button type="button" className="btn btn-ghost btn-icon btn-delete" onClick={() => askDelete(book)}
                        aria-label={`Eliminar ${book.name}`} title="Eliminar">
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <>
      {content}

      {/* Native modal: inert page, focus containment, Esc and focus return come from the browser. */}
      <dialog ref={dialogRef} className="confirm-dialog" aria-labelledby={dialogTitleId}
        closedby="any" onClose={handleDialogClose}>
        <div className="d-flex gap-3 mb-4">
          <div className="icon-tile"><Trash2 size={20} aria-hidden="true" /></div>
          <div>
            <h2 id={dialogTitleId} className="h6 fw-semibold mb-1">¿Eliminar este libro?</h2>
            <p className="text-body-secondary small mb-0">
              Se eliminará <strong className="text-body">«{pendingDelete?.name}»</strong> del catálogo.
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
        <form method="dialog" className="d-flex justify-content-end gap-2 mb-0">
          <button value="cancel" className="btn btn-ghost" ref={nativeAutofocus}>Cancelar</button>
          <button value="delete" className="btn btn-danger">
            <Trash2 size={16} aria-hidden="true" /> Eliminar
          </button>
        </form>
      </dialog>
    </>
  )
}
