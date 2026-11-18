import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity.js';

@Entity('recuperaciones_password')
export class RecuperacionPassword {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @Column({ type: 'text', unique: true })
  tokenHash: string;

  @Column({ type: 'datetime' })
  creadoEn: Date;

  @Column({ type: 'datetime' })
  expiraEn: Date;

  @Column({ type: 'datetime', nullable: true })
  usadoEn: Date | null;
}
