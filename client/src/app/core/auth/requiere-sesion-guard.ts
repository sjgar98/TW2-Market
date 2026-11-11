import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { Sesion } from './sesion';

export const requiereSesionGuard: CanActivateFn = (_route, state) =>
  inject(Sesion).usuario()
    ? true
    : inject(Router).createUrlTree(['/ingresar'], { queryParams: { returnUrl: state.url } });