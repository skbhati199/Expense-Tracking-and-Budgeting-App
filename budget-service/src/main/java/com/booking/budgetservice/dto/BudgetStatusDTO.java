package com.booking.budgetservice.dto;

import java.math.BigDecimal;

/**
 * Data Transfer Object for Budget Status information.
 * Represents the comparison between budget and actual expenses.
 */
public record BudgetStatusDTO(
    String category,
    BigDecimal budgetAmount,
    BigDecimal expenseAmount,
    BigDecimal remainingAmount,
    boolean isOverspent
) {
    // Compact canonical constructor for validation
    public BudgetStatusDTO {
        if (category == null || category.trim().isEmpty()) {
            throw new IllegalArgumentException("Category cannot be null or empty");
        }
        if (budgetAmount == null) {
            throw new IllegalArgumentException("Budget amount cannot be null");
        }
        if (expenseAmount == null) {
            throw new IllegalArgumentException("Expense amount cannot be null");
        }
        if (remainingAmount == null) {
            throw new IllegalArgumentException("Remaining amount cannot be null");
        }
    }
}