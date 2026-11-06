import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { Repository } from 'typeorm';
import { Usuario } from '../../entities/usuario.entity.js';

export type NuevoUsuario = Pick<
  Usuario,
  'email' | 'nombre' | 'apellido' | 'direccion'
> & { password: string };

const BCRYPT_SALT_ROUNDS = 16;

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { email } });
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { id } });
  }

  async crear(nuevoUsuario: NuevoUsuario): Promise<Usuario> {
    const existente = await this.buscarPorEmail(nuevoUsuario.email);
    if (existente) {
      throw new ConflictException('El email ya está registrado');
    }
    const usuario = this.usuarioRepository.create({
      email: nuevoUsuario.email,
      passwordHash: await hash(nuevoUsuario.password, BCRYPT_SALT_ROUNDS),
      nombre: nuevoUsuario.nombre,
      apellido: nuevoUsuario.apellido,
      direccion: nuevoUsuario.direccion,
      isAdmin: false,
    });
    return this.usuarioRepository.save(usuario);
  }
}
