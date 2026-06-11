// app/test-db/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDBPage() {
  const [results, setResults] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setResults('Test en cours...')
    
    try {
      // Test 1: Vérifier la connexion
      const { data: users, error } = await supabase
        .from('users')
        .select('id, username, email, role, password')
      
      if (error) {
        setResults(`Erreur de connexion: ${error.message}`)
        return
      }

      if (!users || users.length === 0) {
        setResults('Connexion OK mais aucun utilisateur dans la base de données')
        return
      }

      // Afficher tous les utilisateurs
      let resultText = `✅ Connexion réussie!\n\n${users.length} utilisateur(s) trouvé(s):\n\n`
      
      users.forEach((user, index) => {
        resultText += `${index + 1}. ${user.username}\n`
        resultText += `   Email: ${user.email}\n`
        resultText += `   Rôle: ${user.role}\n`
        resultText += `   Password: ${user.password}\n\n`
      })

      // Test de connexion simulé
      resultText += `\n📝 Test de connexion avec admin@example.com / password123:\n`
      const adminUser = users.find(u => u.email === 'admin@example.com')
      if (adminUser) {
        resultText += `   Email trouvé: ✅\n`
        resultText += `   Password correspond: ${adminUser.password === 'password123' ? '✅' : '❌ (password stocké: ' + adminUser.password + ')'}\n`
      } else {
        resultText += `   ❌ Email admin@example.com non trouvé\n`
      }

      setResults(resultText)
    } catch (err) {
      setResults(`Erreur: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test de connexion Base de données</h1>
        
        <button
          onClick={testConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-6"
        >
          {loading ? 'Test en cours...' : 'Tester la connexion'}
        </button>

        {results && (
          <div className="bg-white rounded-lg shadow p-6">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {results}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}