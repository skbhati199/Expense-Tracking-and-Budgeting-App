import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ExpenseFormComponent } from './features/expenses/expense-form/expense-form.component';
import { BudgetFormComponent } from './features/budget/budget-form/budget-form.component';
import { ReportsComponent } from './features/reports/reports.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'expenses/add', component: ExpenseFormComponent },
  { path: 'expenses/edit/:id', component: ExpenseFormComponent },
  { path: 'budget/setup', component: BudgetFormComponent },
  { path: 'budget/edit/:id', component: BudgetFormComponent },
  { path: 'reports', component: ReportsComponent },
  { path: '**', redirectTo: '/dashboard' } // Catch-all route for non-existent routes
];
