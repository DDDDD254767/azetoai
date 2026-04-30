'use client'
import { useState, useEffect } from 'react'
import { BookOpen, Download, ExternalLink, Code, Zap, Shield, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'

const sections = [
  {
    id: 'install',
    icon: Download,
    title: 'Installation du plugin',
    content: `1. Téléchargez le plugin via le bouton ci-dessous.
2. Dans Roblox Studio, allez dans Plugins > Manage Plugins.
3. Cliquez sur "Install from file" et sélectionnez le fichier .rbxm.
4. Le plugin AzetoAI apparaît dans la barre de plugins.`,
  },
  {
    id: 'config',
    icon: Code,
    title: 'Configuration',
    content: `Une fois installé :
1. Cliquez sur l'icône AzetoAI dans la barre de plugins.
2. Collez votre clé API (disponible dans la section "Clé API").
3. Cliquez sur "Sauvegarder" — la connexion est établie automatiquement.`,
  },
  {
    id: 'usage',
    icon: MessageSquare,
    title: 'Utilisation du chat',
    content: `Vous pouvez demander à AzetoAI :
• Écrire des scripts Lua complets pour votre jeu
• Déboguer votre code existant
• Expliquer des concepts Roblox (DataStore, RemoteEvent, etc.)
• Optimiser vos scripts pour la performance
• Générer des systèmes (inventaire, combat, UI, etc.)`,
  },
  {
    id: 'api',
    icon: Zap,
    title: 'API Reference',
    content: `Endpoint : POST /api/plugin/chat
Headers  : Authorization: Bearer <API_KEY>
           Content-Type: application/json

Body :
{
  "message": "Votre question ici",
  "context": "Contexte optionnel (script actif, etc.)"
}

Réponse :
{
  "reply": "Réponse de l'IA"
}

Codes d'erreur :
• 401 — Clé API invalide ou absente
• 403 — Accès refusé
• 429 — Trop de requêtes
• 500 — Erreur serveur`,
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Sécurité',
    content: `• Votre clé API est unique et liée à votre compte.
• Ne partagez jamais votre clé API publiquement.
• En cas de compromission, régénérez-la dans "Clé API".
• Les messages sont chiffrés en transit (HTTPS).
• Nous ne stockons pas l'historique de vos conversations.`,
  },
]

export default function DocsPage() {
  const [open, setOpen]     = useState<string | null>('install')
  const [pluginUrl, setPluginUrl] = useState('https://example.com/azetoai-plugin.rbxm')

  useEffect(() => {
    // Load plugin URL from settings
    fetch('/api/settings/plugin-url')
      .then(r => r.json())
      .then(d => { if (d.url) setPluginUrl(d.url) })
      .catch(() => {})
  }, [])

  const toggle = (id: string) => setOpen(o => o === id ? null : id)

  return (
    <div className="h-full overflow-y-auto px-6 py-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(34,80,232,0.15)', border: '1px solid rgba(34,80,232,0.3)' }}>
            <BookOpen size={18} style={{ color: 'var(--accent-blue-light)' }} />
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Documentation</h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Tout ce dont vous avez besoin pour intégrer AzetoAI dans Roblox Studio.
        </p>
      </div>

      {/* Download banner */}
      <div
        className="rounded-2xl p-5 mb-6 flex items-center gap-4"
        style={{
          background: 'linear-gradient(135deg, rgba(34,80,232,0.15), rgba(124,58,237,0.1))',
          border: '1px solid rgba(34,80,232,0.3)',
        }}
      >
        <div className="flex-1">
          <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Plugin Roblox Studio</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Version la plus récente d&apos;AzetoAI pour Roblox Studio
          </p>
        </div>
        <a
          href={pluginUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'var(--accent-blue)', color: 'white', textDecoration: 'none' }}
        >
          <Download size={15} /> Télécharger
        </a>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <a
          href="https://create.roblox.com/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 rounded-xl transition-all group"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', textDecoration: 'none' }}
        >
          <ExternalLink size={16} style={{ color: 'var(--accent-blue-light)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Docs Roblox</span>
        </a>
        <a
          href="https://luau.org"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 rounded-xl transition-all"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', textDecoration: 'none' }}
        >
          <Code size={16} style={{ color: 'var(--accent-purple-light)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Luau Reference</span>
        </a>
      </div>

      {/* Accordion sections */}
      <div className="space-y-3">
        {sections.map(({ id, icon: Icon, title, content }) => (
          <div
            key={id}
            className="rounded-2xl overflow-hidden transition-all"
            style={{ background: 'var(--bg-card)', border: `1px solid ${open === id ? 'rgba(34,80,232,0.4)' : 'var(--border)'}` }}
          >
            <button
              onClick={() => toggle(id)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left transition-all"
            >
              <Icon size={16} style={{ color: open === id ? 'var(--accent-blue-light)' : 'var(--text-muted)' }} />
              <span className="flex-1 font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{title}</span>
              {open === id ? <ChevronUp size={15} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} />}
            </button>
            {open === id && (
              <div className="px-5 pb-5">
                <div
                  className="rounded-xl p-4 text-sm leading-relaxed font-mono whitespace-pre-wrap"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  {content}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
        AzetoAI v1.0 — Support : admin@azetoai.com
      </p>
    </div>
  )
}
