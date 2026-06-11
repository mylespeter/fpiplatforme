// app/components/PushTestPanel.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  Bell, BellRing, BellOff, TestTube, AlertCircle, 
  CheckCircle, XCircle, Loader2, Info, Settings,
  Smartphone, Wifi, WifiOff, Shield, Key
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getPushManager, PushState } from '@/lib/push-notification'

type TestStep = {
  name: string
  status: 'idle' | 'running' | 'success' | 'error'
  message: string
  details?: string
}

export default function PushTestPanel() {
  const { user } = useAuth()
  const pushManager = getPushManager()
  
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [testSteps, setTestSteps] = useState<TestStep[]>([
    { name: 'Support navigateur', status: 'idle', message: 'Vérification du navigateur...' },
    { name: 'Service Worker', status: 'idle', message: 'Enregistrement du SW...' },
    { name: 'Permission', status: 'idle', message: 'Vérification des permissions...' },
    { name: 'Clé VAPID', status: 'idle', message: 'Vérification de la clé...' },
    { name: 'Abonnement', status: 'idle', message: 'Création de l\'abonnement...' },
    { name: 'Envoi test', status: 'idle', message: 'Envoi d\'une notification test...' }
  ])
  const [diagnostic, setDiagnostic] = useState<any>(null)
  const [currentState, setCurrentState] = useState<PushState | null>(null)

  useEffect(() => {
    // Écouter les changements d'état
    const unsubscribe = pushManager.onStateChange((state) => {
      setCurrentState(state)
    })

    // Mettre à jour l'état initial
    setCurrentState(pushManager.getState())

    return () => unsubscribe()
  }, [])

  const updateStep = (index: number, status: 'running' | 'success' | 'error', message: string, details?: string) => {
    setTestSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, status, message, details } : step
    ))
  }

  const runFullTest = async () => {
    if (!user?.id) {
      alert('Vous devez être connecté pour tester les notifications')
      return
    }

    setLoading(true)
    setDiagnostic(null)
    
    // Réinitialiser les étapes
    setTestSteps(prev => prev.map(step => ({ ...step, status: 'idle' as const, message: '' })))

    try {
      // Étape 1 : Support navigateur
      updateStep(0, 'running', 'Vérification du support navigateur...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const isSupported = pushManager.isSupported()
      const browserInfo = {
        userAgent: navigator.userAgent,
        serviceWorker: 'serviceWorker' in navigator,
        pushManager: 'PushManager' in window,
        notification: 'Notification' in window
      }
      
      if (isSupported) {
        updateStep(0, 'success', '✅ Navigateur compatible', JSON.stringify(browserInfo, null, 2))
      } else {
        updateStep(0, 'error', '❌ Navigateur non compatible', JSON.stringify(browserInfo, null, 2))
        setDiagnostic({ error: 'Navigateur non compatible', browserInfo })
        return
      }

      // Étape 2 : Service Worker
      updateStep(1, 'running', 'Enregistrement du Service Worker...')
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const swRegistration = await navigator.serviceWorker.getRegistration()
      if (swRegistration) {
        updateStep(1, 'success', '✅ Service Worker actif', 
          `Scope: ${swRegistration.scope}\nState: ${swRegistration.active?.state}`
        )
      } else {
        updateStep(1, 'error', '❌ Service Worker non trouvé', 'Vérifiez que /public/sw.js existe')
        return
      }

      // Étape 3 : Permission
      updateStep(2, 'running', 'Vérification de la permission...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const permission = Notification.permission
      if (permission === 'granted') {
        updateStep(2, 'success', '✅ Permission déjà accordée')
      } else if (permission === 'denied') {
        updateStep(2, 'error', '❌ Permission bloquée', 
          'Allez dans les paramètres du navigateur pour autoriser les notifications'
        )
        return
      } else {
        updateStep(2, 'success', '⚠️ Permission non demandée', 'Nous allons la demander maintenant')
      }

      // Étape 4 : Clé VAPID
      updateStep(3, 'running', 'Vérification de la clé VAPID...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (vapidKey && vapidKey.length > 0) {
        updateStep(3, 'success', '✅ Clé VAPID présente', 
          `Longueur: ${vapidKey.length} caractères\nDébut: ${vapidKey.substring(0, 20)}...`
        )
      } else {
        updateStep(3, 'error', '❌ Clé VAPID manquante', 
          'Ajoutez NEXT_PUBLIC_VAPID_PUBLIC_KEY dans .env.local'
        )
        return
      }

      // Étape 5 : Abonnement
      updateStep(4, 'running', 'Création de l\'abonnement...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      try {
        const subscribed = await pushManager.subscribe(user.id)
        if (subscribed) {
          const sub = pushManager.subscription
          updateStep(4, 'success', '✅ Abonnement créé avec succès', 
            `Endpoint: ${sub?.endpoint.substring(0, 60)}...\nExpiration: ${sub?.expirationTime || 'Jamais'}`
          )
        }
      } catch (error: any) {
        updateStep(4, 'error', '❌ Échec de l\'abonnement', error.message)
        return
      }

      // Étape 6 : Test d'envoi
      updateStep(5, 'running', 'Envoi d\'une notification test...')
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const testResult = await pushManager.testNotification(user.id)
      if (testResult) {
        updateStep(5, 'success', '✅ Notification envoyée ! Vérifiez votre écran.')
      } else {
        updateStep(5, 'error', '⚠️ Notification envoyée mais pas reçue', 
          'Vérifiez que les notifications système sont activées'
        )
      }

      setDiagnostic({
        success: true,
        time: new Date().toISOString(),
        state: pushManager.getState()
      })

    } catch (error: any) {
      console.error('Erreur test complet:', error)
      setDiagnostic({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'running': return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />
      default: return <Info className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Bouton d'ouverture */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <TestTube className="h-6 w-6" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">Tester les notifications push</h3>
            <p className="text-sm text-blue-100">Vérifier que tout fonctionne correctement</p>
          </div>
        </div>
        <Settings className={`h-6 w-6 transition-transform ${isVisible ? 'rotate-90' : ''}`} />
      </button>

      {/* Panneau de test */}
      {isVisible && (
        <div className="mt-4 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          {/* En-tête */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Diagnostic Push</h2>
              <div className="flex items-center gap-2">
                {currentState && (
                  <>
                    {currentState.isSupported ? (
                      <Wifi className="h-5 w-5 text-green-500" />
                    ) : (
                      <WifiOff className="h-5 w-5 text-red-500" />
                    )}
                    {currentState.permission === 'granted' ? (
                      <Shield className="h-5 w-5 text-green-500" />
                    ) : currentState.permission === 'denied' ? (
                      <Shield className="h-5 w-5 text-red-500" />
                    ) : (
                      <Shield className="h-5 w-5 text-yellow-500" />
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* Barre de statut rapide */}
            <div className="flex gap-2 text-xs">
              <span className={`px-2 py-1 rounded-full ${
                currentState?.isSupported ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {currentState?.isSupported ? '✅ Supporté' : '❌ Non supporté'}
              </span>
              <span className={`px-2 py-1 rounded-full ${
                currentState?.permission === 'granted' ? 'bg-green-100 text-green-700' :
                currentState?.permission === 'denied' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                Permission: {currentState?.permission || 'inconnue'}
              </span>
              <span className={`px-2 py-1 rounded-full ${
                currentState?.isSubscribed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {currentState?.isSubscribed ? '🔔 Abonné' : '🔕 Non abonné'}
              </span>
            </div>
          </div>

          {/* Étapes de test */}
          <div className="p-4 space-y-3">
            {testSteps.map((step, index) => (
              <div key={index} className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-3">
                  {getStepIcon(step.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-gray-900">
                        Étape {index + 1}: {step.name}
                      </span>
                      {step.status === 'running' && (
                        <span className="text-xs text-blue-600 animate-pulse">En cours...</span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${
                      step.status === 'error' ? 'text-red-600' :
                      step.status === 'success' ? 'text-green-600' :
                      'text-gray-600'
                    }`}>
                      {step.message}
                    </p>
                    {step.details && (
                      <pre className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 overflow-x-auto">
                        {step.details}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
            <button
              onClick={runFullTest}
              disabled={loading || !user}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Test en cours...
                </>
              ) : (
                <>
                  <TestTube className="h-5 w-5" />
                  Lancer le test complet
                </>
              )}
            </button>

            {!user && (
              <p className="text-sm text-red-600 text-center">
                ⚠️ Vous devez être connecté pour tester
              </p>
            )}

            {/* Boutons rapides */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => pushManager.toggleSubscription(user?.id || '')}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm"
              >
                {currentState?.isSubscribed ? (
                  <>
                    <BellOff className="h-4 w-4" />
                    Désabonner
                  </>
                ) : (
                  <>
                    <BellRing className="h-4 w-4" />
                    S'abonner
                  </>
                )}
              </button>
              
              <button
                onClick={() => pushManager.testNotification(user?.id || '')}
                disabled={!currentState?.isSubscribed}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 transition-all text-sm"
              >
                <Bell className="h-4 w-4" />
                Test rapide
              </button>
            </div>

            {/* Diagnostic complet */}
            {diagnostic && (
              <div className={`p-3 rounded-lg text-sm ${
                diagnostic.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
              }`}>
                <p className="font-medium mb-1">
                  {diagnostic.error ? '❌ Erreur' : '✅ Succès'}
                </p>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(diagnostic, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Aide */}
          <div className="p-4 bg-blue-50 border-t border-blue-100">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Comment activer les notifications ?</p>
                <ul className="list-disc list-inside space-y-1 text-blue-600">
                  <li>Chrome : Paramètres → Confidentialité → Notifications</li>
                  <li>Firefox : Préférences → Vie privée → Notifications</li>
                  <li>Mobile : Paramètres → Applications → Navigateur → Notifications</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}