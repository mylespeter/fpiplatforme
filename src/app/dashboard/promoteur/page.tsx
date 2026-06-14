

// 'use client'

// import { useState, useEffect } from 'react'
// import { useAuth } from '@/context/AuthContext'
// import { usePushNotifications } from '@/context/PushNotificationContext'
// import { supabase } from '@/lib/supabase'
// import { 
//   Plus, FileText, Clock, CheckCircle, XCircle, AlertCircle, 
//   Loader2, Eye, Upload, X, Trash2,
//   DollarSign, CreditCard, FileCheck, Calendar, 
//   Shield, Ban, Check, Smartphone, Building2, QrCode,
//   Wifi, Bell, BellRing, Edit3, Search, Filter, ChevronDown,
//   ArrowUpDown, MoreHorizontal, Download, ExternalLink,
//   LayoutGrid, List, SlidersHorizontal, ChevronRight,
//   Mail, Phone, MapPin, Briefcase, Users, TrendingUp,
//   PieChart, BarChart3, Activity, Target,
//   Folder
// } from 'lucide-react'
// import FormulaireFPI from '@/components/fpi/FormulaireFPI'
// import FormulaireFPIModification from '@/components/fpi/FormulaireFPIModification'

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
//   type_projet: 'fpi' | 'standard'
// }

// type TypeDocument = {
//   id: number
//   nom: string
//   description: string
//   obligatoire: boolean
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

// const ETAPES = [
//   // { key: 'creation', label: 'Création', icon: Clock, desc: 'Projet créé' },
//   // { key: 'reçu', label: 'Reçu', icon: Clock, desc: 'Projet soumis' },
//   { key: 'soumission', label: 'Soumission', icon: FileText, desc: 'En attente' },
//   { key: 'analyse_tech', label: 'Analyse Tech', icon: Shield, desc: 'Analyse technique' },
//   { key: 'comité_crédit', label: 'Comité', icon: CreditCard, desc: 'Comité de crédit' },
//   { key: 'décision_rendue', label: 'Décision', icon: CheckCircle, desc: 'Décision finale' }
// ]

// const FRAIS_DOSSIER = 500

// export default function PromoteurProjetsPage() {
//   const { user } = useAuth()
//   const { isSubscribed, isSupported, toggle } = usePushNotifications()
  
//   // États principaux
//   const [projets, setProjets] = useState<Projet[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
  
//   // États UI
//   const [showFormulaireFPI, setShowFormulaireFPI] = useState(false)
//   const [showFormulaireModification, setShowFormulaireModification] = useState(false)
//   const [projetAModifier, setProjetAModifier] = useState<Projet | null>(null)
//   const [showDetailModal, setShowDetailModal] = useState(false)
//   const [showPaiementModal, setShowPaiementModal] = useState(false)
//   const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null)
//   const [documents, setDocuments] = useState<DocumentUpload[]>([])
//   const [typesDocuments, setTypesDocuments] = useState<TypeDocument[]>([])
  
//   // États de filtrage et recherche
//   const [searchTerm, setSearchTerm] = useState('')
//   const [filterStatus, setFilterStatus] = useState('all') // 'all', 'active', 'pending_payment', 'completed'
//   const [sortBy, setSortBy] = useState('date_desc') // 'date_desc', 'date_asc', 'montant_desc', 'montant_asc'
//   const [showFilters, setShowFilters] = useState(false)
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('list') // Correction: string literal to union type
  
//   // États de paiement
//   const [paiementStep, setPaiementStep] = useState<'method' | 'details' | 'processing' | 'confirmation' | 'success'>('method')
//   const [paiementLoading, setPaiementLoading] = useState(false)
//   const [referencePaiement, setReferencePaiement] = useState('')
//   const [methodePaiement, setMethodePaiement] = useState<'mobile_money' | 'carte' | 'virement'>('mobile_money')
//   const [operateurMobile, setOperateurMobile] = useState<'orange' | 'mtn' | 'airtel'>('orange')
//   const [numeroMobile, setNumeroMobile] = useState('')
//   const [numeroCarte, setNumeroCarte] = useState('')
//   const [dateExpiration, setDateExpiration] = useState('')
//   const [cvv, setCvv] = useState('')
//   const [nomBanque, setNomBanque] = useState('')
//   const [progressPaiement, setProgressPaiement] = useState(0)
//   const [showOTP, setShowOTP] = useState(false)
//   const [otpCode, setOtpCode] = useState('')
//   const [paiementError, setPaiementError] = useState('')
//   const [countdown, setCountdown] = useState(0)
  
//   // États de documents
//   const [loadingDocuments, setLoadingDocuments] = useState(false)
//   const [deletingDocId, setDeletingDocId] = useState<number | null>(null)
//   const [uploadingDocId, setUploadingDocId] = useState<number | null>(null)

//   // États de notification
//   const [sendingNotification, setSendingNotification] = useState(false)
//   const [showNotificationBanner, setShowNotificationBanner] = useState(false)

//   // Statistiques
//   const [stats, setStats] = useState({
//     total: 0,
//     enCours: 0,
//     enAttentePaiement: 0,
//     approuves: 0,
//     refuses: 0,
//     montantTotal: 0
//   })

//   const getUserId = (): number => {
//     if (!user?.id) return 0
//     const uid = typeof user.id === 'string' ? parseInt(user.id) : user.id
//     return isNaN(uid) ? 0 : uid
//   }

//   // Calculer les statistiques
//   useEffect(() => {
//     if (projets.length > 0) {
//       const stats = {
//         total: projets.length,
//         enCours: projets.filter(p => !p.decision_finale && p.frais_dossier_paye).length,
//         enAttentePaiement: projets.filter(p => !p.frais_dossier_paye).length,
//         approuves: projets.filter(p => p.decision_finale === 'approuvé').length,
//         refuses: projets.filter(p => p.decision_finale === 'refusé').length,
//         montantTotal: projets.reduce((sum, p) => sum + (p.montant_demande || 0), 0)
//       }
//       setStats(stats)
//     }
//   }, [projets])

//   // Filtrer et trier les projets
//   const filteredAndSortedProjects = projets
//     .filter(projet => {
//       // Filtre de recherche
//       if (searchTerm && !projet.titre.toLowerCase().includes(searchTerm.toLowerCase())) {
//         return false
//       }
      
//       // Filtre de statut
//       switch (filterStatus) {
//         case 'active':
//           return projet.frais_dossier_paye && !projet.decision_finale
//         case 'pending_payment':
//           return !projet.frais_dossier_paye
//         case 'completed':
//           return projet.decision_finale !== null
//         default:
//           return true
//       }
//     })
//     .sort((a, b) => {
//       switch (sortBy) {
//         case 'date_asc':
//           return new Date(a.date_soumission).getTime() - new Date(b.date_soumission).getTime()
//         case 'montant_desc':
//           return (b.montant_demande || 0) - (a.montant_demande || 0)
//         case 'montant_asc':
//           return (a.montant_demande || 0) - (b.montant_demande || 0)
//         default: // date_desc
//           return new Date(b.date_soumission).getTime() - new Date(a.date_soumission).getTime()
//       }
//     })

//   const envoyerNotification = async (
//     titre: string,
//     message: string,
//     type: 'info' | 'success' | 'warning' | 'error' | 'paiement' | 'document' | 'validation' | 'decision' = 'info',
//     projetId?: number,
//     url?: string,
//     icone?: string
//   ) => {
//     if (!user?.id) return false

//     try {
//       const { error } = await supabase
//         .from('notifications')
//         .insert({
//           user_id: user.id,
//           type: type,
//           titre: titre,
//           message: message,
//           lien: url || null,
//           projet_id: projetId || null,
//           document_id: null,
//           rapport_id: null,
//           icone: icone || 'Bell',
//           est_lue: false
//         })

//       if (error) return false
//       return true
//     } catch (error) {
//       return false
//     }
//   }

//   const envoyerNotificationPush = async (
//     titre: string,
//     message: string,
//     type: 'info' | 'success' | 'warning' | 'error' | 'paiement' | 'document' | 'validation' | 'decision' = 'info',
//     projetId?: number,
//     url?: string,
//     icone?: string
//   ) => {
//     const saved = await envoyerNotification(titre, message, type, projetId, url, icone)
    
//     if (isSubscribed && user?.id) {
//       try {
//         await fetch('/api/push/send', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'x-user-id': user.id.toString()
//           },
//           body: JSON.stringify({
//             userId: user.id,
//             notification: {
//               title: titre,
//               body: message,
//               url: url || '/dashboard/promoteur',
//               type: type,
//               projetId: projetId,
//               requireInteraction: type === 'paiement' || type === 'error',
//               vibrate: [200, 100, 200]
//             }
//           })
//         })
//       } catch (error) {
//         console.log('Push non envoyé')
//       }
//     }
    
//     return saved
//   }

// const activerNotifications = async () => {
//     try {
//       await toggle()
//       setShowNotificationBanner(false)
      
//       setTimeout(() => {
//         envoyerNotificationPush(
//           '🔔 Notifications activées',
//           'Vous recevrez désormais des alertes pour vos projets, paiements et décisions.',
//           'success'
//         )
//       }, 1000)
//     } catch (error) {
//       console.error('Erreur activation notifications:', error)
//     }
//   }

//   useEffect(() => {
//     if (user) {
//       chargerProjets()
//       chargerTypesDocuments()
//     }
//   }, [user])

//   useEffect(() => {
//     if (isSupported && !isSubscribed && user) {
//       const timer = setTimeout(() => {
//         setShowNotificationBanner(true)
//       }, 3000)
//       return () => clearTimeout(timer)
//     } else {
//       setShowNotificationBanner(false)
//     }
//   }, [isSupported, isSubscribed, user])

//   useEffect(() => {
//     let timer: NodeJS.Timeout
//     if (paiementStep === 'processing' && progressPaiement < 100) {
//       timer = setInterval(() => {
//         setProgressPaiement(prev => {
//           const newProgress = prev + Math.random() * 15
//           if (newProgress >= 100) {
//             clearInterval(timer)
//             setTimeout(() => {
//               setPaiementStep('confirmation')
//               setShowOTP(true)
//               setCountdown(120)
//             }, 500)
//             return 100
//           }
//           return newProgress
//         })
//       }, 800)
//     }
//     return () => clearInterval(timer)
//   }, [paiementStep, progressPaiement])

//   useEffect(() => {
//     let timer: NodeJS.Timeout
//     if (countdown > 0 && showOTP) {
//       timer = setInterval(() => {
//         setCountdown(prev => {
//           if (prev <= 1) {
//             setPaiementError('Code expiré. Veuillez réessayer.')
//             setShowOTP(false)
//             return 0
//           }
//           return prev - 1
//         })
//       }, 1000)
//     }
//     return () => clearInterval(timer)
//   }, [countdown, showOTP])

//   const chargerProjets = async () => {
//     try {
//       setLoading(true)
//       const uid = getUserId()
      
//       if (!uid) {
//         setProjets([])
//         return
//       }

//       const { data: projetsFPI } = await supabase
//         .from('vue_projets_fpi_details')
//         .select('*')
//         .eq('promoteur_id', uid)
//         .order('created_at', { ascending: false })

//       const { data: anciensProjets } = await supabase
//         .from('projets')
//         .select('*')
//         .eq('promoteur_id', uid)
//         .order('date_soumission', { ascending: false })

//       const projetsFPIMapped: Projet[] = (projetsFPI || []).map((item: any) => ({
//         id: item.id,
//         titre: item.nom_projet || 'Projet FPI',
//         description: item.description_projet,
//         montant_demande: item.montant_sollicite,
//         etape: item.etape || 'reçu',
//         decision_finale: item.decision_finale,
//         date_soumission: item.created_at,
//         promoteur_id: item.promoteur_id,
//         promoteur_nom: item.promoteur_nom_complet,
//         promoteur_email: item.promoteur_email,
//         nombre_documents: item.nombre_documents || 0,
//         documents_valides: item.documents_valides || 0,
//         docs_obligatoires_total: 5,
//         docs_obligatoires_valides: item.documents_valides || 0,
//         frais_dossier_paye: item.frais_paye === true || item.est_paye === true || false,
//         frais_montant: item.frais_montant || FRAIS_DOSSIER,
//         frais_date_paiement: item.frais_date_paiement || null,
//         frais_reference: item.frais_reference || null,
//         rapport_decision: null,
//         rapport_commentaire: item.commentaire_decision || null,
//         rapport_date: null,
//         rapport_technicien_nom: null,
//         type_projet: 'fpi' as const
//       }))

//       const anciensProjetsMapped: Projet[] = (anciensProjets || []).map((item: any) => ({
//         id: item.id,
//         titre: item.titre,
//         description: item.description,
//         montant_demande: item.montant_demande,
//         etape: item.etape,
//         decision_finale: item.decision_finale,
//         date_soumission: item.date_soumission,
//         promoteur_id: item.promoteur_id,
//         promoteur_nom: '',
//         promoteur_email: null,
//         nombre_documents: 0,
//         documents_valides: 0,
//         docs_obligatoires_total: 0,
//         docs_obligatoires_valides: 0,
//         frais_dossier_paye: item.frais_paye === true || false,
//         frais_montant: FRAIS_DOSSIER,
//         frais_date_paiement: null,
//         frais_reference: null,
//         rapport_decision: null,
//         rapport_commentaire: null,
//         rapport_date: null,
//         rapport_technicien_nom: null,
//         type_projet: 'standard' as const
//       }))

