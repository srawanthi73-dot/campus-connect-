import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Helper to determine if the URL is a real one or just a placeholder string
const isValidUrl = (url) => url && url.startsWith('http') && !url.includes('your-project')

const supabaseUrl = isValidUrl(rawUrl) ? rawUrl : 'https://xyzcompany.supabase.co'
const supabaseAnonKey = (rawKey && !rawKey.includes('your-anon-key')) ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyODk3NjAwMCwiZXhwIjoyNTQ0NTI4MDAwfQ.placeholder'

if (!isValidUrl(rawUrl)) {
  console.warn('System running in DEMO mode with mock Supabase target.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
