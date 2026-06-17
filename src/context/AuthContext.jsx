import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Ambil profil dari user_profiles, return null jika tidak ada
  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (error) {
      console.error('fetchProfile error:', error.message, error.details)
      return null
    }
    return data
  }

  useEffect(() => {
    // Ambil session aktif saat pertama load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        if (profile) setCurrentUser({ ...profile, authId: session.user.id })
      }
      setLoading(false)
    })

    // Dengarkan perubahan auth state (refresh token, tab baru, dll)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null)
      }
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { success: false, error: 'Email atau password salah' }

    const profile = await fetchProfile(data.user.id)
    if (!profile) {
      await supabase.auth.signOut()
      return { success: false, error: 'Profil pengguna tidak ditemukan. Hubungi Admin.' }
    }
    if (!profile.is_active) {
      await supabase.auth.signOut()
      return { success: false, error: 'Akun tidak aktif. Hubungi Admin.' }
    }

    setCurrentUser({ ...profile, authId: data.user.id })
    return { success: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