//       const tousLesProjets = [...projetsFPIMapped, ...anciensProjetsMapped]
//         .sort((a, b) => new Date(b.date_soumission).getTime() - new Date(a.date_soumission).getTime())

//       setProjets(tousLesProjets)
//     } catch (error) {
//       console.error('Erreur chargement projets:', error)
//       setProjets([])
//     } finally {
//       setLoading(false)
//     }
//   }

//   const peutEtreModifie = (projet: Projet): boolean => {
//     if (projet.type_projet !== 'fpi') return false
//     const etapesModifiables = ['creation', 'reçu', 'soumission']
//     return etapesModifiables.includes(projet.etape) && !projet.frais_dossier_paye
//   }

//   const chargerDocuments = async (projetId: number) => {
//     setLoadingDocuments(true)
    
//     const { data: docsFPI } = await supabase
//       .from('documents_fpi')
//       .select('*')
//       .eq('projet_id', projetId)
//       .order('created_at', { ascending: false })

//     if (docsFPI && docsFPI.length > 0) {
//       setDocuments(docsFPI.map((d: any) => ({
//         id: d.id,
//         type_document_id: d.id,
//         type_nom: d.type_document.replace(/_/g, ' ').toUpperCase(),
//         chemin_fichier: d.chemin_fichier,
//         verification_auto: d.verification_auto,
//         date_upload: d.created_at,
//         obligatoire: true
//       })))
//     } else {
//       const { data: docsStandard } = await supabase
//         .from('documents')
//         .select(`id, type_document_id, chemin_fichier, verification_auto, date_upload, type_document (nom, description, obligatoire)`)
//         .eq('projet_id', projetId)
//         .order('date_upload', { ascending: false })

//       if (docsStandard) {
//         setDocuments(docsStandard.map((d: any) => ({
//           id: d.id,
//           type_document_id: d.type_document_id,
//           type_nom: d.type_document?.nom || 'Document',
//           chemin_fichier: d.chemin_fichier,
//           verification_auto: d.verification_auto,
//           date_upload: d.date_upload,
//           obligatoire: d.type_document?.obligatoire || false
//         })))
//       } else {
//         setDocuments([])
//       }
//     }
    
//     setLoadingDocuments(false)
//   }

//   const chargerTypesDocuments = async () => {
//     const { data } = await supabase
//       .from('type_document')
//       .select('*')
//       .order('obligatoire', { ascending: false })
//     if (data) setTypesDocuments(data)
//   }

//   const ouvrirPaiement = (projet: Projet) => {
//     setSelectedProjet(projet)
//     setReferencePaiement(`FPI-${Date.now().toString(36).toUpperCase()}`)
//     setPaiementStep('method')
//     setMethodePaiement('mobile_money')
//     setNumeroMobile('')
//     setNumeroCarte('')
//     setDateExpiration('')
//     setCvv('')
//     setNomBanque('')
//     setProgressPaiement(0)
//     setShowOTP(false)
//     setOtpCode('')
//     setPaiementError('')
//     setCountdown(0)
//     setShowPaiementModal(true)
//   }

//   const demarrerPaiement = () => {
//     if (methodePaiement === 'mobile_money' && !numeroMobile) {
//       setPaiementError('Veuillez entrer un numéro de téléphone')
//       return
//     }
//     if (methodePaiement === 'carte' && (!numeroCarte || !dateExpiration || !cvv)) {
//       setPaiementError('Veuillez remplir tous les champs de la carte')
//       return
//     }
//     if (methodePaiement === 'virement' && !nomBanque) {
//       setPaiementError('Veuillez sélectionner une banque')
//       return
//     }
    
//     setPaiementError('')
//     setPaiementStep('processing')
//     setProgressPaiement(0)
    
//     envoyerNotificationPush(
//       '💳 Paiement en cours',
//       `Traitement de votre paiement de $${FRAIS_DOSSIER} pour "${selectedProjet?.titre}"`,
//       'paiement',
//       selectedProjet?.id
//     )
//   }

//   const validerOTP = async () => {
//     if (otpCode.length !== 6) {
//       setPaiementError('Code invalide. Veuillez entrer les 6 chiffres.')
//       return
//     }
    
//     setPaiementLoading(true)
//     setPaiementError('')
    
//     await new Promise(resolve => setTimeout(resolve, 2000))
    
//     try {
//       if (!selectedProjet) throw new Error('Aucun projet sélectionné')

//       const paiementData = {
//         est_paye: true,
//         reference_paiement: referencePaiement,
//         date_paiement: new Date().toISOString(),
//         methode_paiement: methodePaiement,
//         operateur: methodePaiement === 'mobile_money' ? operateurMobile : null,
//         numero: numeroMobile || numeroCarte || null
//       }

//       const { data: existingFPI } = await supabase
//         .from('frais_dossier_fpi')
//         .select('id')
//         .eq('projet_id', selectedProjet.id)
//         .maybeSingle()

//       if (existingFPI) {
//         await supabase
//           .from('frais_dossier_fpi')
//           .update(paiementData)
//           .eq('id', existingFPI.id)

//         await supabase
//           .from('projets_fpi')
//           .update({ frais_paye: true, statut: 'soumis' })
//           .eq('id', selectedProjet.id)
//       } else {
//         const { data: existing } = await supabase
//           .from('frais_dossier')
//           .select('id')
//           .eq('projet_id', selectedProjet.id)
//           .maybeSingle()

//         if (existing) {
//           await supabase
//             .from('frais_dossier')
//             .update(paiementData)
//             .eq('id', existing.id)
//         } else {
//           await supabase
//             .from('frais_dossier')
//             .insert({
//               projet_id: selectedProjet.id,
//               montant: FRAIS_DOSSIER,
//               ...paiementData
//             })
//         }

//         await supabase
//           .from('projets')
//           .update({ frais_paye: true })
//           .eq('id', selectedProjet.id)
//       }

//       setPaiementStep('success')
//       await chargerProjets()
      
//       envoyerNotificationPush(
//         '✅ Paiement confirmé !',
//         `Votre paiement de $${FRAIS_DOSSIER} USD pour "${selectedProjet.titre}" a été effectué avec succès. Réf: ${referencePaiement}`,
//         'paiement',
//         selectedProjet.id,
//         '/dashboard/promoteur',
//         'CheckCircle'
//       )
      
//       setTimeout(() => {
//         setShowPaiementModal(false)
//         setSuccess('✅ Paiement effectué avec succès ! Votre dossier va être traité.')
//       }, 2500)
      
//     } catch (error: any) {
//       console.error('❌ Erreur paiement:', error)
//       setPaiementError(error.message || 'Erreur lors du paiement')
//       setPaiementStep('method')
//     } finally {
//       setPaiementLoading(false)
//     }
//   }

//   const uploadDocument = async (typeId: number, file: File) => {
//     if (!selectedProjet) return
    
//     setUploadingDocId(typeId)
//     setError('')

//     try {
//       const fileExt = file.name.split('.').pop()
//       const fileName = `${selectedProjet.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`

//       let bucketName = 'documents_fpi'
//       let tableName = 'documents_fpi'
//       let uploadSuccess = false

//       try {
//         const { error: uploadError } = await supabase.storage
//           .from(bucketName)
//           .upload(fileName, file)

//         if (!uploadError) {
//           uploadSuccess = true
//         }
//       } catch {
//         // Le bucket n'existe peut-être pas
//       }

//       if (!uploadSuccess) {
//         bucketName = 'documents'
//         tableName = 'documents'
        
//         const { error: uploadError } = await supabase.storage
//           .from(bucketName)
//           .upload(fileName, file)

//         if (uploadError) throw uploadError
//       }

//       const { data: { publicUrl } } = supabase.storage
//         .from(bucketName)
//         .getPublicUrl(fileName)

//       if (tableName === 'documents_fpi') {
//         await supabase.from(tableName).insert({
//           projet_id: selectedProjet.id,
//           type_document: 'document_complementaire',
//           chemin_fichier: publicUrl,
//           nom_fichier: file.name
//         })
//       } else {
//         await supabase.from(tableName).insert({
//           projet_id: selectedProjet.id,
//           type_document_id: typeId,
//           chemin_fichier: publicUrl
//         })
//       }

//       await chargerDocuments(selectedProjet.id)
//       await chargerProjets()
//       setSuccess('Document ajouté avec succès')
      
//       envoyerNotificationPush(
//         '📄 Document ajouté',
//         `Nouveau document pour le projet "${selectedProjet.titre}"`,
//         'document',
//         selectedProjet.id
//       )
//     } catch (error) {
//       setError('Erreur lors de l\'upload')
//     } finally {
//       setUploadingDocId(null)
//     }
//   }

//   const supprimerDocument = async (docId: number) => {
//     if (!window.confirm('Supprimer ce document ?')) return
    
//     setDeletingDocId(docId)
//     try {
//       await supabase.from('documents_fpi').delete().eq('id', docId)
//       await supabase.from('documents').delete().eq('id', docId)
      
//       if (selectedProjet) {
//         await chargerDocuments(selectedProjet.id)
//         await chargerProjets()
//       }
//       setSuccess('Document supprimé')
//     } catch (error) {
//       setError('Erreur lors de la suppression')
//     } finally {
//       setDeletingDocId(null)
//     }
//   }

//   const ouvrirDetail = async (projet: Projet) => {
//     setSelectedProjet(projet)
//     setShowDetailModal(true)
//     await chargerDocuments(projet.id)
//   }

//   const formatMontant = (m: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(m)
//   const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
//   const getEtapeIndex = (etape: string) => Math.max(0, ETAPES.findIndex(e => e.key === etape))

//   const formatCardNumber = (value: string) => {
//     const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
//     const parts = []
//     for (let i = 0; i < v.length; i += 4) {
//       parts.push(v.substring(i, i + 4))
//     }
//     return parts.slice(0, 4).join(' ')
//   }

//   const operateurs = [
//     { id: 'orange', nom: 'Orange Money', couleur: 'bg-orange-500', code: 'OM' },
//     { id: 'mtn', nom: 'MTN Mobile Money', couleur: 'bg-yellow-500', code: 'MoMo' },
//     { id: 'airtel', nom: 'Airtel Money', couleur: 'bg-red-500', code: 'AM' }
//   ]

//   const banques = [
//     'Rawbank', 'BCDC', 'TMB', 'Equity BCDC', 'Afriland', 
//     'Sofibanque', 'FBN Bank', 'Access Bank', 'UBA', 'Standard Bank'
//   ]

//   const getStatusColor = (projet: Projet) => {
//     if (projet.decision_finale === 'approuvé') return 'green'
//     if (projet.decision_finale === 'refusé') return 'red'
//     if (!projet.frais_dossier_paye) return 'yellow'
//     return 'blue'
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
//         <div className="text-center">
//           <div className="relative">
//             <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
//             <div className="absolute inset-0 flex items-center justify-center">
//               <FileText className="h-8 w-8 text-primary/50" />
//             </div>
//           </div>
//           <h3 className="mt-6 text-lg font-semibold text-gray-900">Chargement de vos projets</h3>
//           <p className="mt-2 text-sm text-gray-500">Préparation de votre espace de travail...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
//       {/* BANNIÈRE NOTIFICATIONS */}
//       {showNotificationBanner && isSupported && !isSubscribed && (
//         <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="flex-shrink-0">
//                   <BellRing className="h-5 w-5 animate-bounce" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium">Restez informé en temps réel</p>
//                   <p className="text-xs text-blue-100">Activez les notifications pour suivre vos projets</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={activerNotifications}
//                   className="px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105"
//                 >
//                   Activer maintenant
//                 </button>
//                 <button
//                   onClick={() => setShowNotificationBanner(false)}
//                   className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
//                 >
//                   <X className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Messages Toast */}
//       {(success || error) && (
//         <div className="fixed top-4 right-4 z-50 max-w-sm animate-slide-in">
//           <div className={`rounded-2xl shadow-2xl p-4 flex items-start gap-3 backdrop-blur-sm ${
//             success ? 'bg-green-50/95 border border-green-200' : 'bg-red-50/95 border border-red-200'
//           }`}>
//             {success ? <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" /> : 
//                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />}
//             <div className="flex-1">
//               <p className="text-sm font-semibold">{success ? 'Succès' : 'Erreur'}</p>
//               <p className="text-xs text-gray-600 mt-0.5">{success || error}</p>
//             </div>
//             <button onClick={() => { setSuccess(''); setError('') }} className="text-gray-400 hover:text-gray-600 transition-colors">
//               <X className="h-4 w-4" />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* HEADER PRINCIPAL */}
//       <div className="bg-white border-b border-gray-200 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="py-6">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//               <div>
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-primary/10 rounded-xl">
//                     <Briefcase className="h-6 w-6 text-primary" />
//                   </div>
//                   <div>
//                     <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
//                     <p className="text-sm text-gray-500 mt-0.5">Gérez vos projets de financement</p>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="flex items-center gap-3">
//                 {isSupported && (
//                   <button
//                     onClick={activerNotifications}
//                     disabled={sendingNotification}
//                     className={`p-2.5 rounded-xl transition-all ${
//                       isSubscribed 
//                         ? 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200' 
//                         : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
//                     }`}
//                     title={isSubscribed ? 'Notifications activées' : 'Activer les notifications'}
//                   >
//                     {sendingNotification ? (
//                       <Loader2 className="h-5 w-5 animate-spin" />
//                     ) : isSubscribed ? (
//                       <BellRing className="h-5 w-5" />
//                     ) : (
//                       <Bell className="h-5 w-5" />
//                     )}
//                   </button>
//                 )}
                
