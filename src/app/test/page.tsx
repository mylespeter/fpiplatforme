// app/test-push/page.tsx
import PushTestPanel from '@/components/PushTestPanel'

export default function TestPushPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Test des Notifications Push
          </h1>
          <p className="text-gray-600">
            Vérifiez que les notifications push fonctionnent correctement
          </p>
        </div>
        
        <PushTestPanel />
        
        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">📋 Prérequis</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs">1</span>
              <p>Assurez-vous d'avoir ajouté <code className="bg-gray-100 px-2 py-0.5 rounded">NEXT_PUBLIC_VAPID_PUBLIC_KEY</code> dans votre fichier <code className="bg-gray-100 px-2 py-0.5 rounded">.env.local</code></p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs">2</span>
              <p>Vérifiez que le fichier <code className="bg-gray-100 px-2 py-0.5 rounded">public/sw.js</code> existe et est accessible</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs">3</span>
              <p>Créez la table <code className="bg-gray-100 px-2 py-0.5 rounded">push_subscriptions</code> dans votre base de données Supabase</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs">4</span>
              <p>Utilisez HTTPS (ou localhost) - les notifications push ne fonctionnent pas en HTTP non sécurisé</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}