import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data } = await supabase.from('settings').select('plugin_url').single()
  return NextResponse.json({ url: data?.plugin_url ?? '' })
}
