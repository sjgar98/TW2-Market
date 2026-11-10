import { HttpClient } from '@angular/common/http';
import { Service, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Carrito } from './carrito-models';

@Service()
export class CarritoApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/carrito';

  readonly unidades = signal(0);

  obtener(): Observable<Carrito> {
    return this.http.get<Carrito>(this.base).pipe(
      tap((carrito) => this.unidades.set(carrito.items.reduce((suma, i) => suma + i.cantidad, 0))),
    );
  }

  agregar(productoId: string, cantidad: number): Observable<{ productoId: string; cantidad: number }> {
    return this.http
      .post<{ productoId: string; cantidad: number }>(`${this.base}/items`, { productoId, cantidad })
      .pipe(tap(() => this.obtener().subscribe()));
  }

  cambiarCantidad(productoId: string, cantidad: number): Observable<{ productoId: string; cantidad: number }> {
    return this.http.patch<{ productoId: string; cantidad: number }>(`${this.base}/items/${productoId}`, {
      cantidad,
    });
  }

  quitar(productoId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/items/${productoId}`);
  }
}