import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ListadoPaginado, Producto } from './producto';

@Service()
export class ProductosApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/productos';

  listar(busqueda?: string): Observable<ListadoPaginado<Producto>> {
    const params: Record<string, string> = { limite: '50' };
    if (busqueda) params['busqueda'] = busqueda;
    return this.http.get<ListadoPaginado<Producto>>(this.base, { params });
  }

  obtenerPorId(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.base}/${id}`);
  }
}