package com.tdea.librotdea.repository;

import com.tdea.librotdea.entity.Book;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Data access for {@link Book} entities.
 */
public interface BookRepository extends JpaRepository<Book, Long> {

    /**
     * Finds books whose name contains the given text, ignoring case.
     *
     * @param name text to search for within the book name
     * @return matching books, or an empty list if none match
     */
    List<Book> findByNameContainingIgnoreCase(String name);
}
