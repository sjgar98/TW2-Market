import { computed, Service, signal } from '@angular/core';
import type { UsuarioSesion } from './auth-models';

const CLAVE_TOKEN = 'tw2market.token';

type JwtPayload = {
  sub: string;
  email: string;
  nombre: string;
  apellido: string;
  isAdmin: boolean;
  exp: number;
};

@Service()
export class Sesion {
  private readonly tokenGuardado = signal<string | null>(localStorage.getItem(CLAVE_TOKEN));

  readonly usuario = computed(() => decodificarUsuario(this.tokenGuardado()));
  readonly token = computed(() => (this.usuario() ? this.tokenGuardado() : null));

  iniciar(token: string): void {
    localStorage.setItem(CLAVE_TOKEN, token);
    this.tokenGuardado.set(token);
  }

  cerrar(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    this.tokenGuardado.set(null);
  }
}

function decodificarUsuario(token: string | null): UsuarioSesion | null {
  const payload = token ? decodificarPayload(token) : null;
  if (!payload || payload.exp * 1000 <= Date.now()) {
    return null;
  }
  return {
    id: payload.sub,
    email: payload.email,
    nombre: payload.nombre,
    apellido: payload.apellido,
    isAdmin: payload.isAdmin,
  };
}

function decodificarPayload(token: string): JwtPayload | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), (caracter) => caracter.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as JwtPayload;
  } catch {
    return null;
  }
}
