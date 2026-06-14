


// // app/register/page.tsx
// 'use client'

// import { useState } from 'react'
// import { supabase } from '@/lib/supabase'
// import { useRouter } from 'next/navigation'
// import { Lock, Eye, EyeOff, ArrowRight, Mail, Phone, UserCircle, Building2, UserPlus, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react'
// import { Loader } from '@/components/ui/Loader'
// import Link from 'next/link'

// export default function RegisterPage() {
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     password: '',
//     telephone: '',
//     genre: ''
//   })
//   const [error, setError] = useState('')
//   const [successMessage, setSuccessMessage] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
//   const router = useRouter()

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     })
//     if (fieldErrors[e.target.name]) {
//       setFieldErrors({
//         ...fieldErrors,
//         [e.target.name]: ''
//       })
//     }
//     setError('')
//   }

//   const validateForm = () => {
//     const errors: Record<string, string> = {}
    
//     if (!formData.username.trim()) {
//       errors.username = 'Le nom d\'utilisateur est requis'
//     } else if (formData.username.trim().length < 3) {
//       errors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères'
//     }
    
//     if (!formData.email.trim()) {
//       errors.email = 'L\'email est requis'
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       errors.email = 'Format d\'email invalide'
//     }
    
//     if (!formData.password) {
//       errors.password = 'Le mot de passe est requis'
//     } else if (formData.password.length < 6) {
//       errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
//     }
    
//     setFieldErrors(errors)
//     return Object.keys(errors).length === 0
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError('')
//     setSuccessMessage('')

//     if (!validateForm()) {
//       setError('Veuillez corriger les erreurs ci-dessous')
//       return
//     }

//     setLoading(true)

//     try {
//       const { data: existingUser } = await supabase
//         .from('users')
//         .select('email')
//         .eq('email', formData.email.toLowerCase().trim())
//         .single()

//       if (existingUser) {
//         setError('Cet email est déjà utilisé')
//         setFieldErrors({ email: 'Cet email est déjà utilisé' })
//         setLoading(false)
//         return
//       }

//       const { error: insertError } = await supabase
//         .from('users')
//         .insert([
//           {
//             username: formData.username.trim(),
//             email: formData.email.toLowerCase().trim(),
//             password: formData.password,
//             role: 'promoteur',
//             telephone: formData.telephone || null,
//             genre: formData.genre || null,
//             email_verified: true
//           }
//         ])

//       if (insertError) {
//         console.error('Erreur insertion:', insertError)
//         setError('Erreur lors de l\'inscription. Veuillez réessayer.')
//         setLoading(false)
//         return
//       }

//       setSuccessMessage('Compte créé avec succès ! Redirection vers la connexion...')
      
//       setTimeout(() => {
//         router.push('/login')
//       }, 2000)

//     } catch (err: any) {
//       console.error('Erreur:', err)
//       setError('Une erreur est survenue lors de l\'inscription')
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
//       {/* Cercles décoratifs d'arrière-plan */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
//         <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
//       </div>

//       <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
//         <div className="w-full max-w-2xl">
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

//           {/* Carte d'inscription */}
//           <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden animate-slide-up">
//             {/* En-tête */}
//             <div className="bg-gradient-to-r from-blue-600/50 to-indigo-600/50 backdrop-blur-xl px-8 py-6 border-b border-white/10">
//               <div className="flex items-center space-x-3">
//                 <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xl">
//                   <UserPlus className="h-6 w-6 text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold text-white">Inscription Promoteur</h2>
//                   <p className="text-sm text-blue-200 mt-0.5">
//                     Créez votre compte pour accéder à la plateforme
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="p-8">
//               {/* Message de succès */}
//               {successMessage && (
//                 <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center animate-slide-down backdrop-blur-xl">
//                   <CheckCircle2 className="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0" />
//                   <p className="text-sm text-emerald-200">{successMessage}</p>
//                 </div>
//               )}

//               {/* Message d'erreur */}
//               {error && Object.keys(fieldErrors).length === 0 && (
//                 <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start animate-slide-down backdrop-blur-xl">
//                   <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
//                   <p className="text-sm text-red-200">{error}</p>
//                 </div>
//               )}

