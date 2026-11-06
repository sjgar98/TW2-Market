import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { Sesion } from './sesion';

export const soloInvitadosGuard: CanActivateFn = () =>
  inject(Sesion).usuario() ? inject(Router).createUrlTree(['/productos']) : true;