//                 <button 
//                   onClick={() => setShowFormulaireFPI(true)}
//                   className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all transform hover:scale-105 active:scale-95"
//                 >
//                   <Plus className="h-4 w-4" /> 
//                   <span className="hidden sm:inline">Nouvelle demande</span>
//                   <span className="sm:hidden">Nouveau</span>
//                 </button>
//               </div>
//             </div>
// <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-6">
//   <div className="rounded-lg p-3 border border-gray-200">
//     <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
//     <p className="text-xs text-gray-500">Total</p>
//   </div>

//   <div className="rounded-lg p-3 border border-gray-200">
//     <p className="text-xl font-semibold text-gray-900">{stats.enCours}</p>
//     <p className="text-xs text-gray-500">En cours</p>
//   </div>

//   <div className="rounded-lg p-3 border border-gray-200">
//     <p className="text-xl font-semibold text-gray-900">{stats.approuves}</p>
//     <p className="text-xs text-gray-500">Approuvés</p>
//   </div>

//   <div className="rounded-lg p-3 border border-gray-200">
//     <p className="text-xl font-semibold text-gray-900">{stats.refuses}</p>
//     <p className="text-xs text-gray-500">Refusés</p>
//   </div>

//   <div className="rounded-lg p-3 border border-gray-200">
//     <p className="text-base font-semibold text-gray-900 truncate">{formatMontant(stats.montantTotal)}</p>
//     <p className="text-xs text-gray-500">Montant</p>
//   </div>
// </div>
         
//           </div>
//         </div>
//       </div>

//       {/* CONTENU PRINCIPAL */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         {/* BARRE D'OUTILS */}
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
//           <div className="flex flex-col sm:flex-row gap-4">
//             {/* Recherche */}
//             <div className="flex-1 relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Rechercher un projet..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
//               />
//             </div>

//             {/* Filtres et tris */}
//             <div className="flex items-center gap-2">
//               <div className="relative">
//                 <button
//                   onClick={() => setShowFilters(!showFilters)}
//                   className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm hover:bg-gray-100 transition-colors"
//                 >
//                   <Filter className="h-4 w-4" />
//                   <span className="hidden sm:inline">Filtres</span>
//                   <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
//                 </button>

//                 {showFilters && (
//                   <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-10 p-4">
//                     <div className="space-y-4">
//                       <div>
//                         <label className="block text-xs font-medium text-gray-700 mb-2">Statut</label>
//                         <select
//                           value={filterStatus}
//                           onChange={(e) => setFilterStatus(e.target.value)}
//                           className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
//                         >
//                           <option value="all">Tous les projets</option>
//                           <option value="active">En cours</option>
//                           <option value="pending_payment">En attente de paiement</option>
//                           <option value="completed">Terminés</option>
//                         </select>
//                       </div>
//                       <div>
//                         <label className="block text-xs font-medium text-gray-700 mb-2">Trier par</label>
//                         <select
//                           value={sortBy}
//                           onChange={(e) => setSortBy(e.target.value)}
//                           className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
//                         >
//                           <option value="date_desc">Plus récent d'abord</option>
//                           <option value="date_asc">Plus ancien d'abord</option>
//                           <option value="montant_desc">Montant le plus élevé</option>
//                           <option value="montant_asc">Montant le moins élevé</option>
//                         </select>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Mode vue */}
//               <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-0.5">
//                 <button
//                   onClick={() => setViewMode('list')}
//                   className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-100'}`}
//                   title="Vue liste"
//                 >
//                   <List className="h-4 w-4" />
//                 </button>
//                 <button
//                   onClick={() => setViewMode('grid')}
//                   className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-100'}`}
//                   title="Vue grille"
//                 >
//                   <LayoutGrid className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* LISTE DES PROJETS */}
//         {filteredAndSortedProjects.length === 0 ? (
//           <div className="text-center py-16">
//             <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
//               <FileText className="h-12 w-12 text-gray-400" />
//             </div>
//             <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun projet trouvé</h3>
//             <p className="text-gray-500 mb-6 max-w-md mx-auto">
//               {searchTerm || filterStatus !== 'all' 
//                 ? 'Aucun projet ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
//                 : 'Commencez par créer votre premier projet de financement'}
//             </p>
//             {!searchTerm && filterStatus === 'all' && (
//               <button 
//                 onClick={() => setShowFormulaireFPI(true)}
//                 className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all transform hover:scale-105"
//               >
//                 <Plus className="h-5 w-5" /> Créer un projet FPI
//               </button>
//             )}
//           </div>
//         ) : (
//           <>
//             {viewMode === 'list' ? (
//               <div className="space-y-3">
//                 {filteredAndSortedProjects.map((projet, index) => (
//                   <div
//                     key={`${projet.type_projet}-${projet.id}`}
//                     onClick={() => ouvrirDetail(projet)}
//                     className="group bg-white  border border-gray-200 p-5 hover:border-primary/30  transition-all cursor-pointer transform hover:-translate-y-0.5"
//                   >
//                     <div className="flex items-start gap-4">
//                       {/* Icône statut */}
//                       <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${
//                         projet.decision_finale === 'approuvé' ? 'bg-green-50 border-2 border-green-200' :
//                         projet.decision_finale === 'refusé' ? 'bg-red-50 border-2 border-red-200' :
//                         !projet.frais_dossier_paye ? 'bg-yellow-50 border-2 border-yellow-200' :
//                         'bg-blue-50 border-2 border-blue-200'
//                       }`}>
//                         {projet.decision_finale === 'approuvé' ? <CheckCircle className="h-7 w-7 text-green-600" /> :
//                          projet.decision_finale === 'refusé' ? <XCircle className="h-7 w-7 text-red-600" /> :
//                          !projet.frais_dossier_paye ? <CreditCard className="h-7 w-7 text-yellow-600" /> :
//                          <Folder className="h-6 w-6 text-blue-600" />}
//                       </div>

//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-start justify-between gap-4">
//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-center gap-2 flex-wrap mb-2">
//                               <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">
//                                 {projet.titre}
//                               </h3>
                             
                              
//                               {!projet.frais_dossier_paye && (
//                                 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-200">
//                                   <AlertCircle className="h-3 w-3" />
//                                   Paiement requis
//                                 </span>
//                               )}

//                               {projet.decision_finale && (
//                                 <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                                   projet.decision_finale === 'approuvé' 
//                                     ? 'bg-green-50 text-green-700 border border-green-200' 
//                                     : 'bg-red-50 text-red-700 border border-red-200'
//                                 }`}>
//                                   {projet.decision_finale === 'approuvé' ? 
//                                     <CheckCircle className="h-3 w-3" /> : 
//                                     <XCircle className="h-3 w-3" />
//                                   }
//                                   {projet.decision_finale}
//                                 </span>
//                               )}
//                             </div>

//                             <div className="flex items-center gap-4 text-sm text-gray-600">
//                               <span className="flex items-center gap-1">
//                                 <Calendar className="h-3.5 w-3.5" /> 
//                                 {formatDate(projet.date_soumission)}
//                               </span>
//                               {projet.montant_demande && (
//                                 <span className="flex items-center gap-1 font-semibold text-gray-900">
//                                   <DollarSign className="h-3.5 w-3.5" /> 
//                                   {formatMontant(projet.montant_demande)}
//                                 </span>
//                               )}
//                             </div>
//                           </div>

//                           {/* Actions rapides */}
//                           <div className="flex items-center gap-2 flex-shrink-0">
//                             {peutEtreModifie(projet) && (
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation()
//                                   setProjetAModifier(projet)
//                                   setShowFormulaireModification(true)
//                                 }}
//                                 className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
//                                 title="Modifier"
//                               >
//                                 <Edit3 className="h-4 w-4" />
//                               </button>
//                             )}
                            
//                             {!projet.frais_dossier_paye && (
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation()
//                                   ouvrirPaiement(projet)
//                                 }}
//                                 className="px-4 py-2 bg-yellow-500 text-white text-xs font-semibold rounded-lg hover:bg-yellow-600 transition-all transform hover:scale-105 shadow-md shadow-yellow-200"
//                               >
//                                 <span className="flex items-center gap-1.5">
//                                   <CreditCard className="h-3.5 w-3.5" />
//                                   Payer ${FRAIS_DOSSIER}
//                                 </span>
//                               </button>
//                             )}
//                           </div>
//                         </div>

//                         {/* Barre de progression des étapes */}
//                         <div className="mt-4">
//                           <div className="flex items-center gap-1">
//                             {ETAPES.map((etape, idx) => {
//                               const currentIdx = getEtapeIndex(projet.etape)
//                               const completed = idx < currentIdx
//                               const current = idx === currentIdx
                              
//                               return (
//                                 <div key={etape.key} className="flex items-center flex-1">
//                                   <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
//                                     completed ? 'bg-green-500 text-white' :
//                                     current ? 'bg-primary text-white ring-2 ring-primary/30' :
//                                     'bg-gray-100 text-gray-400'
//                                   }`}>
//                                     {completed ? <Check className="h-3 w-3" /> : idx + 1}
//                                   </div>
//                                   {idx < ETAPES.length - 1 && (
//                                     <div className={`flex-1 h-1 mx-1 rounded-full ${
//                                       idx < currentIdx ? 'bg-green-400' : 'bg-gray-200'
//                                     }`} />
//                                   )}
//                                 </div>
//                               )
//                             })}
//                           </div>
//                           <div className="flex justify-between mt-1 px-1">
//                             {ETAPES.map((etape, idx) => {
//                               const currentIdx = getEtapeIndex(projet.etape)
//                               const completed = idx <= currentIdx
//                               return (
//                                 <span key={etape.key} className={`text-[10px] ${
//                                   completed ? 'text-gray-900 font-medium' : 'text-gray-400'
//                                 }`}>
//                                   {etape.label}
//                                 </span>
//                               )
//                             })}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {filteredAndSortedProjects.map((projet) => (
//                   <div
//                     key={`${projet.type_projet}-${projet.id}`}
//                     onClick={() => ouvrirDetail(projet)}
//                     className="group bg-white  border border-gray-200 p-5 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
//                   >
//                     <div className="flex flex-col h-full">
//                       <div className="flex items-start justify-between mb-4">
//                         <div className={`p-3 rounded-xl ${
//                           projet.decision_finale === 'approuvé' ? 'bg-green-50' :
//                           projet.decision_finale === 'refusé' ? 'bg-red-50' :
//                           !projet.frais_dossier_paye ? 'bg-yellow-50' :
//                           'bg-blue-50'
//                         }`}>
//                           {projet.decision_finale === 'approuvé' ? <CheckCircle className="h-6 w-6 text-green-600" /> :
//                            projet.decision_finale === 'refusé' ? <XCircle className="h-6 w-6 text-red-600" /> :
//                            !projet.frais_dossier_paye ? <CreditCard className="h-6 w-6 text-yellow-600" /> :
//                            <Folder className="h-6 w-6 text-blue-600" />}
//                         </div>
                      
//                       </div>

//                       <h3 className="text-sm flex font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
//                        <div>
                       
//                        {projet.titre}
//                        </div> 
//                       </h3>
//                       <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
//                         <Calendar className="h-4 w-4" />
//                         <span className="text-xs">{formatDate(projet.date_soumission)}</span>
//                       </div>


//                       {projet.montant_demande && (
//                         <div className="flex items-center gap-2 mb-3">
//                           <DollarSign className="h-4 w-4 text-gray-400" />
//                           <span className="text-lg font-bold text-gray-900">
//                             {formatMontant(projet.montant_demande)}
//                           </span>
//                         </div>
//                       )}

//                       <div className="mt-auto">
//                         {!projet.frais_dossier_paye ? (
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation()
//                               ouvrirPaiement(projet)
//                             }}
//                             className="w-full px-4 py-2 bg-yellow-500 text-white text-xs font-semibold rounded-lg hover:bg-yellow-600 transition-all"
//                           >
//                             Payer ${FRAIS_DOSSIER}
//                           </button>
//                         ) : (
//                           <div className="flex items-center gap-2 text-sm">
//                             <div className={`w-2 h-2 rounded-full ${
//                               projet.decision_finale === 'approuvé' ? 'bg-green-500' :
//                               projet.decision_finale === 'refusé' ? 'bg-red-500' :
//                               'bg-blue-500'
//                             }`} />
//                             <span className="text-sm text-gray-600">
//                               {ETAPES.find(e => e.key === projet.etape)?.label || projet.etape}
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </>
//         )}
//       </div>



