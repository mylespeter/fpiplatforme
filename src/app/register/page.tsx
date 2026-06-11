// app/register/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, ArrowRight, Mail, Phone, UserCircle, Building2, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Loader } from '@/components/ui/Loader'
import Link from 'next/link'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    telephone: '',
    genre: ''
  })
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Effacer l'erreur du champ modifié
    if (fieldErrors[e.target.name]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: ''
      })
    }
    setError('')
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.username.trim()) {
      errors.username = 'Le nom d\'utilisateur est requis'
    }
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format d\'email invalide'
    }
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis'
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

// Dans app/register/page.tsx, modifie la fonction handleSubmit :

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  setSuccessMessage('')

  if (!validateForm()) {
    setError('Veuillez corriger les erreurs ci-dessous')
    return
  }

  setLoading(true)

  try {
    // Vérifier si l'email existe déjà
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', formData.email.toLowerCase().trim())
      .single()

    if (existingUser) {
      setError('Cet email est déjà utilisé')
      setFieldErrors({ email: 'Cet email est déjà utilisé' })
      setLoading(false)
      return
    }

    // Créer le compte promoteur
    const { error: insertError } = await supabase
      .from('users')
      .insert([
        {
          username: formData.username,
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          role: 'promoteur',
          telephone: formData.telephone || null,
          genre: formData.genre || null,
          email_verified: false
        }
      ])

    if (insertError) {
      setError('Erreur lors de l\'inscription')
      setLoading(false)
      return
    }

    // Envoyer le code de vérification
    const response = await fetch('/api/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email.toLowerCase().trim(),
        username: formData.username
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error)
    }

    setSuccessMessage('Compte créé ! Redirection vers la vérification...')
    
    setTimeout(() => {
      router.push(`/verify-email?email=${encodeURIComponent(formData.email.toLowerCase().trim())}`)
    }, 1500)

  } catch (err: any) {
    setError(err.message || 'Une erreur est survenue')
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Logo et titre */}

          {/* Carte d'inscription */}
          <div className="text-center mb-8">
            <div className="4">
           <img src='logo.png' className='h-auto w-32 mx-auto'/>
          
          </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* En-tête de la carte */}
            <div className="bg-gradient-to-r from-primary to-primary/80 px-8 py-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <UserPlus className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Inscription Promoteur</h2>
                  <p className="text-sm text-white/80 mt-0.5">
                    Créez votre compte pour accéder à la plateforme
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Message de succès */}
              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              )}

              {/* Message d'erreur */}
              {error && !Object.keys(fieldErrors).length && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Grille de champs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nom d'utilisateur */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom d'utilisateur <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserCircle className={`h-5 w-5 ${fieldErrors.username ? 'text-red-400' : 'text-gray-400'}`} />
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm ${
                          fieldErrors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Votre nom complet"
                        required
                      />
                      {fieldErrors.username && (
                        <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className={`h-5 w-5 ${fieldErrors.email ? 'text-red-400' : 'text-gray-400'}`} />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm ${
                          fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="exemple@email.com"
                        required
                      />
                      {fieldErrors.email && (
                        <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="+243 XXX XXX XXX"
                      />
                    </div>
                  </div>

                  {/* Mot de passe */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className={`h-5 w-5 ${fieldErrors.password ? 'text-red-400' : 'text-gray-400'}`} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm ${
                          fieldErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                      {fieldErrors.password && (
                        <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
                      )}
                    </div>
                  </div>

                  {/* Genre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Genre
                    </label>
                    <select
                      name="genre"
                      value={formData.genre}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm bg-white"
                    >
                      <option value="">Sélectionnez votre genre</option>
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                </div>

                {/* Bouton d'inscription */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <Loader size="sm" />
                        <span className="ml-2">Création du compte en cours...</span>
                      </>
                    ) : (
                      <>
                        Créer mon compte
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Lien de connexion */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Déjà un compte ?{' '}
                    <Link 
                      href="/login" 
                      className="text-primary hover:text-primary/80 font-medium inline-flex items-center"
                    >
                      Se connecter
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="mt-6 bg-blue-50 rounded-xl p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Information importante
                    </h3>
                    <p className="mt-1 text-xs text-blue-600">
                      En créant un compte promoteur, vous pourrez soumettre vos projets industriels et suivre leur évolution sur la plateforme FPI.
                    </p>
                  </div>
                </div>
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