import { createClient } from '@supabase/supabase-js'

// Supabase client for syncing tables. Configure via Vite env vars.
const supabaseUrl = ((import.meta as any).env.VITE_SUPABASE_URL ?? 'https://dkqqlypcqwhgtgdetdau.supabase.co') as string
const supabaseKey = ((import.meta as any).env.VITE_SUPABASE_KEY ?? process.env.SUPABASE_KEY) as string

export const supabase = createClient(supabaseUrl, supabaseKey)

// Check if the required 'public.tables' relation exists (PostgREST PGRST116 → missing)
export async function checkTablesSchema(): Promise<'ok' | 'missing' | 'error'> {
  try {
    const { error } = await supabase.from('tables').select('id').limit(1)
    if (!error) return 'ok'
    if (error.code === 'PGRST116' || /schema cache/i.test(error.message || '')) return 'missing'
    return 'error'
  } catch {
    return 'error'
  }
}

export default supabase


