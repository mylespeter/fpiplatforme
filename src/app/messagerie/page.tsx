
// // app/messagerie/page.tsx - Version corrigée avec gestion des clés uniques

// 'use client'

// import { useState, useEffect, useRef, useCallback } from 'react'
// import { useAuth } from '@/context/AuthContext'
// import { supabase } from '@/lib/supabase'
// import { 
//   MessageCircle, Search, Users, User, Shield, 
//   Loader2, ChevronRight, Clock, CheckCheck, Check,
//   FileText, Building2, Filter, X, Plus, Send,
//   ArrowLeft, UserCircle, Calendar, DollarSign,
//   Phone, Mail, MapPin, Briefcase, Tag, AlertCircle,
//   Eye, Menu, MoreVertical, Paperclip, Smile,
//   Image, Mic, SendHorizontal, CornerDownLeft,
//   MessagesSquare, Inbox, Sparkles
// } from 'lucide-react'
// import { format } from 'date-fns'
// import { fr } from 'date-fns/locale'

// // Types
// type Message = {
//   id: number
//   projet_id: number
//   expediteur_id: number
//   expediteur_type: 'promoteur' | 'technicien' | 'admin'
//   contenu: string
//   est_lu: boolean
//   lu_a: string | null
//   created_at: string
//   expediteur_nom?: string
// }

// type Conversation = {
//   projet_id: number
//   projet_nom: string
//   promoteur_id: number
//   promoteur_nom: string
//   promoteur_photo?: string
//   technicien_id: number | null
//   technicien_nom: string | null
//   technicien_photo?: string
//   dernier_message: string
//   dernier_message_date: string
//   dernier_message_expediteur_id: number
//   dernier_message_expediteur_type: string
//   dernier_message_expediteur_nom?: string
//   non_lus: number
//   etape: string
//   montant_sollicite: number | null
//   secteur_activite: string | null
//   created_at: string
//   updated_at: string
// }

// type Projet = {
//   id: number
//   nom_projet: string
//   promoteur_id: number
//   promoteur_nom: string
//   etape: string
//   montant_sollicite: number | null
//   secteur_activite: string | null
//   created_at: string
//   technicien_id: number | null
//   technicien_nom: string | null
//   a_des_messages: boolean
// }

// // Helper
// const getUserId = (user: any): number | null => {
//   if (!user?.id) return null
//   const uid = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id
//   return isNaN(uid) ? null : uid
// }

// export default function MessageriePage() {
//   const { user } = useAuth()
//   const userId = getUserId(user)
//   const userRole = user?.role || 'promoteur'
//   const isTechnicien = userRole === 'technique'
//   const isPromoteur = userRole === 'promoteur'

//   // États
//   const [conversations, setConversations] = useState<Conversation[]>([])
//   const [projets, setProjets] = useState<Projet[]>([])
//   const [loading, setLoading] = useState(true)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [selectedProjet, setSelectedProjet] = useState<number | null>(null)
//   const [selectedProjetNom, setSelectedProjetNom] = useState('')
//   const [selectedPromoteurId, setSelectedPromoteurId] = useState(0)
//   const [selectedTechnicienId, setSelectedTechnicienId] = useState<number | null>(null)
//   const [showMessagerie, setShowMessagerie] = useState(false)
//   const [messages, setMessages] = useState<Message[]>([])
//   const [newMessage, setNewMessage] = useState('')
//   const [sending, setSending] = useState(false)
//   const [loadingMessages, setLoadingMessages] = useState(false)
//   const [error, setError] = useState('')
//   const [activeTab, setActiveTab] = useState<'conversations' | 'projets'>('conversations')
//   const [filterProjets, setFilterProjets] = useState<'all' | 'with_messages' | 'without_messages'>('all')
//   const [isMobile, setIsMobile] = useState(false)
//   const [showMessageList, setShowMessageList] = useState(true)
  
//   // Refs
//   const messagesEndRef = useRef<HTMLDivElement>(null)
//   const inputRef = useRef<HTMLTextAreaElement>(null)
//   const channelRef = useRef<any>(null)

//   // Détecter le mobile
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768)
//     }
//     checkMobile()
//     window.addEventListener('resize', checkMobile)
//     return () => window.removeEventListener('resize', checkMobile)
//   }, [])

//   // Charger les données
//   useEffect(() => {
//     if (userId) {
//       chargerConversations()
//       chargerProjets()
//     }
//   }, [userId])

//   // S'abonner aux nouveaux messages
//   useEffect(() => {
//     if (userId && selectedProjet) {
//       sabonnerAuxMessages()
//     }
//     return () => {
//       if (channelRef.current) {
//         supabase.removeChannel(channelRef.current)
//       }
//     }
//   }, [selectedProjet, userId])

//   // Scroll en bas des messages
//   useEffect(() => {
//     if (showMessagerie) {
//       setTimeout(scrollToBottom, 200)
//     }
//   }, [messages, showMessagerie])

//   const chargerConversations = async () => {
//     if (!userId) return
//     setLoading(true)
//     setError('')

//     try {
//       const { data: messages, error: msgError } = await supabase
//         .from('messages_projet')
//         .select('*')
//         .order('created_at', { ascending: false })

//       if (msgError) throw msgError

//       const projetIds = [...new Set((messages || []).map(m => m.projet_id))]
      
//       if (projetIds.length === 0) {
//         setConversations([])
//         setLoading(false)
//         return
//       }

//       const { data: projetsData, error: projError } = await supabase
//         .from('projets_fpi')
//         .select('id, nom_projet, promoteur_id, etape, montant_sollicite, secteur_activite, created_at, updated_at')
//         .in('id', projetIds)

//       if (projError) throw projError

//       const userIds = [...new Set([
//         ...(messages || []).map(m => m.expediteur_id),
//         ...(projetsData || []).map(p => p.promoteur_id)
//       ])]

//       const { data: users, error: userError } = await supabase
//         .from('users')
//         .select('id, username, photo_profil')
//         .in('id', userIds)

//       if (userError) throw userError

//       const { data: rapports, error: rapportError } = await supabase
//         .from('rapport_analyse')
//         .select('projet_id, technicien_id')
//         .in('projet_id', projetIds)

//       if (rapportError) throw rapportError

//       const userMap = (users || []).reduce((acc: any, u: any) => {
//         const uid = typeof u.id === 'string' ? parseInt(u.id, 10) : u.id
//         acc[uid] = { nom: u.username, photo: u.photo_profil }
//         return acc
//       }, {})

//       const technicienMap = (rapports || []).reduce((acc: any, r: any) => ({
//         ...acc,
//         [r.projet_id]: typeof r.technicien_id === 'string' ? parseInt(r.technicien_id, 10) : r.technicien_id
//       }), {})

//       const convMap = new Map<number, Conversation>()

//       projetsData?.forEach((projet: any) => {
//         const messagesProjet = (messages || []).filter(m => m.projet_id === projet.id)
//         const dernierMsg = messagesProjet[0]
        
//         if (dernierMsg) {
//           const nonLus = messagesProjet.filter(
//             m => !m.est_lu && m.expediteur_id !== userId
//           ).length

//           const technicienId = technicienMap[projet.id] || null
//           const technicienInfo = technicienId ? userMap[technicienId] : null
//           const promoteurInfo = userMap[projet.promoteur_id]

//           if (isTechnicien && technicienId !== userId) return
//           if (isPromoteur && projet.promoteur_id !== userId) return

//           convMap.set(projet.id, {
//             projet_id: projet.id,
//             projet_nom: projet.nom_projet,
//             promoteur_id: projet.promoteur_id,
//             promoteur_nom: promoteurInfo?.nom || `Promoteur #${projet.promoteur_id}`,
//             promoteur_photo: promoteurInfo?.photo,
//             technicien_id: technicienId,
//             technicien_nom: technicienInfo?.nom || null,
//             technicien_photo: technicienInfo?.photo,
//             dernier_message: dernierMsg.contenu,
//             dernier_message_date: dernierMsg.created_at,
//             dernier_message_expediteur_id: dernierMsg.expediteur_id,
//             dernier_message_expediteur_type: dernierMsg.expediteur_type,
//             dernier_message_expediteur_nom: userMap[dernierMsg.expediteur_id]?.nom,
//             non_lus: nonLus,
//             etape: projet.etape || 'soumission',
//             montant_sollicite: projet.montant_sollicite,
//             secteur_activite: projet.secteur_activite,
//             created_at: projet.created_at,
//             updated_at: projet.updated_at
//           })
//         }
//       })

