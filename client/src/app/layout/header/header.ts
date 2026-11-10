import { Component, effect, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { Sesion } from '../../core/auth/sesion';
import { CarritoApi } from '../../core/carrito/carrito-api';

@Component({
  selector: 'app-header',
  imports: [MatBadgeModule, MatButtonModule, MatIconModule, MatToolbarModule, RouterLink],
  templateUrl: './header.html',
})
export class Header {
  protected readonly sesion = inject(Sesion);
  protected readonly carrito = inject(CarritoApi);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      if (this.sesion.usuario()) this.carrito.obtener().subscribe();
      else this.carrito.unidades.set(0);
    });
  }

  protected salir(): void {
    this.sesion.cerrar();
    void this.router.navigateByUrl('/productos');
  }
}