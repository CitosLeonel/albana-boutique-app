/* ============================================================
   src/config/supabase.js
   Cliente de Supabase — única fuente de verdad para la conexión.

   ⚠️  En producción con Vite, mover las credenciales a .env:
       VITE_SUPABASE_URL=...
       VITE_SUPABASE_ANON_KEY=...
   Y reemplazar los valores por:
       import.meta.env.VITE_SUPABASE_URL
       import.meta.env.VITE_SUPABASE_ANON_KEY
   ============================================================ */

const SUPABASE_URL      = 'https://uoumkmzbstdoqnbbssjq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LYghwYN6eokKQLjB182tJQ_-_NI1VKf';

const { createClient } = supabase; // supabase-js desde CDN

const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken:    true,
    persistSession:      true,
    detectSessionInUrl:  false,
    flowType:            'pkce',
  },
});
