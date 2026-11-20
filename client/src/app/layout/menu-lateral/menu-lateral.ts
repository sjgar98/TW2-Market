import { Component, inject, output } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Sesion } from '../../core/auth/sesion';
import { CarritoApi } from '../../core/carrito/carrito-api';

@Component({
  imports: [MatDividerModule, MatIconModule, MatListModule, RouterLink, RouterLinkActive],
  selector: 'app-menu-lateral',
  templateUrl: './menu-lateral.html',
})
export class MenuLateral {
  protected readonly sesion = inject(Sesion);
  protected readonly carrito = inject(CarritoApi);
  private readonly router = inject(Router);

  readonly navegar = output();

  protected salir(): void {
    this.navegar.emit();
    this.sesion.cerrar();
    void this.router.navigateByUrl('/productos');
  }
}
