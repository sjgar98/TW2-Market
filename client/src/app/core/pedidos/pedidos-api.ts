import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pedido } from './pedido-models';

@Service()
export class PedidosApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/pedidos';

  confirmar(): Observable<Pedido> {
    return this.http.post<Pedido>(this.base, {});
  }

  obtenerPorId(id: string): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.base}/${id}`);
  }
}