//       setConversations(Array.from(convMap.values()))
//     } catch (err: any) {
//       console.error('Erreur chargement conversations:', err)
//       setError(err.message || 'Erreur lors du chargement')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const chargerProjets = async () => {
//     if (!userId) return

//     try {
//       let query = supabase
//         .from('projets_fpi')
//         .select('id, nom_projet, promoteur_id, etape, montant_sollicite, secteur_activite, created_at')

//       if (isPromoteur) {
//         query = query.eq('promoteur_id', userId)
//       } else if (isTechnicien) {
//         const { data: rapports } = await supabase
//           .from('rapport_analyse')
//           .select('projet_id')
//           .eq('technicien_id', userId)
        
//         const projetIds = (rapports || []).map(r => r.projet_id)
//         if (projetIds.length > 0) {
//           query = query.in('id', projetIds)
//         } else {
//           setProjets([])
//           return
//         }
//       }

//       const { data, error } = await query.order('created_at', { ascending: false })

//       if (error) throw error

//       const promoteurIds = [...new Set((data || []).map(p => p.promoteur_id))]
//       const { data: users } = await supabase
//         .from('users')
//         .select('id, username')
//         .in('id', promoteurIds)

//       const userMap = (users || []).reduce((acc: any, u: any) => {
//         const uid = typeof u.id === 'string' ? parseInt(u.id, 10) : u.id
//         acc[uid] = u.username
//         return acc
//       }, {})

//       const projetIds = (data || []).map(p => p.id)
//       const { data: messages } = await supabase
//         .from('messages_projet')
//         .select('projet_id')
//         .in('projet_id', projetIds)

//       const projetsAvecMessages = new Set((messages || []).map(m => m.projet_id))

//       const projetsFormatted: Projet[] = (data || []).map((p: any) => ({
//         id: p.id,
//         nom_projet: p.nom_projet,
//         promoteur_id: p.promoteur_id,
//         promoteur_nom: userMap[p.promoteur_id] || `Promoteur #${p.promoteur_id}`,
//         etape: p.etape || 'soumission',
//         montant_sollicite: p.montant_sollicite,
//         secteur_activite: p.secteur_activite,
//         created_at: p.created_at,
//         technicien_id: null,
//         technicien_nom: null,
//         a_des_messages: projetsAvecMessages.has(p.id)
//       }))

//       setProjets(projetsFormatted)
//     } catch (err: any) {
//       console.error('Erreur chargement projets:', err)
//     }
//   }

//   const chargerMessages = async (projetId: number) => {
//     setLoadingMessages(true)
//     try {
//       const { data, error } = await supabase
//         .from('messages_projet')
//         .select('*')
//         .eq('projet_id', projetId)
//         .order('created_at', { ascending: true })

//       if (error) throw error

//       const userIds = [...new Set((data || []).map(m => m.expediteur_id))]
//       const { data: users } = await supabase
//         .from('users')
//         .select('id, username')
//         .in('id', userIds)

//       const userMap = (users || []).reduce((acc: any, u: any) => {
//         const uid = typeof u.id === 'string' ? parseInt(u.id, 10) : u.id
//         acc[uid] = u.username
//         return acc
//       }, {})

//       const messagesEnrichis = (data || []).map(m => ({
//         ...m,
//         expediteur_nom: userMap[m.expediteur_id] || `Utilisateur #${m.expediteur_id}`
//       }))

//       setMessages(messagesEnrichis)
//       marquerCommeLu(messagesEnrichis)
//     } catch (err: any) {
//       setError(err.message)
//     } finally {
//       setLoadingMessages(false)
//     }
//   }

//   const marquerCommeLu = (msgs: Message[]) => {
//     if (!userId) return
    
//     const messagesNonLus = msgs.filter(
//       m => !m.est_lu && m.expediteur_id !== userId
//     )
    
//     if (messagesNonLus.length > 0) {
//       const ids = messagesNonLus.map(m => m.id)
//       supabase
//         .from('messages_projet')
//         .update({ est_lu: true, lu_a: new Date().toISOString() })
//         .in('id', ids)
//         .then(() => {
//           setMessages(prev => 
//             prev.map(m => 
//               ids.includes(m.id) ? { ...m, est_lu: true, lu_a: new Date().toISOString() } : m
//             )
//           )
//         })
//     }
//   }

//   const sabonnerAuxMessages = () => {
//     if (channelRef.current) {
//       supabase.removeChannel(channelRef.current)
//     }

//     if (!selectedProjet) return

//     const channel = supabase
//       .channel(`messages_projet_${selectedProjet}`)
//       .on(
//         'postgres_changes',
//         {
//           event: 'INSERT',
//           schema: 'public',
//           table: 'messages_projet',
//           filter: `projet_id=eq.${selectedProjet}`
//         },
//         async (payload) => {
//           const newMsg = payload.new as Message
          
//           const { data: users } = await supabase
//             .from('users')
//             .select('id, username')
//             .eq('id', newMsg.expediteur_id)

//           const msgEnrichi = {
//             ...newMsg,
//             expediteur_nom: users?.[0]?.username || `Utilisateur #${newMsg.expediteur_id}`
//           }
          
//           setMessages(prev => {
//             // Vérifier si le message existe déjà
//             const exists = prev.some(m => m.id === msgEnrichi.id)
//             if (exists) return prev
//             return [...prev, msgEnrichi]
//           })
          
//           if (newMsg.expediteur_id !== userId) {
//             await supabase
//               .from('messages_projet')
//               .update({ est_lu: true, lu_a: new Date().toISOString() })
//               .eq('id', newMsg.id)
            
//             chargerConversations()
//           }
          
//           setTimeout(scrollToBottom, 100)
//         }
//       )
//       .subscribe()

//     channelRef.current = channel
//   }

//   const envoyerMessage = async () => {
//     if (!newMessage.trim() || sending || !userId || !selectedProjet) return
    
//     setSending(true)
//     setError('')
    
//     try {
//       const userType = isPromoteur ? 'promoteur' : 'technicien'
      
//       const { data, error } = await supabase
//         .from('messages_projet')
//         .insert({
//           projet_id: selectedProjet,
//           expediteur_id: userId,
//           expediteur_type: userType,
//           contenu: newMessage.trim()
//         })
//         .select()
//         .single()

//       if (error) throw error
      
//       const msgEnrichi = {
//         ...data,
//         expediteur_nom: user?.username || 'Moi'
//       }
//       setMessages(prev => [...prev, msgEnrichi])
//       setNewMessage('')
      
//       setTimeout(scrollToBottom, 100)
      
//       const destinataireId = isPromoteur ? selectedTechnicienId : selectedPromoteurId
//       if (destinataireId) {
//         try {
//           await fetch('/api/push/send', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//               userId: destinataireId,
//               notification: {
//                 title: `📩 Nouveau message - ${selectedProjetNom}`,
//                 body: `${user?.username || 'Utilisateur'}: ${newMessage.trim().slice(0, 100)}${newMessage.trim().length > 100 ? '...' : ''}`,
//                 url: `/messagerie?projet=${selectedProjet}`,
//                 type: 'info',
//                 projetId: selectedProjet
//               }
//             })
//           })
//         } catch (pushError) {}
//       }
      
//       chargerConversations()
      
//     } catch (err: any) {
//       setError(err.message || 'Erreur lors de l\'envoi')
//     } finally {
//       setSending(false)
//     }
//   }

//   const ouvrirMessagerie = async (conv: Conversation) => {
//     setSelectedProjet(conv.projet_id)
//     setSelectedProjetNom(conv.projet_nom)
//     setSelectedPromoteurId(conv.promoteur_id)
//     setSelectedTechnicienId(conv.technicien_id)
//     setShowMessagerie(true)
//     if (isMobile) setShowMessageList(false)
//     await chargerMessages(conv.projet_id)
//   }

//   const ouvrirMessagerieProjet = async (projet: Projet) => {
//     setSelectedProjet(projet.id)
//     setSelectedProjetNom(projet.nom_projet)
//     setSelectedPromoteurId(projet.promoteur_id)
//     setSelectedTechnicienId(null)
//     setShowMessagerie(true)
//     if (isMobile) setShowMessageList(false)
//     await chargerMessages(projet.id)
//   }

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault()
//       envoyerMessage()
//     }
//   }

//   const getEtapeLabel = (etape: string) => {
//     const labels: Record<string, string> = {
//       'soumission': 'Soumis',
//       'analyse_tech': 'Analyse technique',
//       'comité_crédit': 'Comité crédit',
//       'financement_approuve': '✅ Approuvé',
//       'financement_rejete': '❌ Refusé'
//     }
//     return labels[etape] || etape
//   }

