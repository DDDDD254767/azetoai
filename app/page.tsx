'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboard/chat')
      } else {
        router.push('/login')
      }
    })
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex gap-2">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  )
}
