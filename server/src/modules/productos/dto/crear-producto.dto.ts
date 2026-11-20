import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

const trimOpcional = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') return value;
  const limpio = value.trim();
  return limpio.length > 0 ? limpio : undefined;
};

export class CrearProductoDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(150, { message: 'El nombre no puede superar los 150 caracteres' })
  nombre: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'La marca es obligatoria' })
  @MaxLength(80, { message: 'La marca no puede superar los 80 caracteres' })
  marca: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(500, {
    message: 'La descripción no puede superar los 500 caracteres',
  })
  descripcion: string;

  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número válido' },
  )
  @Min(0.01, { message: 'Debe ser mayor a 0' })
  precio: number;

  @Type(() => Number)
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock: number;

  @Transform(trimOpcional)
  @IsOptional()
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: 'La URL de la imagen debe comenzar con http:// o https://' },
  )
  @MaxLength(500)
  imagenUrl?: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'La pantalla es obligatoria' })
  @MaxLength(80)
  pantalla: string;

  @Type(() => Number)
  @IsInt({ message: 'El almacenamiento debe ser un número entero' })
  @Min(1, { message: 'El almacenamiento debe ser mayor a 0' })
  almacenamientoGb: number;

  @Type(() => Number)
  @IsInt({ message: 'La RAM debe ser un número entero' })
  @Min(1, { message: 'La RAM debe ser mayor a 0' })
  ramGb: number;

  @Type(() => Number)
  @IsInt({ message: 'La batería debe ser un número entero' })
  @Min(1, { message: 'La batería debe ser mayor a 0' })
  bateriaMah: number;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'La cámara es obligatoria' })
  @MaxLength(150)
  camara: string;
}
