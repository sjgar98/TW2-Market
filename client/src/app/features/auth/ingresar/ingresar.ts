import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { AuthApi } from '../../../core/auth/auth-api';
import type { Credenciales } from '../../../core/auth/auth-models';
import { Sesion } from '../../../core/auth/sesion';
import { Aviso } from '../../../shared/aviso/aviso';

const DESTINO_POR_DEFECTO = '/productos';

@Component({
  selector: 'app-ingresar',
  imports: [
    Aviso,
    FormField,
    FormRoot,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    RouterLink,
  ],
  templateUrl: './ingresar.html',
})
export class Ingresar {
  readonly returnUrl = input<string>();
  readonly cuentaCreada = input<string>();
  readonly motivo = input<string>();

  private readonly authApi = inject(AuthApi);
  private readonly sesion = inject(Sesion);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly mostrarPassword = signal(false);

  private readonly credenciales = signal<Credenciales>({ email: '', password: '' });

  protected readonly formulario = form(
    this.credenciales,
    (campos) => {
      required(campos.email, { message: 'Ingresá tu email' });
      email(campos.email, { message: 'Ingresá un email válido' });
      required(campos.password, { message: 'Ingresá tu contraseña' });
    },
    {
      submission: {
        action: async (campos) => {
          try {
            const { accessToken } = await this.authApi.signin(campos().value());
            this.sesion.iniciar(accessToken);
            await this.router.navigateByUrl(destinoSeguro(this.returnUrl()));
            return undefined;
          } catch (error) {
            if (error instanceof HttpErrorResponse && error.status === 401) {
              return { kind: 'credenciales', message: 'Email o contraseña incorrectos' };
            }
            this.snackBar.open('No se pudo ingresar. Intentá de nuevo.', 'Cerrar', {
              duration: 5000,
            });
            return undefined;
          }
        },
      },
    },
  );
}

function destinoSeguro(returnUrl: string | undefined): string {
  return returnUrl?.startsWith('/') && !returnUrl.startsWith('//')
    ? returnUrl
    : DESTINO_POR_DEFECTO;
}
