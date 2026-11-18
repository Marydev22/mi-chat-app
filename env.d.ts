// env.d.ts: declaración de tipos para TypeScript (no genera código).
// Le dice al compilador qué variables de entorno existen y su forma.
declare const process: {
  env: {
    readonly EXPO_PUBLIC_SUPABASE_URL: string;
    readonly EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
    readonly [key: string]: string | undefined;
  };
};
