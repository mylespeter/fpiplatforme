// // app/admin/utilisateurs/page.tsx
// 'use client'

// import { useState, useEffect, useCallback } from 'react'
// import { useAuth } from '@/context/AuthContext'
// import { supabase } from '@/lib/supabase'
// import { 
//   Users, Search, Filter, RefreshCw, Loader2, Eye, X, 
//   User, Mail, Phone, Calendar, Shield, CheckCircle, XCircle,
//   AlertCircle, ChevronLeft, ChevronRight, ArrowUpDown,
//   UserPlus, Edit, Trash2, Key, MoreVertical, BadgeCheck,
//   Clock, Activity, UserCheck, UserX, Download, Upload
// } from 'lucide-react'

// // Types
// type UserType = {
//   id: string
//   email: string
//   username: string
//   role: 'promoteur' | 'technique' | 'credit' | 'admin'
//   genre: 'M' | 'F' | null
//   telephone: string | null
//   photo_profil: string | null
//   created_at: string
//   updated_at: string
//   projets_count?: number
//   last_login?: string | null
//   status?: 'actif' | 'inactif' | 'bloqué'
// }

// type UserFormData = {
//   email: string
//   username: string
//   password: string
//   role: 'promoteur' | 'technique' | 'credit' | 'admin'
//   genre: 'M' | 'F' | ''
//   telephone: string
// }

// type SortField = 'username' | 'email' | 'role' | 'created_at' | 'projets_count'
// type SortOrder = 'asc' | 'desc'

// // Constantes
// const ROLES = [
//   { value: 'promoteur', label: 'Promoteur', color: 'bg-blue-100 text-blue-700', icon: User },
//   { value: 'technique', label: 'Technique', color: 'bg-purple-100 text-purple-700', icon: Shield },
//   { value: 'credit', label: 'Crédit', color: 'bg-orange-100 text-orange-700', icon: BadgeCheck },
//   { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-700', icon: Shield },
// ]

// const USERS_PER_PAGE = 10

// export default function AdminUsersPage() {
//   const { user: currentUser } = useAuth()
  
//   // États
//   const [users, setUsers] = useState<UserType[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const [searchTerm, setSearchTerm] = useState('')
//   const [filterRole, setFilterRole] = useState('')
//   const [filterStatus, setFilterStatus] = useState('')
//   const [isRefreshing, setIsRefreshing] = useState(false)
  
//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1)
//   const [totalCount, setTotalCount] = useState(0)
  
//   // Tri
//   const [sortField, setSortField] = useState<SortField>('created_at')
//   const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  
//   // Modals
//   const [showCreateModal, setShowCreateModal] = useState(false)
//   const [showEditModal, setShowEditModal] = useState(false)
//   const [showDetailModal, setShowDetailModal] = useState(false)
//   const [showDeleteModal, setShowDeleteModal] = useState(false)
//   const [showPasswordModal, setShowPasswordModal] = useState(false)
//   const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  
//   // Formulaires
//   const [formData, setFormData] = useState<UserFormData>({
//     email: '',
//     username: '',
//     password: '',
//     role: 'promoteur',
//     genre: '',
//     telephone: ''
//   })
//   const [formErrors, setFormErrors] = useState<Partial<UserFormData>>({})
//   const [formLoading, setFormLoading] = useState(false)
  
//   // Password
//   const [newPassword, setNewPassword] = useState('')
//   const [passwordLoading, setPasswordLoading] = useState(false)

//   // Stats
//   const [stats, setStats] = useState({
//     total: 0,
//     promoteurs: 0,
//     technique: 0,
//     credit: 0,
//     admin: 0,
//     actifs: 0
//   })

//   // ============================================
//   // CHARGEMENT DES DONNÉES
//   // ============================================

//   const chargerUsers = useCallback(async (silent = false) => {
//     try {
//       if (!silent) setLoading(true)
//       else setIsRefreshing(true)
      
//       let query = supabase
//         .from('users')
//         .select('*', { count: 'exact' })

//       // Filtres
//       if (searchTerm) {
//         query = query.or(`username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,telephone.ilike.%${searchTerm}%`)
//       }
//       if (filterRole) {
//         query = query.eq('role', filterRole)
//       }

//       // Tri
//       query = query.order(sortField, { ascending: sortOrder === 'asc' })

//       // Pagination
//       const from = (currentPage - 1) * USERS_PER_PAGE
//       const to = from + USERS_PER_PAGE - 1
//       query = query.range(from, to)

//       const { data, error, count } = await query

//       if (error) throw error

//       // Enrichir avec les données des projets
//       const usersWithProjects = await Promise.all((data || []).map(async (user) => {
//         const { count: projetsCount } = await supabase
//           .from('projets')
//           .select('*', { count: 'exact', head: true })
//           .eq('promoteur_id', user.id)

//         return {
//           ...user,
//           projets_count: projetsCount || 0,
//           status: 'actif' as const
//         }
//       }))

//       setUsers(usersWithProjects)
//       if (count !== null) setTotalCount(count)

//       // Charger les stats
//       await chargerStats()
      
//     } catch (error) {
//       console.error('Erreur chargement:', error)
//       if (!silent) setError('Erreur lors du chargement des utilisateurs')
//     } finally {
//       setLoading(false)
//       setIsRefreshing(false)
//     }
//   }, [searchTerm, filterRole, sortField, sortOrder, currentPage])

//   const chargerStats = async () => {
//     try {
//       const { data: allUsers } = await supabase
//         .from('users')
//         .select('role')

//       if (allUsers) {
//         setStats({
//           total: allUsers.length,
//           promoteurs: allUsers.filter(u => u.role === 'promoteur').length,
//           technique: allUsers.filter(u => u.role === 'technique').length,
//           credit: allUsers.filter(u => u.role === 'credit').length,
//           admin: allUsers.filter(u => u.role === 'admin').length,
//           actifs: allUsers.length // À adapter selon votre logique
//         })
//       }
//     } catch (error) {
//       console.error('Erreur stats:', error)
//     }
//   }

//   useEffect(() => {
//     chargerUsers()
//   }, [chargerUsers])

//   // Auto-refresh toutes les 30s
//   useEffect(() => {
//     const interval = setInterval(() => {
//       chargerUsers(true)
//     }, 30000)
//     return () => clearInterval(interval)
//   }, [chargerUsers])

//   // ============================================
//   // GESTION DES UTILISATEURS
//   // ============================================

//   const validateForm = () => {
//     const errors: Partial<UserFormData> = {}
    
//     if (!formData.email.trim()) {
//       errors.email = 'Email requis'
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       errors.email = 'Email invalide'
//     }
    
//     if (!formData.username.trim()) {
//       errors.username = 'Nom d\'utilisateur requis'
//     }
    
