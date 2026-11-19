import { Routes } from '@angular/router';
import { requiereSesionGuard } from './core/auth/requiere-sesion-guard';
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
    path: 'recuperar-password',
    title: 'Recuperar contraseña | TW2 Market',
    canActivate: [soloInvitadosGuard],
    loadComponent: () =>
      import('./features/auth/recuperar-password/recuperar-password').then(
        (m) => m.RecuperarPassword,
      ),
  },
  {
    path: 'restablecer-password',
    title: 'Restablecer contraseña | TW2 Market',
    loadComponent: () =>
      import('./features/auth/restablecer-password/restablecer-password').then(
        (m) => m.RestablecerPassword,
      ),
  },
  {
    path: 'productos',
    loadChildren: () =>
      import('./features/productos/productos.route').then((m) => m.PRODUCTOS_ROUTES),
  },
  {
    path: 'carrito',
    title: 'Mi pedido | TW2 Market',
    canActivate: [requiereSesionGuard],
    loadComponent: () => import('./features/carrito/carrito').then((m) => m.Carrito),
  },
  {
    path: 'pedidos/:id/confirmacion',
    title: 'Pedido confirmado | TW2 Market',
    canActivate: [requiereSesionGuard],
    loadComponent: () =>
      import('./features/pedidos/pedido-confirmado/pedido-confirmado').then(
        (m) => m.PedidoConfirmado,
      ),
  },
  {
    path: '**',
    title: 'Página no encontrada | TW2 Market',
    loadComponent: () =>
      import('./features/no-encontrado/no-encontrado').then((m) => m.NoEncontrado),
  },
];
