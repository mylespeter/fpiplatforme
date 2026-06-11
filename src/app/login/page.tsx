// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, ArrowRight, Mail, Building2, AlertCircle, UserPlus, ShieldAlert } from 'lucide-react'
import { Loader } from '@/components/ui/Loader'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [errorType, setErrorType] = useState<'email' | 'password' | 'general' | 'unverified' | ''>('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendingCode, setResendingCode] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setErrorType('')
    setLoading(true)

    // Validation basique
    if (!email.trim()) {
      setError('Veuillez entrer votre adresse email')
      setErrorType('email')
      setLoading(false)
      return
    }

    if (!password.trim()) {
      setError('Veuillez entrer votre mot de passe')
      setErrorType('password')
      setLoading(false)
      return
    }

    try {
      // Vérifier d'abord si l'utilisateur existe et si son email est vérifié
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, role, email_verified, username')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (userError || !userData) {
        setError('Email ou mot de passe incorrect')
        setErrorType('email')
        setLoading(false)
        return
      }

      // Vérifier si l'email est vérifié pour les promoteurs
      if (userData.role === 'promoteur' && !userData.email_verified) {
        setError('Votre email n\'a pas encore été vérifié. Vérifiez votre boîte mail ou demandez un nouveau code.')
        setErrorType('unverified')
        setLoading(false)
        return
      }

      // Tenter la connexion
      const result = await login(email, password)
      
      if (result.success) {
        router.push('/dashboard')
      } else {
        setError(result.error || 'Email ou mot de passe incorrect')
        
        // Déterminer le type d'erreur
        if (result.error?.includes('email') || result.error?.includes('Email')) {
          setErrorType('email')
        } else if (result.error?.includes('mot de passe') || result.error?.includes('Mot de passe')) {
          setErrorType('password')
        } else {
          setErrorType('general')
        }
      }
    } catch (err) {
      console.error('Erreur lors de la connexion:', err)
      setError('Une erreur est survenue lors de la connexion')
      setErrorType('general')
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email || resendingCode) return
    
    setResendingCode(true)
    setError('')

    try {
      // Vérifier que l'utilisateur existe et est un promoteur
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, role, username')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (userError || !userData) {
        setError('Utilisateur non trouvé')
        setErrorType('general')
        setResendingCode(false)
        return
      }

      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          username: userData.username
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      // Rediriger vers la page de vérification
      router.push(`/verify-email?email=${encodeURIComponent(userData.email)}`)
      
    } catch (err: any) {
      setError(err.message || 'Erreur lors du renvoi du code')
      setErrorType('general')
      setResendingCode(false)
    }
  }

  const clearError = () => {
    setError('')
    setErrorType('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo et titre */}
          <div className="text-center mb-8">
            <img src='logo.png' className='h-auto w-32 mx-auto' alt="Logo FPI" />
            <p className="mt-2 text-gray-600">
              Fonds de Promotion de l'Industrie
            </p>
          </div>

          {/* Carte de connexion */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
              <p className="mt-2 text-sm text-gray-500">
                Accédez à votre espace de travail
              </p>
            </div>

            {/* Message d'erreur - Email non vérifié */}
            {errorType === 'unverified' && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start">
                  <ShieldAlert className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800">
                      Email non vérifié
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Votre compte promoteur doit être vérifié avant de vous connecter.
                    </p>
                    <button
                      onClick={handleResendVerification}
                      disabled={resendingCode}
                      className="mt-3 inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 disabled:opacity-50"
                    >
                      {resendingCode ? (
                        <>
                          <Loader size="sm"  />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Renvoyer le code de vérification
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Message d'erreur classique */}
            {error && errorType !== 'unverified' && (
              <div className={`mb-6 p-4 rounded-xl border-l-4 animate-in fade-in slide-in-from-top-2 ${
                errorType === 'email' || errorType === 'password' 
                  ? 'bg-amber-50 border-amber-500' 
                  : 'bg-red-50 border-red-500'
              }`}>
                <div className="flex items-start">
                  <AlertCircle className={`h-5 w-5 mr-3 flex-shrink-0 ${
                    errorType === 'email' || errorType === 'password' ? 'text-amber-500' : 'text-red-500'
                  }`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      errorType === 'email' || errorType === 'password' ? 'text-amber-800' : 'text-red-800'
                    }`}>
                      {error}
                    </p>
                    {(errorType === 'email' || errorType === 'password') && (
                      <div className="mt-2 text-xs text-gray-600">
                        <p className="font-medium mb-1">Suggestions :</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          {errorType === 'email' && (
                            <>
                              <li>Vérifiez l'orthographe de l'email</li>
                              <li>Assurez-vous que le compte existe</li>
                              <li>Contactez l'administrateur si nécessaire</li>
                            </>
                          )}
                          {errorType === 'password' && (
                            <>
                              <li>Vérifiez les majuscules/minuscules</li>
                              <li>Assurez-vous qu'il n'y a pas d'espaces</li>
                              <li>Vérifiez que le clavier est en français</li>
                            </>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Champ Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 ${errorType === 'email' ? 'text-amber-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value.toLowerCase())
                      clearError()
                    }}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm ${
                      errorType === 'email' 
                        ? 'border-amber-300 bg-amber-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="exemple@email.com"
                    autoComplete="email"
                    required
                  />
                  {errorType === 'email' && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Champ Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${errorType === 'password' ? 'text-amber-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      clearError()
                    }}
                    className={`block w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm ${
                      errorType === 'password' 
                        ? 'border-amber-300 bg-amber-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    aria-label={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                  {errorType === 'password' && (
                    <div className="absolute inset-y-0 right-10 pr-3 flex items-center pointer-events-none">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Bouton de connexion */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader size="sm" />
                    <span className="ml-2">Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            {/* Séparateur */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    Nouveau sur FPI Platform ?
                  </span>
                </div>
              </div>
              
              <div className="mt-6">
                <Link
                  href="/register"
                  className="w-full flex justify-center items-center py-3 px-4 border-2 border-primary rounded-xl shadow-sm text-sm font-medium text-primary bg-white hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Créer un compte promoteur
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} FPI Platform. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}