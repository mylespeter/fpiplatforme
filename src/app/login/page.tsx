

// // app/login/page.tsx
// 'use client'

// import { useState } from 'react'
// import { useAuth } from '@/context/AuthContext'
// import { supabase } from '@/lib/supabase'
// import { useRouter } from 'next/navigation'
// import { Lock, Eye, EyeOff, ArrowRight, Mail, Building2, AlertCircle, UserPlus, Sparkles } from 'lucide-react'
// import { Loader } from '@/components/ui/Loader'
// import Link from 'next/link'

// export default function LoginPage() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [error, setError] = useState('')
//   const [errorType, setErrorType] = useState<'email' | 'password' | 'general' | ''>('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const { login } = useAuth()
//   const router = useRouter()

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError('')
//     setErrorType('')
//     setLoading(true)

//     if (!email.trim()) {
//       setError('Veuillez entrer votre adresse email')
//       setErrorType('email')
//       setLoading(false)
//       return
//     }

//     if (!password.trim()) {
//       setError('Veuillez entrer votre mot de passe')
//       setErrorType('password')
//       setLoading(false)
//       return
//     }

//     try {
//       const { data: userData, error: userError } = await supabase
//         .from('users')
//         .select('email, role, email_verified, username')
//         .eq('email', email.toLowerCase().trim())
//         .single()

//       if (userError || !userData) {
//         setError('Email ou mot de passe incorrect')
//         setErrorType('email')
//         setLoading(false)
//         return
//       }

//       const result = await login(email, password)
      
//       if (result.success) {
//         router.push('/dashboard')
//       } else {
//         setError(result.error || 'Email ou mot de passe incorrect')
        
//         if (result.error?.includes('email') || result.error?.includes('Email')) {
//           setErrorType('email')
//         } else if (result.error?.includes('mot de passe') || result.error?.includes('Mot de passe')) {
//           setErrorType('password')
//         } else {
//           setErrorType('general')
//         }
//       }
//     } catch (err) {
//       console.error('Erreur lors de la connexion:', err)
//       setError('Une erreur est survenue lors de la connexion')
//       setErrorType('general')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const clearError = () => {
//     setError('')
//     setErrorType('')
//   }

//   return (
//     <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
//       {/* Cercles décoratifs d'arrière-plan */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
//         <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
//       </div>

//       <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
//         <div className="w-full max-w-md">
//           {/* Logo */}
//           <div className="text-center mb-8 animate-fade-in">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl mb-4 border border-white/20">
//               <Building2 className="h-10 w-10 text-blue-400" />
//             </div>
//             <h1 className="text-3xl font-bold text-white mb-2">
//               FPI Platform
//             </h1>
//             <p className="text-blue-200/80 text-sm">
//               Fonds de Promotion de l'Industrie
//             </p>
//           </div>

//           {/* Carte de connexion */}
//           <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden animate-slide-up">
//             <div className="p-8">
//               <div className="text-center mb-6">
//                 <h2 className="text-2xl font-bold text-white">Connexion</h2>
//                 <p className="mt-2 text-sm text-blue-200">
//                   Accédez à votre espace de travail
//                 </p>
//               </div>

