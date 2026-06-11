// app/components/PushNotificationButton.tsx
'use client'

import { useState } from 'react'
import { Bell, BellRing, Loader2 } from 'lucide-react'
import { usePushNotifications } from '@/context/PushNotificationContext'
import { useAuth } from '@/context/AuthContext'

export default function PushNotificationButton() {
  const { isAuthenticated } = useAuth()
  const { isSupported, isSubscribed, isInitialized, toggle, error } = usePushNotifications()
  const [loading, setLoading] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const handleClick = async () => {
    if (!isAuthenticated || loading) return
    
    setLoading(true)
    try {
      await toggle()
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 3000)
    } catch (err) {
      console.error('Erreur toggle:', err)
    } finally {
      setLoading(false)
    }
  }

  // Ne pas afficher si les notifications ne sont pas supportées
  if (!isSupported || !isInitialized) return null

  // Ne pas afficher si l'utilisateur n'est pas connecté
  if (!isAuthenticated) return null

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`
          relative p-2 rounded-lg transition-all duration-200
          ${isSubscribed 
            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title={isSubscribed ? 'Notifications activées' : 'Activer les notifications'}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isSubscribed ? (
          <BellRing className="h-5 w-5" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full mb-2 right-0">
          <div className={`
            px-3 py-2 rounded-lg text-xs font-medium text-white shadow-lg
            ${isSubscribed ? 'bg-green-500' : 'bg-gray-700'}
          `}>
            {isSubscribed ? '✅ Notifications activées' : '🔕 Notifications désactivées'}
            <div className="absolute top-full right-4 w-2 h-2 bg-inherit transform rotate-45" />
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="absolute bottom-full mb-2 right-0">
          <div className="px-3 py-2 rounded-lg text-xs font-medium text-white bg-red-500 shadow-lg">
            {error}
            <div className="absolute top-full right-4 w-2 h-2 bg-red-500 transform rotate-45" />
          </div>
        </div>
      )}
    </div>
  )
}