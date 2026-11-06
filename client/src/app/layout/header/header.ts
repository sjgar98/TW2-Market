import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { Sesion } from '../../core/auth/sesion';

@Component({
  selector: 'app-header',
  imports: [MatButtonModule, MatIconModule, MatToolbarModule, RouterLink],
  templateUrl: './header.html',
})
export class Header {
  protected readonly sesion = inject(Sesion);
  private readonly router = inject(Router);

  protected salir(): void {
    this.sesion.cerrar();
    void this.router.navigateByUrl('/productos');
  }
}
