import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BudgetService } from '../../../core/services/budget.service';
import { Budget, Category } from '../../../core/models';

@Component({
  selector: 'app-budget-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="budget-form-container">
      <div class="budget-form-card">
        <h2>{{ isEditMode ? 'Edit Budget' : 'Set Budget' }}</h2>
        
        <form [formGroup]="budgetForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="monthYear">Month</label>
            <select id="monthYear" formControlName="monthYear" class="form-control">
              <option *ngFor="let month of availableMonths" [value]="month.value">
                {{ month.label }}
              </option>
            </select>
            <div *ngIf="budgetForm.get('monthYear')?.invalid && budgetForm.get('monthYear')?.touched" class="error-message">
              Month is required
            </div>
          </div>
          
          <div class="form-group">
            <label for="amount">Total Budget Amount</label>
            <div class="amount-input">
              <span class="currency-symbol">$</span>
              <input 
                type="number" 
                id="amount" 
                formControlName="amount" 
                class="form-control" 
                step="1" 
                min="1"
              >
            </div>
            <div *ngIf="budgetForm.get('amount')?.invalid && budgetForm.get('amount')?.touched" class="error-message">
              <span *ngIf="budgetForm.get('amount')?.errors?.['required']">Budget amount is required</span>
              <span *ngIf="budgetForm.get('amount')?.errors?.['min']">Budget amount must be greater than 0</span>
            </div>
          </div>
          
          <h3>Category Budgets (Optional)</h3>
          <p class="hint-text">Allocate your total budget across categories</p>
          
          <div class="category-budgets">
            <div *ngFor="let category of categories" class="category-budget-item">
              <div class="category-label">
                <span class="category-icon">{{ category.icon }}</span>
                <span>{{ category.name }}</span>
              </div>
              <div class="category-amount-input">
                <span class="currency-symbol">$</span>
                <input 
                  type="number" 
                  [id]="'category-' + category.name" 
                  [formControlName]="'category-' + category.name" 
                  class="form-control" 
                  step="1" 
                  min="0"
                >
              </div>
            </div>
          </div>
          
          <div class="budget-allocation">
            <div class="allocation-bar">
              <div 
                class="allocation-fill" 
                [style.width.%]="getAllocationPercentage()"
                [ngClass]="{'warning': getAllocationPercentage() > 100}"
              ></div>
            </div>
            <div class="allocation-stats">
              <span>{{ getAllocatedAmount() | currency }} / {{ budgetForm.get('amount')?.value | currency }}</span>
              <span>{{ getAllocationPercentage() }}% allocated</span>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn-secondary" routerLink="/dashboard">Cancel</button>
            <button type="submit" [disabled]="budgetForm.invalid || isLoading || getAllocationPercentage() > 100" class="btn-primary">
              {{ isLoading ? 'Saving...' : (isEditMode ? 'Update' : 'Save') }}
            </button>
          </div>
          
          <div *ngIf="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>
          
          <div *ngIf="getAllocationPercentage() > 100" class="alert alert-warning">
            Category allocations exceed your total budget. Please adjust your category budgets.
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .budget-form-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
      padding: 1rem;
    }
    
    .budget-form-card {
      width: 100%;
      max-width: 600px;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    h2, h3 {
      color: #333;
    }
    
    h2 {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    
    h3 {
      margin-top: 2rem;
      margin-bottom: 0.5rem;
    }
    
    .hint-text {
      color: #6c757d;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
    
    .form-group {
      margin-bottom: 1.25rem;
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
    
    .amount-input, .category-amount-input {
      position: relative;
    }
    
    .currency-symbol {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
    }
    
    input[type="number"] {
      padding-left: 1.5rem;
    }
    
    .category-budgets {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .category-budget-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    
    .category-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .category-icon {
      font-size: 1.25rem;
    }
    
    .category-amount-input {
      width: 120px;
    }
    
    .budget-allocation {
      margin-bottom: 1.5rem;
    }
    
    .allocation-bar {
      height: 10px;
      background-color: #e9ecef;
      border-radius: 5px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }
    
    .allocation-fill {
      height: 100%;
      background-color: #28a745;
      border-radius: 5px;
      transition: width 0.3s ease;
    }
    
    .allocation-fill.warning {
      background-color: #dc3545;
    }
    
    .allocation-stats {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      color: #6c757d;
    }
    
    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .form-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 1.5rem;
    }
    
    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .btn-primary {
      background-color: #007bff;
      color: white;
      border: none;
    }
    
    .btn-primary:hover {
      background-color: #0069d9;
    }
    
    .btn-primary:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
    
    .btn-secondary {
      background-color: #f8f9fa;
      color: #212529;
      border: 1px solid #ddd;
    }
    
    .btn-secondary:hover {
      background-color: #e9ecef;
    }
    
    .alert {
      padding: 0.75rem 1rem;
      margin-top: 1rem;
      border-radius: 4px;
    }
    
    .alert-danger {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    
    .alert-warning {
      background-color: #fff3cd;
      color: #856404;
      border: 1px solid #ffeeba;
    }
    
    @media (max-width: 576px) {
      .budget-form-card {
        padding: 1.5rem;
      }
      
      .form-actions {
        flex-direction: column-reverse;
        gap: 0.75rem;
      }
      
      .btn-primary, .btn-secondary {
        width: 100%;
      }
    }
  `]
})
export class BudgetFormComponent implements OnInit {
  budgetForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  errorMessage = '';
  budgetId: number | null = null;
  
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
  
  availableMonths: { label: string, value: string }[] = [];
  
  constructor(
    private fb: FormBuilder,
    private budgetService: BudgetService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Initialize form with total budget amount
    const formGroup: any = {
      monthYear: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(1)]]
    };
    
    // Add form controls for each category
    this.categories.forEach(category => {
      formGroup[`category-${category.name}`] = [0, [Validators.min(0)]];
    });
    
    this.budgetForm = this.fb.group(formGroup);
    
    // Generate available months (current month + next 3 months)
    this.generateAvailableMonths();
  }
  
  ngOnInit(): void {
    // Check if we're in edit mode by looking for an ID in the route
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.budgetId = +id;
      this.loadBudget(this.budgetId);
    }
  }
  
  generateAvailableMonths(): void {
    const today = new Date();
    for (let i = 0; i < 4; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthYear = this.formatMonthYear(date);
      const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      this.availableMonths.push({ label, value: monthYear });
    }
    
    // Set default value to current month
    this.budgetForm.get('monthYear')?.setValue(this.availableMonths[0].value);
  }
  
  formatMonthYear(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
  
  loadBudget(id: number): void {
    this.isLoading = true;
    
    // In a real app, this would call the budget service
    // For now, we'll use mock data
    setTimeout(() => {
      const mockBudget: Budget = {
        id: id,
        userId: 1,
        monthYear: '2023-06',
        amount: 2000,
        category: undefined,
        spent: 850,
        remaining: 1150
      };
      
      // Mock category budgets
      const mockCategoryBudgets = [
        { id: 101, userId: 1, monthYear: '2023-06', amount: 500, category: 'Food' },
        { id: 102, userId: 1, monthYear: '2023-06', amount: 300, category: 'Transportation' },
        { id: 103, userId: 1, monthYear: '2023-06', amount: 800, category: 'Housing' },
        { id: 104, userId: 1, monthYear: '2023-06', amount: 200, category: 'Entertainment' }
      ];
      
      this.populateForm(mockBudget, mockCategoryBudgets);
      this.isLoading = false;
    }, 500);
    
    // In a real app, we would use:
    /*
    this.budgetService.getBudgetByMonth(year, month).subscribe({
      next: (response) => {
        if (response.result === 'SUCCESS') {
          const budgets = response.data;
          // Find the total budget (category is null)
          const totalBudget = budgets.find(b => !b.category);
          if (totalBudget) {
            this.populateForm(totalBudget, budgets.filter(b => b.category));
          } else {
            this.errorMessage = 'Failed to load budget details';
            this.router.navigate(['/dashboard']);
          }
        } else {
          this.errorMessage = 'Failed to load budget details';
          this.router.navigate(['/dashboard']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading budget', error);
        this.errorMessage = 'Failed to load budget details';
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      }
    });
    */
  }
  
  populateForm(totalBudget: Budget, categoryBudgets: Budget[]): void {
    this.budgetForm.patchValue({
      monthYear: totalBudget.monthYear,
      amount: totalBudget.amount
    });
    
    // Populate category budgets
    categoryBudgets.forEach(budget => {
      if (budget.category) {
        this.budgetForm.get(`category-${budget.category}`)?.setValue(budget.amount);
      }
    });
  }
  
  getAllocatedAmount(): number {
    let total = 0;
    this.categories.forEach(category => {
      const amount = this.budgetForm.get(`category-${category.name}`)?.value || 0;
      total += Number(amount);
    });
    return total;
  }
  
  getAllocationPercentage(): number {
    const totalBudget = this.budgetForm.get('amount')?.value || 0;
    if (totalBudget === 0) return 0;
    
    return Math.round((this.getAllocatedAmount() / totalBudget) * 100);
  }
  
  onSubmit(): void {
    if (this.budgetForm.invalid) {
      return;
    }
    
    if (this.getAllocationPercentage() > 100) {
      this.errorMessage = 'Category allocations exceed your total budget. Please adjust your category budgets.';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    const formValues = this.budgetForm.value;
    
    // Create total budget object
    const totalBudget: Budget = {
      userId: 1, // In a real app, this would come from the authenticated user
      monthYear: formValues.monthYear,
      amount: formValues.amount,
      id: this.isEditMode ? this.budgetId! : undefined
    };
    
    // Create category budget objects
    const categoryBudgets: Budget[] = [];
    this.categories.forEach(category => {
      const amount = formValues[`category-${category.name}`] || 0;
      if (amount > 0) {
        categoryBudgets.push({
          userId: 1, // In a real app, this would come from the authenticated user
          monthYear: formValues.monthYear,
          amount: amount,
          category: category.name
        });
      }
    });
    
    // In a real app, this would call the budget service
    // For now, we'll just simulate a successful save
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/dashboard']);
    }, 1000);
    
    // In a real app, we would use:
    /*
    // First save the total budget
    const saveTotalBudget$ = this.isEditMode && this.budgetId
      ? this.budgetService.updateBudget(this.budgetId, totalBudget)
      : this.budgetService.createBudget(totalBudget);
    
    saveTotalBudget$.subscribe({
      next: (response) => {
        if (response.result === 'SUCCESS') {
          // Then save all category budgets
          // This would typically be done in a transaction on the backend
          // For simplicity, we're just showing the concept here
          const savePromises = categoryBudgets.map(budget => 
            this.budgetService.createBudget(budget).toPromise()
          );
          
          Promise.all(savePromises)
            .then(() => {
              this.isLoading = false;
              this.router.navigate(['/dashboard']);
            })
            .catch(error => {
              this.handleError(error);
            });
        } else {
          this.handleResponse(response, 'Budget saved successfully');
        }
      },
      error: this.handleError.bind(this)
    });
    */
  }
  
  handleResponse(response: any, successMessage: string): void {
    this.isLoading = false;
    if (response.result === 'SUCCESS') {
      // Navigate back to dashboard
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = response.message || 'An error occurred';
    }
  }
  
  handleError(error: any): void {
    this.isLoading = false;
    this.errorMessage = error.error?.message || 'An error occurred. Please try again.';
    console.error('Error saving budget', error);
  }
}