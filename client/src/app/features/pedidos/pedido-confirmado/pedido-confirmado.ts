import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { formatearPrecio } from '../../../core/formato-precio';
import { Pedido } from '../../../core/pedidos/pedido-models';
import { PedidosApi } from '../../../core/pedidos/pedidos-api';

@Component({
  selector: 'app-pedido-confirmado',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './pedido-confirmado.html',
})
export class PedidoConfirmado {
  private readonly route = inject(ActivatedRoute);
  private readonly pedidosApi = inject(PedidosApi);

  readonly pedido = signal<Pedido | null>(null);
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly numero = computed(() => this.pedido()?.id.slice(0, 8).toUpperCase() ?? '');

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.pedidosApi.obtenerPorId(id).subscribe({
      next: (pedido) => {
        this.pedido.set(pedido);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }

  formatearPrecio(precio: number): string {
    return formatearPrecio(precio);
  }
}
