

// 'use client'

// import { useState, useEffect } from 'react'
// import { useAuth } from '@/context/AuthContext'
// import { supabase } from '@/lib/supabase'
// import { 
//   FileText, Clock, CheckCircle, XCircle, AlertCircle, 
//   Loader2, Eye, X, Search, User, Calendar, DollarSign,
//   Shield, Ban, Check, FileCheck, Send, MessageSquare,
//   RefreshCw, Filter, Download, TrendingUp, TrendingDown,
//   Activity, Users, Info, ArrowRight, ArrowLeft
// } from 'lucide-react'

// // Types (inchangés)
// type Projet = {
//   id: number
//   titre: string
//   description: string | null
//   montant_demande: number | null
//   etape: string
//   decision_finale: string | null
//   date_soumission: string
//   promoteur_id: number
//   promoteur_nom: string
//   promoteur_email: string | null
//   promoteur_telephone: string | null
//   nombre_documents: number
//   documents_valides: number
//   docs_obligatoires_total: number
//   docs_obligatoires_valides: number
//   frais_dossier_paye: boolean
//   frais_montant: number
//   frais_date_paiement: string | null
//   frais_reference: string | null
//   rapport_decision: string | null
//   rapport_commentaire: string | null
//   rapport_date: string | null
//   rapport_technicien_nom: string | null
// }

// type DocumentUpload = {
//   id: number
//   type_document_id: number
//   type_nom: string
//   chemin_fichier: string
//   verification_auto: boolean
//   date_upload: string
//   obligatoire: boolean
// }

// // Constants (inchangés)
// const ETAPE_COLORS: Record<string, string> = {
//   'reçu': 'bg-blue-100 text-blue-700',
//   'vérif_docs': 'bg-yellow-100 text-yellow-700',
//   'analyse_tech': 'bg-purple-100 text-purple-700',
//   'comité_crédit': 'bg-orange-100 text-orange-700',
//   'décision_rendue': 'bg-green-100 text-green-700'
// }

// const ETAPE_LABELS: Record<string, string> = {
//   'reçu': 'Reçu',
//   'vérif_docs': 'Vérification docs',
//   'analyse_tech': 'Analyse technique',
//   'comité_crédit': 'Comité crédit',
//   'décision_rendue': 'Décision rendue'
// }

// const ETAPES_TECHNIQUE = ['reçu', 'vérif_docs', 'analyse_tech']

// export default function TechniqueProjetsPage() {
//   const { user } = useAuth()
  
//   // États
//   const [projets, setProjets] = useState<Projet[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const [searchTerm, setSearchTerm] = useState('')
//   const [filterEtape, setFilterEtape] = useState('')
//   const [isRefreshing, setIsRefreshing] = useState(false)
  
//   // Modals
//   const [showDetailModal, setShowDetailModal] = useState(false)
//   const [showValidationModal, setShowValidationModal] = useState(false)
//   const [showRapportModal, setShowRapportModal] = useState(false)
//   const [showRefusModal, setShowRefusModal] = useState(false)
//   const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null)
//   const [documents, setDocuments] = useState<DocumentUpload[]>([])
  
//   // Loading states
//   const [loadingDocuments, setLoadingDocuments] = useState(false)
//   const [validating, setValidating] = useState(false)
//   const [validatingDocId, setValidatingDocId] = useState<number | null>(null)
//   const [refusComment, setRefusComment] = useState('')
//   const [refusLoading, setRefusLoading] = useState(false)
  
//   // Rapport
//   const [rapportForm, setRapportForm] = useState({
//     decision: 'favorable' as 'favorable' | 'defavorable' | 'reserve',
//     commentaire: ''
//   })
//   const [rapportLoading, setRapportLoading] = useState(false)
//   const [showConfirmation, setShowConfirmation] = useState(false)
//   const [rapportStep, setRapportStep] = useState<'form' | 'confirm' | 'success'>('form')

//   useEffect(() => {
//     chargerProjets()
//   }, [])

//   // Auto-refresh toutes les 30 secondes
//   useEffect(() => {
//     const interval = setInterval(() => {
//       chargerProjets(true)
//     }, 30000)
//     return () => clearInterval(interval)
//   }, [])

//   const chargerProjets = async (silent = false) => {
//     try {
//       if (!silent) setLoading(true)
//       else setIsRefreshing(true)
      
//       const { data, error } = await supabase
//         .from('vue_projets_details')
//         .select('*')
//         .order('date_soumission', { ascending: false })

//       if (error) throw error

//       const projetsMapped = data?.map((item: any) => ({
//         id: item.id,
//         titre: item.titre,
//         description: item.description,
//         montant_demande: item.montant_demande,
//         etape: item.etape,
//         decision_finale: item.decision_finale,
//         date_soumission: item.date_soumission,
//         promoteur_id: item.promoteur_id,
//         promoteur_nom: item.promoteur_nom,
//         promoteur_email: item.promoteur_email,
//         promoteur_telephone: item.promoteur_telephone,
//         nombre_documents: item.nombre_documents || 0,
//         documents_valides: item.documents_valides || 0,
//         docs_obligatoires_total: item.docs_obligatoires_total || 0,
//         docs_obligatoires_valides: item.docs_obligatoires_valides || 0,
//         frais_dossier_paye: item.frais_dossier_paye ?? item.frais_paye ?? false,
//         frais_montant: item.frais_montant || 100,
//         frais_date_paiement: item.frais_date_paiement || null,
//         frais_reference: item.frais_reference || null,
//         rapport_decision: item.rapport_decision || null,
//         rapport_commentaire: item.rapport_commentaire || null,
//         rapport_date: item.rapport_date || null,
//         rapport_technicien_nom: item.rapport_technicien_nom || null
//       })) || []

//       setProjets(projetsMapped)
//     } catch (error) {
//       console.error('Erreur chargement:', error)
//       if (!silent) setError('Erreur lors du chargement des projets')
//     } finally {
//       setLoading(false)
//       setIsRefreshing(false)
//     }
//   }

//   const chargerDocuments = async (projetId: number) => {
//     setLoadingDocuments(true)
//     const { data, error } = await supabase
//       .from('documents')
//       .select(`id, type_document_id, chemin_fichier, verification_auto, date_upload, type_document (nom, description, obligatoire)`)
//       .eq('projet_id', projetId)
//       .order('date_upload', { ascending: false })

//     if (!error && data) {
//       setDocuments(data.map((d: any) => ({
//         id: d.id,
//         type_document_id: d.type_document_id,
//         type_nom: d.type_document?.nom || 'Inconnu',
//         chemin_fichier: d.chemin_fichier,
//         verification_auto: d.verification_auto,
//         date_upload: d.date_upload,
//         obligatoire: d.type_document?.obligatoire ?? false
//       })))
//     }
//     setLoadingDocuments(false)
//   }

//   // =============================================
//   // VALIDATION DES DOCUMENTS
//   // =============================================
//   const ouvrirValidation = async (projet: Projet) => {
//     setSelectedProjet(projet)
//     await chargerDocuments(projet.id)
//     setShowValidationModal(true)
//   }

//   const toggleVerification = async (docId: number, currentValue: boolean) => {
//     setValidatingDocId(docId)
//     try {
//       const { error } = await supabase
//         .from('documents')
//         .update({ verification_auto: !currentValue })
//         .eq('id', docId)

//       if (error) throw error

//       if (selectedProjet) {
//         await chargerDocuments(selectedProjet.id)
//       }
//     } catch (error) {
//       setError('Erreur lors de la vérification')
//     } finally {
//       setValidatingDocId(null)
//     }
//   }

//   const validerTousDocuments = async () => {
//     if (!selectedProjet) return
    
//     setValidating(true)
//     try {
//       const { error } = await supabase
//         .from('documents')
//         .update({ verification_auto: true })
//         .eq('projet_id', selectedProjet.id)
//         .eq('verification_auto', false)

//       if (error) throw error

//       await supabase
//         .from('projets')
//         .update({ etape: 'analyse_tech' })
//         .eq('id', selectedProjet.id)

//       await chargerDocuments(selectedProjet.id)
//       await chargerProjets(true)
//       setShowValidationModal(false)
//       setSuccess('✅ Tous les documents validés ! Projet passé en analyse technique.')
//     } catch (error) {
//       setError('Erreur lors de la validation')
//     } finally {
//       setValidating(false)
//     }
//   }

//   const ouvrirRefus = () => {
//     setRefusComment('')
//     setShowRefusModal(true)
//   }

