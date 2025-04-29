import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = 'http://localhost:8080/api/expenses'; // Will be configured from environment

  constructor(private http: HttpClient) {}

  getAllExpenses(): Observable<ApiResponse<Expense[]>> {
    return this.http.get<ApiResponse<Expense[]>>(this.apiUrl);
  }

  getExpensesByCategory(category: string): Observable<ApiResponse<Expense[]>> {
    return this.http.get<ApiResponse<Expense[]>>(`${this.apiUrl}/category/${category}`);
  }

  getExpensesByDateRange(startDate: Date, endDate: Date): Observable<ApiResponse<Expense[]>> {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
    return this.http.get<ApiResponse<Expense[]>>(`${this.apiUrl}/date-range`, { params });
  }

  getTodayExpenses(): Observable<ApiResponse<Expense[]>> {
    return this.http.get<ApiResponse<Expense[]>>(`${this.apiUrl}/today`);
  }

  getExpenseById(id: number): Observable<ApiResponse<Expense>> {
    return this.http.get<ApiResponse<Expense>>(`${this.apiUrl}/${id}`);
  }

  createExpense(expense: Expense): Observable<ApiResponse<Expense>> {
    return this.http.post<ApiResponse<Expense>>(this.apiUrl, expense);
  }

  updateExpense(id: number, expense: Expense): Observable<ApiResponse<Expense>> {
    return this.http.put<ApiResponse<Expense>>(`${this.apiUrl}/${id}`, expense);
  }

  deleteExpense(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}