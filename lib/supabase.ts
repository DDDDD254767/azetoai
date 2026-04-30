import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceKey)
}

export async function getUserApiKey(userId: string) {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()
  if (error) return null
  return data
}

export async function validateApiKey(apiKey: string) {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*, users:user_id(email)')
    .eq('key', apiKey)
    .eq('is_active', true)
    .single()
  if (error || !data) return null

  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('key', apiKey)

  return data
}

export async function getSettings() {
  const { data } = await supabase
    .from('settings')
    .select('*')
    .single()
  return data
}