//     if (!showEditModal && !formData.password.trim()) {
//       errors.password = 'Mot de passe requis'
//     } else if (!showEditModal && formData.password.length < 6) {
//       errors.password = '6 caractères minimum'
//     }
    
//     if (!formData.role) {
//       errors.role = 'Rôle requis' as any
//     }

//     setFormErrors(errors)
//     return Object.keys(errors).length === 0
//   }

//   const handleCreateUser = async () => {
//     if (!validateForm()) return
    
//     setFormLoading(true)
//     setError('')

//     try {
//       // Vérifier si l'email existe déjà
//       const { data: existingUser } = await supabase
//         .from('users')
//         .select('id')
//         .eq('email', formData.email.toLowerCase().trim())
//         .single()

//       if (existingUser) {
//         setFormErrors({ email: 'Cet email est déjà utilisé' })
//         setFormLoading(false)
//         return
//       }

//       const { error } = await supabase
//         .from('users')
//         .insert({
//           email: formData.email.toLowerCase().trim(),
//           username: formData.username.trim(),
//           password: formData.password,
//           role: formData.role,
//           genre: formData.genre || null,
//           telephone: formData.telephone || null
//         })

//       if (error) throw error

//       setSuccess('✅ Utilisateur créé avec succès')
//       setShowCreateModal(false)
//       resetForm()
//       await chargerUsers()
      
//     } catch (error: any) {
//       console.error('Erreur création:', error)
//       setError(error.message || 'Erreur lors de la création')
//     } finally {
//       setFormLoading(false)
//     }
//   }

//   const handleEditUser = async () => {
//     if (!selectedUser || !validateForm()) return
    
//     setFormLoading(true)
//     setError('')

//     try {
//       const { error } = await supabase
//         .from('users')
//         .update({
//           username: formData.username.trim(),
//           role: formData.role,
//           genre: formData.genre || null,
//           telephone: formData.telephone || null
//         })
//         .eq('id', selectedUser.id)

//       if (error) throw error

//       setSuccess('✅ Utilisateur modifié avec succès')
//       setShowEditModal(false)
//       await chargerUsers()
      
//     } catch (error: any) {
//       console.error('Erreur modification:', error)
//       setError('Erreur lors de la modification')
//     } finally {
//       setFormLoading(false)
//     }
//   }

//   const handleDeleteUser = async () => {
//     if (!selectedUser) return
    
//     setFormLoading(true)
//     try {
//       const { error } = await supabase
//         .from('users')
//         .delete()
//         .eq('id', selectedUser.id)

//       if (error) throw error

//       setSuccess('✅ Utilisateur supprimé avec succès')
//       setShowDeleteModal(false)
//       await chargerUsers()
      
//     } catch (error: any) {
//       console.error('Erreur suppression:', error)
//       setError('Erreur lors de la suppression')
//     } finally {
//       setFormLoading(false)
//     }
//   }

//   const handleChangePassword = async () => {
//     if (!selectedUser || !newPassword.trim() || newPassword.length < 6) return
    
//     setPasswordLoading(true)
//     try {
//       const { error } = await supabase
//         .from('users')
//         .update({ password: newPassword })
//         .eq('id', selectedUser.id)

//       if (error) throw error

//       setSuccess('✅ Mot de passe modifié avec succès')
//       setShowPasswordModal(false)
//       setNewPassword('')
      
//     } catch (error: any) {
//       console.error('Erreur password:', error)
//       setError('Erreur lors du changement de mot de passe')
//     } finally {
//       setPasswordLoading(false)
//     }
//   }

//   // ============================================
//   // HELPERS
//   // ============================================

//   const resetForm = () => {
//     setFormData({
//       email: '',
//       username: '',
//       password: '',
//       role: 'promoteur',
//       genre: '',
//       telephone: ''
//     })
//     setFormErrors({})
//   }

//   const ouvrirEdition = (user: UserType) => {
//     setSelectedUser(user)
//     setFormData({
//       email: user.email,
//       username: user.username,
//       password: '',
//       role: user.role,
//       genre: user.genre || '',
//       telephone: user.telephone || ''
//     })
//     setFormErrors({})
//     setShowEditModal(true)
//   }

//   const ouvrirDetail = (user: UserType) => {
//     setSelectedUser(user)
//     setShowDetailModal(true)
//   }

//   const handleSort = (field: SortField) => {
//     if (sortField === field) {
//       setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
//     } else {
//       setSortField(field)
//       setSortOrder('asc')
//     }
//   }

//   const formatDate = (d: string) => {
//     return new Date(d).toLocaleDateString('fr-FR', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric'
//     })
//   }

//   const totalPages = Math.ceil(totalCount / USERS_PER_PAGE)

//   // ============================================
//   // RENDU
//   // ============================================

//   if (loading) {
//     return (
//       <div className="h-screen flex items-center justify-center bg">
//         <div className="text-center">
//           <div className="relative">
//             <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
//             <Users className="h-6 w-6 text-primary/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
//           </div>
//           <p className="mt-4 text-sm font-medium text-gray-700">Chargement des utilisateurs...</p>
//           <p className="mt-1 text-xs text-gray-500">Administration</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="h-screen flex flex-col bg-">
//       {/* Messages */}
//       {(success || error) && (
//         <div className="fixed top-4 right-4 z-50 max-w-sm animate-slide-in">
//           <div className={`rounded-xl shadow-lg p-4 flex items-start gap-3 ${
//             success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
//           }`}>
//             {success ? <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" /> : 
//                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />}
//             <div className="flex-1">
//               <p className="text-sm font-medium">{success ? 'Succès' : 'Erreur'}</p>
//               <p className="text-xs text-gray-600 mt-0.5">{success || error}</p>
//             </div>
//             <button onClick={() => { setSuccess(''); setError('') }} className="text-gray-400 hover:text-gray-600">
//               <X className="h-4 w-4" />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Header */}
//       <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-4">
//         <div className="max-w-7xl mx-auto">
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h1 className="text-xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
//               <p className="text-sm text-gray-500">Gérez les comptes, rôles et accès de la plateforme</p>
//             </div>
//             <div className="flex items-center gap-3">
//               <button onClick={() => chargerUsers(true)} disabled={isRefreshing}
//                 className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg"
//                 title="Actualiser">
//                 <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
//               </button>
//               <button onClick={() => { resetForm(); setShowCreateModal(true) }}
//                 className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm">
//                 <UserPlus className="h-4 w-4" /> Nouvel utilisateur
//               </button>
//             </div>
//           </div>

