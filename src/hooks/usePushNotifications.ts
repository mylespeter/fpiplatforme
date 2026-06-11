// app/hooks/usePushNotifications.ts
'use client'

import { useState } from 'react'
import { usePushNotifications as usePushContext } from '@/context/PushNotificationContext'

export function usePushNotificationActions() {
  const { isSubscribed, toggle, error, isSupported } = usePushContext()
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      await toggle()
      return true
    } catch (err) {
      console.error('Erreur toggle:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    isSubscribed,
    isSupported,
    loading,
    error,
    handleToggle
  }
}