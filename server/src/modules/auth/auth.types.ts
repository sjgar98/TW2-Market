export type JwtPayload = {
  sub: string;
  email: string;
  nombre: string;
  apellido: string;
  isAdmin: boolean;
};

export type AccessToken = {
  accessToken: string;
};