//           {/* Stats */}
//           <div className="grid grid-cols-6 gap-3">
//             <div className="bg-gray-50 rounded-xl p-3 text-center hover:shadow-md transition-shadow">
//               <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
//               <div className="flex items-center justify-center gap-1 mt-1">
//                 <Users className="h-3 w-3 text-gray-500" />
//                 <p className="text-xs text-gray-500">Total</p>
//               </div>
//             </div>
//             <div className="bg-blue-50 rounded-xl p-3 text-center hover:shadow-md transition-shadow border border-blue-100">
//               <p className="text-2xl font-bold text-blue-700">{stats.promoteurs}</p>
//               <div className="flex items-center justify-center gap-1 mt-1">
//                 <User className="h-3 w-3 text-blue-600" />
//                 <p className="text-xs text-blue-600">Promoteurs</p>
//               </div>
//             </div>
//             <div className="bg-purple-50 rounded-xl p-3 text-center hover:shadow-md transition-shadow border border-purple-100">
//               <p className="text-2xl font-bold text-purple-700">{stats.technique}</p>
//               <div className="flex items-center justify-center gap-1 mt-1">
//                 <Shield className="h-3 w-3 text-purple-600" />
//                 <p className="text-xs text-purple-600">Technique</p>
//               </div>
//             </div>
//             <div className="bg-orange-50 rounded-xl p-3 text-center hover:shadow-md transition-shadow border border-orange-100">
//               <p className="text-2xl font-bold text-orange-700">{stats.credit}</p>
//               <div className="flex items-center justify-center gap-1 mt-1">
//                 <BadgeCheck className="h-3 w-3 text-orange-600" />
//                 <p className="text-xs text-orange-600">Crédit</p>
//               </div>
//             </div>
//             <div className="bg-red-50 rounded-xl p-3 text-center hover:shadow-md transition-shadow border border-red-100">
//               <p className="text-2xl font-bold text-red-700">{stats.admin}</p>
//               <div className="flex items-center justify-center gap-1 mt-1">
//                 <Shield className="h-3 w-3 text-red-600" />
//                 <p className="text-xs text-red-600">Admin</p>
//               </div>
//             </div>
//             <div className="bg-green-50 rounded-xl p-3 text-center hover:shadow-md transition-shadow border border-green-100">
//               <p className="text-2xl font-bold text-green-700">{stats.actifs}</p>
//               <div className="flex items-center justify-center gap-1 mt-1">
//                 <UserCheck className="h-3 w-3 text-green-600" />
//                 <p className="text-xs text-green-600">Actifs</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Filtres */}
//       <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-2">
//         <div className="max-w-7xl mx-auto flex items-center gap-3">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//             <input type="text" placeholder="Rechercher par nom, email, téléphone..." value={searchTerm}
//               onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
//               className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
//           </div>
//           <div className="flex items-center gap-2">
//             <Filter className="h-4 w-4 text-gray-400" />
//             <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1) }}
//               className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20">
//               <option value="">Tous les rôles</option>
//               <option value="promoteur">Promoteur</option>
//               <option value="technique">Technique</option>
//               <option value="credit">Crédit</option>
//               <option value="admin">Admin</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Tableau */}
//       <div className="flex-1 overflow-y-auto p-4">
//         <div className="max-w-7xl mx-auto">
//           {isRefreshing && (
//             <div className="mb-3">
//               <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 flex items-center gap-2">
//                 <Loader2 className="h-3 w-3 animate-spin text-primary" />
//                 <p className="text-xs text-primary">Actualisation en cours...</p>
//               </div>
//             </div>
//           )}

//           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b border-gray-100 bg-gray-50/50">
//                     <th className="text-left p-4 text-xs font-semibold text-gray-600">
//                       <button onClick={() => handleSort('username')} className="flex items-center gap-1 hover:text-gray-900">
//                         Utilisateur
//                         <ArrowUpDown className="h-3 w-3" />
//                       </button>
//                     </th>
//                     <th className="text-left p-4 text-xs font-semibold text-gray-600">
//                       <button onClick={() => handleSort('email')} className="flex items-center gap-1 hover:text-gray-900">
//                         Email
//                         <ArrowUpDown className="h-3 w-3" />
//                       </button>
//                     </th>
//                     <th className="text-left p-4 text-xs font-semibold text-gray-600">
//                       <button onClick={() => handleSort('role')} className="flex items-center gap-1 hover:text-gray-900">
//                         Rôle
//                         <ArrowUpDown className="h-3 w-3" />
//                       </button>
//                     </th>
//                     <th className="text-left p-4 text-xs font-semibold text-gray-600">
//                       <button onClick={() => handleSort('projets_count')} className="flex items-center gap-1 hover:text-gray-900">
//                         Projets
//                         <ArrowUpDown className="h-3 w-3" />
//                       </button>
//                     </th>
//                     <th className="text-left p-4 text-xs font-semibold text-gray-600">
//                       <button onClick={() => handleSort('created_at')} className="flex items-center gap-1 hover:text-gray-900">
//                         Inscription
//                         <ArrowUpDown className="h-3 w-3" />
//                       </button>
//                     </th>
//                     <th className="text-center p-4 text-xs font-semibold text-gray-600">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {users.length === 0 ? (
//                     <tr>
//                       <td colSpan={6} className="p-12 text-center">
//                         <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//                         <p className="text-sm font-medium text-gray-900 mb-1">Aucun utilisateur trouvé</p>
//                         <p className="text-xs text-gray-500">Aucun utilisateur ne correspond à vos critères</p>
//                       </td>
//                     </tr>
//                   ) : (
//                     users.map(user => {
//                       const roleConfig = ROLES.find(r => r.value === user.role)
//                       const RoleIcon = roleConfig?.icon || User
                      
//                       return (
//                         <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
//                           <td className="p-4">
//                             <div className="flex items-center gap-3">
//                               <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
//                                 {user.photo_profil ? (
//                                   <img src={user.photo_profil} alt={user.username} className="w-full h-full rounded-lg object-cover" />
//                                 ) : (
//                                   <User className="h-5 w-5 text-primary" />
//                                 )}
//                               </div>
//                               <div>
//                                 <p className="text-sm font-semibold text-gray-900">{user.username}</p>
// <p className="text-xs text-gray-500">ID: {String(user.id || '').slice(0, 8)}...</p>

