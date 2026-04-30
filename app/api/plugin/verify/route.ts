import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const body       = await req.json().catch(() => ({}))

    let apiKeyStr: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      apiKeyStr = authHeader.slice(7)
    } else if (body.api_key) {
      apiKeyStr = body.api_key
    }

    if (!apiKeyStr) {
      return NextResponse.json({ valid: false, error: 'Clé API manquante.' }, { status: 401 })
    }

    const keyData = await validateApiKey(apiKeyStr)

    if (!keyData) {
      return NextResponse.json({ valid: false, error: 'Clé API invalide ou désactivée.' }, { status: 401 })
    }

    return NextResponse.json({
      valid:   true,
      user_id: keyData.user_id,
      email:   (keyData.users as any)?.email ?? null,
      key_id:  keyData.id,
    })
  } catch (err: any) {
    console.error('Verify error:', err)
    return NextResponse.json({ valid: false, error: 'Erreur interne.' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!apiKey) {
    return NextResponse.json({ valid: false, error: 'Clé manquante.' }, { status: 401 })
  }
  const keyData = await validateApiKey(apiKey)
  if (!keyData) {
    return NextResponse.json({ valid: false, error: 'Clé invalide.' }, { status: 401 })
  }
  return NextResponse.json({ valid: true, user_id: keyData.user_id })
}