//               {/* Message d'erreur */}
//               {error && (
//                 <div className={`mb-6 p-4 rounded-xl border backdrop-blur-xl animate-slide-down ${
//                   errorType === 'email' || errorType === 'password' 
//                     ? 'bg-amber-500/20 border-amber-500/30' 
//                     : 'bg-red-500/20 border-red-500/30'
//                 }`}>
//                   <div className="flex items-start">
//                     <AlertCircle className={`h-5 w-5 mr-3 flex-shrink-0 ${
//                       errorType === 'email' || errorType === 'password' ? 'text-amber-400' : 'text-red-400'
//                     }`} />
//                     <div className="flex-1">
//                       <p className={`text-sm font-medium ${
//                         errorType === 'email' || errorType === 'password' ? 'text-amber-200' : 'text-red-200'
//                       }`}>
//                         {error}
//                       </p>
//                       {(errorType === 'email' || errorType === 'password') && (
//                         <div className="mt-2 text-xs text-blue-200/70">
//                           <p className="font-medium mb-1">Suggestions :</p>
//                           <ul className="list-disc list-inside space-y-0.5">
//                             {errorType === 'email' && (
//                               <>
//                                 <li>Vérifiez l'orthographe de l'email</li>
//                                 <li>Assurez-vous que le compte existe</li>
//                               </>
//                             )}
//                             {errorType === 'password' && (
//                               <>
//                                 <li>Vérifiez les majuscules/minuscules</li>
//                                 <li>Assurez-vous qu'il n'y a pas d'espaces</li>
//                               </>
//                             )}
//                           </ul>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <form onSubmit={handleSubmit} className="space-y-5">
//                 {/* Email */}
//                 <div>
//                   <label className="block text-sm font-medium text-blue-100 mb-2">
//                     Adresse email
//                   </label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <Mail className={`h-5 w-5 ${errorType === 'email' ? 'text-amber-400' : 'text-blue-400'}`} />
//                     </div>
//                     <input
//                       type="email"
//                       value={email}
//                       onChange={(e) => {
//                         setEmail(e.target.value.toLowerCase())
//                         clearError()
//                       }}
//                       className={`block w-full pl-10 pr-3 py-3 bg-white/5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-white placeholder-blue-300/50 backdrop-blur-xl ${
//                         errorType === 'email' 
//                           ? 'border-amber-400/50 bg-amber-500/5' 
//                           : 'border-white/20 hover:border-white/30'
//                       }`}
//                       placeholder="exemple@email.com"
//                       autoComplete="email"
//                     />
//                     {errorType === 'email' && (
//                       <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
//                         <AlertCircle className="h-5 w-5 text-amber-400" />
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Mot de passe */}
//                 <div>
//                   <label className="block text-sm font-medium text-blue-100 mb-2">
//                     Mot de passe
//                   </label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <Lock className={`h-5 w-5 ${errorType === 'password' ? 'text-amber-400' : 'text-blue-400'}`} />
//                     </div>
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       value={password}
//                       onChange={(e) => {
//                         setPassword(e.target.value)
//                         clearError()
//                       }}
//                       className={`block w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-white placeholder-blue-300/50 backdrop-blur-xl ${
//                         errorType === 'password' 
//                           ? 'border-amber-400/50 bg-amber-500/5' 
//                           : 'border-white/20 hover:border-white/30'
//                       }`}
//                       placeholder="••••••••"
//                       autoComplete="current-password"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                       aria-label={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
//                     >
//                       {showPassword ? (
//                         <EyeOff className="h-5 w-5 text-blue-400 hover:text-blue-300 transition-colors" />
//                       ) : (
//                         <Eye className="h-5 w-5 text-blue-400 hover:text-blue-300 transition-colors" />
//                       )}
//                     </button>
//                     {errorType === 'password' && (
//                       <div className="absolute inset-y-0 right-10 pr-3 flex items-center pointer-events-none">
//                         <AlertCircle className="h-5 w-5 text-amber-400" />
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Bouton de connexion */}
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
//                 >
//                   {loading ? (
//                     <>
//                       <Loader size="sm" />
//                       <span className="ml-2">Connexion en cours...</span>
//                     </>
//                   ) : (
//                     <>
//                       <Sparkles className="mr-2 h-5 w-5" />
//                       Se connecter
//                       <ArrowRight className="ml-2 h-5 w-5" />
//                     </>
//                   )}
//                 </button>
//               </form>

//               {/* Séparateur */}
//               <div className="mt-6">
//                 <div className="relative">
//                   <div className="absolute inset-0 flex items-center">
//                     <div className="w-full border-t border-white/10"></div>
//                   </div>
//                   <div className="relative flex justify-center text-sm">
//                     <span className="px-4 bg-transparent text-blue-200/70">
//                       Nouveau sur FPI Platform ?
//                     </span>
//                   </div>
//                 </div>
                
