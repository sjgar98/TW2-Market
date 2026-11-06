export type ReglaPassword = {
  etiqueta: string;
  cumple: (password: string) => boolean;
};

export const REGLAS_PASSWORD: readonly ReglaPassword[] = [
  { etiqueta: 'Al menos 8 caracteres', cumple: (password) => password.length >= 8 },
  { etiqueta: 'Una letra mayúscula', cumple: (password) => /[A-Z]/.test(password) },
  { etiqueta: 'Una letra minúscula', cumple: (password) => /[a-z]/.test(password) },
  { etiqueta: 'Un número', cumple: (password) => /[0-9]/.test(password) },
  {
    etiqueta: 'Un símbolo (por ejemplo ! @ # $)',
    cumple: (password) => /[-#!$@£%^&*()_+|~=`{}[\]:";'<>?,./\\ ]/.test(password),
  },
];

export function cumplePoliticaPassword(password: string): boolean {
  return REGLAS_PASSWORD.every((regla) => regla.cumple(password));
}
