import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (cached) return cached;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iirqssurrobhbowhldek.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcnFzc3Vycm9iaGJvd2hsZGVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjM3NTAsImV4cCI6MjA4ODc5OTc1MH0.fh9S0Fu_uWe5d2ZgjD_dXQlyNqSksv6HzJ6SbHXv7mc';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to client/.env.local."
    );
  }

  cached = createClient(supabaseUrl, supabaseAnonKey);
  return cached;
}