//   const getEtapeColor = (etape: string) => {
//     const colors: Record<string, string> = {
//       'soumission': 'bg-blue-100 text-blue-700',
//       'analyse_tech': 'bg-purple-100 text-purple-700',
//       'comité_crédit': 'bg-green-100 text-green-700',
//       'financement_approuve': 'bg-emerald-100 text-emerald-700',
//       'financement_rejete': 'bg-red-100 text-red-700'
//     }
//     return colors[etape] || 'bg-gray-100 text-gray-700'
//   }

//   const formatDate = (d: string) => {
//     const date = new Date(d)
//     const now = new Date()
//     const diff = now.getTime() - date.getTime()
    
//     if (diff < 60000) return 'à l\'instant'
//     if (diff < 3600000) return `il y a ${Math.floor(diff / 60000)} min`
//     if (diff < 86400000) return `il y a ${Math.floor(diff / 3600000)} h`
//     if (diff < 172800000) return 'hier'
//     return format(date, 'dd MMM', { locale: fr })
//   }

//   const getAvatar = (message: Message) => {
//     const isMe = message.expediteur_id === userId
    
//     if (isMe) {
//       return (
//         <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg shadow-blue-500/25">
//           {user?.username?.[0]?.toUpperCase() || 'M'}
//         </div>
//       )
//     }
    
//     const isTechnicien = message.expediteur_type === 'technicien'
//     return (
//       <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-md ${
//         isTechnicien ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
//       }`}>
//         {message.expediteur_nom?.[0]?.toUpperCase() || '?'}
//       </div>
//     )
//   }

//   // Filtrer les conversations
//   const filteredConversations = conversations.filter(conv =>
//     conv.projet_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     conv.promoteur_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     (conv.technicien_nom && conv.technicien_nom.toLowerCase().includes(searchTerm.toLowerCase()))
//   )

//   // Filtrer les projets
//   const filteredProjets = projets.filter(projet => {
//     const matchSearch = projet.nom_projet.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       projet.promoteur_nom.toLowerCase().includes(searchTerm.toLowerCase())
    
//     if (!matchSearch) return false
    
//     if (filterProjets === 'with_messages') return projet.a_des_messages
//     if (filterProjets === 'without_messages') return !projet.a_des_messages
    
//     return true
//   })

//   const totalNonLus = conversations.reduce((acc, conv) => acc + conv.non_lus, 0)

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//         <div className="text-center">
//           <div className="relative">
//             <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
//             <div className="absolute inset-0 flex items-center justify-center">
//               <MessageCircle className="h-5 w-5 text-blue-400" />
//             </div>
//           </div>
//           <p className="mt-4 text-sm text-gray-500 font-medium">Chargement de la messagerie...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
//       {/* En-tête */}
//       <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//           <div className="flex items-center gap-3">
//             <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25 hidden sm:flex">
//               <MessagesSquare className="h-6 w-6 text-white" />
//             </div>
//             <div>
//               <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
//                 Messagerie
//                 {totalNonLus > 0 && (
//                   <span className="px-2.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
//                     {totalNonLus > 99 ? '99+' : totalNonLus}
//                   </span>
//                 )}
//               </h1>
//               <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
//                 {isPromoteur ? 'Échangez avec les techniciens sur vos projets' : 'Échangez avec les promoteurs'}
//               </p>
//             </div>
//           </div>
          
//           <div className="flex items-center gap-2 sm:gap-3">
//             <div className="relative flex-1 sm:flex-none">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Rechercher..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full sm:w-64 pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
//               />
//             </div>
//             <button
//               onClick={() => {
//                 chargerConversations()
//                 chargerProjets()
//               }}
//               className="p-2 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
//               title="Rafraîchir"
//             >
//               <Loader2 className={`h-5 w-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 overflow-x-auto">
//         <div className="flex gap-1 min-w-max">
//           <button
//             onClick={() => setActiveTab('conversations')}
//             className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
//               activeTab === 'conversations'
//                 ? 'border-blue-500 text-blue-600'
//                 : 'border-transparent text-gray-500 hover:text-gray-700'
//             }`}
//           >
//             <span className="flex items-center gap-2">
//               <MessageCircle className="h-4 w-4" />
//               <span className="hidden sm:inline">Conversations</span>
//               <span className="sm:hidden">Conv.</span>
//               <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
//                 {conversations.length}
//               </span>
//             </span>
//           </button>
//           <button
//             onClick={() => setActiveTab('projets')}
//             className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
//               activeTab === 'projets'
//                 ? 'border-blue-500 text-blue-600'
//                 : 'border-transparent text-gray-500 hover:text-gray-700'
//             }`}
//           >
//             <span className="flex items-center gap-2">
//               <FileText className="h-4 w-4" />
//               Projets
//               <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
//                 {projets.length}
//               </span>
//             </span>
//           </button>
//           {totalNonLus > 0 && (
//             <div className="ml-auto flex items-center text-xs text-red-500 font-medium">
//               <span className="bg-red-50 px-3 py-1 rounded-full flex items-center gap-1">
//                 <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
//                 {totalNonLus} non lu{totalNonLus > 1 ? 's' : ''}
//               </span>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Contenu principal */}
//       <div className="flex-1 overflow-hidden flex">
//         {/* Liste des conversations/projets */}
//         <div className={`${
//           isMobile && showMessagerie && !showMessageList ? 'hidden' : 'flex'
//         } w-full md:w-96 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto`}>
//           {activeTab === 'conversations' ? (
//             <div className="p-2 sm:p-3 space-y-1 sm:space-y-2 w-full">
//               {filteredConversations.length === 0 ? (
//                 <div className="text-center py-12 sm:py-16">
//                   <Inbox className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//                   <p className="text-gray-500 font-medium">Aucune conversation</p>
//                   <p className="text-sm text-gray-400 mt-1 px-4">
//                     {searchTerm ? 'Aucun résultat pour cette recherche' : 'Les conversations apparaîtront ici'}
//                   </p>
//                 </div>
//               ) : (
//                 filteredConversations.map((conv) => (
//                   <div
//                     key={`conv-${conv.projet_id}`}
//                     onClick={() => ouvrirMessagerie(conv)}
//                     className={`group p-2 sm:p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all border border-transparent hover:border-gray-200 ${
//                       selectedProjet === conv.projet_id ? 'bg-blue-50 border-blue-200' : ''
//                     }`}
//                   >
//                     <div className="flex items-start gap-2 sm:gap-3">
//                       <div className={`flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center ${
//                         selectedProjet === conv.projet_id 
//                           ? 'bg-blue-200' 
//                           : 'bg-gradient-to-br from-blue-50 to-blue-100'
//                       }`}>
//                         <FileText className={`h-5 w-5 ${
//                           selectedProjet === conv.projet_id ? 'text-blue-700' : 'text-blue-600'
//                         }`} />
//                       </div>

//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-start justify-between gap-2">
//                           <div className="flex-1 min-w-0">
//                             <p className={`text-sm font-semibold truncate ${
//                               selectedProjet === conv.projet_id ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-600'
//                             } transition-colors`}>
//                               {conv.projet_nom}
//                             </p>
//                             <div className="flex items-center gap-1 mt-0.5 flex-wrap">
//                               <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getEtapeColor(conv.etape)}`}>
//                                 {getEtapeLabel(conv.etape)}
//                               </span>
//                               <span className="text-[10px] text-gray-400 hidden sm:inline">•</span>
//                               <span className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[80px] sm:max-w-[120px]">
//                                 {isPromoteur ? conv.technicien_nom || 'En attente' : conv.promoteur_nom}
//                               </span>
//                             </div>
//                           </div>
//                           <div className="flex flex-col items-end gap-1 flex-shrink-0">
//                             <span className="text-[10px] text-gray-400 whitespace-nowrap">
//                               {formatDate(conv.dernier_message_date)}
//                             </span>
//                             {conv.non_lus > 0 && (
//                               <span className="min-w-[20px] h-[20px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 animate-pulse">
//                                 {conv.non_lus > 9 ? '9+' : conv.non_lus}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                         <div className="mt-0.5">
//                           <p className="text-xs text-gray-500 truncate">
//                             <span className="text-gray-400">
//                               {conv.dernier_message_expediteur_id === userId ? 'Moi:' : 
//                                conv.dernier_message_expediteur_nom ? `${conv.dernier_message_expediteur_nom}:` : 'Utilisateur:'}
//                             </span>{' '}
//                             {conv.dernier_message}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           ) : (
//             <div className="p-2 sm:p-3 space-y-2 sm:space-y-3 w-full">
//               <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1">
//                 <button
//                   onClick={() => setFilterProjets('all')}
//                   className={`px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs rounded-full transition-colors whitespace-nowrap ${
//                     filterProjets === 'all'
//                       ? 'bg-blue-100 text-blue-700'
//                       : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                   }`}
//                 >
//                   Tous
//                 </button>
//                 <button
//                   onClick={() => setFilterProjets('with_messages')}
//                   className={`px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs rounded-full transition-colors whitespace-nowrap ${
//                     filterProjets === 'with_messages'
//                       ? 'bg-green-100 text-green-700'
//                       : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                   }`}
//                 >
//                   💬 Messages
//                 </button>
//                 <button
//                   onClick={() => setFilterProjets('without_messages')}
//                   className={`px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs rounded-full transition-colors whitespace-nowrap ${
//                     filterProjets === 'without_messages'
//                       ? 'bg-orange-100 text-orange-700'
//                       : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                   }`}
//                 >
//                   📭 Sans
//                 </button>
//               </div>