//   const confirmerRefus = async () => {
//     if (!selectedProjet || !refusComment.trim()) return
    
//     setRefusLoading(true)
//     try {
//       await supabase
//         .from('projets')
//         .update({ 
//           etape: 'reçu',
//           description: selectedProjet.description + 
//             '\n\n[REFUS DOCS - ' + new Date().toLocaleDateString('fr-FR') + ']\nRaison: ' + refusComment
//         })
//         .eq('id', selectedProjet.id)

//       await chargerProjets(true)
//       setShowRefusModal(false)
//       setShowValidationModal(false)
//       setSuccess('❌ Documents refusés avec commentaire. Le promoteur devra corriger.')
//     } catch (error) {
//       setError('Erreur lors du refus')
//     } finally {
//       setRefusLoading(false)
//     }
//   }

//   // =============================================
//   // RAPPORT D'ANALYSE
//   // =============================================
//   const ouvrirRapport = (projet: Projet) => {
//     setSelectedProjet(projet)
//     setRapportForm({
//       decision: projet.rapport_decision as 'favorable' | 'defavorable' | 'reserve' || 'favorable',
//       commentaire: projet.rapport_commentaire || ''
//     })
//     setRapportStep('form')
//     setShowConfirmation(false)
//     setShowRapportModal(true)
//   }

//   const passerEnConfirmation = () => {
//     if (!rapportForm.commentaire.trim()) {
//       setError('Veuillez ajouter un commentaire d\'analyse')
//       return
//     }
//     setRapportStep('confirm')
//   }

//   const soumettreRapport = async () => {
//     if (!selectedProjet || !user) return
    
//     setRapportLoading(true)
//     setError('')

//     try {
//       const { data: existingRapport } = await supabase
//         .from('rapport_analyse')
//         .select('id')
//         .eq('projet_id', selectedProjet.id)
//         .maybeSingle()

//       if (existingRapport) {
//         await supabase
//           .from('rapport_analyse')
//           .update({
//             decision: rapportForm.decision,
//             commentaire: rapportForm.commentaire,
//             technicien_id: user.id
//           })
//           .eq('id', existingRapport.id)
//       } else {
//         await supabase
//           .from('rapport_analyse')
//           .insert({
//             projet_id: selectedProjet.id,
//             technicien_id: user.id,
//             decision: rapportForm.decision,
//             commentaire: rapportForm.commentaire
//           })
//       }

//       let nouvelleEtape = 'analyse_tech'
//       if (rapportForm.decision === 'favorable') {
//         nouvelleEtape = 'comité_crédit'
//       } else if (rapportForm.decision === 'defavorable') {
//         nouvelleEtape = 'décision_rendue'
//         await supabase
//           .from('projets')
//           .update({ 
//             etape: nouvelleEtape,
//             decision_finale: 'refusé'
//           })
//           .eq('id', selectedProjet.id)
//       }

//       if (rapportForm.decision !== 'defavorable') {
//         await supabase
//           .from('projets')
//           .update({ etape: nouvelleEtape })
//           .eq('id', selectedProjet.id)
//       }

//       setRapportStep('success')
      
//       setTimeout(async () => {
//         setShowRapportModal(false)
//         await chargerProjets(true)
//         const messages = {
//           favorable: '✅ Rapport favorable ! Projet transmis au comité de crédit.',
//           defavorable: '❌ Rapport défavorable. Projet refusé.',
//           reserve: '⚠️ Rapport réservé. Projet maintenu en analyse.'
//         }
//         setSuccess(messages[rapportForm.decision])
//       }, 2000)
      
//     } catch (error: any) {
//       console.error('Erreur rapport:', error)
//       setError('Erreur lors de la soumission du rapport')
//       setRapportStep('form')
//     } finally {
//       setRapportLoading(false)
//     }
//   }

//   // =============================================
//   // HELPERS
//   // =============================================
//   const ouvrirDetail = async (projet: Projet) => {
//     setSelectedProjet(projet)
//     await chargerDocuments(projet.id)
//     setShowDetailModal(true)
//   }

//   const formatMontant = (m: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(m)
//   const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

//   const projetsFiltres = projets.filter(p => {
//     const matchSearch = p.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                        p.promoteur_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                        p.id.toString().includes(searchTerm)
//     const matchEtape = !filterEtape || p.etape === filterEtape
//     return matchSearch && matchEtape
//   })

//   const stats = {
//     total: projets.length,
//     aValider: projets.filter(p => p.etape === 'reçu' && p.frais_dossier_paye).length,
//     enAnalyse: projets.filter(p => p.etape === 'analyse_tech').length,
//     rapportsFaits: projets.filter(p => p.rapport_decision !== null).length
//   }

//   const getDocumentsProgress = (projet: Projet) => {
//     if (projet.docs_obligatoires_total === 0) return 0
//     return (projet.docs_obligatoires_valides / projet.docs_obligatoires_total) * 100
//   }

//   if (loading) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="relative">
//             <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
//             <Shield className="h-6 w-6 text-primary/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
//           </div>
//           <p className="mt-4 text-sm font-medium text-gray-700">Chargement des projets...</p>
//           <p className="mt-1 text-xs text-gray-500">Service Technique</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="h-screen flex flex-col bg-gray-50">
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
//         <div className="max-w-6xl mx-auto">
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h1 className="text-xl font-bold text-gray-900">Validation & Analyse Technique</h1>
//               <p className="text-sm text-gray-500">Validez les dossiers et transmettez vos rapports d'analyse</p>
//             </div>
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => chargerProjets(true)}
//                 disabled={isRefreshing}
//                 className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
//                 title="Actualiser"
//               >
//                 <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
//               </button>
//               <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
//                 <Shield className="h-4 w-4 text-primary" />
//                 <span className="text-sm font-medium text-primary">Service Technique</span>
//               </div>
//             </div>
//           </div>

//           {/* Stats avec loading */}
//           <div className="grid grid-cols-4 gap-3">
//             <div className="bg-gray-50 rounded-xl p-3 text-center hover:shadow-md transition-shadow">
//               <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
//               <div className="flex items-center justify-center gap-1 mt-1">
//                 <FileText className="h-3 w-3 text-gray-500" />
//                 <p className="text-xs text-gray-500">Total projets</p>
//               </div>
//             </div>
//             <div className="bg-yellow-50 rounded-xl p-3 text-center hover:shadow-md transition-shadow border border-yellow-100">
//               <p className="text-2xl font-bold text-yellow-700">{stats.aValider}</p>
//               <div className="flex items-center justify-center gap-1 mt-1">
//                 <Clock className="h-3 w-3 text-yellow-600" />
//                 <p className="text-xs text-yellow-600">À valider</p>
//               </div>
//             </div>
//             <div className="bg-purple-50 rounded-xl p-3 text-center hover:shadow-md transition-shadow border border-purple-100">
//               <p className="text-2xl font-bold text-purple-700">{stats.enAnalyse}</p>
//               <div className="flex items-center justify-center gap-1 mt-1">
//                 <Activity className="h-3 w-3 text-purple-600" />
//                 <p className="text-xs text-purple-600">En analyse</p>
//               </div>
//             </div>
//             <div className="bg-green-50 rounded-xl p-3 text-center hover:shadow-md transition-shadow border border-green-100">
//               <p className="text-2xl font-bold text-green-700">{stats.rapportsFaits}</p>
//               <div className="flex items-center justify-center gap-1 mt-1">
//                 <CheckCircle className="h-3 w-3 text-green-600" />
//                 <p className="text-xs text-green-600">Rapports faits</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Filtres */}
//       <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-2">
//         <div className="max-w-6xl mx-auto flex items-center gap-3">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//             <input type="text" placeholder="Rechercher par titre, promoteur ou ID..." value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
//           </div>
//           <div className="flex items-center gap-2">
//             <Filter className="h-4 w-4 text-gray-400" />
//             <select value={filterEtape} onChange={(e) => setFilterEtape(e.target.value)}
//               className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20">
//               <option value="">Toutes les étapes</option>
//               {Object.entries(ETAPE_LABELS).map(([key, label]) => (
//                 <option key={key} value={key}>{label}</option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Liste projets */}
//       <div className="flex-1 overflow-y-auto p-4">
//         {isRefreshing && (
//           <div className="max-w-6xl mx-auto mb-3">
//             <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 flex items-center gap-2">
//               <Loader2 className="h-3 w-3 animate-spin text-primary" />
//               <p className="text-xs text-primary">Actualisation en cours...</p>
//             </div>
//           </div>
//         )}

