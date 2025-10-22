import { createClient } from '@supabase/supabase-js'

// Supabase client for syncing tables. Uses Vite env var VITE_SUPABASE_KEY when available.
const supabaseUrl = 'https://dkqqlypcqwhgtgdetdau.supabase.co'
const supabaseKey = ((import.meta as any).env.VITE_SUPABASE_KEY ?? process.env.SUPABASE_KEY) as string

export const supabase = createClient(supabaseUrl, supabaseKey)

// Initialize database schema if it doesn't exist
export async function initializeSchema(): Promise<void> {
  try {
    // Check if tables table exists
    const { error } = await supabase.from('tables').select('id').limit(1)
    
    if (error?.code === 'PGRST116') {
      // Table doesn't exist, create it
      const { error: createError } = await supabase.rpc('create_tables_table')
      if (createError) {
        // eslint-disable-next-line no-console
        console.warn('Could not create tables via RPC, will create manually', createError)
        // The table will need to be created manually or via SQL migration
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Schema check failed:', e)
  }
}

export default supabase


