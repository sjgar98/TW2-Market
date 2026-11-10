import { IsInt, Max, Min } from 'class-validator';

export class ActualizarCantidadDto {
  @IsInt()
  @Max(99)
  @Min(1)
  cantidad: number;
}