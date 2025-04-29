import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ExpenseService } from '../../core/services/expense.service';
import { BudgetService } from '../../core/services/budget.service';
import { Report, CategoryBreakdown } from '../../core/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="reports-container">
      <header class="reports-header">
        <h1>Expense Reports</h1>
        <div class="actions">
          <button class="btn-download" (click)="downloadReport('pdf')">Download PDF</button>
          <button class="btn-download" (click)="downloadReport('csv')">Download CSV</button>
        </div>
      </header>
      
      <div class="filter-section">
        <form [formGroup]="filterForm" class="filter-form">
          <div class="form-group">
            <label for="month">Month</label>
            <select id="month" formControlName="month" class="form-control" (change)="loadReport()">
              <option *ngFor="let month of availableMonths" [value]="month.value">
                {{ month.label }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="year">Year</label>
            <select id="year" formControlName="year" class="form-control" (change)="loadReport()">
              <option *ngFor="let year of availableYears" [value]="year">
                {{ year }}
              </option>
            </select>
          </div>
        </form>
      </div>
      
      <div class="report-content" *ngIf="!isLoading; else loadingTemplate">
        <div class="summary-section">
          <div class="summary-card">
            <h3>Total Expenses</h3>
            <p class="amount">{{ report?.totalExpenses | currency }}</p>
          </div>
          
          <div class="summary-card">
            <h3>Total Budget</h3>
            <p class="amount">{{ report?.totalBudget | currency }}</p>
          </div>
          
          <div class="summary-card">
            <h3>Budget Status</h3>
            <p class="amount" [ngClass]="{
              'text-danger': getBudgetPercentage() > 100,
              'text-warning': getBudgetPercentage() > 75 && getBudgetPercentage() <= 100,
              'text-success': getBudgetPercentage() <= 75
            }">
              {{ getBudgetPercentage() }}%
            </p>
          </div>
        </div>
        
        <div class="chart-section">
          <h3>Expense Breakdown by Category</h3>
          <div class="pie-chart-container">
            <!-- Placeholder for pie chart - would use Chart.js in real implementation -->
            <div class="pie-chart-placeholder">
              <div class="pie-segments">
                <div *ngFor="let category of report?.categoryBreakdown; let i = index" 
                     class="pie-segment"
                     [style.transform]="'rotate(' + getRotation(i) + 'deg)'"
                     [style.background]="getCategoryColor(i)">
                </div>
              </div>
            </div>
            
            <div class="chart-legend">
              <div *ngFor="let category of report?.categoryBreakdown; let i = index" class="legend-item">
                <span class="color-box" [style.background]="getCategoryColor(i)"></span>
                <span class="category-name">{{ category.category }}</span>
                <span class="category-amount">{{ category.amount | currency }} ({{ category.percentage }}%)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="details-section">
          <h3>Monthly Expense Details</h3>
          <div class="expense-table-container">
            <table class="expense-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>% of Total</th>
                  <th>Budget</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let category of report?.categoryBreakdown">
                  <td>{{ category.category }}</td>
                  <td>{{ category.amount | currency }}</td>
                  <td>{{ category.percentage }}%</td>
                  <td>{{ getCategoryBudget(category.category) | currency }}</td>
                  <td [ngClass]="{
                    'status-danger': getCategoryBudgetStatus(category) > 100,
                    'status-warning': getCategoryBudgetStatus(category) > 75 && getCategoryBudgetStatus(category) <= 100,
                    'status-success': getCategoryBudgetStatus(category) <= 75
                  }">
                    {{ getCategoryBudgetStatus(category) }}%
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>Total</strong></td>
                  <td><strong>{{ report?.totalExpenses | currency }}</strong></td>
                  <td>100%</td>
                  <td><strong>{{ report?.totalBudget | currency }}</strong></td>
                  <td [ngClass]="{
                    'status-danger': getBudgetPercentage() > 100,
                    'status-warning': getBudgetPercentage() > 75 && getBudgetPercentage() <= 100,
                    'status-success': getBudgetPercentage() <= 75
                  }">
                    {{ getBudgetPercentage() }}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
      
      <ng-template #loadingTemplate>
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading report data...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .reports-container {
      padding: 2rem;
      background-color: #f5f7fa;
      min-height: 100vh;
    }
    
    .reports-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    .reports-header h1 {
      margin: 0;
      color: #333;
    }
    
    .actions {
      display: flex;
      gap: 1rem;
    }
    
    .btn-download {
      padding: 0.5rem 1rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .btn-download:hover {
      background-color: #0069d9;
    }
    
    .filter-section {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .filter-form {
      display: flex;
      gap: 1.5rem;
    }
    
    .form-group {
      flex: 1;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    
    .summary-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .summary-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      text-align: center;
    }
    
    .summary-card h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      color: #6c757d;
      font-size: 1rem;
    }
    
    .amount {
      font-size: 1.75rem;
      font-weight: 600;
      margin: 0;
      color: #333;
    }
    
    .text-danger {
      color: #dc3545 !important;
    }
    
    .text-warning {
      color: #ffc107 !important;
    }
    
    .text-success {
      color: #28a745 !important;
    }
    
    .chart-section, .details-section {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .chart-section h3, .details-section h3 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      color: #333;
    }
    
    .pie-chart-container {
      display: flex;
      flex-wrap: wrap;
      gap: 2rem;
    }
    
    .pie-chart-placeholder {
      position: relative;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      overflow: hidden;
    }
    
    .pie-segments {
      width: 100%;
      height: 100%;
      position: relative;
    }
    
    .pie-segment {
      position: absolute;
      width: 100%;
      height: 100%;
      clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%);
      transform-origin: center;
    }
    
    .chart-legend {
      flex: 1;
      min-width: 250px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    
    .color-box {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      margin-right: 0.5rem;
    }
    
    .category-name {
      flex: 1;
    }
    
    .category-amount {
      font-weight: 500;
    }
    
    .expense-table-container {
      overflow-x: auto;
    }
    
    .expense-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .expense-table th, .expense-table td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
    }
    
    .expense-table th {
      background-color: #f8f9fa;
      font-weight: 600;
      color: #495057;
    }
    
    .expense-table tbody tr:hover {
      background-color: #f8f9fa;
    }
    
    .status-danger {
      color: #dc3545;
    }
    
    .status-warning {
      color: #ffc107;
    }
    
    .status-success {
      color: #28a745;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
    }
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .filter-form {
        flex-direction: column;
        gap: 1rem;
      }
      
      .pie-chart-container {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class ReportsComponent implements OnInit {
  filterForm: FormGroup;
  isLoading = true;
  report: Report | null = null;
  
  availableMonths = [
    { label: 'January', value: '01' },
    { label: 'February', value: '02' },
    { label: 'March', value: '03' },
    { label: 'April', value: '04' },
    { label: 'May', value: '05' },
    { label: 'June', value: '06' },
    { label: 'July', value: '07' },
    { label: 'August', value: '08' },
    { label: 'September', value: '09' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' }
  ];
  
  availableYears: number[] = [];
  categoryBudgets: Map<string, number> = new Map();
  
  // Colors for the pie chart segments
  categoryColors = [
    '#4e79a7', '#f28e2c', '#e15759', '#76b7b2', 
    '#59a14f', '#edc949', '#af7aa1', '#ff9da7',
    '#9c755f', '#bab0ab'
  ];
  
  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private budgetService: BudgetService
  ) {
    // Generate available years (current year and 2 previous years)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 3; i++) {
      this.availableYears.push(currentYear - i);
    }
    
    this.filterForm = this.fb.group({
      month: [this.getCurrentMonth()],
      year: [currentYear]
    });
  }
  
  ngOnInit(): void {
    this.loadReport();
  }
  
  getCurrentMonth(): string {
    return String(new Date().getMonth() + 1).padStart(2, '0');
  }
  
  loadReport(): void {
    this.isLoading = true;
    
    const month = this.filterForm.get('month')?.value;
    const year = this.filterForm.get('year')?.value;
    
    // In a real app, this would call the reporting service
    // For now, we'll use mock data
    setTimeout(() => {
      // Generate mock report data
      this.report = {
        month: month,
        year: year,
        totalExpenses: 1850,
        totalBudget: 2000,
        categoryBreakdown: [
          { category: 'Food', amount: 450, percentage: 24 },
          { category: 'Transportation', amount: 250, percentage: 14 },
          { category: 'Housing', amount: 800, percentage: 43 },
          { category: 'Entertainment', amount: 150, percentage: 8 },
          { category: 'Utilities', amount: 120, percentage: 6 },
          { category: 'Other', amount: 80, percentage: 5 }
        ]
      };
      
      // Set mock category budgets
      this.categoryBudgets.set('Food', 500);
      this.categoryBudgets.set('Transportation', 300);
      this.categoryBudgets.set('Housing', 800);
      this.categoryBudgets.set('Entertainment', 200);
      this.categoryBudgets.set('Utilities', 150);
      this.categoryBudgets.set('Other', 50);
      
      this.isLoading = false;
    }, 1000);
    
    // In a real app, we would use:
    /*
    this.expenseService.getMonthlyReport(year, month).subscribe({
      next: (response) => {
        if (response.result === 'SUCCESS') {
          this.report = response.data;
          this.loadCategoryBudgets(year, month);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading report', error);
        this.isLoading = false;
      }
    });
    */
  }
  
  loadCategoryBudgets(year: number, month: string): void {
    // In a real app, this would call the budget service
    // For now, we're using mock data set in loadReport()
    
    // In a real app, we would use:
    /*
    this.budgetService.getBudgetByMonth(year, Number(month)).subscribe({
      next: (response) => {
        if (response.result === 'SUCCESS') {
          const budgets = response.data;
          budgets.forEach(budget => {
            if (budget.category) {
              this.categoryBudgets.set(budget.category, budget.amount);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error loading category budgets', error);
      }
    });
    */
  }
  
  getBudgetPercentage(): number {
    if (!this.report || this.report.totalBudget === 0) return 0;
    return Math.round((this.report.totalExpenses / this.report.totalBudget) * 100);
  }
  
  getCategoryBudget(category: string): number {
    return this.categoryBudgets.get(category) || 0;
  }
  
  getCategoryBudgetStatus(category: CategoryBreakdown): number {
    const budget = this.getCategoryBudget(category.category);
    if (budget === 0) return 0;
    return Math.round((category.amount / budget) * 100);
  }
  
  getCategoryColor(index: number): string {
    return this.categoryColors[index % this.categoryColors.length];
  }
  
  getRotation(index: number): number {
    if (!this.report || this.report.categoryBreakdown.length === 0) return 0;
    
    let rotation = 0;
    for (let i = 0; i < index; i++) {
      rotation += (this.report.categoryBreakdown[i].percentage / 100) * 360;
    }
    return rotation;
  }
  
  downloadReport(format: 'pdf' | 'csv'): void {
    // In a real app, this would call the reporting service to generate and download a report
    alert(`Downloading ${format.toUpperCase()} report...`);
    
    // In a real app, we would use:
    /*
    const month = this.filterForm.get('month')?.value;
    const year = this.filterForm.get('year')?.value;
    
    this.expenseService.downloadReport(year, month, format).subscribe({
      next: (response) => {
        // Handle file download
        const blob = new Blob([response], { type: format === 'pdf' ? 'application/pdf' : 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expense-report-${year}-${month}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error(`Error downloading ${format} report`, error);
        alert(`Failed to download ${format.toUpperCase()} report. Please try again.`);
      }
    });
    */
  }
}