package com.tdea.librotdea.dto;

import java.time.Instant;
import java.util.Map;

/**
 * Standard error body returned by the API.
 *
 * @param timestamp   moment the error occurred
 * @param status      HTTP status code
 * @param error       HTTP reason phrase
 * @param message     human-readable description
 * @param path        request path that caused the error
 * @param fieldErrors validation errors keyed by field name (empty if none)
 */
public record ErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fieldErrors) {
}
