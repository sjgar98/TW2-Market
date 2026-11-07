import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 80 })
  marca: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'varchar', length: 80 })
  clasificacion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'varchar', length: 500 })
  imagenUrl: string;

  @Column({ type: 'varchar', length: 80 })
  pantalla: string;

  @Column({ type: 'int' })
  almacenamientoGb: number;

  @Column({ type: 'int' })
  ramGb: number;

  @Column({ type: 'int' })
  bateriaMah: number;

  @Column({ type: 'varchar', length: 150 })
  camara: string;
}