//                               </div>
//                             </div>
//                           </td>
//                           <td className="p-4">
//                             <div className="flex items-center gap-2">
//                               <Mail className="h-3 w-3 text-gray-400" />
//                               <span className="text-sm text-gray-700">{user.email}</span>
//                             </div>
//                           </td>
//                           <td className="p-4">
//                             <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${roleConfig?.color}`}>
//                               <RoleIcon className="h-3 w-3" />
//                               {roleConfig?.label}
//                             </span>
//                           </td>
//                           <td className="p-4">
//                             <span className="text-sm font-semibold text-gray-900">{user.projets_count}</span>
//                             <span className="text-xs text-gray-500 ml-1">projet{user.projets_count !== 1 ? 's' : ''}</span>
//                           </td>
//                           <td className="p-4">
//                             <div className="flex items-center gap-2">
//                               <Calendar className="h-3 w-3 text-gray-400" />
//                               <span className="text-sm text-gray-700">{formatDate(user.created_at)}</span>
//                             </div>
//                           </td>
//                           <td className="p-4">
//                             <div className="flex items-center justify-center gap-2">
//                               <button onClick={() => ouvrirDetail(user)}
//                                 className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
//                                 title="Voir détails">
//                                 <Eye className="h-4 w-4" />
//                               </button>
//                               <button onClick={() => ouvrirEdition(user)}
//                                 className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                                 title="Modifier">
//                                 <Edit className="h-4 w-4" />
//                               </button>
//                               <button onClick={() => { setSelectedUser(user); setShowPasswordModal(true) }}
//                                 className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
//                                 title="Changer mot de passe">
//                                 <Key className="h-4 w-4" />
//                               </button>
//                               {user.id !== currentUser?.id && (
//                                 <button onClick={() => { setSelectedUser(user); setShowDeleteModal(true) }}
//                                   className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                                   title="Supprimer">
//                                   <Trash2 className="h-4 w-4" />
//                                 </button>
//                               )}
//                             </div>
//                           </td>
//                         </tr>
//                       )
//                     })
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
//                 <div className="flex items-center justify-between">
//                   <p className="text-xs text-gray-600">
//                     Affichage de <span className="font-semibold">{(currentPage - 1) * USERS_PER_PAGE + 1}</span> à{' '}
//                     <span className="font-semibold">{Math.min(currentPage * USERS_PER_PAGE, totalCount)}</span> sur{' '}
//                     <span className="font-semibold">{totalCount}</span> utilisateurs
//                   </p>
//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                       disabled={currentPage === 1}
//                       className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
//                       <ChevronLeft className="h-4 w-4" />
//                     </button>
                    
//                     {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                       let pageNum: number
//                       if (totalPages <= 5) {
//                         pageNum = i + 1
//                       } else if (currentPage <= 3) {
//                         pageNum = i + 1
//                       } else if (currentPage >= totalPages - 2) {
//                         pageNum = totalPages - 4 + i
//                       } else {
//                         pageNum = currentPage - 2 + i
//                       }
                      
//                       return (
//                         <button
//                           key={pageNum}
//                           onClick={() => setCurrentPage(pageNum)}
//                           className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
//                             currentPage === pageNum
//                               ? 'bg-primary text-white shadow-sm'
//                               : 'text-gray-600 hover:bg-gray-100'
//                           }`}>
//                           {pageNum}
//                         </button>
//                       )
//                     })}
                    
//                     <button
//                       onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                       disabled={currentPage === totalPages}
//                       className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
//                       <ChevronRight className="h-4 w-4" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* MODAL CRÉATION UTILISATEUR */}
//       {showCreateModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
//             <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
//               <div>
//                 <h2 className="text-lg font-bold text-gray-900">Nouvel utilisateur</h2>
//                 <p className="text-xs text-gray-500">Créez un compte utilisateur</p>
//               </div>
//               <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
//                 <X className="h-5 w-5 text-gray-500" />
//               </button>
//             </div>

//             <div className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Nom d'utilisateur <span className="text-red-500">*</span>
//                 </label>
//                 <input type="text" value={formData.username}
//                   onChange={(e) => setFormData({...formData, username: e.target.value})}
//                   placeholder="Entrez le nom d'utilisateur"
//                   className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
//                     formErrors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                   }`} />
//                 {formErrors.username && <p className="text-xs text-red-500 mt-1">{formErrors.username}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Email <span className="text-red-500">*</span>
//                 </label>
//                 <input type="email" value={formData.email}
//                   onChange={(e) => setFormData({...formData, email: e.target.value})}
//                   placeholder="exemple@email.com"
//                   className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
//                     formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                   }`} />
//                 {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Mot de passe <span className="text-red-500">*</span>
//                 </label>
//                 <input type="password" value={formData.password}
//                   onChange={(e) => setFormData({...formData, password: e.target.value})}
//                   placeholder="Minimum 6 caractères"
//                   className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
//                     formErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                   }`} />
//                 {formErrors.password && <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>}
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Rôle <span className="text-red-500">*</span>
//                   </label>
//                   <select value={formData.role}
//                     onChange={(e) => setFormData({...formData, role: e.target.value as any})}
//                     className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary">
//                     <option value="promoteur">Promoteur</option>
//                     <option value="technique">Technique</option>
//                     <option value="credit">Crédit</option>
//                     <option value="admin">Admin</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
//                   <select value={formData.genre}
//                     onChange={(e) => setFormData({...formData, genre: e.target.value as any})}
//                     className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary">
//                     <option value="">Non spécifié</option>
//                     <option value="M">Masculin</option>
//                     <option value="F">Féminin</option>
//                   </select>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
//                 <input type="tel" value={formData.telephone}
//                   onChange={(e) => setFormData({...formData, telephone: e.target.value})}
//                   placeholder="+225 XX XX XX XX"
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
//               </div>

//               <button onClick={handleCreateUser} disabled={formLoading}
//                 className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm mt-2">
//                 {formLoading ? (
//                   <><Loader2 className="h-4 w-4 animate-spin" /> Création...</>
//                 ) : (
//                   <><UserPlus className="h-4 w-4" /> Créer l'utilisateur</>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* MODAL ÉDITION UTILISATEUR */}
//       {showEditModal && selectedUser && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
//             <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
//               <div>
//                 <h2 className="text-lg font-bold text-gray-900">Modifier l'utilisateur</h2>
//                 <p className="text-xs text-gray-500">{selectedUser.email}</p>
//               </div>
//               <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
//                 <X className="h-5 w-5 text-gray-500" />
//               </button>
//             </div>

//             <div className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Nom d'utilisateur <span className="text-red-500">*</span>
//                 </label>
//                 <input type="text" value={formData.username}
//                   onChange={(e) => setFormData({...formData, username: e.target.value})}
//                   className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
//                     formErrors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                   }`} />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
//                   <select value={formData.role}
//                     onChange={(e) => setFormData({...formData, role: e.target.value as any})}
//                     className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary">
//                     <option value="promoteur">Promoteur</option>
//                     <option value="technique">Technique</option>
//                     <option value="credit">Crédit</option>
//                     <option value="admin">Admin</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
//                   <select value={formData.genre}
//                     onChange={(e) => setFormData({...formData, genre: e.target.value as any})}
//                     className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary">
//                     <option value="">Non spécifié</option>
//                     <option value="M">Masculin</option>
//                     <option value="F">Féminin</option>
//                   </select>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
//                 <input type="tel" value={formData.telephone}
//                   onChange={(e) => setFormData({...formData, telephone: e.target.value})}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
//               </div>

