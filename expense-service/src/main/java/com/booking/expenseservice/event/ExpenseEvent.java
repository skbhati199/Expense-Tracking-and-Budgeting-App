package com.booking.expenseservice.event;

import com.booking.expenseservice.model.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseEvent {
    
    private String eventId;
    private String eventType; // CREATED, UPDATED, DELETED
    private Long expenseId;
    private String userId;
    private BigDecimal amount;
    private Category category;
    private LocalDate date;
    private String description;
}
