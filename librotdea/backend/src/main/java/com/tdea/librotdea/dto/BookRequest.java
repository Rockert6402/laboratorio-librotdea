package com.tdea.librotdea.dto;

import com.tdea.librotdea.entity.BookType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * Input data to create or update a book.
 *
 * @param name        title of the book
 * @param isbnNumber  ISBN code
 * @param author      author of the book
 * @param publishDate publication date (cannot be in the future)
 * @param price       sale price (must be greater than zero)
 * @param type        publication format
 */
public record BookRequest(
        @NotBlank(message = "name is required")
        @Size(max = 255, message = "name must have at most 255 characters")
        String name,

        @NotBlank(message = "isbnNumber is required")
        @Size(max = 20, message = "isbnNumber must have at most 20 characters")
        String isbnNumber,

        @NotBlank(message = "author is required")
        @Size(max = 255, message = "author must have at most 255 characters")
        String author,

        @NotNull(message = "publishDate is required")
        @PastOrPresent(message = "publishDate cannot be in the future")
        LocalDate publishDate,

        @NotNull(message = "price is required")
        @Positive(message = "price must be greater than zero")
        Double price,

        @NotNull(message = "type is required")
        BookType type) {
}