//               <button onClick={handleEditUser} disabled={formLoading}
//                 className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm">
//                 {formLoading ? (
//                   <><Loader2 className="h-4 w-4 animate-spin" /> Modification...</>
//                 ) : (
//                   <><Edit className="h-4 w-4" /> Enregistrer les modifications</>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* MODAL DÉTAIL UTILISATEUR */}
//       {showDetailModal && selectedUser && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
//             <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
//               <div>
//                 <h2 className="text-lg font-bold text-gray-900">Détails de l'utilisateur</h2>
//               </div>
//               <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
//                 <X className="h-5 w-5 text-gray-500" />
//               </button>
//             </div>

//             <div className="p-6 space-y-4">
//               <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
//                 <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
//                   {selectedUser.photo_profil ? (
//                     <img src={selectedUser.photo_profil} className="w-full h-full rounded-xl object-cover" />
//                   ) : (
//                     <User className="h-8 w-8 text-primary" />
//                   )}
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900">{selectedUser.username}</h3>
//                   <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                     ROLES.find(r => r.value === selectedUser.role)?.color
//                   }`}>
//                     {ROLES.find(r => r.value === selectedUser.role)?.label}
//                   </span>
//                 </div>
//               </div>

//               <div className="space-y-3">
//                 <div className="flex items-center justify-between py-2 border-b border-gray-100">
//                   <span className="text-sm text-gray-600 flex items-center gap-2">
//                     <Mail className="h-4 w-4" /> Email
//                   </span>
//                   <span className="text-sm font-medium text-gray-900">{selectedUser.email}</span>
//                 </div>

//                 {selectedUser.telephone && (
//                   <div className="flex items-center justify-between py-2 border-b border-gray-100">
//                     <span className="text-sm text-gray-600 flex items-center gap-2">
//                       <Phone className="h-4 w-4" /> Téléphone
//                     </span>
//                     <span className="text-sm font-medium text-gray-900">{selectedUser.telephone}</span>
//                   </div>
//                 )}

//                 {selectedUser.genre && (
//                   <div className="flex items-center justify-between py-2 border-b border-gray-100">
//                     <span className="text-sm text-gray-600">Genre</span>
//                     <span className="text-sm font-medium text-gray-900">
//                       {selectedUser.genre === 'M' ? 'Masculin' : 'Féminin'}
//                     </span>
//                   </div>
//                 )}

//                 <div className="flex items-center justify-between py-2 border-b border-gray-100">
//                   <span className="text-sm text-gray-600 flex items-center gap-2">
//                     <Calendar className="h-4 w-4" /> Inscription
//                   </span>
//                   <span className="text-sm font-medium text-gray-900">{formatDate(selectedUser.created_at)}</span>
//                 </div>

//                 <div className="flex items-center justify-between py-2 border-b border-gray-100">
//                   <span className="text-sm text-gray-600">Projets</span>
//                   <span className="text-sm font-semibold text-primary">{selectedUser.projets_count}</span>
//                 </div>

//                 <div className="flex items-center justify-between py-2">
//                   <span className="text-sm text-gray-600">ID</span>
//                   <span className="text-xs text-gray-500 font-mono">{selectedUser.id}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* MODAL CHANGEMENT MOT DE PASSE */}
//       {showPasswordModal && selectedUser && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
//             <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
//               <div>
//                 <h2 className="text-lg font-bold text-gray-900">Changer le mot de passe</h2>
//                 <p className="text-xs text-gray-500">{selectedUser.email}</p>
//               </div>
//               <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
//                 <X className="h-5 w-5 text-gray-500" />
//               </button>
//             </div>

//             <div className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Nouveau mot de passe
//                 </label>
//                 <input type="password" value={newPassword}
//                   onChange={(e) => setNewPassword(e.target.value)}
//                   placeholder="Minimum 6 caractères"
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
//               </div>

//               <div className="flex gap-3">
//                 <button onClick={() => setShowPasswordModal(false)}
//                   className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm rounded-xl hover:bg-gray-50">
//                   Annuler
//                 </button>
//                 <button onClick={handleChangePassword}
//                   disabled={passwordLoading || newPassword.length < 6}
//                   className="flex-1 px-4 py-2.5 bg-orange-600 text-white text-sm font-medium rounded-xl hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2">
//                   {passwordLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
//                   Changer
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* MODAL SUPPRESSION */}
//       {showDeleteModal && selectedUser && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
//             <div className="px-6 py-4 border-b border-gray-100">
//               <div className="flex items-center gap-2">
//                 <AlertCircle className="h-5 w-5 text-red-500" />
//                 <h2 className="text-lg font-bold text-gray-900">Confirmer la suppression</h2>
//               </div>
//             </div>

//             <div className="p-6 space-y-4">
//               <p className="text-sm text-gray-700">
//                 Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{selectedUser.username}</strong> ?
//               </p>
              
//               <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
//                 <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
//                 <p className="text-xs text-red-700">
//                   Cette action est irréversible. Toutes les données associées à cet utilisateur seront définitivement supprimées.
//                 </p>
//               </div>

//               <div className="flex gap-3">
//                 <button onClick={() => setShowDeleteModal(false)}
//                   className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm rounded-xl hover:bg-gray-50">
//                   Annuler
//                 </button>
//                 <button onClick={handleDeleteUser} disabled={formLoading}
//                   className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
//                   {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
//                   Supprimer
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <style jsx>{`
//         @keyframes slideIn {
//           from { transform: translateX(100%); opacity: 0; }
//           to { transform: translateX(0); opacity: 1; }
//         }
//         .animate-slide-in { animation: slideIn 0.3s ease-out; }
//       `}</style>
//     </div>
//   )
// }

// app/dashboard/admin/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BarChart3, TrendingUp, TrendingDown, PieChart,
  FileText, CheckCircle, XCircle, Clock,
  Loader2, ChevronDown, Users, Target, DollarSign,
  Briefcase, MapPin, Shield, CreditCard, UserCheck,
  Calendar
} from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

