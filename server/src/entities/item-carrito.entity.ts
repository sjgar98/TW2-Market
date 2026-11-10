import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Usuario } from './usuario.entity.js';
import { Producto } from './producto.entity.js';

@Entity('items_carrito')
@Unique(['usuario', 'producto'])
export class ItemCarrito {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Usuario, {onDelete: 'CASCADE', nullable: false})
    usuario: Usuario;

    @ManyToOne(() => Producto, {onDelete: 'CASCADE', nullable: false})
    producto: Producto;

    @Column({type: 'int', default: 1})
    cantidad: number;
}