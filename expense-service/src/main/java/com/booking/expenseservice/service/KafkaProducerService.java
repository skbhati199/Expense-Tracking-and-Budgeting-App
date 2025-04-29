package com.booking.expenseservice.service;

import com.booking.expenseservice.event.ExpenseEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaProducerService {

    private final KafkaTemplate<String, ExpenseEvent> kafkaTemplate;
    
    @Value("${app.kafka.expenses-topic}")
    private String expensesTopic;
    
    public void publishExpenseEvent(ExpenseEvent expenseEvent) {
        expenseEvent.setEventId(UUID.randomUUID().toString());
        
        CompletableFuture<SendResult<String, ExpenseEvent>> future = kafkaTemplate.send(
                expensesTopic, 
                expenseEvent.getUserId(), 
                expenseEvent
        );
        
        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("Sent event=[{}] with offset=[{}]", 
                        expenseEvent, 
                        result.getRecordMetadata().offset());
            } else {
                log.error("Unable to send event=[{}] due to : {}", 
                        expenseEvent, 
                        ex.getMessage());
            }
        });
    }
}
