import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  ValidateIf,
} from 'class-validator';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

const normalizarEmail = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class SignInDto {
  @IsEmail(undefined, { message: 'Credenciales inválidas' })
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class SignUpDto {
  @Transform(normalizarEmail)
  @IsEmail(undefined, { message: 'El email no es válido' })
  @MaxLength(254)
  email: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo',
    },
  )
  @MaxLength(72, {
    message: 'La contraseña no puede superar los 72 caracteres',
  })
  password: string;

  @ValidateIf((o: SignUpDto) => o.password !== o.repeatPassword)
  @IsNotEmpty()
  @IsEmpty({ message: 'Las contraseñas no coinciden' })
  repeatPassword: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100)
  nombre: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MaxLength(100)
  apellido: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @MaxLength(200)
  direccion: string;
}
