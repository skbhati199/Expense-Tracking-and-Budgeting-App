package com.booking.budgetservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.YearMonth;

/**
 * Data Transfer Object for Budget entity.
 */
public record BudgetDTO(
    Long id,
    
    @NotNull
    Long userId,
    
    @NotNull
    String category,
    
    @NotNull
    @Positive
    BigDecimal amount,
    
    @NotNull
    YearMonth month
) {
    // Compact canonical constructor for validation
    public BudgetDTO {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        if (category == null || category.trim().isEmpty()) {
            throw new IllegalArgumentException("Category cannot be null or empty");
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }
        if (month == null) {
            throw new IllegalArgumentException("Month cannot be null");
        }
    }
}