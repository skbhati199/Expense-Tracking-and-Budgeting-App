package com.booking.budgetservice.service;

import com.booking.budgetservice.event.BudgetAlertEvent;
import com.booking.budgetservice.model.Budget;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Service responsible for monitoring budgets and generating alerts when thresholds are exceeded.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetAlertService {

    private final KafkaProducerService kafkaProducerService;
    
    // Threshold percentages for different alert levels
    private static final BigDecimal WARNING_THRESHOLD = new BigDecimal("0.80"); // 80%
    private static final BigDecimal CRITICAL_THRESHOLD = new BigDecimal("0.95"); // 95%
    
    /**
     * Checks if the current spending has exceeded any thresholds and sends alerts if necessary.
     * 
     * @param budget the budget to check
     * @param currentSpending the current spending amount
     */
    public void checkBudgetThresholds(Budget budget, BigDecimal currentSpending) {
        if (budget.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            log.warn("Budget amount is zero or negative for budget ID: {}", budget.getId());
            return;
        }
        
        BigDecimal percentageUsed = currentSpending.divide(budget.getAmount(), 2, RoundingMode.HALF_UP);
        
        // Check if spending has exceeded critical threshold
        if (percentageUsed.compareTo(CRITICAL_THRESHOLD) >= 0) {
            sendBudgetAlert(budget, currentSpending, CRITICAL_THRESHOLD, 
                    "CRITICAL: Budget limit almost reached! You've used " + 
                    percentageUsed.multiply(new BigDecimal("100")).setScale(0, RoundingMode.HALF_UP) + 
                    "% of your budget.");
        }
        // Check if spending has exceeded warning threshold
        else if (percentageUsed.compareTo(WARNING_THRESHOLD) >= 0) {
            sendBudgetAlert(budget, currentSpending, WARNING_THRESHOLD, 
                    "WARNING: You've used " + 
                    percentageUsed.multiply(new BigDecimal("100")).setScale(0, RoundingMode.HALF_UP) + 
                    "% of your budget.");
        }
    }
    
    /**
     * Creates and sends a budget alert event.
     * 
     * @param budget the budget that triggered the alert
     * @param currentSpending the current spending amount
     * @param thresholdPercentage the threshold percentage that was exceeded
     * @param alertMessage the alert message
     */
    private void sendBudgetAlert(Budget budget, BigDecimal currentSpending, 
                               BigDecimal thresholdPercentage, String alertMessage) {
        BudgetAlertEvent alertEvent = BudgetAlertEvent.builder()
                .userId(budget.getUserId())
                .budgetId(budget.getId())
                .budgetName(budget.getName())
                .category(budget.getCategory())
                .budgetLimit(budget.getAmount())
                .currentSpending(currentSpending)
                .thresholdPercentage(thresholdPercentage)
                .alertMessage(alertMessage)
                .build();
        
        kafkaProducerService.publishBudgetAlertEvent(alertEvent);
        log.info("Budget alert sent for budget ID: {}, threshold: {}%", 
                budget.getId(), thresholdPercentage.multiply(new BigDecimal("100")));
    }
}