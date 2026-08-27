import { createClient } from "@supabase/supabase-js";

// Projeto Supabase externo (chave anon é pública por design)
export const SUPABASE_URL = "https://ysextpssiulpbbbfvcix.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzZXh0cHNzaXVscGJiYmZ2Y2l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NTYyMjksImV4cCI6MjEwMzQzMjIyOX0.VzNZCVWDx06zD79Vhk3cFcvGpPLs9mBe08b6IhXyrJo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});
