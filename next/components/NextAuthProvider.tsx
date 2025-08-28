import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'

type AuthContextType = {
	user: User | null
	session: Session | null
	loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [session, setSession] = useState<Session | null>(null)
	const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<any>(null)

	useEffect(() => {
		let unsubscribe: (() => void) | undefined

    // Initialize Supabase client only in the browser
    async function init() {
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (!supabaseUrl || !supabaseAnonKey) {
        // Skip auth wiring if env is not present during build/SSR
        setLoading(false)
        return
      }
      const client = createClient(supabaseUrl, supabaseAnonKey)
      setSupabase(client)

      const { data: { subscription } } = client.auth.onAuthStateChange((_event, sess) => {
        setSession(sess)
        setUser(sess?.user ?? null)
        setLoading(false)
      })

      const { data: { session } } = await client.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      unsubscribe = () => subscription.unsubscribe()
    }

    if (typeof window !== 'undefined') {
      void init()
    }

		return () => {
      if (unsubscribe) unsubscribe()
    }
	}, [])

	return (
		<AuthContext.Provider value={{ user, session, loading }}>
			{children}
		</AuthContext.Provider>
	)
}

export function useNextAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useNextAuth must be used within NextAuthProvider')
	return ctx
}