//       {showFormulaireFPI && (
//   <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
//     <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
//       <FormulaireFPI
//         onClose={() => setShowFormulaireFPI(false)}
//         onSuccess={async (projetData?: any) => {
//           setShowFormulaireFPI(false)
//             await chargerProjets()

    
  
//   setSuccess('✅ Votre demande FPI a été soumise avec succès !')
        
//         }}
//       />
//     </div>
//   </div>
// )}

//       {showFormulaireModification && projetAModifier && (
//         <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
//           <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
//             <FormulaireFPIModification
//               projetId={projetAModifier.id}
//               onClose={() => {
//                 setShowFormulaireModification(false)
//                 setProjetAModifier(null)
//               }}
//               onSuccess={() => {
//                 setShowFormulaireModification(false)
//                 setProjetAModifier(null)
//                 setSuccess('✅ Votre demande a été modifiée avec succès !')
//                 chargerProjets()
//               }}
//             />
//           </div>
//         </div>
//       )}

//       {/* MODAL DÉTAIL PROJET */}
//       {showDetailModal && selectedProjet && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
//           <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
//             {/* Header du détail */}
//             <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <h2 className="text-lg font-bold text-gray-900">{selectedProjet.titre}</h2>
//                     <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
//                       selectedProjet.type_projet === 'fpi' ? 'bg-purple-50 text-purple-700' : 'bg-gray-50 text-gray-600'
//                     }`}>
//                       {selectedProjet.type_projet === 'fpi' ? 'FPI' : 'Standard'}
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
//                     <Calendar className="h-4 w-4" />
//                     <span>{formatDate(selectedProjet.date_soumission)}</span>
//                     {selectedProjet.montant_demande && (
//                       <>
//                         <span>•</span>
//                         <span className="font-semibold">{formatMontant(selectedProjet.montant_demande)}</span>
//                       </>
//                     )}
//                   </div>
//                 </div>
//                 <button 
//                   onClick={() => setShowDetailModal(false)} 
//                   className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
//                 >
//                   <X className="h-5 w-5 text-gray-500" />
//                 </button>
//               </div>

//               {/* Actions rapides dans le détail */}
//               <div className="flex items-center gap-2 mt-4">
//                 {peutEtreModifie(selectedProjet) && (
//                   <button
//                     onClick={() => {
//                       setShowDetailModal(false)
//                       setTimeout(() => {
//                         setProjetAModifier(selectedProjet)
//                         setShowFormulaireModification(true)
//                       }, 200)
//                     }}
//                     className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 text-sm font-medium rounded-xl hover:bg-amber-100 border border-amber-200 transition-colors"
//                   >
//                     <Edit3 className="h-4 w-4" />
//                     Modifier la demande
//                   </button>
//                 )}

//                 {!selectedProjet.frais_dossier_paye && (
//                   <button 
//                     onClick={() => {
//                       setShowDetailModal(false)
//                       setTimeout(() => ouvrirPaiement(selectedProjet), 200)
//                     }}
//                     className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-xl hover:bg-yellow-600 transition-colors"
//                   >
//                     <CreditCard className="h-4 w-4" />
//                     Payer ${FRAIS_DOSSIER}
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* Contenu du détail */}
//             <div className="flex-1 overflow-y-auto p-6 space-y-6">
//               {/* Description */}
//               {selectedProjet.description && (
//                 <div>
//                   <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
//                     <FileText className="h-4 w-4 text-gray-400" />
//                     Description
//                   </h3>
//                   <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 border border-gray-100">
//                     {selectedProjet.description}
//                   </p>
//                 </div>
//               )}

//               {/* Rapport technique */}
//               {selectedProjet.rapport_decision && (
//                 <div className={`rounded-xl p-4 border ${
//                   selectedProjet.rapport_decision === 'favorable' 
//                     ? 'bg-green-50 border-green-200' 
//                     : 'bg-red-50 border-red-200'
//                 }`}>
//                   <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
//                     <Shield className="h-4 w-4" />
//                     Rapport d'analyse technique
//                   </h3>
//                   <div className="flex items-center gap-2 mb-3">
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                       selectedProjet.rapport_decision === 'favorable' 
//                         ? 'bg-green-100 text-green-700' 
//                         : 'bg-red-100 text-red-700'
//                     }`}>
//                       {selectedProjet.rapport_decision === 'favorable' ? 'Favorable' : 'Défavorable'}
//                     </span>
//                     {selectedProjet.rapport_technicien_nom && (
//                       <span className="text-xs text-gray-500">
//                         par {selectedProjet.rapport_technicien_nom}
//                       </span>
//                     )}
//                   </div>
//                   {selectedProjet.rapport_commentaire && (
//                     <p className="text-sm text-gray-700 bg-white/50 rounded-lg p-3">
//                       {selectedProjet.rapport_commentaire}
//                     </p>
//                   )}
//                 </div>
//               )}

//               {/* Documents */}
//               <div>
//                 <div className="flex items-center justify-between mb-3">
//                   <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
//                     <Upload className="h-4 w-4 text-gray-400" />
//                     Documents ({documents.length})
//                   </h3>
                 
//                 </div>

//                 {loadingDocuments ? (
//                   <div className="text-center py-8">
//                     <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
//                     <p className="text-xs text-gray-500 mt-2">Chargement des documents...</p>
//                   </div>
//                 ) : documents.length > 0 ? (
//                   <div className="space-y-2">
//                     {documents.map(doc => (
//                       <div
//                         key={doc.id}
//                         className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:shadow-sm ${
//                           doc.verification_auto 
//                             ? 'bg-green-50 border-green-200' 
//                             : 'bg-green-50 border-green-200'
//                         }`}
//                       >
//                         <div className="flex items-center gap-3">
//                           <div className={`p-1.5 rounded-lg ${
//                             doc.verification_auto ? 'bg-green-100' : 'bg-green-100'
//                           }`}>
//                             {doc.verification_auto ? 
//                               <CheckCircle className="h-4 w-4 text-green-600" /> :
//                               <CheckCircle className="h-4 w-4 text-green-600" />
//                             }
//                           </div>
//                           <div>
//                             <p className="text-sm font-medium text-gray-900">
//                               {doc.type_nom}
//                               {doc.obligatoire && (
//                                 <span className="text-red-500 ml-1" title="Document obligatoire">*</span>
//                               )}
//                             </p>
//                             <p className="text-xs text-gray-500">
//                               {formatDate(doc.date_upload)}
//                               {doc.verification_auto && ' • Vérifié'}
//                             </p>
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-1">
//                           <a
//                             href={doc.chemin_fichier}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
//                             title="Voir le document"
//                           >
//                             <Eye className="h-4 w-4" />
//                           </a>
                       
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
//                     <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
//                     <p className="text-sm text-gray-500">Aucun document ajouté</p>
//                     <label className="cursor-pointer mt-2 inline-block">
//                       <input
//                         type="file"
//                         className="hidden"
//                         onChange={(e) => {
//                           const file = e.target.files?.[0]
//                           if (file && selectedProjet) uploadDocument(0, file)
//                         }}
//                       />
//                       <span className="text-xs text-primary hover:underline font-medium">
//                         Ajouter votre premier document
//                       </span>
//                     </label>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* MODAL PAIEMENT - Interface améliorée */}
//       {showPaiementModal && selectedProjet && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
//           <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
//             {/* Header du paiement */}
//             <div className="px-6 py-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-100 flex items-center justify-between">
//               <div>
//                 <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
//                   <CreditCard className="h-5 w-5 text-yellow-600" />
//                   Paiement des frais
//                 </h2>
//                 <p className="text-xs text-gray-500 mt-0.5">{selectedProjet.titre}</p>
//               </div>
//               <button 
//                 onClick={() => {
//                   if (paiementStep !== 'processing' && paiementStep !== 'success') {
//                     setShowPaiementModal(false)
//                   }
//                 }} 
//                 className="p-2 hover:bg-white/50 rounded-lg transition-colors"
//                 disabled={paiementStep === 'processing'}
//               >
//                 <X className="h-5 w-5 text-gray-500" />
//               </button>
//             </div>

//             <div className="p-6">
//               {paiementStep === 'method' && (
//                 <div className="space-y-6">
//                   {/* Résumé du paiement */}
//                   <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
//                     <div className="flex justify-between items-center mb-4">
//                       <span className="text-sm text-gray-600">Montant à payer</span>
//                       <span className="text-3xl font-bold text-gray-900">
//                         {formatMontant(FRAIS_DOSSIER)}
//                       </span>
//                     </div>
//                     <div className="flex justify-between items-center text-sm">
//                       <span className="text-gray-600">Référence</span>
//                       <span className="font-mono text-xs bg-gray-100 px-3 py-1 rounded-lg">
//                         {referencePaiement}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Choix méthode */}
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-4">
//                       Méthode de paiement
//                     </label>
//                     <div className="space-y-3">
//                       {/* Mobile Money */}
//                       <button
//                         onClick={() => setMethodePaiement('mobile_money')}
//                         className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
//                           methodePaiement === 'mobile_money' 
//                             ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
//                             : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                         }`}
//                       >
//                         <div className="flex items-center gap-4">
//                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
//                             methodePaiement === 'mobile_money' ? 'bg-primary/10' : 'bg-gray-100'
//                           }`}>
//                             <Smartphone className={`h-6 w-6 ${
//                               methodePaiement === 'mobile_money' ? 'text-primary' : 'text-gray-400'
//                             }`} />
//                           </div>
//                           <div className="flex-1">
//                             <p className="text-sm font-semibold">Mobile Money</p>
//                             <p className="text-xs text-gray-500">Orange, MTN, Airtel</p>
//                           </div>
//                           {methodePaiement === 'mobile_money' && (
//                             <CheckCircle className="h-5 w-5 text-primary" />
//                           )}
//                         </div>
//                       </button>

//                       {/* Carte bancaire */}
//                       <button
//                         onClick={() => setMethodePaiement('carte')}
//                         className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
//                           methodePaiement === 'carte' 
//                             ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
//                             : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                         }`}
//                       >
//                         <div className="flex items-center gap-4">
//                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
//                             methodePaiement === 'carte' ? 'bg-primary/10' : 'bg-gray-100'
//                           }`}>
//                             <CreditCard className={`h-6 w-6 ${
//                               methodePaiement === 'carte' ? 'text-primary' : 'text-gray-400'
//                             }`} />
//                           </div>
//                           <div className="flex-1">
//                             <p className="text-sm font-semibold">Carte Bancaire</p>
//                             <p className="text-xs text-gray-500">Visa, Mastercard</p>
//                           </div>
//                           {methodePaiement === 'carte' && (
//                             <CheckCircle className="h-5 w-5 text-primary" />
//                           )}
//                         </div>
//                       </button>

//                       {/* Virement */}
//                       <button
//                         onClick={() => setMethodePaiement('virement')}
//                         className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
//                           methodePaiement === 'virement' 
//                             ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
//                             : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                         }`}
//                       >
//                         <div className="flex items-center gap-4">
//                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
//                             methodePaiement === 'virement' ? 'bg-primary/10' : 'bg-gray-100'
//                           }`}>
//                             <Building2 className={`h-6 w-6 ${
//                               methodePaiement === 'virement' ? 'text-primary' : 'text-gray-400'
//                             }`} />
//                           </div>
//                           <div className="flex-1">
//                             <p className="text-sm font-semibold">Virement Bancaire</p>
//                             <p className="text-xs text-gray-500">Toutes les banques</p>
//                           </div>
//                           {methodePaiement === 'virement' && (
//                             <CheckCircle className="h-5 w-5 text-primary" />
//                           )}
//                         </div>
//                       </button>
//                     </div>
//                   </div>

//                   {paiementError && (
//                     <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
//                       <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
//                       <p className="text-sm text-red-700">{paiementError}</p>
//                     </div>
//                   )}

//                   <button
//                     onClick={() => setPaiementStep('details')}
//                     className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all transform hover:scale-[1.02] active:scale-100 shadow-lg shadow-primary/25"
//                   >
//                     Continuer vers le paiement
//                   </button>
//                 </div>
//               )}

//               {paiementStep === 'details' && (
//                 <div className="space-y-6">
//                   {/* Détails spécifiques selon la méthode */}
//                   <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
//                     <div className="text-center mb-6">
//                       <p className="text-sm text-gray-600 mb-1">Montant à payer</p>
//                       <p className="text-4xl font-bold text-gray-900">{formatMontant(FRAIS_DOSSIER)}</p>
//                       <p className="text-xs text-gray-500 mt-2">Réf: {referencePaiement}</p>
//                     </div>

//                     {methodePaiement === 'mobile_money' && (
//                       <div className="space-y-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-3">
//                             Choisissez votre opérateur
//                           </label>
//                           <div className="grid grid-cols-3 gap-3">
//                             {operateurs.map(op => (
//                               <button
//                                 key={op.id}
//                                 onClick={() => setOperateurMobile(op.id as typeof operateurMobile)}
//                                 className={`p-4 rounded-xl border-2 text-center transition-all ${
//                                   operateurMobile === op.id
//                                     ? 'border-primary bg-primary/5 shadow-sm'
//                                     : 'border-gray-200 hover:border-gray-300'
//                                 }`}
//                               >
//                                 <div className={`w-12 h-12 rounded-full ${op.couleur} mx-auto mb-2 flex items-center justify-center shadow-lg`}>
//                                   <Smartphone className="h-6 w-6 text-white" />
//                                 </div>
//                                 <p className="text-xs font-semibold">{op.nom}</p>
//                                 <p className="text-xs text-gray-500">{op.code}</p>
//                               </button>
//                             ))}
//                           </div>
//                         </div>

