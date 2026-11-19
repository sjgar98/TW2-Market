import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, FormRoot, maxLength, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { AuthApi } from '../../../core/auth/auth-api';
import { Aviso } from '../../../shared/aviso/aviso';

type SolicitudRecuperacion = {
  email: string;
};

@Component({
  selector: 'app-recuperar-password',
  imports: [
    Aviso,
    FormField,
    FormRoot,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
  ],
  templateUrl: './recuperar-password.html',
})
export class RecuperarPassword {
  private readonly authApi = inject(AuthApi);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly enviado = signal(false);

  private readonly datos = signal<SolicitudRecuperacion>({ email: '' });

  protected readonly formulario = form(
    this.datos,
    (campos) => {
      required(campos.email, { message: 'Ingresá tu email' });
      email(campos.email, { message: 'Ingresá un email válido' });
      maxLength(campos.email, 254, { message: 'Máximo 254 caracteres' });
    },
    {
      submission: {
        action: async (campos) => {
          try {
            await this.authApi.recuperarPassword(campos().value().email.trim());
            this.enviado.set(true);
            return undefined;
          } catch (error) {
            this.snackBar.open(mensajeDeError(error), 'Cerrar', {
              duration: 5000,
            });
            return undefined;
          }
        },
      },
    },
  );
}

function mensajeDeError(error: unknown): string {
  const mensaje: unknown =
    error instanceof HttpErrorResponse && error.status === 400
      ? (error.error as { message?: unknown } | null)?.message
      : undefined;
  if (Array.isArray(mensaje)) {
    return mensaje.join('. ');
  }
  return typeof mensaje === 'string' ? mensaje : 'No se pudo enviar el correo. Intentá de nuevo.';
}
