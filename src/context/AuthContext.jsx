import { createContext, useContext, useState, useEffect } from 'react'
import { users, mockPasswords } from '../data/mockData'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('paymentbgp_user')
    if (stored) setCurrentUser(JSON.parse(stored))
    setLoading(false)
  }, [])

  const login = (email, password) => {
    if (mockPasswords[email] === password) {
      const user = users.find(u => u.email === email && u.is_active)
      if (user) {
        setCurrentUser(user)
        localStorage.setItem('paymentbgp_user', JSON.stringify(user))
        return { success: true }
      }
    }
    return { success: false, error: 'Email atau password salah' }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('paymentbgp_user')
  }

  const switchRole = (role) => {
    const roleUser = users.find(u => u.role === role && u.is_active)
    if (roleUser) {
      setCurrentUser(roleUser)
      localStorage.setItem('paymentbgp_user', JSON.stringify(roleUser))
    }
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
