import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface User {
  id: string
  email: string
  role: 'admin' | 'pcb' | 'industry_owner'
  name: string
  verification: boolean
  industry_id?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUser(session.user.email)
      } else {
        setUser(null)
        router.push('/login')
      }
    })

    checkUser()

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const fetchUser = async (email: string | undefined) => {
    if (!email) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role, name, verification, industry_id')
        .eq('email', email)
        .single()

      if (error || !data.verification) {
        throw error
      }

      setUser(data)

      // Redirect based on role
      if (data.role === 'industry_owner') {
        router.push('/industry-dashboard')
      } else if (data.role === 'admin' || data.role === 'pcb') {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setUser(null)
      router.push('/login')
    }
  }

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await fetchUser(session.user.email)
      }
    } catch (error) {
      console.error('Error checking user:', error)
      setUser(null)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // After successful sign in, fetch user data
      await fetchUser(data.user.email)

      return { success: true, data }
    } catch (error) {
      console.error('Error signing in:', error)
      return { success: false, error: 'Invalid credentials' }
    }
  }

  const signUp = async (email: string, password: string, name: string, role: User['role']) => {
    try {
      // First create the auth user with email redirect
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role }, // Store additional user data
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })

      if (error) throw error

      // Then create the user profile
      const { error: profileError } = await supabase.from('users').insert([
        {
          id: data.user?.id,
          email,
          name,
          role,
          verification: true,
        },
      ])

      if (profileError) throw profileError

      return { success: true, data }
    } catch (error) {
      console.error('Error signing up:', error)
      return { success: false, error: 'Failed to create account' }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin: user?.role === 'admin',
    isPCB: user?.role === 'pcb',
    isIndustryOwner: user?.role === 'industry_owner'
  }
}