package com.booking.notificationservice.service;

import com.booking.notificationservice.event.BudgetAlertEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

/**
 * Service responsible for consuming budget alert events from Kafka
 * and processing them to send notifications to users.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetAlertConsumerService {

    private final NotificationService notificationService;
    
    /**
     * Listens for budget alert events from the budget-alerts topic.
     * 
     * @param budgetAlertEvent the budget alert event received from Kafka
     */
    @KafkaListener(topics = "${spring.kafka.topic.budget-alerts:budget-alerts}", 
                  groupId = "${spring.kafka.consumer.group-id:notification-service-group}")
    public void consumeBudgetAlertEvent(BudgetAlertEvent budgetAlertEvent) {
        log.info("Received budget alert event: {}", budgetAlertEvent);
        
        try {
            // Create a notification from the budget alert event
            String notificationContent = String.format(
                    "%s - Budget: %s, Category: %s, Current Spending: %.2f, Limit: %.2f",
                    budgetAlertEvent.getAlertMessage(),
                    budgetAlertEvent.getBudgetName(),
                    budgetAlertEvent.getCategory(),
                    budgetAlertEvent.getCurrentSpending(),
                    budgetAlertEvent.getBudgetLimit()
            );
            
            // Send the notification to the user
            notificationService.sendNotification(
                    budgetAlertEvent.getUserId(),
                    "Budget Alert",
                    notificationContent,
                    "BUDGET_ALERT"
            );
            
            log.info("Successfully processed budget alert for user: {}", budgetAlertEvent.getUserId());
        } catch (Exception e) {
            log.error("Error processing budget alert event: {}", e.getMessage(), e);
        }
    }
}