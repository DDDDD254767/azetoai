import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Azetoadmin2746656'

export async function GET() {
  const { data } = await supabase.from('settings').select('*').single()
  return NextResponse.json(data ?? { tools: [], plugin_url: '' })
}

export async function POST(req: NextRequest) {
  const adminPw = req.headers.get('x-admin-password')
  if (adminPw !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 })
  }

  try {
    const { tools, plugin_url } = await req.json()

    // Upsert settings (single row)
    const { error } = await supabase
      .from('settings')
      .upsert({ id: 1, tools, plugin_url, updated_at: new Date().toISOString() })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
