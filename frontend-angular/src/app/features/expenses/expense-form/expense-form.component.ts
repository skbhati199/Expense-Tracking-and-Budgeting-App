import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExpenseService } from '../../../core/services/expense.service';
import { Expense, Category } from '../../../core/models';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="expense-form-container">
      <div class="expense-form-card">
        <h2>{{ isEditMode ? 'Edit Expense' : 'Add New Expense' }}</h2>
        
        <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="amount">Amount</label>
            <div class="amount-input">
              <span class="currency-symbol">$</span>
              <input 
                type="number" 
                id="amount" 
                formControlName="amount" 
                class="form-control" 
                step="0.01" 
                min="0"
              >
            </div>
            <div *ngIf="expenseForm.get('amount')?.invalid && expenseForm.get('amount')?.touched" class="error-message">
              <span *ngIf="expenseForm.get('amount')?.errors?.['required']">Amount is required</span>
              <span *ngIf="expenseForm.get('amount')?.errors?.['min']">Amount must be greater than 0</span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="description">Description</label>
            <input type="text" id="description" formControlName="description" class="form-control">
            <div *ngIf="expenseForm.get('description')?.invalid && expenseForm.get('description')?.touched" class="error-message">
              Description is required
            </div>
          </div>
          
          <div class="form-group">
            <label for="category">Category</label>
            <select id="category" formControlName="category" class="form-control">
              <option value="" disabled>Select a category</option>
              <option *ngFor="let category of categories" [value]="category.name">
                {{ category.icon }} {{ category.name }}
              </option>
            </select>
            <div *ngIf="expenseForm.get('category')?.invalid && expenseForm.get('category')?.touched" class="error-message">
              Category is required
            </div>
          </div>
          
          <div class="form-group">
            <label for="date">Date</label>
            <input type="date" id="date" formControlName="date" class="form-control">
            <div *ngIf="expenseForm.get('date')?.invalid && expenseForm.get('date')?.touched" class="error-message">
              Date is required
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn-secondary" routerLink="/dashboard">Cancel</button>
            <button type="submit" [disabled]="expenseForm.invalid || isLoading" class="btn-primary">
              {{ isLoading ? 'Saving...' : (isEditMode ? 'Update' : 'Save') }}
            </button>
          </div>
          
          <div *ngIf="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .expense-form-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
      padding: 1rem;
    }
    
    .expense-form-card {
      width: 100%;
      max-width: 500px;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    h2 {
      text-align: center;
      margin-bottom: 1.5rem;
      color: #333;
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
    
    .amount-input {
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
    
    @media (max-width: 576px) {
      .expense-form-card {
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
export class ExpenseFormComponent implements OnInit {
  expenseForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  errorMessage = '';
  expenseId: number | null = null;
  
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
  
  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.expenseForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required]],
      category: ['', [Validators.required]],
      date: [this.formatDate(new Date()), [Validators.required]]
    });
  }
  
  ngOnInit(): void {
    // Check if we're in edit mode by looking for an ID in the route
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.expenseId = +id;
      this.loadExpense(this.expenseId);
    }
  }
  
  loadExpense(id: number): void {
    this.isLoading = true;
    
    // In a real app, this would call the expense service
    // For now, we'll use mock data
    setTimeout(() => {
      const mockExpense: Expense = {
        id: id,
        amount: 45.99,
        description: 'Grocery shopping',
        category: 'Food',
        date: new Date(),
        userId: 1
      };
      
      this.populateForm(mockExpense);
      this.isLoading = false;
    }, 500);
    
    // In a real app, we would use:
    /*
    this.expenseService.getExpenseById(id).subscribe({
      next: (response) => {
        if (response.result === 'SUCCESS') {
          this.populateForm(response.data);
        } else {
          this.errorMessage = 'Failed to load expense details';
          this.router.navigate(['/dashboard']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading expense', error);
        this.errorMessage = 'Failed to load expense details';
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      }
    });
    */
  }
  
  populateForm(expense: Expense): void {
    this.expenseForm.patchValue({
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      date: this.formatDate(new Date(expense.date))
    });
  }
  
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  onSubmit(): void {
    if (this.expenseForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    const formValues = this.expenseForm.value;
    const expense: Expense = {
      ...formValues,
      date: new Date(formValues.date),
      userId: 1, // In a real app, this would come from the authenticated user
      id: this.isEditMode ? this.expenseId! : undefined
    };
    
    // In a real app, this would call the expense service
    // For now, we'll just simulate a successful save
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/dashboard']);
    }, 1000);
    
    // In a real app, we would use:
    /*
    if (this.isEditMode && this.expenseId) {
      this.expenseService.updateExpense(this.expenseId, expense).subscribe({
        next: (response) => {
          this.handleResponse(response, 'Expense updated successfully');
        },
        error: this.handleError.bind(this)
      });
    } else {
      this.expenseService.createExpense(expense).subscribe({
        next: (response) => {
          this.handleResponse(response, 'Expense added successfully');
        },
        error: this.handleError.bind(this)
      });
    }
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
    console.error('Error saving expense', error);
  }
}