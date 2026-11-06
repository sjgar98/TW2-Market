import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Sesion } from './sesion';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const sesion = inject(Sesion);
  const router = inject(Router);
  const token = sesion.token();
  const requestConToken = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(requestConToken).pipe(
    catchError((error: unknown) => {
      if (token && error instanceof HttpErrorResponse && error.status === 401) {
        sesion.cerrar();
        void router.navigate(['/ingresar'], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => error);
    }),
  );
};
