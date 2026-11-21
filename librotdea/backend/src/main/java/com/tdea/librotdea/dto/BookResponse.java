package com.tdea.librotdea.dto;

import com.tdea.librotdea.entity.Book;
import com.tdea.librotdea.entity.BookType;
import java.time.LocalDate;

/**
 * Book data returned by the API.
 *
 * @param id          unique identifier
 * @param name        title of the book
 * @param isbnNumber  ISBN code
 * @param author      author of the book
 * @param publishDate publication date
 * @param price       sale price
 * @param type        publication format
 */
public record BookResponse(
        Long id,
        String name,
        String isbnNumber,
        String author,
        LocalDate publishDate,
        Double price,
        BookType type) {

    /**
     * Builds a response from a book entity.
     *
     * @param book the entity to convert
     * @return the equivalent response DTO
     */
    public static BookResponse from(Book book) {
        return new BookResponse(book.getId(), book.getName(), book.getIsbnNumber(), book.getAuthor(),
                book.getPublishDate(), book.getPrice(), book.getType());
    }
}
