
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { 
  Search, FileText, CheckCircle, 
  Clock, Loader2, Eye, AlertCircle, Send, User, 
  Calendar, Download, TrendingUp,
  Banknote, Briefcase, ThumbsUp, ThumbsDown, Minus,
  FileCheck, ShieldCheck
} from 'lucide-react'
import Image from 'next/image'



type ProjetPourComite = {
  id: number
  nom_projet: string
  description_projet: string | null
  montant_sollicite: number | null
  etape: string
  promoteur_nom_complet: string
  promoteur_email: string | null
  promoteur_telephone: string | null
  promoteur_adresse: string | null
  promoteur_province: string | null
  promoteur_ville: string | null
  created_at: string
  rapport_id: number | null
  rapport_statut: string | null
  rapport_decision: string | null
  nom_entite: string | null
  numero_rccm: string | null
  secteur_activite: string | null
  cout_total: number | null
  apport_personnel: number | null
  duree_remboursement: string | null
  banque_partenaire: string | null
  objectifs_projet: string | null
  localisation_projet: string | null
  nombre_emplois: number | null
  promoteur_id: number | null  // ✅ Ajouter cette ligne
}

type RapportAnalyse = {
  id: number
  projet_id: number
  technicien_id: number
  dossier_complet: boolean
  documents_manquants: string | null
  decision: string | null
  commentaire_global: string | null
  recommandations: string | null
  note_faisabilite: number | null
  note_impact: number | null
  note_finance: number | null
  note_equipe: number | null
  note_marche: number | null
  commentaire_faisabilite: string | null
  commentaire_impact: string | null
  commentaire_finance: string | null
  commentaire_equipe: string | null
  commentaire_marche: string | null
  statut: string
  date_consultation: string | null
  date_verification: string | null
  date_analyse: string | null
  date_decision: string | null
}

const CRITERES = [
  { key: 'faisabilite', label: 'Faisabilité technique', icon: '🔧' },
  { key: 'impact', label: 'Impact socio-économique', icon: '📈' },
  { key: 'finance', label: 'Viabilité financière', icon: '💰' },
  { key: 'equipe', label: 'Qualité de l\'équipe', icon: '👥' },
  { key: 'marche', label: 'Potentiel du marché', icon: '🎯' }
]

