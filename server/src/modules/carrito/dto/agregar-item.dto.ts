import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class AgregarItemDto {
    
    @IsUUID()
    productoId: string;

    @IsInt()
    @Max(99)
    @Min(1)
    cantidad: number;
}