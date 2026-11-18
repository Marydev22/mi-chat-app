# EPNTalk

Chat en tiempo real con **React Native + Expo + TypeScript**, **Supabase** (Auth, base de datos, Storage y Realtime), **TanStack Query** (estado del servidor) y **Zustand** (estado de sesión), organizado con **Clean Architecture + Vertical Slicing**.

## Diseño

Marca e identidad visual institucional: azul `#172941`, dorado `#F2B84C`, rojo `#D81F1D`, beige `#D9CD99` y gris `#F2F2F2` (ver `src/shared/presentation/theme/colors.ts`). Iconos vectoriales con `@expo/vector-icons` y animaciones suaves con la API `Animated` de React Native. El logo vive en `assets/images/epn-logo.png` (origen: `public/images.png`).

## Estructura

```
src/
├── features/
│   ├── auth/   → domain / application / infrastructure / presentation
│   └── chat/   → domain / application / infrastructure / presentation
└── shared/     → domain (errores) / infrastructure (cliente Supabase)
app/            → rutas de Expo Router (solo UI, usa los hooks)
supabase/       → schema.sql (tablas, RLS, Realtime)
```

Regla de dependencias: las capas externas conocen a las internas, nunca al revés. `domain` no importa nada de Supabase, React ni Expo.

## Puesta en marcha

1. Instalar dependencias: `npm install`
2. Crear un proyecto en Supabase y copiar la URL y la anon key en `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=...
   EXPO_PUBLIC_SUPABASE_ANON_KEY=...
   ```
3. Ejecutar `supabase/schema.sql` en el SQL Editor de Supabase.
4. Iniciar: `npx expo start` (escanear el QR con Expo Go).

> Nota: en Supabase, desactiva la confirmación por email (Authentication > Providers > Email) para poder entrar justo después de registrarte.