export default function ComiteCreditPage() {
  const { user } = useAuth()

  // États
  const [projets, setProjets] = useState<ProjetPourComite[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedProjet, setSelectedProjet] = useState<ProjetPourComite | null>(null)
  const [rapport, setRapport] = useState<RapportAnalyse | null>(null)
  const [loadingRapport, setLoadingRapport] = useState(false)
  
  const [showDecisionModal, setShowDecisionModal] = useState(false)
  const [decisionFinale, setDecisionFinale] = useState('')
  const [montantApprouve, setMontantApprouve] = useState<number | null>(null)
  const [conditions, setConditions] = useState('')
  const [commentaireComite, setCommentaireComite] = useState('')
  const [dateReunion, setDateReunion] = useState('')
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Charger les projets en attente du comité + approuvés + rejetés
  useEffect(() => {
    if (user) {
      chargerProjetsComite()
    }
  }, [user])

  const chargerProjetsComite = async () => {
    setLoading(true)
    
    // Récupérer les projets à l'étape "comité_crédit", "financement_approuve" et "financement_rejete"
    const { data: projetsData, error: projetsError } = await supabase
      .from('projets_fpi')
      .select('*')
      .in('etape', ['comité_crédit', 'financement_approuve', 'financement_rejete'])
      .order('created_at', { ascending: false })

    if (projetsError) {
      console.error('Erreur chargement projets:', projetsError)
      setLoading(false)
      return
    }

    // Récupérer les rapports associés
    if (projetsData && projetsData.length > 0) {
      const projetIds = projetsData.map(p => p.id)
      const { data: rapportsData, error: rapportsError } = await supabase
        .from('rapport_analyse')
        .select('*')
        .in('projet_id', projetIds)

      if (rapportsError) {
        console.error('Erreur chargement rapports:', rapportsError)
      }

      const projetsAvecRapport = projetsData.map(projet => {
        const rapport = (rapportsData || []).find(r => r.projet_id === projet.id)
        return {
          ...projet,
          rapport_id: rapport?.id || null,
          rapport_statut: rapport?.statut || null,
          rapport_decision: rapport?.decision || null
        }
      })

      setProjets(projetsAvecRapport)
    } else {
      setProjets([])
    }
    
    setLoading(false)
  }

  const chargerRapport = async (projetId: number) => {
    setLoadingRapport(true)
    
    const { data, error } = await supabase
      .from('rapport_analyse')
      .select('*')
      .eq('projet_id', projetId)
      .single()

    if (!error && data) {
      setRapport(data as RapportAnalyse)
    } else {
      setRapport(null)
    }
    
    setLoadingRapport(false)
  }

  const ouvrirDetail = async (projet: ProjetPourComite) => {
    setSelectedProjet(projet)
    setShowDetailModal(true)
    await chargerRapport(projet.id)
  }

  const ouvrirDecision = (projet: ProjetPourComite) => {
    setSelectedProjet(projet)
    setDecisionFinale('')
    setMontantApprouve(projet.montant_sollicite)
    setConditions('')
    setCommentaireComite('')
    setDateReunion(new Date().toISOString().split('T')[0])
    setError('')
    setSuccess('')
    setShowDecisionModal(true)
  }

  const calculerNoteTotale = (): number => {
    if (!rapport) return 0
    const valeurs = [
      rapport.note_faisabilite || 0,
      rapport.note_impact || 0,
      rapport.note_finance || 0,
      rapport.note_equipe || 0,
      rapport.note_marche || 0
    ]
    const somme = valeurs.reduce((a, b) => a + b, 0)
    return somme / CRITERES.length
  }

  const getNoteColor = (note: number): string => {
    if (note <= 2) return 'text-red-600 bg-red-50'
    if (note === 3) return 'text-orange-600 bg-orange-50'
    if (note === 4) return 'text-green-600 bg-green-50'
    return 'text-emerald-600 bg-emerald-50'
  }

  const getDecisionBadge = (decision: string | null) => {
    if (decision === 'favorable') {
      return { color: 'bg-green-100 text-green-700', icon: <ThumbsUp className="h-3 w-3" />, text: 'Favorable' }
    } else if (decision === 'defavorable') {
      return { color: 'bg-red-100 text-red-700', icon: <ThumbsDown className="h-3 w-3" />, text: 'Défavorable' }
    }
    return { color: 'bg-orange-100 text-orange-700', icon: <Minus className="h-3 w-3" />, text: 'Réservé' }
  }

  // Fonction pour déterminer si un projet est en attente, approuvé ou rejeté
  const getEtapeProjet = (etape: string) => {
    switch (etape) {
      case 'financement_approuve':
        return { 
          label: 'Approuvé', 
          color: 'bg-green-100 text-green-700', 
          icon: <CheckCircle className="h-4 w-4" /> 
        }
      case 'financement_rejete':
        return { 
          label: 'Rejeté', 
          color: 'bg-red-100 text-red-700', 
          icon: <AlertCircle className="h-4 w-4" /> 
        }
      case 'comité_crédit':
        return { 
          label: 'Comité crédit', 
          color: 'bg-purple-100 text-purple-700', 
          icon: <Clock className="h-4 w-4" /> 
        }
      default:
        return { 
          label: etape, 
          color: 'bg-gray-100 text-gray-700', 
          icon: <FileText className="h-4 w-4" /> 
        }
    }
  }

const envoyerNotificationPush = async (
  userId: string,
  titre: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' | 'paiement' | 'document' | 'validation' | 'decision' = 'info',
  projetId?: number,
  url?: string
) => {
  if (!userId) return false

  try {
    // Sauvegarder dans la base de données
    const { error: dbError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: type,
        titre: titre,
        message: message,
        lien: url || null,
        projet_id: projetId || null,
        icone: type === 'decision' ? 'CheckCircle' : type === 'success' ? 'CheckCircle' : 'Bell',
        est_lue: false
      })

    if (dbError) {
      console.error('Erreur sauvegarde notification:', dbError)
    }

    // Envoyer notification push
    const response = await fetch('/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({
        userId: userId,
        notification: {
          title: titre,
          body: message,
          url: url || '/dashboard',
          type: type,
          projetId: projetId,
          requireInteraction: type === 'decision' || type === 'error',
          vibrate: [200, 100, 200]
        }
      })
    })

    return response.ok
  } catch (error) {
    console.error('Erreur envoi notification:', error)
    return false
  }
}