//               {filteredProjets.length === 0 ? (
//                 <div className="text-center py-12 sm:py-16">
//                   <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//                   <p className="text-gray-500 font-medium">Aucun projet</p>
//                   <p className="text-sm text-gray-400 mt-1 px-4">
//                     {searchTerm ? 'Aucun résultat' : 'Aucun projet disponible'}
//                   </p>
//                 </div>
//               ) : (
//                 filteredProjets.map((projet) => (
//                   <div
//                     key={`projet-${projet.id}`}
//                     onClick={() => ouvrirMessagerieProjet(projet)}
//                     className="group p-2 sm:p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all border border-gray-100 hover:border-blue-200"
//                   >
//                     <div className="flex items-center gap-2 sm:gap-3">
//                       <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
//                         <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-center gap-1.5 sm:gap-2">
//                           <p className="text-xs sm:text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
//                             {projet.nom_projet}
//                           </p>
//                           <span className={`px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-medium ${getEtapeColor(projet.etape)} flex-shrink-0`}>
//                             {getEtapeLabel(projet.etape)}
//                           </span>
//                         </div>
//                         <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 mt-0.5">
//                           <span className="flex items-center gap-0.5 sm:gap-1">
//                             <User className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
//                             <span className="truncate max-w-[60px] sm:max-w-none">{projet.promoteur_nom}</span>
//                           </span>
//                           {projet.montant_sollicite && (
//                             <>
//                               <span className="text-gray-300">•</span>
//                               <span className="font-medium text-gray-700 text-[10px] sm:text-xs">
//                                 {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(projet.montant_sollicite)}
//                               </span>
//                             </>
//                           )}
//                           {projet.a_des_messages && (
//                             <span className="ml-auto flex items-center gap-1 text-blue-600 text-[10px] flex-shrink-0">
//                               <Sparkles className="h-3 w-3" />
//                               <span className="hidden sm:inline">Messages</span>
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                       <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-600 transition-colors flex-shrink-0" />
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           )}
//         </div>

//         {/* Zone de messagerie */}
//         <div className={`flex-1 flex flex-col bg-white ${
//           isMobile && (!showMessagerie || showMessageList) ? 'hidden' : 'flex'
//         }`}>
//           {showMessagerie && selectedProjet ? (
//             <>
//               {/* En-tête de la messagerie */}
//               <div className="flex-shrink-0 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50/50 to-white">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2 sm:gap-3 min-w-0">
//                     {isMobile && (
//                       <button
//                         onClick={() => setShowMessageList(true)}
//                         className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
//                       >
//                         <ArrowLeft className="h-5 w-5 text-gray-500" />
//                       </button>
//                     )}
//                     <div className="flex items-center gap-2 sm:gap-3 min-w-0">
//                       <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
//                         <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-700" />
//                       </div>
//                       <div className="min-w-0">
//                         <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
//                           {selectedProjetNom}
//                         </h3>
//                         <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
//                           <span className="flex items-center gap-0.5 sm:gap-1">
//                             <User className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
//                             <span className="truncate max-w-[60px] sm:max-w-none">
//                               {selectedPromoteurId ? `Promoteur` : 'En attente'}
//                             </span>
//                           </span>
//                           {selectedTechnicienId && (
//                             <>
//                               <span className="text-gray-300">•</span>
//                               <span className="flex items-center gap-0.5 sm:gap-1">
//                                 <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
//                                 <span className="truncate max-w-[60px] sm:max-w-none">Technicien</span>
//                               </span>
//                             </>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="flex items-center gap-1">
//                     <button
//                       onClick={() => chargerMessages(selectedProjet)}
//                       className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
//                       title="Rafraîchir"
//                     >
//                       <Loader2 className="h-4 w-4" />
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Messages - CORRECTION DE LA CLÉ */}
//               <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3 bg-gradient-to-b from-gray-50/30 to-white">
//                 {loadingMessages ? (
//                   <div className="flex items-center justify-center h-32">
//                     <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
//                   </div>
//                 ) : messages.length === 0 ? (
//                   <div className="flex flex-col items-center justify-center h-full text-center">
//                     <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center mb-3 sm:mb-4">
//                       <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300" />
//                     </div>
//                     <h4 className="text-base sm:text-lg font-semibold text-gray-700">Aucun message</h4>
//                     <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xs">
//                       Commencez une conversation en envoyant un message ci-dessous
//                     </p>
//                   </div>
//                 ) : (
//                   // Utiliser une clé basée sur l'index + l'ID pour garantir l'unicité
//                   messages.map((msg, index) => {
//                     const isMe = msg.expediteur_id === userId
//                     const isTechnicien = msg.expediteur_type === 'technicien'
//                     const showDate = index === 0 || 
//                       new Date(msg.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString()
                    
//                     // Clé unique combinant ID et index
//                     const key = `msg-${msg.id}-${index}-${msg.created_at}`
                    
//                     return (
//                       <div key={key}>
//                         {showDate && (
//                           <div className="text-center my-3 sm:my-4">
//                             <span className="text-[10px] sm:text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
//                               {format(new Date(msg.created_at), 'EEEE d MMMM yyyy', { locale: fr })}
//                             </span>
//                           </div>
//                         )}
                        
//                         <div className={`flex items-start gap-2 sm:gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
//                           <div className="flex-shrink-0 hidden sm:block">
//                             {getAvatar(msg)}
//                           </div>
//                           <div className="flex-shrink-0 sm:hidden">
//                             <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
//                               isMe ? 'bg-blue-600 text-white' : 
//                               isTechnicien ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
//                             }`}>
//                               {isMe ? 'M' : (msg.expediteur_nom?.[0]?.toUpperCase() || '?')}
//                             </div>
//                           </div>
                          
//                           <div className={`flex-1 max-w-[80%] sm:max-w-[75%] ${isMe ? 'items-end' : ''}`}>
//                             <div className={`flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
//                               <span className={`text-[10px] sm:text-xs font-medium ${
//                                 isMe ? 'text-gray-700' : isTechnicien ? 'text-purple-700' : 'text-green-700'
//                               }`}>
//                                 {isMe ? 'Moi' : msg.expediteur_nom || (isTechnicien ? 'Technicien' : 'Promoteur')}
//                               </span>
//                               <span className="text-[8px] sm:text-[10px] text-gray-400">
//                                 {format(new Date(msg.created_at), 'HH:mm')}
//                               </span>
//                               {isMe && (
//                                 <span className="text-[8px] sm:text-[10px] text-gray-400">
//                                   {msg.est_lu ? <CheckCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500" /> : <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
//                                 </span>
//                               )}
//                             </div>
                            
//                             <div className={`p-2.5 sm:p-3 rounded-2xl ${
//                               isMe 
//                                 ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-500/20' 
//                                 : isTechnicien 
//                                   ? 'bg-purple-50 text-gray-800 rounded-tl-none border border-purple-100'
//                                   : 'bg-white text-gray-800 rounded-tl-none border border-gray-200 shadow-sm'
//                             }`}>
//                               <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">
//                                 {msg.contenu}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )
//                   })
//                 )}
//                 <div ref={messagesEndRef} />
//               </div>

//               {/* Erreur */}
//               {error && (
//                 <div className="flex-shrink-0 px-3 sm:px-4 py-2 bg-red-50 border-t border-red-100">
//                   <div className="flex items-center gap-2 text-xs text-red-600">
//                     <AlertCircle className="h-4 w-4 flex-shrink-0" />
//                     <span>{error}</span>
//                   </div>
//                 </div>
//               )}

