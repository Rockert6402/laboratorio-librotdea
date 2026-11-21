package com.tdea.librotdea.service;

import com.tdea.librotdea.dto.BookRequest;
import com.tdea.librotdea.dto.BookResponse;
import com.tdea.librotdea.entity.Book;
import com.tdea.librotdea.exception.ResourceNotFoundException;
import com.tdea.librotdea.repository.BookRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Business logic for managing books.
 */
@Service
@Transactional(readOnly = true)
public class BookService {

    private final BookRepository bookRepository;

    /**
     * Creates the service.
     *
     * @param bookRepository repository used to persist books
     */
    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    /**
     * Returns every book.
     *
     * @return all books, or an empty list if there are none
     */
    public List<BookResponse> findAll() {
        return bookRepository.findAll().stream().map(BookResponse::from).toList();
    }

    /**
     * Returns the book with the given id.
     *
     * @param id book identifier
     * @return the book found
     * @throws ResourceNotFoundException if no book has that id
     */
    public BookResponse findById(Long id) {
        return BookResponse.from(getBookOrThrow(id));
    }

    /**
     * Returns the books whose name contains the given text, ignoring case.
     *
     * @param name text to search for
     * @return matching books, or an empty list if none match
     */
    public List<BookResponse> findByName(String name) {
        return bookRepository.findByNameContainingIgnoreCase(name).stream().map(BookResponse::from).toList();
    }

    /**
     * Creates a new book.
     *
     * @param request data of the book to create
     * @return the created book, including its generated id
     */
    @Transactional
    public BookResponse save(BookRequest request) {
        Book book = new Book();
        applyRequest(book, request);
        return BookResponse.from(bookRepository.save(book));
    }

    /**
     * Replaces the data of an existing book.
     *
     * @param id      identifier of the book to update
     * @param request new data for the book
     * @return the updated book
     * @throws ResourceNotFoundException if no book has that id
     */
    @Transactional
    public BookResponse update(Long id, BookRequest request) {
        Book book = getBookOrThrow(id);
        applyRequest(book, request);
        return BookResponse.from(bookRepository.save(book));
    }

    /**
     * Deletes the book with the given id.
     *
     * @param id identifier of the book to delete
     * @throws ResourceNotFoundException if no book has that id
     */
    @Transactional
    public void deleteById(Long id) {
        if (!bookRepository.existsById(id)) {
            throw notFound(id);
        }
        bookRepository.deleteById(id);
    }

    private Book getBookOrThrow(Long id) {
        return bookRepository.findById(id).orElseThrow(() -> notFound(id));
    }

    private static ResourceNotFoundException notFound(Long id) {
        return new ResourceNotFoundException("Book with id " + id + " not found");
    }

    private static void applyRequest(Book book, BookRequest request) {
        book.setName(request.name());
        book.setIsbnNumber(request.isbnNumber());
        book.setAuthor(request.author());
        book.setPublishDate(request.publishDate());
        book.setPrice(request.price());
        book.setType(request.type());
    }
}