const soumettreDecision = async () => {
  if (!selectedProjet || !user) return
  
  if (!decisionFinale) {
    setError('Veuillez choisir une décision')
    return
  }

  setSubmitting(true)
  setError('')

  try {
    // 1. Mettre à jour le rapport avec la décision du comité
    const { error: rapportError } = await supabase
      .from('rapport_analyse')
      .update({
        decision: decisionFinale,
        commentaire_global: commentaireComite || null,
        recommandations: conditions || null,
        statut: 'valide_comite',
        date_decision: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('projet_id', selectedProjet.id)

    if (rapportError) throw rapportError

    // 2. Mettre à jour l'étape du projet selon la décision
    const nouvelleEtape = decisionFinale === 'favorable' ? 'financement_approuve' : 'financement_rejete'
    
    const { error: projetError } = await supabase
      .from('projets_fpi')
      .update({
        etape: nouvelleEtape,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedProjet.id)

    if (projetError) throw projetError

    // 3. Enregistrer la décision du comité
    const { error: comiteError } = await supabase
      .from('decisions_comite')
      .insert({
        projet_id: selectedProjet.id,
        membre_id: user.id,
        decision: decisionFinale,
        montant_approuve: montantApprouve,
        conditions: conditions || null,
        commentaire: commentaireComite || null,
        date_reunion: dateReunion,
        created_at: new Date().toISOString()
      })

    if (comiteError) {
      console.error('Erreur enregistrement décision comité:', comiteError)
    }

    // 4. Envoyer notification au promoteur
    if (selectedProjet.promoteur_id) {
      const promoteurId = selectedProjet.promoteur_id.toString()
      
      let titreNotif = ''
      let messageNotif = ''
      let typeNotif: 'success' | 'warning' | 'error' | 'info' = 'info'
      
      if (decisionFinale === 'favorable') {
        titreNotif = '🎉 Félicitations ! Projet approuvé'
        messageNotif = `Votre projet "${selectedProjet.nom_projet}" a été approuvé par le comité de crédit. Montant approuvé: ${formatMontant(montantApprouve || selectedProjet.montant_sollicite || 0)}`
        typeNotif = 'success'
      } else if (decisionFinale === 'defavorable') {
        titreNotif = '📋 Décision du comité - Projet non retenu'
        messageNotif = `Votre projet "${selectedProjet.nom_projet}" n'a pas été retenu par le comité de crédit. Motif: ${commentaireComite || 'Non spécifié'}`
        typeNotif = 'error'
      } else {
        titreNotif = '⏸️ Décision du comité - Projet ajourné'
        messageNotif = `Votre projet "${selectedProjet.nom_projet}" a été ajourné par le comité de crédit. ${conditions ? `Conditions: ${conditions}` : ''}`
        typeNotif = 'warning'
      }
      
      await envoyerNotificationPush(
        promoteurId,
        titreNotif,
        messageNotif,
        typeNotif,
        selectedProjet.id,
        '/dashboard'
      )
      
      // ✅ ENVOI D'EMAIL AU PROMOTEUR VIA L'API
      if (selectedProjet.promoteur_email) {
        try {
          const response = await fetch('/api/send-decision-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              decision: decisionFinale,
              email: selectedProjet.promoteur_email,
              nomPromoteur: selectedProjet.promoteur_nom_complet,
              nomProjet: selectedProjet.nom_projet,
              montantApprouve: montantApprouve || selectedProjet.montant_sollicite || 0,
              commentaireComite: commentaireComite || undefined,
              conditions: conditions || undefined,
            }),
          })

          const result = await response.json()
          
          if (result.success) {
            console.log('✅ Email envoyé au promoteur avec succès')
          } else {
            console.error('❌ Erreur API email:', result.error)
          }
        } catch (emailError) {
          console.error('❌ Erreur lors de l\'envoi de l\'email au promoteur:', emailError)
          // On ne bloque pas le processus si l'email échoue
        }
      } else {
        console.log('⚠️ Aucun email promoteur trouvé, email non envoyé')
      }
    }

    // 5. Envoyer notification au service technique
    if (rapport?.technicien_id) {
      const technicienId = rapport.technicien_id.toString()
      
      let messageTechnicien = ''
      
      if (decisionFinale === 'favorable') {
        messageTechnicien = `Le comité a validé votre rapport d'analyse pour le projet "${selectedProjet.nom_projet}". Projet approuvé.`
      } else if (decisionFinale === 'defavorable') {
        messageTechnicien = `Le comité a rejeté le projet "${selectedProjet.nom_projet}" que vous avez analysé.`
      } else {
        messageTechnicien = `Le comité a ajourné le projet "${selectedProjet.nom_projet}" que vous avez analysé.`
      }
      
      await envoyerNotificationPush(
        technicienId,
        '📋 Décision du comité de crédit',
        messageTechnicien,
        'decision',
        selectedProjet.id,
        '/dashboard'
      )
    }

    setSuccess(`✅ Décision ${decisionFinale === 'favorable' ? 'd\'approbation' : decisionFinale === 'defavorable' ? 'de rejet' : 'd\'ajournement'} enregistrée avec succès ! Un email a été envoyé au promoteur.`)
    
    setTimeout(() => {
      setShowDecisionModal(false)
      chargerProjetsComite()
      if (showDetailModal) setShowDetailModal(false)
    }, 2500)

  } catch (err: any) {
    console.error('Erreur:', err)
    setError(err.message || 'Erreur lors de l\'enregistrement')
  } finally {
    setSubmitting(false)
  }
}

