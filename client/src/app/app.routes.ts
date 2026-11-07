import { Routes } from '@angular/router';
import { soloInvitadosGuard } from './core/auth/solo-invitados-guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'productos' },
  {
    path: 'ingresar',
    title: 'Ingresar | TW2 Market',
    canActivate: [soloInvitadosGuard],
    loadComponent: () => import('./features/auth/ingresar/ingresar').then((m) => m.Ingresar),
  },
  {
    path: 'registro',
    title: 'Crear cuenta | TW2 Market',
    canActivate: [soloInvitadosGuard],
    loadComponent: () => import('./features/auth/registro/registro').then((m) => m.Registro),
  },
  {
    path: 'productos',
    loadChildren: () => import('./features/productos/productos.route').then((m) => m.PRODUCTOS_ROUTES),
  },
  { path: '**', redirectTo: 'productos' },
];