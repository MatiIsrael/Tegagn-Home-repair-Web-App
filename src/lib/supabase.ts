import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://lwhxpychxnikhwkwejks.supabase.co';
const DEFAULT_KEY = 'sb_publishable_MrlG-IY-i4z15eu7CY2oCQ_PkY-gsYE';

// Read Supabase environment variables from Vite, localStorage, or provided project configuration
const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || '';
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

const localUrl = typeof window !== 'undefined' ? (localStorage.getItem('tegagn_supabase_url') || '').trim() : '';
const localKey = typeof window !== 'undefined' ? (localStorage.getItem('tegagn_supabase_anon_key') || '').trim() : '';

export const supabaseUrl = envUrl || localUrl || DEFAULT_URL;
export const supabaseAnonKey = envKey || localKey || DEFAULT_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  supabaseUrl.startsWith('https://')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null;

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tegagn_supabase_url', url.trim());
    localStorage.setItem('tegagn_supabase_anon_key', anonKey.trim());
    window.location.reload();
  }
}

export function clearSupabaseConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('tegagn_supabase_url');
    localStorage.removeItem('tegagn_supabase_anon_key');
    window.location.reload();
  }
}
