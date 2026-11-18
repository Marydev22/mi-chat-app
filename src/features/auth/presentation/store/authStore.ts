import { create } from 'zustand';
import { User } from '@features/auth/domain/entities/User';

// Estado del CLIENTE (sesión): no se cachea ni se revalida como datos del servidor.
interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

// En Zustand v5 se usa la forma "curried": create<T>()(...)
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
