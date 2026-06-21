


// 'use client'

// import { Eye, FileText, Loader2, Download, Shield, CheckCircle, XCircle, Clock, Star } from 'lucide-react'

// type ProjetATraiter = {
//   id: number
//   nom_projet: string
//   description_projet: string | null
//   montant_sollicite: number | null
//   etape: string
//   promoteur_nom_complet: string
//   promoteur_email: string | null
//   promoteur_telephone: string | null
//   promoteur_adresse: string | null
//   promoteur_province: string | null
//   promoteur_ville: string | null
//   created_at: string
//   rapport_id: number | null
//   rapport_statut: string | null
//   rapport_decision: string | null
//   nom_entite: string | null
//   secteur_activite: string | null
// }

// type DocumentProjet = {
//   id: number
//   type_document: string
//   chemin_fichier: string
//   nom_fichier: string | null
// }

// type RapportExistant = {
//   id: number
//   dossier_complet: boolean
//   documents_manquants: string | null
//   decision: string | null
//   commentaire_global: string | null
//   recommandations: string | null
//   note_faisabilite: number | null
//   note_impact: number | null
//   note_finance: number | null
//   note_equipe: number | null
//   note_marche: number | null
//   commentaire_faisabilite: string | null
//   commentaire_impact: string | null
//   commentaire_finance: string | null
//   commentaire_equipe: string | null
//   commentaire_marche: string | null
//   statut: string
// }

// const CRITERES = [
//   { key: 'faisabilite', label: 'Faisabilité technique', icon: '🔧' },
//   { key: 'impact', label: 'Impact socio-économique', icon: '📈' },
//   { key: 'finance', label: 'Viabilité financière', icon: '💰' },
//   { key: 'equipe', label: 'Qualité de l\'équipe', icon: '👥' },
//   { key: 'marche', label: 'Potentiel du marché', icon: '🎯' }
// ]

// interface ProjetDetailModalProps {
//   projet: ProjetATraiter | null
//   documents: DocumentProjet[]
//   rapportComplet: RapportExistant | null
//   notes: Record<string, number>
//   isLoading: boolean
//   isOpen: boolean
//   onClose: () => void
//   onStartRapport: () => void
//   onDownloadPDF: () => void
//   formatDate: (date: string) => string
//   formatMontant: (montant: number) => string
//   getDocTypeName: (type: string) => string
//   calculerNoteTotale: () => number
// }

// export default function ProjetDetailModal({
//   projet,
//   documents,
//   rapportComplet,
//   notes,
//   isLoading,
//   isOpen,
//   onClose,
//   onStartRapport,
//   onDownloadPDF,
//   formatDate,
//   formatMontant,
//   getDocTypeName,
//   calculerNoteTotale
// }: ProjetDetailModalProps) {
//   if (!isOpen || !projet) return null

//   // Helper pour obtenir la couleur de la décision
//   const getDecisionColor = (decision: string | null) => {
//     switch (decision) {
//       case 'favorable':
//         return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: <CheckCircle className="h-4 w-4" /> }
//       case 'defavorable':
//         return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: <XCircle className="h-4 w-4" /> }
//       default:
//         return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', icon: <Clock className="h-4 w-4" /> }
//     }
//   }

//   // Helper pour obtenir la couleur de la note
//   const getNoteColor = (note: number) => {
//     if (note <= 2) return 'text-red-600 bg-red-50'
//     if (note === 3) return 'text-orange-600 bg-orange-50'
//     if (note === 4) return 'text-green-600 bg-green-50'
//     return 'text-emerald-600 bg-emerald-50'
//   }

//   const decisionColor = getDecisionColor(rapportComplet?.decision || null)
//   const aUnRapportTransmis = rapportComplet && (rapportComplet.statut === 'transmis' || projet.etape === 'comité_crédit')
//   const peutModifierRapport = (!rapportComplet || rapportComplet.statut !== 'transmis') && projet.etape !== 'comité_crédit'

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
//       <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
//         {/* Header */}
//         <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between z-10">
//           <div>
//             <h2 className="text-lg font-bold text-gray-900">{projet.nom_projet}</h2>
//             <p className="text-xs text-gray-500 mt-0.5">
//               Soumis le {formatDate(projet.created_at)}
//             </p>
//           </div>
//           <div className="flex items-center gap-2">
//             {aUnRapportTransmis && (
//               <button
//                 onClick={onDownloadPDF}
//                 className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 transition-colors"
//               >
//                 <Download className="h-3 w-3" /> PDF
//               </button>
//             )}
//             <button 
//               onClick={onClose} 
//               className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
//             >
//               ✕
//             </button>
//           </div>
//         </div>
        
