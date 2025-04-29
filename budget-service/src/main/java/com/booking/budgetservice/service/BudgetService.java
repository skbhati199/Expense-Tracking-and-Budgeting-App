package com.booking.budgetservice.service;

import com.booking.budgetservice.dto.BudgetDTO;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

/**
 * Service interface for budget operations.
 */
public interface BudgetService {

    /**
     * Create a new budget.
     *
     * @param budgetDTO the budget data
     * @return the created budget
     */
    BudgetDTO createBudget(BudgetDTO budgetDTO);

    /**
     * Update an existing budget.
     *
     * @param id the budget ID
     * @param budgetDTO the updated budget data
     * @return the updated budget
     */
    BudgetDTO updateBudget(Long id, BudgetDTO budgetDTO);

    /**
     * Delete a budget.
     *
     * @param id the budget ID
     */
    void deleteBudget(Long id);

    /**
     * Get a budget by ID.
     *
     * @param id the budget ID
     * @return the budget
     */
    BudgetDTO getBudgetById(Long id);

    /**
     * Get all budgets for a user.
     *
     * @param userId the user ID
     * @return list of budgets
     */
    List<BudgetDTO> getBudgetsByUserId(Long userId);

    /**
     * Get all budgets for a user in a specific month.
     *
     * @param userId the user ID
     * @param month the month
     * @return list of budgets
     */
    List<BudgetDTO> getBudgetsByUserIdAndMonth(Long userId, YearMonth month);

    /**
     * Get a budget for a user, category, and month.
     *
     * @param userId the user ID
     * @param category the category
     * @param month the month
     * @return the budget if found
     */
    BudgetDTO getBudgetByUserIdCategoryAndMonth(Long userId, String category, YearMonth month);

    /**
     * Compare budget vs expense for a user in a specific month.
     *
     * @param userId the user ID
     * @param month the month
     * @return map of category to budget status (remaining amount)
     */
    List<BudgetStatusDTO> getBudgetStatus(Long userId, YearMonth month);

    /**
     * Check if a user is overspending in any category and generate alerts if needed.
     *
     * @param userId the user ID
     * @param category the expense category
     * @param amount the expense amount
     * @param month the month
     */
    void checkBudgetAndGenerateAlerts(Long userId, String category, BigDecimal amount, YearMonth month);
}