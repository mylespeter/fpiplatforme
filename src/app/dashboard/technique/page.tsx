

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { usePushNotifications } from '@/context/PushNotificationContext'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'
import ServiceTechniqueHeader from './ServiceTechniqueHeader'
import ProjetsList from './ProjetsList'
import ProjetDetailModal from './ProjetDetailModal'
import RapportAnalyseModal from './RapportAnalyseModal'
import { generateRapportPDF } from '@/components/PDFGenerator';
// ============================================
// LOGO - Placez votre logo ici (URL ou chemin)
// ============================================
const LOGO_URL = "/logo.png"

// ============================================
// FONCTION D'ENVOI DE NOTIFICATION PUSH
// ============================================
const envoyerNotificationPush = async (
  userId: number | null | undefined,
  titre: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' | 'paiement' | 'document' | 'validation' | 'decision' = 'info',
  projetId?: number,
  url?: string
) => {
  if (!userId) return false

  try {
    const { error: dbError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId.toString(),
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

    const response = await fetch('/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId.toString()
      },
      body: JSON.stringify({
        userId: userId.toString(),
        notification: {
          title: titre,
          body: message,
          url: url || '/dashboard/promoteur',
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

// ============================================
// TYPES
// ============================================
type ProjetATraiter = {
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
  promoteur_id: number | null
}

type DocumentProjet = {
  id: number
  type_document: string
  chemin_fichier: string
  nom_fichier: string | null
}

type RapportExistant = {
  id: number
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
  technicien_id: number | null
  date_consultation: string | null
  date_verification: string | null
  date_analyse: string | null
  date_decision: string | null
}

// ============================================
// LOGGER
// ============================================
const LOG_PREFIX = '[ServiceTech]'
const log = {
  info: (msg: string, data?: any) => console.log(`${LOG_PREFIX} ℹ️ ${msg}`, data !== undefined ? data : ''),
  success: (msg: string, data?: any) => console.log(`${LOG_PREFIX} ✅ ${msg}`, data !== undefined ? data : ''),
  error: (msg: string, data?: any) => console.error(`${LOG_PREFIX} ❌ ${msg}`, data !== undefined ? data : ''),
  warn: (msg: string, data?: any) => console.warn(`${LOG_PREFIX} ⚠️ ${msg}`, data !== undefined ? data : ''),
  db: (operation: string, table: string, data?: any) => console.log(`${LOG_PREFIX} 🗄️ DB ${operation} -> ${table}`, data !== undefined ? data : ''),
  state: (stateName: string, value: any) => console.log(`${LOG_PREFIX} 📦 State [${stateName}]:`, value)
}




// Ajoute cette fonction dans ServiceTechniquePage.tsx, après demarrerConsultation

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function ServiceTechniquePage() {
  const { user } = useAuth()
  const { isSubscribed } = usePushNotifications()
  
  // États
  const [projets, setProjets] = useState<ProjetATraiter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [consultingId, setConsultingId] = useState<number | null>(null) // Loading state pour le bouton Consulter
  
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedProjet, setSelectedProjet] = useState<ProjetATraiter | null>(null)
  const [documents, setDocuments] = useState<DocumentProjet[]>([])
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [rapportComplet, setRapportComplet] = useState<RapportExistant | null>(null)
  
  const [showRapportModal, setShowRapportModal] = useState(false)
  const [etapeActuelle, setEtapeActuelle] = useState(1)
  
  const [dossierComplet, setDossierComplet] = useState<boolean | null>(null)
  const [documentsManquants, setDocumentsManquants] = useState('')
  
  const [notes, setNotes] = useState<Record<string, number>>({})
  const [commentaires, setCommentaires] = useState<Record<string, string>>({})
  
  const [decision, setDecision] = useState('')
  const [commentaireGlobal, setCommentaireGlobal] = useState('')
  const [recommandations, setRecommandations] = useState('')
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Constantes
  const CRITERES = [
    { key: 'faisabilite', label: 'Faisabilité technique', icon: '🔧' },
    { key: 'impact', label: 'Impact socio-économique', icon: '📈' },
    { key: 'finance', label: 'Viabilité financière', icon: '💰' },
    { key: 'equipe', label: 'Qualité de l\'équipe', icon: '👥' },
    { key: 'marche', label: 'Potentiel du marché', icon: '🎯' }
  ]

  // ============================================
  // FONCTIONS UTILITAIRES
  // ============================================
  const formatMontant = (m: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(m)

  const formatDate = (d: string) => 
    new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

  const getDocTypeName = (type: string) => {
    const names: Record<string, string> = {
      'carte_electeur': 'Carte d\'électeur',
      'rccm': 'RCCM',
      'id_nat': 'ID National',
      'attestation_fiscale': 'Attestation fiscale',
      'attestation_cnss': 'Attestation CNSS',
      'plan_affaires': 'Plan d\'affaires',
      'etude_faisabilite': 'Étude de faisabilité'
    }
    return names[type] || type
  }

  const getNoteColor = (note: number): string => {
    if (note <= 2) return 'bg-red-500'
    if (note === 3) return 'bg-orange-500'
    if (note === 4) return 'bg-green-500'
    return 'bg-emerald-500'
  }

  const calculerNoteTotale = (): number => {
    const valeurs = CRITERES.map(c => notes[c.key] || 0)
    const somme = valeurs.reduce((a: number, b: number) => a + b, 0)
    const toutesRemplies = valeurs.every(n => n > 0)
    return toutesRemplies ? somme / CRITERES.length : 0
  }
const reconsulterProjet = async (projet: ProjetATraiter) => {
  if (!user) return
  
  setConsultingId(projet.id)
  
  try {
    // Charger les détails du projet et le rapport existant
    await chargerDetailsProjet(projet.id)
    setSelectedProjet(projet)
    
    // Déterminer l'étape actuelle du rapport
    if (rapportComplet) {
      if (rapportComplet.statut === 'transmis') {
        setEtapeActuelle(4)
      } else if (rapportComplet.note_faisabilite && rapportComplet.note_faisabilite > 0) {
        setEtapeActuelle(3)
      } else if (rapportComplet.dossier_complet !== null) {
        setEtapeActuelle(2)
      } else {
        setEtapeActuelle(1)
      }
      
      setDossierComplet(rapportComplet.dossier_complet ?? null)
      setDocumentsManquants(rapportComplet.documents_manquants || '')
      setDecision(rapportComplet.decision || '')
      setCommentaireGlobal(rapportComplet.commentaire_global || '')
      setRecommandations(rapportComplet.recommandations || '')
    } else {
      setEtapeActuelle(1)
    }
    
    setError('')
    setSuccess('')
    setShowRapportModal(true)
    
  } catch (err: any) {
    log.error('Erreur lors de la reconsultation:', err)
    setError(err.message || 'Erreur lors de la reconsultation')
  } finally {
    setConsultingId(null)
  }
}
  const peutPasserEtapeSuivante = (): boolean => {
    if (etapeActuelle === 1) return true
    if (etapeActuelle === 2) return dossierComplet !== null
    if (etapeActuelle === 3) {
      const notesManquantes = CRITERES.filter(c => !notes[c.key] || notes[c.key] <= 0)
      return notesManquantes.length === 0
    }
    if (etapeActuelle === 4) return decision !== '' && commentaireGlobal.trim() !== ''
    return false
  }

  // ============================================
  // FONCTIONS API
  // ============================================
  useEffect(() => {
    if (user) chargerProjets()
  }, [user])

  const chargerProjets = async () => {
    setLoading(true)
    const { data, error: errProjets } = await supabase
      .from('projets_fpi')
      .select('*')
      .order('created_at', { ascending: false })

    if (errProjets) {
      log.error('Erreur chargement projets:', errProjets)
      setLoading(false)
      return
    }

    if (data && data.length > 0) {
      const projetIds = data.map((p: any) => p.id)
      const { data: rapports } = await supabase
        .from('rapport_analyse')
        .select('*')
        .in('projet_id', projetIds)

      const projetsMapped: ProjetATraiter[] = data.map((projet: any) => {
        const rapport = (rapports || []).find((r: any) => r.projet_id === projet.id)
        return {
          ...projet,
          rapport_id: rapport?.id || null,
          rapport_statut: rapport?.statut || null,
          rapport_decision: rapport?.decision || null
        }
      })
      setProjets(projetsMapped)
    } else {
      setProjets([])
    }
    setLoading(false)
  }

  const chargerDetailsProjet = async (projetId: number) => {
    setLoadingDocs(true)
    const { data: docs } = await supabase
      .from('documents_fpi')
      .select('*')
      .eq('projet_id', projetId)
    if (docs) setDocuments(docs)
    
    const { data: rapport } = await supabase
      .from('rapport_analyse')
      .select('*')
      .eq('projet_id', projetId)
      .maybeSingle()
    
    if (rapport) {
      setRapportComplet(rapport as RapportExistant)
      setNotes({
        faisabilite: rapport.note_faisabilite || 0,
        impact: rapport.note_impact || 0,
        finance: rapport.note_finance || 0,
        equipe: rapport.note_equipe || 0,
        marche: rapport.note_marche || 0
      })
      setCommentaires({
        faisabilite: rapport.commentaire_faisabilite || '',
        impact: rapport.commentaire_impact || '',
        finance: rapport.commentaire_finance || '',
        equipe: rapport.commentaire_equipe || '',
        marche: rapport.commentaire_marche || ''
      })
      setDecision(rapport.decision || '')
      setCommentaireGlobal(rapport.commentaire_global || '')
      setRecommandations(rapport.recommandations || '')
      setDossierComplet(rapport.dossier_complet ?? null)
      setDocumentsManquants(rapport.documents_manquants || '')
    } else {
      setRapportComplet(null)
      // Réinitialiser les états si pas de rapport
      setNotes({})
      setCommentaires({})
      setDecision('')
      setCommentaireGlobal('')
      setRecommandations('')
      setDossierComplet(null)
      setDocumentsManquants('')
    }
    setLoadingDocs(false)
  }

  const ouvrirDetail = async (projet: ProjetATraiter) => {
    setSelectedProjet(projet)
    setShowDetailModal(true)
    await chargerDetailsProjet(projet.id)
  }

  const demarrerConsultation = async (projet: ProjetATraiter) => {
    if (!user) return
    
    // Activer le loading state
    setConsultingId(projet.id)
    
    try {
      // Si le projet est déjà à l'étape comité_crédit, on ouvre simplement le détail
      if (projet.etape === 'comité_crédit') {
        await ouvrirDetail(projet)
        return
      }
      
      // Vérifier si un rapport existe déjà
      const { data: existingRapport } = await supabase
        .from('rapport_analyse')
        .select('*')
        .eq('projet_id', projet.id)
        .maybeSingle()

      // Mettre à jour l'étape du projet si nécessaire
      if (projet.etape !== 'analyse_tech') {
        await supabase
          .from('projets_fpi')
          .update({ etape: 'analyse_tech', updated_at: new Date().toISOString() })
          .eq('id', projet.id)
      }

      // Créer un rapport seulement s'il n'existe pas
      if (!existingRapport) {
        await supabase
          .from('rapport_analyse')
          .insert({
            projet_id: projet.id,
            technicien_id: user.id,
            date_consultation: new Date().toISOString(),
            statut: 'analyse'
          })
        
        // 🔔 Notification seulement pour un nouveau rapport
        await envoyerNotificationPush(
          projet.promoteur_id,
          '🔧 Analyse technique en cours',
          `Votre projet "${projet.nom_projet}" est actuellement en analyse technique. Un technicien examine votre dossier.`,
          'info',
          projet.id,
          '/dashboard/promoteur'
        )
      }

      setSelectedProjet({ ...projet, etape: 'analyse_tech' })
      await chargerDetailsProjet(projet.id)
      
      // Déterminer l'étape actuelle du rapport
      if (existingRapport) {
        if (existingRapport.statut === 'transmis') {
          setEtapeActuelle(4)
        } else if (existingRapport.note_faisabilite && existingRapport.note_faisabilite > 0) {
          setEtapeActuelle(3)
        } else if (existingRapport.dossier_complet !== null) {
          setEtapeActuelle(2)
        } else {
          setEtapeActuelle(1)
        }
      } else {
        setEtapeActuelle(1)
      }
      
      setError('')
      setSuccess('')
      setShowRapportModal(true)
      await chargerProjets()
      
    } catch (err: any) {
      log.error('Erreur lors du démarrage:', err)
      setError(err.message || 'Erreur lors du démarrage')
    } finally {
      setConsultingId(null)
    }
  }

  const handleNoteChange = (critere: string, note: number) => {
    setNotes((prev: Record<string, number>) => ({ ...prev, [critere]: note }))
  }

  const handleCommentaireChange = (critere: string, commentaire: string) => {
    setCommentaires((prev: Record<string, string>) => ({ ...prev, [critere]: commentaire }))
  }

  const soumettreRapport = async (rapportData: {
    projet_id?: number;
    dossier_complet: boolean | null;
    documents_manquants: string | null;
    notes: Record<string, number>;
    commentaires: Record<string, string>;
    decision: string;
    commentaire_global: string;
    recommandations: string;
  }) => {
    if (!selectedProjet || !user) return

    setSaving(true)
    setError('')

    try {
      const dataToSave = {
        projet_id: selectedProjet.id,
        technicien_id: user.id,
        dossier_complet: rapportData.dossier_complet,
        documents_manquants: rapportData.dossier_complet ? null : rapportData.documents_manquants,
        date_verification: new Date().toISOString(),
        note_faisabilite: rapportData.notes.faisabilite || null,
        note_impact: rapportData.notes.impact || null,
        note_finance: rapportData.notes.finance || null,
        note_equipe: rapportData.notes.equipe || null,
        note_marche: rapportData.notes.marche || null,
        commentaire_faisabilite: rapportData.commentaires.faisabilite || null,
        commentaire_impact: rapportData.commentaires.impact || null,
        commentaire_finance: rapportData.commentaires.finance || null,
        commentaire_equipe: rapportData.commentaires.equipe || null,
        commentaire_marche: rapportData.commentaires.marche || null,
        decision: rapportData.decision,
        commentaire_global: rapportData.commentaire_global,
        recommandations: rapportData.recommandations || null,
        date_decision: new Date().toISOString(),
        statut: 'transmis',
        updated_at: new Date().toISOString()
      }

      console.log('📦 Données à sauvegarder:', dataToSave)

      const { data: existingRapport } = await supabase
        .from('rapport_analyse')
        .select('id')
        .eq('projet_id', selectedProjet.id)
        .maybeSingle()

      if (existingRapport) {
        const { error } = await supabase
          .from('rapport_analyse')
          .update(dataToSave)
          .eq('id', existingRapport.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('rapport_analyse')
          .insert(dataToSave)
        
        if (error) throw error
      }

      await supabase
        .from('projets_fpi')
        .update({ etape: 'comité_crédit', updated_at: new Date().toISOString() })
        .eq('id', selectedProjet.id)

      const decisionMessage = rapportData.decision === 'favorable' 
        ? '✅ Votre projet a reçu un avis FAVORABLE du service technique. Il va maintenant être examiné par le comité de crédit.'
        : rapportData.decision === 'defavorable'
        ? '❌ Votre projet a reçu un avis DÉFAVORABLE du service technique. Veuillez consulter le rapport pour plus de détails.'
        : '⏸️ Votre projet a reçu un avis RÉSERVÉ du service technique. Des informations complémentaires sont nécessaires.'

      await envoyerNotificationPush(
        selectedProjet.promoteur_id,
        `📋 Décision technique - ${selectedProjet.nom_projet}`,
        decisionMessage,
        'decision',
        selectedProjet.id,
        '/dashboard/promoteur'
      )

      setSuccess('✅ Rapport transmis avec succès !')
      
      setTimeout(() => {
        setShowRapportModal(false)
        chargerProjets()
      }, 2000)

    } catch (err: any) {
      console.error('Erreur:', err)
      setError(err.message || 'Erreur lors de la transmission')
    } finally {
      setSaving(false)
    }
  }


const telechargerPDF = async () => {
  if (!selectedProjet) return;
  
  const currentNotes = rapportComplet ? {
    faisabilite: rapportComplet.note_faisabilite || 0,
    impact: rapportComplet.note_impact || 0,
    finance: rapportComplet.note_finance || 0,
    equipe: rapportComplet.note_equipe || 0,
    marche: rapportComplet.note_marche || 0
  } : notes;
  
  const currentCommentaires = rapportComplet ? {
    faisabilite: rapportComplet.commentaire_faisabilite || '',
    impact: rapportComplet.commentaire_impact || '',
    finance: rapportComplet.commentaire_finance || '',
    equipe: rapportComplet.commentaire_equipe || '',
    marche: rapportComplet.commentaire_marche || ''
  } : commentaires;
  
  const currentDecision = rapportComplet?.decision || decision;
  const currentCommentaireGlobal = rapportComplet?.commentaire_global || commentaireGlobal;
  const currentRecommandations = rapportComplet?.recommandations || recommandations;
  
  try {
    await generateRapportPDF({
      nomProjet: selectedProjet.nom_projet,
      promoteurNom: selectedProjet.promoteur_nom_complet,
      montantSollicite: formatMontant(selectedProjet.montant_sollicite || 0),
      dateSoumission: formatDate(selectedProjet.created_at),
      notes: currentNotes,
      commentaires: currentCommentaires,
      decision: currentDecision,
      commentaireGlobal: currentCommentaireGlobal,
      recommandations: currentRecommandations,
      logoUrl: LOGO_URL,
    });
    
    log.success('PDF généré avec succès');
  } catch (error) {
    log.error('Erreur lors de la génération du PDF:', error);
    setError('Erreur lors de la génération du PDF. Veuillez réessayer.');
  }
};

  // Filtrage des projets
  const projetsFiltres = projets.filter((p: ProjetATraiter) => {
    return p.nom_projet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.promoteur_nom_complet.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="h-screen overflow-auto flex flex-col bg-gray-50">
      <ServiceTechniqueHeader 
        projetsCount={projets.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-6xl mx-auto">
          <ProjetsList 
            projets={projetsFiltres}
            onViewDetail={ouvrirDetail}
            onStartConsultation={demarrerConsultation}
            onReconsulter={reconsulterProjet} 
            formatDate={formatDate}
            formatMontant={formatMontant}
            consultingId={consultingId}
          />
        </div>
      </div>
      
      <ProjetDetailModal 
        projet={selectedProjet}
        documents={documents}
        rapportComplet={rapportComplet}
        notes={notes}
        isLoading={loadingDocs}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onStartRapport={() => {
          setShowDetailModal(false)
          setTimeout(() => demarrerConsultation(selectedProjet!), 200)
        }}
        onDownloadPDF={telechargerPDF}
        formatDate={formatDate}
        formatMontant={formatMontant}
        getDocTypeName={getDocTypeName}
        calculerNoteTotale={calculerNoteTotale}
      />
      
      <RapportAnalyseModal 
        projet={selectedProjet}
        documents={documents}
        rapportComplet={rapportComplet}
        isOpen={showRapportModal}
        onClose={() => setShowRapportModal(false)}
        onSubmit={soumettreRapport}
        formatMontant={formatMontant}
        getDocTypeName={getDocTypeName}
      />
    </div>
  )
}