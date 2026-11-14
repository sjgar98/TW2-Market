import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Pedido } from './pedido.entity.js';
import { Producto } from './producto.entity.js';

@Entity('items_pedido')
export class ItemPedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pedido, (pedido) => pedido.items, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  pedido: Relation<Pedido>;

  @ManyToOne(() => Producto, { nullable: false })
  producto: Producto;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario: number;
}