//               <form onSubmit={handleSubmit} className="space-y-5">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                   {/* Nom d'utilisateur */}
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-blue-100 mb-2">
//                       Nom d'utilisateur <span className="text-red-400">*</span>
//                     </label>
//                     <div className="relative">
//                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                         <UserCircle className={`h-5 w-5 ${fieldErrors.username ? 'text-red-400' : 'text-blue-400'}`} />
//                       </div>
//                       <input
//                         type="text"
//                         name="username"
//                         value={formData.username}
//                         onChange={handleChange}
//                         className={`block w-full pl-10 pr-3 py-3 bg-white/5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-white placeholder-blue-300/50 backdrop-blur-xl ${
//                           fieldErrors.username ? 'border-red-400/50 bg-red-500/5' : 'border-white/20 hover:border-white/30'
//                         }`}
//                         placeholder="Votre nom complet"
//                       />
//                       {fieldErrors.username && (
//                         <p className="mt-1 text-xs text-red-400">{fieldErrors.username}</p>
//                       )}
//                     </div>
//                   </div>

//                   {/* Email */}
//                   <div>
//                     <label className="block text-sm font-medium text-blue-100 mb-2">
//                       Email <span className="text-red-400">*</span>
//                     </label>
//                     <div className="relative">
//                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                         <Mail className={`h-5 w-5 ${fieldErrors.email ? 'text-red-400' : 'text-blue-400'}`} />
//                       </div>
//                       <input
//                         type="email"
//                         name="email"
//                         value={formData.email}
//                         onChange={handleChange}
//                         className={`block w-full pl-10 pr-3 py-3 bg-white/5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-white placeholder-blue-300/50 backdrop-blur-xl ${
//                           fieldErrors.email ? 'border-red-400/50 bg-red-500/5' : 'border-white/20 hover:border-white/30'
//                         }`}
//                         placeholder="exemple@email.com"
//                       />
//                       {fieldErrors.email && (
//                         <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
//                       )}
//                     </div>
//                   </div>

//                   {/* Téléphone */}
//                   <div>
//                     <label className="block text-sm font-medium text-blue-100 mb-2">
//                       Téléphone
//                     </label>
//                     <div className="relative">
//                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                         <Phone className="h-5 w-5 text-blue-400" />
//                       </div>
//                       <input
//                         type="tel"
//                         name="telephone"
//                         value={formData.telephone}
//                         onChange={handleChange}
//                         className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-white placeholder-blue-300/50 hover:border-white/30 backdrop-blur-xl"
//                         placeholder="+243 XXX XXX XXX"
//                       />
//                     </div>
//                   </div>

//                   {/* Mot de passe */}
//                   <div>
//                     <label className="block text-sm font-medium text-blue-100 mb-2">
//                       Mot de passe <span className="text-red-400">*</span>
//                     </label>
//                     <div className="relative">
//                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                         <Lock className={`h-5 w-5 ${fieldErrors.password ? 'text-red-400' : 'text-blue-400'}`} />
//                       </div>
//                       <input
//                         type={showPassword ? 'text' : 'password'}
//                         name="password"
//                         value={formData.password}
//                         onChange={handleChange}
//                         className={`block w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-white placeholder-blue-300/50 backdrop-blur-xl ${
//                           fieldErrors.password ? 'border-red-400/50 bg-red-500/5' : 'border-white/20 hover:border-white/30'
//                         }`}
//                         placeholder="••••••••"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                       >
//                         {showPassword ? (
//                           <EyeOff className="h-5 w-5 text-blue-400 hover:text-blue-300 transition-colors" />
//                         ) : (
//                           <Eye className="h-5 w-5 text-blue-400 hover:text-blue-300 transition-colors" />
//                         )}
//                       </button>
//                       {fieldErrors.password && (
//                         <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
//                       )}
//                     </div>
//                   </div>

//                   {/* Genre */}
//                   <div>
//                     <label className="block text-sm font-medium text-blue-100 mb-2">
//                       Genre
//                     </label>
//                     <select
//                       name="genre"
//                       value={formData.genre}
//                       onChange={handleChange}
//                       className="block w-full px-3 py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-white hover:border-white/30 backdrop-blur-xl cursor-pointer"
//                     >
//                       <option value="" className="bg-slate-800">Sélectionnez votre genre</option>
//                       <option value="M" className="bg-slate-800">Masculin</option>
//                       <option value="F" className="bg-slate-800">Féminin</option>
//                     </select>
//                   </div>
//                 </div>

//                 {/* Bouton d'inscription */}
//                 <div className="pt-4">
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
//                   >
//                     {loading ? (
//                       <>
//                         <Loader size="sm" />
//                         <span className="ml-2">Création du compte en cours...</span>
//                       </>
//                     ) : (
//                       <>
//                         <Sparkles className="mr-2 h-5 w-5" />
//                         Créer mon compte
//                         <ArrowRight className="ml-2 h-5 w-5" />
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </form>