//         <div className="max-w-6xl mx-auto space-y-3">
//           {projetsFiltres.length === 0 ? (
//             <div className="text-center py-16">
//               <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//               <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun projet trouvé</h3>
//               <p className="text-sm text-gray-500">Aucun projet ne correspond à vos critères</p>
//             </div>
//           ) : (
//             projetsFiltres.map(projet => {
//               const docProgress = getDocumentsProgress(projet)
//               const isAccessible = ETAPES_TECHNIQUE.includes(projet.etape)
              
//               return (
//                 <div key={projet.id} 
//                   className={`bg-white rounded-xl border p-4 transition-all ${
//                     isAccessible 
//                       ? 'border-gray-200 hover:border-primary/30 hover:shadow-md cursor-pointer' 
//                       : 'border-gray-100 opacity-75'
//                   }`}
//                 >
//                   <div className="flex items-start gap-4">
//                     <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
//                       projet.rapport_decision === 'favorable' ? 'bg-green-100' :
//                       projet.rapport_decision === 'defavorable' ? 'bg-red-100' :
//                       projet.etape === 'reçu' ? 'bg-yellow-100' :
//                       projet.etape === 'analyse_tech' ? 'bg-purple-100' :
//                       'bg-blue-100'
//                     }`}>
//                       {projet.rapport_decision === 'favorable' ? <CheckCircle className="h-6 w-6 text-green-600" /> :
//                        projet.rapport_decision === 'defavorable' ? <XCircle className="h-6 w-6 text-red-600" /> :
//                        projet.etape === 'reçu' ? <FileCheck className="h-6 w-6 text-yellow-600" /> :
//                        projet.etape === 'analyse_tech' ? <Shield className="h-6 w-6 text-purple-600" /> :
//                        <Clock className="h-6 w-6 text-blue-600" />}
//                     </div>

//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-start justify-between mb-2">
//                         <div>
//                           <div className="flex items-center gap-2 flex-wrap">
//                             <h3 className="text-sm font-semibold text-gray-900">{projet.titre}</h3>
                            
//                             {!projet.frais_dossier_paye && (
//                               <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
//                                 <AlertCircle className="h-3 w-3" /> Non payé
//                               </span>
//                             )}
                            
//                             {projet.rapport_decision && (
//                               <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
//                                 projet.rapport_decision === 'favorable' ? 'bg-green-100 text-green-700' :
//                                 projet.rapport_decision === 'defavorable' ? 'bg-red-100 text-red-700' :
//                                 'bg-orange-100 text-orange-700'
//                               }`}>
//                                 {projet.rapport_decision === 'favorable' ? <TrendingUp className="h-3 w-3" /> :
//                                  projet.rapport_decision === 'defavorable' ? <TrendingDown className="h-3 w-3" /> :
//                                  <AlertCircle className="h-3 w-3" />}
//                                 Rapport : {projet.rapport_decision}
//                               </span>
//                             )}
//                           </div>
//                           <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
//                             <span className="flex items-center gap-1">
//                               <Users className="h-3 w-3" /> {projet.promoteur_nom}
//                             </span>
//                             <span className="flex items-center gap-1">
//                               <Calendar className="h-3 w-3" /> {formatDate(projet.date_soumission)}
//                             </span>
//                             {projet.montant_demande && (
//                               <span className="flex items-center gap-1 font-semibold text-gray-700">
//                                 <DollarSign className="h-3 w-3" /> {formatMontant(projet.montant_demande)}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-2 mt-2">
//                         <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ETAPE_COLORS[projet.etape]}`}>
//                           {ETAPE_LABELS[projet.etape]}
//                         </span>

//                         {/* Progression docs avec pourcentage */}
//                         <div className="flex items-center gap-2 flex-1">
//                           <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[150px]">
//                             <div 
//                               className={`h-full rounded-full transition-all duration-500 ${
//                                 docProgress === 100 ? 'bg-green-500' : docProgress > 50 ? 'bg-yellow-500' : 'bg-red-400'
//                               }`}
//                               style={{ width: `${docProgress}%` }} 
//                             />
//                           </div>
//                           <span className="text-xs text-gray-500 font-medium">
//                             {projet.docs_obligatoires_valides}/{projet.docs_obligatoires_total} docs
//                             <span className="text-gray-400 ml-1">({Math.round(docProgress)}%)</span>
//                           </span>
//                         </div>

//                         {/* Boutons d'action */}
//                         {isAccessible && (
//                           <div className="flex items-center gap-2">
//                             {projet.etape === 'reçu' && projet.frais_dossier_paye && (
//                               <button onClick={(e) => { e.stopPropagation(); ouvrirValidation(projet) }}
//                                 className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
//                               >
//                                 <FileCheck className="h-3 w-3" /> Valider docs
//                               </button>
//                             )}

//                             {projet.etape === 'analyse_tech' && (
//                               <button onClick={(e) => { e.stopPropagation(); ouvrirRapport(projet) }}
//                                 className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
//                               >
//                                 <Send className="h-3 w-3" /> Rapport
//                               </button>
//                             )}

//                             <button onClick={(e) => { e.stopPropagation(); ouvrirDetail(projet) }}
//                               className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
//                               title="Voir détails"
//                             >
//                               <Eye className="h-4 w-4" />
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )
//             })
//           )}
//         </div>
//       </div>

//       {/* ============================================ */}
//       {/* MODAL VALIDATION DOCUMENTS */}
//       {/* ============================================ */}
//       {showValidationModal && selectedProjet && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
//             <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
//               <div>
//                 <h2 className="text-lg font-bold text-gray-900">Validation des documents</h2>
//                 <div className="flex items-center gap-2 mt-1">
//                   <p className="text-xs text-gray-500">{selectedProjet.titre}</p>
//                   <span className="text-xs text-gray-400">•</span>
//                   <p className="text-xs text-gray-500">{selectedProjet.promoteur_nom}</p>
//                 </div>
//               </div>
//               <button onClick={() => setShowValidationModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
//                 <X className="h-5 w-5 text-gray-500" />
//               </button>
//             </div>

//             <div className="flex-1 overflow-y-auto p-6">
//               {loadingDocuments ? (
//                 <div className="text-center py-12">
//                   <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
//                   <p className="text-sm text-gray-500 mt-3">Chargement des documents...</p>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {documents.map(doc => (
//                     <div key={doc.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
//                       doc.verification_auto 
//                         ? 'bg-green-50 border-green-200' 
//                         : 'bg-gray-50 border-gray-200 hover:border-gray-300'
//                     }`}>
//                       <div className="flex items-center gap-3">
//                         <button 
//                           onClick={() => toggleVerification(doc.id, doc.verification_auto)}
//                           disabled={validatingDocId === doc.id}
//                           className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
//                             doc.verification_auto 
//                               ? 'bg-green-500 text-white shadow-sm' 
//                               : 'bg-white border-2 border-gray-300 text-gray-400 hover:border-green-400 hover:text-green-600'
//                           } ${validatingDocId === doc.id ? 'opacity-50' : ''}`}
//                         >
//                           {validatingDocId === doc.id ? (
//                             <Loader2 className="h-4 w-4 animate-spin" />
//                           ) : (
//                             <Check className="h-4 w-4" />
//                           )}
//                         </button>
//                         <div>
//                           <div className="flex items-center gap-2">
//                             <p className="text-sm font-medium">{doc.type_nom}</p>
//                             {doc.obligatoire && (
//                               <span className="text-xs text-red-500 font-medium">Obligatoire</span>
//                             )}
//                           </div>
//                           <p className="text-xs text-gray-500">{formatDate(doc.date_upload)}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         {doc.verification_auto && (
//                           <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded-full">
//                             Validé
//                           </span>
//                         )}
//                         <a 
//                           href={doc.chemin_fichier} 
//                           target="_blank"
//                           className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
//                           title="Voir le document"
//                         >
//                           <Eye className="h-4 w-4" />
//                         </a>
//                       </div>
//                     </div>
//                   ))}

