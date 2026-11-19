import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, required, validate } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { AuthApi } from '../../../core/auth/auth-api';
import { cumplePoliticaPassword, REGLAS_PASSWORD } from '../../../core/auth/politica-password';
import { Sesion } from '../../../core/auth/sesion';
import { Aviso } from '../../../shared/aviso/aviso';

type CambioPassword = {
  password: string;
  repeatPassword: string;
};

@Component({
  selector: 'app-restablecer-password',
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
  templateUrl: './restablecer-password.html',
  styleUrl: './restablecer-password.scss',
})
export class RestablecerPassword {
  readonly token = input<string>();

  private readonly authApi = inject(AuthApi);
  private readonly sesion = inject(Sesion);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly mostrarPassword = signal(false);
  protected readonly tokenInvalido = signal(false);
  protected readonly enlaceInvalido = computed(() => !this.token()?.trim() || this.tokenInvalido());

  private readonly datos = signal<CambioPassword>({
    password: '',
    repeatPassword: '',
  });

  protected readonly formulario = form(
    this.datos,
    (campos) => {
      required(campos.password, { message: 'Ingresá una contraseña' });
      validate(campos.password, ({ value }) =>
        cumplePoliticaPassword(value())
          ? undefined
          : { kind: 'politicaPassword', message: 'La contraseña no cumple los requisitos' },
      );
      maxLength(campos.password, 72, { message: 'Máximo 72 caracteres' });
      required(campos.repeatPassword, { message: 'Repetí la contraseña' });
      validate(campos.repeatPassword, ({ value, valueOf }) =>
        value() && value() !== valueOf(campos.password)
          ? { kind: 'passwordsDistintas', message: 'Las contraseñas no coinciden' }
          : undefined,
      );
    },
    {
      submission: {
        action: async (campos) => {
          const token = this.token()?.trim();
          if (!token) {
            this.tokenInvalido.set(true);
            return undefined;
          }

          try {
            await this.authApi.restablecerPassword({ token, ...campos().value() });
            this.sesion.cerrar();
            await this.router.navigate(['/ingresar'], {
              queryParams: { passwordRestablecida: 1 },
            });
            return undefined;
          } catch (error) {
            if (esErrorDeEnlace(error)) {
              this.tokenInvalido.set(true);
              return undefined;
            }
            this.snackBar.open(mensajeDeError(error), 'Cerrar', {
              duration: 5000,
            });
            return undefined;
          }
        },
      },
    },
  );

  protected readonly reglasPassword = computed(() => {
    const password = this.formulario.password().value();
    return REGLAS_PASSWORD.map((regla) => ({
      etiqueta: regla.etiqueta,
      cumplida: regla.cumple(password),
    }));
  });
}

function esErrorDeEnlace(error: unknown): boolean {
  if (!(error instanceof HttpErrorResponse) || error.status !== 400) {
    return false;
  }
  const mensaje = (error.error as { message?: unknown } | null)?.message;
  const texto = Array.isArray(mensaje) ? mensaje.join(' ') : mensaje;
  return typeof texto === 'string' && texto.toLowerCase().includes('enlace');
}

function mensajeDeError(error: unknown): string {
  const mensaje: unknown =
    error instanceof HttpErrorResponse && error.status === 400
      ? (error.error as { message?: unknown } | null)?.message
      : undefined;
  if (Array.isArray(mensaje)) {
    return mensaje.join('. ');
  }
  return typeof mensaje === 'string'
    ? mensaje
    : 'No se pudo restablecer la contraseña. Intentá de nuevo.';
}
