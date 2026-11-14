import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { ItemPedido } from './item-pedido.entity.js';
import { Usuario } from './usuario.entity.js';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE', nullable: false })
  usuario: Usuario;

  @Column({ type: 'text' })
  direccionEnvio: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @CreateDateColumn()
  creadoEn: Date;

  @OneToMany(() => ItemPedido, (item) => item.pedido, { cascade: true })
  items: Relation<ItemPedido[]>;
}
