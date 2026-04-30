'use client'
import { useState } from 'react'
import { useDash } from '../layout'
import { supabase } from '@/lib/supabase'
import { Key, Copy, RefreshCw, CheckCircle, Eye, EyeOff, Info, Zap, AlertCircle } from 'lucide-react'

export default function ApiKeyPage() {
  const { user, apiKey, refreshApiKey } = useDash()
  const [visible,    setVisible]    = useState(false)
  const [copied,     setCopied]     = useState(false)
  const [regen,      setRegen]      = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState('')

  const maskedKey = apiKey
    ? visible
      ? apiKey.key
      : `${apiKey.key.slice(0, 12)}${'•'.repeat(24)}${apiKey.key.slice(-4)}`
    : ''

  const copyKey = async () => {
    if (!apiKey) return
    await navigator.clipboard.writeText(apiKey.key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const regenerate = async () => {
    if (!user || !regen) return
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Deactivate old
      await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('user_id', user.id)

      const newKey = `azeto_${Array.from(crypto.getRandomValues(new Uint8Array(30)))
        .map(b => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[b % 62])
        .join('')}`

      const { error: err } = await supabase.from('api_keys').insert({
        user_id:   user.id,
        key:       newKey,
        is_active: true,
      })

      if (err) throw err
      await refreshApiKey()
      setRegen(false)
      setSuccess('Clé API régénérée avec succès !')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createKey = async () => {
    if (!user) return
    setLoading(true)
    setError('')

    try {
      const newKey = `azeto_${Array.from(crypto.getRandomValues(new Uint8Array(30)))
        .map(b => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[b % 62])
        .join('')}`

      const { error: err } = await supabase.from('api_keys').insert({
        user_id:   user.id,
        key:       newKey,
        is_active: true,
      })
      if (err) throw err
      await refreshApiKey()
      setSuccess('Clé API créée !')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(34,80,232,0.15)', border: '1px solid rgba(34,80,232,0.3)' }}>
            <Key size={18} style={{ color: 'var(--accent-blue-light)' }} />
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Clé API</h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Utilisez cette clé dans le plugin Roblox Studio pour vous authentifier.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-4" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-4" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <CheckCircle size={15} /> {success}
        </div>
      )}

      {/* Key card */}
      <div className="rounded-2xl p-6 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {apiKey ? (
          <>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }} />
              <p className="text-xs font-medium" style={{ color: 'var(--success)' }}>Clé active</p>
            </div>

            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3 mt-3 mb-4 font-mono text-sm break-all"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              <span className="flex-1 leading-relaxed">{maskedKey}</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setVisible(v => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                {visible ? <EyeOff size={14} /> : <Eye size={14} />}
                {visible ? 'Masquer' : 'Afficher'}
              </button>

              <button
                onClick={copyKey}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ background: copied ? 'rgba(16,185,129,0.1)' : 'var(--bg-secondary)', border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`, color: copied ? 'var(--success)' : 'var(--text-secondary)' }}
              >
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                {copied ? 'Copié !' : 'Copier'}
              </button>

              <button
                onClick={() => setRegen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
              >
                <RefreshCw size={14} /> Régénérer
              </button>
            </div>

            {/* Confirm regen */}
            {regen && (
              <div className="mt-4 rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: '#ef4444' }}>Attention !</strong> L&apos;ancienne clé sera invalidée. Mettez à jour le plugin Roblox avec la nouvelle clé.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={regenerate}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{ background: '#ef4444', color: 'white' }}
                  >
                    {loading ? 'Génération…' : 'Confirmer la régénération'}
                  </button>
                  <button
                    onClick={() => setRegen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Aucune clé API. Créez-en une.</p>
            <button
              onClick={createKey}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold mx-auto transition-all"
              style={{ background: 'var(--accent-blue)', color: 'white' }}
            >
              <Zap size={15} /> {loading ? 'Création…' : 'Créer une clé API'}
            </button>
          </div>
        )}
      </div>

      {/* Usage info */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Info size={15} style={{ color: 'var(--accent-blue-light)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Utilisation dans le plugin</p>
        </div>
        <div className="rounded-xl p-4 font-mono text-xs" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>-- Dans le plugin Roblox Studio :</p>
          <p style={{ color: '#a855f7' }}>local <span style={{ color: 'var(--accent-blue-light)' }}>API_KEY</span> = <span style={{ color: '#10b981' }}>&quot;{apiKey?.key ?? 'votre_clé_ici'}&quot;</span></p>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>HttpService:RequestAsync({`{`}</p>
          <p className="pl-4" style={{ color: 'var(--text-secondary)' }}>Url = <span style={{ color: '#10b981' }}>&quot;https://votre-site.com/api/plugin/chat&quot;</span>,</p>
          <p className="pl-4" style={{ color: 'var(--text-secondary)' }}>Headers = {`{`} Authorization = <span style={{ color: '#10b981' }}>&quot;Bearer &quot;</span> .. API_KEY {`}`}</p>
          <p>{`})`}</p>
        </div>
      </div>
    </div>
  )
}
