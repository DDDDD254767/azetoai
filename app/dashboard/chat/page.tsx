'use client'
import { useState, useRef, useEffect } from 'react'
import { useDash } from '../layout'
import type { Message } from '@/types'
import { Send, Bot, User2, Sparkles, AlertCircle } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 animate-slide-up">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent-blue)', border: '1px solid rgba(34,80,232,0.4)' }}>
        <Bot size={14} color="white" />
      </div>
      <div className="rounded-2xl rounded-bl-md px-4 py-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex gap-1.5 items-center h-5">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { user, apiKey } = useDash()
  const [messages, setMessages]   = useState<Message[]>([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  const disabled = !user || !apiKey || loading

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || disabled) return

    setInput('')
    setError('')

    const userMsg: Message = { id: uuidv4(), role: 'user', content: text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch('/api/plugin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, api_key: apiKey!.key }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Erreur ${res.status}`)
      }

      const aiMsg: Message = { id: uuidv4(), role: 'assistant', content: data.reply, timestamp: new Date() }
      setMessages(prev => [...prev, aiMsg])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-blue)' }}>
          <Bot size={16} color="white" />
        </div>
        <div>
          <h1 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Chat AzetoAI</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Assistant IA pour Roblox Studio</p>
        </div>
        {apiKey && (
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }} />
            Connecté
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-3xl blur-2xl opacity-20" style={{ background: 'var(--accent-blue)' }} />
              <div className="relative w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
                <Sparkles size={32} style={{ color: 'var(--accent-blue-light)' }} />
              </div>
            </div>
            <h2 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Bonjour ! Je suis AzetoAI</h2>
            <p className="text-sm max-w-sm" style={{ color: 'var(--text-secondary)' }}>
              Posez-moi une question sur Lua, Roblox Studio, ou demandez-moi d'écrire du code pour votre jeu.
            </p>
            {!apiKey && (
              <div className="mt-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                Aucune clé API — rendez-vous dans &quot;Clé API&quot; pour en créer une.
              </div>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-3 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: msg.role === 'user' ? 'var(--accent-purple)' : 'var(--accent-blue)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(124,58,237,0.4)' : 'rgba(34,80,232,0.4)'}`,
              }}
            >
              {msg.role === 'user' ? <User2 size={14} color="white" /> : <Bot size={14} color="white" />}
            </div>

            <div
              className="max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
              style={{
                background: msg.role === 'user' ? 'var(--accent-purple)' : 'var(--bg-card)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`,
                color: 'var(--text-primary)',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                borderBottomLeftRadius: msg.role === 'user' ? '16px' : '4px',
              }}
            >
              <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
              <p className="text-xs mt-1.5 opacity-50">
                {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {loading && <TypingIndicator />}

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        <div
          className="flex items-end gap-3 rounded-2xl p-3 transition-all"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? (apiKey ? 'Chargement…' : 'Clé API requise') : 'Écrivez un message… (Entrée pour envoyer)'}
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none outline-none py-1"
            style={{
              color: 'var(--text-primary)',
              maxHeight: '120px',
              overflowY: 'auto',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={disabled || !input.trim()}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
            style={{
              background: disabled || !input.trim() ? 'var(--border)' : 'var(--accent-blue)',
              color: 'white',
            }}
          >
            <Send size={15} />
          </button>
        </div>
        <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
          Entrée pour envoyer • Maj+Entrée pour nouvelle ligne
        </p>
      </div>
    </div>
  )
}
