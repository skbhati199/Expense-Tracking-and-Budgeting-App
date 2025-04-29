package com.booking.expenseservice.controller;

import com.booking.expenseservice.dto.ExpenseDTO;
import com.booking.expenseservice.model.Category;
import com.booking.expenseservice.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<ExpenseDTO>> getAllExpenses(@RequestHeader("X-User-ID") String userId) {
        return ResponseEntity.ok(expenseService.getAllExpenses(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseDTO> getExpenseById(
            @PathVariable Long id,
            @RequestHeader("X-User-ID") String userId) {
        return ResponseEntity.ok(expenseService.getExpenseById(id, userId));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ExpenseDTO>> getExpensesByCategory(
            @PathVariable Category category,
            @RequestHeader("X-User-ID") String userId) {
        return ResponseEntity.ok(expenseService.getExpensesByCategory(userId, category));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<ExpenseDTO>> getExpensesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestHeader("X-User-ID") String userId) {
        return ResponseEntity.ok(expenseService.getExpensesByDateRange(userId, startDate, endDate));
    }

    @GetMapping("/today")
    public ResponseEntity<List<ExpenseDTO>> getTodayExpenses(
            @RequestHeader("X-User-ID") String userId) {
        return ResponseEntity.ok(expenseService.getTodayExpenses(userId));
    }

    @GetMapping("/tag/{tag}")
    public ResponseEntity<List<ExpenseDTO>> getExpensesByTag(
            @PathVariable String tag,
            @RequestHeader("X-User-ID") String userId) {
        return ResponseEntity.ok(expenseService.getExpensesByTag(userId, tag));
    }

    @GetMapping("/total")
    public ResponseEntity<BigDecimal> getTotalExpensesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestHeader("X-User-ID") String userId) {
        return ResponseEntity.ok(expenseService.getTotalExpensesByDateRange(userId, startDate, endDate));
    }

    @GetMapping("/total/category/{category}")
    public ResponseEntity<BigDecimal> getTotalExpensesByCategoryAndDateRange(
            @PathVariable Category category,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestHeader("X-User-ID") String userId) {
        return ResponseEntity.ok(expenseService.getTotalExpensesByCategoryAndDateRange(userId, category, startDate, endDate));
    }

    @PostMapping
    public ResponseEntity<ExpenseDTO> createExpense(
            @Valid @RequestBody ExpenseDTO expenseDTO) {
        ExpenseDTO createdExpense = expenseService.createExpense(expenseDTO);
        return new ResponseEntity<>(createdExpense, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseDTO> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseDTO expenseDTO,
            @RequestHeader("X-User-ID") String userId) {
        ExpenseDTO updatedExpense = expenseService.updateExpense(id, expenseDTO, userId);
        return ResponseEntity.ok(updatedExpense);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable Long id,
            @RequestHeader("X-User-ID") String userId) {
        expenseService.deleteExpense(id, userId);
        return ResponseEntity.noContent().build();
    }
}
