// app/dashboard/credit/projets/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { 
  FileText, Clock, CheckCircle, XCircle, AlertCircle, 
  Loader2, Eye, X, Search, User, Calendar, DollarSign,
  Shield, Ban, Check, Send, MessageSquare, CreditCard,
  ThumbsUp, ThumbsDown
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
  frais_paye: boolean
  frais_montant: number
  frais_date_paiement: string | null
  frais_reference: string | null
  rapport_decision: string | null
  rapport_commentaire: string | null
  rapport_date: string | null
  rapport_technicien_nom: string | null
  decision_credit: string | null
  decision_credit_rapport: string | null
  decision_credit_date: string | null
  decision_credit_par: string | null
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

const ETAPE_COLORS: Record<string, string> = {
  'reçu': 'bg-blue-100 text-blue-700',
  'analyse_tech': 'bg-purple-100 text-purple-700',
  'comité_crédit': 'bg-orange-100 text-orange-700',
  'décision_rendue': 'bg-green-100 text-green-700'
}

const ETAPE_LABELS: Record<string, string> = {
  'reçu': 'Reçu',
  'analyse_tech': 'Analyse technique',
  'comité_crédit': 'Comité crédit',
  'décision_rendue': 'Décision rendue'
}

export default function CreditProjetsPage() {
  const { user } = useAuth()
  
  // États
  const [projets, setProjets] = useState<Projet[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProjet, setLoadingProjet] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDecisionModal, setShowDecisionModal] = useState(false)
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null)
  const [documents, setDocuments] = useState<DocumentUpload[]>([])
  const [loadingDetail, setLoadingDetail] = useState(false)
  
  // Décision
  const [decisionForm, setDecisionForm] = useState({
    decision: 'approuvé' as 'approuvé' | 'refusé',
    rapport_decision: ''
  })
  const [decisionLoading, setDecisionLoading] = useState(false)

  useEffect(() => {
    chargerProjets()
  }, [])

  const chargerProjets = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('vue_projets_details')
        .select('*')
        .in('etape', ['comité_crédit', 'décision_rendue'])
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
        frais_paye: item.frais_paye ?? false,
        frais_montant: item.frais_montant || 100,
        frais_date_paiement: item.frais_date_paiement || null,
        frais_reference: item.frais_reference || null,
        rapport_decision: item.rapport_decision || null,
        rapport_commentaire: item.rapport_commentaire || null,
        rapport_date: item.rapport_date || null,
        rapport_technicien_nom: item.rapport_technicien_nom || null,
        decision_credit: item.decision_credit || null,
        decision_credit_rapport: item.decision_credit_rapport || null,
        decision_credit_date: item.decision_credit_date || null,
        decision_credit_par: item.decision_credit_par || null
      })) || []

      setProjets(projetsMapped)
    } catch (error) {
      console.error('Erreur chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const chargerDocuments = async (projetId: number) => {
    setLoadingDetail(true)
    try {
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
    } catch (error) {
      console.error('Erreur documents:', error)
    } finally {
      setLoadingDetail(false)
    }
  }

  // =============================================
  // DÉCISION FINALE
  // =============================================
  const ouvrirDecision = (projet: Projet) => {
    setSelectedProjet(projet)
    setDecisionForm({
      decision: 'approuvé',
      rapport_decision: projet.decision_credit_rapport || ''
    })
    setShowDecisionModal(true)
  }

  const soumettreDecision = async () => {
    if (!selectedProjet || !user) return
    
    setDecisionLoading(true)
    setError('')

    try {
      // 1. Créer la décision
      const { error: decisionError } = await supabase
        .from('decision_credit')
        .insert({
          projet_id: selectedProjet.id,
          membre_credit_id: user.id,
          decision: decisionForm.decision,
          rapport_decision: decisionForm.rapport_decision
        })

      if (decisionError) throw decisionError

      // 2. Mettre à jour le projet
      await supabase
        .from('projets')
        .update({
          etape: 'décision_rendue',
          decision_finale: decisionForm.decision
        })
        .eq('id', selectedProjet.id)

      setShowDecisionModal(false)
      await chargerProjets()
      
      setSuccess(
        decisionForm.decision === 'approuvé' 
          ? '🎉 Projet approuvé ! Félicitations au promoteur.'
          : '❌ Projet refusé. Le promoteur sera notifié.'
      )
      
    } catch (error: any) {
      console.error('Erreur décision:', error)
      setError('Erreur lors de la décision')
    } finally {
      setDecisionLoading(false)
    }
  }

  const ouvrirDetail = async (projet: Projet) => {
    setSelectedProjet(projet)
    setLoadingProjet(projet.id)
    await chargerDocuments(projet.id)
    setShowDetailModal(true)
    setLoadingProjet(null)
  }

  const formatMontant = (m: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(m)
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

  const projetsFiltres = projets.filter(p => {
    const matchSearch = p.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       p.promoteur_nom?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchSearch
  })

  const stats = {
    total: projets.length,
    enAttente: projets.filter(p => p.etape === 'comité_crédit').length,
    approuves: projets.filter(p => p.decision_credit === 'approuvé' || p.decision_finale === 'approuvé').length,
    refuses: projets.filter(p => p.decision_credit === 'refusé' || p.decision_finale === 'refusé').length
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-sm font-medium text-gray-700">Chargement des projets...</p>
          <p className="mt-1 text-xs text-gray-500">Préparation du comité de crédit</p>
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

      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Comité de Crédit</h1>
              <p className="text-sm text-gray-500">Décision finale sur les projets analysés</p>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Agent de Crédit</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-orange-700">{stats.enAttente}</p>
              <p className="text-xs text-orange-600">En attente</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-green-700">{stats.approuves}</p>
              <p className="text-xs text-green-600">Approuvés</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-red-700">{stats.refuses}</p>
              <p className="text-xs text-red-600">Refusés</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-2">
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Rechercher un projet ou promoteur..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
      </div>

      {/* Liste projets */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-6xl mx-auto space-y-3">
          {projetsFiltres.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun projet à examiner</h3>
              <p className="text-sm text-gray-500">Les projets en attente de décision apparaîtront ici</p>
            </div>
          ) : (
            projetsFiltres.map(projet => (
              <div key={projet.id} className={`bg-white rounded-xl border p-4 transition-all ${
                loadingProjet === projet.id ? 'opacity-50 pointer-events-none' : 'hover:border-primary/30 hover:shadow-md'
              }`}>
                {loadingProjet === projet.id && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  {/* Icône statut */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                    projet.decision_credit === 'approuvé' || projet.decision_finale === 'approuvé' ? 'bg-green-100' :
                    projet.decision_credit === 'refusé' || projet.decision_finale === 'refusé' ? 'bg-red-100' :
                    'bg-orange-100'
                  }`}>
                    {projet.decision_credit === 'approuvé' || projet.decision_finale === 'approuvé' ? 
                      <ThumbsUp className="h-6 w-6 text-green-600" /> :
                     projet.decision_credit === 'refusé' || projet.decision_finale === 'refusé' ? 
                      <ThumbsDown className="h-6 w-6 text-red-600" /> :
                      <Clock className="h-6 w-6 text-orange-600" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-gray-900">{projet.titre}</h3>
                          
                          {/* Badge décision */}
                          {projet.decision_credit && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              projet.decision_credit === 'approuvé' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {projet.decision_credit === 'approuvé' ? 
                                <ThumbsUp className="h-3 w-3" /> : <ThumbsDown className="h-3 w-3" />}
                              {projet.decision_credit}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" /> {projet.promoteur_nom}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(projet.date_soumission)}</span>
                          {projet.montant_demande && (
                            <span className="flex items-center gap-1 font-semibold text-gray-700">
                              <DollarSign className="h-3 w-3" /> {formatMontant(projet.montant_demande)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rapport technique */}
                    {projet.rapport_decision && (
                      <div className={`mb-2 p-2 rounded-lg text-xs ${
                        projet.rapport_decision === 'favorable' ? 'bg-green-50 border border-green-100' :
                        projet.rapport_decision === 'defavorable' ? 'bg-red-50 border border-red-100' :
                        'bg-orange-50 border border-orange-100'
                      }`}>
                        <span className="font-medium">Rapport technique : {projet.rapport_decision}</span>
                        {projet.rapport_technicien_nom && <span className="text-gray-500"> par {projet.rapport_technicien_nom}</span>}
                        {projet.rapport_commentaire && (
                          <p className="mt-1 text-gray-600 line-clamp-2">{projet.rapport_commentaire}</p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ETAPE_COLORS[projet.etape]}`}>
                        {ETAPE_LABELS[projet.etape]}
                      </span>

                      {/* Progression docs */}
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[100px]">
                          <div className={`h-full rounded-full ${projet.docs_obligatoires_valides === projet.docs_obligatoires_total && projet.docs_obligatoires_total > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{ width: `${projet.docs_obligatoires_total > 0 ? (projet.docs_obligatoires_valides / projet.docs_obligatoires_total) * 100 : 0}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{projet.docs_obligatoires_valides}/{projet.docs_obligatoires_total}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Bouton Décider */}
                        {!projet.decision_credit && projet.etape === 'comité_crédit' && (
                          <button onClick={(e) => { e.stopPropagation(); ouvrirDecision(projet) }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors">
                            <Send className="h-3 w-3" /> Décider
                          </button>
                        )}

                        {/* Voir détails */}
                        <button onClick={(e) => { e.stopPropagation(); ouvrirDetail(projet) }}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Décision prise */}
                    {projet.decision_credit && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Décision rendue par {projet.decision_credit_par}</span>
                        <span>•</span>
                        <span>{formatDate(projet.decision_credit_date || '')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* MODAL DÉCISION FINALE */}
      {/* ============================================ */}
      {showDecisionModal && selectedProjet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Décision Finale</h2>
                <p className="text-xs text-gray-500">{selectedProjet.titre}</p>
              </div>
              <button onClick={() => setShowDecisionModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Résumé projet */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Promoteur</span>
                  <span className="font-medium">{selectedProjet.promoteur_nom}</span>
                </div>
                {selectedProjet.montant_demande && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Montant</span>
                    <span className="font-bold">{formatMontant(selectedProjet.montant_demande)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Rapport technique</span>
                  <span className={`font-medium ${
                    selectedProjet.rapport_decision === 'favorable' ? 'text-green-600' :
                    selectedProjet.rapport_decision === 'defavorable' ? 'text-red-600' :
                    'text-orange-600'
                  }`}>
                    {selectedProjet.rapport_decision || 'Non disponible'}
                  </span>
                </div>
              </div>

              {/* Rapport technique */}
              {selectedProjet.rapport_commentaire && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rapport technique</label>
                  <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                    {selectedProjet.rapport_commentaire}
                  </div>
                </div>
              )}

              {/* Décision */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Votre décision</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setDecisionForm({...decisionForm, decision: 'approuvé'})}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      decisionForm.decision === 'approuvé'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                    }`}>
                    <ThumbsUp className={`h-8 w-8 mx-auto mb-2 ${
                      decisionForm.decision === 'approuvé' ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm font-bold ${
                      decisionForm.decision === 'approuvé' ? 'text-green-700' : 'text-gray-600'
                    }`}>Approuver</p>
                    <p className="text-xs text-gray-500 mt-1">Accorder le financement</p>
                  </button>

                  <button onClick={() => setDecisionForm({...decisionForm, decision: 'refusé'})}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      decisionForm.decision === 'refusé'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
                    }`}>
                    <ThumbsDown className={`h-8 w-8 mx-auto mb-2 ${
                      decisionForm.decision === 'refusé' ? 'text-red-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm font-bold ${
                      decisionForm.decision === 'refusé' ? 'text-red-700' : 'text-gray-600'
                    }`}>Refuser</p>
                    <p className="text-xs text-gray-500 mt-1">Rejeter la demande</p>
                  </button>
                </div>
              </div>

              {/* Justification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="h-4 w-4 inline mr-1" /> Justification de la décision
                </label>
                <textarea rows={3} value={decisionForm.rapport_decision}
                  onChange={(e) => setDecisionForm({...decisionForm, rapport_decision: e.target.value})}
                  placeholder="Expliquez les raisons de votre décision..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>

              {/* Résumé final */}
              <div className={`rounded-xl p-4 text-sm font-medium ${
                decisionForm.decision === 'approuvé' 
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {decisionForm.decision === 'approuvé' ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Vous allez <strong>APPROUVER</strong> ce projet pour un montant de {selectedProjet.montant_demande ? formatMontant(selectedProjet.montant_demande) : 'N/A'}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span>Vous allez <strong>REFUSER</strong> ce projet. Le promoteur sera notifié.</span>
                  </div>
                )}
              </div>

              <button onClick={soumettreDecision} disabled={decisionLoading}
                className={`w-full py-3 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-colors ${
                  decisionForm.decision === 'approuvé' 
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}>
                {decisionLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Enregistrement de la décision...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    {decisionForm.decision === 'approuvé' ? 'Approuver le projet' : 'Refuser le projet'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MODAL DÉTAIL PROJET */}
      {/* ============================================ */}
      {showDetailModal && selectedProjet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedProjet.titre}</h2>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>{selectedProjet.promoteur_nom}</span>
                  <span>{formatDate(selectedProjet.date_soumission)}</span>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingDetail ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {/* Description */}
                  {selectedProjet.description && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">{selectedProjet.description}</p>
                    </div>
                  )}

                  {/* Rapport technique */}
                  {selectedProjet.rapport_decision && (
                    <div className={`rounded-xl p-4 border ${
                      selectedProjet.rapport_decision === 'favorable' ? 'bg-green-50 border-green-200' :
                      'bg-red-50 border-red-200'
                    }`}>
                      <h3 className="text-sm font-semibold mb-2">Rapport d'analyse technique</h3>
                      <p className="text-sm">{selectedProjet.rapport_commentaire}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Par {selectedProjet.rapport_technicien_nom} • {formatDate(selectedProjet.rapport_date || '')}
                      </p>
                    </div>
                  )}

                  {/* Documents */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Documents</h3>
                    <div className="space-y-1">
                      {documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            {doc.verification_auto ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-gray-400" />}
                            <span className="text-sm">{doc.type_nom}</span>
                          </div>
                          <a href={doc.chemin_fichier} target="_blank" className="text-xs text-primary">Voir</a>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
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
      `}</style>
    </div>
  )
}