package com.booking.expenseservice.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Value("${app.kafka.expenses-topic}")
    private String expensesTopic;

    @Bean
    public NewTopic expensesTopic() {
        // Creating a Kafka topic with 3 partitions and replication factor of 1
        return TopicBuilder.name(expensesTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
