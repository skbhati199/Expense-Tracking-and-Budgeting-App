package com.booking.budgetservice.service.impl;

import com.booking.budgetservice.dto.BudgetDTO;
import com.booking.budgetservice.dto.BudgetStatusDTO;
import com.booking.budgetservice.exception.ResourceNotFoundException;
import com.booking.budgetservice.model.Budget;
import com.booking.budgetservice.repository.BudgetRepository;
import com.booking.budgetservice.service.BudgetService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Implementation of the BudgetService interface.
 */
@Service
@Slf4j
public class BudgetServiceImpl implements BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;
    
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;
    
    // Kafka topic for budget alerts
    private static final String BUDGET_ALERTS_TOPIC = "budget-alerts";
    
    // Simulated expense data - in a real application, this would come from the Expense Service via API calls
    private Map<Long, Map<String, Map<YearMonth, BigDecimal>>> userExpenses = new HashMap<>();

    @Override
    @Transactional
    public BudgetDTO createBudget(BudgetDTO budgetDTO) {
        // Check if budget already exists for this user, category, and month
        if (budgetRepository.existsByUserIdAndCategoryAndMonth(
                budgetDTO.userId(), budgetDTO.category(), budgetDTO.month())) {
            throw new IllegalArgumentException(
                    "Budget already exists for user " + budgetDTO.userId() + 
                    " in category " + budgetDTO.category() + 
                    " for month " + budgetDTO.month());
        }
        
        Budget budget = mapToEntity(budgetDTO);
        Budget savedBudget = budgetRepository.save(budget);
        log.info("Created budget: {} for user: {} in category: {} for month: {}", 
                savedBudget.getId(), savedBudget.getUserId(), 
                savedBudget.getCategory(), savedBudget.getMonth());
        
        return mapToDTO(savedBudget);
    }

    @Override
    @Transactional
    public BudgetDTO updateBudget(Long id, BudgetDTO budgetDTO) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));
        
        budget.setAmount(budgetDTO.amount());
        budget.setCategory(budgetDTO.category());
        budget.setMonth(budgetDTO.month());
        
        Budget updatedBudget = budgetRepository.save(budget);
        log.info("Updated budget: {} for user: {} in category: {} for month: {}", 
                updatedBudget.getId(), updatedBudget.getUserId(), 
                updatedBudget.getCategory(), updatedBudget.getMonth());
        
        // Check if the updated budget requires alerts
        checkBudgetAndGenerateAlerts(
                updatedBudget.getUserId(), 
                updatedBudget.getCategory(), 
                getExpenseAmount(updatedBudget.getUserId(), updatedBudget.getCategory(), updatedBudget.getMonth()), 
                updatedBudget.getMonth());
        
        return mapToDTO(updatedBudget);
    }

    @Override
    @Transactional
    public void deleteBudget(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));
        
        budgetRepository.delete(budget);
        log.info("Deleted budget: {} for user: {} in category: {} for month: {}", 
                budget.getId(), budget.getUserId(), 
                budget.getCategory(), budget.getMonth());
    }

    @Override
    public BudgetDTO getBudgetById(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));
        
        return mapToDTO(budget);
    }

    @Override
    public List<BudgetDTO> getBudgetsByUserId(Long userId) {
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        return budgets.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BudgetDTO> getBudgetsByUserIdAndMonth(Long userId, YearMonth month) {
        List<Budget> budgets = budgetRepository.findByUserIdAndMonth(userId, month);
        return budgets.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BudgetDTO getBudgetByUserIdCategoryAndMonth(Long userId, String category, YearMonth month) {
        Budget budget = budgetRepository.findByUserIdAndCategoryAndMonth(userId, category, month);
        if (budget == null) {
            throw new ResourceNotFoundException(
                    "Budget not found for user " + userId + 
                    " in category " + category + 
                    " for month " + month);
        }
        return mapToDTO(budget);
    }

    @Override
    public List<BudgetStatusDTO> getBudgetStatus(Long userId, YearMonth month) {
        List<Budget> budgets = budgetRepository.findByUserIdAndMonth(userId, month);
        List<BudgetStatusDTO> statusList = new ArrayList<>();
        
        for (Budget budget : budgets) {
            String category = budget.getCategory();
            BigDecimal budgetAmount = budget.getAmount();
            BigDecimal expenseAmount = getExpenseAmount(userId, category, month);
            BigDecimal remainingAmount = budgetAmount.subtract(expenseAmount);
            boolean isOverspent = remainingAmount.compareTo(BigDecimal.ZERO) < 0;
            
            BudgetStatusDTO status = new BudgetStatusDTO(
                    category,
                    budgetAmount,
                    expenseAmount,
                    remainingAmount,
                    isOverspent
            );
            
            statusList.add(status);
        }
        
        return statusList;
    }

    @Override
    public void checkBudgetAndGenerateAlerts(Long userId, String category, BigDecimal amount, YearMonth month) {
        Budget budget = budgetRepository.findByUserIdAndCategoryAndMonth(userId, category, month);
        
        // If no budget is set for this category, no alerts needed
        if (budget == null) {
            return;
        }
        
        BigDecimal budgetAmount = budget.getAmount();
        BigDecimal currentExpense = getExpenseAmount(userId, category, month);
        BigDecimal totalExpense = currentExpense.add(amount);
        BigDecimal remainingBudget = budgetAmount.subtract(totalExpense);
        
        // Check if this expense would cause overspending
        if (remainingBudget.compareTo(BigDecimal.ZERO) < 0) {
            // Create alert message
            Map<String, Object> alert = new HashMap<>();
            alert.put("userId", userId);
            alert.put("category", category);
            alert.put("budgetAmount", budgetAmount);
            alert.put("expenseAmount", totalExpense);
            alert.put("overspentAmount", remainingBudget.abs());
            alert.put("month", month.toString());
            alert.put("timestamp", System.currentTimeMillis());
            
            // Send alert to Kafka topic
            kafkaTemplate.send(BUDGET_ALERTS_TOPIC, alert);
            
            log.info("Budget alert generated for user: {} in category: {} for month: {}", 
                    userId, category, month);
        }
    }
    
    /**
     * Get the expense amount for a user in a specific category and month.
     * In a real application, this would call the Expense Service API.
     *
     * @param userId the user ID
     * @param category the category
     * @param month the month
     * @return the expense amount
     */
    private BigDecimal getExpenseAmount(Long userId, String category, YearMonth month) {
        // Simulated expense data - in a real application, this would come from the Expense Service
        return userExpenses
                .getOrDefault(userId, new HashMap<>())
                .getOrDefault(category, new HashMap<>())
                .getOrDefault(month, BigDecimal.ZERO);
    }
    
    /**
     * Map a Budget entity to a BudgetDTO.
     *
     * @param budget the Budget entity
     * @return the BudgetDTO
     */
    private BudgetDTO mapToDTO(Budget budget) {
        return new BudgetDTO(
                budget.getId(),
                budget.getUserId(),
                budget.getCategory(),
                budget.getAmount(),
                budget.getMonth()
        );
    }
    
    /**
     * Map a BudgetDTO to a Budget entity.
     *
     * @param budgetDTO the BudgetDTO
     * @return the Budget entity
     */
    private Budget mapToEntity(BudgetDTO budgetDTO) {
        return Budget.builder()
                .id(budgetDTO.id())
                .userId(budgetDTO.userId())
                .category(budgetDTO.category())
                .amount(budgetDTO.amount())
                .month(budgetDTO.month())
                .build();
    }
}