import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { formatearPrecio } from '../../core/formato-precio';
import { CarritoApi } from '../../core/carrito/carrito-api';
import { Carrito as CarritoDatos, ItemCarrito } from '../../core/carrito/carrito-models';
import { PedidosApi } from '../../core/pedidos/pedidos-api';
import { ProductoSinStock } from '../../core/pedidos/pedido-models';

function esRespuestaSinStock(cuerpo: unknown): cuerpo is { productos: ProductoSinStock[] } {
  return typeof cuerpo === 'object' && cuerpo !== null && 'productos' in cuerpo && Array.isArray(cuerpo.productos);
}

@Component({
  selector: 'app-carrito',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './carrito.html',
})
export class Carrito {
  private readonly carritoApi = inject(CarritoApi);
  private readonly pedidosApi = inject(PedidosApi);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly carrito = signal<CarritoDatos | null>(null);
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly confirmando = signal(false);
  readonly sinStock = signal<ProductoSinStock[]>([]);

  readonly items = computed(() => this.carrito()?.items ?? []);
  readonly unidades = computed(() => this.items().reduce((suma, i) => suma + i.cantidad, 0));
  readonly total = computed(() => this.items().reduce((suma, i) => suma + i.cantidad * i.precio, 0));
  readonly puedeConfirmar = computed(() => !this.confirmando() && this.sinStock().length === 0);

  constructor() {
    this.cargar();
  }

  formatearPrecio(precio: number): string {
    return formatearPrecio(precio);
  }

  faltante(item: ItemCarrito): ProductoSinStock | undefined {
    return this.sinStock().find((producto) => producto.productoId === item.productoId);
  }

  cambiarCantidad(item: ItemCarrito, cantidad: number): void {
    if (cantidad < 1 || cantidad > item.stock) return;
    this.carritoApi.cambiarCantidad(item.productoId, cantidad).subscribe({
      next: () => {
        this.sinStock.set([]);
        this.cargar();
      },
      error: () => this.avisar('No se pudo cambiar la cantidad'),
    });
  }

  quitar(item: ItemCarrito): void {
    this.carritoApi.quitar(item.productoId).subscribe({
      next: () => {
        this.sinStock.set([]);
        this.cargar();
      },
      error: () => this.avisar('No se pudo quitar el producto'),
    });
  }

  confirmar(): void {
    if (!this.puedeConfirmar()) return;
    this.confirmando.set(true);
    this.pedidosApi.confirmar().subscribe({
      next: (pedido) => {
        this.carritoApi.obtener().subscribe();
        this.router.navigate(['/pedidos', pedido.id, 'confirmacion']);
      },
      error: (error: HttpErrorResponse) => {
        this.confirmando.set(false);
        if (error.status === 409) {
          this.sinStock.set(this.leerProductosSinStock(error));
          this.cargar();
          this.avisar('Hay productos sin stock suficiente. Ajustá las cantidades para confirmar.');
          return;
        }
        this.avisar('No se pudo confirmar el pedido');
      },
    });
  }

  private leerProductosSinStock(error: HttpErrorResponse): ProductoSinStock[] {
    const cuerpo: unknown = error.error;
    return esRespuestaSinStock(cuerpo) ? cuerpo.productos : [];
  }

  private cargar(): void {
    this.carritoApi.obtener().subscribe({
      next: (carrito) => {
        this.carrito.set(carrito);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }

  private avisar(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 4000 });
  }
}
