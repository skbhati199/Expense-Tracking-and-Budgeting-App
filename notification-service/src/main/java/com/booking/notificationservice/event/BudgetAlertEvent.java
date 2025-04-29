package com.booking.notificationservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Event object for budget alerts received from Kafka.
 * Contains information about budget threshold breaches.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetAlertEvent {
    
    private String eventId;
    private String userId;
    private String budgetId;
    private String budgetName;
    private String category;
    private BigDecimal budgetLimit;
    private BigDecimal currentSpending;
    private BigDecimal thresholdPercentage;
    private String alertMessage;
    private LocalDateTime timestamp;
    
    /**
     * Calculate the percentage of budget used
     * 
     * @return percentage of budget used
     */
    public BigDecimal getPercentageUsed() {
        if (budgetLimit.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return currentSpending.divide(budgetLimit, 2, BigDecimal.ROUND_HALF_UP)
                .multiply(new BigDecimal("100"));
    }
}