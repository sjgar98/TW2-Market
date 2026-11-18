import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator.js';
import type { UsuarioPublico } from '../../entities/usuario.entity.js';
import { RecuperarPasswordDto, SignInDto, SignUpDto } from './auth.dto.js';
import { AuthService } from './auth.service.js';
import type { AccessToken } from './auth.types.js';
import { LocalAuthGuard } from './guards/local-auth.guard.js';
import {
  MENSAJE_SOLICITUD_RECUPERACION,
  RecuperacionPasswordService,
} from './recuperacion-password.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly recuperacionPasswordService: RecuperacionPasswordService,
  ) {}

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

  @Public()
  @HttpCode(202)
  @Post('recuperar-password')
  async recuperarPassword(
    @Body() body: RecuperarPasswordDto,
  ): Promise<{ message: string }> {
    await this.recuperacionPasswordService.solicitar(body.email);
    return { message: MENSAJE_SOLICITUD_RECUPERACION };
  }
}
