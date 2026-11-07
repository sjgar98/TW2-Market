import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
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

  readonly producto = signal<Producto | null>(null);
  readonly cargando = signal(true);
  readonly error = signal(false);

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
}