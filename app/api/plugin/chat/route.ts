import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, getSettings } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    // Support both header-based (plugin) and body-based (dashboard) auth
    const authHeader = req.headers.get('authorization')
    const body       = await req.json()

    const { message, context, selected_scripts } = body
    let apiKeyStr: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      apiKeyStr = authHeader.slice(7)
    } else if (body.api_key) {
      apiKeyStr = body.api_key
    }

    if (!apiKeyStr) {
      return NextResponse.json({ error: 'Clé API manquante.' }, { status: 401 })
    }

    // Validate API key
    const keyData = await validateApiKey(apiKeyStr)
    if (!keyData) {
      return NextResponse.json({ error: 'Clé API invalide ou désactivée.' }, { status: 401 })
    }

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message vide.' }, { status: 400 })
    }

    // Load tools/settings for context
    const settings = await getSettings()
    const tools: any[] = settings?.tools ?? []

    // Build system prompt
    let systemPrompt = `Tu es AzetoAI, un assistant IA spécialisé dans Roblox Studio et la programmation Lua/Luau.
Tu aides les développeurs à créer des jeux Roblox en écrivant des scripts, en déboguant du code, et en expliquant des concepts.
Réponds de manière concise, claire, et utile. Quand tu écris du code, utilise Luau (le dialecte Lua de Roblox).
Tu t'exprimes en français sauf si l'utilisateur te parle en anglais.`

    if (tools.length > 0) {
      systemPrompt += `\n\nScripts/outils disponibles dans ce projet :\n`
      tools.forEach(t => {
        systemPrompt += `\n## ${t.name}\n${t.description}\n\`\`\`lua\n${t.script}\n\`\`\``
      })
    }

    if (selected_scripts?.length > 0) {
      systemPrompt += `\n\nScripts actuellement sélectionnés dans Roblox Studio :\n${selected_scripts.join('\n')}`
    }

    // Build user message
    let userMessage = message
    if (context) {
      userMessage = `Contexte : ${context}\n\nQuestion : ${message}`
    }

    // Call Anthropic API (or any AI provider)
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) {
      return NextResponse.json({ error: 'Clé IA non configurée sur le serveur.' }, { status: 500 })
    }

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system:     systemPrompt,
        messages:   [{ role: 'user', content: userMessage }],
      }),
    })

    if (!aiRes.ok) {
      const err = await aiRes.json()
      console.error('Anthropic error:', err)
      return NextResponse.json({ error: 'Erreur du service IA.' }, { status: 502 })
    }

    const aiData = await aiRes.json()
    const reply  = aiData.content?.[0]?.text ?? 'Aucune réponse.'

    return NextResponse.json({ reply })
  } catch (err: any) {
    console.error('Chat error:', err)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
