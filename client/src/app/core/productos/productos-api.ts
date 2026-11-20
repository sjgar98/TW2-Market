import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { CrearProductoPayload, ListadoPaginado, Producto } from './producto';

export interface FiltrosProductos {
  busqueda?: string;
  marca?: string;
  precioMin?: number;
  precioMax?: number;
  orden?: 'precio_asc' | 'precio_desc';
  pagina?: number;
  limite?: number;
}

@Service()
export class ProductosApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/productos';

  listar(filtros: FiltrosProductos = {}): Observable<ListadoPaginado<Producto>> {
    const params: Record<string, string> = {
      pagina: String(filtros.pagina ?? 1),
      limite: String(filtros.limite ?? 12),
    };
    if (filtros.busqueda) params['busqueda'] = filtros.busqueda;
    if (filtros.marca) params['marca'] = filtros.marca;
    if (filtros.precioMin !== undefined) params['precioMin'] = String(filtros.precioMin);
    if (filtros.precioMax !== undefined) params['precioMax'] = String(filtros.precioMax);
    if (filtros.orden) params['orden'] = filtros.orden;
    return this.http.get<ListadoPaginado<Producto>>(this.base, { params });
  }

  listarMarcas(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/marcas`);
  }

  obtenerPorId(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.base}/${id}`);
  }

  crear(datos: CrearProductoPayload): Promise<Producto> {
    return firstValueFrom(this.http.post<Producto>(this.base, datos));
  }
}