//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-2">
//                             Numéro de téléphone
//                           </label>
//                           <div className="relative">
//                             <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                             <input
//                               type="tel"
//                               value={numeroMobile}
//                               onChange={(e) => setNumeroMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
//                               placeholder="Ex: 0812345678"
//                               className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {methodePaiement === 'carte' && (
//                       <div className="space-y-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-2">
//                             Numéro de carte
//                           </label>
//                           <div className="relative">
//                             <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                             <input
//                               type="text"
//                               value={numeroCarte}
//                               onChange={(e) => setNumeroCarte(formatCardNumber(e.target.value).slice(0, 19))}
//                               placeholder="1234 5678 9012 3456"
//                               className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//                             />
//                           </div>
//                         </div>
//                         <div className="grid grid-cols-2 gap-4">
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                               Date d'expiration
//                             </label>
//                             <input
//                               type="text"
//                               value={dateExpiration}
//                               onChange={(e) => {
//                                 let val = e.target.value.replace(/\D/g, '')
//                                 if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2, 4)
//                                 setDateExpiration(val.slice(0, 5))
//                               }}
//                               placeholder="MM/AA"
//                               className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//                             />
//                           </div>
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                               Code de sécurité
//                             </label>
//                             <input
//                               type="text"
//                               value={cvv}
//                               onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
//                               placeholder="CVV"
//                               className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {methodePaiement === 'virement' && (
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-3">
//                           Sélectionnez votre banque
//                         </label>
//                         <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
//                           {banques.map(banque => (
//                             <button
//                               key={banque}
//                               onClick={() => setNomBanque(banque)}
//                               className={`p-3 rounded-xl border text-left text-sm transition-all ${
//                                 nomBanque === banque
//                                   ? 'border-primary bg-primary/5 font-medium'
//                                   : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                               }`}
//                             >
//                               <Building2 className="h-4 w-4 inline mr-2 text-gray-400" />
//                               {banque}
//                             </button>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {paiementError && (
//                     <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
//                       <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
//                       <p className="text-sm text-red-700">{paiementError}</p>
//                     </div>
//                   )}

//                   <div className="flex gap-3">
//                     <button
//                       onClick={() => {
//                         setPaiementStep('method')
//                         setPaiementError('')
//                       }}
//                       className="flex-1 py-3 border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all"
//                     >
//                       ← Retour
//                     </button>
//                     <button
//                       onClick={demarrerPaiement}
//                       className="flex-1 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all transform hover:scale-[1.02] active:scale-100 shadow-lg shadow-primary/25"
//                     >
//                       Payer {formatMontant(FRAIS_DOSSIER)}
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* États processing, confirmation et success restent similaires mais avec le nouveau style */}
//               {paiementStep === 'processing' && (
//                 <div className="space-y-6 py-8">
//                   <div className="text-center">
//                     <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center mx-auto mb-6 animate-pulse">
//                       <Loader2 className="h-12 w-12 text-primary animate-spin" />
//                     </div>
//                     <h3 className="text-xl font-bold text-gray-900 mb-2">Paiement en cours</h3>
//                     <p className="text-sm text-gray-600 mb-6">
//                       {methodePaiement === 'mobile_money' 
//                         ? `Confirmez le paiement sur votre téléphone ${numeroMobile}`
//                         : 'Vérification de vos informations bancaires...'}
//                     </p>

//                     <div className="max-w-xs mx-auto">
//                       <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
//                         <div 
//                           className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500 ease-out"
//                           style={{ width: `${progressPaiement}%` }}
//                         />
//                       </div>
//                       <p className="text-sm text-gray-500 font-medium">{Math.round(progressPaiement)}%</p>
//                     </div>
//                   </div>

//                   <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
//                     <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
//                     <div>
//                       <p className="text-sm font-medium text-blue-700">Paiement sécurisé</p>
//                       <p className="text-xs text-blue-600 mt-1">
//                         Vos informations sont cryptées et protégées
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {paiementStep === 'confirmation' && (
//                 <div className="space-y-6 py-8">
//                   <div className="text-center">
//                     <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
//                       <QrCode className="h-10 w-10 text-primary" />
//                     </div>
//                     <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmation requise</h3>
//                     <p className="text-sm text-gray-600">
//                       Entrez le code de validation reçu
//                     </p>
//                   </div>

//                   {showOTP && (
//                     <div className="space-y-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-3">
//                           Code de validation
//                         </label>
//                         <input
//                           type="text"
//                           value={otpCode}
//                           onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
//                           placeholder="000000"
//                           maxLength={6}
//                           className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl text-center text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//                         />
//                         <div className="flex items-center justify-between mt-3">
//                           <p className="text-sm text-gray-500">
//                             Expire dans {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
//                           </p>
//                           <button
//                             onClick={() => {
//                               setCountdown(120)
//                               setPaiementError('')
//                             }}
//                             disabled={countdown > 0}
//                             className="text-sm text-primary hover:underline disabled:text-gray-400 disabled:no-underline font-medium"
//                           >
//                             Renvoyer le code
//                           </button>
//                         </div>
//                       </div>

//                       {paiementError && (
//                         <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
//                           <AlertCircle className="h-5 w-5 text-red-500" />
//                           <p className="text-sm text-red-700">{paiementError}</p>
//                         </div>
//                       )}

//                       <button
//                         onClick={validerOTP}
//                         disabled={paiementLoading}
//                         className="w-full py-3.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-200"
//                       >
//                         {paiementLoading ? (
//                           <>
//                             <Loader2 className="h-5 w-5 animate-spin" />
//                             Validation en cours...
//                           </>
//                         ) : (
//                           <>
//                             <Shield className="h-5 w-5" />
//                             Valider le paiement
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {paiementStep === 'success' && (
//                 <div className="text-center py-8">
//                   <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mx-auto mb-6 animate-bounce">
//                     <CheckCircle className="h-12 w-12 text-green-600" />
//                   </div>
//                   <h3 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi !</h3>
//                   <p className="text-gray-600 mb-6">
//                     Votre paiement de {formatMontant(FRAIS_DOSSIER)} a été effectué avec succès
//                   </p>
//                   <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 inline-block">
//                     <p className="text-xs text-gray-500 mb-1">Référence de transaction</p>
//                     <p className="text-lg font-mono font-bold text-gray-900">{referencePaiement}</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       <style jsx>{`
//         @keyframes slideIn {
//           from { transform: translateX(100%); opacity: 0; }
//           to { transform: translateX(0); opacity: 1; }
//         }
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
//         .animate-slide-in {
//           animation: slideIn 0.3s ease-out;
//         }
//         .animate-fade-in {
//           animation: fadeIn 0.2s ease-out;
//         }
//         @keyframes bounce {
//           0%, 100% { transform: translateY(0); }
//           50% { transform: translateY(-10px); }
//         }
//         .animate-bounce {
//           animation: bounce 1s infinite;
//         }
//         .line-clamp-2 {
//           display: -webkit-box;
//           -webkit-line-clamp: 2;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
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
  Plus, FileText, Clock, CheckCircle, XCircle, AlertCircle, 
  Loader2, Eye, Upload, X, Trash2,
  DollarSign, CreditCard, FileCheck, Calendar, 
  Shield, Ban, Check, Smartphone, Building2, QrCode,
  Wifi, Bell, BellRing, Edit3, Search, Filter, ChevronDown,
  ArrowUpDown, MoreHorizontal, Download, ExternalLink,
  LayoutGrid, List, SlidersHorizontal, ChevronRight,
  Mail, Phone, MapPin, Briefcase, Users, TrendingUp,
  PieChart, BarChart3, Activity, Target,
  Folder
} from 'lucide-react'
import FormulaireFPI from '@/components/fpi/FormulaireFPI'
import FormulaireFPIModification from '@/components/fpi/FormulaireFPIModification'

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
  type_projet: 'fpi' | 'standard'
}

type TypeDocument = {
  id: number
  nom: string
  description: string
  obligatoire: boolean
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

const ETAPES = [
  { key: 'soumission', label: 'Soumission', icon: FileText, desc: 'En attente' },
  { key: 'analyse_tech', label: 'Analyse Tech', icon: Shield, desc: 'Analyse technique' },
  { key: 'comité_crédit', label: 'Comité', icon: CreditCard, desc: 'Comité de crédit' },
  { key: 'financement_approuve', label: 'Decision', icon: CheckCircle, desc: 'Financement accordé' },
  { key: 'financement_rejete', label: '', icon: XCircle, desc: 'Financement refusé' }
]

const FRAIS_DOSSIER = 500

export default function PromoteurProjetsPage() {
  const { user } = useAuth()
  const { isSubscribed, isSupported, toggle } = usePushNotifications()
  
  // États principaux
  const [projets, setProjets] = useState<Projet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // États UI
  const [showFormulaireFPI, setShowFormulaireFPI] = useState(false)
  const [showFormulaireModification, setShowFormulaireModification] = useState(false)
  const [projetAModifier, setProjetAModifier] = useState<Projet | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showPaiementModal, setShowPaiementModal] = useState(false)
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null)
  const [documents, setDocuments] = useState<DocumentUpload[]>([])
  const [typesDocuments, setTypesDocuments] = useState<TypeDocument[]>([])
  
  // États de filtrage et recherche
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date_desc')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  
  // États de paiement
  const [paiementStep, setPaiementStep] = useState<'method' | 'details' | 'processing' | 'confirmation' | 'success'>('method')
  const [paiementLoading, setPaiementLoading] = useState(false)
  const [referencePaiement, setReferencePaiement] = useState('')
  const [methodePaiement, setMethodePaiement] = useState<'mobile_money' | 'carte' | 'virement'>('mobile_money')
  const [operateurMobile, setOperateurMobile] = useState<'orange' | 'mtn' | 'airtel'>('orange')
  const [numeroMobile, setNumeroMobile] = useState('')
  const [numeroCarte, setNumeroCarte] = useState('')
  const [dateExpiration, setDateExpiration] = useState('')
  const [cvv, setCvv] = useState('')
  const [nomBanque, setNomBanque] = useState('')
  const [progressPaiement, setProgressPaiement] = useState(0)
  const [showOTP, setShowOTP] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [paiementError, setPaiementError] = useState('')
  const [countdown, setCountdown] = useState(0)
  
  // États de documents
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null)
  const [uploadingDocId, setUploadingDocId] = useState<number | null>(null)

  // États de notification
  const [sendingNotification, setSendingNotification] = useState(false)
  const [showNotificationBanner, setShowNotificationBanner] = useState(false)

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    enCours: 0,
    enAttentePaiement: 0,
    approuves: 0,
    refuses: 0,
    montantTotal: 0
  })

  const getUserId = (): number => {
    if (!user?.id) return 0
    const uid = typeof user.id === 'string' ? parseInt(user.id) : user.id
    return isNaN(uid) ? 0 : uid
  }

  // Fonctions helper pour déterminer le statut
  const isApprouve = (projet: Projet) => projet.etape === 'financement_approuve'
  const isRefuse = (projet: Projet) => projet.etape === 'financement_rejete'
  const isTermine = (projet: Projet) => isApprouve(projet) || isRefuse(projet)

  



  // Remplacer le useEffect des stats par ceci :

