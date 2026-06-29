

// context/AuthContext.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export type UserRole = 'promoteur' | 'technique' | 'credit' | 'admin'

export type User = {
  id: string
  email: string
  username: string
  role: UserRole
  genre: 'M' | 'F' | null
  telephone: string | null
  photo_profil: string | null 
  created_at: string
  updated_at: string
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ 
    success: boolean
    error?: string
  }>
  logout: () => void
  updateUser: (user: User) => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const USER_STORAGE_KEY = 'FPI-user'
const SESSION_DURATION = 30 * 60 * 1000 // 30 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(USER_STORAGE_KEY)
    setUser(null)
    cleanup()
    router.push('/login')
  }, [cleanup, router])

  const setSessionTimeout = useCallback(() => {
    cleanup()
    timeoutRef.current = setTimeout(() => {
      logout()
    }, SESSION_DURATION)
  }, [cleanup, logout])

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser))
    setSessionTimeout()
  }, [setSessionTimeout])

  const login = async (email: string, password: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (userError || !userData) {
        return { 
          success: false, 
          error: 'Email ou mot de passe incorrect. Aucun utilisateur trouvé avec cet email.' 
        }
      }

      if (userData.password !== password) {
        return { 
          success: false, 
          error: 'Mot de passe incorrect.' 
        }
      }

      const validRoles: UserRole[] = ['promoteur', 'technique', 'credit', 'admin']
      if (!validRoles.includes(userData.role as UserRole)) {
        return { 
          success: false, 
          error: `Rôle utilisateur invalide: ${userData.role}` 
        }
      }

      const loggedUser: User = {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        role: userData.role as UserRole,
        telephone: userData.telephone,
        genre: userData.genre,
        photo_profil: userData.photo_profil,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      }

      setUser(loggedUser)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser))
      setSessionTimeout()

      return { success: true }

    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: 'Erreur de connexion au serveur. Veuillez réessayer.' 
      }
    }
  }

  // Vérification de l'authentification au chargement
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY)
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser) as User
          setUser(userData)
          setSessionTimeout()
        } catch (error) {
          console.error('Erreur parsing stored user:', error)
          logout()
        }
      }
      setLoading(false)
    }

    checkAuth()
    return () => cleanup()
  }, [cleanup, logout, setSessionTimeout])

  // Réinitialisation du timer sur activité
  useEffect(() => {
    if (!user) return

    const resetTimer = () => {
      cleanup()
      timeoutRef.current = setTimeout(() => {
        logout()
      }, SESSION_DURATION)
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']
    events.forEach(event => window.addEventListener(event, resetTimer, { passive: true }))

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer))
    }
  }, [user, cleanup, logout])

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout, 
      updateUser,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useRole() {
  const { user } = useAuth()
  
  return {
    isPromoteur: user?.role === 'promoteur',
    isTechnique: user?.role === 'technique',
    isCredit: user?.role === 'credit',
    isAdmin: user?.role === 'admin',
    role: user?.role,
    hasRole: (roles: UserRole | UserRole[]) => {
      if (!user) return false
      if (Array.isArray(roles)) {
        return roles.includes(user.role)
      }
      return user.role === roles
    }
  }
}