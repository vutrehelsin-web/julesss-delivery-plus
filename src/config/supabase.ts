import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

export function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials in environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
  }

  return createClient(supabaseUrl, supabaseKey);
}

// Helper para guardar en base de datos
export async function saveToDatabase(table: string, data: any) {
  const supabase = getSupabase();
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result;
}

// Helper para obtener de base de datos
export async function getFromDatabase(table: string, id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}