// Calculer les statistiques
useEffect(() => {
  if (projets.length > 0) {
    const statsData = {
      total: projets.length,
      enCours: projets.filter(p => !isTermine(p) && p.frais_dossier_paye).length,
      enAttentePaiement: projets.filter(p => !p.frais_dossier_paye && !isTermine(p)).length,
      approuves: projets.filter(p => isApprouve(p)).length,
      refuses: projets.filter(p => isRefuse(p)).length,
      montantTotal: projets.reduce((sum, p) => sum + (p.montant_demande || 0), 0)
    }
    setStats(statsData)
  } else {
    // Réinitialiser les stats quand il n'y a pas de projets
    setStats({
      total: 0,
      enCours: 0,
      enAttentePaiement: 0,
      approuves: 0,
      refuses: 0,
      montantTotal: 0
    })
  }
}, [projets])



  // Filtrer et trier les projets
  const filteredAndSortedProjects = projets
    .filter(projet => {
      if (searchTerm && !projet.titre.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      switch (filterStatus) {
        case 'active':
          return !isTermine(projet) && projet.frais_dossier_paye
        case 'pending_payment':
          return !projet.frais_dossier_paye
        case 'completed':
          return isTermine(projet)
        default:
          return true
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.date_soumission).getTime() - new Date(b.date_soumission).getTime()
        case 'montant_desc':
          return (b.montant_demande || 0) - (a.montant_demande || 0)
        case 'montant_asc':
          return (a.montant_demande || 0) - (b.montant_demande || 0)
        default:
          return new Date(b.date_soumission).getTime() - new Date(a.date_soumission).getTime()
      }
    })

  const envoyerNotification = async (
    titre: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' | 'paiement' | 'document' | 'validation' | 'decision' = 'info',
    projetId?: number,
    url?: string,
    icone?: string
  ) => {
    if (!user?.id) return false

    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: type,
          titre: titre,
          message: message,
          lien: url || null,
          projet_id: projetId || null,
          document_id: null,
          rapport_id: null,
          icone: icone || 'Bell',
          est_lue: false
        })

      if (error) return false
      return true
    } catch (error) {
      return false
    }
  }

  const envoyerNotificationPush = async (
    titre: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' | 'paiement' | 'document' | 'validation' | 'decision' = 'info',
    projetId?: number,
    url?: string,
    icone?: string
  ) => {
    const saved = await envoyerNotification(titre, message, type, projetId, url, icone)
    
    if (isSubscribed && user?.id) {
      try {
        await fetch('/api/push/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id.toString()
          },
          body: JSON.stringify({
            userId: user.id,
            notification: {
              title: titre,
              body: message,
              url: url || '/dashboard/promoteur',
              type: type,
              projetId: projetId,
              requireInteraction: type === 'paiement' || type === 'error',
              vibrate: [200, 100, 200]
            }
          })
        })
      } catch (error) {
        console.log('Push non envoyé')
      }
    }
    
    return saved
  }

  const activerNotifications = async () => {
    try {
      await toggle()
      setShowNotificationBanner(false)
      
      setTimeout(() => {
        envoyerNotificationPush(
          '🔔 Notifications activées',
          'Vous recevrez désormais des alertes pour vos projets, paiements et décisions.',
          'success'
        )
      }, 1000)
    } catch (error) {
      console.error('Erreur activation notifications:', error)
    }
  }

  useEffect(() => {
    if (user) {
      chargerProjets()
      chargerTypesDocuments()
    }
  }, [user])

  useEffect(() => {
    if (isSupported && !isSubscribed && user) {
      const timer = setTimeout(() => {
        setShowNotificationBanner(true)
      }, 3000)
      return () => clearTimeout(timer)
    } else {
      setShowNotificationBanner(false)
    }
  }, [isSupported, isSubscribed, user])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (paiementStep === 'processing' && progressPaiement < 100) {
      timer = setInterval(() => {
        setProgressPaiement(prev => {
          const newProgress = prev + Math.random() * 15
          if (newProgress >= 100) {
            clearInterval(timer)
            setTimeout(() => {
              setPaiementStep('confirmation')
              setShowOTP(true)
              setCountdown(120)
            }, 500)
            return 100
          }
          return newProgress
        })
      }, 800)
    }
    return () => clearInterval(timer)
  }, [paiementStep, progressPaiement])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0 && showOTP) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setPaiementError('Code expiré. Veuillez réessayer.')
            setShowOTP(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [countdown, showOTP])

  const chargerProjets = async () => {
    try {
      setLoading(true)
      const uid = getUserId()
      
      if (!uid) {
        setProjets([])
        return
      }

      const { data: projetsFPI } = await supabase
        .from('vue_projets_fpi_details')
        .select('*')
        .eq('promoteur_id', uid)
        .order('created_at', { ascending: false })

      const { data: anciensProjets } = await supabase
        .from('projets')
        .select('*')
        .eq('promoteur_id', uid)
        .order('date_soumission', { ascending: false })

      const projetsFPIMapped: Projet[] = (projetsFPI || []).map((item: any) => ({
        id: item.id,
        titre: item.nom_projet || 'Projet FPI',
        description: item.description_projet,
        montant_demande: item.montant_sollicite,
        etape: item.etape || 'soumission',
        decision_finale: item.etape === 'financement_approuve' ? 'approuvé' : 
                         item.etape === 'financement_rejete' ? 'refusé' : null,
        date_soumission: item.created_at,
        promoteur_id: item.promoteur_id,
        promoteur_nom: item.promoteur_nom_complet,
        promoteur_email: item.promoteur_email,
        nombre_documents: item.nombre_documents || 0,
        documents_valides: item.documents_valides || 0,
        docs_obligatoires_total: 5,
        docs_obligatoires_valides: item.documents_valides || 0,
        frais_dossier_paye: item.frais_paye === true || item.est_paye === true || false,
        frais_montant: item.frais_montant || FRAIS_DOSSIER,
        frais_date_paiement: item.frais_date_paiement || null,
        frais_reference: item.frais_reference || null,
        rapport_decision: null,
        rapport_commentaire: item.commentaire_decision || null,
        rapport_date: null,
        rapport_technicien_nom: null,
        type_projet: 'fpi' as const
      }))

      const anciensProjetsMapped: Projet[] = (anciensProjets || []).map((item: any) => ({
        id: item.id,
        titre: item.titre,
        description: item.description,
        montant_demande: item.montant_demande,
        etape: item.etape,
        decision_finale: item.decision_finale,
        date_soumission: item.date_soumission,
        promoteur_id: item.promoteur_id,
        promoteur_nom: '',
        promoteur_email: null,
        nombre_documents: 0,
        documents_valides: 0,
        docs_obligatoires_total: 0,
        docs_obligatoires_valides: 0,
        frais_dossier_paye: item.frais_paye === true || false,
        frais_montant: FRAIS_DOSSIER,
        frais_date_paiement: null,
        frais_reference: null,
        rapport_decision: null,
        rapport_commentaire: null,
        rapport_date: null,
        rapport_technicien_nom: null,
        type_projet: 'standard' as const
      }))

      const tousLesProjets = [...projetsFPIMapped, ...anciensProjetsMapped]
        .sort((a, b) => new Date(b.date_soumission).getTime() - new Date(a.date_soumission).getTime())

      setProjets(tousLesProjets)
    } catch (error) {
      console.error('Erreur chargement projets:', error)
      setProjets([])
    } finally {
      setLoading(false)
    }
  }

  const peutEtreModifie = (projet: Projet): boolean => {
    if (projet.type_projet !== 'fpi') return false
    const etapesModifiables = ['creation', 'reçu', 'soumission']
    return etapesModifiables.includes(projet.etape) && !projet.frais_dossier_paye
  }

  const chargerDocuments = async (projetId: number) => {
    setLoadingDocuments(true)
    
    const { data: docsFPI } = await supabase
      .from('documents_fpi')
      .select('*')
      .eq('projet_id', projetId)
      .order('created_at', { ascending: false })

    if (docsFPI && docsFPI.length > 0) {
      setDocuments(docsFPI.map((d: any) => ({
        id: d.id,
        type_document_id: d.id,
        type_nom: d.type_document.replace(/_/g, ' ').toUpperCase(),
        chemin_fichier: d.chemin_fichier,
        verification_auto: d.verification_auto,
        date_upload: d.created_at,
        obligatoire: true
      })))
    } else {
      const { data: docsStandard } = await supabase
        .from('documents')
        .select(`id, type_document_id, chemin_fichier, verification_auto, date_upload, type_document (nom, description, obligatoire)`)
        .eq('projet_id', projetId)
        .order('date_upload', { ascending: false })

      if (docsStandard) {
        setDocuments(docsStandard.map((d: any) => ({
          id: d.id,
          type_document_id: d.type_document_id,
          type_nom: d.type_document?.nom || 'Document',
          chemin_fichier: d.chemin_fichier,
          verification_auto: d.verification_auto,
          date_upload: d.date_upload,
          obligatoire: d.type_document?.obligatoire || false
        })))
      } else {
        setDocuments([])
      }
    }
    
    setLoadingDocuments(false)
  }

  const chargerTypesDocuments = async () => {
    const { data } = await supabase
      .from('type_document')
      .select('*')
      .order('obligatoire', { ascending: false })
    if (data) setTypesDocuments(data)
  }

  const ouvrirPaiement = (projet: Projet) => {
    setSelectedProjet(projet)
    setReferencePaiement(`FPI-${Date.now().toString(36).toUpperCase()}`)
    setPaiementStep('method')
    setMethodePaiement('mobile_money')
    setNumeroMobile('')
    setNumeroCarte('')
    setDateExpiration('')
    setCvv('')
    setNomBanque('')
    setProgressPaiement(0)
    setShowOTP(false)
    setOtpCode('')
    setPaiementError('')
    setCountdown(0)
    setShowPaiementModal(true)
  }

  const demarrerPaiement = () => {
    if (methodePaiement === 'mobile_money' && !numeroMobile) {
      setPaiementError('Veuillez entrer un numéro de téléphone')
      return
    }
    if (methodePaiement === 'carte' && (!numeroCarte || !dateExpiration || !cvv)) {
      setPaiementError('Veuillez remplir tous les champs de la carte')
      return
    }
    if (methodePaiement === 'virement' && !nomBanque) {
      setPaiementError('Veuillez sélectionner une banque')
      return
    }
    
    setPaiementError('')
    setPaiementStep('processing')
    setProgressPaiement(0)
    
    envoyerNotificationPush(
      '💳 Paiement en cours',
      `Traitement de votre paiement de $${FRAIS_DOSSIER} pour "${selectedProjet?.titre}"`,
      'paiement',
      selectedProjet?.id
    )
  }

  const validerOTP = async () => {
    if (otpCode.length !== 6) {
      setPaiementError('Code invalide. Veuillez entrer les 6 chiffres.')
      return
    }
    
    setPaiementLoading(true)
    setPaiementError('')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    try {
      if (!selectedProjet) throw new Error('Aucun projet sélectionné')

      const paiementData = {
        est_paye: true,
        reference_paiement: referencePaiement,
        date_paiement: new Date().toISOString(),
        methode_paiement: methodePaiement,
        operateur: methodePaiement === 'mobile_money' ? operateurMobile : null,
        numero: numeroMobile || numeroCarte || null
      }

      const { data: existingFPI } = await supabase
        .from('frais_dossier_fpi')
        .select('id')
        .eq('projet_id', selectedProjet.id)
        .maybeSingle()

      if (existingFPI) {
        await supabase
          .from('frais_dossier_fpi')
          .update(paiementData)
          .eq('id', existingFPI.id)

        await supabase
          .from('projets_fpi')
          .update({ frais_paye: true, statut: 'soumis' })
          .eq('id', selectedProjet.id)
      } else {
        const { data: existing } = await supabase
          .from('frais_dossier')
          .select('id')
          .eq('projet_id', selectedProjet.id)
          .maybeSingle()

        if (existing) {
          await supabase
            .from('frais_dossier')
            .update(paiementData)
            .eq('id', existing.id)
        } else {
          await supabase
            .from('frais_dossier')
            .insert({
              projet_id: selectedProjet.id,
              montant: FRAIS_DOSSIER,
              ...paiementData
            })
        }

        await supabase
          .from('projets')
          .update({ frais_paye: true })
          .eq('id', selectedProjet.id)
      }

      setPaiementStep('success')
      await chargerProjets()
      
      envoyerNotificationPush(
        '✅ Paiement confirmé !',
        `Votre paiement de $${FRAIS_DOSSIER} USD pour "${selectedProjet.titre}" a été effectué avec succès. Réf: ${referencePaiement}`,
        'paiement',
        selectedProjet.id,
        '/dashboard/promoteur',
        'CheckCircle'
      )
      
      setTimeout(() => {
        setShowPaiementModal(false)
        setSuccess('✅ Paiement effectué avec succès ! Votre dossier va être traité.')
      }, 2500)
      
    } catch (error: any) {
      console.error('❌ Erreur paiement:', error)
      setPaiementError(error.message || 'Erreur lors du paiement')
      setPaiementStep('method')
    } finally {
      setPaiementLoading(false)
    }
  }

  const uploadDocument = async (typeId: number, file: File) => {
    if (!selectedProjet) return
    
    setUploadingDocId(typeId)
    setError('')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${selectedProjet.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`

      let bucketName = 'documents_fpi'
      let tableName = 'documents_fpi'
      let uploadSuccess = false

      try {
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file)

        if (!uploadError) {
          uploadSuccess = true
        }
      } catch {
        // Le bucket n'existe peut-être pas
      }

      if (!uploadSuccess) {
        bucketName = 'documents'
        tableName = 'documents'
        
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file)

        if (uploadError) throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName)

      if (tableName === 'documents_fpi') {
        await supabase.from(tableName).insert({
          projet_id: selectedProjet.id,
          type_document: 'document_complementaire',
          chemin_fichier: publicUrl,
          nom_fichier: file.name
        })
      } else {
        await supabase.from(tableName).insert({
          projet_id: selectedProjet.id,
          type_document_id: typeId,
          chemin_fichier: publicUrl
        })
      }

      await chargerDocuments(selectedProjet.id)
      await chargerProjets()
      setSuccess('Document ajouté avec succès')
      
      envoyerNotificationPush(
        '📄 Document ajouté',
        `Nouveau document pour le projet "${selectedProjet.titre}"`,
        'document',
        selectedProjet.id
      )
    } catch (error) {
      setError('Erreur lors de l\'upload')
    } finally {
      setUploadingDocId(null)
    }
  }

  const supprimerDocument = async (docId: number) => {
    if (!window.confirm('Supprimer ce document ?')) return
    
    setDeletingDocId(docId)
    try {
      await supabase.from('documents_fpi').delete().eq('id', docId)
      await supabase.from('documents').delete().eq('id', docId)
      
      if (selectedProjet) {
        await chargerDocuments(selectedProjet.id)
        await chargerProjets()
      }
      setSuccess('Document supprimé')
    } catch (error) {
      setError('Erreur lors de la suppression')
    } finally {
      setDeletingDocId(null)
    }
  }

  const ouvrirDetail = async (projet: Projet) => {
    setSelectedProjet(projet)
    setShowDetailModal(true)
    await chargerDocuments(projet.id)
  }

  const formatMontant = (m: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(m)
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
  
  const getEtapeIndex = (etape: string) => {
    // Pour les étapes finales, retourner l'index approprié
    if (etape === 'financement_approuve') return 3  // Index de 'Approuvé'
    if (etape === 'financement_rejete') return 4     // Index de 'Refusé'
    const index = ETAPES.findIndex(e => e.key === etape)
    return Math.max(0, index)
  }

  const getEtapeLabel = (etape: string) => {
    switch (etape) {
      case 'financement_approuve': return 'Approuvé'
      case 'financement_rejete': return 'Refusé'
      default: return ETAPES.find(e => e.key === etape)?.label || etape
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const parts = []
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.substring(i, i + 4))
    }
    return parts.slice(0, 4).join(' ')
  }

  const operateurs = [
    { id: 'orange', nom: 'Orange Money', couleur: 'bg-orange-500', code: 'OM' },
    { id: 'mtn', nom: 'MTN Mobile Money', couleur: 'bg-yellow-500', code: 'MoMo' },
    { id: 'airtel', nom: 'Airtel Money', couleur: 'bg-red-500', code: 'AM' }
  ]

  const banques = [
    'Rawbank', 'BCDC', 'TMB', 'Equity BCDC', 'Afriland', 
    'Sofibanque', 'FBN Bank', 'Access Bank', 'UBA', 'Standard Bank'
  ]

  const getStatusColor = (projet: Projet) => {
    if (isApprouve(projet)) return 'green'
    if (isRefuse(projet)) return 'red'
    if (!projet.frais_dossier_paye) return 'yellow'
    return 'blue'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="h-8 w-8 text-primary/50" />
            </div>
          </div>
          <h3 className="mt-6 text-lg font-semibold text-gray-900">Chargement de vos projets</h3>
          <p className="mt-2 text-sm text-gray-500">Préparation de votre espace de travail...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* BANNIÈRE NOTIFICATIONS */}
      {showNotificationBanner && isSupported && !isSubscribed && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <BellRing className="h-5 w-5 animate-bounce" />
                </div>
                <div>
                  <p className="text-sm font-medium">Restez informé en temps réel</p>
                  <p className="text-xs text-blue-100">Activez les notifications pour suivre vos projets</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={activerNotifications}
                  className="px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105"
                >
                  Activer maintenant
                </button>
                <button
                  onClick={() => setShowNotificationBanner(false)}
                  className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Toast */}
      {(success || error) && (
        <div className="fixed top-4 right-4 z-50 max-w-sm animate-slide-in">
          <div className={`rounded-2xl shadow-2xl p-4 flex items-start gap-3 backdrop-blur-sm ${
            success ? 'bg-green-50/95 border border-green-200' : 'bg-red-50/95 border border-red-200'
          }`}>
            {success ? <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" /> : 
                       <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />}
            <div className="flex-1">
              <p className="text-sm font-semibold">{success ? 'Succès' : 'Erreur'}</p>
              <p className="text-xs text-gray-600 mt-0.5">{success || error}</p>
            </div>
            <button onClick={() => { setSuccess(''); setError('') }} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Gérez vos projets de financement</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {isSupported && (
                  <button
                    onClick={activerNotifications}
                    disabled={sendingNotification}
                    className={`p-2.5 rounded-xl transition-all ${
                      isSubscribed 
                        ? 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                    title={isSubscribed ? 'Notifications activées' : 'Activer les notifications'}
                  >
                    {sendingNotification ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isSubscribed ? (
                      <BellRing className="h-5 w-5" />
                    ) : (
                      <Bell className="h-5 w-5" />
                    )}
                  </button>
                )}
                
                <button 
                  onClick={() => setShowFormulaireFPI(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all transform hover:scale-105 active:scale-95"
                >
                  <Plus className="h-4 w-4" /> 
                  <span className="hidden sm:inline">Nouvelle demande</span>
                  <span className="sm:hidden">Nouveau</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-6">
              <div className="rounded-lg p-3 border border-gray-200">
                <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="rounded-lg p-3 border border-gray-200">
                <p className="text-xl font-semibold text-gray-900">{stats.enCours}</p>
                <p className="text-xs text-gray-500">En cours</p>
              </div>
              <div className="rounded-lg p-3 border border-gray-200">
                <p className="text-xl font-semibold text-gray-900">{stats.approuves}</p>
                <p className="text-xs text-gray-500">Approuvés</p>
              </div>
              <div className="rounded-lg p-3 border border-gray-200">
                <p className="text-xl font-semibold text-gray-900">{stats.refuses}</p>
                <p className="text-xs text-gray-500">Refusés</p>
              </div>
              <div className="rounded-lg p-3 border border-gray-200">
                <p className="text-base font-semibold text-gray-900 truncate">{formatMontant(stats.montantTotal)}</p>
                <p className="text-xs text-gray-500">Montant</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* BARRE D'OUTILS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm hover:bg-gray-100 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filtres</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                {showFilters && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-10 p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Statut</label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value="all">Tous les projets</option>
                          <option value="active">En cours</option>
                          <option value="pending_payment">En attente de paiement</option>
                          <option value="completed">Terminés</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Trier par</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value="date_desc">Plus récent d'abord</option>
                          <option value="date_asc">Plus ancien d'abord</option>
                          <option value="montant_desc">Montant le plus élevé</option>
                          <option value="montant_asc">Montant le moins élevé</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-0.5">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-100'}`}
                  title="Vue liste"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-100'}`}
                  title="Vue grille"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* LISTE DES PROJETS */}
        {filteredAndSortedProjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun projet trouvé</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm || filterStatus !== 'all' 
                ? 'Aucun projet ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
                : 'Commencez par créer votre premier projet de financement'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button 
                onClick={() => setShowFormulaireFPI(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all transform hover:scale-105"
              >
                <Plus className="h-5 w-5" /> Créer un projet FPI
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'list' ? (
              <div className="space-y-3">
                {filteredAndSortedProjects.map((projet, index) => (
                  <div
                    key={`${projet.type_projet}-${projet.id}`}
                    onClick={() => ouvrirDetail(projet)}
                    className="group bg-white border border-gray-200 p-5 hover:border-primary/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icône statut */}
                      <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${
                        isApprouve(projet) ? 'bg-green-50 border-2 border-green-200' :
                        isRefuse(projet) ? 'bg-red-50 border-2 border-red-200' :
                        !projet.frais_dossier_paye ? 'bg-yellow-50 border-2 border-yellow-200' :
                        'bg-blue-50 border-2 border-blue-200'
                      }`}>
                        {isApprouve(projet) ? <CheckCircle className="h-7 w-7 text-green-600" /> :
                         isRefuse(projet) ? <XCircle className="h-7 w-7 text-red-600" /> :
                         !projet.frais_dossier_paye ? <CreditCard className="h-7 w-7 text-yellow-600" /> :
                         <Folder className="h-6 w-6 text-blue-600" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">
                                {projet.titre}
                              </h3>
                              
                              {!projet.frais_dossier_paye && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-200">
                                  <AlertCircle className="h-3 w-3" />
                                  Paiement requis
                                </span>
                              )}

                              {/* Afficher Approuvé ou Refusé selon l'étape */}
                              {isApprouve(projet) && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                                  <CheckCircle className="h-3 w-3" />
                                  Approuvé
                                </span>
                              )}
                              {isRefuse(projet) && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200">
                                  <XCircle className="h-3 w-3" />
                                  Refusé
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" /> 
                                {formatDate(projet.date_soumission)}
                              </span>
                              {projet.montant_demande && (
                                <span className="flex items-center gap-1 font-semibold text-gray-900">
                                  <DollarSign className="h-3.5 w-3.5" /> 
                                  {formatMontant(projet.montant_demande)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {peutEtreModifie(projet) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setProjetAModifier(projet)
                                  setShowFormulaireModification(true)
                                }}
                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                            )}
                            
                            {!projet.frais_dossier_paye && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  ouvrirPaiement(projet)
                                }}
                                className="px-4 py-2 bg-yellow-500 text-white text-xs font-semibold rounded-lg hover:bg-yellow-600 transition-all transform hover:scale-105 shadow-md shadow-yellow-200"
                              >
                                <span className="flex items-center gap-1.5">
                                  <CreditCard className="h-3.5 w-3.5" />
                                  Payer ${FRAIS_DOSSIER}
                                </span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Barre de progression des étapes */}
                        <div className="mt-4">
                          <div className="flex items-center gap-1">
                            {ETAPES.map((etape, idx) => {
                              const currentIdx = getEtapeIndex(projet.etape)
                              const isLastEtape = isApprouve(projet) || isRefuse(projet)
                              
                              // Pour les projets approuvés, tout est vert
                              // Pour les projets refusés, tout est rouge jusqu'à la dernière étape
                              const allCompletedGreen = isApprouve(projet)
                              const allCompletedRed = isRefuse(projet)
                              
                              let bgColor = 'bg-gray-100 text-gray-400'
                              let icon = <span className="text-xs font-bold">{idx + 1}</span>
                              
                              if (allCompletedGreen) {
                                bgColor = 'bg-green-500 text-white'
                                icon = <Check className="h-3 w-3" />
                              } else if (allCompletedRed && idx <= 4) {
                                bgColor = idx < 4 ? 'bg-red-400 text-white' : 'bg-red-500 text-white'
                                icon = idx < 4 ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />
                              } else if (idx < currentIdx) {
                                bgColor = 'bg-green-500 text-white'
                                icon = <Check className="h-3 w-3" />
                              } else if (idx === currentIdx) {
                                bgColor = 'bg-primary text-white ring-2 ring-primary/30'
                              }
                              
                              return (
                                <div key={etape.key} className="flex items-center flex-1">
                                  <div className={`flex items-center justify-center w-6 h-6 rounded-full ${bgColor}`}>
                                    {icon}
                                  </div>
                                  {idx < ETAPES.length - 1 && (
                                    <div className={`flex-1 h-1 mx-1 rounded-full ${
                                      allCompletedGreen ? 'bg-green-400' :
                                      allCompletedRed ? 'bg-red-400' :
                                      idx < currentIdx ? 'bg-green-400' : 
                                      'bg-gray-200'
                                    }`} />
                                  )}
                                </div>
                              )
                            })}
                          </div>
                          <div className="flex justify-between mt-1 px-1">
                            {ETAPES.map((etape, idx) => {
                              const currentIdx = getEtapeIndex(projet.etape)
                              const isLastEtape = isApprouve(projet) || isRefuse(projet)
                              const completed = isLastEtape || idx <= currentIdx
                              
                              return (
                                <span key={etape.key} className={`text-[10px] ${
                                  completed ? 'text-gray-900 font-medium' : 'text-gray-400'
                                }`}>
                                  {etape.label}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedProjects.map((projet) => (
                  <div
                    key={`${projet.type_projet}-${projet.id}`}
                    onClick={() => ouvrirDetail(projet)}
                    className="group bg-white border border-gray-200 p-5 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${
                          isApprouve(projet) ? 'bg-green-50' :
                          isRefuse(projet) ? 'bg-red-50' :
                          !projet.frais_dossier_paye ? 'bg-yellow-50' :
                          'bg-blue-50'
                        }`}>
                          {isApprouve(projet) ? <CheckCircle className="h-6 w-6 text-green-600" /> :
                           isRefuse(projet) ? <XCircle className="h-6 w-6 text-red-600" /> :
                           !projet.frais_dossier_paye ? <CreditCard className="h-6 w-6 text-yellow-600" /> :
                           <Folder className="h-6 w-6 text-blue-600" />}
                        </div>
                      
                        {/* Badge de statut dans la vue grille */}
                        <div className="flex flex-col gap-1">
                          {isApprouve(projet) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                              <CheckCircle className="h-3 w-3" /> Approuvé
                            </span>
                          )}
                          {isRefuse(projet) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200">
                              <XCircle className="h-3 w-3" /> Refusé
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-sm flex font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {projet.titre}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                        <Calendar className="h-4 w-4" />
                        <span className="text-xs">{formatDate(projet.date_soumission)}</span>
                      </div>

                      {projet.montant_demande && (
                        <div className="flex items-center gap-2 mb-3">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-lg font-bold text-gray-900">
                            {formatMontant(projet.montant_demande)}
                          </span>
                        </div>
                      )}

                      <div className="mt-auto">
                        {!projet.frais_dossier_paye ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              ouvrirPaiement(projet)
                            }}
                            className="w-full px-4 py-2 bg-yellow-500 text-white text-xs font-semibold rounded-lg hover:bg-yellow-600 transition-all"
                          >
                            Payer ${FRAIS_DOSSIER}
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${
                              isApprouve(projet) ? 'bg-green-500' :
                              isRefuse(projet) ? 'bg-red-500' :
                              'bg-blue-500'
                            }`} />
                            <span className="text-sm text-gray-600">
                              {getEtapeLabel(projet.etape)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL FORMULAIRE FPI */}
      {showFormulaireFPI && (
        <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
            <FormulaireFPI
              onClose={() => setShowFormulaireFPI(false)}
              onSuccess={async (projetData?: any) => {
                setShowFormulaireFPI(false)
                await chargerProjets()
                setSuccess('✅ Votre demande FPI a été soumise avec succès !')
              }}
            />
          </div>
        </div>
      )}

      {/* MODAL MODIFICATION */}
      {showFormulaireModification && projetAModifier && (
        <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
            <FormulaireFPIModification
              projetId={projetAModifier.id}
              onClose={() => {
                setShowFormulaireModification(false)
                setProjetAModifier(null)
              }}
              onSuccess={() => {
                setShowFormulaireModification(false)
                setProjetAModifier(null)
                setSuccess('✅ Votre demande a été modifiée avec succès !')
                chargerProjets()
              }}
            />
          </div>
        </div>
      )}

      {/* MODAL DÉTAIL PROJET */}
      {showDetailModal && selectedProjet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">{selectedProjet.titre}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      selectedProjet.type_projet === 'fpi' ? 'bg-purple-50 text-purple-700' : 'bg-gray-50 text-gray-600'
                    }`}>
                      {selectedProjet.type_projet === 'fpi' ? 'FPI' : 'Standard'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(selectedProjet.date_soumission)}</span>
                    {selectedProjet.montant_demande && (
                      <>
                        <span>•</span>
                        <span className="font-semibold">{formatMontant(selectedProjet.montant_demande)}</span>
                      </>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setShowDetailModal(false)} 
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-4">
                {peutEtreModifie(selectedProjet) && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false)
                      setTimeout(() => {
                        setProjetAModifier(selectedProjet)
                        setShowFormulaireModification(true)
                      }, 200)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 text-sm font-medium rounded-xl hover:bg-amber-100 border border-amber-200 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    Modifier la demande
                  </button>
                )}

                {!selectedProjet.frais_dossier_paye && (
                  <button 
                    onClick={() => {
                      setShowDetailModal(false)
                      setTimeout(() => ouvrirPaiement(selectedProjet), 200)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-xl hover:bg-yellow-600 transition-colors"
                  >
                    <CreditCard className="h-4 w-4" />
                    Payer ${FRAIS_DOSSIER}
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {selectedProjet.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    Description
                  </h3>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    {selectedProjet.description}
                  </p>
                </div>
              )}

              {/* Décision du Comité - Affichée seulement si approuvé ou refusé */}
              {isApprouve(selectedProjet) && (
                <div className="rounded-xl p-4 border bg-green-50 border-green-200">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Décision du Comité de Crédit
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      ✅ Financement Approuvé
                    </span>
                  </div>
                  {selectedProjet.rapport_commentaire && (
                    <p className="text-sm text-gray-700 bg-white/50 rounded-lg p-3">
                      {selectedProjet.rapport_commentaire}
                    </p>
                  )}
                </div>
              )}

              {isRefuse(selectedProjet) && (
                <div className="rounded-xl p-4 border bg-red-50 border-red-200">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Décision du Comité de Crédit
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      ❌ Financement Refusé
                    </span>
                  </div>
                  {selectedProjet.rapport_commentaire && (
                    <p className="text-sm text-gray-700 bg-white/50 rounded-lg p-3">
                      {selectedProjet.rapport_commentaire}
                    </p>
                  )}
                </div>
              )}

              {/* Rapport technique - affiché seulement si pas de décision finale */}
              {!isTermine(selectedProjet) && selectedProjet.rapport_decision && (
                <div className={`rounded-xl p-4 border ${
                  selectedProjet.rapport_decision === 'favorable' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Rapport d'analyse technique
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedProjet.rapport_decision === 'favorable' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedProjet.rapport_decision === 'favorable' ? 'Favorable' : 'Défavorable'}
                    </span>
                    {selectedProjet.rapport_technicien_nom && (
                      <span className="text-xs text-gray-500">
                        par {selectedProjet.rapport_technicien_nom}
                      </span>
                    )}
                  </div>
                  {selectedProjet.rapport_commentaire && (
                    <p className="text-sm text-gray-700 bg-white/50 rounded-lg p-3">
                      {selectedProjet.rapport_commentaire}
                    </p>
                  )}
                </div>
              )}

              {/* Documents */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Upload className="h-4 w-4 text-gray-400" />
                    Documents ({documents.length})
                  </h3>
                </div>

                {loadingDocuments ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                    <p className="text-xs text-gray-500 mt-2">Chargement des documents...</p>
                  </div>
                ) : documents.length > 0 ? (
                  <div className="space-y-2">
                    {documents.map(doc => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-xl border bg-green-50 border-green-200 transition-all hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-green-100">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {doc.type_nom}
                              {doc.obligatoire && (
                                <span className="text-red-500 ml-1" title="Document obligatoire">*</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(doc.date_upload)}
                              {doc.verification_auto && ' • Vérifié'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <a
                            href={doc.chemin_fichier}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                            title="Voir le document"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Aucun document ajouté</p>
                    <label className="cursor-pointer mt-2 inline-block">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file && selectedProjet) uploadDocument(0, file)
                        }}
                      />
                      <span className="text-xs text-primary hover:underline font-medium">
                        Ajouter votre premier document
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PAIEMENT */}
      {showPaiementModal && selectedProjet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-yellow-600" />
                  Paiement des frais
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">{selectedProjet.titre}</p>
              </div>
              <button 
                onClick={() => {
                  if (paiementStep !== 'processing' && paiementStep !== 'success') {
                    setShowPaiementModal(false)
                  }
                }} 
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                disabled={paiementStep === 'processing'}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {paiementStep === 'method' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-600">Montant à payer</span>
                      <span className="text-3xl font-bold text-gray-900">
                        {formatMontant(FRAIS_DOSSIER)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Référence</span>
                      <span className="font-mono text-xs bg-gray-100 px-3 py-1 rounded-lg">
                        {referencePaiement}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      Méthode de paiement
                    </label>
                    <div className="space-y-3">
                      <button
                        onClick={() => setMethodePaiement('mobile_money')}
                        className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                          methodePaiement === 'mobile_money' 
                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            methodePaiement === 'mobile_money' ? 'bg-primary/10' : 'bg-gray-100'
                          }`}>
                            <Smartphone className={`h-6 w-6 ${
                              methodePaiement === 'mobile_money' ? 'text-primary' : 'text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold">Mobile Money</p>
                            <p className="text-xs text-gray-500">Orange, MTN, Airtel</p>
                          </div>
                          {methodePaiement === 'mobile_money' && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </button>

                      <button
                        onClick={() => setMethodePaiement('carte')}
                        className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                          methodePaiement === 'carte' 
                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            methodePaiement === 'carte' ? 'bg-primary/10' : 'bg-gray-100'
                          }`}>
                            <CreditCard className={`h-6 w-6 ${
                              methodePaiement === 'carte' ? 'text-primary' : 'text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold">Carte Bancaire</p>
                            <p className="text-xs text-gray-500">Visa, Mastercard</p>
                          </div>
                          {methodePaiement === 'carte' && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </button>

                      <button
                        onClick={() => setMethodePaiement('virement')}
                        className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                          methodePaiement === 'virement' 
                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            methodePaiement === 'virement' ? 'bg-primary/10' : 'bg-gray-100'
                          }`}>
                            <Building2 className={`h-6 w-6 ${
                              methodePaiement === 'virement' ? 'text-primary' : 'text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold">Virement Bancaire</p>
                            <p className="text-xs text-gray-500">Toutes les banques</p>
                          </div>
                          {methodePaiement === 'virement' && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </button>
                    </div>
                  </div>

                  {paiementError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-700">{paiementError}</p>
                    </div>
                  )}

                  <button
                    onClick={() => setPaiementStep('details')}
                    className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all transform hover:scale-[1.02] active:scale-100 shadow-lg shadow-primary/25"
                  >
                    Continuer vers le paiement
                  </button>
                </div>
              )}

              {paiementStep === 'details' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
                    <div className="text-center mb-6">
                      <p className="text-sm text-gray-600 mb-1">Montant à payer</p>
                      <p className="text-4xl font-bold text-gray-900">{formatMontant(FRAIS_DOSSIER)}</p>
                      <p className="text-xs text-gray-500 mt-2">Réf: {referencePaiement}</p>
                    </div>

                    {methodePaiement === 'mobile_money' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Choisissez votre opérateur
                          </label>
                          <div className="grid grid-cols-3 gap-3">
                            {operateurs.map(op => (
                              <button
                                key={op.id}
                                onClick={() => setOperateurMobile(op.id as typeof operateurMobile)}
                                className={`p-4 rounded-xl border-2 text-center transition-all ${
                                  operateurMobile === op.id
                                    ? 'border-primary bg-primary/5 shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className={`w-12 h-12 rounded-full ${op.couleur} mx-auto mb-2 flex items-center justify-center shadow-lg`}>
                                  <Smartphone className="h-6 w-6 text-white" />
                                </div>
                                <p className="text-xs font-semibold">{op.nom}</p>
                                <p className="text-xs text-gray-500">{op.code}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Numéro de téléphone
                          </label>
                          <div className="relative">
                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="tel"
                              value={numeroMobile}
                              onChange={(e) => setNumeroMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                              placeholder="Ex: 0812345678"
                              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {methodePaiement === 'carte' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Numéro de carte
                          </label>
                          <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              value={numeroCarte}
                              onChange={(e) => setNumeroCarte(formatCardNumber(e.target.value).slice(0, 19))}
                              placeholder="1234 5678 9012 3456"
                              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Date d'expiration
                            </label>
                            <input
                              type="text"
                              value={dateExpiration}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '')
                                if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2, 4)
                                setDateExpiration(val.slice(0, 5))
                              }}
                              placeholder="MM/AA"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Code de sécurité
                            </label>
                            <input
                              type="text"
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                              placeholder="CVV"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {methodePaiement === 'virement' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Sélectionnez votre banque
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                          {banques.map(banque => (
                            <button
                              key={banque}
                              onClick={() => setNomBanque(banque)}
                              className={`p-3 rounded-xl border text-left text-sm transition-all ${
                                nomBanque === banque
                                  ? 'border-primary bg-primary/5 font-medium'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <Building2 className="h-4 w-4 inline mr-2 text-gray-400" />
                              {banque}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {paiementError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-700">{paiementError}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setPaiementStep('method')
                        setPaiementError('')
                      }}
                      className="flex-1 py-3 border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all"
                    >
                      ← Retour
                    </button>
                    <button
                      onClick={demarrerPaiement}
                      className="flex-1 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all transform hover:scale-[1.02] active:scale-100 shadow-lg shadow-primary/25"
                    >
                      Payer {formatMontant(FRAIS_DOSSIER)}
                    </button>
                  </div>
                </div>
              )}

              {paiementStep === 'processing' && (
                <div className="space-y-6 py-8">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center mx-auto mb-6 animate-pulse">
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Paiement en cours</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      {methodePaiement === 'mobile_money' 
                        ? `Confirmez le paiement sur votre téléphone ${numeroMobile}`
                        : 'Vérification de vos informations bancaires...'}
                    </p>

                    <div className="max-w-xs mx-auto">
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${progressPaiement}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">{Math.round(progressPaiement)}%</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-700">Paiement sécurisé</p>
                      <p className="text-xs text-blue-600 mt-1">
                        Vos informations sont cryptées et protégées
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {paiementStep === 'confirmation' && (
                <div className="space-y-6 py-8">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <QrCode className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmation requise</h3>
                    <p className="text-sm text-gray-600">
                      Entrez le code de validation reçu
                    </p>
                  </div>

                  {showOTP && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Code de validation
                        </label>
                        <input
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl text-center text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-sm text-gray-500">
                            Expire dans {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                          </p>
                          <button
                            onClick={() => {
                              setCountdown(120)
                              setPaiementError('')
                            }}
                            disabled={countdown > 0}
                            className="text-sm text-primary hover:underline disabled:text-gray-400 disabled:no-underline font-medium"
                          >
                            Renvoyer le code
                          </button>
                        </div>
                      </div>

                      {paiementError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                          <p className="text-sm text-red-700">{paiementError}</p>
                        </div>
                      )}

                      <button
                        onClick={validerOTP}
                        disabled={paiementLoading}
                        className="w-full py-3.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-200"
                      >
                        {paiementLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Validation en cours...
                          </>
                        ) : (
                          <>
                            <Shield className="h-5 w-5" />
                            Valider le paiement
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {paiementStep === 'success' && (
                <div className="text-center py-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi !</h3>
                  <p className="text-gray-600 mb-6">
                    Votre paiement de {formatMontant(FRAIS_DOSSIER)} a été effectué avec succès
                  </p>
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 inline-block">
                    <p className="text-xs text-gray-500 mb-1">Référence de transaction</p>
                    <p className="text-lg font-mono font-bold text-gray-900">{referencePaiement}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}