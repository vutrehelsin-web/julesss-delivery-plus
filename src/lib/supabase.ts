import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oauuahkjxqxjlmztdkse.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_QcdCyakN81bWMljGIiHu0g_mDaw2hBr';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
