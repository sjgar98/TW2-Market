import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { AccessToken, Credenciales, DatosRegistro, UsuarioRegistrado } from './auth-models';

@Service()
export class AuthApi {
  private readonly http = inject(HttpClient);

  signin(credenciales: Credenciales): Promise<AccessToken> {
    return firstValueFrom(this.http.post<AccessToken>('/api/auth/signin', credenciales));
  }

  signup(datos: DatosRegistro): Promise<UsuarioRegistrado> {
    return firstValueFrom(this.http.post<UsuarioRegistrado>('/api/auth/signup', datos));
  }
}
