// La entidad User representa al usuario para NUESTRA app, no para Supabase.
export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
}