// Types
type StatsGenerales = {
  totalProjets: number;
  totalUtilisateurs: number;
  totalPromoteurs: number;
  totalTechniciens: number;
  totalAgentsCredit: number;
  totalAdmins: number;
  projetsSoumis: number;
  projetsEnAnalyse: number;
  projetsEnComite: number;
  projetsApprouves: number;
  projetsRejetes: number;
  montantTotalSollicite: number;
  montantTotalApprouve: number;
  montantTotalRejete: number;
  totalEmplois: number;
  totalEntites: number;
  tauxApprobation: number;
  tauxRejet: number;
  projetsParMois: { mois: string; total: number; approuves: number }[];
  nouveauxUtilisateursParMois: { mois: string; total: number }[];
};

type ProvinceStat = {
  province: string;
  total: number;
  approuves: number;
  rejetes: number;
  montantTotal: number;
};

type SecteurStat = {
  secteur: string;
  total: number;
  approuves: number;
  rejetes: number;
  montantTotal: number;
};

// Couleurs
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];

export default function DashboardAdmin() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsGenerales>({
    totalProjets: 0,
    totalUtilisateurs: 0,
    totalPromoteurs: 0,
    totalTechniciens: 0,
    totalAgentsCredit: 0,
    totalAdmins: 0,
    projetsSoumis: 0,
    projetsEnAnalyse: 0,
    projetsEnComite: 0,
    projetsApprouves: 0,
    projetsRejetes: 0,
    montantTotalSollicite: 0,
    montantTotalApprouve: 0,
    montantTotalRejete: 0,
    totalEmplois: 0,
    totalEntites: 0,
    tauxApprobation: 0,
    tauxRejet: 0,
    projetsParMois: [],
    nouveauxUtilisateursParMois: [],
  });
  const [provinces, setProvinces] = useState<ProvinceStat[]>([]);
  const [secteurs, setSecteurs] = useState<SecteurStat[]>([]);
  const [showProvinceDetails, setShowProvinceDetails] = useState(false);
  const [showSecteurDetails, setShowSecteurDetails] = useState(false);

  useEffect(() => {
    chargerToutesLesStats();
  }, []);

  const chargerToutesLesStats = async () => {
    setLoading(true);
    try {
      const { data: projets } = await supabase
        .from('projets_fpi')
        .select('*')
        .order('created_at', { ascending: false });

      const projetsData = projets || [];

      const { data: users } = await supabase
        .from('users')
        .select('*');

      const usersData = users || [];

      const projetIds = projetsData.map(p => p.id);
      const { data: rapports } = await supabase
        .from('rapport_analyse')
        .select('*')
        .in('projet_id', projetIds);

      const projetsSoumis = projetsData.filter(p => p.etape === 'soumis' || p.etape === 'reçu').length;
      const projetsEnAnalyse = projetsData.filter(p => p.etape === 'analyse_tech').length;
      const projetsEnComite = projetsData.filter(p => p.etape === 'comité_crédit').length;
      const projetsApprouves = projetsData.filter(p => p.etape === 'financement_approuve').length;
      const projetsRejetes = projetsData.filter(p => p.etape === 'financement_rejete').length;

      const montantTotalSollicite = projetsData.reduce((sum, p) => sum + (Number(p.montant_sollicite) || 0), 0);
      const montantTotalApprouve = projetsData
        .filter(p => p.etape === 'financement_approuve')
        .reduce((sum, p) => sum + (Number(p.montant_sollicite) || 0), 0);
      const montantTotalRejete = projetsData
        .filter(p => p.etape === 'financement_rejete')
        .reduce((sum, p) => sum + (Number(p.montant_sollicite) || 0), 0);

      const totalEmplois = projetsData.reduce((sum, p) => sum + (Number(p.nombre_emplois) || 0), 0);
      const totalEntites = new Set(projetsData.filter(p => p.nom_entite).map(p => p.nom_entite)).size;

      const tauxApprobation = projetsData.length > 0 ? (projetsApprouves / projetsData.length) * 100 : 0;
      const tauxRejet = projetsData.length > 0 ? (projetsRejetes / projetsData.length) * 100 : 0;

      const promoteurs = usersData.filter(u => u.role === 'promoteur').length;
      const techniciens = usersData.filter(u => u.role === 'technique').length;
      const agentsCredit = usersData.filter(u => u.role === 'credit').length;
      const admins = usersData.filter(u => u.role === 'admin').length;

      const projetsParMois = getStatsParMois(projetsData);
      const nouveauxUtilisateursParMois = getUtilisateursParMois(usersData);

      setStats({
        totalProjets: projetsData.length,
        totalUtilisateurs: usersData.length,
        totalPromoteurs: promoteurs,
        totalTechniciens: techniciens,
        totalAgentsCredit: agentsCredit,
        totalAdmins: admins,
        projetsSoumis,
        projetsEnAnalyse,
        projetsEnComite,
        projetsApprouves,
        projetsRejetes,
        montantTotalSollicite,
        montantTotalApprouve,
        montantTotalRejete,
        totalEmplois,
        totalEntites,
        tauxApprobation,
        tauxRejet,
        projetsParMois,
        nouveauxUtilisateursParMois,
      });

      // Stats par province
      const provincesList = [...new Set(projetsData.map(p => p.promoteur_province).filter(Boolean))] as string[];
      const statsProvinces: ProvinceStat[] = provincesList.map(province => {
        const projetsProvince = projetsData.filter(p => p.promoteur_province === province);
        return {
          province,
          total: projetsProvince.length,
          approuves: projetsProvince.filter(p => p.etape === 'financement_approuve').length,
          rejetes: projetsProvince.filter(p => p.etape === 'financement_rejete').length,
          montantTotal: projetsProvince.reduce((sum, p) => sum + (Number(p.montant_sollicite) || 0), 0),
        };
      }).sort((a, b) => b.total - a.total);
      setProvinces(statsProvinces);

      // Stats par secteur
      const secteursList = [...new Set(projetsData.map(p => p.secteur_activite).filter(Boolean))] as string[];
      const statsSecteurs: SecteurStat[] = secteursList.map(secteur => {
        const projetsSecteur = projetsData.filter(p => p.secteur_activite === secteur);
        return {
          secteur,
          total: projetsSecteur.length,
          approuves: projetsSecteur.filter(p => p.etape === 'financement_approuve').length,
          rejetes: projetsSecteur.filter(p => p.etape === 'financement_rejete').length,
          montantTotal: projetsSecteur.reduce((sum, p) => sum + (Number(p.montant_sollicite) || 0), 0),
        };
      }).sort((a, b) => b.total - a.total);
      setSecteurs(statsSecteurs);

    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatsParMois = (projets: any[]) => {
    const mois: Record<string, { total: number; approuves: number }> = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      mois[key] = { total: 0, approuves: 0 };
    }

    projets.forEach(p => {
      const date = new Date(p.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (mois[key] !== undefined) {
        mois[key].total++;
        if (p.etape === 'financement_approuve') mois[key].approuves++;
      }
    });

    return Object.entries(mois).map(([key, value]) => ({
      mois: new Date(key + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      ...value,
    }));
  };

  const getUtilisateursParMois = (users: any[]) => {
    const mois: Record<string, number> = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      mois[key] = 0;
    }

    users.forEach(u => {
      const date = new Date(u.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (mois[key] !== undefined) mois[key]++;
    });

    return Object.entries(mois).map(([key, value]) => ({
      mois: new Date(key + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      total: value,
    }));
  };

  const formatMontant = (m: number): string => 
    new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'USD', 
      notation: 'compact',
      maximumFractionDigits: 1 
    }).format(m);

  // Données pour les Donuts
  const donutStatutData = [
    { name: 'Soumis', value: stats.projetsSoumis, color: '#3B82F6' },
    { name: 'En analyse', value: stats.projetsEnAnalyse, color: '#F59E0B' },
    { name: 'En comité', value: stats.projetsEnComite, color: '#8B5CF6' },
    { name: 'Approuvés', value: stats.projetsApprouves, color: '#10B981' },
    { name: 'Rejetés', value: stats.projetsRejetes, color: '#EF4444' },
  ].filter(item => item.value > 0);

  const donutUtilisateursData = [
    { name: 'Promoteurs', value: stats.totalPromoteurs, color: '#3B82F6' },
    { name: 'Techniciens', value: stats.totalTechniciens, color: '#10B981' },
    { name: 'Agents crédit', value: stats.totalAgentsCredit, color: '#F59E0B' },
    { name: 'Admins', value: stats.totalAdmins, color: '#8B5CF6' },
  ].filter(item => item.value > 0);

  const donutProvincesData = provinces.slice(0, 8).map((p, i) => ({
    name: p.province,
    value: p.total,
    color: COLORS[i % COLORS.length],
  }));

  const donutSecteursData = secteurs.slice(0, 8).map((s, i) => ({
    name: s.secteur,
    value: s.total,
    color: COLORS[i % COLORS.length],
  }));

  // Rendu du label personnalisé - CORRIGÉ pour être à l'extérieur
  const renderCustomLabel = useCallback(({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    // Positionner le label plus loin du centre
    const radius = outerRadius + 35;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Ne pas afficher les petits segments
    if (percent < 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="#4B5563"
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={11}
        fontWeight={500}
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  }, []);

  // Tooltip personnalisé
  const CustomTooltip = useCallback(({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = payload[0].payload.total || 
        donutStatutData.reduce((sum, d) => sum + d.value, 0);
      
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="text-sm font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{data.value}</span> projet{data.value > 1 ? 's' : ''}
          </p>
          {data.value > 0 && (
            <p className="text-xs text-gray-500">
              {((data.value / Math.max(total, 1)) * 100).toFixed(1)}% du total
            </p>
          )}
        </div>
      );
    }
    return null;
  }, [donutStatutData]);

  // Composant DonutChart réutilisable
  const DonutChart = ({ data, title, icon, total }: { 
    data: { name: string; value: number; color: string }[]; 
    title: string; 
    icon: React.ReactNode;
    total?: number;
  }) => {
    const dataWithTotal = data.map(d => ({ ...d, total: total || data.reduce((sum, item) => sum + item.value, 0) }));
    
    return (
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={380}>
            <RePieChart>
              <Pie
                data={dataWithTotal}
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                label={renderCustomLabel}
                labelLine={true}
                isAnimationActive={false}
                stroke="none"
              >
                {dataWithTotal.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={50}
                iconType="circle"
                iconSize={10}
                formatter={(value: string) => (
                  <span className="text-sm text-gray-600 ml-1">{value}</span>
                )}
              />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Chargement des statistiques globales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord administrateur</h1>
            <p className="text-sm text-gray-500">Vue d'ensemble de la plateforme FPI</p>
          </div>
        </div>
        <Link
          href="/dashboard/stats"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600  hover:bg-primary-dark transition-colors"
        >
          <BarChart3 className="h-4 w-4" />
          Statistiques détaillées
        </Link>
      </div>

      {/* KPIs Projets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg"><FileText className="h-5 w-5 text-blue-600" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.totalProjets}</p>
          <p className="text-xs text-gray-500">Total projets</p>
        </div>
        <div className="bg-white rounded-xl p-5 border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg"><CheckCircle className="h-5 w-5 text-green-600" /></div>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.projetsApprouves}</p>
          <p className="text-xs text-gray-500">Approuvés</p>
        </div>
        <div className="bg-white rounded-xl p-5 border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg"><XCircle className="h-5 w-5 text-red-600" /></div>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.projetsRejetes}</p>
          <p className="text-xs text-gray-500">Rejetés</p>
        </div>
        <div className="bg-white rounded-xl p-5 border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg"><Clock className="h-5 w-5 text-purple-600" /></div>
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.projetsSoumis + stats.projetsEnAnalyse + stats.projetsEnComite}</p>
          <p className="text-xs text-gray-500">En cours</p>
        </div>
      </div>

      {/* KPIs Utilisateurs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg"><Users className="h-5 w-5 text-indigo-600" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.totalUtilisateurs}</p>
          <p className="text-xs text-gray-500">Utilisateurs</p>
        </div>
        <div className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg"><Briefcase className="h-5 w-5 text-blue-600" /></div>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.totalPromoteurs}</p>
          <p className="text-xs text-gray-500">Promoteurs</p>
        </div>
        <div className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg"><Shield className="h-5 w-5 text-green-600" /></div>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.totalTechniciens}</p>
          <p className="text-xs text-gray-500">Techniciens</p>
        </div>
        <div className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 rounded-lg"><CreditCard className="h-5 w-5 text-amber-600" /></div>
          </div>
          <p className="text-2xl font-bold text-amber-600">{stats.totalAgentsCredit}</p>
          <p className="text-xs text-gray-500">Agents crédit</p>
        </div>
        <div className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg"><UserCheck className="h-5 w-5 text-purple-600" /></div>
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.totalAdmins}</p>
          <p className="text-xs text-gray-500">Admins</p>
        </div>
      </div>

      {/* Taux et montants */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Taux d'approbation</span>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.tauxApprobation.toFixed(1)}%</p>
          <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(stats.tauxApprobation, 100)}%` }}></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Taux de rejet</span>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.tauxRejet.toFixed(1)}%</p>
          <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${Math.min(stats.tauxRejet, 100)}%` }}></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Montant sollicité</span>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-blue-600">{formatMontant(stats.montantTotalSollicite)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Emplois prévus</span>
            <Users className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-xl font-bold text-indigo-600">{stats.totalEmplois}</p>
        </div>
      </div>

      {/* GRAPHIQUES DONUT - CORRIGÉS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChart 
          data={donutStatutData} 
          title="Projets par statut" 
          icon={<PieChart className="h-5 w-5 text-primary" />}
          total={stats.totalProjets}
        />
        <DonutChart 
          data={donutUtilisateursData} 
          title="Utilisateurs par rôle" 
          icon={<Users className="h-5 w-5 text-primary" />}
          total={stats.totalUtilisateurs}
        />
        <DonutChart 
          data={donutProvincesData} 
          title="Projets par province" 
          icon={<MapPin className="h-5 w-5 text-primary" />}
          total={provinces.reduce((sum, p) => sum + p.total, 0)}
        />
        <DonutChart 
          data={donutSecteursData} 
          title="Projets par secteur" 
          icon={<Briefcase className="h-5 w-5 text-primary" />}
          total={secteurs.reduce((sum, s) => sum + s.total, 0)}
        />
      </div>

      {/* Montants détaillés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Montant approuvé</p>
          <p className="text-2xl font-bold text-green-700">{formatMontant(stats.montantTotalApprouve)}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.projetsApprouves} projets</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-5 border border-red-200">
          <p className="text-sm text-gray-600 mb-1">Montant rejeté</p>
          <p className="text-2xl font-bold text-red-700">{formatMontant(stats.montantTotalRejete)}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.projetsRejetes} projets</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">En attente de décision</p>
          <p className="text-2xl font-bold text-blue-700">
            {formatMontant(stats.montantTotalSollicite - stats.montantTotalApprouve - stats.montantTotalRejete)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{stats.projetsSoumis + stats.projetsEnAnalyse + stats.projetsEnComite} projets</p>
        </div>
      </div>

      {/* Tableau des provinces */}
      <div className="bg-white rounded-xl border">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" /> Projets par province
          </h2>
          <button 
            onClick={() => setShowProvinceDetails(!showProvinceDetails)} 
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            {showProvinceDetails ? 'Masquer' : 'Afficher tout'}
            <ChevronDown className={`h-4 w-4 transition-transform ${showProvinceDetails ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <div className="p-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 font-medium text-gray-600">Province</th>
                <th className="text-center py-3 font-medium text-gray-600">Total</th>
                <th className="text-center py-3 font-medium text-gray-600">Approuvés</th>
                <th className="text-center py-3 font-medium text-gray-600">Rejetés</th>
                <th className="text-right py-3 font-medium text-gray-600">Montant</th>
              </tr>
            </thead>
            <tbody>
              {(showProvinceDetails ? provinces : provinces.slice(0, 5)).map(p => (
                <tr key={p.province} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-800">{p.province}</td>
                  <td className="text-center py-3">{p.total}</td>
                  <td className="text-center py-3"><span className="text-green-600 font-medium">{p.approuves}</span></td>
                  <td className="text-center py-3"><span className="text-red-600 font-medium">{p.rejetes}</span></td>
                  <td className="text-right py-3 text-gray-700">{formatMontant(p.montantTotal)}</td>
                </tr>
              ))}
              {provinces.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">Aucune donnée disponible</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tableau des secteurs */}
      <div className="bg-white rounded-xl border">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" /> Projets par secteur
          </h2>
          <button 
            onClick={() => setShowSecteurDetails(!showSecteurDetails)} 
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            {showSecteurDetails ? 'Masquer' : 'Afficher tout'}
            <ChevronDown className={`h-4 w-4 transition-transform ${showSecteurDetails ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <div className="p-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 font-medium text-gray-600">Secteur</th>
                <th className="text-center py-3 font-medium text-gray-600">Total</th>
                <th className="text-center py-3 font-medium text-gray-600">Approuvés</th>
                <th className="text-center py-3 font-medium text-gray-600">Rejetés</th>
                <th className="text-right py-3 font-medium text-gray-600">Montant</th>
              </tr>
            </thead>
            <tbody>
              {(showSecteurDetails ? secteurs : secteurs.slice(0, 5)).map(s => (
                <tr key={s.secteur} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-800">{s.secteur}</td>
                  <td className="text-center py-3">{s.total}</td>
                  <td className="text-center py-3"><span className="text-green-600 font-medium">{s.approuves}</span></td>
                  <td className="text-center py-3"><span className="text-red-600 font-medium">{s.rejetes}</span></td>
                  <td className="text-right py-3 text-gray-700">{formatMontant(s.montantTotal)}</td>
                </tr>
              ))}
              {secteurs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">Aucune donnée disponible</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activité récente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            Projets par mois
          </h3>
          <div className="space-y-3">
            {stats.projetsParMois.length > 0 ? stats.projetsParMois.map(m => {
              const maxTotal = Math.max(...stats.projetsParMois.map(x => x.total), 1);
              return (
                <div key={m.mois} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-14">{m.mois}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-4 rounded-full transition-all duration-500" 
                      style={{ width: `${(m.total / maxTotal) * 100}%` }} 
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-8 text-right">{m.total}</span>
                </div>
              );
            }) : (
              <p className="text-center py-4 text-gray-500 text-sm">Aucune donnée</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            Nouveaux utilisateurs par mois
          </h3>
          <div className="space-y-3">
            {stats.nouveauxUtilisateursParMois.length > 0 ? stats.nouveauxUtilisateursParMois.map(m => {
              const maxTotal = Math.max(...stats.nouveauxUtilisateursParMois.map(x => x.total), 1);
              return (
                <div key={m.mois} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-14">{m.mois}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-4 rounded-full transition-all duration-500" 
                      style={{ width: `${(m.total / maxTotal) * 100}%` }} 
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-8 text-right">{m.total}</span>
                </div>
              );
            }) : (
              <p className="text-center py-4 text-gray-500 text-sm">Aucune donnée</p>
            )}
          </div>
        </div>
      </div>

      {/* Résumé */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" /> Résumé global
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total entités légales</p>
            <p className="text-xl font-bold text-gray-800">{stats.totalEntites}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Moyenne par promoteur</p>
            <p className="text-xl font-bold text-gray-800">
              {stats.totalPromoteurs > 0 ? (stats.totalProjets / stats.totalPromoteurs).toFixed(1) : '0'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Taux de conversion</p>
            <p className="text-xl font-bold text-blue-600">
              {stats.totalProjets > 0 ? (((stats.projetsApprouves + stats.projetsRejetes) / stats.totalProjets) * 100).toFixed(1) : '0'}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Ratio approuvé/rejeté</p>
            <p className="text-xl font-bold text-gray-800">
              {stats.projetsRejetes > 0 ? (stats.projetsApprouves / stats.projetsRejetes).toFixed(1) : stats.projetsApprouves > 0 ? '∞' : '0'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}