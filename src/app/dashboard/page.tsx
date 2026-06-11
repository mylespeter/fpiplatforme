// // app/dashboard/page.tsx
// 'use client'

// import { useAuth } from '@/context/AuthContext'
// import { useRouter } from 'next/navigation'
// import { useEffect } from 'react'
// import PromoteurDashboard from './promoteur/page'
// import TechniqueDashboard from './technique/page'
// import CreditDashboard from './credit/page'
// import AdminDashboard from './admin/page'

// export default function DashboardPage() {
//   const { user, isAuthenticated, loading } = useAuth()
//   const router = useRouter()

//   useEffect(() => {
//     if (!loading && !isAuthenticated) {
//       router.push('/login')
//     }
//   }, [isAuthenticated, loading, router])

//   if (loading) {
//     return <div>Chargement...</div>
//   }

//   if (!user) {
//     return null
//   }

//   switch (user.role) {
//     case 'promoteur':
//       return <PromoteurDashboard />
//     case 'technique':
//       return <TechniqueDashboard />
//     case 'credit':
//       return <CreditDashboard />
//     case 'admin':
//       return <AdminDashboard />
//     default:
//       return <div>Rôle non reconnu</div>
//   }
// }

// app/dashboard/page.tsx
'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import PromoteurDashboard from './promoteur/page'
import TechniqueDashboard from './technique/page'
import CreditDashboard from './credit/page'
import AdminDashboard from './admin/page'

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Attendre que le chargement soit terminé
    if (!loading) {
      // Si non authentifié et pas en cours de redirection
      if (!isAuthenticated && !isRedirecting) {
        setIsRedirecting(true)
        console.log('Non authentifié, redirection vers login...')
        router.replace('/login') // Utiliser replace au lieu de push
      } else if (isAuthenticated) {
        console.log('Utilisateur authentifié:', user?.role)
      }
    }
  }, [loading, isAuthenticated, router, isRedirecting, user])

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Chargement de votre session...</p>
        </div>
      </div>
    )
  }

  // Si en cours de redirection, ne rien afficher
  if (isRedirecting) {
    return null
  }

  // Si pas d'utilisateur, ne rien afficher (la redirection va arriver)
  if (!user || !isAuthenticated) {
    return null
  }

  // Afficher le dashboard selon le rôle
  console.log('Affichage du dashboard pour le rôle:', user.role)
  
  switch (user.role) {
    case 'promoteur':
      return <PromoteurDashboard />
    case 'technique':
      return <TechniqueDashboard />
    case 'credit':
      return <CreditDashboard />
    case 'admin':
      return <AdminDashboard />
    default:
      console.error('Rôle non reconnu:', user.role)
      return (
        <div className="p-4 bg-red-100 text-red-700 rounded m-4">
          <h2>Rôle non reconnu</h2>
          <p>Le rôle "{user.role}" n'est pas valide.</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
          >
            Retour à la connexion
          </button>
        </div>
      )
  }
}