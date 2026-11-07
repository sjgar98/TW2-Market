import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductosApi } from '../../../core/productos/productos-api';
import { Producto } from '../../../core/productos/producto';

@Component({
  selector: 'app-productos-listado',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './productos-listado.html',
  styleUrl: './productos-listado.scss',
})
export class ProductosListado {
  private readonly productosApi = inject(ProductosApi);

  readonly productos = signal<Producto[]>([]);
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly busqueda = signal('');
  readonly clasificacionSeleccionada = signal<string | null>(null);

  readonly clasificaciones = computed(() =>
    [...new Set(this.productos().map((p) => p.clasificacion))].sort(),
  );

  readonly productosFiltrados = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    const clasificacion = this.clasificacionSeleccionada();
    return this.productos().filter((p) => {
      const coincideBusqueda =
        !termino || [p.nombre, p.marca, p.clasificacion].some((campo) => campo.toLowerCase().includes(termino));
      const coincideClasificacion = !clasificacion || p.clasificacion === clasificacion;
      return coincideBusqueda && coincideClasificacion;
    });
  });

  constructor() {
    this.productosApi.listar().subscribe({
      next: (respuesta) => {
        this.productos.set(respuesta.items);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }

  alternarClasificacion(clasificacion: string): void {
    this.clasificacionSeleccionada.set(this.clasificacionSeleccionada() === clasificacion ? null : clasificacion);
  }
}