// const soumettreDecision = async () => {
//   if (!selectedProjet || !user) return
  
//   if (!decisionFinale) {
//     setError('Veuillez choisir une décision')
//     return
//   }

//   setSubmitting(true)
//   setError('')

//   try {
//     // 1. Mettre à jour le rapport avec la décision du comité
//     const { error: rapportError } = await supabase
//       .from('rapport_analyse')
//       .update({
//         decision: decisionFinale,
//         commentaire_global: commentaireComite || null,
//         recommandations: conditions || null,
//         statut: 'valide_comite',
//         date_decision: new Date().toISOString(),
//         updated_at: new Date().toISOString()
//       })
//       .eq('projet_id', selectedProjet.id)

//     if (rapportError) throw rapportError

//     // 2. Mettre à jour l'étape du projet selon la décision
//     const nouvelleEtape = decisionFinale === 'favorable' ? 'financement_approuve' : 'financement_rejete'
    
//     const { error: projetError } = await supabase
//       .from('projets_fpi')
//       .update({
//         etape: nouvelleEtape,
//         updated_at: new Date().toISOString()
//       })
//       .eq('id', selectedProjet.id)

//     if (projetError) throw projetError

//     // 3. Enregistrer la décision du comité
//     const { error: comiteError } = await supabase
//       .from('decisions_comite')
//       .insert({
//         projet_id: selectedProjet.id,
//         membre_id: user.id,
//         decision: decisionFinale,
//         montant_approuve: montantApprouve,
//         conditions: conditions || null,
//         commentaire: commentaireComite || null,
//         date_reunion: dateReunion,
//         created_at: new Date().toISOString()
//       })

//     if (comiteError) {
//       console.error('Erreur enregistrement décision comité:', comiteError)
//     }

//     // ✅🆕 4. Envoyer notification au promoteur
//     if (selectedProjet.promoteur_id) {
//       const promoteurId = selectedProjet.promoteur_id.toString();
      
