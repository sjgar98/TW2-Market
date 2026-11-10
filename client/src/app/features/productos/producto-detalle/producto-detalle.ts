import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CarritoApi } from '../../../core/carrito/carrito-api';
import { Sesion } from '../../../core/auth/sesion';
import { ProductosApi } from '../../../core/productos/productos-api';
import { Producto } from '../../../core/productos/producto';

@Component({
  selector: 'app-producto-detalle',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './producto-detalle.html',
  styleUrl: './producto-detalle.scss',
})
export class ProductoDetalle {
  private readonly route = inject(ActivatedRoute);
  private readonly productosApi = inject(ProductosApi);
  private readonly carritoApi = inject(CarritoApi);
  private readonly sesion = inject(Sesion);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly producto = signal<Producto | null>(null);
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly cantidad = signal(1);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.productosApi.obtenerPorId(id).subscribe({
      next: (producto) => {
        this.producto.set(producto);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }

  cambiarCantidad(valor: string): void {
    const maximo = this.producto()?.stock ?? 1;
    const numero = Math.floor(Number(valor));
    this.cantidad.set(Math.min(Math.max(numero || 1, 1), maximo));
  }

  agregarAlCarrito(): void {
    const producto = this.producto();
    if (!producto) return;
    if (!this.sesion.usuario()) {
      this.router.navigate(['/ingresar'], {
        queryParams: { motivo: 'carrito', returnUrl: this.router.url },
      });
      return;
    }
    this.carritoApi.agregar(producto.id, this.cantidad()).subscribe({
            next: (item) =>
        this.snackBar
          .open(`Agregado al carrito: ${producto.nombre} (${item.cantidad})`, 'Ver carrito', {
            duration: 5000,
          })
          .onAction()
          .subscribe(() => this.router.navigateByUrl('/carrito')),
      error: (e) =>
        this.snackBar.open(
          e.status === 409 ? 'No hay stock suficiente para esa cantidad' : 'No se pudo agregar al carrito',
          'Cerrar',
          { duration: 4000 },
        ),
    });
  }
}