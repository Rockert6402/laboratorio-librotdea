import axios from 'axios'

/** Axios instance pointing to the backend API (configured in VITE_API_URL). */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

const BOOKS = '/books'

/**
 * Client for the /api/books endpoints.
 * Every method returns the response data; HTTP errors (404, 400...) are thrown as Axios errors.
 */
const BookService = {
  /**
   * Lists every book.
   * @returns {Promise<Array<object>>} all books
   */
  getAll: () => api.get(BOOKS).then((res) => res.data),

  /**
   * Gets one book by id.
   * @param {number} id book id
   * @returns {Promise<object>} the book (rejects with 404 if it does not exist)
   */
  getById: (id) => api.get(`${BOOKS}/${id}`).then((res) => res.data),

  /**
   * Creates a book.
   * @param {object} book name, isbnNumber, author, publishDate, price and type
   * @returns {Promise<object>} the created book, including its id
   */
  create: (book) => api.post(BOOKS, book).then((res) => res.data),

  /**
   * Updates an existing book.
   * @param {number} id book id
   * @param {object} book new book data
   * @returns {Promise<object>} the updated book
   */
  update: (id, book) => api.put(`${BOOKS}/${id}`, book).then((res) => res.data),

  /**
   * Deletes a book.
   * @param {number} id book id
   * @returns {Promise<void>}
   */
  remove: (id) => api.delete(`${BOOKS}/${id}`).then(() => undefined),

  /**
   * Searches books whose name contains the given text (case-insensitive).
   * The backend answers 204 with no body when nothing matches, so this returns [].
   * @param {string} name text to search for
   * @returns {Promise<Array<object>>} matching books, or an empty array
   */
  searchByName: (name) =>
    api.get(`${BOOKS}/search`, { params: { name } }).then((res) => (res.status === 204 ? [] : res.data)),
}

export default BookService
