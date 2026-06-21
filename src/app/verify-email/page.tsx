// // // app/verify-email/page.tsx
// // 'use client'

// // import { useState, useRef, useEffect, Suspense } from 'react'
// // import { useRouter, useSearchParams } from 'next/navigation'
// // import { Mail, ArrowRight, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react'
// // import { Loader } from '@/components/ui/Loader'
// // import Link from 'next/link'

// // function VerifyEmailContent() {
// //   const [code, setCode] = useState<string[]>(['', '', '', '', '', ''])
// //   const [email, setEmail] = useState('')
// //   const [error, setError] = useState('')
// //   const [success, setSuccess] = useState(false)
// //   const [loading, setLoading] = useState(false)
// //   const [resending, setResending] = useState(false)
// //   const [countdown, setCountdown] = useState(0)
// //   const inputRefs = useRef<(HTMLInputElement | null)[]>([])
// //   const router = useRouter()
// //   const searchParams = useSearchParams()

// //   useEffect(() => {
// //     const emailParam = searchParams.get('email')
// //     if (emailParam) {
// //       setEmail(emailParam)
// //     }
// //   }, [searchParams])

// //   const handleCodeChange = (index: number, value: string) => {
// //     if (value.length > 1) return
    
// //     const newCode = [...code]
// //     newCode[index] = value
// //     setCode(newCode)
// //     setError('')

// //     if (value !== '' && index < 5) {
// //       inputRefs.current[index + 1]?.focus()
// //     }
// //   }

// //   const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
// //     if (e.key === 'Backspace' && !code[index] && index > 0) {
// //       inputRefs.current[index - 1]?.focus()
// //     }
// //   }

// //   const handlePaste = (e: React.ClipboardEvent) => {
// //     e.preventDefault()
// //     const pastedData = e.clipboardData.getData('text').slice(0, 6)
// //     if (/^\d{6}$/.test(pastedData)) {
// //       const newCode = pastedData.split('')
// //       setCode(newCode)
// //       inputRefs.current[5]?.focus()
// //     }
// //   }

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault()
// //     setError('')
    
// //     const verificationCode = code.join('')
// //     if (verificationCode.length !== 6) {
// //       setError('Veuillez entrer le code complet à 6 chiffres')
// //       return
// //     }

// //     setLoading(true)

// //     try {
// //       const response = await fetch('/api/verify-code', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({
// //           email: email,
// //           code: verificationCode
// //         })
// //       })

// //       const data = await response.json()

// //       if (!response.ok) {
// //         throw new Error(data.error)
// //       }

// //       setSuccess(true)
// //       setTimeout(() => {
// //         router.push('/login?verified=true')
// //       }, 2000)

