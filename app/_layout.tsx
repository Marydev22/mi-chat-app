// app/_layout.tsx: envuelve la app en QueryClientProvider, restaura la sesión y redirige
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '@shared/infrastructure/supabase/client';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { SupabaseAuthRepository } from '@features/auth/infrastructure/repositories/SupabaseAuthRepository';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reintentar solo 1 vez en fallo (por defecto son 3)
      retry: 1,
      // Datos "frescos" por 30 segundos
      staleTime: 30_000,
    },
  },
});

const authRepo = new SupabaseAuthRepository();

// AuthGuard es un componente aparte para poder usar useSegments/useRouter
// dentro de QueryClientProvider.
function AuthGuard() {
  const { user, setUser } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Restaurar sesión al arrancar la app
    authRepo.getCurrentUser().then(setUser);

    // Escuchar cambios de sesión: token expirado, logout en otro dispositivo
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const currentUser = await authRepo.getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  useEffect(() => {
    const inAuth = segments[0] === '(auth)';
    if (!user && !inAuth) router.replace('/(auth)/login');
    if (user && inAuth) router.replace('/(app)');
  }, [user, segments, router]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard />
    </QueryClientProvider>
  );
}