//         <div className="p-6 space-y-5">
//           {isLoading ? (
//             <div className="text-center py-12">
//               <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
//               <p className="text-sm text-gray-500 mt-3">Chargement des détails...</p>
//             </div>
//           ) : (
//             <>
//               {/* Badge d'état */}
//               <div className="flex items-center gap-2 flex-wrap">
//                 <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${decisionColor.bg} ${decisionColor.text}`}>
//                   {decisionColor.icon}
//                   {rapportComplet?.decision === 'favorable' ? 'Avis Favorable' : 
//                    rapportComplet?.decision === 'defavorable' ? 'Avis Défavorable' : 
//                    rapportComplet?.decision === 'reserve' ? 'Avis Réservé' : 'En attente d\'analyse'}
//                 </span>
//                 {projet.etape === 'comité_crédit' && (
//                   <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 flex items-center gap-1.5">
//                     <Clock className="h-3 w-3" /> En attente comité crédit
//                   </span>
//                 )}
//               </div>

//               {/* Informations projet */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4">
//                 <div className="space-y-1">
//                   <p className="text-xs text-gray-500 uppercase tracking-wide">Promoteur</p>
//                   <p className="text-sm font-medium text-gray-900">{projet.promoteur_nom_complet}</p>
//                 </div>
//                 <div className="space-y-1">
//                   <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
//                   <p className="text-sm text-gray-700">{projet.promoteur_email || '-'}</p>
//                 </div>
//                 <div className="space-y-1">
//                   <p className="text-xs text-gray-500 uppercase tracking-wide">Téléphone</p>
//                   <p className="text-sm text-gray-700">{projet.promoteur_telephone || '-'}</p>
//                 </div>
//                 <div className="space-y-1">
//                   <p className="text-xs text-gray-500 uppercase tracking-wide">Date de soumission</p>
//                   <p className="text-sm text-gray-700">{formatDate(projet.created_at)}</p>
//                 </div>
//                 {projet.montant_sollicite && (
//                   <div className="space-y-1">
//                     <p className="text-xs text-gray-500 uppercase tracking-wide">Montant sollicité</p>
//                     <p className="text-sm font-semibold text-primary">{formatMontant(projet.montant_sollicite)}</p>
//                   </div>
//                 )}
//                 {projet.secteur_activite && (
//                   <div className="space-y-1">
//                     <p className="text-xs text-gray-500 uppercase tracking-wide">Secteur d'activité</p>
//                     <p className="text-sm text-gray-700">{projet.secteur_activite}</p>
//                   </div>
//                 )}
//                 {projet.nom_entite && (
//                   <div className="space-y-1">
//                     <p className="text-xs text-gray-500 uppercase tracking-wide">Entité légale</p>
//                     <p className="text-sm text-gray-700">{projet.nom_entite}</p>
//                   </div>
//                 )}
//               </div>

//               {/* Description */}
//               {projet.description_projet && (
//                 <div>
//                   <h3 className="text-sm font-semibold text-gray-900 mb-2">📋 Description du projet</h3>
//                   <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 leading-relaxed">
//                     {projet.description_projet}
//                   </p>
//                 </div>
//               )}

//               {/* Rapport d'analyse - section améliorée */}
//               {aUnRapportTransmis && (
//                 <div className={`rounded-xl p-4 border ${decisionColor.border} ${decisionColor.bg}`}>
//                   <div className="flex items-center justify-between mb-4">
//                     <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
//                       <FileText className="h-4 w-4" />
//                       Rapport d'analyse technique
//                     </h3>
//                     <button
//                       onClick={onDownloadPDF}
//                       className="px-3 py-1.5 text-xs bg-white text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-1 transition-colors shadow-sm"
//                     >
//                       <Download className="h-3 w-3" /> Télécharger PDF
//                     </button>
//                   </div>
                  
