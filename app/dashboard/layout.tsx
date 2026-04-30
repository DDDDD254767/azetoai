'use client'
import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { User, ApiKey } from '@/types'
import {
  Bot, MessageSquare, Key, BookOpen, Shield, LogOut,
  Menu, X, ChevronRight, Zap
} from 'lucide-react'

// ── Context ──────────────────────────────────────────────
interface DashCtx {
  user: User | null
  apiKey: ApiKey | null
  refreshApiKey: () => Promise<void>
}
export const DashContext = createContext<DashCtx>({ user: null, apiKey: null, refreshApiKey: async () => {} })
export const useDash = () => useContext(DashContext)

// ── Sidebar nav items ─────────────────────────────────────
const NAV = [
  { href: '/dashboard/chat',    icon: MessageSquare, label: 'Chat IA' },
  { href: '/dashboard/api-key', icon: Key,           label: 'Clé API' },
  { href: '/dashboard/docs',    icon: BookOpen,      label: 'Documentation' },
  { href: '/dashboard/admin',   icon: Shield,        label: 'Admin Panel' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()

  const [user,     setUser]     = useState<User | null>(null)
  const [apiKey,   setApiKey]   = useState<ApiKey | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [sidebar,  setSidebar]  = useState(false)

  // ── Load user + api key ───────────────────────────────
  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    const u: User = {
      id:         session.user.id,
      email:      session.user.email!,
      created_at: session.user.created_at,
    }
    setUser(u)

    const { data } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', u.id)
      .eq('is_active', true)
      .single()

    setApiKey(data ?? null)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const refreshApiKey = async () => {
    if (!user) return
    const { data } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()
    setApiKey(data ?? null)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex gap-2">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  )

  return (
    <DashContext.Provider value={{ user, apiKey, refreshApiKey }}>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>

        {/* ── Sidebar ─────────────────────────────────── */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto
            ${sidebar ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-blue)' }}>
              <Bot size={18} color="white" />
            </div>
            <span className="font-bold text-lg gradient-text">AzetoAI</span>
            <button
              onClick={() => setSidebar(false)}
              className="ml-auto lg:hidden"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {NAV.map(({ href, icon: Icon, label }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebar(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
                  style={{
                    background: active ? 'var(--accent-glow)' : 'transparent',
                    color: active ? 'var(--accent-blue-light)' : 'var(--text-secondary)',
                    border: `1px solid ${active ? 'rgba(34,80,232,0.3)' : 'transparent'}`,
                  }}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                  {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
                </Link>
              )
            })}
          </nav>

          {/* User footer */}
          <div className="px-3 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2" style={{ background: 'var(--bg-card)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--accent-blue)', color: 'white' }}>
                {user?.email?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.email}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: apiKey ? 'var(--success)' : 'var(--danger)' }} />
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {apiKey ? 'Clé active' : 'Pas de clé'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <LogOut size={15} /> Déconnexion
            </button>
          </div>
        </aside>

        {/* ── Backdrop ──────────────────────────────── */}
        {sidebar && (
          <div
            className="fixed inset-0 z-30 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setSidebar(false)}
          />
        )}

        {/* ── Main content ──────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top bar (mobile) */}
          <header className="flex items-center gap-3 px-4 py-3 lg:hidden" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => setSidebar(true)} style={{ color: 'var(--text-secondary)' }}>
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Zap size={16} style={{ color: 'var(--accent-blue-light)' }} />
              <span className="font-semibold gradient-text">AzetoAI</span>
            </div>
          </header>

          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </DashContext.Provider>
  )
}