//       let titreNotif = '';
//       let messageNotif = '';
//       let typeNotif: 'success' | 'warning' | 'error' | 'info' = 'info';
//       if (decisionFinale === 'favorable') {
//         titreNotif = '🎉 Félicitations ! Projet approuvé';
//         messageNotif = `Votre projet "${selectedProjet.nom_projet}" a été approuvé par le comité de crédit. Montant approuvé: ${formatMontant(montantApprouve || selectedProjet.montant_sollicite || 0)}`;
//         typeNotif = 'success';
//       } else if (decisionFinale === 'defavorable') {
//         titreNotif = '📋 Décision du comité - Projet non retenu';
//         messageNotif = `Votre projet "${selectedProjet.nom_projet}" n'a pas été retenu par le comité de crédit. Motif: ${commentaireComite || 'Non spécifié'}`;
//         typeNotif = 'error';
//       } else {
//         titreNotif = '⏸️ Décision du comité - Projet ajourné';
//         messageNotif = `Votre projet "${selectedProjet.nom_projet}" a été ajourné par le comité de crédit. ${conditions ? `Conditions: ${conditions}` : ''}`;
//         typeNotif = 'warning';
//       }
      
//       await envoyerNotificationPush(
//         promoteurId,
//         titreNotif,
//         messageNotif,
//         typeNotif,
//         selectedProjet.id,
//         '/dashboard'
//       );
//     }

//     // ✅🆕 5. Envoyer notification au service technique
//     if (rapport?.technicien_id) {
//       const technicienId = rapport.technicien_id.toString();
      
//       let messageTechnicien = '';
//       if (decisionFinale === 'favorable') {
//         messageTechnicien = `Le comité a validé votre rapport d'analyse pour le projet "${selectedProjet.nom_projet}". Projet approuvé.`;
//       } else if (decisionFinale === 'defavorable') {
//         messageTechnicien = `Le comité a rejeté le projet "${selectedProjet.nom_projet}" que vous avez analysé.`;
//       } else {
//         messageTechnicien = `Le comité a ajourné le projet "${selectedProjet.nom_projet}" que vous avez analysé.`;
//       }
      
//       await envoyerNotificationPush(
//         technicienId,
//         '📋 Décision du comité de crédit',
//         messageTechnicien,
//         'decision',
//         selectedProjet.id,
//         '/dashboard'
//       );
//     }

//     setSuccess(`✅ Décision ${decisionFinale === 'favorable' ? 'd\'approbation' : 'de rejet'} enregistrée avec succès !`)
    
//     setTimeout(() => {
//       setShowDecisionModal(false)
//       chargerProjetsComite()
//       if (showDetailModal) setShowDetailModal(false)
//     }, 2000)

