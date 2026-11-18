import { User } from '../entities/User';

// Contrato: qué se puede hacer con autenticación, sin decir cómo.
export interface IAuthRepository {
  login(email: string, password: string): Promise<User>;
  register(email: string, password: string, username: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}