//                 <div className="mt-6">
//                   <Link
//                     href="/register"
//                     className="w-full flex justify-center items-center py-3 px-4 border-2 border-blue-400/50 rounded-xl shadow-lg text-sm font-medium text-blue-300 bg-transparent hover:bg-blue-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] backdrop-blur-xl"
//                   >
//                     <UserPlus className="h-5 w-5 mr-2" />
//                     Créer un compte promoteur
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="mt-8 text-center">
//             <p className="text-xs text-blue-300/50">
//               © {new Date().getFullYear()} FPI Platform. Tous droits réservés.
//             </p>
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(-10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes slideUp {
//           from { opacity: 0; transform: translateY(20px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes slideDown {
//           from { opacity: 0; transform: translateY(-10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fade-in {
//           animation: fadeIn 0.6s ease-out;
//         }
//         .animate-slide-up {
//           animation: slideUp 0.6s ease-out;
//         }
//         .animate-slide-down {
//           animation: slideDown 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   )
// }

// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, ArrowRight, Mail, Building2, AlertCircle, UserPlus, Sparkles, Fingerprint, Shield } from 'lucide-react'
import { Loader } from '@/components/ui/Loader'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [errorType, setErrorType] = useState<'email' | 'password' | 'general' | ''>('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setErrorType('')
    setLoading(true)

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

      const result = await login(email, password)
      
      if (result.success) {
        router.push('/dashboard')
      } else {
        setError(result.error || 'Email ou mot de passe incorrect')
        
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

  const clearError = () => {
    setError('')
    setErrorType('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex">
      {/* Partie gauche - Formulaire */}
      <div className="w-full flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-10">
            <div className="flex items-center space-x-3 mb-2">
              <img src='./logo.png' className='w-20 h-auto'/>
             
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FPI Platform</h1>
                <p className="text-sm text-gray-500">Fonds de Promotion de l'Industrie</p>
              </div>
            </div>
          </div>

          {/* Titre */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Bon retour 👋</h2>
            <p className="text-gray-600">
              Connectez-vous pour accéder à votre espace de travail
            </p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-slide-down">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                  {(errorType === 'email' || errorType === 'password') && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-red-700 mb-1">Suggestions :</p>
                      <ul className="text-xs text-red-600 space-y-1 list-disc list-inside">
                        {errorType === 'email' && (
                          <>
                            <li>Vérifiez l'orthographe de votre email</li>
                            <li>Assurez-vous que le compte existe</li>
                          </>
                        )}
                        {errorType === 'password' && (
                          <>
                            <li>Vérifiez les majuscules et minuscules</li>
                            <li>Vérifiez qu'il n'y a pas d'espaces</li>
                          </>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${errorType === 'email' ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value.toLowerCase())
                    clearError()
                  }}
                  className={`block w-full pl-11 pr-4 py-3.5 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-gray-900 placeholder-gray-400 shadow-sm ${
                    errorType === 'email' 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="exemple@email.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
           
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${errorType === 'password' ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    clearError()
                  }}
                  className={`block w-full pl-11 pr-12 py-3.5 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-gray-900 placeholder-gray-400 shadow-sm ${
                    errorType === 'password' 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  aria-label={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                Se souvenir de moi
              </label>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:translate-y-[-1px] active:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader size="sm" />
                  <span className="ml-2">Connexion en cours...</span>
                </>
              ) : (
                <>
                  <Fingerprint className="mr-2 h-5 w-5" />
                  Se connecter
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Séparateur */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-gray-50 via-white to-blue-50 text-gray-500">
                  Nouveau sur FPI Platform ?
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <Link
                href="/register"
                className="w-full flex justify-center items-center py-3.5 px-4 border-2 border-gray-200 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:translate-y-[-1px] active:translate-y-0"
              >
                <UserPlus className="h-5 w-5 mr-2 text-blue-600" />
                Créer un compte promoteur
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
           
            <p className="mt-2 text-xs text-gray-400">
              © {new Date().getFullYear()} FPI Platform. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>

    

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}