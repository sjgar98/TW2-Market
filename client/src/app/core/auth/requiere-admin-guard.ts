import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { Sesion } from './sesion';

export const requiereAdminGuard: CanActivateFn = (_route, state) => {
  const usuario = inject(Sesion).usuario();
  if (!usuario) {
    return inject(Router).createUrlTree(['/ingresar'], {
      queryParams: { returnUrl: state.url },
    });
  }
  return usuario.isAdmin ? true : inject(Router).createUrlTree(['/productos']);
};
