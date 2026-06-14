

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
  Wifi, Bell, BellRing
} from 'lucide-react'
import FormulaireFPI from '@/components/fpi/FormulaireFPI'

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
  { key: 'reçu', label: 'Reçu', icon: Clock, desc: 'Projet soumis' },
  // { key: 'vérif_docs', label: 'Vérif. Docs', icon: FileCheck, desc: 'Vérification documents' },
  { key: 'analyse_tech', label: 'Analyse Tech', icon: Shield, desc: 'Analyse technique' },
  { key: 'comité_crédit', label: 'Comité', icon: CreditCard, desc: 'Comité de crédit' },
  { key: 'décision_rendue', label: 'Décision', icon: CheckCircle, desc: 'Décision finale' }
]

const ETAPE_COLORS: Record<string, string> = {
  'reçu': 'bg-blue-100 text-blue-700',
  'vérif_docs': 'bg-yellow-100 text-yellow-700',
  'analyse_tech': 'bg-purple-100 text-purple-700',
  'comité_crédit': 'bg-orange-100 text-orange-700',
  'décision_rendue': 'bg-green-100 text-green-700',
  'creation': 'bg-blue-100 text-blue-700',
  'soumission': 'bg-yellow-100 text-yellow-700'
}

const FRAIS_DOSSIER = 500

