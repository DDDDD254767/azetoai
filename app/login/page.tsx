'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Bot, Eye, EyeOff, Loader2, Zap } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard/chat')
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard/chat')
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error

        if (data.user) {
          // Create API key for new user
          const apiKey = `azeto_${Array.from(crypto.getRandomValues(new Uint8Array(30)))
            .map(b => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[b % 62])
            .join('')}`

          await supabase.from('api_keys').insert({
            user_id: data.user.id,
            key: apiKey,
            is_active: true,
          })
        }
        setSuccess('Compte créé ! Vérifiez votre email pour confirmer.')
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center mesh-bg"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="relative w-full max-w-md px-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-40" style={{ background: 'var(--accent-blue)' }} />
            <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
              <Bot size={32} style={{ color: 'var(--accent-blue-light)' }} />
            </div>
          </div>
          <h1 className="text-2xl font-bold gradient-text">AzetoAI</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Plugin IA pour Roblox Studio</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {/* Tabs */}
          <div className="flex rounded-xl p-1 mb-6" style={{ background: 'var(--bg-secondary)' }}>
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess('') }}
                className="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                style={{
                  background: mode === m ? 'var(--bg-card)' : 'transparent',
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                }}
              >
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all pr-11"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2"
              style={{
                background: loading ? 'var(--bg-card-hover)' : 'var(--accent-blue)',
                color: 'white',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Chargement...</>
              ) : (
                <><Zap size={16} /> {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          AzetoAI • Plugin IA pour Roblox Studio
        </p>
      </div>
    </div>
  )
}
