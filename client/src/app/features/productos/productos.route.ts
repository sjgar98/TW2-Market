import { Routes } from '@angular/router';
import { requiereAdminGuard } from '../../core/auth/requiere-admin-guard';

export const PRODUCTOS_ROUTES: Routes = [
  {
    path: '',
    title: 'Productos | TW2 Market',
    loadComponent: () => import('./productos-listado/productos-listado').then((m) => m.ProductosListado),
  },
  {
    path: 'nuevo',
    title: 'Cargar producto | TW2 Market',
    canActivate: [requiereAdminGuard],
    loadComponent: () => import('./cargar-producto/cargar-producto').then((m) => m.CargarProducto),
  },
  {
    path: ':id',
    title: 'Detalle del producto | TW2 Market',
    loadComponent: () => import('./producto-detalle/producto-detalle').then((m) => m.ProductoDetalle),
  },
];
