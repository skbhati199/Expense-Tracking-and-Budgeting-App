package com.booking.budgetservice.controller;

import com.booking.budgetservice.dto.ApiResponse;
import com.booking.budgetservice.dto.BudgetDTO;
import com.booking.budgetservice.dto.BudgetStatusDTO;
import com.booking.budgetservice.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * REST controller for budget operations.
 */
@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    /**
     * Create a new budget.
     *
     * @param budgetDTO the budget data
     * @return ResponseEntity with the created budget
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BudgetDTO>> createBudget(@Valid @RequestBody BudgetDTO budgetDTO) {
        try {
            BudgetDTO createdBudget = budgetService.createBudget(budgetDTO);
            
            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{id}")
                    .buildAndExpand(createdBudget.id())
                    .toUri();
            
            ApiResponse<BudgetDTO> response = new ApiResponse<>(
                    "SUCCESS",
                    "Budget created successfully",
                    createdBudget
            );
            
            return ResponseEntity.created(location).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>("ERROR", e.getMessage(), null)
            );
        }
    }

    /**
     * Update an existing budget.
     *
     * @param id the budget ID
     * @param budgetDTO the updated budget data
     * @return ResponseEntity with the updated budget
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetDTO>> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody BudgetDTO budgetDTO) {
        try {
            BudgetDTO updatedBudget = budgetService.updateBudget(id, budgetDTO);
            
            ApiResponse<BudgetDTO> response = new ApiResponse<>(
                    "SUCCESS",
                    "Budget updated successfully",
                    updatedBudget
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>("ERROR", e.getMessage(), null)
            );
        }
    }

    /**
     * Delete a budget.
     *
     * @param id the budget ID
     * @return ResponseEntity with success message
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(@PathVariable Long id) {
        try {
            budgetService.deleteBudget(id);
            
            ApiResponse<Void> response = new ApiResponse<>(
                    "SUCCESS",
                    "Budget deleted successfully",
                    null
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>("ERROR", e.getMessage(), null)
            );
        }
    }

    /**
     * Get a budget by ID.
     *
     * @param id the budget ID
     * @return ResponseEntity with the budget
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetDTO>> getBudgetById(@PathVariable Long id) {
        try {
            BudgetDTO budget = budgetService.getBudgetById(id);
            
            ApiResponse<BudgetDTO> response = new ApiResponse<>(
                    "SUCCESS",
                    "Budget retrieved successfully",
                    budget
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>("ERROR", e.getMessage(), null)
            );
        }
    }

    /**
     * Get all budgets for a user.
     *
     * @param userId the user ID
     * @return ResponseEntity with list of budgets
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<BudgetDTO>>> getBudgetsByUserId(@PathVariable Long userId) {
        try {
            List<BudgetDTO> budgets = budgetService.getBudgetsByUserId(userId);
            
            ApiResponse<List<BudgetDTO>> response = new ApiResponse<>(
                    "SUCCESS",
                    "Budgets retrieved successfully",
                    budgets
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>("ERROR", e.getMessage(), null)
            );
        }
    }

    /**
     * Get all budgets for a user in a specific month.
     *
     * @param userId the user ID
     * @param month the month in format yyyy-MM
     * @return ResponseEntity with list of budgets
     */
    @GetMapping("/user/{userId}/month/{month}")
    public ResponseEntity<ApiResponse<List<BudgetDTO>>> getBudgetsByUserIdAndMonth(
            @PathVariable Long userId,
            @PathVariable String month) {
        try {
            YearMonth yearMonth = YearMonth.parse(month, DateTimeFormatter.ofPattern("yyyy-MM"));
            List<BudgetDTO> budgets = budgetService.getBudgetsByUserIdAndMonth(userId, yearMonth);
            
            ApiResponse<List<BudgetDTO>> response = new ApiResponse<>(
                    "SUCCESS",
                    "Budgets retrieved successfully",
                    budgets
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>("ERROR", e.getMessage(), null)
            );
        }
    }

    /**
     * Get budget status for a user in a specific month.
     *
     * @param userId the user ID
     * @param month the month in format yyyy-MM
     * @return ResponseEntity with budget status
     */
    @GetMapping("/status/user/{userId}/month/{month}")
    public ResponseEntity<ApiResponse<List<BudgetStatusDTO>>> getBudgetStatus(
            @PathVariable Long userId,
            @PathVariable String month) {
        try {
            YearMonth yearMonth = YearMonth.parse(month, DateTimeFormatter.ofPattern("yyyy-MM"));
            List<BudgetStatusDTO> budgetStatus = budgetService.getBudgetStatus(userId, yearMonth);
            
            ApiResponse<List<BudgetStatusDTO>> response = new ApiResponse<>(
                    "SUCCESS",
                    "Budget status retrieved successfully",
                    budgetStatus
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>("ERROR", e.getMessage(), null)
            );
        }
    }

    /**
     * Get a budget for a user, category, and month.
     *
     * @param userId the user ID
     * @param category the category
     * @param month the month in format yyyy-MM
     * @return ResponseEntity with the budget
     */
    @GetMapping("/user/{userId}/category/{category}/month/{month}")
    public ResponseEntity<ApiResponse<BudgetDTO>> getBudgetByUserIdCategoryAndMonth(
            @PathVariable Long userId,
            @PathVariable String category,
            @PathVariable String month) {
        try {
            YearMonth yearMonth = YearMonth.parse(month, DateTimeFormatter.ofPattern("yyyy-MM"));
            BudgetDTO budget = budgetService.getBudgetByUserIdCategoryAndMonth(userId, category, yearMonth);
            
            ApiResponse<BudgetDTO> response = new ApiResponse<>(
                    "SUCCESS",
                    "Budget retrieved successfully",
                    budget
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>("ERROR", e.getMessage(), null)
            );
        }
    }
}