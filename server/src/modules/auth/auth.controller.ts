import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator.js';
import type { UsuarioPublico } from '../../entities/usuario.entity.js';
import { SignInDto, SignUpDto } from './auth.dto.js';
import { AuthService } from './auth.service.js';
import type { AccessToken } from './auth.types.js';
import { LocalAuthGuard } from './guards/local-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('signin')
  signin(
    @UsuarioActual() usuario: UsuarioPublico,
    @Body() _body: SignInDto,
  ): Promise<AccessToken> {
    return this.authService.signin(usuario);
  }

  @Public()
  @Post('signup')
  signup(@Body() body: SignUpDto): Promise<UsuarioPublico> {
    return this.authService.signup(body);
  }
}
