'use client'
import { useState, useEffect } from 'react'
import { Shield, Lock, Plus, Trash2, Save, Link, Code2, CheckCircle, AlertCircle, Eye, EyeOff, X } from 'lucide-react'

const ADMIN_PASSWORD = 'Azetoadmin2746656'
const MAX_TOOLS = 20

interface Tool {
  id: string
  name: string
  description: string
  script: string
}

export default function AdminPage() {
  const [authed,     setAuthed]     = useState(false)
  const [pw,         setPw]         = useState('')
  const [showPw,     setShowPw]     = useState(false)
  const [pwError,    setPwError]    = useState('')

  const [tools,      setTools]      = useState<Tool[]>([])
  const [pluginUrl,  setPluginUrl]  = useState('https://example.com/azetoai-plugin.rbxm')
  const [editTool,   setEditTool]   = useState<Tool | null>(null)
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)
  const [error,      setError]      = useState('')

  useEffect(() => {
    if (!authed) return
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        if (d.tools)       setTools(d.tools)
        if (d.plugin_url)  setPluginUrl(d.plugin_url)
      })
      .catch(() => {})
  }, [authed])

  const login = () => {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true)
      setPwError('')
    } else {
      setPwError('Mot de passe incorrect.')
    }
  }

  const addTool = () => {
    if (tools.length >= MAX_TOOLS) return
    const newTool: Tool = { id: crypto.randomUUID(), name: 'Nouveau script', description: '', script: '-- Votre script Lua ici\n' }
    setTools(prev => [...prev, newTool])
    setEditTool(newTool)
  }

  const deleteTool = (id: string) => {
    setTools(prev => prev.filter(t => t.id !== id))
    if (editTool?.id === id) setEditTool(null)
  }

  const updateTool = (id: string, field: keyof Tool, value: string) => {
    setTools(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t))
    if (editTool?.id === id) setEditTool(prev => prev ? { ...prev, [field]: value } : null)
  }

  const saveAll = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': ADMIN_PASSWORD },
        body: JSON.stringify({ tools, plugin_url: pluginUrl }),
      })
      if (!res.ok) throw new Error('Erreur lors de la sauvegarde')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Password gate ─────────────────────────────────────────
  if (!authed) return (
    <div className="flex items-center justify-center h-full px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
            <Shield size={28} style={{ color: 'var(--accent-purple-light)' }} />
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin Panel</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Accès restreint</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="relative mb-4">
            <input
              type={showPw ? 'text' : 'password'}
              value={pw}
              onChange={e => { setPw(e.target.value); setPwError('') }}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="Mot de passe admin"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none pr-11"
              style={{ background: 'var(--bg-secondary)', border: `1px solid ${pwError ? '#ef4444' : 'var(--border)'}`, color: 'var(--text-primary)' }}
            />
            <button onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {pwError && <p className="text-xs mb-3" style={{ color: '#ef4444' }}>{pwError}</p>}
          <button
            onClick={login}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
            style={{ background: 'var(--accent-purple)', color: 'white' }}
          >
            <Lock size={15} /> Accéder au panel
          </button>
        </div>
      </div>
    </div>
  )

  // ── Admin panel ───────────────────────────────────────────
  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Tool list */}
      <div className="w-72 flex flex-col flex-shrink-0 overflow-hidden" style={{ borderRight: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="px-4 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
          <Shield size={15} style={{ color: 'var(--accent-purple-light)' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Scripts ({tools.length}/{MAX_TOOLS})</span>
          <button
            onClick={addTool}
            disabled={tools.length >= MAX_TOOLS}
            className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
            style={{ background: 'var(--accent-blue)', color: 'white', opacity: tools.length >= MAX_TOOLS ? 0.4 : 1 }}
          >
            <Plus size={12} /> Ajouter
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {tools.length === 0 && (
            <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>Aucun script. Cliquez sur &quot;Ajouter&quot;.</p>
          )}
          {tools.map(tool => (
            <div
              key={tool.id}
              onClick={() => setEditTool(tool)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
              style={{
                background: editTool?.id === tool.id ? 'rgba(34,80,232,0.15)' : 'var(--bg-card)',
                border: `1px solid ${editTool?.id === tool.id ? 'rgba(34,80,232,0.4)' : 'var(--border)'}`,
              }}
            >
              <Code2 size={13} style={{ color: editTool?.id === tool.id ? 'var(--accent-blue-light)' : 'var(--text-muted)' }} />
              <span className="flex-1 text-sm truncate" style={{ color: 'var(--text-primary)' }}>{tool.name || 'Sans titre'}</span>
              <button
                onClick={e => { e.stopPropagation(); deleteTool(tool.id) }}
                className="opacity-50 hover:opacity-100 transition-opacity"
                style={{ color: '#ef4444' }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Editor + settings */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <h2 className="font-semibold text-sm flex-1" style={{ color: 'var(--text-primary)' }}>
            {editTool ? `Édition : ${editTool.name}` : 'Paramètres Admin'}
          </h2>
          {editTool && (
            <button onClick={() => setEditTool(null)} style={{ color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Alerts */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}
          {saved && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <CheckCircle size={15} /> Sauvegardé !
            </div>
          )}

          {/* Tool editor */}
          {editTool ? (
            <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nom du script</label>
                <input
                  value={editTool.name}
                  onChange={e => updateTool(editTool.id, 'name', e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <input
                  value={editTool.description}
                  onChange={e => updateTool(editTool.id, 'description', e.target.value)}
                  placeholder="Ce que fait ce script…"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Script Lua</label>
                <textarea
                  value={editTool.script}
                  onChange={e => updateTool(editTool.id, 'script', e.target.value)}
                  rows={14}
                  className="w-full rounded-xl px-4 py-3 text-sm font-mono outline-none resize-none"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          ) : (
            /* Settings */
            <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-4">
                <Link size={15} style={{ color: 'var(--accent-blue-light)' }} />
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Lien de téléchargement du plugin</p>
              </div>
              <input
                value={pluginUrl}
                onChange={e => setPluginUrl(e.target.value)}
                placeholder="https://example.com/plugin.rbxm"
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Ce lien est affiché dans la page Documentation.
              </p>
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <button
            onClick={saveAll}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: saving ? 'var(--bg-card-hover)' : 'var(--accent-blue)', color: 'white' }}
          >
            <Save size={15} /> {saving ? 'Sauvegarde…' : 'Tout sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  )
}
