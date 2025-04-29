package com.booking.apigateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Auth Service Routes
                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .uri("http://localhost:8081"))
                
                // User Profile Service Routes
                .route("user-service", r -> r
                        .path("/api/profile/**")
                        .uri("http://localhost:8082"))
                
                // Expense Service Routes
                .route("expense-service", r -> r
                        .path("/api/expenses/**")
                        .uri("http://localhost:8083"))
                
                // Budget Service Routes
                .route("budget-service", r -> r
                        .path("/api/budget/**")
                        .uri("http://localhost:8084"))
                
                // Notification Service Routes
                .route("notification-service", r -> r
                        .path("/api/notifications/**")
                        .uri("http://localhost:8085"))
                
                // Reporting Service Routes
                .route("reporting-service", r -> r
                        .path("/api/reports/**")
                        .uri("http://localhost:8086"))
                
                // GraphQL API route for compatible services
                .route("graphql-api", r -> r
                        .path("/graphql")
                        .and()
                        .method(HttpMethod.POST)
                        .uri("http://localhost:8087"))
                
                .build();
    }
}
