// Core models for the application

// User model
export interface User {
  id?: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  token?: string;
}

// Authentication models
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Expense model
export interface Expense {
  id?: number;
  amount: number;
  description: string;
  category: string;
  date: Date;
  userId: number;
  tags?: string[];
}

// Budget model
export interface Budget {
  id?: number;
  userId: number;
  monthYear: string; // Format: YYYY-MM
  amount: number;
  category?: string; // If null, it's the total budget
  spent?: number; // Calculated field
  remaining?: number; // Calculated field
}

// Category model
export interface Category {
  id?: number;
  name: string;
  icon?: string;
}

// Report model
export interface Report {
  month: string;
  year: number;
  totalExpenses: number;
  totalBudget: number;
  categoryBreakdown: CategoryBreakdown[];
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  result: string; // "SUCCESS" or "ERROR"
  message: string;
  data: T;
}