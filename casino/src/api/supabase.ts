import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xxsycsowpatnziamtkee.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4c3ljc293cGF0bnppYW10a2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwOTIxOTgsImV4cCI6MjEwMDY2ODE5OH0.-tvejBm63QW_5VKrOuakxX-QQugQ_fyXqRpLuXX7iaY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
