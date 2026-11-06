export type Credenciales = {
  email: string;
  password: string;
};

export type DatosRegistro = {
  nombre: string;
  apellido: string;
  email: string;
  direccion: string;
  password: string;
  repeatPassword: string;
};

export type AccessToken = {
  accessToken: string;
};

export type UsuarioRegistrado = {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  direccion: string;
  isAdmin: boolean;
};

export type UsuarioSesion = {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  isAdmin: boolean;
};
