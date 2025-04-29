import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ExpenseService } from '../../core/services/expense.service';
import { BudgetService } from '../../core/services/budget.service';
import { Expense, Budget, Category } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Expense Dashboard</h1>
        <div class="user-info">
          <span>Welcome, {{userName}}</span>
          <button class="btn-logout" (click)="logout()">Logout</button>
        </div>
      </header>
      
      <div class="dashboard-content">
        <aside class="sidebar">
          <div class="budget-summary">
            <h3>Monthly Budget</h3>
            <div class="budget-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  [style.width.%]="getBudgetPercentage()"
                  [ngClass]="{'warning': getBudgetPercentage() > 75, 'danger': getBudgetPercentage() > 90}"
                ></div>
              </div>
              <div class="budget-stats">
                <span>{{totalSpent | currency}} / {{totalBudget | currency}}</span>
                <span>{{getRemainingBudget() | currency}} remaining</span>
              </div>
            </div>
          </div>
          
          <div class="category-filters">
            <h3>Filter by Category</h3>
            <div class="category-list">
              <div 
                *ngFor="let category of categories" 
                class="category-item"
                [ngClass]="{'active': selectedCategory === category.name}"
                (click)="filterByCategory(category.name)"
              >
                <span class="category-icon">{{category.icon || '💰'}}</span>
                <span class="category-name">{{category.name}}</span>
              </div>
              <div 
                class="category-item"
                [ngClass]="{'active': selectedCategory === ''}"
                (click)="filterByCategory('')"
              >
                <span class="category-icon">🔄</span>
                <span class="category-name">All Categories</span>
              </div>
            </div>
          </div>
          
          <div class="date-filters">
            <h3>Filter by Date</h3>
            <div class="date-buttons">
              <button (click)="filterByDate('today')" [ngClass]="{'active': dateFilter === 'today'}">Today</button>
              <button (click)="filterByDate('week')" [ngClass]="{'active': dateFilter === 'week'}">This Week</button>
              <button (click)="filterByDate('month')" [ngClass]="{'active': dateFilter === 'month'}">This Month</button>
              <button (click)="filterByDate('all')" [ngClass]="{'active': dateFilter === 'all'}">All Time</button>
            </div>
          </div>
        </aside>
        
        <main class="main-content">
          <div class="expense-summary">
            <div class="summary-card total-expenses">
              <h3>Total Expenses</h3>
              <p class="amount">{{totalSpent | currency}}</p>
              <p class="period">{{getDateRangeText()}}</p>
            </div>
            
            <div class="summary-card budget-status">
              <h3>Budget Status</h3>
              <p class="amount" [ngClass]="{'text-danger': getBudgetPercentage() > 90, 'text-warning': getBudgetPercentage() > 75}">
                {{getBudgetPercentage()}}%
              </p>
              <p class="period">of budget used</p>
            </div>
            
            <div class="summary-card top-category">
              <h3>Top Category</h3>
              <p class="category">{{topCategory?.name || 'N/A'}}</p>
              <p class="amount">{{topCategory?.amount | currency}}</p>
            </div>
          </div>
          
          <div class="chart-container">
            <h3>Monthly Expenses</h3>
            <div class="chart-placeholder">
              <!-- Chart.js will be implemented here -->
              <div class="bar-chart">
                <div *ngFor="let item of chartData" class="chart-bar">
                  <div class="bar" [style.height.%]="getBarHeight(item.amount)"></div>
                  <div class="bar-label">{{item.label}}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="expense-list-container">
            <div class="expense-header">
              <h3>Recent Expenses</h3>
              <button class="btn-add" routerLink="/expenses/add">Add Expense</button>
            </div>
            
            <div class="expense-list">
              <div *ngIf="isLoading" class="loading">Loading expenses...</div>
              
              <div *ngIf="!isLoading && filteredExpenses.length === 0" class="no-expenses">
                No expenses found. Add your first expense!
              </div>
              
              <div *ngFor="let expense of filteredExpenses" class="expense-item">
                <div class="expense-details">
                  <div class="expense-category" [attr.data-category]="expense.category">
                    {{getCategoryIcon(expense.category)}} {{expense.category}}
                  </div>
                  <div class="expense-description">{{expense.description}}</div>
                  <div class="expense-date">{{expense.date | date:'mediumDate'}}</div>
                </div>
                <div class="expense-amount">{{expense.amount | currency}}</div>
                <div class="expense-actions">
                  <button class="btn-edit" routerLink="/expenses/edit/{{expense.id}}">Edit</button>
                  <button class="btn-delete" (click)="deleteExpense(expense.id)">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: #f5f7fa;
    }
    
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background-color: #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .dashboard-header h1 {
      margin: 0;
      color: #333;
      font-size: 1.5rem;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .btn-logout {
      padding: 0.5rem 1rem;
      background-color: transparent;
      border: 1px solid #dc3545;
      color: #dc3545;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-logout:hover {
      background-color: #dc3545;
      color: white;
    }
    
    .dashboard-content {
      display: flex;
      flex: 1;
      padding: 1.5rem;
      gap: 1.5rem;
    }
    
    .sidebar {
      width: 300px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
    }
    
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .budget-summary, .category-filters, .date-filters {
      margin-bottom: 2rem;
    }
    
    h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      color: #333;
      font-size: 1.1rem;
    }
    
    .budget-progress {
      margin-top: 1rem;
    }
    
    .progress-bar {
      height: 10px;
      background-color: #e9ecef;
      border-radius: 5px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }
    
    .progress-fill {
      height: 100%;
      background-color: #28a745;
      border-radius: 5px;
      transition: width 0.3s ease;
    }
    
    .progress-fill.warning {
      background-color: #ffc107;
    }
    
    .progress-fill.danger {
      background-color: #dc3545;
    }
    
    .budget-stats {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      color: #6c757d;
    }
    
    .category-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .category-item {
      display: flex;
      align-items: center;
      padding: 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .category-item:hover {
      background-color: #f8f9fa;
    }
    
    .category-item.active {
      background-color: #e9ecef;
      font-weight: 500;
    }
    
    .category-icon {
      margin-right: 0.5rem;
      font-size: 1.25rem;
    }
    
    .date-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .date-buttons button {
      padding: 0.5rem 1rem;
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .date-buttons button:hover {
      background-color: #e9ecef;
    }
    
    .date-buttons button.active {
      background-color: #007bff;
      color: white;
      border-color: #007bff;
    }
    
    .expense-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    
    .summary-card {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      text-align: center;
    }
    
    .summary-card h3 {
      margin-top: 0;
      margin-bottom: 0.5rem;
      font-size: 1rem;
      color: #6c757d;
    }
    
    .summary-card .amount {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0.5rem 0;
      color: #333;
    }
    
    .summary-card .period, .summary-card .category {
      font-size: 0.875rem;
      color: #6c757d;
      margin: 0;
    }
    
    .text-danger {
      color: #dc3545 !important;
    }
    
    .text-warning {
      color: #ffc107 !important;
    }
    
    .chart-container {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
    }
    
    .chart-placeholder {
      height: 250px;
      margin-top: 1rem;
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
    }
    
    .bar-chart {
      display: flex;
      width: 100%;
      height: 100%;
      align-items: flex-end;
      justify-content: space-around;
    }
    
    .chart-bar {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 40px;
    }
    
    .bar {
      width: 100%;
      background-color: #007bff;
      border-radius: 4px 4px 0 0;
      transition: height 0.3s ease;
    }
    
    .bar-label {
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: #6c757d;
    }
    
    .expense-list-container {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
    }
    
    .expense-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .btn-add {
      padding: 0.5rem 1rem;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .btn-add:hover {
      background-color: #218838;
    }
    
    .expense-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .loading, .no-expenses {
      text-align: center;
      padding: 2rem;
      color: #6c757d;
    }
    
    .expense-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-radius: 4px;
      background-color: #f8f9fa;
      transition: transform 0.2s;
    }
    
    .expense-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .expense-details {
      flex: 1;
    }
    
    .expense-category {
      font-weight: 500;
      margin-bottom: 0.25rem;
    }
    
    .expense-description {
      color: #6c757d;
      margin-bottom: 0.25rem;
    }
    
    .expense-date {
      font-size: 0.75rem;
      color: #adb5bd;
    }
    
    .expense-amount {
      font-weight: 600;
      font-size: 1.1rem;
      margin: 0 1rem;
    }
    
    .expense-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .btn-edit, .btn-delete {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      border: none;
      transition: all 0.2s;
    }
    
    .btn-edit {
      background-color: #17a2b8;
      color: white;
    }
    
    .btn-edit:hover {
      background-color: #138496;
    }
    
    .btn-delete {
      background-color: #dc3545;
      color: white;
    }
    
    .btn-delete:hover {
      background-color: #c82333;
    }
    
    /* Responsive styles */
    @media (max-width: 992px) {
      .dashboard-content {
        flex-direction: column;
      }
      
      .sidebar {
        width: 100%;
      }
    }
    
    @media (max-width: 768px) {
      .expense-summary {
        grid-template-columns: 1fr;
      }
      
      .expense-item {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .expense-amount {
        margin: 0.5rem 0;
      }
      
      .expense-actions {
        align-self: flex-end;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  userName = 'User';
  isLoading = true;
  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  totalBudget = 0;
  totalSpent = 0;
  selectedCategory = '';
  dateFilter = 'month'; // Default to current month
  
  categories: Category[] = [
    { name: 'Food', icon: '🍔' },
    { name: 'Transportation', icon: '🚗' },
    { name: 'Housing', icon: '🏠' },
    { name: 'Entertainment', icon: '🎬' },
    { name: 'Shopping', icon: '🛍️' },
    { name: 'Utilities', icon: '💡' },
    { name: 'Healthcare', icon: '⚕️' },
    { name: 'Other', icon: '📦' }
  ];
  
  topCategory: { name: string, amount: number } | null = null;
  
  chartData = [
    { label: 'Jan', amount: 0 },
    { label: 'Feb', amount: 0 },
    { label: 'Mar', amount: 0 },
    { label: 'Apr', amount: 0 },
    { label: 'May', amount: 0 },
    { label: 'Jun', amount: 0 },
    { label: 'Jul', amount: 0 },
    { label: 'Aug', amount: 0 },
    { label: 'Sep', amount: 0 },
    { label: 'Oct', amount: 0 },
    { label: 'Nov', amount: 0 },
    { label: 'Dec', amount: 0 }
  ];
  
  constructor(
    private expenseService: ExpenseService,
    private budgetService: BudgetService
  ) {}
  
  ngOnInit(): void {
    this.loadExpenses();
    this.loadBudget();
    this.generateMockChartData(); // For demonstration purposes
  }
  
  loadExpenses(): void {
    this.isLoading = true;
    
    // In a real app, this would call the expense service
    // For now, we'll use mock data
    setTimeout(() => {
      this.expenses = [
        {
          id: 1,
          amount: 45.99,
          description: 'Grocery shopping',
          category: 'Food',
          date: new Date(),
          userId: 1
        },
        {
          id: 2,
          amount: 25.50,
          description: 'Gas',
          category: 'Transportation',
          date: new Date(Date.now() - 86400000), // Yesterday
          userId: 1
        },
        {
          id: 3,
          amount: 120.00,
          description: 'Electricity bill',
          category: 'Utilities',
          date: new Date(Date.now() - 172800000), // 2 days ago
          userId: 1
        },
        {
          id: 4,
          amount: 35.75,
          description: 'Movie tickets',
          category: 'Entertainment',
          date: new Date(Date.now() - 259200000), // 3 days ago
          userId: 1
        },
        {
          id: 5,
          amount: 1200.00,
          description: 'Rent',
          category: 'Housing',
          date: new Date(Date.now() - 432000000), // 5 days ago
          userId: 1
        }
      ];
      
      this.applyFilters();
      this.calculateTotalSpent();
      this.findTopCategory();
      this.isLoading = false;
    }, 1000);
    
    // In a real app, we would use:
    /*
    this.expenseService.getAllExpenses().subscribe({
      next: (response) => {
        if (response.result === 'SUCCESS') {
          this.expenses = response.data;
          this.applyFilters();
          this.calculateTotalSpent();
          this.findTopCategory();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading expenses', error);
        this.isLoading = false;
      }
    });
    */
  }
  
  loadBudget(): void {
    // In a real app, this would call the budget service
    // For now, we'll use mock data
    this.totalBudget = 2000;
    
    // In a real app, we would use:
    /*
    this.budgetService.getCurrentMonthBudget().subscribe({
      next: (response) => {
        if (response.result === 'SUCCESS') {
          const budgets = response.data;
          // Find the total budget (category is null)
          const totalBudget = budgets.find(b => !b.category);
          if (totalBudget) {
            this.totalBudget = totalBudget.amount;
          }
        }
      },
      error: (error) => {
        console.error('Error loading budget', error);
      }
    });
    */
  }
  
  applyFilters(): void {
    let filtered = [...this.expenses];
    
    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(e => e.category === this.selectedCategory);
    }
    
    // Apply date filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (this.dateFilter === 'today') {
      filtered = filtered.filter(e => {
        const expenseDate = new Date(e.date);
        expenseDate.setHours(0, 0, 0, 0);
        return expenseDate.getTime() === today.getTime();
      });
    } else if (this.dateFilter === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      
      filtered = filtered.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate >= weekStart;
      });
    } else if (this.dateFilter === 'month') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      
      filtered = filtered.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate >= monthStart;
      });
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    this.filteredExpenses = filtered;
  }
  
  calculateTotalSpent(): void {
    this.totalSpent = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }
  
  findTopCategory(): void {
    const categoryTotals = this.expenses.reduce((totals, expense) => {
      if (!totals[expense.category]) {
        totals[expense.category] = 0;
      }
      totals[expense.category] += expense.amount;
      return totals;
    }, {} as Record<string, number>);
    
    let topCategoryName = '';
    let topAmount = 0;
    
    Object.entries(categoryTotals).forEach(([category, amount]) => {
      if (amount > topAmount) {
        topCategoryName = category;
        topAmount = amount;
      }
    });
    
    if (topCategoryName) {
      this.topCategory = {
        name: topCategoryName,
        amount: topAmount
      };
    }
  }
  
  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }
  
  filterByDate(filter: string): void {
    this.dateFilter = filter;
    this.applyFilters();
  }
  
  getBudgetPercentage(): number {
    if (this.totalBudget === 0) return 0;
    return Math.min(Math.round((this.totalSpent / this.totalBudget) * 100), 100);
  }
  
  getRemainingBudget(): number {
    return Math.max(this.totalBudget - this.totalSpent, 0);
  }
  
  getDateRangeText(): string {
    switch (this.dateFilter) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      default: return 'All Time';
    }
  }
  
  getCategoryIcon(category: string): string {
    const found = this.categories.find(c => c.name === category);
    return found?.icon || '💰';
  }
  
  getBarHeight(amount: number): number {
    const maxAmount = Math.max(...this.chartData.map(item => item.amount));
    if (maxAmount === 0) return 0;
    return (amount / maxAmount) * 100;
  }
  
  generateMockChartData(): void {
    // Generate random data for the chart
    const currentMonth = new Date().getMonth();
    
    this.chartData = this.chartData.map((item, index) => {
      // Generate more realistic data - higher values for recent months
      let amount = Math.random() * 1000;
      
      // Make current month and previous month have higher values
      if (index === currentMonth) {
        amount = Math.random() * 1000 + 500;
      } else if (index === (currentMonth + 11) % 12) { // Previous month
        amount = Math.random() * 1000 + 300;
      }
      
      return {
        ...item,
        amount: Math.round(amount)
      };
    });
  }
  
  deleteExpense(id: number | undefined): void {
    if (!id) return;
    
    // In a real app, we would call the service
    // For now, we'll just update the local arrays
    this.expenses = this.expenses.filter(e => e.id !== id);
    this.applyFilters();
    this.calculateTotalSpent();
    this.findTopCategory();
    
    // In a real app:
    /*
    this.expenseService.deleteExpense(id).subscribe({
      next: (response) => {
        if (response.result === 'SUCCESS') {
          this.expenses = this.expenses.filter(e => e.id !== id);
          this.applyFilters();
          this.calculateTotalSpent();
          this.findTopCategory();
        }
      },
      error: (error) => {
        console.error('Error deleting expense', error);
      }
    });
    */
  }
  
  logout(): void {
    // In a real app, this would call the auth service
    // For now, we'll just redirect to login
    window.location.href = '/auth/login';
  }
}