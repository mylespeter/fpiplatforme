// lib/push-notification.ts
'use client'

// Types
export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface NotificationPayload {
  title: string
  body: string
  url?: string
  icon?: string
  image?: string
  type?: 'info' | 'success' | 'warning' | 'error' | 'paiement' | 'document' | 'validation'
  notificationId?: number
  projetId?: number
  requireInteraction?: boolean
  vibrate?: number[]
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

// État détaillé des notifications
export interface PushState {
  isSupported: boolean
  isSubscribed: boolean
  permission: NotificationPermission
  error: string | null
  subscription: PushSubscription | null
  swRegistration: ServiceWorkerRegistration | null
}

// Gestionnaire de notifications push
class PushNotificationManager {
  private publicVapidKey: string
  private swRegistration: ServiceWorkerRegistration | null = null
  private _isSubscribed: boolean = false
  private _subscription: PushSubscription | null = null
  private _stateListeners: Array<(state: PushState) => void> = []

  constructor() {
    this.publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
    if (typeof window !== 'undefined') {
      this.init()
    }
  }

  get isSubscribed(): boolean {
    return this._isSubscribed
  }

  get subscription(): PushSubscription | null {
    return this._subscription
  }

  // Obtenir l'état complet
  getState(): PushState {
    return {
      isSupported: this.isSupported(),
      isSubscribed: this._isSubscribed,
      permission: typeof Notification !== 'undefined' ? Notification.permission : 'default',
      error: null,
      subscription: this._subscription,
      swRegistration: this.swRegistration
    }
  }

  // Écouter les changements d'état
  onStateChange(listener: (state: PushState) => void) {
    this._stateListeners.push(listener)
    return () => {
      this._stateListeners = this._stateListeners.filter(l => l !== listener)
    }
  }

  private notifyStateChange() {
    const state = this.getState()
    this._stateListeners.forEach(listener => listener(state))
  }

  // Vérifier si les notifications sont supportées
  isSupported(): boolean {
    if (typeof window === 'undefined') return false
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  }

  // Obtenir l'état de la permission
  getPermission(): NotificationPermission {
    if (typeof Notification === 'undefined') return 'default'
    return Notification.permission
  }

  // Initialiser le Service Worker
  async init(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('⚠️ Les notifications push ne sont pas supportées par ce navigateur')
      this.notifyStateChange()
      return false
    }

    try {
      // Enregistrer le Service Worker
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      
      console.log('✅ Service Worker enregistré avec succès')
      console.log('📋 Scope:', this.swRegistration.scope)

      // Vérifier l'état de l'abonnement
      this._subscription = await this.swRegistration.pushManager.getSubscription()
      this._isSubscribed = this._subscription !== null

      console.log('📊 État abonnement:', {
        isSubscribed: this._isSubscribed,
        permission: Notification.permission,
        endpoint: this._subscription?.endpoint?.substring(0, 50) + '...'
      })

      this.notifyStateChange()
      return true
    } catch (error) {
      console.error('❌ Erreur initialisation Service Worker:', error)
      this.notifyStateChange()
      return false
    }
  }

  // Conversion clé VAPID - CORRIGÉE
  private urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Demander la permission et s'abonner
  async subscribe(userId: string): Promise<boolean> {
    if (!this.swRegistration) {
      console.error('❌ Service Worker non enregistré')
      throw new Error('Service Worker non enregistré. Rechargez la page.')
    }

    try {
      // Demander la permission
      console.log('🔐 Demande de permission...')
      const permission = await Notification.requestPermission()
      console.log('📋 Permission obtenue:', permission)
      
      if (permission !== 'granted') {
        console.warn('❌ Permission refusée:', permission)
        throw new Error(
          permission === 'denied' 
            ? 'Notifications bloquées. Autorisez-les dans les paramètres du navigateur.' 
            : 'Permission refusée'
        )
      }

      console.log('🔑 Clé VAPID utilisée:', this.publicVapidKey.substring(0, 20) + '...')
      
      // S'abonner
      const applicationServerKey = this.urlBase64ToUint8Array(this.publicVapidKey)
      console.log('🔧 Clé convertie en Uint8Array, longueur:', applicationServerKey.length)
      
      this._subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      })

      console.log('✅ Abonnement Push créé:', {
        endpoint: this._subscription.endpoint.substring(0, 50) + '...',
        expirationTime: this._subscription.expirationTime
      })

      // Sauvegarder l'abonnement sur le serveur
      const subscriptionJSON = this._subscription.toJSON()
      console.log('💾 Sauvegarde sur le serveur...')
      
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          subscription: subscriptionJSON
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur serveur lors de la sauvegarde')
      }

      this._isSubscribed = true
      console.log('🎉 Abonnement push complètement activé !')
      this.notifyStateChange()
      return true
    } catch (error) {
      console.error('❌ Erreur détaillée abonnement:', error)
      this._isSubscribed = false
      this._subscription = null
      this.notifyStateChange()
      throw error
    }
  }

  // Se désabonner
  async unsubscribe(userId: string): Promise<boolean> {
    if (!this._subscription) {
      console.log('Aucun abonnement à supprimer')
      return true
    }

    try {
      console.log('🗑️ Désabonnement...')
      await this._subscription.unsubscribe()

      const endpoint = this._subscription.endpoint
      
      console.log('💾 Suppression côté serveur...')
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          endpoint
        })
      })

      this._isSubscribed = false
      this._subscription = null
      console.log('✅ Désabonnement réussi')
      this.notifyStateChange()
      return true
    } catch (error) {
      console.error('❌ Erreur désabonnement:', error)
      this.notifyStateChange()
      return false
    }
  }

  // Basculer l'abonnement
  async toggleSubscription(userId: string): Promise<boolean> {
    console.log('🔄 Toggle subscription, état actuel:', this._isSubscribed)
    
    if (this._isSubscribed) {
      return await this.unsubscribe(userId)
    } else {
      return await this.subscribe(userId)
    }
  }

  // Test d'envoi de notification
  async testNotification(userId: string): Promise<boolean> {
    if (!this._isSubscribed) {
      console.warn('⚠️ Non abonné, impossible de tester')
      return false
    }

    try {
      console.log('🧪 Envoi notification de test...')
      
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          userId,
          notification: {
            title: '🔔 Test de notification',
            body: 'Si vous voyez ce message, les notifications push fonctionnent !',
            url: window.location.href,
            type: 'info',
            icon: '/icons/icon-192x192.png',
            requireInteraction: true,
            vibrate: [200, 100, 200, 100, 200]
          }
        })
      })

      const result = await response.json()
      console.log('📬 Résultat test:', result)
      
      return result.success
    } catch (error) {
      console.error('❌ Erreur test notification:', error)
      return false
    }
  }
}

// Instance singleton
let pushManagerInstance: PushNotificationManager | null = null

export function getPushManager(): PushNotificationManager {
  if (typeof window === 'undefined') {
    // Retourner une instance factice pour le SSR
    return new Proxy({} as PushNotificationManager, {
      get: () => () => console.warn('PushManager non disponible côté serveur')
    })
  }
  
  if (!pushManagerInstance) {
    pushManagerInstance = new PushNotificationManager()
  }
  return pushManagerInstance
}

export default PushNotificationManager