//               {/* Zone de saisie */}
//               <div className="flex-shrink-0 p-2 sm:p-4 border-t border-gray-200 bg-white">
//                 <div className="flex items-end gap-2">
//                   <div className="flex-1 relative">
//                     <textarea
//                       ref={inputRef}
//                       value={newMessage}
//                       onChange={(e) => setNewMessage(e.target.value)}
//                       onKeyDown={handleKeyDown}
//                       placeholder="Écrire un message..."
//                       rows={1}
//                       className="w-full resize-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[40px] sm:min-h-[44px] max-h-[100px]"
//                       style={{ height: 'auto' }}
//                     />
//                     <kbd className="absolute bottom-1.5 sm:bottom-2 right-2 text-[8px] sm:text-[10px] text-gray-400 bg-gray-100 px-1 py-0.5 rounded hidden sm:block">
//                       Enter ↵
//                     </kbd>
//                   </div>
                  
//                   <button
//                     onClick={envoyerMessage}
//                     disabled={!newMessage.trim() || sending}
//                     className="flex-shrink-0 p-2.5 sm:p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25"
//                   >
//                     {sending ? (
//                       <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
//                     ) : (
//                       <SendHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
//                     )}
//                   </button>
//                 </div>
//                 <div className="flex items-center justify-between mt-1 px-1">
//                   <div className="flex items-center gap-2 text-[8px] sm:text-[10px] text-gray-400">
//                     <span className="hidden sm:inline">
//                       Appuyez sur <kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter</kbd> pour envoyer
//                     </span>
//                     <span className="hidden sm:inline">•</span>
//                     <span className="hidden sm:inline">
//                       <kbd className="px-1 py-0.5 bg-gray-100 rounded">Shift</kbd> + <kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter</kbd> pour sauter une ligne
//                     </span>
//                     <span className="sm:hidden">
//                       <kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter</kbd> ↲
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </>
//           ) : (
//             // Vue vide
//             <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50/30 to-white">
//               <div className="text-center max-w-sm px-4">
//                 <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg shadow-blue-500/10">
//                   <MessagesSquare className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
//                 </div>
//                 <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
//                   {activeTab === 'conversations' ? 'Choisissez une conversation' : 'Sélectionnez un projet'}
//                 </h3>
//                 <p className="text-sm text-gray-500">
//                   {activeTab === 'conversations' 
//                     ? 'Sélectionnez une conversation dans la liste pour commencer à discuter'
//                     : 'Choisissez un projet pour démarrer une nouvelle discussion'
//                   }
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// app/messagerie/page.tsx - Version optimisée et corrigée

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { 
  MessageCircle, Search, Users, User, Shield, 
  Loader2, ChevronRight, Clock, CheckCheck, Check,
  FileText, Building2, Filter, X, Plus, Send,
  ArrowLeft, UserCircle, Calendar, DollarSign,
  Phone, Mail, MapPin, Briefcase, Tag, AlertCircle,
  Eye, Menu, MoreVertical, Paperclip, Smile,
  Image, Mic, SendHorizontal, CornerDownLeft,
  MessagesSquare, Inbox, Sparkles, RefreshCw,
  Bell, BellOff, Info, Star
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// Types
type Message = {
  id: number
  projet_id: number
  expediteur_id: number
  expediteur_type: 'promoteur' | 'technicien' | 'admin'
  contenu: string
  est_lu: boolean
  lu_a: string | null
  created_at: string
  expediteur_nom?: string
  expediteur_avatar?: string
}

type Conversation = {
  projet_id: number
  projet_nom: string
  promoteur_id: number
  promoteur_nom: string
  promoteur_photo?: string | null
  technicien_id: number | null
  technicien_nom: string | null
  technicien_photo?: string | null
  dernier_message: string
  dernier_message_date: string
  dernier_message_expediteur_id: number
  dernier_message_expediteur_type: string
  dernier_message_expediteur_nom?: string
  non_lus: number
  etape: string
  montant_sollicite: number | null
  secteur_activite: string | null
  created_at: string
  updated_at: string
}

type Projet = {
  id: number
  nom_projet: string
  promoteur_id: number
  promoteur_nom: string
  promoteur_photo?: string | null
  etape: string
  montant_sollicite: number | null
  secteur_activite: string | null
  created_at: string
  technicien_id: number | null
  technicien_nom: string | null
  technicien_photo?: string | null
  a_des_messages: boolean
}

// Helper
const getUserId = (user: any): number | null => {
  if (!user?.id) return null
  const uid = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id
  return isNaN(uid) ? null : uid
}

// Messages prédéfinis
const quickReplies = [
  "Bonjour, comment avance mon projet ?",
  "Merci pour votre retour !",
  "Pouvez-vous me donner plus de détails ?",
  "Je vous envoie les documents demandés.",
  "Quand aura lieu la prochaine réunion ?",
  "Le financement est-il approuvé ?"
]

export default function MessageriePage() {
  const { user } = useAuth()
  const userId = getUserId(user)
  const userRole = user?.role || 'promoteur'
  const isTechnicien = userRole === 'technique'
  const isPromoteur = userRole === 'promoteur'

  // États
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [projets, setProjets] = useState<Projet[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProjet, setSelectedProjet] = useState<number | null>(null)
  const [selectedProjetNom, setSelectedProjetNom] = useState('')
  const [selectedPromoteurId, setSelectedPromoteurId] = useState(0)
  const [selectedTechnicienId, setSelectedTechnicienId] = useState<number | null>(null)
  const [showMessagerie, setShowMessagerie] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'conversations' | 'projets'>('conversations')
  const [filterProjets, setFilterProjets] = useState<'all' | 'with_messages' | 'without_messages'>('all')
  const [isMobile, setIsMobile] = useState(false)
  const [showMessageList, setShowMessageList] = useState(true)
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const channelRef = useRef<any>(null)

  // Détecter le mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Charger les données initiales
  useEffect(() => {
    if (userId) {
      chargerConversations()
      chargerProjets()
    }
  }, [userId])

  // S'abonner aux nouveaux messages en temps réel
  useEffect(() => {
    if (userId && selectedProjet) {
      sabonnerAuxMessages()
    }
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [selectedProjet, userId])

  // Scroll en bas des messages
  useEffect(() => {
    if (showMessagerie) {
      setTimeout(scrollToBottom, 200)
    }
  }, [messages, showMessagerie])

  // Auto-resize du textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
    }
  }, [newMessage])

  const chargerConversations = async () => {
    if (!userId) return
    setError('')

    try {
      const { data: messages, error: msgError } = await supabase
        .from('messages_projet')
        .select('*')
        .order('created_at', { ascending: false })

      if (msgError) throw msgError

      const projetIds = [...new Set((messages || []).map(m => m.projet_id))]
      
      if (projetIds.length === 0) {
        setConversations([])
        setLoading(false)
        return
      }

      const { data: projetsData, error: projError } = await supabase
        .from('projets_fpi')
        .select('id, nom_projet, promoteur_id, etape, montant_sollicite, secteur_activite, created_at, updated_at')
        .in('id', projetIds)

      if (projError) throw projError

      const userIds = [...new Set([
        ...(messages || []).map(m => m.expediteur_id),
        ...(projetsData || []).map(p => p.promoteur_id)
      ])]

      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, username, photo_profil')
        .in('id', userIds)

      if (userError) throw userError

      const { data: rapports, error: rapportError } = await supabase
        .from('rapport_analyse')
        .select('projet_id, technicien_id')
        .in('projet_id', projetIds)

      if (rapportError) throw rapportError

      const userMap = (users || []).reduce((acc: any, u: any) => {
        const uid = typeof u.id === 'string' ? parseInt(u.id, 10) : u.id
        acc[uid] = { nom: u.username, photo: u.photo_profil }
        return acc
      }, {})

      const technicienMap = (rapports || []).reduce((acc: any, r: any) => ({
        ...acc,
        [r.projet_id]: typeof r.technicien_id === 'string' ? parseInt(r.technicien_id, 10) : r.technicien_id
      }), {})

      const convMap = new Map<number, Conversation>()

      projetsData?.forEach((projet: any) => {
        const messagesProjet = (messages || []).filter(m => m.projet_id === projet.id)
        const dernierMsg = messagesProjet[0]
        
        if (dernierMsg) {
          const nonLus = messagesProjet.filter(
            m => !m.est_lu && m.expediteur_id !== userId
          ).length

          const technicienId = technicienMap[projet.id] || null
          const technicienInfo = technicienId ? userMap[technicienId] : null
          const promoteurInfo = userMap[projet.promoteur_id]

          if (isTechnicien && technicienId !== userId) return
          if (isPromoteur && projet.promoteur_id !== userId) return

          convMap.set(projet.id, {
            projet_id: projet.id,
            projet_nom: projet.nom_projet,
            promoteur_id: projet.promoteur_id,
            promoteur_nom: promoteurInfo?.nom || `Promoteur #${projet.promoteur_id}`,
            promoteur_photo: promoteurInfo?.photo || null,
            technicien_id: technicienId,
            technicien_nom: technicienInfo?.nom || null,
            technicien_photo: technicienInfo?.photo || null,
            dernier_message: dernierMsg.contenu,
            dernier_message_date: dernierMsg.created_at,
            dernier_message_expediteur_id: dernierMsg.expediteur_id,
            dernier_message_expediteur_type: dernierMsg.expediteur_type,
            dernier_message_expediteur_nom: userMap[dernierMsg.expediteur_id]?.nom,
            non_lus: nonLus,
            etape: projet.etape || 'soumission',
            montant_sollicite: projet.montant_sollicite,
            secteur_activite: projet.secteur_activite,
            created_at: projet.created_at,
            updated_at: projet.updated_at
          })
        }
      })

      setConversations(Array.from(convMap.values()))
    } catch (err: any) {
      console.error('Erreur chargement conversations:', err)
      setError(err.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const chargerProjets = async () => {
    if (!userId) return

    try {
      let query = supabase
        .from('projets_fpi')
        .select('id, nom_projet, promoteur_id, etape, montant_sollicite, secteur_activite, created_at')

      if (isPromoteur) {
        query = query.eq('promoteur_id', userId)
      } else if (isTechnicien) {
        const { data: rapports } = await supabase
          .from('rapport_analyse')
          .select('projet_id')
          .eq('technicien_id', userId)
        
        const projetIds = (rapports || []).map(r => r.projet_id)
        if (projetIds.length > 0) {
          query = query.in('id', projetIds)
        } else {
          setProjets([])
          return
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      const promoteurIds = [...new Set((data || []).map(p => p.promoteur_id))]
      const { data: users } = await supabase
        .from('users')
        .select('id, username, photo_profil')
        .in('id', promoteurIds)

      const userMap = (users || []).reduce((acc: any, u: any) => {
        const uid = typeof u.id === 'string' ? parseInt(u.id, 10) : u.id
        acc[uid] = { nom: u.username, photo: u.photo_profil }
        return acc
      }, {})

      const projetIdsList = (data || []).map(p => p.id)
      const { data: messages } = await supabase
        .from('messages_projet')
        .select('projet_id')
        .in('projet_id', projetIdsList)

      const projetsAvecMessages = new Set((messages || []).map(m => m.projet_id))

      const projetsFormatted: Projet[] = (data || []).map((p: any) => ({
        id: p.id,
        nom_projet: p.nom_projet,
        promoteur_id: p.promoteur_id,
        promoteur_nom: userMap[p.promoteur_id]?.nom || `Promoteur #${p.promoteur_id}`,
        promoteur_photo: userMap[p.promoteur_id]?.photo || null,
        etape: p.etape || 'soumission',
        montant_sollicite: p.montant_sollicite,
        secteur_activite: p.secteur_activite,
        created_at: p.created_at,
        technicien_id: null,
        technicien_nom: null,
        technicien_photo: null,
        a_des_messages: projetsAvecMessages.has(p.id)
      }))

      setProjets(projetsFormatted)
    } catch (err: any) {
      console.error('Erreur chargement projets:', err)
    }
  }

  const chargerMessages = async (projetId: number) => {
    setLoadingMessages(true)
    try {
      const { data, error } = await supabase
        .from('messages_projet')
        .select('*')
        .eq('projet_id', projetId)
        .order('created_at', { ascending: true })

      if (error) throw error

      const userIds = [...new Set((data || []).map(m => m.expediteur_id))]
      
      // Récupérer les utilisateurs
      let userMap: Record<number, string> = {}
      
      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('id, username')
          .in('id', userIds)

        userMap = (users || []).reduce((acc: any, u: any) => {
          const uid = typeof u.id === 'string' ? parseInt(u.id, 10) : u.id
          acc[uid] = u.username
          return acc
        }, {})
      }

      const messagesEnrichis = (data || []).map(m => ({
        ...m,
        expediteur_nom: userMap[m.expediteur_id] || `Utilisateur #${m.expediteur_id}`
      }))

      setMessages(messagesEnrichis)
      marquerCommeLu(messagesEnrichis)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingMessages(false)
    }
  }

  const marquerCommeLu = async (msgs: Message[]) => {
    if (!userId) return
    
    const messagesNonLus = msgs.filter(
      m => !m.est_lu && m.expediteur_id !== userId
    )
    
    if (messagesNonLus.length > 0) {
      const ids = messagesNonLus.map(m => m.id)
      const { error } = await supabase
        .from('messages_projet')
        .update({ est_lu: true, lu_a: new Date().toISOString() })
        .in('id', ids)
      
      if (!error) {
        setMessages(prev => 
          prev.map(m => 
            ids.includes(m.id) ? { ...m, est_lu: true, lu_a: new Date().toISOString() } : m
          )
        )
        // Mise à jour locale des conversations sans recharger
        setConversations(prev => prev.map(conv => 
          conv.projet_id === selectedProjet ? { ...conv, non_lus: 0 } : conv
        ))
      }
    }
  }

  const sabonnerAuxMessages = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    if (!selectedProjet) return

    const channel = supabase
      .channel(`messages_projet_${selectedProjet}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages_projet',
          filter: `projet_id=eq.${selectedProjet}`
        },
        async (payload) => {
          const newMsg = payload.new as Message
          
          // Éviter les doublons
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev
            
            const msgEnrichi = {
              ...newMsg,
              expediteur_nom: 'Chargement...'
            }
            
            // Charger le nom de l'utilisateur de manière asynchrone
            supabase
              .from('users')
              .select('username')
              .eq('id', newMsg.expediteur_id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setMessages(msgs => 
                    msgs.map(m => 
                      m.id === msgEnrichi.id 
                        ? { ...m, expediteur_nom: data.username || `Utilisateur #${newMsg.expediteur_id}` }
                        : m
                    )
                  )
                }
              })
            
            return [...prev, msgEnrichi]
          })
          
          // Marquer comme lu si le message vient d'un autre utilisateur
          if (newMsg.expediteur_id !== userId) {
            await supabase
              .from('messages_projet')
              .update({ est_lu: true, lu_a: new Date().toISOString() })
              .eq('id', newMsg.id)
            
            // Mise à jour locale des conversations
            mettreAJourConversationLocalement(selectedProjet, newMsg)
          }
          
          setTimeout(scrollToBottom, 100)
        }
      )
      .subscribe()

    channelRef.current = channel
  }

  const mettreAJourConversationLocalement = (projetId: number, nouveauMessage: Message) => {
    setConversations(prev => prev.map(conv => 
      conv.projet_id === projetId 
        ? {
            ...conv,
            dernier_message: nouveauMessage.contenu,
            dernier_message_date: nouveauMessage.created_at,
            dernier_message_expediteur_id: nouveauMessage.expediteur_id,
            non_lus: nouveauMessage.expediteur_id !== userId ? conv.non_lus + 1 : conv.non_lus
          }
        : conv
    ))
  }

  const envoyerMessage = async () => {
    if (!newMessage.trim() || sending || !userId || !selectedProjet) return
    
    setSending(true)
    setError('')
    setShowQuickReplies(false)
    
    try {
      const userType = isPromoteur ? 'promoteur' : 'technicien'
      
      const { data, error } = await supabase
        .from('messages_projet')
        .insert({
          projet_id: selectedProjet,
          expediteur_id: userId,
          expediteur_type: userType,
          contenu: newMessage.trim()
        })
        .select()
        .single()

      if (error) throw error
      
      const msgEnrichi = {
        ...data,
        expediteur_nom: user?.username || 'Moi'
      }
      
      setMessages(prev => [...prev, msgEnrichi])
      setNewMessage('')
      
      // Réinitialiser la hauteur du textarea
      if (inputRef.current) {
        inputRef.current.style.height = 'auto'
      }
      
      setTimeout(scrollToBottom, 100)
      
      // Mise à jour locale des conversations
      mettreAJourConversationLocalement(selectedProjet, data)
      
      // Envoyer une notification push (optionnel)
      const destinataireId = isPromoteur ? selectedTechnicienId : selectedPromoteurId
      if (destinataireId) {
        try {
          await fetch('/api/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: destinataireId,
              notification: {
                title: `📩 Nouveau message - ${selectedProjetNom}`,
                body: `${user?.username || 'Utilisateur'}: ${newMessage.trim().slice(0, 100)}${newMessage.trim().length > 100 ? '...' : ''}`,
                url: `/messagerie?projet=${selectedProjet}`,
                type: 'info',
                projetId: selectedProjet
              }
            })
          })
        } catch (pushError) {
          console.log('Notification non envoyée')
        }
      }
      
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi')
    } finally {
      setSending(false)
    }
  }

  const ouvrirMessagerie = async (conv: Conversation) => {
    setSelectedProjet(conv.projet_id)
    setSelectedProjetNom(conv.projet_nom)
    setSelectedPromoteurId(conv.promoteur_id)
    setSelectedTechnicienId(conv.technicien_id)
    setShowMessagerie(true)
    if (isMobile) setShowMessageList(false)
    await chargerMessages(conv.projet_id)
    
    // Marquer tous les messages comme lus dans la conversation
    setConversations(prev => prev.map(c => 
      c.projet_id === conv.projet_id ? { ...c, non_lus: 0 } : c
    ))
  }

  const ouvrirMessagerieProjet = async (projet: Projet) => {
    setSelectedProjet(projet.id)
    setSelectedProjetNom(projet.nom_projet)
    setSelectedPromoteurId(projet.promoteur_id)
    setSelectedTechnicienId(null)
    setShowMessagerie(true)
    if (isMobile) setShowMessageList(false)
    await chargerMessages(projet.id)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      envoyerMessage()
    }
  }

  const handleQuickReply = (reply: string) => {
    setNewMessage(reply)
    setShowQuickReplies(false)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const getEtapeLabel = (etape: string) => {
    const labels: Record<string, string> = {
      'soumission': 'Soumis',
      'analyse_tech': 'Analyse technique',
      'comité_crédit': 'Comité crédit',
      'financement_approuve': '✅ Approuvé',
      'financement_rejete': '❌ Refusé'
    }
    return labels[etape] || etape
  }

  const getEtapeColor = (etape: string) => {
    const colors: Record<string, string> = {
      'soumission': 'bg-blue-100 text-blue-700 border-blue-200',
      'analyse_tech': 'bg-purple-100 text-purple-700 border-purple-200',
      'comité_crédit': 'bg-green-100 text-green-700 border-green-200',
      'financement_approuve': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'financement_rejete': 'bg-red-100 text-red-700 border-red-200'
    }
    return colors[etape] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const formatDate = (d: string) => {
    const date = new Date(d)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'À l\'instant'
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)} h`
    if (diff < 172800000) return 'Hier'
    return format(date, 'dd MMM', { locale: fr })
  }

  const formatMessageDate = (d: string) => {
    return format(new Date(d), 'HH:mm', { locale: fr })
  }

  const formatFullDate = (d: string) => {
    return format(new Date(d), 'EEEE d MMMM yyyy', { locale: fr })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Filtrer les conversations
  const filteredConversations = conversations.filter(conv =>
    conv.projet_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.promoteur_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conv.technicien_nom && conv.technicien_nom.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Filtrer les projets
  const filteredProjets = projets.filter(projet => {
    const matchSearch = projet.nom_projet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projet.promoteur_nom.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchSearch) return false
    
    if (filterProjets === 'with_messages') return projet.a_des_messages
    if (filterProjets === 'without_messages') return !projet.a_des_messages
    
    return true
  })

  const totalNonLus = conversations.reduce((acc, conv) => acc + conv.non_lus, 0)

  // Composant Avatar réutilisable
  const Avatar = ({ src, name, size = 'md', gradient = 'from-blue-500 to-blue-600' }: { 
    src?: string | null, 
    name: string, 
    size?: 'sm' | 'md' | 'lg',
    gradient?: string 
  }) => {
    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base'
    }
    
    if (src) {
      return (
        <img 
          src={src} 
          alt={name}
          className={`${sizes[size]} rounded-full object-cover shadow-lg`}
        />
      )
    }
    
    return (
      <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
        <span className="text-white font-bold">{getInitials(name)}</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="relative inline-flex">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-pulse">
              <MessagesSquare className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            </div>
          </div>
          <p className="mt-6 text-base font-semibold text-gray-700">Chargement de la messagerie...</p>
          <p className="mt-1 text-sm text-gray-500">Préparation de vos conversations</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col overflow-hidden">
      {/* En-tête moderne */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-4 sm:px-6 py-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 500 to-blue-600  hidden sm:flex">
              <MessagesSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
                Messagerie
                {totalNonLus > 0 && (
                  <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-lg shadow-red-500/20 animate-pulse">
                    {totalNonLus > 99 ? '99+' : totalNonLus} nouveau{totalNonLus > 1 ? 'x' : ''}
                  </span>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">
                {isPromoteur ? 'Échangez avec les techniciens sur vos projets' : 'Échangez avec les promoteurs'}
              </p>
            </div>
          </div>
          
          
        </div>
      </div>

      {/* Tabs améliorés */}
      <div className="flex-shrink-0 bg-white/60 backdrop-blur-sm border-b border-gray-200/50 px-4 sm:px-6">
        <div className="flex gap-4">
          <button
            onClick={() => {
              setActiveTab('conversations')
              if (isMobile && showMessagerie) {
                setShowMessageList(true)
              }
            }}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all relative ${
              activeTab === 'conversations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Conversations
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'conversations' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {conversations.length}
              </span>
            </span>
            {activeTab === 'conversations' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('projets')
              if (isMobile && showMessagerie) {
                setShowMessageList(true)
              }
            }}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all relative ${
              activeTab === 'projets'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Projets
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'projets' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {projets.length}
              </span>
            </span>
            {activeTab === 'projets' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-t-full" />
            )}
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-hidden flex">
        {/* Liste des conversations/projets - Affichée seulement si showMessageList est true sur mobile */}
        <div className={`${
          isMobile && !showMessageList ? 'hidden' : 'flex'
        } w-full md:w-96 flex-shrink-0 bg-white/40 backdrop-blur-sm overflow-y-auto border-r border-gray-200/50`}>
          {activeTab === 'conversations' ? (
            <div className="p-3 space-y-1">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <Inbox className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-semibold">Aucune conversation</p>
                  <p className="text-sm text-gray-400 mt-1 px-8">
                    {searchTerm ? 'Aucun résultat pour cette recherche' : 'Les conversations apparaîtront ici'}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={`conv-${conv.projet_id}`}
                    onClick={() => ouvrirMessagerie(conv)}
                    className={`group p-3 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedProjet === conv.projet_id 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md shadow-blue-100/50' 
                        : 'hover:bg-gray-50 border-2 border-transparent hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <Avatar 
                          src={isPromoteur ? conv.technicien_photo : conv.promoteur_photo}
                          name={isPromoteur ? (conv.technicien_nom || 'Technicien') : conv.promoteur_nom}
                          size="lg"
                          gradient={selectedProjet === conv.projet_id 
                            ? 'from-blue-500 to-blue-600' 
                            : 'from-blue-400 to-indigo-500'
                          }
                        />
                        {conv.non_lus > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-[10px] font-bold text-white">
                              {conv.non_lus > 9 ? '9+' : conv.non_lus}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${
                              selectedProjet === conv.projet_id ? 'text-blue-700' : 'text-gray-900'
                            }`}>
                              {conv.projet_nom}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getEtapeColor(conv.etape)}`}>
                                {getEtapeLabel(conv.etape)}
                              </span>
                              <span className="text-[10px] text-gray-400">•</span>
                              <span className="text-xs text-gray-500 truncate max-w-[120px]">
                                {isPromoteur ? conv.technicien_nom || 'En attente' : conv.promoteur_nom}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap mt-1">
                            {formatDate(conv.dernier_message_date)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5 truncate">
                          <span className="font-medium text-gray-600">
                            {conv.dernier_message_expediteur_id === userId ? 'Vous' : 
                             conv.dernier_message_expediteur_nom || 'Utilisateur'}:
                          </span>{' '}
                          {conv.dernier_message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="p-3 space-y-3">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { value: 'all', label: 'Tous les projets', icon: Filter },
                  { value: 'with_messages', label: 'Avec messages', icon: MessageCircle },
                  { value: 'without_messages', label: 'Sans messages', icon: BellOff }
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setFilterProjets(filter.value as any)}
                    className={`px-3 py-1.5 text-xs rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      filterProjets === filter.value
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <filter.icon className="h-3 w-3" />
                    {filter.label}
                  </button>
                ))}
              </div>

              {filteredProjets.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <Building2 className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-semibold">Aucun projet</p>
                  <p className="text-sm text-gray-400 mt-1 px-8">
                    {searchTerm ? 'Aucun résultat' : 'Aucun projet disponible'}
                  </p>
                </div>
              ) : (
                filteredProjets.map((projet) => (
                  <div
                    key={`projet-${projet.id}`}
                    onClick={() => ouvrirMessagerieProjet(projet)}
                    className="group p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all duration-200 border-2 border-transparent hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <Avatar 
                          src={projet.promoteur_photo}
                          name={projet.promoteur_nom}
                          size="lg"
                          gradient={projet.a_des_messages 
                            ? 'from-indigo-500 to-purple-600' 
                            : 'from-gray-400 to-gray-500'
                          }
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {projet.nom_projet}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getEtapeColor(projet.etape)} flex-shrink-0`}>
                            {getEtapeLabel(projet.etape)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1.5">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="truncate max-w-[100px]">{projet.promoteur_nom}</span>
                          </span>
                          {projet.montant_sollicite && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="font-medium text-gray-700">
                                {new Intl.NumberFormat('fr-FR', { 
                                  style: 'currency', 
                                  currency: 'USD', 
                                  maximumFractionDigits: 0 
                                }).format(projet.montant_sollicite)}
                              </span>
                            </>
                          )}
                          {projet.a_des_messages && (
                            <span className="ml-auto flex items-center gap-1 text-blue-600">
                              <Sparkles className="h-3 w-3" />
                              <span className="text-[10px] font-medium">Messages</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Zone de messagerie */}
        <div className={`flex-1 flex flex-col bg-white ${
          isMobile && !showMessagerie ? 'hidden' : 'flex'
        }`}>
          {showMessagerie && selectedProjet ? (
            <>
              {/* En-tête de la conversation */}
              <div className="flex-shrink-0 px-4 sm:px-6 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 via-white to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {isMobile && (
                      <button
                        onClick={() => setShowMessageList(true)}
                        className="p-2 hover:bg-white rounded-xl transition-colors flex-shrink-0 shadow-sm"
                      >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                      </button>
                    )}
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar 
                        src={isPromoteur ? null : null}
                        name={selectedProjetNom}
                        size="lg"
                        gradient="from-blue-500 to-blue-600"
                      />
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-lg font-bold text-gray-900 truncate">
                          {selectedProjetNom}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Promoteur
                          </span>
                          {selectedTechnicienId && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Technicien assigné
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => chargerMessages(selectedProjet)}
                      className="p-2 hover:bg-white rounded-xl transition-colors group shadow-sm"
                      title="Actualiser"
                    >
                      <RefreshCw className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-gray-50/30 to-white">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                      <p className="text-sm text-gray-500 mt-2">Chargement des messages...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-6 shadow-inner">
                      <MessageCircle className="h-12 w-12 text-blue-400" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">Aucun message</h4>
                    <p className="text-sm text-gray-500 max-w-xs mb-6">
                      Commencez une conversation en envoyant un message ci-dessous
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {quickReplies.slice(0, 3).map((reply) => (
                        <button
                          key={reply}
                          onClick={() => setNewMessage(reply)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-blue-100 transition-colors"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.expediteur_id === userId
                    const isTechnicien = msg.expediteur_type === 'technicien'
                    const showDate = index === 0 || 
                      new Date(msg.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString()
                    
                    return (
                      <div key={`msg-${msg.id}-${index}`}>
                        {showDate && (
                          <div className="text-center my-6">
                            <div className="inline-flex items-center gap-3">
                              <div className="h-px flex-1 w-8 bg-gray-200"></div>
                              <span className="text-xs text-gray-500 bg-gray-100 px-4 py-1.5 rounded-full font-medium">
                                {formatFullDate(msg.created_at)}
                              </span>
                              <div className="h-px flex-1 w-8 bg-gray-200"></div>
                            </div>
                          </div>
                        )}
                        
                        <div className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                          <div className="flex-shrink-0">
                            {isMe ? (
                              <Avatar 
                                src={user?.photo_profil}
                                name={user?.username || 'Vous'}
                                size="md"
                                gradient="from-blue-500 to-blue-600"
                              />
                            ) : (
                              <Avatar 
                                src={msg.expediteur_avatar}
                                name={msg.expediteur_nom || 'User'}
                                size="md"
                                gradient={isTechnicien 
                                  ? 'from-purple-500 to-purple-600' 
                                  : 'from-emerald-500 to-emerald-600'
                                }
                              />
                            )}
                          </div>
                          
                          <div className={`flex-1 max-w-[75%] sm:max-w-[70%] ${isMe ? 'items-end' : ''}`}>
                            <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                              <span className={`text-xs font-semibold ${
                                isMe ? 'text-blue-700' : isTechnicien ? 'text-purple-700' : 'text-emerald-700'
                              }`}>
                                {isMe ? 'Vous' : msg.expediteur_nom}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {formatMessageDate(msg.created_at)}
                              </span>
                              {isMe && (
                                <span className="text-gray-400">
                                  {msg.est_lu ? (
                                    <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5" />
                                  )}
                                </span>
                              )}
                            </div>
                            
                            <div className={`p-3 sm:p-4 rounded-2xl ${
                              isMe 
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/20' 
                                : isTechnicien 
                                  ? 'bg-gradient-to-br from-purple-50 to-purple-100/50 text-gray-800 rounded-tl-none border border-purple-100 shadow-sm'
                                  : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100 shadow-sm'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                {msg.contenu}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Barre d'erreur */}
              {error && (
                <div className="flex-shrink-0 px-4 py-3 bg-red-50 border-t border-red-100">
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="ml-auto">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Réponses rapides */}
              {showQuickReplies && (
                <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">Réponses rapides</span>
                    <button onClick={() => setShowQuickReplies(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((reply) => (
                      <button
                        key={reply}
                        onClick={() => handleQuickReply(reply)}
                        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs rounded-xl hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all shadow-sm"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Zone de saisie moderne */}
              <div className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-100 bg-white">
                <div className="flex items-end gap-2">
                  <button
                    onClick={() => setShowQuickReplies(!showQuickReplies)}
                    className={`p-2.5 rounded-xl transition-all ${
                      showQuickReplies 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Star className="h-5 w-5" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Écrivez votre message..."
                      rows={1}
                      className="w-full resize-none px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm focus:ring-0 focus:border-blue-400 transition-all placeholder:text-gray-400 min-h-[44px] max-h-[120px]"
                    />
                    <div className="absolute bottom-2 right-3 flex items-center gap-1">
                      <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] text-gray-400 bg-gray-100 rounded-md font-mono">
                        Enter
                      </kbd>
                    </div>
                  </div>
                  
                  <button
                    onClick={envoyerMessage}
                    disabled={!newMessage.trim() || sending}
                    className={`flex-shrink-0 p-2.5 sm:p-3 rounded-2xl transition-all transform active:scale-95 ${
                      newMessage.trim() && !sending
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {sending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <SendHorizontal className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2 px-1">
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span className="hidden sm:inline">
                      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono">Enter</kbd> pour envoyer
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">
                      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono">Shift + Enter</kbd> pour nouvelle ligne
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {newMessage.length}/2000
                  </span>
                </div>
              </div>
            </>
          ) : (
            // État vide avec design amélioré
            <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50/50 to-white">
              <div className="text-center max-w-sm px-4">
                <div className="relative inline-flex mb-8">
                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center shadow-2xl shadow-blue-500/10">
                    <MessagesSquare className="h-14 w-14 text-blue-500" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                  {activeTab === 'conversations' ? 'Vos conversations' : 'Vos projets'}
                </h3>
                <p className="text-gray-500 text-base leading-relaxed">
                  {activeTab === 'conversations' 
                    ? 'Sélectionnez une conversation pour afficher les messages et commencer à discuter avec votre interlocuteur.'
                    : 'Choisissez un projet pour démarrer une nouvelle discussion ou consultez les conversations existantes.'
                  }
                </p>
                <div className="mt-8 flex flex-col gap-3 items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                    Messages en temps réel
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}