//                   {documents.length === 0 && (
//                     <div className="text-center py-8 text-gray-500">
//                       <FileText className="h-10 w-10 mx-auto mb-2 text-gray-300" />
//                       <p className="text-sm">Aucun document à valider</p>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             <div className="flex-shrink-0 p-6 border-t border-gray-100 flex gap-3">
//               <button 
//                 onClick={ouvrirRefus} 
//                 disabled={validating || documents.length === 0}
//                 className="flex-1 px-4 py-2.5 border border-red-300 text-red-700 text-sm font-medium rounded-xl hover:bg-red-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
//               >
//                 <XCircle className="h-4 w-4 inline mr-1" /> 
//                 Refuser les documents
//               </button>
//               <button 
//                 onClick={validerTousDocuments} 
//                 disabled={validating || documents.length === 0}
//                 className="flex-1 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
//               >
//                 {validating ? (
//                   <>
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                     Validation en cours...
//                   </>
//                 ) : (
//                   <>
//                     <CheckCircle className="h-4 w-4" />
//                     Valider tout → Analyse technique
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ============================================ */}
//       {/* MODAL REFUS DOCUMENTS */}
//       {/* ============================================ */}
//       {showRefusModal && (
//         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
//             <div className="px-6 py-4 border-b border-gray-100">
//               <div className="flex items-center gap-2">
//                 <AlertCircle className="h-5 w-5 text-red-500" />
//                 <h2 className="text-lg font-bold text-gray-900">Refuser les documents</h2>
//               </div>
//               <p className="text-xs text-gray-500 mt-1">
//                 Cette action est irréversible. Veuillez fournir une raison.
//               </p>
//             </div>

//             <div className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Raison du refus <span className="text-red-500">*</span>
//                 </label>
//                 <textarea
//                   value={refusComment}
//                   onChange={(e) => setRefusComment(e.target.value)}
//                   placeholder="Expliquez pourquoi les documents sont refusés (ex: documents illisibles, manquants, non conformes...)"
//                   rows={4}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
//                 />
//                 <p className="text-xs text-gray-400 mt-1">
//                   Ce commentaire sera visible par le promoteur
//                 </p>
//               </div>

//               <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
//                 <Info className="h-4 w-4 text-red-500 mt-0.5" />
//                 <p className="text-xs text-red-700">
//                   Le projet retournera à l'étape "Reçu" et le promoteur devra soumettre de nouveaux documents.
//                 </p>
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   onClick={() => setShowRefusModal(false)}
//                   className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm rounded-xl hover:bg-gray-50"
//                 >
//                   Annuler
//                 </button>
//                 <button
//                   onClick={confirmerRefus}
//                   disabled={refusLoading || !refusComment.trim()}
//                   className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
//                 >
//                   {refusLoading ? (
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                   ) : (
//                     <Ban className="h-4 w-4" />
//                   )}
//                   Confirmer le refus
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ============================================ */}
//       {/* MODAL RAPPORT D'ANALYSE */}
//       {/* ============================================ */}
//       {showRapportModal && selectedProjet && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
//             <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
//               <div>
//                 <h2 className="text-lg font-bold text-gray-900">
//                   {rapportStep === 'confirm' ? 'Confirmation du rapport' : 
//                    rapportStep === 'success' ? 'Rapport transmis' : 
//                    'Rapport d\'analyse technique'}
//                 </h2>
//                 <p className="text-xs text-gray-500">{selectedProjet.titre}</p>
//               </div>
//               {rapportStep !== 'success' && (
//                 <button onClick={() => setShowRapportModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
//                   <X className="h-5 w-5 text-gray-500" />
//                 </button>
//               )}
//             </div>

//             <div className="p-6">
//               {rapportStep === 'form' && (
//                 <div className="space-y-4">
//                   {/* Info promoteur */}
//                   <div className="bg-gray-50 rounded-xl p-4">
//                     <div className="flex items-center gap-2 mb-2">
//                       <User className="h-4 w-4 text-gray-400" />
//                       <span className="text-sm font-medium">{selectedProjet.promoteur_nom}</span>
//                     </div>
//                     <p className="text-xs text-gray-600">
//                       {selectedProjet.description || 'Aucune description'}
//                     </p>
//                   </div>

//                   {/* Décision */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Décision</label>
//                     <div className="grid grid-cols-3 gap-2">
//                       {[
//                         { value: 'favorable', label: 'Favorable', icon: TrendingUp, desc: 'Transmis au comité', color: 'green' },
//                         { value: 'defavorable', label: 'Défavorable', icon: TrendingDown, desc: 'Projet refusé', color: 'red' },
//                         { value: 'reserve', label: 'Réservé', icon: AlertCircle, desc: 'Reste en analyse', color: 'orange' }
//                       ].map(option => (
//                         <button 
//                           key={option.value} 
//                           onClick={() => setRapportForm({...rapportForm, decision: option.value as any})}
//                           className={`p-3 rounded-xl border-2 text-center transition-all ${
//                             rapportForm.decision === option.value
//                               ? `border-${option.color}-500 bg-${option.color}-50 shadow-sm`
//                               : 'border-gray-200 text-gray-600 hover:border-gray-300'
//                           }`}
//                         >
//                           <option.icon className={`h-5 w-5 mx-auto mb-1 ${
//                             rapportForm.decision === option.value ? `text-${option.color}-600` : 'text-gray-400'
//                           }`} />
//                           <p className="text-xs font-medium">{option.label}</p>
//                           <p className="text-[10px] mt-0.5 opacity-70">{option.desc}</p>
//                         </button>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Commentaire */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       <MessageSquare className="h-4 w-4 inline mr-1" /> Commentaire d'analyse
//                     </label>
//                     <textarea 
//                       rows={5} 
//                       value={rapportForm.commentaire}
//                       onChange={(e) => setRapportForm({...rapportForm, commentaire: e.target.value})}
//                       placeholder="Votre analyse détaillée : points forts, points faibles, risques identifiés, recommandations..."
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" 
//                     />
//                   </div>

//                   <button 
//                     onClick={passerEnConfirmation}
//                     className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors shadow-sm"
//                   >
//                     Continuer
//                     <ArrowRight className="h-4 w-4" />
//                   </button>
//                 </div>
//               )}

//               {rapportStep === 'confirm' && (
//                 <div className="space-y-4">
//                   <div className="bg-gray-50 rounded-xl p-4 space-y-3">
//                     <div className="flex justify-between items-center">
//                       <span className="text-sm text-gray-600">Décision</span>
//                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                         rapportForm.decision === 'favorable' ? 'bg-green-100 text-green-700' :
//                         rapportForm.decision === 'defavorable' ? 'bg-red-100 text-red-700' :
//                         'bg-orange-100 text-orange-700'
//                       }`}>
//                         {rapportForm.decision}
//                       </span>
//                     </div>
//                     <div>
//                       <span className="text-sm text-gray-600">Commentaire</span>
//                       <p className="text-sm text-gray-900 mt-1 bg-white rounded-lg p-3">
//                         {rapportForm.commentaire}
//                       </p>
//                     </div>
//                   </div>

