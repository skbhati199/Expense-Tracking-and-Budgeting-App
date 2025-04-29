package com.booking.expenseservice.service;

import com.booking.expenseservice.dto.ExpenseDTO;
import com.booking.expenseservice.event.ExpenseEvent;
import com.booking.expenseservice.exception.ResourceNotFoundException;
import com.booking.expenseservice.model.Category;
import com.booking.expenseservice.model.Expense;
import com.booking.expenseservice.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final KafkaProducerService kafkaProducerService;

    @Transactional(readOnly = true)
    public List<ExpenseDTO> getAllExpenses(String userId) {
        return expenseRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExpenseDTO getExpenseById(Long id, String userId) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
        
        // Security check to ensure the user is accessing their own expense
        if (!expense.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Expense not found with id: " + id);
        }
        
        return convertToDTO(expense);
    }

    @Transactional(readOnly = true)
    public List<ExpenseDTO> getExpensesByCategory(String userId, Category category) {
        return expenseRepository.findByUserIdAndCategory(userId, category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExpenseDTO> getExpensesByDateRange(String userId, LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExpenseDTO> getTodayExpenses(String userId) {
        return expenseRepository.findTodayExpensesByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExpenseDTO> getExpensesByTag(String userId, String tag) {
        return expenseRepository.findByUserIdAndTag(userId, tag).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExpenseDTO createExpense(ExpenseDTO expenseDTO) {
        Expense expense = convertToEntity(expenseDTO);
        Expense savedExpense = expenseRepository.save(expense);
        
        // Publish event to Kafka
        publishExpenseCreatedEvent(savedExpense);
        
        return convertToDTO(savedExpense);
    }

    @Transactional
    public ExpenseDTO updateExpense(Long id, ExpenseDTO expenseDTO, String userId) {
        Expense existingExpense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
        
        // Security check to ensure the user is updating their own expense
        if (!existingExpense.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Expense not found with id: " + id);
        }
        
        // Update the fields
        existingExpense.setAmount(expenseDTO.getAmount());
        existingExpense.setDescription(expenseDTO.getDescription());
        existingExpense.setCategory(expenseDTO.getCategory());
        existingExpense.setDate(expenseDTO.getDate());
        existingExpense.setTags(expenseDTO.getTags());
        existingExpense.setReceiptImageUrl(expenseDTO.getReceiptImageUrl());
        existingExpense.setNotes(expenseDTO.getNotes());
        
        Expense updatedExpense = expenseRepository.save(existingExpense);
        
        // Publish event to Kafka
        publishExpenseUpdatedEvent(updatedExpense);
        
        return convertToDTO(updatedExpense);
    }

    @Transactional
    public void deleteExpense(Long id, String userId) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
        
        // Security check to ensure the user is deleting their own expense
        if (!expense.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Expense not found with id: " + id);
        }
        
        // Store expense details before deletion for event publishing
        Expense expenseToDelete = expense;
        
        expenseRepository.deleteById(id);
        
        // Publish event to Kafka
        publishExpenseDeletedEvent(expenseToDelete);
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalExpensesByDateRange(String userId, LocalDate startDate, LocalDate endDate) {
        return expenseRepository.sumExpensesByUserIdAndDateRange(userId, startDate, endDate);
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalExpensesByCategoryAndDateRange(String userId, Category category, LocalDate startDate, LocalDate endDate) {
        return expenseRepository.sumExpensesByUserIdAndCategoryAndDateRange(userId, category, startDate, endDate);
    }
    
    // Helper methods to convert between Entity and DTO
    private ExpenseDTO convertToDTO(Expense expense) {
        return ExpenseDTO.builder()
                .id(expense.getId())
                .userId(expense.getUserId())
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .category(expense.getCategory())
                .date(expense.getDate())
                .tags(expense.getTags())
                .receiptImageUrl(expense.getReceiptImageUrl())
                .notes(expense.getNotes())
                .build();
    }
    
    private Expense convertToEntity(ExpenseDTO expenseDTO) {
        return Expense.builder()
                .id(expenseDTO.getId())
                .userId(expenseDTO.getUserId())
                .amount(expenseDTO.getAmount())
                .description(expenseDTO.getDescription())
                .category(expenseDTO.getCategory())
                .date(expenseDTO.getDate())
                .tags(expenseDTO.getTags())
                .receiptImageUrl(expenseDTO.getReceiptImageUrl())
                .notes(expenseDTO.getNotes())
                .build();
    }
    
    // Event publishing methods
    private void publishExpenseCreatedEvent(Expense expense) {
        ExpenseEvent event = createExpenseEvent(expense, "CREATED");
        kafkaProducerService.publishExpenseEvent(event);
    }
    
    private void publishExpenseUpdatedEvent(Expense expense) {
        ExpenseEvent event = createExpenseEvent(expense, "UPDATED");
        kafkaProducerService.publishExpenseEvent(event);
    }
    
    private void publishExpenseDeletedEvent(Expense expense) {
        ExpenseEvent event = createExpenseEvent(expense, "DELETED");
        kafkaProducerService.publishExpenseEvent(event);
    }
    
    private ExpenseEvent createExpenseEvent(Expense expense, String eventType) {
        return ExpenseEvent.builder()
                .eventType(eventType)
                .expenseId(expense.getId())
                .userId(expense.getUserId())
                .amount(expense.getAmount())
                .category(expense.getCategory())
                .date(expense.getDate())
                .description(expense.getDescription())
                .build();
    }
}
