import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductosApi } from '../../../core/productos/productos-api';
import { Producto } from '../../../core/productos/producto';
import { formatearPrecio } from '../../../core/formato-precio';
import { catchError, debounceTime, of, switchMap, tap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';


const PRODUCTOS_POR_PAGINA = 8;
@Component({
  selector: 'app-productos-listado',
  imports: [RouterLink],
  templateUrl: './productos-listado.html',
  styleUrl: './productos-listado.scss',
})

export class ProductosListado {
  private readonly productosApi = inject(ProductosApi);

  readonly formatearPrecio = formatearPrecio;
  readonly productos = signal<Producto[]>([]);
  readonly total = signal(0);
  readonly marcas = signal<string[]>([]);
  readonly cargando = signal(true);
  readonly error = signal(false);

  readonly busqueda = signal('');
  readonly marca = signal('');
  readonly precioMin = signal<number | null>(null);
  readonly precioMax = signal<number | null>(null);
  readonly pagina = signal(1);
  readonly orden = signal<'precio_asc' | 'precio_desc' | null>(null);

  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / PRODUCTOS_POR_PAGINA)));
  private readonly filtros = computed(() => ({
    busqueda: this.busqueda().trim(),
    marca: this.marca(),
    precioMin: this.precioMin(),
    precioMax: this.precioMax(),
    pagina: this.pagina(),
    orden: this.orden(),
  }));
  constructor() {
    this.productosApi.listarMarcas().subscribe((marcas) => this.marcas.set(marcas));

    toObservable(this.filtros)
      .pipe(                            
        debounceTime(1000),
        tap(() => {
          this.cargando.set(true);
          this.error.set(false);
        }),
        switchMap((f) =>
          this.productosApi
            .listar({
              busqueda: f.busqueda,
              marca: f.marca,
              precioMin: f.precioMin ?? undefined,
              precioMax: f.precioMax ?? undefined,
              pagina: f.pagina,
              limite: PRODUCTOS_POR_PAGINA,
              orden: f.orden ?? undefined,
            })
            .pipe(                       
              catchError(() => {
                this.error.set(true);
                return of(null);
              }),
            ),
        ),
      )                                  
      .subscribe((respuesta) => {
        if (respuesta) {
          this.productos.set(respuesta.items);
          this.total.set(respuesta.total);
        }
        this.cargando.set(false);
      });
  }

  buscar(texto: string): void {
    this.busqueda.set(texto);
    this.pagina.set(1);
  }

  filtrarPorMarca(marca: string): void {
    this.marca.set(marca);
    this.pagina.set(1);
  }

  cambiarPrecioMin(valor: string): void {
    this.precioMin.set(valor === '' ? null : Number(valor));
    this.pagina.set(1);
  }

  cambiarPrecioMax(valor: string): void {
    this.precioMax.set(valor === '' ? null : Number(valor));
    this.pagina.set(1);
  }
  cambiarPagina(pagina: number): void {
    this.pagina.set(pagina);
  }

  cambiarOrden(valor: string): void {
  this.orden.set(valor === 'precio_asc' || valor === 'precio_desc' ? valor : null);
  this.pagina.set(1);
}


}