//   } catch (err: any) {
//     console.error('Erreur:', err)
//     setError(err.message || 'Erreur lors de l\'enregistrement')
//   } finally {
//     setSubmitting(false)
//   }
// }


  // Utilisation du composant PDF externe
  const telechargerRapportPDF = async () => {
    if (!selectedProjet || !rapport) return

    // Import dynamique du générateur PDF
    const { generateRapportPDF } = await import('@/components/PDFGenerator')
    
    const pdfData = {
      nomProjet: selectedProjet.nom_projet,
      promoteurNom: selectedProjet.promoteur_nom_complet,
      montantSollicite: formatMontant(selectedProjet.montant_sollicite || 0),
      dateSoumission: selectedProjet.created_at,
      notes: {
        faisabilite: rapport.note_faisabilite || 0,
        impact: rapport.note_impact || 0,
        finance: rapport.note_finance || 0,
        equipe: rapport.note_equipe || 0,
        marche: rapport.note_marche || 0,
      },
      commentaires: {
        faisabilite: rapport.commentaire_faisabilite || '-',
        impact: rapport.commentaire_impact || '-',
        finance: rapport.commentaire_finance || '-',
        equipe: rapport.commentaire_equipe || '-',
        marche: rapport.commentaire_marche || '-',
      },
      decision: rapport.decision || 'reserve',
      commentaireGlobal: rapport.commentaire_global || 'Aucun commentaire',
      recommandations: rapport.recommandations || '',
      logoUrl: '/logo.png'
    }

    await generateRapportPDF(pdfData)
  }

  const formatMontant = (m: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(m)

  const formatDate = (d: string) => 
    new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

  const projetsFiltres = projets.filter(p => 
    p.nom_projet.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.promoteur_nom_complet.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calcul des statistiques
  const statsEnAttente = projets.filter(p => p.etape === 'comité_crédit').length
  const statsApprouves = projets.filter(p => p.etape === 'financement_approuve').length
  const statsRejetes = projets.filter(p => p.etape === 'financement_rejete').length
  const statsAvisFavorable = projets.filter(p => p.rapport_decision === 'favorable').length
  const statsAvisDefavorable = projets.filter(p => p.rapport_decision === 'defavorable').length
  const montantTotal = projets.reduce((sum, p) => sum + (p.montant_sollicite || 0), 0)

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un projet ou promoteur..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white  p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Clock className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-2xl font-bold">{statsEnAttente}</p>
                <p className="text-xs text-gray-500">En attente</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded- p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-2xl font-bold">{statsApprouves}</p>
                <p className="text-xs text-gray-500">Approuvés</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded- p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg"><AlertCircle className="h-5 w-5 text-red-600" /></div>
              <div>
                <p className="text-2xl font-bold">{statsRejetes}</p>
                <p className="text-xs text-gray-500">Rejetés</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded- p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg"><Banknote className="h-5 w-5 text-purple-600" /></div>
              <div>
                <p className="text-2xl font-bold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0, notation: 'compact' }).format(montantTotal)}</p>
                <p className="text-xs text-gray-500">Total sollicité</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats détaillées */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-white roundel p-3 border flex items-center gap-3">
            <ThumbsUp className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-lg font-bold">{statsAvisFavorable}</p>
              <p className="text-xs text-gray-500">Avis techniques favorables</p>
            </div>
          </div>
          <div className="bg-white roundel p-3 border flex items-center gap-3">
            <ThumbsDown className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-lg font-bold">{statsAvisDefavorable}</p>
              <p className="text-xs text-gray-500">Avis techniques défavorables</p>
            </div>
          </div>
        </div>
      </div>

      {/* LISTE PROJETS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {projetsFiltres.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">Aucun dossier trouvé</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projetsFiltres.map((projet) => {
              const decisionBadge = getDecisionBadge(projet.rapport_decision)
              const etapeInfo = getEtapeProjet(projet.etape)
              const isTermine = projet.etape === 'financement_approuve' || projet.etape === 'financement_rejete'
              
              return (
                <div key={projet.id} className="bg-white rounded- border p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-base font-semibold text-gray-900">{projet.nom_projet}</h3>
                        
                        {/* Badge de l'étape */}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${etapeInfo.color}`}>
                          {etapeInfo.icon} {etapeInfo.label}
                        </span>
                        
                        {/* Badge de l'avis technique */}
                        {projet.rapport_decision && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${decisionBadge.color}`}>
                            {decisionBadge.icon} {decisionBadge.text}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {projet.promoteur_nom_complet}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(projet.created_at)}</span>
                        {projet.montant_sollicite && (
                          <span className="font-semibold text-gray-700">{formatMontant(projet.montant_sollicite)}</span>
                        )}
                        {projet.secteur_activite && (
                          <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {projet.secteur_activite}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => ouvrirDetail(projet)}
                        className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" /> Consulter
                      </button>
                      
                      {/* Afficher le bouton Décision uniquement pour les projets en attente */}
                      {!isTermine && (
                        <button
                          onClick={() => ouvrirDecision(projet)}
                          className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-1"
                        >
                          <ShieldCheck className="h-3 w-3" /> Décision
                        </button>
                      )}
                      
                      {/* Pour les projets terminés, afficher le statut final */}
                      {isTermine && (
                        <span className={`px-3 py-1.5 text-xs rounded-lg ${
                          projet.etape === 'financement_approuve' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {projet.etape === 'financement_approuve' ? '✅ Approuvé' : '❌ Rejeté'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* MODAL DÉTAIL PROJET */}
      {showDetailModal && selectedProjet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">{selectedProjet.nom_projet}</h2>
              <div className="flex items-center gap-2">
                {rapport && (
                  <button
                    onClick={telechargerRapportPDF}
                    className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" /> PDF
                  </button>
                )}
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              {loadingRapport ? (
                <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
              ) : (
                <>
                  {/* Infos projet */}
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4">
                    <div><p className="text-xs text-gray-500">Promoteur</p><p className="text-sm font-medium">{selectedProjet.promoteur_nom_complet}</p></div>
                    <div><p className="text-xs text-gray-500">Email</p><p className="text-sm">{selectedProjet.promoteur_email || '-'}</p></div>
                    <div><p className="text-xs text-gray-500">Téléphone</p><p className="text-sm">{selectedProjet.promoteur_telephone || '-'}</p></div>
                    <div><p className="text-xs text-gray-500">Date dépôt</p><p className="text-sm">{formatDate(selectedProjet.created_at)}</p></div>
                    <div><p className="text-xs text-gray-500">Montant sollicité</p><p className="text-sm font-semibold text-primary">{formatMontant(selectedProjet.montant_sollicite || 0)}</p></div>
                    <div><p className="text-xs text-gray-500">Secteur</p><p className="text-sm">{selectedProjet.secteur_activite || '-'}</p></div>
                    {selectedProjet.nom_entite && <div><p className="text-xs text-gray-500">Entité</p><p className="text-sm">{selectedProjet.nom_entite}</p></div>}
                    {selectedProjet.localisation_projet && <div><p className="text-xs text-gray-500">Localisation</p><p className="text-sm">{selectedProjet.localisation_projet}</p></div>}
                    <div>
                      <p className="text-xs text-gray-500">Statut</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        selectedProjet.etape === 'financement_approuve' ? 'bg-green-100 text-green-700' :
                        selectedProjet.etape === 'financement_rejete' ? 'bg-red-100 text-red-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {getEtapeProjet(selectedProjet.etape).icon} {getEtapeProjet(selectedProjet.etape).label}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedProjet.description_projet && (
                    <div><h3 className="text-sm font-semibold mb-2">Description</h3><p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">{selectedProjet.description_projet}</p></div>
                  )}

                  {/* Rapport technique */}
                  {rapport ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold flex items-center gap-2"><FileCheck className="h-4 w-4 text-primary" /> Rapport d'analyse technique</h3>
                        <button onClick={telechargerRapportPDF} className="text-xs text-primary hover:underline flex items-center gap-1"><Download className="h-3 w-3" /> Télécharger PDF</button>
                      </div>

                      {/* Notes */}
                      <div className="grid grid-cols-5 gap-2">
                        {CRITERES.map(c => {
                          const note = rapport[`note_${c.key}` as keyof RapportAnalyse] as number || 0
                          return (
                            <div key={c.key} className={`text-center p-2 rounded-xl ${getNoteColor(note)}`}>
                              <span className="text-lg">{c.icon}</span>
                              <p className="text-xl font-bold">{note || '-'}</p>
                              <p className="text-[10px]">{c.label.split(' ')[0]}</p>
                            </div>
                          )
                        })}
                      </div>

                      <div className="text-center py-3 bg-primary/5 rounded-xl">
                        <span className="text-sm text-gray-500">Note globale</span>
                        <p className="text-3xl font-bold text-primary">{calculerNoteTotale().toFixed(1)}<span className="text-lg">/5</span></p>
                      </div>

                      {/* Avis technique */}
                      <div className={`rounded-xl p-4 border-l-4 ${rapport.decision === 'favorable' ? 'border-green-500 bg-green-50' : rapport.decision === 'defavorable' ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold">Avis du service technique :</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rapport.decision === 'favorable' ? 'bg-green-200 text-green-800' : rapport.decision === 'defavorable' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'}`}>
                            {rapport.decision === 'favorable' ? 'FAVORABLE' : rapport.decision === 'defavorable' ? 'DÉFAVORABLE' : 'RÉSERVÉ'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{rapport.commentaire_global || 'Aucun commentaire'}</p>
                        {rapport.recommandations && <p className="text-sm text-gray-600 mt-2"><strong>Recommandations :</strong> {rapport.recommandations}</p>}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-yellow-50 rounded-xl"><AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" /><p className="text-sm text-yellow-700">Aucun rapport d'analyse disponible</p></div>
                  )}

                  {/* Bouton décision - seulement si en attente */}
                  {selectedProjet.etape === 'comité_crédit' && (
                    <button onClick={() => ouvrirDecision(selectedProjet)} className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 flex items-center justify-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> Prendre une décision
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DÉCISION COMITÉ */}
      {showDecisionModal && selectedProjet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Décision du Comité</h2>
                <button onClick={() => setShowDecisionModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
              </div>
              <p className="text-sm text-gray-500 mt-1">{selectedProjet.nom_projet}</p>
            </div>

            <div className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> {success}
                </div>
              )}

              {/* Décision */}
              <div>
                <label className="block text-sm font-medium mb-2">Décision finale</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecisionFinale('favorable')}
                    className={`py-2.5 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition-all ${
                      decisionFinale === 'favorable' 
                        ? 'bg-green-500 text-white border-green-500 shadow-md' 
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" /> Approuver
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionFinale('reserve')}
                    className={`py-2.5 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition-all ${
                      decisionFinale === 'reserve' 
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md' 
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <Minus className="h-4 w-4" /> Ajourner
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionFinale('defavorable')}
                    className={`py-2.5 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition-all ${
                      decisionFinale === 'defavorable' 
                        ? 'bg-red-500 text-white border-red-500 shadow-md' 
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <ThumbsDown className="h-4 w-4" /> Rejeter
                  </button>
                </div>
              </div>

              {/* Montant approuvé (si favorable) */}
              {decisionFinale === 'favorable' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Montant approuvé (USD)</label>
                  <input
                    type="number"
                    value={montantApprouve || ''}
                    onChange={(e) => setMontantApprouve(Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder={selectedProjet.montant_sollicite?.toString()}
                  />
                  <p className="text-xs text-gray-400 mt-1">Montant sollicité : {formatMontant(selectedProjet.montant_sollicite || 0)}</p>
                </div>
              )}

              {/* Conditions */}
              <div>
                <label className="block text-sm font-medium mb-1">Conditions / Réserves</label>
                <textarea
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Ex: Justificatifs supplémentaires, garanties, etc."
                />
              </div>

              {/* Commentaire */}
              <div>
                <label className="block text-sm font-medium mb-1">Commentaire du comité</label>
                <textarea
                  value={commentaireComite}
                  onChange={(e) => setCommentaireComite(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Motif de la décision, observations..."
                />
              </div>

              {/* Date réunion */}
              <div>
                <label className="block text-sm font-medium mb-1">Date de la réunion</label>
                <input
                  type="date"
                  value={dateReunion}
                  onChange={(e) => setDateReunion(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Récapitulatif */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-2">Récapitulatif</p>
                <div className="space-y-1 text-sm">
                  <p><strong>Projet :</strong> {selectedProjet.nom_projet}</p>
                  <p><strong>Promoteur :</strong> {selectedProjet.promoteur_nom_complet}</p>
                  <p><strong>Montant sollicité :</strong> {formatMontant(selectedProjet.montant_sollicite || 0)}</p>
                  {/* <p><strong>Avis technique :</strong> {rapport?.decision === 'favorable' ? '✅ Favorable' : rapport?.decision === 'defavorable' ? '❌ Défavorable' : '⏸️ Réservé'}</p> */}
                  {rapport && <p><strong>Note technique :</strong> {calculerNoteTotale().toFixed(1)}/5</p>}
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowDecisionModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm">Annuler</button>
                <button onClick={soumettreDecision} disabled={submitting} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Validation...</> : <><Send className="h-4 w-4" /> Valider la décision</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}