import { useEffect, useRef } from 'react'

const ANNOUNCE_DELAY_MS = 500
const FIELD_SELECTOR = 'input, select, textarea'

/**
 * Keeps aria-invalid and aria-describedby in sync with the visual error state of a form,
 * so screen readers hear an error only once it is shown (after leaving a field or submitting).
 *
 * A field counts as invalid when it matches `:user-invalid`, or when the form has the
 * Bootstrap `was-validated` class (set after a failed submit) and the field is not valid.
 * Each field links its error message through `data-error="<id of the message>"`.
 *
 * @param {React.RefObject<HTMLFormElement>} formRef the form to watch
 * @returns {React.RefObject<HTMLDivElement>} ref for a visually hidden polite live region
 */
export default function useUserInvalidAria(formRef) {
  const announcerRef = useRef(null)

  useEffect(() => {
    const form = formRef.current
    const announcer = announcerRef.current
    if (!form || !announcer) return undefined

    const flagged = new WeakSet()
    const announced = new WeakSet()
    let announceTimer
    let announcedField

    // List the error id in aria-describedby only while the error is shown: hidden text
    // referenced by aria-describedby is still announced.
    const linkError = (el, shown) => {
      const errorId = el.dataset.error
      if (!errorId) return
      const ids = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter((id) => id && id !== errorId)
      if (shown) ids.push(errorId)
      if (ids.length) el.setAttribute('aria-describedby', ids.join(' '))
      else el.removeAttribute('aria-describedby')
    }

    const announceError = (el) => {
      const error = document.getElementById(el.dataset.error)
      if (!error) return
      const label = el.labels?.[0] ? `${el.labels[0].textContent.trim()}: ` : ''
      clearTimeout(announceTimer)
      announcer.textContent = ''
      announcedField = el
      // Wait until the screen reader has announced the next focused field.
      announceTimer = setTimeout(() => {
        announcer.textContent = label + error.textContent.trim()
      }, ANNOUNCE_DELAY_MS)
    }

    const isShownInvalid = (el) =>
      el.matches(':user-invalid') || (form.classList.contains('was-validated') && !el.validity.valid)

    const sync = (el, { announce = false, invalid = isShownInvalid(el) } = {}) => {
      if (!el.matches?.(FIELD_SELECTOR)) return
      if (invalid) {
        if (announce && !announced.has(el)) {
          announceError(el)
          announced.add(el)
        }
        el.setAttribute('aria-invalid', 'true')
        linkError(el, true)
        flagged.add(el)
      } else if (flagged.has(el) || el.getAttribute('aria-invalid') !== 'true') {
        el.setAttribute('aria-invalid', 'false')
        linkError(el, false)
        flagged.delete(el)
        announced.delete(el)
        if (announcedField === el) {
          clearTimeout(announceTimer)
          announcer.textContent = ''
        }
      }
    }

    const fields = () => form.querySelectorAll(FIELD_SELECTOR)
    // Start at aria-invalid="false": Firefox and Safari expose empty required fields as invalid on load.
    fields().forEach((el) => sync(el))

    const onBlur = (e) => sync(e.target, { announce: true })
    const onInput = (e) => {
      if (e.target.hasAttribute?.('aria-invalid')) sync(e.target)
    }
    const onChange = (e) => sync(e.target, { announce: true })
    // A failed submit fires 'invalid' on each failing field; focus moving to the first one
    // reads its error, so these are not announced again.
    const onInvalid = (e) => {
      announced.add(e.target)
      sync(e.target, { invalid: true })
    }
    const onReset = () => setTimeout(() => fields().forEach((el) => sync(el)))

    form.addEventListener('blur', onBlur, true)
    form.addEventListener('input', onInput)
    form.addEventListener('change', onChange, true)
    form.addEventListener('invalid', onInvalid, true)
    form.addEventListener('reset', onReset, true)
    return () => {
      clearTimeout(announceTimer)
      form.removeEventListener('blur', onBlur, true)
      form.removeEventListener('input', onInput)
      form.removeEventListener('change', onChange, true)
      form.removeEventListener('invalid', onInvalid, true)
      form.removeEventListener('reset', onReset, true)
    }
  }, [formRef])

  return announcerRef
}