//                   <div className={`rounded-xl p-4 ${
//                     rapportForm.decision === 'favorable' ? 'bg-green-50 border border-green-200' :
//                     rapportForm.decision === 'defavorable' ? 'bg-red-50 border border-red-200' :
//                     'bg-orange-50 border border-orange-200'
//                   }`}>
//                     <div className="flex items-start gap-2">
//                       <Info className={`h-4 w-4 mt-0.5 ${
//                         rapportForm.decision === 'favorable' ? 'text-green-600' :
//                         rapportForm.decision === 'defavorable' ? 'text-red-600' :
//                         'text-orange-600'
//                       }`} />
//                       <p className="text-xs">
//                         {rapportForm.decision === 'favorable' && 'Le projet sera transmis au comité de crédit pour décision finale. Cette action est irréversible.'}
//                         {rapportForm.decision === 'defavorable' && 'Le projet sera définitivement refusé et le promoteur sera notifié. Cette action est irréversible.'}
//                         {rapportForm.decision === 'reserve' && 'Le projet restera en analyse technique. Vous pourrez modifier votre rapport ultérieurement.'}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex gap-3">
//                     <button 
//                       onClick={() => setRapportStep('form')}
//                       className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2"
//                     >
//                       <ArrowLeft className="h-4 w-4" />
//                       Modifier
//                     </button>
//                     <button 
//                       onClick={soumettreRapport} 
//                       disabled={rapportLoading}
//                       className="flex-1 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
//                     >
//                       {rapportLoading ? (
//                         <Loader2 className="h-5 w-5 animate-spin" />
//                       ) : (
//                         <Send className="h-5 w-5" />
//                       )}
//                       Confirmer et transmettre
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {rapportStep === 'success' && (
//                 <div className="text-center py-8">
//                   <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-bounce">
//                     <CheckCircle className="h-10 w-10 text-green-500" />
//                   </div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-1">Rapport transmis avec succès !</h3>
//                   <p className="text-sm text-gray-500">
//                     {rapportForm.decision === 'favorable' && 'Le projet a été transmis au comité de crédit.'}
//                     {rapportForm.decision === 'defavorable' && 'Le projet a été refusé.'}
//                     {rapportForm.decision === 'reserve' && 'Le rapport a été enregistré.'}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ============================================ */}
//       {/* MODAL DÉTAIL PROJET (lecture seule) */}
//       {/* ============================================ */}
//       {showDetailModal && selectedProjet && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
//             <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
//               <div>
//                 <h2 className="text-lg font-bold text-gray-900">{selectedProjet.titre}</h2>
//                 <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
//                   <span className="flex items-center gap-1">
//                     <User className="h-3 w-3" /> {selectedProjet.promoteur_nom}
//                   </span>
//                   <span className="flex items-center gap-1">
//                     <Calendar className="h-3 w-3" /> {formatDate(selectedProjet.date_soumission)}
//                   </span>
//                   {selectedProjet.montant_demande && (
//                     <span className="font-semibold">{formatMontant(selectedProjet.montant_demande)}</span>
//                   )}
//                 </div>
//               </div>
//               <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
//                 <X className="h-5 w-5 text-gray-500" />
//               </button>
//             </div>

//             <div className="flex-1 overflow-y-auto p-6 space-y-4">
//               {/* Informations promoteur */}
//               <div className="bg-blue-50 rounded-xl p-4">
//                 <h3 className="text-sm font-semibold text-blue-900 mb-2">Informations Promoteur</h3>
//                 <div className="space-y-1 text-xs">
//                   {selectedProjet.promoteur_email && (
//                     <p className="text-blue-700">Email : {selectedProjet.promoteur_email}</p>
//                   )}
//                   {selectedProjet.promoteur_telephone && (
//                     <p className="text-blue-700">Téléphone : {selectedProjet.promoteur_telephone}</p>
//                   )}
//                   <p className="text-blue-700">
//                     Frais dossier : {selectedProjet.frais_dossier_paye ? '✅ Payé' : '❌ Non payé'}
//                   </p>
//                   {selectedProjet.frais_date_paiement && (
//                     <p className="text-blue-700">
//                       Date paiement : {formatDate(selectedProjet.frais_date_paiement)}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               {/* Description */}
//               {selectedProjet.description && (
//                 <div>
//                   <h3 className="text-sm font-semibold text-gray-900 mb-2">Description du projet</h3>
//                   <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 whitespace-pre-wrap">
//                     {selectedProjet.description}
//                   </p>
//                 </div>
//               )}

//               {/* Documents */}
//               <div>
//                 <h3 className="text-sm font-semibold text-gray-900 mb-2">
//                   Documents ({documents.length})
//                 </h3>
//                 {loadingDocuments ? (
//                   <div className="text-center py-8">
//                     <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
//                     <p className="text-xs text-gray-500 mt-2">Chargement des documents...</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-1">
//                     {documents.map(doc => (
//                       <div key={doc.id} className={`flex items-center justify-between p-3 rounded-lg ${
//                         doc.verification_auto ? 'bg-green-50' : 'bg-gray-50'
//                       }`}>
//                         <div className="flex items-center gap-3">
//                           {doc.verification_auto ? 
//                             <CheckCircle className="h-4 w-4 text-green-500" /> : 
//                             <Clock className="h-4 w-4 text-gray-400" />
//                           }
//                           <div>
//                             <span className="text-sm">{doc.type_nom}</span>
//                             {doc.obligatoire && (
//                               <span className="text-xs text-red-500 ml-1">*</span>
//                             )}
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <span className="text-xs text-gray-500">{formatDate(doc.date_upload)}</span>
//                           <a href={doc.chemin_fichier} target="_blank" 
//                             className="px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors">
//                             Voir
//                           </a>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
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
//         .animate-slide-in {
//           animation: slideIn 0.3s ease-out;
//         }
//         @keyframes bounce {
//           0%, 100% { transform: translateY(0); }
//           50% { transform: translateY(-10px); }
//         }
//         .animate-bounce {
//           animation: bounce 1s infinite;
//         }
//       `}</style>
//     </div>
//   )
// }

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { usePushNotifications } from '@/context/PushNotificationContext'
import { supabase } from '@/lib/supabase'
import { 
  FileText, Clock, CheckCircle, XCircle, AlertCircle, 
  Loader2, Eye, X, Search, User, Calendar, DollarSign,
  Shield, Ban, Check, FileCheck, Send, MessageSquare,
  RefreshCw, Filter, Download, TrendingUp, TrendingDown,
  Activity, Users, Info, ArrowRight, ArrowLeft, Bell, BellRing
} from 'lucide-react'

// Types
type Projet = {
  id: number
  titre: string
  description: string | null
  montant_demande: number | null
  etape: string
  decision_finale: string | null
  date_soumission: string
  promoteur_id: number
  promoteur_nom: string
  promoteur_email: string | null
  promoteur_telephone: string | null
  nombre_documents: number
  documents_valides: number
  docs_obligatoires_total: number
  docs_obligatoires_valides: number
  frais_dossier_paye: boolean
  frais_montant: number
  frais_date_paiement: string | null
  frais_reference: string | null
  rapport_decision: string | null
  rapport_commentaire: string | null
  rapport_date: string | null
  rapport_technicien_nom: string | null
}

type DocumentUpload = {
  id: number
  type_document_id: number
  type_nom: string
  chemin_fichier: string
  verification_auto: boolean
  date_upload: string
  obligatoire: boolean
}

// Constants
const ETAPE_COLORS: Record<string, string> = {
  'reçu': 'bg-blue-100 text-blue-700',
  'vérif_docs': 'bg-yellow-100 text-yellow-700',
  'analyse_tech': 'bg-purple-100 text-purple-700',
  'comité_crédit': 'bg-orange-100 text-orange-700',
  'décision_rendue': 'bg-green-100 text-green-700'
}

const ETAPE_LABELS: Record<string, string> = {
  'reçu': 'Reçu',
  'vérif_docs': 'Vérification docs',
  'analyse_tech': 'Analyse technique',
  'comité_crédit': 'Comité crédit',
  'décision_rendue': 'Décision rendue'
}

const ETAPES_TECHNIQUE = ['reçu', 'vérif_docs', 'analyse_tech']

export default function TechniqueProjetsPage() {
  const { user } = useAuth()
  const { isSubscribed, isSupported, toggle } = usePushNotifications()
  
  // États
  const [projets, setProjets] = useState<Projet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEtape, setFilterEtape] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [showRapportModal, setShowRapportModal] = useState(false)
  const [showRefusModal, setShowRefusModal] = useState(false)
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null)
  const [documents, setDocuments] = useState<DocumentUpload[]>([])
  
  // Loading states
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [validating, setValidating] = useState(false)
  const [validatingDocId, setValidatingDocId] = useState<number | null>(null)
  const [refusComment, setRefusComment] = useState('')
  const [refusLoading, setRefusLoading] = useState(false)
  
  // Rapport
  const [rapportForm, setRapportForm] = useState({
    decision: 'favorable' as 'favorable' | 'defavorable' | 'reserve',
    commentaire: ''
  })
  const [rapportLoading, setRapportLoading] = useState(false)
  const [rapportStep, setRapportStep] = useState<'form' | 'confirm' | 'success'>('form')

  // 🆕 États pour les notifications
  const [showNotificationBanner, setShowNotificationBanner] = useState(false)

  useEffect(() => {
    chargerProjets()
  }, [])

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      chargerProjets(true)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // 🆕 Bannière de notification
  useEffect(() => {
    if (isSupported && !isSubscribed && user) {
      const timer = setTimeout(() => setShowNotificationBanner(true), 3000)
      return () => clearTimeout(timer)
    } else {
      setShowNotificationBanner(false)
    }
  }, [isSupported, isSubscribed, user])

  // ============================================
  // 🆕 FONCTIONS DE NOTIFICATION (SANS RPC)
  // ============================================

  const envoyerNotification = async (
    userId: string | number,
    titre: string,
    message: string,
    type: string = 'info',
    projetId?: number,
    url?: string,
    icone?: string
  ) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: type,
          titre: titre,
          message: message,
          lien: url || null,
          projet_id: projetId || null,
          icone: icone || 'Bell',
          est_lue: false
        })

      if (error) {
        console.error('❌ Erreur insertion notification:', error)
        return false
      }
      return true
    } catch (error) {
      console.error('❌ Erreur notification:', error)
      return false
    }
  }

  const envoyerNotificationPush = async (
    userId: string | number,
    titre: string,
    message: string,
    type: string = 'info',
    projetId?: number,
    url?: string,
    icone?: string
  ) => {
    // Sauvegarder en base
    await envoyerNotification(userId, titre, message, type, projetId, url, icone)

    // Envoyer push si abonné
    if (isSubscribed) {
      try {
        await fetch('/api/push/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId.toString()
          },
          body: JSON.stringify({
            userId: userId,
            notification: {
              title: titre,
              body: message,
              url: url || '/technique/projets',
              type: type,
              projetId: projetId,
              requireInteraction: true,
              vibrate: [200, 100, 200]
            }
          })
        })
      } catch (error) {
        console.log('Push non envoyé:', error)
      }
    }
  }

  const activerNotifications = async () => {
    try {
      await toggle()
      setShowNotificationBanner(false)
      if (user) {
        setTimeout(() => {
          envoyerNotificationPush(
            user.id,
            '🔔 Notifications activées',
            'Vous recevrez des alertes pour les nouveaux projets à valider.',
            'success',
            undefined,
            '/technique/projets',
            'BellRing'
          )
        }, 1000)
      }
    } catch (error) {
      console.error('Erreur activation notifications:', error)
    }
  }

  // ============================================
  // CHARGEMENT DES DONNÉES
  // ============================================

  const chargerProjets = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      else setIsRefreshing(true)
      
      const { data, error } = await supabase
        .from('vue_projets_details')
        .select('*')
        .order('date_soumission', { ascending: false })

      if (error) throw error

      const projetsMapped = data?.map((item: any) => ({
        id: item.id,
        titre: item.titre,
        description: item.description,
        montant_demande: item.montant_demande,
        etape: item.etape,
        decision_finale: item.decision_finale,
        date_soumission: item.date_soumission,
        promoteur_id: item.promoteur_id,
        promoteur_nom: item.promoteur_nom,
        promoteur_email: item.promoteur_email,
        promoteur_telephone: item.promoteur_telephone,
        nombre_documents: item.nombre_documents || 0,
        documents_valides: item.documents_valides || 0,
        docs_obligatoires_total: item.docs_obligatoires_total || 0,
        docs_obligatoires_valides: item.docs_obligatoires_valides || 0,
        frais_dossier_paye: item.frais_dossier_paye ?? item.frais_paye ?? false,
        frais_montant: item.frais_montant || 100,
        frais_date_paiement: item.frais_date_paiement || null,
        frais_reference: item.frais_reference || null,
        rapport_decision: item.rapport_decision || null,
        rapport_commentaire: item.rapport_commentaire || null,
        rapport_date: item.rapport_date || null,
        rapport_technicien_nom: item.rapport_technicien_nom || null
      })) || []

      setProjets(projetsMapped)
    } catch (error) {
      console.error('Erreur chargement:', error)
      if (!silent) setError('Erreur lors du chargement des projets')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const chargerDocuments = async (projetId: number) => {
    setLoadingDocuments(true)
    const { data, error } = await supabase
      .from('documents')
      .select(`id, type_document_id, chemin_fichier, verification_auto, date_upload, type_document (nom, description, obligatoire)`)
      .eq('projet_id', projetId)
      .order('date_upload', { ascending: false })

    if (!error && data) {
      setDocuments(data.map((d: any) => ({
        id: d.id,
        type_document_id: d.type_document_id,
        type_nom: d.type_document?.nom || 'Inconnu',
        chemin_fichier: d.chemin_fichier,
        verification_auto: d.verification_auto,
        date_upload: d.date_upload,
        obligatoire: d.type_document?.obligatoire ?? false
      })))
    }
    setLoadingDocuments(false)
  }

  // ============================================
  // VALIDATION DES DOCUMENTS
  // ============================================

  const ouvrirValidation = async (projet: Projet) => {
    setSelectedProjet(projet)
    await chargerDocuments(projet.id)
    setShowValidationModal(true)
  }

  const toggleVerification = async (docId: number, currentValue: boolean) => {
    setValidatingDocId(docId)
    try {
      const { error } = await supabase
        .from('documents')
        .update({ verification_auto: !currentValue })
        .eq('id', docId)

      if (error) throw error

      if (selectedProjet) {
        await chargerDocuments(selectedProjet.id)
      }
    } catch (error) {
      setError('Erreur lors de la vérification')
    } finally {
      setValidatingDocId(null)
    }
  }

  const validerTousDocuments = async () => {
    if (!selectedProjet) return
    
    setValidating(true)
    try {
      const { error } = await supabase
        .from('documents')
        .update({ verification_auto: true })
        .eq('projet_id', selectedProjet.id)
        .eq('verification_auto', false)

      if (error) throw error

      await supabase
        .from('projets')
        .update({ etape: 'analyse_tech' })
        .eq('id', selectedProjet.id)

      // 🆕 Notification au promoteur
      await envoyerNotificationPush(
        selectedProjet.promoteur_id,
        '✅ Documents validés',
        `Tous les documents de votre projet "${selectedProjet.titre}" ont été validés. Passage en analyse technique.`,
        'validation',
        selectedProjet.id,
        '/promoteur/projets',
        'FileCheck'
      )

      await chargerDocuments(selectedProjet.id)
      await chargerProjets(true)
      setShowValidationModal(false)
      setSuccess('✅ Tous les documents validés ! Projet passé en analyse technique.')
    } catch (error) {
      setError('Erreur lors de la validation')
    } finally {
      setValidating(false)
    }
  }

  const ouvrirRefus = () => {
    setRefusComment('')
    setShowRefusModal(true)
  }

  const confirmerRefus = async () => {
    if (!selectedProjet || !refusComment.trim()) return
    
    setRefusLoading(true)
    try {
      await supabase
        .from('projets')
        .update({ 
          etape: 'reçu'
        })
        .eq('id', selectedProjet.id)

      // 🆕 Notification au promoteur
      await envoyerNotificationPush(
        selectedProjet.promoteur_id,
        '❌ Documents refusés',
        `Documents refusés pour "${selectedProjet.titre}". Raison: ${refusComment}. Veuillez corriger et resoumettre.`,
        'error',
        selectedProjet.id,
        '/promoteur/projets',
        'XCircle'
      )

      await chargerProjets(true)
      setShowRefusModal(false)
      setShowValidationModal(false)
      setSuccess('❌ Documents refusés. Le promoteur a été notifié.')
    } catch (error) {
      setError('Erreur lors du refus')
    } finally {
      setRefusLoading(false)
    }
  }

  // ============================================
  // RAPPORT D'ANALYSE
  // ============================================

  const ouvrirRapport = (projet: Projet) => {
    setSelectedProjet(projet)
    setRapportForm({
      decision: projet.rapport_decision as 'favorable' | 'defavorable' | 'reserve' || 'favorable',
      commentaire: projet.rapport_commentaire || ''
    })
    setRapportStep('form')
    setShowRapportModal(true)
  }

  const passerEnConfirmation = () => {
    if (!rapportForm.commentaire.trim()) {
      setError('Veuillez ajouter un commentaire d\'analyse')
      return
    }
    setRapportStep('confirm')
  }

  const soumettreRapport = async () => {
    if (!selectedProjet || !user) return
    
    setRapportLoading(true)
    setError('')

    try {
      const { data: existingRapport } = await supabase
        .from('rapport_analyse')
        .select('id')
        .eq('projet_id', selectedProjet.id)
        .maybeSingle()

      if (existingRapport) {
        await supabase
          .from('rapport_analyse')
          .update({
            decision: rapportForm.decision,
            commentaire: rapportForm.commentaire,
            technicien_id: user.id
          })
          .eq('id', existingRapport.id)
      } else {
        await supabase
          .from('rapport_analyse')
          .insert({
            projet_id: selectedProjet.id,
            technicien_id: user.id,
            decision: rapportForm.decision,
            commentaire: rapportForm.commentaire
          })
      }

      let nouvelleEtape = 'analyse_tech'
      let notificationTitre = ''
      let notificationMessage = ''
      let notificationType = 'info'

      if (rapportForm.decision === 'favorable') {
        nouvelleEtape = 'comité_crédit'
        notificationTitre = '✅ Rapport favorable'
        notificationMessage = `Analyse terminée pour "${selectedProjet.titre}". Projet transmis au comité de crédit.`
        notificationType = 'success'
      } else if (rapportForm.decision === 'defavorable') {
        nouvelleEtape = 'décision_rendue'
        notificationTitre = '❌ Projet refusé'
        notificationMessage = `Après analyse, votre projet "${selectedProjet.titre}" n'a pas été retenu.`
        notificationType = 'error'
        
        await supabase
          .from('projets')
          .update({ 
            etape: nouvelleEtape,
            decision_finale: 'refusé'
          })
          .eq('id', selectedProjet.id)
      } else {
        notificationTitre = '⚠️ Rapport réservé'
        notificationMessage = `Analyse en cours pour "${selectedProjet.titre}". Des points nécessitent clarification.`
        notificationType = 'warning'
      }

      if (rapportForm.decision !== 'defavorable') {
        await supabase
          .from('projets')
          .update({ etape: nouvelleEtape })
          .eq('id', selectedProjet.id)
      }

      // 🆕 Notification au promoteur
      await envoyerNotificationPush(
        selectedProjet.promoteur_id,
        notificationTitre,
        notificationMessage,
        notificationType,
        selectedProjet.id,
        '/promoteur/projets',
        rapportForm.decision === 'favorable' ? 'TrendingUp' : 
        rapportForm.decision === 'defavorable' ? 'TrendingDown' : 'AlertCircle'
      )

      setRapportStep('success')
      
      setTimeout(async () => {
        setShowRapportModal(false)
        await chargerProjets(true)
        const messages = {
          favorable: '✅ Rapport favorable ! Projet transmis au comité.',
          defavorable: '❌ Rapport défavorable. Projet refusé.',
          reserve: '⚠️ Rapport réservé enregistré.'
        }
        setSuccess(messages[rapportForm.decision])
      }, 2000)
      
    } catch (error: any) {
      console.error('Erreur rapport:', error)
      setError('Erreur lors de la soumission du rapport')
      setRapportStep('form')
    } finally {
      setRapportLoading(false)
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  const ouvrirDetail = async (projet: Projet) => {
    setSelectedProjet(projet)
    await chargerDocuments(projet.id)
    setShowDetailModal(true)
  }

  const formatMontant = (m: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(m)
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

  const projetsFiltres = projets.filter(p => {
    const matchSearch = p.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       p.promoteur_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       p.id.toString().includes(searchTerm)
    const matchEtape = !filterEtape || p.etape === filterEtape
    return matchSearch && matchEtape
  })

  const stats = {
    total: projets.length,
    aValider: projets.filter(p => p.etape === 'reçu' && p.frais_dossier_paye).length,
    enAnalyse: projets.filter(p => p.etape === 'analyse_tech').length,
    rapportsFaits: projets.filter(p => p.rapport_decision !== null).length
  }

  const getDocumentsProgress = (projet: Projet) => {
    if (projet.docs_obligatoires_total === 0) return 0
    return (projet.docs_obligatoires_valides / projet.docs_obligatoires_total) * 100
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <Shield className="h-6 w-6 text-primary/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-700">Chargement des projets...</p>
          <p className="mt-1 text-xs text-gray-500">Service Technique</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Messages */}
      {(success || error) && (
        <div className="fixed top-4 right-4 z-50 max-w-sm animate-slide-in">
          <div className={`rounded-xl shadow-lg p-4 flex items-start gap-3 ${
            success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {success ? <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" /> : 
                       <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />}
            <div className="flex-1">
              <p className="text-sm font-medium">{success ? 'Succès' : 'Erreur'}</p>
              <p className="text-xs text-gray-600 mt-0.5">{success || error}</p>
            </div>
            <button onClick={() => { setSuccess(''); setError('') }} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 🆕 Bannière de notification */}
      {showNotificationBanner && isSupported && !isSubscribed && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellRing className="h-5 w-5 animate-bounce" />
              <div>
                <p className="text-sm font-medium">Activez les notifications</p>
                <p className="text-xs text-blue-100">Soyez alerté des nouveaux projets à valider</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={activerNotifications}
                className="px-4 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50">
                Activer
              </button>
              <button onClick={() => setShowNotificationBanner(false)}
                className="p-1.5 hover:bg-blue-400/30 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Validation & Analyse Technique</h1>
              <p className="text-sm text-gray-500">Validez les dossiers et transmettez vos rapports d'analyse</p>
            </div>
            <div className="flex items-center gap-3">
              {/* 🆕 Bouton notifications */}
              {isSupported && (
                <button onClick={activerNotifications}
                  className={`p-2 rounded-lg transition-all ${
                    isSubscribed 
                      ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={isSubscribed ? 'Notifications activées' : 'Activer les notifications'}>
                  {isSubscribed ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                </button>
              )}
              
              <button onClick={() => chargerProjets(true)} disabled={isRefreshing}
                className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg"
                title="Actualiser">
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Service Technique</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center hover:shadow-md transition-shadow">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <FileText className="h-3 w-3 text-gray-500" />
                <p className="text-xs text-gray-500">Total projets</p>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 text-center hover:shadow-md transition-shadow border border-yellow-100">
              <p className="text-2xl font-bold text-yellow-700">{stats.aValider}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Clock className="h-3 w-3 text-yellow-600" />
                <p className="text-xs text-yellow-600">À valider</p>
              </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center hover:shadow-md transition-shadow border border-purple-100">
              <p className="text-2xl font-bold text-purple-700">{stats.enAnalyse}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Activity className="h-3 w-3 text-purple-600" />
                <p className="text-xs text-purple-600">En analyse</p>
              </div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center hover:shadow-md transition-shadow border border-green-100">
              <p className="text-2xl font-bold text-green-700">{stats.rapportsFaits}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <p className="text-xs text-green-600">Rapports faits</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Rechercher par titre, promoteur ou ID..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select value={filterEtape} onChange={(e) => setFilterEtape(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20">
              <option value="">Toutes les étapes</option>
              {Object.entries(ETAPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste projets */}
      <div className="flex-1 overflow-y-auto p-4">
        {isRefreshing && (
          <div className="max-w-6xl mx-auto mb-3">
            <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <p className="text-xs text-primary">Actualisation en cours...</p>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto space-y-3">
          {projetsFiltres.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun projet trouvé</h3>
              <p className="text-sm text-gray-500">Aucun projet ne correspond à vos critères</p>
            </div>
          ) : (
            projetsFiltres.map(projet => {
              const docProgress = getDocumentsProgress(projet)
              const isAccessible = ETAPES_TECHNIQUE.includes(projet.etape)
              
              return (
                <div key={projet.id} 
                  className={`bg-white rounded-xl border p-4 transition-all ${
                    isAccessible 
                      ? 'border-gray-200 hover:border-primary/30 hover:shadow-md cursor-pointer' 
                      : 'border-gray-100 opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                      projet.rapport_decision === 'favorable' ? 'bg-green-100' :
                      projet.rapport_decision === 'defavorable' ? 'bg-red-100' :
                      projet.etape === 'reçu' ? 'bg-yellow-100' :
                      projet.etape === 'analyse_tech' ? 'bg-purple-100' :
                      'bg-blue-100'
                    }`}>
                      {projet.rapport_decision === 'favorable' ? <CheckCircle className="h-6 w-6 text-green-600" /> :
                       projet.rapport_decision === 'defavorable' ? <XCircle className="h-6 w-6 text-red-600" /> :
                       projet.etape === 'reçu' ? <FileCheck className="h-6 w-6 text-yellow-600" /> :
                       projet.etape === 'analyse_tech' ? <Shield className="h-6 w-6 text-purple-600" /> :
                       <Clock className="h-6 w-6 text-blue-600" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-gray-900">{projet.titre}</h3>
                            
                            {!projet.frais_dossier_paye && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                <AlertCircle className="h-3 w-3" /> Non payé
                              </span>
                            )}
                            
                            {projet.rapport_decision && (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                projet.rapport_decision === 'favorable' ? 'bg-green-100 text-green-700' :
                                projet.rapport_decision === 'defavorable' ? 'bg-red-100 text-red-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {projet.rapport_decision === 'favorable' ? <TrendingUp className="h-3 w-3" /> :
                                 projet.rapport_decision === 'defavorable' ? <TrendingDown className="h-3 w-3" /> :
                                 <AlertCircle className="h-3 w-3" />}
                                Rapport : {projet.rapport_decision}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" /> {projet.promoteur_nom}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {formatDate(projet.date_soumission)}
                            </span>
                            {projet.montant_demande && (
                              <span className="flex items-center gap-1 font-semibold text-gray-700">
                                <DollarSign className="h-3 w-3" /> {formatMontant(projet.montant_demande)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ETAPE_COLORS[projet.etape]}`}>
                          {ETAPE_LABELS[projet.etape]}
                        </span>

                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[150px]">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                docProgress === 100 ? 'bg-green-500' : docProgress > 50 ? 'bg-yellow-500' : 'bg-red-400'
                              }`}
                              style={{ width: `${docProgress}%` }} 
                            />
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            {projet.docs_obligatoires_valides}/{projet.docs_obligatoires_total} docs
                            <span className="text-gray-400 ml-1">({Math.round(docProgress)}%)</span>
                          </span>
                        </div>

                        {isAccessible && (
                          <div className="flex items-center gap-2">
                            {projet.etape === 'reçu' && projet.frais_dossier_paye && (
                              <button onClick={(e) => { e.stopPropagation(); ouvrirValidation(projet) }}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                              >
                                <FileCheck className="h-3 w-3" /> Valider docs
                              </button>
                            )}

                            {projet.etape === 'analyse_tech' && (
                              <button onClick={(e) => { e.stopPropagation(); ouvrirRapport(projet) }}
                                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                              >
                                <Send className="h-3 w-3" /> Rapport
                              </button>
                            )}

                            <button onClick={(e) => { e.stopPropagation(); ouvrirDetail(projet) }}
                              className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                              title="Voir détails"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* MODAL VALIDATION DOCUMENTS */}
      {showValidationModal && selectedProjet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Validation des documents</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500">{selectedProjet.titre}</p>
                  <span className="text-xs text-gray-400">•</span>
                  <p className="text-xs text-gray-500">{selectedProjet.promoteur_nom}</p>
                </div>
              </div>
              <button onClick={() => setShowValidationModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingDocuments ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="text-sm text-gray-500 mt-3">Chargement des documents...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map(doc => (
                    <div key={doc.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      doc.verification_auto 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => toggleVerification(doc.id, doc.verification_auto)}
                          disabled={validatingDocId === doc.id}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                            doc.verification_auto 
                              ? 'bg-green-500 text-white shadow-sm' 
                              : 'bg-white border-2 border-gray-300 text-gray-400 hover:border-green-400 hover:text-green-600'
                          } ${validatingDocId === doc.id ? 'opacity-50' : ''}`}
                        >
                          {validatingDocId === doc.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{doc.type_nom}</p>
                            {doc.obligatoire && (
                              <span className="text-xs text-red-500 font-medium">Obligatoire</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{formatDate(doc.date_upload)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.verification_auto && (
                          <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded-full">
                            Validé
                          </span>
                        )}
                        <a href={doc.chemin_fichier} target="_blank"
                          className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg"
                          title="Voir le document">
                          <Eye className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  ))}

                  {documents.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Aucun document à valider</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex-shrink-0 p-6 border-t border-gray-100 flex gap-3">
              <button onClick={ouvrirRefus} disabled={validating || documents.length === 0}
                className="flex-1 px-4 py-2.5 border border-red-300 text-red-700 text-sm font-medium rounded-xl hover:bg-red-50 disabled:opacity-50">
                <XCircle className="h-4 w-4 inline mr-1" /> Refuser les documents
              </button>
              <button onClick={validerTousDocuments} disabled={validating || documents.length === 0}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm">
                {validating ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Validation...</>
                ) : (
                  <><CheckCircle className="h-4 w-4" /> Valider tout → Analyse technique</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REFUS DOCUMENTS */}
      {showRefusModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <h2 className="text-lg font-bold text-gray-900">Refuser les documents</h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">Cette action est irréversible.</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison du refus <span className="text-red-500">*</span>
                </label>
                <textarea value={refusComment} onChange={(e) => setRefusComment(e.target.value)}
                  placeholder="Expliquez pourquoi les documents sont refusés..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none" />
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <Info className="h-4 w-4 text-red-500 mt-0.5" />
                <p className="text-xs text-red-700">Le promoteur sera notifié et devra resoumettre ses documents.</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowRefusModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm rounded-xl hover:bg-gray-50">
                  Annuler
                </button>
                <button onClick={confirmerRefus} disabled={refusLoading || !refusComment.trim()}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {refusLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                  Confirmer le refus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RAPPORT D'ANALYSE */}
      {showRapportModal && selectedProjet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {rapportStep === 'confirm' ? 'Confirmation' : rapportStep === 'success' ? 'Transmis' : 'Rapport d\'analyse'}
                </h2>
                <p className="text-xs text-gray-500">{selectedProjet.titre}</p>
              </div>
              {rapportStep !== 'success' && (
                <button onClick={() => setShowRapportModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              )}
            </div>

            <div className="p-6">
              {rapportStep === 'form' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">{selectedProjet.promoteur_nom}</span>
                    </div>
                    <p className="text-xs text-gray-600">{selectedProjet.description || 'Aucune description'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Décision</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'favorable', label: 'Favorable', icon: TrendingUp, color: 'green' },
                        { value: 'defavorable', label: 'Défavorable', icon: TrendingDown, color: 'red' },
                        { value: 'reserve', label: 'Réservé', icon: AlertCircle, color: 'orange' }
                      ].map(option => (
                        <button key={option.value} onClick={() => setRapportForm({...rapportForm, decision: option.value as any})}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                            rapportForm.decision === option.value
                              ? `border-${option.color}-500 bg-${option.color}-50 shadow-sm`
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}>
                          <option.icon className={`h-5 w-5 mx-auto mb-1 ${
                            rapportForm.decision === option.value ? `text-${option.color}-600` : 'text-gray-400'
                          }`} />
                          <p className="text-xs font-medium">{option.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MessageSquare className="h-4 w-4 inline mr-1" /> Commentaire
                    </label>
                    <textarea rows={5} value={rapportForm.commentaire}
                      onChange={(e) => setRapportForm({...rapportForm, commentaire: e.target.value})}
                      placeholder="Votre analyse détaillée..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
                  </div>

                  <button onClick={passerEnConfirmation}
                    className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 flex items-center justify-center gap-2 shadow-sm">
                    Continuer <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {rapportStep === 'confirm' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Décision</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        rapportForm.decision === 'favorable' ? 'bg-green-100 text-green-700' :
                        rapportForm.decision === 'defavorable' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>{rapportForm.decision}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Commentaire</span>
                      <p className="text-sm text-gray-900 mt-1 bg-white rounded-lg p-3">{rapportForm.commentaire}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setRapportStep('form')}
                      className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2">
                      <ArrowLeft className="h-4 w-4" /> Modifier
                    </button>
                    <button onClick={soumettreRapport} disabled={rapportLoading}
                      className="flex-1 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                      {rapportLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      Confirmer et transmettre
                    </button>
                  </div>
                </div>
              )}

              {rapportStep === 'success' && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Rapport transmis !</h3>
                  <p className="text-sm text-gray-500">Le promoteur sera notifié de la décision.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DÉTAIL PROJET */}
      {showDetailModal && selectedProjet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedProjet.titre}</h2>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" /> {selectedProjet.promoteur_nom}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(selectedProjet.date_soumission)}</span>
                  {selectedProjet.montant_demande && <span className="font-semibold">{formatMontant(selectedProjet.montant_demande)}</span>}
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Informations Promoteur</h3>
                <div className="space-y-1 text-xs">
                  {selectedProjet.promoteur_email && <p className="text-blue-700">Email : {selectedProjet.promoteur_email}</p>}
                  {selectedProjet.promoteur_telephone && <p className="text-blue-700">Téléphone : {selectedProjet.promoteur_telephone}</p>}
                  <p className="text-blue-700">Frais : {selectedProjet.frais_dossier_paye ? '✅ Payé' : '❌ Non payé'}</p>
                </div>
              </div>

              {selectedProjet.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 whitespace-pre-wrap">{selectedProjet.description}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Documents ({documents.length})</h3>
                {loadingDocuments ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                    <p className="text-xs text-gray-500 mt-2">Chargement...</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {documents.map(doc => (
                      <div key={doc.id} className={`flex items-center justify-between p-3 rounded-lg ${doc.verification_auto ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-3">
                          {doc.verification_auto ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-gray-400" />}
                          <span className="text-sm">{doc.type_nom}</span>
                          {doc.obligatoire && <span className="text-xs text-red-500">*</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{formatDate(doc.date_upload)}</span>
                          <a href={doc.chemin_fichier} target="_blank" className="px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg">Voir</a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce { animation: bounce 1s infinite; }
      `}</style>
    </div>
  )
}