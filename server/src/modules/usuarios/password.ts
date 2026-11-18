import { hash } from 'bcrypt';

const BCRYPT_SALT_ROUNDS = 16;

export function hashearPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_SALT_ROUNDS);
}