// //     } catch (err: any) {
// //       setError(err.message || 'Une erreur est survenue')
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   const handleResendCode = async () => {
// //     if (!email || resending) return
    
// //     setResending(true)
// //     setError('')

// //     try {
// //       const response = await fetch('/api/send-verification', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({
// //           email: email,
// //           username: 'Utilisateur'
// //         })
// //       })

// //       const data = await response.json()

// //       if (!response.ok) {
// //         throw new Error(data.error)
// //       }
      
// //       setCountdown(60)
// //       const timer = setInterval(() => {
// //         setCountdown(prev => {
// //           if (prev <= 1) {
// //             clearInterval(timer)
// //             return 0
// //           }
// //           return prev - 1
// //         })
// //       }, 1000)

// //     } catch (err: any) {
// //       setError(err.message || 'Erreur lors du renvoi du code')
// //     } finally {
// //       setResending(false)
// //     }
// //   }

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
// //       <div className="min-h-screen flex items-center justify-center px-4 py-12">
// //         <div className="w-full max-w-md">
// //           {/* Logo */}
// //           <div className="text-center mb-8">
// //             <img src='logo.png' className='h-auto w-32 mx-auto' alt="Logo" />
// //           </div>

// //           {/* Carte de vérification */}
// //           <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
// //             {/* En-tête */}
// //             <div className="bg-gradient-to-r from-primary to-primary/80 px-8 py-6 text-white">
// //               <div className="flex items-center space-x-3">
// //                 <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
// //                   <Mail className="h-6 w-6" />
// //                 </div>
// //                 <div>
// //                   <h2 className="text-xl font-bold">Vérification Email</h2>
// //                   <p className="text-sm text-white/80 mt-0.5">
// //                     Entrez le code reçu par email
// //                   </p>
// //                 </div>
// //               </div>
// //             </div>

// //             <div className="p-8">
// //               {/* Message de succès */}
// //               {success && (
// //                 <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center">
// //                   <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
// //                   <div>
// //                     <p className="text-sm font-medium text-green-800">Email vérifié avec succès !</p>
// //                     <p className="text-xs text-green-600 mt-1">Redirection vers la connexion...</p>
// //                   </div>
// //                 </div>
// //               )}

// //               {/* Message d'erreur */}
// //               {error && (
// //                 <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start">
// //                   <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
// //                   <p className="text-sm text-red-700">{error}</p>
// //                 </div>
// //               )}

// //               {!success && (
// //                 <>
// //                   {/* Info email */}
// //                   {email && (
// //                     <div className="mb-6 text-center">
// //                       <p className="text-sm text-gray-600">
// //                         Code envoyé à <span className="font-medium text-gray-900">{email}</span>
// //                       </p>
// //                     </div>
// //                   )}

// //                   <form onSubmit={handleSubmit}>
// //                     {/* Champs du code */}
// //                     <div className="flex gap-3 justify-center mb-8">
// //                       {code.map((digit, index) => (
// //                         <input
// //                           key={index}
// //                           ref={el => inputRefs.current[index] = el}
// //                           type="text"
// //                           inputMode="numeric"
// //                           maxLength={1}
// //                           value={digit}
// //                           onChange={(e) => handleCodeChange(index, e.target.value)}
// //                           onKeyDown={(e) => handleKeyDown(index, e)}
// //                           onPaste={index === 0 ? handlePaste : undefined}
// //                           className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
// //                           autoFocus={index === 0}
// //                         />
// //                       ))}
// //                     </div>

// //                     {/* Bouton de vérification */}
// //                     <button
// //                       type="submit"
// //                       disabled={loading || code.join('').length !== 6}
// //                       className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
// //                     >
// //                       {loading ? (
// //                         <>
// //                           <Loader size="sm" />
// //                           <span className="ml-2">Vérification...</span>
// //                         </>
// //                       ) : (
// //                         <>
// //                           Vérifier mon email
// //                           <ArrowRight className="ml-2 h-5 w-5" />
// //                         </>
// //                       )}
// //                     </button>
// //                   </form>

// //                   {/* Renvoyer le code */}
// //                   <div className="mt-6 text-center">
// //                     <p className="text-sm text-gray-600 mb-2">
// //                       Vous n'avez pas reçu le code ?
// //                     </p>
// //                     <button
// //                       onClick={handleResendCode}
// //                       disabled={resending || countdown > 0}
// //                       className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
// //                     >
// //                       {resending ? (
// //                         <>
// //                           <Loader size="sm"  />
// //                           Envoi en cours...
// //                         </>
// //                       ) : countdown > 0 ? (
// //                         <>
// //                           <RotateCcw className="h-4 w-4 mr-2" />
// //                           Renvoyer dans {countdown}s
// //                         </>
// //                       ) : (
// //                         <>
// //                           <RotateCcw className="h-4 w-4 mr-2" />
// //                           Renvoyer le code
// //                         </>
// //                       )}
// //                     </button>
// //                   </div>
// //                 </>
// //               )}
// //             </div>
// //           </div>

// //           {/* Footer */}
// //           <div className="mt-8 text-center">
// //             <Link 
// //               href="/login" 
// //               className="text-sm text-gray-500 hover:text-gray-700"
// //             >
// //               ← Retour à la connexion
// //             </Link>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }

// // export default function VerifyEmailPage() {
// //   return (
// //     <Suspense fallback={<div>Chargement...</div>}>
// //       <VerifyEmailContent />
// //     </Suspense>
// //   )
// // }



// // app/verify-email/page.tsx
// 'use client'

// import { useState, useRef, useEffect, Suspense } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'
// import { Mail, ArrowRight, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react'
// import { Loader } from '@/components/ui/Loader'
// import { useAuth } from '@/context/AuthContext'
// import Link from 'next/link'

// function VerifyEmailContent() {
//   const [code, setCode] = useState<string[]>(['', '', '', '', '', ''])
//   const [email, setEmail] = useState('')
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [resending, setResending] = useState(false)
//   const [countdown, setCountdown] = useState(0)
//   const inputRefs = useRef<(HTMLInputElement | null)[]>([])
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const { updateUser } = useAuth()

//   useEffect(() => {
//     const emailParam = searchParams.get('email')
//     if (emailParam) {
//       setEmail(emailParam)
//     }
//   }, [searchParams])

//   const handleCodeChange = (index: number, value: string) => {
//     if (value.length > 1) return
    
//     const newCode = [...code]
//     newCode[index] = value
//     setCode(newCode)
//     setError('')

//     if (value !== '' && index < 5) {
//       inputRefs.current[index + 1]?.focus()
//     }
//   }

//   const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
//     if (e.key === 'Backspace' && !code[index] && index > 0) {
//       inputRefs.current[index - 1]?.focus()
//     }
//   }

//   const handlePaste = (e: React.ClipboardEvent) => {
//     e.preventDefault()
//     const pastedData = e.clipboardData.getData('text').slice(0, 6)
//     if (/^\d{6}$/.test(pastedData)) {
//       const newCode = pastedData.split('')
//       setCode(newCode)
//       inputRefs.current[5]?.focus()
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError('')
    
//     const verificationCode = code.join('')
//     if (verificationCode.length !== 6) {
//       setError('Veuillez entrer le code complet à 6 chiffres')
//       return
//     }

//     setLoading(true)

//     try {
//       const response = await fetch('/api/verify-code', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           email: email,
//           code: verificationCode
//         })
//       })

//       const data = await response.json()

//       if (!response.ok) {
//         throw new Error(data.error)
//       }

//       // Connexion automatique avec les données reçues
//       updateUser(data.user)
      
//       setSuccess(true)
      
//       // Redirection vers le dashboard selon le rôle
//       setTimeout(() => {
//         const role = data.user.role
//         switch (role) {
//           case 'promoteur':
//             router.push('/dashboard')
//             break
//           case 'technique':
//             router.push('/dashboard/technique')
//             break
//           case 'credit':
//             router.push('/dashboard/credit')
//             break
//           case 'admin':
//             router.push('/dashboard/admin')
//             break
//           default:
//             router.push('/dashboard')
//         }
//       }, 2000)

//     } catch (err: any) {
//       setError(err.message || 'Une erreur est survenue')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleResendCode = async () => {
//     if (!email || resending) return
    
//     setResending(true)
//     setError('')

//     try {
//       const response = await fetch('/api/send-verification', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           email: email,
//           username: 'Utilisateur'
//         })
//       })

//       const data = await response.json()

//       if (!response.ok) {
//         throw new Error(data.error)
//       }
      
//       setCountdown(60)
//       const timer = setInterval(() => {
//         setCountdown(prev => {
//           if (prev <= 1) {
//             clearInterval(timer)
//             return 0
//           }
//           return prev - 1
//         })
//       }, 1000)

//     } catch (err: any) {
//       setError(err.message || 'Erreur lors du renvoi du code')
//     } finally {
//       setResending(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
//       <div className="min-h-screen flex items-center justify-center px-4 py-12">
//         <div className="w-full max-w-md">
//           {/* Logo */}
//           <div className="text-center mb-8">
//             <img src='logo.png' className='h-auto w-32 mx-auto' alt="Logo" />
//           </div>

//           {/* Carte de vérification */}
//           <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
//             {/* En-tête */}
//             <div className="bg-gradient-to-r from-primary to-primary/80 px-8 py-6 text-white">
//               <div className="flex items-center space-x-3">
//                 <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
//                   <Mail className="h-6 w-6" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold">Vérification Email</h2>
//                   <p className="text-sm text-white/80 mt-0.5">
//                     Entrez le code reçu par email
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="p-8">
//               {/* Message de succès */}
//               {success && (
//                 <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
//                   <div className="flex items-center">
//                     <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
//                     <div>
//                       <p className="text-sm font-medium text-green-800">Email vérifié avec succès !</p>
//                       <p className="text-xs text-green-600 mt-1">Connexion automatique en cours...</p>
//                     </div>
//                   </div>
//                   {/* Animation de chargement */}
//                   <div className="mt-3 w-full bg-green-200 rounded-full h-1">
//                     <div className="bg-green-500 h-1 rounded-full animate-pulse" style={{ width: '100%' }}></div>
//                   </div>
//                 </div>
//               )}

//               {/* Message d'erreur */}
//               {error && (
//                 <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start">
//                   <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
//                   <p className="text-sm text-red-700">{error}</p>
//                 </div>
//               )}

//               {!success && (
//                 <>
//                   {/* Info email */}
//                   {email && (
//                     <div className="mb-6 text-center">
//                       <p className="text-sm text-gray-600">
//                         Code envoyé à <span className="font-medium text-gray-900">{email}</span>
//                       </p>
//                     </div>
//                   )}

//                   <form onSubmit={handleSubmit}>
//                     {/* Champs du code */}
//                     <div className="flex gap-3 justify-center mb-8">
//                       {code.map((digit, index) => (
//                         <input
//                           key={index}
//                           ref={el => inputRefs.current[index] = el}
//                           type="text"
//                           inputMode="numeric"
//                           maxLength={1}
//                           value={digit}
//                           onChange={(e) => handleCodeChange(index, e.target.value)}
//                           onKeyDown={(e) => handleKeyDown(index, e)}
//                           onPaste={index === 0 ? handlePaste : undefined}
//                           className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
//                           autoFocus={index === 0}
//                         />
//                       ))}
//                     </div>

//                     {/* Bouton de vérification */}
//                     <button
//                       type="submit"
//                       disabled={loading || code.join('').length !== 6}
//                       className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {loading ? (
//                         <>
//                           <Loader size="sm" />
//                           <span className="ml-2">Vérification...</span>
//                         </>
//                       ) : (
//                         <>
//                           Vérifier et se connecter
//                           <ArrowRight className="ml-2 h-5 w-5" />
//                         </>
//                       )}
//                     </button>
//                   </form>

//                   {/* Renvoyer le code */}
//                   <div className="mt-6 text-center">
//                     <p className="text-sm text-gray-600 mb-2">
//                       Vous n'avez pas reçu le code ?
//                     </p>
//                     <button
//                       onClick={handleResendCode}
//                       disabled={resending || countdown > 0}
//                       className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {resending ? (
//                         <>
//                           <Loader size="sm"/>
//                           Envoi en cours...
//                         </>
//                       ) : countdown > 0 ? (
//                         <>
//                           <RotateCcw className="h-4 w-4 mr-2" />
//                           Renvoyer dans {countdown}s
//                         </>
//                       ) : (
//                         <>
//                           <RotateCcw className="h-4 w-4 mr-2" />
//                           Renvoyer le code
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="mt-8 text-center">
//             <Link 
//               href="/login" 
//               className="text-sm text-gray-500 hover:text-gray-700"
//             >
//               ← Retour à la connexion
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default function VerifyEmailPage() {
//   return (
//     <Suspense fallback={
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader size="lg" />
//       </div>
//     }>
//       <VerifyEmailContent />
//     </Suspense>
//   )
// }


// app/verify-email/page.tsx
'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, ArrowRight, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react'
import { Loader } from '@/components/ui/Loader'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

function VerifyEmailContent() {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', ''])
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  // Correction du type des refs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const { updateUser } = useAuth()

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setError('')

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('')
      setCode(newCode)
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const verificationCode = code.join('')
    if (verificationCode.length !== 6) {
      setError('Veuillez entrer le code complet à 6 chiffres')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          code: verificationCode
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      // Connexion automatique avec les données reçues
      updateUser(data.user)
      
      setSuccess(true)
      
      // Redirection vers le dashboard selon le rôle
      setTimeout(() => {
        const role = data.user.role
        switch (role) {
          case 'promoteur':
            router.push('/dashboard')
            break
          case 'technique':
            router.push('/dashboard/technique')
            break
          case 'credit':
            router.push('/dashboard/credit')
            break
          case 'admin':
            router.push('/dashboard/admin')
            break
          default:
            router.push('/dashboard')
        }
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email || resending) return
    
    setResending(true)
    setError('')

    try {
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          username: 'Utilisateur'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }
      
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

    } catch (err: any) {
      setError(err.message || 'Erreur lors du renvoi du code')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src='logo.png' className='h-auto w-32 mx-auto' alt="Logo" />
          </div>

          {/* Carte de vérification */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* En-tête */}
            <div className="bg-gradient-to-r from-primary to-primary/80 px-8 py-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Vérification Email</h2>
                  <p className="text-sm text-white/80 mt-0.5">
                    Entrez le code reçu par email
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Message de succès */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Email vérifié avec succès !</p>
                      <p className="text-xs text-green-600 mt-1">Connexion automatique en cours...</p>
                    </div>
                  </div>
                  {/* Animation de chargement */}
                  <div className="mt-3 w-full bg-green-200 rounded-full h-1">
                    <div className="bg-green-500 h-1 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                  </div>
                </div>
              )}

              {/* Message d'erreur */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {!success && (
                <>
                  {/* Info email */}
                  {email && (
                    <div className="mb-6 text-center">
                      <p className="text-sm text-gray-600">
                        Code envoyé à <span className="font-medium text-gray-900">{email}</span>
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    {/* Champs du code */}
                    <div className="flex gap-3 justify-center mb-8">
                      {code.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            inputRefs.current[index] = el
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={index === 0 ? handlePaste : undefined}
                          className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>

                    {/* Bouton de vérification */}
                    <button
                      type="submit"
                      disabled={loading || code.join('').length !== 6}
                      className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader size="sm" />
                          <span className="ml-2">Vérification...</span>
                        </>
                      ) : (
                        <>
                          Vérifier et se connecter
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Renvoyer le code */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Vous n'avez pas reçu le code ?
                    </p>
                    <button
                      onClick={handleResendCode}
                      disabled={resending || countdown > 0}
                      className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resending ? (
                        <>
                          <Loader size="sm"  />
                          Envoi en cours...
                        </>
                      ) : countdown > 0 ? (
                        <>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Renvoyer dans {countdown}s
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Renvoyer le code
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <Link 
              href="/login" 
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}