import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class CarritoApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/carrito';

  agregar(productoId: string, cantidad: number): Observable<{ productoId: string; cantidad: number }> {
    return this.http.post<{ productoId: string; cantidad: number }>(`${this.base}/items`, {
      productoId,
      cantidad,
    });
  }
}