//               {/* Lien de connexion */}
//               <div className="mt-8 pt-6 border-t border-white/10">
//                 <div className="text-center">
//                   <p className="text-sm text-blue-200">
//                     Déjà un compte ?{' '}
//                     <Link 
//                       href="/login" 
//                       className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center transition-colors"
//                     >
//                       Se connecter
//                       <ArrowRight className="ml-1 h-4 w-4" />
//                     </Link>
//                   </p>
//                 </div>
//               </div>

//               {/* Info */}
//               <div className="mt-6 bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
//                 <div className="flex items-start">
//                   <div className="flex-shrink-0">
//                     <Building2 className="h-5 w-5 text-blue-400" />
//                   </div>
//                   <div className="ml-3">
//                     <h3 className="text-sm font-medium text-blue-100">
//                       Information importante
//                     </h3>
//                     <p className="mt-1 text-xs text-blue-300">
//                       En créant un compte promoteur, vous pourrez soumettre vos projets industriels et suivre leur évolution sur la plateforme FPI.
//                     </p>
//                   </div>
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


// app/register/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, ArrowRight, Mail, Phone, UserCircle, Building2, UserPlus, AlertCircle, CheckCircle2, Sparkles, Shield, BadgeCheck } from 'lucide-react'
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
    } else if (formData.username.trim().length < 3) {
      errors.username = 'Minimum 3 caractères'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format d\'email invalide'
    }
    
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis'
    } else if (formData.password.length < 6) {
      errors.password = 'Minimum 6 caractères'
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

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

      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            username: formData.username.trim(),
            email: formData.email.toLowerCase().trim(),
            password: formData.password,
            role: 'promoteur',
            telephone: formData.telephone || null,
            genre: formData.genre || null,
            email_verified: true
          }
        ])

      if (insertError) {
        console.error('Erreur insertion:', insertError)
        setError('Erreur lors de l\'inscription. Veuillez réessayer.')
        setLoading(false)
        return
      }

      setSuccessMessage('Compte créé avec succès ! Redirection...')
      
      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (err: any) {
      console.error('Erreur:', err)
      setError('Une erreur est survenue lors de l\'inscription')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex">
    

      {/* Partie droite - Formulaire */}
      <div className="w-full  flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="flex items-center space-x-3">
                           <img src='./logo.png' className='w-20 h-auto'/>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">FPI Platform</h1>
                <p className="text-sm text-gray-500">Créer un compte</p>
              </div>
            </Link>
          </div>

          {/* Message de succès */}
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center animate-slide-down">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
              <p className="text-sm text-emerald-800">{successMessage}</p>
            </div>
          )}

          {/* Message d'erreur général */}
          {error && Object.keys(fieldErrors).length === 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start animate-slide-down">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nom d'utilisateur */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserCircle className={`h-5 w-5 ${fieldErrors.username ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`block w-full pl-11 pr-4 py-3.5 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-gray-900 placeholder-gray-400 shadow-sm ${
                      fieldErrors.username ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Votre nom complet"
                  />
                  {fieldErrors.username && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors.username}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 ${fieldErrors.email ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-11 pr-4 py-3.5 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-gray-900 placeholder-gray-400 shadow-sm ${
                      fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="exemple@email.com"
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
                  )}
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-gray-900 placeholder-gray-400 hover:border-gray-300 shadow-sm"
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
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${fieldErrors.password ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-11 pr-12 py-3.5 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-gray-900 placeholder-gray-400 shadow-sm ${
                      fieldErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
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
                  className="block w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-gray-900 hover:border-gray-300 shadow-sm cursor-pointer"
                >
                  <option value="">Sélectionnez</option>
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
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:translate-y-[-1px] active:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader size="sm" />
                    <span className="ml-2">Création du compte...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Créer mon compte
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Lien de connexion */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Déjà un compte ?{' '}
                <Link 
                  href="/login" 
                  className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center transition-colors"
                >
                  Se connecter
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </p>
            </div>
          </div>

          {/* Info sécurité */}
          <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-900">
                  Vos données sont sécurisées
                </h3>
                <p className="mt-1 text-xs text-blue-700">
                  Toutes vos informations sont cryptées et protégées. Nous ne partageons jamais vos données personnelles.
                </p>
              </div>
            </div>
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