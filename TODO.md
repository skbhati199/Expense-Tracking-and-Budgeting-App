## Expense Tracking and Budgeting App

---

### 🎯 **Project Goal**
To build a secure, scalable, cloud-native app that helps users track expenses, set budgets, and receive real-time alerts using microservices and Kafka-based event-driven architecture.

---

### 🏗️ **Architecture Overview**

```
Frontend (Angular)
      |
API Gateway (Spring Cloud Gateway)
      |
+---------------------------------------------+
|              Microservices (Spring Boot)    |
|                                             |
| - Auth Service (JWT, OAuth2)                |
| - User Profile Service                      |
| - Expense Service                           |
| - Budget Service                            |
| - Notification Service (Kafka Consumer)     |
| - Reporting Service (gRPC + REST API)       |
+---------------------------------------------+
      |
Database: PostgreSQL per service (or shared schema)
Kafka (for event publishing)
GraphQL Gateway (for some frontends)
```

---

### 🔀 **Microservices Breakdown**

####  1. **Auth Service**
- [ ] OAuth2 + JWT token-based login/register
- [ ] Integration with external identity provider (e.g., Google)
- [ ] Roles: `User`, `Admin`
- [ ] REST APIs: `/login`, `/register`, `/validate`

####  2. **User Profile Service**
- [ ] CRUD profile (name, email, currency, monthly_income, etc.)
- [ ] REST APIs: `/profile`, `/profile/update`
- [ ] Connect with PostgreSQL using JPA + Hibernate

####  3. **Expense Service**
- [ ] Create, edit, delete expense records
- [ ] Filter by date, category, tag
- [ ] Emit Kafka events to: `expenses-topic`
- [ ] REST + GraphQL API: `/expenses`, `/expenses/today`, `/expensesByCategory`
- [ ] Entity: `amount`, `description`, `category`, `date`, `user_id`

####  4. **Budget Service**
- [ ] Set monthly budget, category-wise budget
- [ ] Compare budget vs expense per user
- [ ] Generate warning event if overspending → publish to Kafka
- [ ] REST + GraphQL APIs: `/budget`, `/budget/status`

####  5. **Notification Service**
- [ ] Kafka consumer for `expenses-topic`, `budget-alerts`
- [ ] Send email or push alerts
- [ ] Retry mechanism with dead-letter queue
- [ ] Optional: integrate with Twilio/Mailgun

####  6. **Reporting Service**
- [ ] Aggregate monthly/yearly reports
- [ ] Expose REST + gRPC APIs for analytics
- [ ] Endpoints:
    - `/report/summary`
    - gRPC: `GetSpendingTrend()`, `GetCategorySummary()`

---

### 📦 **Backend Technologies**
- Spring Boot + Spring Cloud
- Spring Data JPA + PostgreSQL
- GraphQL with `spring-boot-starter-graphql`
- Kafka with `spring-kafka`
- gRPC with `grpc-spring-boot-starter`
- OAuth2 + JWT (`spring-security-oauth2`)

---

### 💻 **Frontend (Angular) TODO**
- [ ] Login/Register pages
- [ ] Dashboard with:
    - Expense list
    - Category filters
    - Monthly bar charts (Chart.js/D3.js)
- [ ] Budget setup & alerts
- [ ] Reports (downloadable PDF/CSV)

---

### 🔐 **Authentication & Authorization**
- JWT for token-based auth
- OAuth2 Google login
- Role-based route guards in Angular

---

### 🐳 **Docker TODO**
- [x] Dockerfile for each microservice
- [x] Docker Compose (for local stack):
    - All services
    - Kafka + Zookeeper
    - PostgreSQL DBs
    - Frontend app
- [x] Expose ports via nginx proxy (for frontend)

---

### ☸️ **Kubernetes TODO**
- [ ] Deployment & Service YAMLs for each microservice
- [ ] Kafka + Zookeeper StatefulSet/Deployment
- [ ] ConfigMap for service configuration
- [ ] Secrets for DB creds, JWT secrets
- [ ] Ingress Controller for frontend + gateway
- [ ] Setup autoscaling policies

---

### 🚀 **CI/CD**
- [ ] GitHub Actions / Jenkins pipeline
- [ ] Steps:
    - Build → Test → Dockerize → Push to ECR → Deploy to EKS
- [ ] Helm chart for Kubernetes deployment

---

### 📊 **Optional Enhancements**
- [ ] AI-based monthly budget suggestions
- [ ] Mobile-friendly PWA (Angular + Capacitor)
- [ ] Currency conversion via third-party API
- [ ] Audit logs in MongoDB or Elasticsearch
