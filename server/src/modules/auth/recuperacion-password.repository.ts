import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { RecuperacionPassword } from '../../entities/recuperacion-password.entity.js';

@Injectable()
export class RecuperacionPasswordRepository {
  constructor(
    @InjectRepository(RecuperacionPassword)
    private readonly recuperacionRepository: Repository<RecuperacionPassword>,
  ) {}

  findByUsuarioId(usuarioId: string): Promise<RecuperacionPassword | null> {
    return this.recuperacionRepository.findOne({
      where: { usuario: { id: usuarioId } },
    });
  }

  async reemplazar(
    usuarioId: string,
    tokenHash: string,
    creadoEn: Date,
    expiraEn: Date,
  ): Promise<void> {
    const existente = await this.findByUsuarioId(usuarioId);
    const datos: DeepPartial<RecuperacionPassword> = {
      usuario: { id: usuarioId },
      tokenHash,
      creadoEn,
      expiraEn,
      usadoEn: null,
    };
    if (existente) datos.id = existente.id;
    await this.recuperacionRepository.save(datos);
  }
}