//                   {/* Décision */}
//                   <div className="flex items-center gap-3 mb-4">
//                     <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${decisionColor.bg} ${decisionColor.text} border ${decisionColor.border}`}>
//                       {decisionColor.icon}
//                       {rapportComplet?.decision === 'favorable' ? 'DÉCISION FAVORABLE' : 
//                        rapportComplet?.decision === 'defavorable' ? 'DÉCISION DÉFAVORABLE' : 
//                        'DÉCISION RÉSERVÉE'}
//                     </span>
//                     <span className="text-sm text-gray-600">
//                       Note globale : <strong className="text-blue-600 text-lg">{calculerNoteTotale().toFixed(1)}</strong>/5
//                     </span>
//                   </div>

//                   {/* Grille des notes */}
//                   <div className="grid grid-cols-5 gap-2 mb-4">
//                     {CRITERES.map(c => {
//                       const note = notes[c.key] || 0
//                       const noteColor = getNoteColor(note)
//                       return (
//                         <div key={c.key} className={`text-center rounded-xl p-2 ${noteColor}`}>
//                           <span className="text-xl block mb-1">{c.icon}</span>
//                           <p className="text-lg font-bold">{note || '-'}</p>
//                           <p className="text-[10px] text-gray-600 truncate">{c.label.split(' ')[0]}</p>
//                         </div>
//                       )
//                     })}
//                   </div>

//                   {/* Commentaires par critère - optionnel, déplié si présent */}
//                   {rapportComplet && Object.values(rapportComplet).some(v => v && typeof v === 'string' && v.includes('commentaire')) && (
//                     <details className="mb-3">
//                       <summary className="text-xs font-medium text-gray-600 cursor-pointer hover:text-gray-900">
//                         Voir les commentaires détaillés
//                       </summary>
//                       <div className="mt-2 space-y-2 text-xs text-gray-600">
//                         {CRITERES.map(c => {
//                           const commentKey = `commentaire_${c.key}` as keyof RapportExistant
//                           const comment = rapportComplet?.[commentKey] as string
//                           if (comment) {
//                             return (
//                               <div key={c.key} className="bg-white/50 rounded-lg p-2">
//                                 <span className="font-semibold">{c.icon} {c.label}:</span> {comment}
//                               </div>
//                             )
//                           }
//                           return null
//                         })}
//                       </div>
//                     </details>
//                   )}

//                   {/* Commentaire global */}
//                   {rapportComplet?.commentaire_global && (
//                     <div className="bg-white/50 rounded-lg p-3 mb-2">
//                       <p className="text-xs font-semibold text-gray-700 mb-1">💬 Commentaire global</p>
//                       <p className="text-sm text-gray-700">{rapportComplet.commentaire_global}</p>
//                     </div>
//                   )}

