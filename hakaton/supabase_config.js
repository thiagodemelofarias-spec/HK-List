// Configuração do cliente Supabase.
// Cole sua URL do projeto e a ANON KEY abaixo.
// Exemplo: https://xxxxx.supabase.co
const supabaseUrl = "https://yfatrfvqgswmhakotngs.supabase.co";

// Cole sua ANON KEY aqui.
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmYXRyZnZxZ3N3bWhha290bmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0NzE3NjIsImV4cCI6MjEwODA0Nzc2Mn0.d-cGaoxOQahbWO7b2NUHctTRTrICbWKolSjHmLGSfXQ";

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("PASTE_YOUR_") || supabaseAnonKey.includes("PASTE_YOUR_")) {
  throw new Error("Configure a URL e a ANON KEY do Supabase em supabase_config.js antes de iniciar a aplicação.");
}

const { createClient } = window.supabase;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
