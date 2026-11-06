import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import type { Usuario, UsuarioPublico } from '../../entities/usuario.entity.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import type { SignUpDto } from './auth.dto.js';
import type { AccessToken, JwtPayload } from './auth.types.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async signin(usuario: UsuarioPublico): Promise<AccessToken> {
    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      isAdmin: usuario.isAdmin,
    };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }

  async signup(signupDto: SignUpDto): Promise<UsuarioPublico> {
    const usuario = await this.usuariosService.crear({
      email: signupDto.email,
      password: signupDto.password,
      nombre: signupDto.nombre,
      apellido: signupDto.apellido,
      direccion: signupDto.direccion,
    });
    return this.sinPassword(usuario);
  }

  async validarCredenciales(
    email: string,
    password: string,
  ): Promise<UsuarioPublico> {
    const usuario = await this.usuariosService.buscarPorEmail(
      email.trim().toLowerCase(),
    );
    if (!usuario || !(await compare(password, usuario.passwordHash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.sinPassword(usuario);
  }

  async validarJwt(id: string): Promise<UsuarioPublico> {
    const usuario = await this.usuariosService.buscarPorId(id);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.sinPassword(usuario);
  }

  private sinPassword(usuario: Usuario): UsuarioPublico {
    const { passwordHash: _passwordHash, ...usuarioPublico } = usuario;
    return usuarioPublico;
  }
}
