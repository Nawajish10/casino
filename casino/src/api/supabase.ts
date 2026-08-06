import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xxsycsowpatnziamtkee.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4c3ljc293cGF0bnppYW10a2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwOTIxOTgsImV4cCI6MjEwMDY2ODE5OH0.-tvejBm63QW_5VKrOuakxX-QQugQ_fyXqRpLuXX7iaY';
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4c3ljc293cGF0bnppYW10a2VlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTA5MjE5OCwiZXhwIjoyMTAwNjY4MTk4fQ.2S6oyAj6zkaHNAEz3cH_V8x2R3IZaKMPTMw7-ZVzYFE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);
export const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
