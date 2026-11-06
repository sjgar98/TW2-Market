import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  FormRoot,
  maxLength,
  required,
  validate,
} from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { AuthApi } from '../../../core/auth/auth-api';
import type { DatosRegistro } from '../../../core/auth/auth-models';
import { cumplePoliticaPassword, REGLAS_PASSWORD } from '../../../core/auth/politica-password';

@Component({
  selector: 'app-registro',
  imports: [
    FormField,
    FormRoot,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    RouterLink,
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly mostrarPassword = signal(false);

  private readonly datos = signal<DatosRegistro>({
    nombre: '',
    apellido: '',
    email: '',
    direccion: '',
    password: '',
    repeatPassword: '',
  });

  protected readonly formulario = form(
    this.datos,
    (campos) => {
      required(campos.nombre, { message: 'Ingresá tu nombre' });
      maxLength(campos.nombre, 100, { message: 'Máximo 100 caracteres' });
      required(campos.apellido, { message: 'Ingresá tu apellido' });
      maxLength(campos.apellido, 100, { message: 'Máximo 100 caracteres' });
      required(campos.email, { message: 'Ingresá tu email' });
      email(campos.email, { message: 'Ingresá un email válido' });
      maxLength(campos.email, 254, { message: 'Máximo 254 caracteres' });
      required(campos.direccion, { message: 'Ingresá tu dirección' });
      maxLength(campos.direccion, 200, { message: 'Máximo 200 caracteres' });
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
          try {
            await this.authApi.signup(campos().value());
            await this.router.navigate(['/ingresar'], { queryParams: { cuentaCreada: 1 } });
            return undefined;
          } catch (error) {
            if (error instanceof HttpErrorResponse && error.status === 409) {
              return {
                kind: 'emailRegistrado',
                message: 'Ya existe una cuenta con este email',
                fieldTree: campos.email,
              };
            }
            this.snackBar.open(mensajeDeError(error), 'Cerrar', { duration: 5000 });
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

function mensajeDeError(error: unknown): string {
  const mensaje: unknown =
    error instanceof HttpErrorResponse && error.status === 400
      ? (error.error as { message?: unknown } | null)?.message
      : undefined;
  if (Array.isArray(mensaje)) {
    return mensaje.join('. ');
  }
  return typeof mensaje === 'string' ? mensaje : 'No se pudo crear la cuenta. Intentá de nuevo.';
}
