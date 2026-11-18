import { supabase } from '@shared/infrastructure/supabase/client';
import { User } from '@features/auth/domain/entities/User';
import { IAuthRepository } from '@features/auth/domain/repositories/IAuthRepository';

// Único archivo del slice auth que importa Supabase.
// Mapea el modelo de Supabase (snake_case) a nuestra entidad User (camelCase).
export class SupabaseAuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('No se pudo iniciar sesión');

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', data.user.id)
      .single();

    return {
      id: data.user.id,
      email: data.user.email!,
      username: profile?.username ?? '',
      avatarUrl: profile?.avatar_url ?? undefined,
    };
  }

  async register(email: string, password: string, username: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('No se pudo crear el usuario');

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, username });
    if (profileError) throw new Error(profileError.message);

    return { id: data.user.id, email: data.user.email!, username };
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email!,
      username: profile?.username ?? '',
      avatarUrl: profile?.avatar_url ?? undefined,
    };
  }
}
