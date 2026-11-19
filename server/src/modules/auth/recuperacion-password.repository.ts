import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { DeepPartial } from 'typeorm';
import { RecuperacionPassword } from '../../entities/recuperacion-password.entity.js';
import { Usuario } from '../../entities/usuario.entity.js';

export type DatosRestablecimiento = {
  recuperacionId: string;
  usuarioId: string;
  passwordHash: string;
  usadoEn: Date;
};

@Injectable()
export class RecuperacionPasswordRepository {
  constructor(
    @InjectRepository(RecuperacionPassword)
    private readonly recuperacionRepository: Repository<RecuperacionPassword>,
    private readonly dataSource: DataSource,
  ) {}

  findByUsuarioId(usuarioId: string): Promise<RecuperacionPassword | null> {
    return this.recuperacionRepository.findOne({
      where: { usuario: { id: usuarioId } },
    });
  }

  findByTokenHash(tokenHash: string): Promise<RecuperacionPassword | null> {
    return this.recuperacionRepository.findOne({
      where: { tokenHash },
      relations: { usuario: true },
    });
  }

  async consumirTokenYActualizarPassword(
    datos: DatosRestablecimiento,
  ): Promise<boolean> {
    return this.dataSource.transaction(async (manager) => {
      const resultado = await manager
        .createQueryBuilder()
        .update(RecuperacionPassword)
        .set({ usadoEn: datos.usadoEn })
        .where('id = :recuperacionId AND usadoEn IS NULL', {
          recuperacionId: datos.recuperacionId,
        })
        .execute();

      if ((resultado.affected ?? 0) === 0) return false;

      await manager.update(Usuario, datos.usuarioId, {
        passwordHash: datos.passwordHash,
      });
      return true;
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
