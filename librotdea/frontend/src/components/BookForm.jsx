import { CircleAlert, Pencil, Plus, Save } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import BookService from '../services/BookService'
import { BOOK_TYPES, todayIso } from './bookFormat'
import useUserInvalidAria from './useUserInvalidAria'

const EMPTY_BOOK = { name: '', isbnNumber: '', author: '', publishDate: '', price: '', type: '' }

/**
 * Form to create a book, or to edit one when `book` is given.
 * Render it with `key={book?.id ?? 'new'}` so it resets when the selected book changes.
 *
 * Errors appear only after the user leaves a field (`:user-invalid`) or tries to submit.
 *
 * @param {object} props
 * @param {object|null} props.book book to edit, or null to create a new one
 * @param {(book: object, isEdit: boolean) => void} props.onSaved called with the saved book
 * @param {(error: unknown) => void} props.onError called if the request fails
 * @param {() => void} props.onCancel called when the user cancels an edit
 * @param {React.Ref<HTMLInputElement>} [props.firstFieldRef] ref to the first field, to focus it
 */
export default function BookForm({ book, onSaved, onError, onCancel, firstFieldRef }) {
  const isEdit = Boolean(book)
  const [values, setValues] = useState(() => (book ? { ...EMPTY_BOOK, ...book } : EMPTY_BOOK))
  const [validated, setValidated] = useState(false)
  const [saving, setSaving] = useState(false)
  const formRef = useRef(null)
  const announcerRef = useUserInvalidAria(formRef)
  const uid = useId()
  const id = (field) => `${uid}-${field}`
  const errorId = (field) => `${uid}-${field}-error`

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.checkValidity()) {
      setValidated(true)
      // The form uses noValidate, so move focus to the first invalid field ourselves:
      // that is what makes a screen reader read its error.
      form.querySelector(':invalid')?.focus()
      return
    }

    const payload = {
      name: values.name.trim(),
      isbnNumber: values.isbnNumber.trim(),
      author: values.author.trim(),
      publishDate: values.publishDate,
      price: Number(values.price),
      type: values.type,
    }

    setSaving(true)
    try {
      const saved = isEdit ? await BookService.update(book.id, payload) : await BookService.create(payload)
      onSaved(saved, isEdit)
      if (!isEdit) {
        // Native reset clears the browser's "user interacted" flag, so the now-empty
        // required fields are not shown as errors.
        form.reset()
        setValues(EMPTY_BOOK)
        setValidated(false)
      }
    } catch (error) {
      onError(error)
    } finally {
      setSaving(false)
    }
  }

  const error = (field, text) => (
    <div id={errorId(field)} className="invalid-feedback">
      <CircleAlert size={14} aria-hidden="true" /> {text}
    </div>
  )

  const textField = (field, label, { maxLength, placeholder, mono, inputRef }, errorText) => (
    <div className="mb-3">
      <label htmlFor={id(field)} className="form-label">{label}</label>
      <input id={id(field)} name={field} ref={inputRef} className={`form-control${mono ? ' font-monospace' : ''}`}
        required maxLength={maxLength} pattern=".*\S.*" placeholder={placeholder} autoComplete="off"
        data-error={errorId(field)} value={values[field]} onChange={handleChange} />
      {error(field, errorText)}
    </div>
  )

  return (
    <form ref={formRef} noValidate className={`book-form${validated ? ' was-validated' : ''}`} onSubmit={handleSubmit}>
      {isEdit && (
        <div className="editing-banner mb-3">
          <Pencil size={14} aria-hidden="true" />
          <span className="text-truncate">Editando «{book.name}»</span>
        </div>
      )}

      <h3 className="form-section-title">Información del libro</h3>
      {textField('name', 'Nombre', { maxLength: 255, placeholder: 'Ej. Cien años de soledad', inputRef: firstFieldRef },
        'El nombre es obligatorio.')}
      {textField('author', 'Autor', { maxLength: 255, placeholder: 'Ej. Gabriel García Márquez' },
        'El autor es obligatorio.')}
      {textField('isbnNumber', 'ISBN', { maxLength: 20, placeholder: '978-0-00-000000-0', mono: true },
        'El ISBN es obligatorio (máximo 20 caracteres).')}

      <hr className="form-divider" />

      <h3 className="form-section-title">Publicación y precio</h3>
      <div className="row g-3 mb-3">
        <div className="col-sm-6 col-xl-12">
          <label htmlFor={id('publishDate')} className="form-label">Fecha de publicación</label>
          <input id={id('publishDate')} name="publishDate" type="date" className="form-control" required
            max={todayIso()} data-error={errorId('publishDate')} value={values.publishDate} onChange={handleChange} />
          {error('publishDate', 'Indica una fecha que no sea futura.')}
        </div>
        <div className="col-sm-6 col-xl-12">
          <label htmlFor={id('type')} className="form-label">Tipo</label>
          <select id={id('type')} name="type" className="form-select" required
            data-error={errorId('type')} value={values.type} onChange={handleChange}>
            <option value="" disabled>Selecciona…</option>
            {BOOK_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {error('type', 'Selecciona el tipo de libro.')}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor={id('price')} className="form-label">Precio</label>
        <div className="input-group">
          <span className="input-group-text">COP $</span>
          <input id={id('price')} name="price" type="number" inputMode="decimal" className="form-control tabular" required
            min="0.01" step="0.01" placeholder="0" data-error={errorId('price')} value={values.price} onChange={handleChange} />
        </div>
        {error('price', 'El precio es obligatorio y debe ser mayor que 0.')}
      </div>

      <div className="d-flex gap-2">
        {isEdit && (
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn btn-primary flex-grow-1" disabled={saving}>
          {saving ? (
            <span className="spinner-border spinner-border-sm" aria-hidden="true" />
          ) : isEdit ? (
            <Save size={16} aria-hidden="true" />
          ) : (
            <Plus size={16} aria-hidden="true" />
          )}
          {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Registrar libro'}
        </button>
      </div>

      {/* One polite live region announces an error when the user leaves an invalid field. */}
      <div ref={announcerRef} className="visually-hidden" aria-live="polite" />
    </form>
  )
}