//                   {/* Recommandations */}
//                   {rapportComplet?.recommandations && (
//                     <div className="bg-white/50 rounded-lg p-3">
//                       <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
//                         <Star className="h-3 w-3" /> Recommandations
//                       </p>
//                       <p className="text-sm text-gray-700">{rapportComplet.recommandations}</p>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Section documents */}
//               <div>
//                 <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                   <FileText className="h-4 w-4" />
//                   Documents fournis ({documents.length})
//                 </h3>
//                 {documents.length === 0 ? (
//                   <p className="text-sm text-gray-500 text-center py-6 bg-gray-50 rounded-xl">
//                     Aucun document n'a été téléchargé pour ce projet
//                   </p>
//                 ) : (
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                     {documents.map((doc) => (
//                       <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border hover:shadow-sm transition-all">
//                         <div className="flex items-center gap-3 min-w-0">
//                           <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
//                           <p className="text-sm text-gray-700 truncate">{getDocTypeName(doc.type_document)}</p>
//                         </div>
//                         <a 
//                           href={doc.chemin_fichier} 
//                           target="_blank" 
//                           rel="noopener noreferrer"
//                           className="text-primary text-sm hover:underline flex items-center gap-1 flex-shrink-0"
//                         >
//                           <Eye className="h-4 w-4" /> Voir
//                         </a>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Bouton pour démarrer/modifier le rapport */}
//               {peutModifierRapport && (
//                 <button
//                   onClick={onStartRapport}
//                   className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors shadow-sm"
//                 >
//                   <Shield className="h-4 w-4" />
//                   {rapportComplet ? '📝 Modifier le rapport' : '🚀 Démarrer l\'analyse'}
//                 </button>
//               )}

//               {/* Message si projet au comité sans rapport */}
//               {projet.etape === 'comité_crédit' && !aUnRapportTransmis && (
//                 <div className="text-center py-6 bg-yellow-50 rounded-xl border border-yellow-200">
//                   <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
//                   <p className="text-sm text-yellow-700">
//                     Ce projet est en attente d'examen par le comité de crédit.
//                   </p>
//                   <p className="text-xs text-yellow-600 mt-1">
//                     Le rapport d'analyse sera disponible après validation.
//                   </p>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }


'use client'

import { useState } from 'react'
import { 
  Eye, FileText, Loader2, Download, Shield, CheckCircle, XCircle, Clock, Star,
  User, Mail, Phone, MapPin, Briefcase, Building2, Hash, DollarSign,
  Users, Target, CreditCard, Banknote, Building, TrendingUp, ChevronDown,
  ChevronUp, Info
} from 'lucide-react'

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
  promoteur_profession?: string | null
  promoteur_sexe?: string | null
  chiffre_affaires_previsionnel?: number | null
  benefice_previsionnel?: number | null
  garanties_proposees?: string | null
  numero_compte_bancaire?: string | null
  duree_realisation?: string | null
  source_financement?: string | null
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
}

const CRITERES = [
  { key: 'faisabilite', label: 'Faisabilité technique', icon: '🔧' },
  { key: 'impact', label: 'Impact socio-économique', icon: '📈' },
  { key: 'finance', label: 'Viabilité financière', icon: '💰' },
  { key: 'equipe', label: 'Qualité de l\'équipe', icon: '👥' },
  { key: 'marche', label: 'Potentiel du marché', icon: '🎯' }
]

interface ProjetDetailModalProps {
  projet: ProjetATraiter | null
  documents: DocumentProjet[]
  rapportComplet: RapportExistant | null
  notes: Record<string, number>
  isLoading: boolean
  isOpen: boolean
  onClose: () => void
  onStartRapport: () => void
  onDownloadPDF: () => void
  formatDate: (date: string) => string
  formatMontant: (montant: number) => string
  getDocTypeName: (type: string) => string
  calculerNoteTotale: () => number
}

export default function ProjetDetailModal({
  projet,
  documents,
  rapportComplet,
  notes,
  isLoading,
  isOpen,
  onClose,
  onStartRapport,
  onDownloadPDF,
  formatDate,
  formatMontant,
  getDocTypeName,
  calculerNoteTotale
}: ProjetDetailModalProps) {
  const [showFullDetails, setShowFullDetails] = useState(false)

  if (!isOpen || !projet) return null

  // Helper pour obtenir la couleur de la décision
  const getDecisionColor = (decision: string | null) => {
    switch (decision) {
      case 'favorable':
        return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: <CheckCircle className="h-4 w-4" /> }
      case 'defavorable':
        return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: <XCircle className="h-4 w-4" /> }
      default:
        return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', icon: <Clock className="h-4 w-4" /> }
    }
  }

  // Helper pour obtenir la couleur de la note
  const getNoteColor = (note: number) => {
    if (note <= 2) return 'text-red-600 bg-red-50'
    if (note === 3) return 'text-orange-600 bg-orange-50'
    if (note === 4) return 'text-green-600 bg-green-50'
    return 'text-emerald-600 bg-emerald-50'
  }

  const decisionColor = getDecisionColor(rapportComplet?.decision || null)
  const aUnRapportTransmis = rapportComplet && (rapportComplet.statut === 'transmis' || projet.etape === 'comité_crédit')
  const peutModifierRapport = (!rapportComplet || rapportComplet.statut !== 'transmis') && projet.etape !== 'comité_crédit'

  // Composant ligne d'information pour les détails complets
  const InfoRow = ({ label, value, icon }: { label: string; value?: string | number | null; icon: React.ReactNode }) => (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div className="flex-shrink-0 text-gray-400">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value ?? '-'}</p>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{projet.nom_projet}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Soumis le {formatDate(projet.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {aUnRapportTransmis && (
              <button
                onClick={onDownloadPDF}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
              >
                <Download className="h-4 w-4" /> PDF
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-5">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-gray-500 mt-3">Chargement des détails...</p>
            </div>
          ) : (
            <>
              {/* Badge d'état */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${decisionColor.bg} ${decisionColor.text}`}>
                  {decisionColor.icon}
                  {rapportComplet?.decision === 'favorable' ? 'Avis Favorable' : 
                   rapportComplet?.decision === 'defavorable' ? 'Avis Défavorable' : 
                   rapportComplet?.decision === 'reserve' ? 'Avis Réservé' : 'En attente d\'analyse'}
                </span>
                {projet.etape === 'comité_crédit' && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700 flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> En attente comité crédit
                  </span>
                )}
              </div>

              {/* Informations projet - Résumé */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Promoteur</p>
                  <p className="text-sm font-medium text-gray-900">{projet.promoteur_nom_complet}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                  <p className="text-sm text-gray-700">{projet.promoteur_email || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Téléphone</p>
                  <p className="text-sm text-gray-700">{projet.promoteur_telephone || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Date de soumission</p>
                  <p className="text-sm text-gray-700">{formatDate(projet.created_at)}</p>
                </div>
                {projet.montant_sollicite && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Montant sollicité</p>
                    <p className="text-sm font-semibold text-primary">{formatMontant(projet.montant_sollicite)}</p>
                  </div>
                )}
                {projet.secteur_activite && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Secteur d'activité</p>
                    <p className="text-sm text-gray-700">{projet.secteur_activite}</p>
                  </div>
                )}
                {projet.nom_entite && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Entité légale</p>
                    <p className="text-sm text-gray-700">{projet.nom_entite}</p>
                  </div>
                )}
              </div>

              {/* BOUTON VOIR TOUS LES DÉTAILS */}
              <button
                onClick={() => setShowFullDetails(!showFullDetails)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      {showFullDetails ? 'Masquer les détails complets' : 'Voir tous les détails du projet'}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Promoteur, entité légale, finances, garanties et plus
                    </p>
                  </div>
                </div>
                {showFullDetails ? (
                  <ChevronUp className="h-5 w-5 text-blue-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-blue-600" />
                )}
              </button>

              {/* DÉTAILS COMPLETS - Section extensible */}
              {showFullDetails && (
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* SECTION 1: PROMOTEUR */}
                  <div className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      Informations du Promoteur
                    </h3>
                    <div className="space-y-0">
                      <InfoRow label="Nom complet" value={projet.promoteur_nom_complet} icon={<User className="h-4 w-4" />} />
                      <InfoRow label="Sexe" value={projet.promoteur_sexe === 'M' ? 'Masculin' : projet.promoteur_sexe === 'F' ? 'Féminin' : '-'} icon={<User className="h-4 w-4" />} />
                      <InfoRow label="Email" value={projet.promoteur_email} icon={<Mail className="h-4 w-4" />} />
                      <InfoRow label="Téléphone" value={projet.promoteur_telephone} icon={<Phone className="h-4 w-4" />} />
                      <InfoRow label="Adresse" value={projet.promoteur_adresse} icon={<MapPin className="h-4 w-4" />} />
                      <InfoRow label="Province" value={projet.promoteur_province} icon={<MapPin className="h-4 w-4" />} />
                      <InfoRow label="Ville" value={projet.promoteur_ville} icon={<MapPin className="h-4 w-4" />} />
                      {projet.promoteur_profession && (
                        <InfoRow label="Profession" value={projet.promoteur_profession} icon={<Briefcase className="h-4 w-4" />} />
                      )}
                    </div>
                  </div>

                  {/* SECTION 2: ENTITÉ LÉGALE */}
                  <div className="bg-white rounded-xl p-5 border border-purple-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <Building2 className="h-4 w-4 text-purple-600" />
                      </div>
                      Entité Légale
                    </h3>
                    <div className="space-y-0">
                      <InfoRow label="Nom de l'entité" value={projet.nom_entite} icon={<Building2 className="h-4 w-4" />} />
                      <InfoRow label="N° RCCM" value={projet.numero_rccm} icon={<Hash className="h-4 w-4" />} />
                    </div>
                  </div>

                  {/* SECTION 3: PROJET */}
                  <div className="bg-white rounded-xl p-5 border border-green-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-1.5 bg-green-100 rounded-lg">
                        <Briefcase className="h-4 w-4 text-green-600" />
                      </div>
                      Détails du Projet
                    </h3>
                    <div className="space-y-0">
                      <InfoRow label="Nom du projet" value={projet.nom_projet} icon={<Briefcase className="h-4 w-4" />} />
                      <InfoRow label="Secteur d'activité" value={projet.secteur_activite} icon={<Briefcase className="h-4 w-4" />} />
                      <InfoRow label="Localisation" value={projet.localisation_projet} icon={<MapPin className="h-4 w-4" />} />
                      <InfoRow label="Coût total" value={projet.cout_total ? formatMontant(projet.cout_total) : '-'} icon={<DollarSign className="h-4 w-4" />} />
                      <InfoRow label="Montant sollicité" value={projet.montant_sollicite ? formatMontant(projet.montant_sollicite) : '-'} icon={<DollarSign className="h-4 w-4" />} />
                      <InfoRow label="Nombre d'emplois" value={projet.nombre_emplois} icon={<Users className="h-4 w-4" />} />
                      {projet.duree_realisation && (
                        <InfoRow label="Durée de réalisation" value={projet.duree_realisation} icon={<Clock className="h-4 w-4" />} />
                      )}
                      {projet.objectifs_projet && (
                        <InfoRow label="Objectifs du projet" value={projet.objectifs_projet} icon={<Target className="h-4 w-4" />} />
                      )}
                    </div>
                  </div>

                  {/* SECTION 4: FINANCES */}
                  <div className="bg-white rounded-xl p-5 border border-yellow-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-1.5 bg-yellow-100 rounded-lg">
                        <Banknote className="h-4 w-4 text-yellow-600" />
                      </div>
                      Informations Financières
                    </h3>
                    <div className="space-y-0">
                      <InfoRow label="Apport personnel" value={projet.apport_personnel ? formatMontant(projet.apport_personnel) : '-'} icon={<CreditCard className="h-4 w-4" />} />
                      {projet.source_financement && (
                        <InfoRow label="Source de financement" value={projet.source_financement} icon={<Banknote className="h-4 w-4" />} />
                      )}
                      {projet.chiffre_affaires_previsionnel && (
                        <InfoRow label="CA prévisionnel" value={formatMontant(projet.chiffre_affaires_previsionnel)} icon={<TrendingUp className="h-4 w-4" />} />
                      )}
                      {projet.benefice_previsionnel && (
                        <InfoRow label="Bénéfice prévisionnel" value={formatMontant(projet.benefice_previsionnel)} icon={<TrendingUp className="h-4 w-4" />} />
                      )}
                      <InfoRow label="Durée de remboursement" value={projet.duree_remboursement} icon={<Clock className="h-4 w-4" />} />
                      <InfoRow label="Banque partenaire" value={projet.banque_partenaire} icon={<Building className="h-4 w-4" />} />
                      {projet.numero_compte_bancaire && (
                        <InfoRow label="N° compte bancaire" value={projet.numero_compte_bancaire} icon={<Hash className="h-4 w-4" />} />
                      )}
                      {projet.garanties_proposees && (
                        <InfoRow label="Garanties proposées" value={projet.garanties_proposees} icon={<Shield className="h-4 w-4" />} />
                      )}
                    </div>
                  </div>

                  {/* SECTION 5: DESCRIPTION */}
                  {projet.description_projet && (
                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 rounded-lg">
                          <FileText className="h-4 w-4 text-gray-600" />
                        </div>
                        Description du projet
                      </h3>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {projet.description_projet}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Rapport d'analyse - section améliorée */}
              {aUnRapportTransmis && (
                <div className={`rounded-xl p-4 border ${decisionColor.border} ${decisionColor.bg}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Rapport d'analyse technique
                    </h3>
                    <button
                      onClick={onDownloadPDF}
                      className="px-3 py-1.5 text-xs bg-white text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-1 transition-colors shadow-sm"
                    >
                      <Download className="h-3 w-3" /> Télécharger PDF
                    </button>
                  </div>
                  
                  {/* Décision */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${decisionColor.bg} ${decisionColor.text} border ${decisionColor.border}`}>
                      {decisionColor.icon}
                      {rapportComplet?.decision === 'favorable' ? 'DÉCISION FAVORABLE' : 
                       rapportComplet?.decision === 'defavorable' ? 'DÉCISION DÉFAVORABLE' : 
                       'DÉCISION RÉSERVÉE'}
                    </span>
                    <span className="text-sm text-gray-600">
                      Note globale : <strong className="text-blue-600 text-lg">{calculerNoteTotale().toFixed(1)}</strong>/5
                    </span>
                  </div>

                  {/* Grille des notes */}
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {CRITERES.map(c => {
                      const note = notes[c.key] || 0
                      const noteColor = getNoteColor(note)
                      return (
                        <div key={c.key} className={`text-center rounded-xl p-2 ${noteColor}`}>
                          <span className="text-xl block mb-1">{c.icon}</span>
                          <p className="text-lg font-bold">{note || '-'}</p>
                          <p className="text-xs text-gray-600 truncate">{c.label.split(' ')[0]}</p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Commentaires par critère */}
                  {rapportComplet && Object.values(rapportComplet).some(v => v && typeof v === 'string' && v.includes('commentaire')) && (
                    <details className="mb-3">
                      <summary className="text-sm font-medium text-gray-600 cursor-pointer hover:text-gray-900">
                        Voir les commentaires détaillés
                      </summary>
                      <div className="mt-2 space-y-2 text-sm text-gray-600">
                        {CRITERES.map(c => {
                          const commentKey = `commentaire_${c.key}` as keyof RapportExistant
                          const comment = rapportComplet?.[commentKey] as string
                          if (comment) {
                            return (
                              <div key={c.key} className="bg-white/50 rounded-lg p-3">
                                <span className="font-semibold">{c.icon} {c.label}:</span> {comment}
                              </div>
                            )
                          }
                          return null
                        })}
                      </div>
                    </details>
                  )}

                  {/* Commentaire global */}
                  {rapportComplet?.commentaire_global && (
                    <div className="bg-white/50 rounded-lg p-3 mb-2">
                      <p className="text-sm font-semibold text-gray-700 mb-1">💬 Commentaire global</p>
                      <p className="text-sm text-gray-700">{rapportComplet.commentaire_global}</p>
                    </div>
                  )}

                  {/* Recommandations */}
                  {rapportComplet?.recommandations && (
                    <div className="bg-white/50 rounded-lg p-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                        <Star className="h-4 w-4" /> Recommandations
                      </p>
                      <p className="text-sm text-gray-700">{rapportComplet.recommandations}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Section documents */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents fournis ({documents.length})
                </h3>
                {documents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6 bg-gray-50 rounded-xl">
                    Aucun document n'a été téléchargé pour ce projet
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          <p className="text-sm text-gray-700 truncate">{getDocTypeName(doc.type_document)}</p>
                        </div>
                        <a 
                          href={doc.chemin_fichier} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary text-sm hover:underline flex items-center gap-1 flex-shrink-0"
                        >
                          <Eye className="h-4 w-4" /> Voir
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bouton pour démarrer/modifier le rapport */}
              {peutModifierRapport && (
                <button
                  onClick={onStartRapport}
                  className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Shield className="h-4 w-4" />
                  {rapportComplet ? '📝 Modifier le rapport' : '🚀 Démarrer l\'analyse'}
                </button>
              )}

              {/* Message si projet au comité sans rapport */}
              {projet.etape === 'comité_crédit' && !aUnRapportTransmis && (
                <div className="text-center py-6 bg-yellow-50 rounded-xl border border-yellow-200">
                  <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-yellow-700">
                    Ce projet est en attente d'examen par le comité de crédit.
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Le rapport d'analyse sera disponible après validation.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}