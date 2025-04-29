package com.booking.expenseservice.repository;

import com.booking.expenseservice.model.Category;
import com.booking.expenseservice.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    List<Expense> findByUserId(String userId);
    
    List<Expense> findByUserIdAndCategory(String userId, Category category);
    
    List<Expense> findByUserIdAndDateBetween(String userId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT e FROM Expense e WHERE e.userId = :userId AND e.date = CURRENT_DATE")
    List<Expense> findTodayExpensesByUserId(@Param("userId") String userId);
    
    @Query("SELECT e FROM Expense e JOIN e.tags t WHERE e.userId = :userId AND t = :tag")
    List<Expense> findByUserIdAndTag(@Param("userId") String userId, @Param("tag") String tag);
    
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.userId = :userId AND e.date BETWEEN :startDate AND :endDate")
    BigDecimal sumExpensesByUserIdAndDateRange(@Param("userId") String userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.userId = :userId AND e.category = :category AND e.date BETWEEN :startDate AND :endDate")
    BigDecimal sumExpensesByUserIdAndCategoryAndDateRange(@Param("userId") String userId, @Param("category") Category category, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
