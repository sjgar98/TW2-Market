import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  maxLength,
  min,
  required,
  validate,
} from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { ProductosApi } from '../../../core/productos/productos-api';

const CLASIFICACIONES = ['Gama alta', 'Gama media', 'Gama baja'] as const;

type NuevoProductoModelo = {
  nombre: string;
  marca: string;
  descripcion: string;
  clasificacion: string;
  precio: number | null;
  stock: number | null;
  imagenUrl: string;
  pantalla: string;
  almacenamientoGb: number | null;
  ramGb: number | null;
  bateriaMah: number | null;
  camara: string;
};

const validarEntero = (campo: Parameters<typeof validate<number | null>>[0]) => {
  validate(campo, ({ value }) => {
    const valor = value();
    if (valor !== null && !Number.isInteger(valor)) {
      return { kind: 'entero', message: 'Debe ser un número entero' };
    }
    return undefined;
  });
};

const esUrlHttp = (texto: string): boolean => {
  try {
    return ['http:', 'https:'].includes(new URL(texto).protocol);
  } catch {
    return false;
  }
};

@Component({
  selector: 'app-cargar-producto',
  imports: [
    FormField,
    FormRoot,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    RouterLink,
  ],
  templateUrl: './cargar-producto.html',
})
export class CargarProducto {
  private readonly productosApi = inject(ProductosApi);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly clasificaciones = CLASIFICACIONES;

  private readonly producto = signal<NuevoProductoModelo>({
    nombre: '',
    marca: '',
    descripcion: '',
    clasificacion: 'Gama media',
    precio: null,
    stock: 0,
    imagenUrl: '',
    pantalla: '',
    almacenamientoGb: null,
    ramGb: null,
    bateriaMah: null,
    camara: '',
  });

  protected readonly formulario = form(
    this.producto,
    (campos) => {
      required(campos.nombre, { message: 'El nombre es obligatorio' });
      maxLength(campos.nombre, 150, { message: 'Máximo 150 caracteres' });

      required(campos.marca, { message: 'La marca es obligatoria' });
      maxLength(campos.marca, 80, { message: 'Máximo 80 caracteres' });

      required(campos.descripcion, { message: 'La descripción es obligatoria' });
      maxLength(campos.descripcion, 500, { message: 'Máximo 500 caracteres' });

      required(campos.clasificacion, { message: 'Elegí una clasificación' });

      required(campos.precio, { message: 'El precio es obligatorio' });
      min(campos.precio, 0.01, { message: 'Debe ser mayor a 0' });

      required(campos.stock, { message: 'El stock es obligatorio' });
      min(campos.stock, 0, { message: 'No puede ser negativo' });
      validarEntero(campos.stock);

      maxLength(campos.imagenUrl, 500, { message: 'Máximo 500 caracteres' });
      validate(campos.imagenUrl, ({ value }) => {
        const url = value().trim();
        return url && !esUrlHttp(url)
          ? { kind: 'url', message: 'La URL debe comenzar con http:// o https://' }
          : undefined;
      });

      required(campos.pantalla, { message: 'La pantalla es obligatoria' });
      maxLength(campos.pantalla, 80, { message: 'Máximo 80 caracteres' });

      required(campos.almacenamientoGb, { message: 'El almacenamiento es obligatorio' });
      min(campos.almacenamientoGb, 1, { message: 'Debe ser mayor a 0' });
      validarEntero(campos.almacenamientoGb);

      required(campos.ramGb, { message: 'La RAM es obligatoria' });
      min(campos.ramGb, 1, { message: 'Debe ser mayor a 0' });
      validarEntero(campos.ramGb);

      required(campos.bateriaMah, { message: 'La batería es obligatoria' });
      min(campos.bateriaMah, 1, { message: 'Debe ser mayor a 0' });
      validarEntero(campos.bateriaMah);

      required(campos.camara, { message: 'La cámara es obligatoria' });
      maxLength(campos.camara, 150, { message: 'Máximo 150 caracteres' });
    },
    {
      submission: {
        action: async (campos) => {
          const valor = campos().value();
          const imagenLimpia = valor.imagenUrl.trim();
          try {
            const creado = await this.productosApi.crear({
              nombre: valor.nombre.trim(),
              marca: valor.marca.trim(),
              descripcion: valor.descripcion.trim(),
              clasificacion: valor.clasificacion,
              precio: Number(valor.precio),
              stock: Number(valor.stock),
              ...(imagenLimpia ? { imagenUrl: imagenLimpia } : {}),
              pantalla: valor.pantalla.trim(),
              almacenamientoGb: Number(valor.almacenamientoGb),
              ramGb: Number(valor.ramGb),
              bateriaMah: Number(valor.bateriaMah),
              camara: valor.camara.trim(),
            });
            this.snackBar.open('Producto cargado correctamente', 'Cerrar', { duration: 4000 });
            await this.router.navigate(['/productos', creado.id]);
            return undefined;
          } catch (error) {
            const mensaje =
              error instanceof HttpErrorResponse && error.status === 403
                ? 'Solo los administradores pueden cargar productos.'
                : 'No se pudo guardar el producto. Intentá de nuevo.';
            this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
            return undefined;
          }
        },
      },
    },
  );
}
