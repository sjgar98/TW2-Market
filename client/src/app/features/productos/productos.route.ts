import { Routes } from '@angular/router';

export const PRODUCTOS_ROUTES: Routes = [
  {
    path: '',
    title: 'Productos | TW2 Market',
    loadComponent: () => import('./productos-listado/productos-listado').then((m) => m.ProductosListado),
  },
  {
    path: ':id',
    title: 'Detalle del producto | TW2 Market',
    loadComponent: () => import('./producto-detalle/producto-detalle').then((m) => m.ProductoDetalle),
  },
];