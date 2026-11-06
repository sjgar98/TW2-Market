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
    title: 'Productos | TW2 Market',
    loadComponent: () =>
      import('./features/productos/productos-placeholder').then((m) => m.ProductosPlaceholder),
  },
  { path: '**', redirectTo: 'productos' },
];
