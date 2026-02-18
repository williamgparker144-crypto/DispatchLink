import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase env vars missing — API calls will fail gracefully.');
}

const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Use localStorage explicitly — Safari ITP blocks cookies from third-party domains
    // which can cause the default cookie-based Supabase auth to fail silently
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'dispatchlink-auth',
    flowType: 'implicit',
  },
  global: {
    headers: {
      'X-Client-Info': 'dispatchlink-web',
    },
  },
});

export { supabase, supabaseUrl, supabaseKey };
