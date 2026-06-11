// app/context/PushNotificationContext.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getPushManager } from '@/lib/push-notification'

type PushNotificationContextType = {
  isSupported: boolean
  isSubscribed: boolean
  isInitialized: boolean
  subscribe: () => Promise<boolean>
  unsubscribe: () => Promise<boolean>
  toggle: () => Promise<boolean>
  error: string | null
}

const PushNotificationContext = createContext<PushNotificationContextType | undefined>(undefined)

export function PushNotificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const pushManager = getPushManager()
  
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSupported = pushManager.isSupported()

  // Initialiser le gestionnaire de push
  useEffect(() => {
    if (!isSupported) return

    const init = async () => {
      const success = await pushManager.init()
      if (success) {
        setIsSubscribed(pushManager.isSubscribed)
        setIsInitialized(true)
      }
    }

    init()
  }, [isSupported])

  // Mettre à jour l'état quand l'utilisateur change
  useEffect(() => {
    if (isInitialized) {
      setIsSubscribed(pushManager.isSubscribed)
    }
  }, [isInitialized, user])

  const subscribe = async (): Promise<boolean> => {
    if (!user?.id) {
      setError('Utilisateur non connecté')
      return false
    }

    setError(null)
    const success = await pushManager.subscribe(user.id)
    setIsSubscribed(success)
    
    if (!success) {
      setError('Impossible de s\'abonner aux notifications')
    }
    
    return success
  }

  const unsubscribe = async (): Promise<boolean> => {
    if (!user?.id) {
      setError('Utilisateur non connecté')
      return false
    }

    setError(null)
    const success = await pushManager.unsubscribe(user.id)
    setIsSubscribed(!success)
    return success
  }

  const toggle = async (): Promise<boolean> => {
    if (!user?.id) {
      setError('Utilisateur non connecté')
      return false
    }

    setError(null)
    const success = await pushManager.toggleSubscription(user.id)
    setIsSubscribed(pushManager.isSubscribed)
    return success
  }

  return (
    <PushNotificationContext.Provider value={{
      isSupported,
      isSubscribed,
      isInitialized,
      subscribe,
      unsubscribe,
      toggle,
      error
    }}>
      {children}
    </PushNotificationContext.Provider>
  )
}

export function usePushNotifications() {
  const context = useContext(PushNotificationContext)
  if (context === undefined) {
    throw new Error('usePushNotifications must be used within a PushNotificationProvider')
  }
  return context
}