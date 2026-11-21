package com.tdea.librotdea.controller;

import com.tdea.librotdea.dto.BookRequest;
import com.tdea.librotdea.dto.BookResponse;
import com.tdea.librotdea.dto.ErrorResponse;
import com.tdea.librotdea.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * REST API for managing books.
 */
@RestController
@RequestMapping("/api/books")
@Tag(name = "Books", description = "Create, read, update, delete and search books")
public class BookController {

    private final BookService bookService;

    /**
     * Creates the controller.
     *
     * @param bookService service that handles book operations
     */
    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    /**
     * Lists every book.
     *
     * @return 200 with all books
     */
    @GetMapping
    @Operation(summary = "List all books")
    @ApiResponse(responseCode = "200", description = "Books found")
    public ResponseEntity<List<BookResponse>> findAll() {
        return ResponseEntity.ok(bookService.findAll());
    }

    /**
     * Returns one book by id.
     *
     * @param id book identifier
     * @return 200 with the book (404 is produced by the exception handler)
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get a book by id")
    @ApiResponse(responseCode = "200", description = "Book found")
    @ApiResponse(responseCode = "404", description = "Book not found",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    public ResponseEntity<BookResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.findById(id));
    }

    /**
     * Searches books whose name contains the given text, ignoring case.
     *
     * @param name text to search for
     * @return 200 with the matches, or 204 if there are none
     */
    @GetMapping("/search")
    @Operation(summary = "Search books by name")
    @ApiResponse(responseCode = "200", description = "Matching books")
    @ApiResponse(responseCode = "204", description = "No book matches", content = @Content)
    public ResponseEntity<List<BookResponse>> findByName(@RequestParam String name) {
        List<BookResponse> books = bookService.findByName(name);
        return books.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(books);
    }

    /**
     * Creates a book.
     *
     * @param request data of the new book
     * @return 201 with the created book and its URL in the Location header
     */
    @PostMapping
    @Operation(summary = "Create a book")
    @ApiResponse(responseCode = "201", description = "Book created")
    @ApiResponse(responseCode = "400", description = "Invalid data",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    public ResponseEntity<BookResponse> create(@Valid @RequestBody BookRequest request) {
        BookResponse created = bookService.save(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    /**
     * Replaces the data of an existing book.
     *
     * @param id      identifier of the book to update
     * @param request new data for the book
     * @return 200 with the updated book (404/400 are produced by the exception handler)
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update a book")
    @ApiResponse(responseCode = "200", description = "Book updated")
    @ApiResponse(responseCode = "400", description = "Invalid data",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    @ApiResponse(responseCode = "404", description = "Book not found",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    public ResponseEntity<BookResponse> update(@PathVariable Long id, @Valid @RequestBody BookRequest request) {
        return ResponseEntity.ok(bookService.update(id, request));
    }

    /**
     * Deletes a book.
     *
     * @param id identifier of the book to delete
     * @return 204 with no body (404 is produced by the exception handler)
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a book")
    @ApiResponse(responseCode = "204", description = "Book deleted")
    @ApiResponse(responseCode = "404", description = "Book not found",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bookService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
