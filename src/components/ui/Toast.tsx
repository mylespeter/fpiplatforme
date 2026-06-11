// components/ui/Toast.tsx
'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

type ToastProps = {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

export function Toast({ message, type = 'info', duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Animation d'entrée
    setTimeout(() => setIsVisible(true), 50)

    // Auto-fermeture
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  }

  const progressColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }

  const Icon = icons[type]

  return (
    <div
      className={`fixed top-4 right-4 z-[100] transition-all duration-300 ease-out ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg min-w-[320px] max-w-[420px] backdrop-blur-sm ${colors[type]}`}
      >
        <div className={`flex-shrink-0 ${iconColors[type]}`}>
          <Icon className="h-5 w-5" />
        </div>
        
        <p className="flex-1 text-sm font-medium leading-5">{message}</p>
        
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Barre de progression */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 rounded-b-xl overflow-hidden">
        <div
          className={`h-full rounded-full animate-shrink ${progressColors[type]}`}
          style={{
            animation: `shrink ${duration}ms linear forwards`,
          }}
        />
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

// Container pour gérer plusieurs toasts
export function ToastContainer() {
  const [toasts, setToasts] = useState<Array<{
    id: string
    message: string
    type: ToastType
  }>>([])

  useEffect(() => {
    // Écouter les événements toast
    const handleToast = (event: CustomEvent) => {
      const { message, type } = event.detail
      const id = Date.now().toString()
      setToasts((prev) => [...prev, { id, message, type }])
    }

    window.addEventListener('show-toast' as any, handleToast)
    return () => window.removeEventListener('show-toast' as any, handleToast)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            top: `${1 + index * 5}rem`,
            zIndex: 100 + toasts.length - index,
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </>
  )
}

// Fonction utilitaire pour afficher un toast
export function showToast(message: string, type: ToastType = 'info') {
  window.dispatchEvent(
    new CustomEvent('show-toast', {
      detail: { message, type },
    })
  )
}