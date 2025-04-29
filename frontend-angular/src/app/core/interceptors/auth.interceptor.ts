import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const router = inject(Router);
  
  // Get the auth token from localStorage
  const token = localStorage.getItem('auth_token');
  
  // Clone the request and add the authorization header if token exists
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    
    // Pass the cloned request with the auth header to the next handler
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized errors (expired or invalid token)
        if (error.status === 401) {
          // Clear localStorage and redirect to login
          localStorage.removeItem('auth_token');
          localStorage.removeItem('current_user');
          router.navigate(['/auth/login']);
        }
        return throwError(() => error);
      })
    );
  }
  
  // If no token exists, just pass the original request
  return next(req);
};