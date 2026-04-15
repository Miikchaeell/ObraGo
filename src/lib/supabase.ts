import { createClient } from '@supabase/supabase-js';

// Estas llaves deben ser configuradas en el archivo .env de la raíz
// VITE_SUPABASE_URL=tu_url_de_supabase
// VITE_SUPABASE_ANON_KEY=tu_llave_anon_de_supabase

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Auth and DB features will be limited until configured in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
