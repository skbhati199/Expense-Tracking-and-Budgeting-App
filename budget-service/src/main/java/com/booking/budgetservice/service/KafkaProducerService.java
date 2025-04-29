package com.booking.budgetservice.service;

import com.booking.budgetservice.event.BudgetAlertEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Service responsible for publishing budget alert events to Kafka.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaProducerService {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    @Value("${spring.kafka.topic.budget-alerts}")
    private String budgetAlertsTopic;
    
    /**
     * Publishes a budget alert event to Kafka.
     * 
     * @param budgetAlertEvent the event to publish
     */
    public void publishBudgetAlertEvent(BudgetAlertEvent budgetAlertEvent) {
        // Generate a unique event ID if not already set
        if (budgetAlertEvent.getEventId() == null) {
            budgetAlertEvent.setEventId(UUID.randomUUID().toString());
        }
        
        // Set timestamp if not already set
        if (budgetAlertEvent.getTimestamp() == null) {
            budgetAlertEvent.setTimestamp(java.time.LocalDateTime.now());
        }
        
        CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(
                budgetAlertsTopic, 
                budgetAlertEvent.getUserId(), 
                budgetAlertEvent
        );
        
        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("Sent budget alert event=[{}] with offset=[{}]", 
                        budgetAlertEvent, 
                        result.getRecordMetadata().offset());
            } else {
                log.error("Unable to send budget alert event=[{}] due to : {}", 
                        budgetAlertEvent, 
                        ex.getMessage());
            }
        });
    }
}