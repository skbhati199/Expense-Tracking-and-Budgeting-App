package com.booking.budgetservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Standard API response wrapper for all controller endpoints.
 * Provides consistent response format across the application.
 *
 * @param <T> the type of data in the response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private String result;   // "SUCCESS" or "ERROR"
    private String message;  // status message
    private T data;          // payload
}