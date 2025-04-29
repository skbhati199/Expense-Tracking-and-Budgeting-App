package com.booking.budgetservice.repository;

import com.booking.budgetservice.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.YearMonth;
import java.util.List;

/**
 * Repository interface for Budget entity.
 */
@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    /**
     * Find all budgets for a specific user.
     *
     * @param userId the user ID
     * @return list of budgets
     */
    List<Budget> findByUserId(Long userId);

    /**
     * Find all budgets for a specific user and month.
     *
     * @param userId the user ID
     * @param month the month
     * @return list of budgets
     */
    List<Budget> findByUserIdAndMonth(Long userId, YearMonth month);

    /**
     * Find a budget for a specific user, category, and month.
     *
     * @param userId the user ID
     * @param category the category
     * @param month the month
     * @return the budget if found
     */
    Budget findByUserIdAndCategoryAndMonth(Long userId, String category, YearMonth month);

    /**
     * Find all budgets for a specific user and category.
     *
     * @param userId the user ID
     * @param category the category
     * @return list of budgets
     */
    List<Budget> findByUserIdAndCategory(Long userId, String category);

    /**
     * Check if a budget exists for a specific user, category, and month.
     *
     * @param userId the user ID
     * @param category the category
     * @param month the month
     * @return true if exists, false otherwise
     */
    boolean existsByUserIdAndCategoryAndMonth(Long userId, String category, YearMonth month);

    /**
     * Get the sum of all budget amounts for a user in a specific month.
     *
     * @param userId the user ID
     * @param month the month
     * @return the sum of budget amounts
     */
    @Query("SELECT SUM(b.amount) FROM Budget b WHERE b.userId = ?1 AND b.month = ?2")
    java.math.BigDecimal getTotalBudgetForUserAndMonth(Long userId, YearMonth month);
}