export default function PromoteurProjetsPage() {
  const { user } = useAuth()
  const { isSubscribed, isSupported, toggle } = usePushNotifications()
  
  const [projets, setProjets] = useState<Projet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [showFormulaireFPI, setShowFormulaireFPI] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showPaiementModal, setShowPaiementModal] = useState(false)
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null)
  const [documents, setDocuments] = useState<DocumentUpload[]>([])
  const [typesDocuments, setTypesDocuments] = useState<TypeDocument[]>([])
  
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
  
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null)
  const [uploadingDocId, setUploadingDocId] = useState<number | null>(null)

  const [sendingNotification, setSendingNotification] = useState(false)
  const [showNotificationBanner, setShowNotificationBanner] = useState(false)

  // 🆕 Récupérer l'ID utilisateur
  const getUserId = (): number => {
    if (!user?.id) return 0
    const uid = typeof user.id === 'string' ? parseInt(user.id) : user.id
    return isNaN(uid) ? 0 : uid
  }

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
        console.log('Pas d\'ID utilisateur')
        setProjets([])
        return
      }

      // Charger les projets FPI
      const { data: projetsFPI } = await supabase
        .from('vue_projets_fpi_details')
        .select('*')
        .eq('promoteur_id', uid)
        .order('created_at', { ascending: false })

      // Charger les anciens projets (sans la vue, directement)
      const { data: anciensProjets } = await supabase
        .from('projets')
        .select('*')
        .eq('promoteur_id', uid)
        .order('date_soumission', { ascending: false })

      // Mapper les projets FPI
      const projetsFPIMapped: Projet[] = (projetsFPI || []).map((item: any) => ({
        id: item.id,
        titre: item.nom_projet || 'Projet FPI',
        description: item.description_projet,
        montant_demande: item.montant_sollicite,
        etape: item.etape || 'reçu',
        decision_finale: item.decision_finale,
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

      // Mapper les anciens projets
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

      // Fusionner et trier
      const tousLesProjets = [...projetsFPIMapped, ...anciensProjetsMapped]
        .sort((a, b) => new Date(b.date_soumission).getTime() - new Date(a.date_soumission).getTime())

      console.log('✅ Projets chargés:', tousLesProjets.length)
      setProjets(tousLesProjets)
    } catch (error) {
      console.error('Erreur chargement projets:', error)
      setProjets([])
    } finally {
      setLoading(false)
    }
  }

  const chargerDocuments = async (projetId: number) => {
    setLoadingDocuments(true)
    
    // Essayer d'abord les documents FPI
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
      // Essayer les documents standard
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

      // Essayer d'abord frais_dossier_fpi
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
        // Essayer frais_dossier standard
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

      // Essayer le bucket documents_fpi d'abord
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

      // Fallback sur le bucket documents standard
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

      // Insérer dans la bonne table
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
      // Essayer de supprimer des deux tables
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
  const getEtapeIndex = (etape: string) => Math.max(0, ETAPES.findIndex(e => e.key === etape))

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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Chargement de vos projets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-auto flex flex-col">
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

      {/* BANNIÈRE NOTIFICATIONS */}
      {showNotificationBanner && isSupported && !isSubscribed && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellRing className="h-5 w-5 animate-bounce" />
              <div>
                <p className="text-sm font-medium">Activez les notifications</p>
                <p className="text-xs text-blue-100">Recevez des alertes pour vos projets et paiements</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={activerNotifications}
                className="px-4 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
              >
                Activer
              </button>
              <button
                onClick={() => setShowNotificationBanner(false)}
                className="p-1.5 hover:bg-blue-400/30 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mes Projets</h1>
            <p className="text-sm text-gray-500">{projets.length} projet{projets.length > 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            {isSupported && (
              <button
                onClick={activerNotifications}
                disabled={sendingNotification}
                className={`p-2 rounded-lg transition-all ${
                  isSubscribed 
                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Nouveau Projet FPI
            </button>
          </div>
        </div>
      </div>

      {/* Liste projets */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-3">
          {projets.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun projet</h3>
              <p className="text-sm text-gray-500 mb-4">Créez votre premier projet de financement</p>
              <button 
                onClick={() => setShowFormulaireFPI(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" /> Créer un projet FPI
              </button>
            </div>
          ) : (
            projets.map(projet => (
              <div key={`${projet.type_projet}-${projet.id}`} onClick={() => ouvrirDetail(projet)}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
                
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                    projet.decision_finale === 'approuvé' ? 'bg-green-100' :
                    projet.decision_finale === 'refusé' ? 'bg-red-100' :
                    !projet.frais_dossier_paye ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    {projet.decision_finale === 'approuvé' ? <CheckCircle className="h-6 w-6 text-green-600" /> :
                     projet.decision_finale === 'refusé' ? <XCircle className="h-6 w-6 text-red-600" /> :
                     !projet.frais_dossier_paye ? <DollarSign className="h-6 w-6 text-yellow-600" /> :
                     <Clock className="h-6 w-6 text-blue-600" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-gray-900">{projet.titre}</h3>
                          
                          {/* Badge type de projet */}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            projet.type_projet === 'fpi' 
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>
                            {projet.type_projet === 'fpi' ? 'FPI' : 'Standard'}
                          </span>
                          
                          {!projet.frais_dossier_paye && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium border border-yellow-200">
                              <AlertCircle className="h-3 w-3" />
                              Frais non payés
                            </span>
                          )}

                          {projet.decision_finale && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              projet.decision_finale === 'approuvé' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {projet.decision_finale === 'approuvé' ? 
                                <CheckCircle className="h-3 w-3" /> : 
                                <XCircle className="h-3 w-3" />
                              }
                              {projet.decision_finale.charAt(0).toUpperCase() + projet.decision_finale.slice(1)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
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

                      {!projet.frais_dossier_paye && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            ouvrirPaiement(projet)
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500 text-white text-xs font-medium rounded-lg hover:bg-yellow-600 transition-colors"
                        >
                          <CreditCard className="h-3 w-3" />
                          Payer ${FRAIS_DOSSIER}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        ETAPE_COLORS[projet.etape] || 'bg-gray-100 text-gray-700'
                      }`}>
                        {ETAPES.find(e => e.key === projet.etape)?.label || projet.etape}
                      </span>

                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[120px]">
                          <div className={`h-full rounded-full ${
                            projet.docs_obligatoires_valides === projet.docs_obligatoires_total && projet.docs_obligatoires_total > 0
                              ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                          style={{ 
                            width: `${projet.docs_obligatoires_total > 0 
                              ? (projet.docs_obligatoires_valides / projet.docs_obligatoires_total) * 100 
                              : 0}%` 
                          }} />
                        </div>
                        <span className="text-xs text-gray-500">
                          {projet.docs_obligatoires_valides}/{projet.docs_obligatoires_total} docs
                        </span>
                      </div>
                    </div>

                    {projet.rapport_decision && (
                      <div className={`mt-2 p-2 rounded-lg text-xs ${
                        projet.rapport_decision === 'favorable' ? 'bg-green-50 border border-green-100' :
                        projet.rapport_decision === 'defavorable' ? 'bg-red-50 border border-red-100' :
                        'bg-orange-50 border border-orange-100'
                      }`}>
                        <div className="flex items-center gap-2">
                          {projet.rapport_decision === 'favorable' ? 
                            <Check className="h-3 w-3 text-green-600" /> :
                            <Ban className="h-3 w-3 text-red-600" />
                          }
                          <span className="font-medium">
                            Rapport : {projet.rapport_decision}
                          </span>
                          {projet.rapport_technicien_nom && (
                            <span className="text-gray-500">par {projet.rapport_technicien_nom}</span>
                          )}
                        </div>
                        {projet.rapport_commentaire && (
                          <p className="mt-1 text-gray-600">{projet.rapport_commentaire}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL FORMULAIRE FPI */}
      {showFormulaireFPI && (
        <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
            <FormulaireFPI
              onClose={() => setShowFormulaireFPI(false)}
              onSuccess={() => {
                setShowFormulaireFPI(false)
                setSuccess('✅ Votre demande FPI a été soumise avec succès !')
                chargerProjets()
              }}
            />
          </div>
        </div>
      )}

      {/* MODAL DÉTAIL PROJET */}
      {showDetailModal && selectedProjet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">{selectedProjet.titre}</h2>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      selectedProjet.type_projet === 'fpi' 
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {selectedProjet.type_projet === 'fpi' ? 'FPI' : 'Standard'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{formatDate(selectedProjet.date_soumission)}</span>
                    {selectedProjet.montant_demande && (
                      <span className="font-semibold">{formatMontant(selectedProjet.montant_demande)}</span>
                    )}
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {!selectedProjet.frais_dossier_paye && (
                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Frais de dossier non payés</p>
                      <p className="text-xs text-yellow-600">${FRAIS_DOSSIER} USD requis pour traiter votre dossier</p>
                    </div>
                  </div>
                  <button onClick={() => {
                    setShowDetailModal(false)
                    setTimeout(() => ouvrirPaiement(selectedProjet), 200)
                  }}
                    className="px-3 py-1.5 bg-yellow-500 text-white text-xs font-medium rounded-lg hover:bg-yellow-600">
                    Payer maintenant
                  </button>
                </div>
              )}

              <div className="mt-4 flex items-center gap-1">
                {ETAPES.map((etape, index) => {
                  const currentIndex = getEtapeIndex(selectedProjet.etape)
                  const isCompleted = index < currentIndex
                  const isCurrent = index === currentIndex
                  
                  return (
                    <div key={etape.key} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCompleted ? 'bg-green-500 text-white' :
                          isCurrent ? 'bg-primary text-white' :
                          'bg-gray-100 text-gray-400'
                        }`}>
                          {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                        </div>
                        <span className={`text-[10px] mt-1 text-center font-medium ${
                          isCompleted ? 'text-green-600' : isCurrent ? 'text-primary' : 'text-gray-400'
                        }`}>
                          {etape.label}
                        </span>
                      </div>
                      {index < ETAPES.length - 1 && (
                        <div className={`h-0.5 flex-1 -mt-4 ${
                          index < currentIndex ? 'bg-green-400' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedProjet.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">{selectedProjet.description}</p>
                </div>
              )}

              {selectedProjet.rapport_decision && (
                <div className={`rounded-xl p-4 border ${
                  selectedProjet.rapport_decision === 'favorable' ? 'bg-green-50 border-green-200' :
                  selectedProjet.rapport_decision === 'defavorable' ? 'bg-red-50 border-red-200' :
                  'bg-orange-50 border-orange-200'
                }`}>
                  <h3 className="text-sm font-semibold mb-2">Rapport d'analyse technique</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      selectedProjet.rapport_decision === 'favorable' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {selectedProjet.rapport_decision}
                    </span>
                    {selectedProjet.rapport_technicien_nom && (
                      <span className="text-xs text-gray-500">par {selectedProjet.rapport_technicien_nom}</span>
                    )}
                  </div>
                  {selectedProjet.rapport_commentaire && (
                    <p className="text-sm text-gray-700">{selectedProjet.rapport_commentaire}</p>
                  )}
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Documents ({documents.length})
                </h3>
                {loadingDocuments ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                    <p className="text-xs text-gray-500 mt-2">Chargement des documents...</p>
                  </div>
                ) : documents.length > 0 ? (
                  <div className="space-y-2">
                    {documents.map(doc => (
                      <div key={doc.id} className={`flex items-center justify-between p-3 rounded-xl border ${
                        doc.verification_auto ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          {doc.verification_auto ? <CheckCircle className="h-5 w-5 text-green-500" /> :
                           <Clock className="h-5 w-5 text-yellow-500" />}
                          <div>
                            <p className="text-sm font-medium">
                              {doc.type_nom}
                              {doc.obligatoire && <span className="text-red-500 ml-1">*</span>}
                            </p>
                            <p className="text-xs text-gray-500">{formatDate(doc.date_upload)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.verification_auto && <span className="text-xs text-green-600 font-medium">Validé</span>}
                          <a href={doc.chemin_fichier} target="_blank" 
                            className="p-1.5 text-gray-400 hover:text-primary rounded-lg">
                            <Eye className="h-4 w-4" />
                          </a>
                         
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Aucun document</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PAIEMENT */}
      {showPaiementModal && selectedProjet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-yellow-50 to-white">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Paiement Frais de Dossier</h2>
                <p className="text-xs text-gray-500 mt-0.5">{selectedProjet.titre}</p>
              </div>
              <button 
                onClick={() => {
                  if (paiementStep !== 'processing' && paiementStep !== 'success') {
                    setShowPaiementModal(false)
                  }
                }} 
                className="p-2 hover:bg-gray-100 rounded-lg"
                disabled={paiementStep === 'processing'}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {paiementStep === 'method' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Montant</span>
                      <span className="text-xl font-bold text-gray-900">{formatMontant(FRAIS_DOSSIER)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Référence</span>
                      <span className="font-mono text-xs text-gray-500">{referencePaiement}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Choisissez votre méthode de paiement
                    </label>
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setMethodePaiement('mobile_money')}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          methodePaiement === 'mobile_money' 
                            ? 'border-primary bg-primary/5 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                            <Smartphone className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Mobile Money</p>
                            <p className="text-xs text-gray-500">Orange, MTN, Airtel</p>
                          </div>
                          {methodePaiement === 'mobile_money' && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMethodePaiement('carte')}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          methodePaiement === 'carte' 
                            ? 'border-primary bg-primary/5 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Carte Bancaire</p>
                            <p className="text-xs text-gray-500">Visa, Mastercard</p>
                          </div>
                          {methodePaiement === 'carte' && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMethodePaiement('virement')}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          methodePaiement === 'virement' 
                            ? 'border-primary bg-primary/5 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Virement Bancaire</p>
                            <p className="text-xs text-gray-500">Toutes les banques partenaires</p>
                          </div>
                          {methodePaiement === 'virement' && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </button>
                    </div>
                  </div>

                  {paiementError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <p className="text-xs text-red-700">{paiementError}</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setPaiementStep('details')}
                    className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Continuer
                  </button>
                </div>
              )}

              {paiementStep === 'details' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Montant à payer</p>
                    <p className="text-3xl font-bold text-gray-900">{formatMontant(FRAIS_DOSSIER)}</p>
                    <p className="text-xs text-gray-500 mt-1">Réf: {referencePaiement}</p>
                  </div>

                  {methodePaiement === 'mobile_money' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Opérateur</label>
                        <div className="grid grid-cols-3 gap-2">
                          {operateurs.map(op => (
                            <button
                              key={op.id}
                              type="button"
                              onClick={() => setOperateurMobile(op.id as typeof operateurMobile)}
                              className={`p-3 rounded-xl border-2 text-center transition-all ${
                                operateurMobile === op.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-full ${op.couleur} mx-auto mb-1 flex items-center justify-center`}>
                                <Smartphone className="h-4 w-4 text-white" />
                              </div>
                              <p className="text-xs font-medium">{op.nom}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Numéro de téléphone</label>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="tel"
                            value={numeroMobile}
                            onChange={(e) => setNumeroMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="Ex: 0812345678"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {methodePaiement === 'carte' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Numéro de carte</label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            value={numeroCarte}
                            onChange={(e) => setNumeroCarte(formatCardNumber(e.target.value).slice(0, 19))}
                            placeholder="1234 5678 9012 3456"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiration</label>
                          <input
                            type="text"
                            value={dateExpiration}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, '')
                              if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2, 4)
                              setDateExpiration(val.slice(0, 5))
                            }}
                            placeholder="MM/AA"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">CVV</label>
                          <input
                            type="text"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                            placeholder="123"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {methodePaiement === 'virement' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Votre banque</label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {banques.map(banque => (
                          <button
                            key={banque}
                            type="button"
                            onClick={() => setNomBanque(banque)}
                            className={`p-3 rounded-xl border text-left text-sm transition-all ${
                              nomBanque === banque
                                ? 'border-primary bg-primary/5 font-medium'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Building2 className="h-4 w-4 inline mr-2 text-gray-400" />
                            {banque}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {paiementError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <p className="text-xs text-red-700">{paiementError}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPaiementStep('method')
                        setPaiementError('')
                      }}
                      className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm rounded-xl hover:bg-gray-50"
                    >
                      ← Retour
                    </button>
                    <button
                      type="button"
                      onClick={demarrerPaiement}
                      className="flex-1 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90"
                    >
                      Payer {formatMontant(FRAIS_DOSSIER)}
                    </button>
                  </div>
                </div>
              )}

              {paiementStep === 'processing' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-4">
                      <Wifi className="h-10 w-10 text-yellow-500 animate-pulse" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Paiement en cours</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {methodePaiement === 'mobile_money' 
                        ? `Veuillez confirmer le paiement sur votre téléphone ${numeroMobile}`
                        : 'Vérification de vos informations bancaires...'}
                    </p>

                    <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPaiement}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">{Math.round(progressPaiement)}%</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-blue-700">Paiement sécurisé</p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        Vos informations sont cryptées et protégées par le protocole SSL
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {paiementStep === 'confirmation' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <QrCode className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Confirmez le paiement</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Un code de validation a été envoyé
                    </p>
                  </div>

                  {showOTP && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Code de validation
                        </label>
                        <input
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">
                            Code valable {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setCountdown(120)
                              setPaiementError('')
                            }}
                            disabled={countdown > 0}
                            className="text-xs text-primary hover:underline disabled:text-gray-400 disabled:no-underline"
                          >
                            Renvoyer le code
                          </button>
                        </div>
                      </div>

                      {paiementError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <p className="text-xs text-red-700">{paiementError}</p>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={validerOTP}
                        disabled={paiementLoading}
                        className="w-full py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                      >
                        {paiementLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Validation...
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
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Paiement réussi !</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Votre paiement de {formatMontant(FRAIS_DOSSIER)} a été effectué avec succès
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 inline-block">
                    <p className="text-xs text-gray-500">Référence</p>
                    <p className="text-sm font-mono font-medium">{referencePaiement}</p>
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
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
      `}</style>
    </div>
  )
}