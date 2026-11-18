import {
  generarTokenRecuperacion,
  hashTokenRecuperacion,
} from './token-recuperacion.js';

describe('token de recuperación', () => {
  it('genera tokens distintos y seguros para URL', () => {
    const primero = generarTokenRecuperacion();
    const segundo = generarTokenRecuperacion();

    expect(primero).not.toBe(segundo);
    expect(primero).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it('hashea el token con SHA-256 y no lo deja en claro', () => {
    const token = generarTokenRecuperacion();
    const hash = hashTokenRecuperacion(token);

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toBe(token);
    expect(hashTokenRecuperacion(token)).toBe(hash);
  });
});
