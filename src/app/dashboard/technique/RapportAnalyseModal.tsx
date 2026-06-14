// // RapportAnalyseModal.tsx
// 'use client'

// import { useState } from 'react'
// import { 
//   CheckCircle, AlertCircle, Send, ArrowRight, Star, 
//   FileText, Loader2
// } from 'lucide-react'

// type ProjetATraiter = {
//   id: number
//   nom_projet: string
//   description_projet: string | null
//   montant_sollicite: number | null
//   etape: string
//   promoteur_nom_complet: string
//   promoteur_email: string | null
//   promoteur_telephone: string | null
//   created_at: string
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
//   technicien_id: number | null
//   date_consultation: string | null
//   date_verification: string | null
//   date_analyse: string | null
//   date_decision: string | null
// }

// const CRITERES = [
//   { key: 'faisabilite', label: 'Faisabilité technique', icon: '🔧' },
//   { key: 'impact', label: 'Impact socio-économique', icon: '📈' },
//   { key: 'finance', label: 'Viabilité financière', icon: '💰' },
//   { key: 'equipe', label: 'Qualité de l\'équipe', icon: '👥' },
//   { key: 'marche', label: 'Potentiel du marché', icon: '🎯' }
// ]

// const NOTES = [1, 2, 3, 4, 5]
// const NOTE_LABELS: Record<number, string> = {
//   1: 'Très faible',
//   2: 'Faible',
//   3: 'Moyen',
//   4: 'Bon',
//   5: 'Excellent'
// }

// interface RapportAnalyseModalProps {
//   projet: ProjetATraiter | null
//   documents: DocumentProjet[]
//   rapportComplet: RapportExistant | null
//   isOpen: boolean
//   onClose: () => void
//   onSubmit: (data: any) => Promise<void>
//   formatMontant: (montant: number) => string
//   getDocTypeName: (type: string) => string
// }

// export default function RapportAnalyseModal({
//   projet,
//   documents,
//   rapportComplet,
//   isOpen,
//   onClose,
//   onSubmit,
//   formatMontant,
//   getDocTypeName
// }: RapportAnalyseModalProps) {
//   const [etapeActuelle, setEtapeActuelle] = useState(1)
//   const [dossierComplet, setDossierComplet] = useState<boolean | null>(rapportComplet?.dossier_complet ?? null)
//   const [documentsManquants, setDocumentsManquants] = useState(rapportComplet?.documents_manquants ?? '')
//   const [notes, setNotes] = useState<Record<string, number>>({
//     faisabilite: rapportComplet?.note_faisabilite ?? 0,
//     impact: rapportComplet?.note_impact ?? 0,
//     finance: rapportComplet?.note_finance ?? 0,
//     equipe: rapportComplet?.note_equipe ?? 0,
//     marche: rapportComplet?.note_marche ?? 0
//   })
//   const [commentaires, setCommentaires] = useState<Record<string, string>>({
//     faisabilite: rapportComplet?.commentaire_faisabilite ?? '',
//     impact: rapportComplet?.commentaire_impact ?? '',
//     finance: rapportComplet?.commentaire_finance ?? '',
//     equipe: rapportComplet?.commentaire_equipe ?? '',
//     marche: rapportComplet?.commentaire_marche ?? ''
//   })
//   const [decision, setDecision] = useState(rapportComplet?.decision ?? '')
//   const [commentaireGlobal, setCommentaireGlobal] = useState(rapportComplet?.commentaire_global ?? '')
//   const [recommandations, setRecommandations] = useState(rapportComplet?.recommandations ?? '')
//   const [saving, setSaving] = useState(false)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')

//   const getNoteColor = (note: number): string => {
//     if (note <= 2) return 'bg-red-500'
//     if (note === 3) return 'bg-orange-500'
//     if (note === 4) return 'bg-green-500'
//     return 'bg-emerald-500'
//   }

//   const calculerNoteTotale = (): number => {
//     const valeurs = CRITERES.map(c => notes[c.key] || 0)
//     const somme = valeurs.reduce((a, b) => a + b, 0)
//     const toutesRemplies = valeurs.every(n => n > 0)
//     return toutesRemplies ? somme / CRITERES.length : 0
//   }

//   const peutPasserEtapeSuivante = (): boolean => {
//     if (etapeActuelle === 1) return true
//     if (etapeActuelle === 2) return dossierComplet !== null
//     if (etapeActuelle === 3) {
//       const notesManquantes = CRITERES.filter(c => !notes[c.key] || notes[c.key] <= 0)
//       return notesManquantes.length === 0
//     }
//     if (etapeActuelle === 4) return decision !== '' && commentaireGlobal.trim() !== ''
//     return false
//   }

//   const handleSubmit = async () => {
//     setSaving(true)
//     setError('')
//     try {
//       await onSubmit({
//         projet_id: projet?.id,
//         dossier_complet: dossierComplet,
//         documents_manquants: dossierComplet ? null : documentsManquants,
//         notes,
//         commentaires,
//         decision,
//         commentaire_global: commentaireGlobal,
//         recommandations
//       })
//       setSuccess('✅ Rapport transmis avec succès !')
//       setTimeout(() => {
//         onClose()
//       }, 2000)
//     } catch (err: any) {
//       setError(err.message || 'Erreur lors de la transmission')
//     } finally {
//       setSaving(false)
//     }
//   }

//   if (!isOpen || !projet) return null

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
//       <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl">
//         <div className="sticky top-0 bg-white px-6 py-4 border-b z-10">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-bold">Rapport d'analyse</h2>
//             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">✕</button>
//           </div>
//           <p className="text-sm text-gray-500 mb-4">{projet.nom_projet}</p>
          
//           <div className="flex items-center gap-1">
//             {[1, 2, 3, 4].map((num, index) => (
//               <div key={num} className="flex items-center flex-1">
//                 <button
//                   onClick={() => { if (num <= etapeActuelle) setEtapeActuelle(num) }}
//                   className={`flex flex-col items-center flex-1 ${num <= etapeActuelle ? 'cursor-pointer' : 'cursor-default opacity-50'}`}
//                 >
//                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
//                     num < etapeActuelle ? 'bg-green-500 text-white' :
//                     num === etapeActuelle ? 'bg-primary text-white ring-4 ring-primary/20' :
//                     'bg-gray-100 text-gray-400'
//                   }`}>
//                     {num < etapeActuelle ? <CheckCircle className="h-4 w-4" /> : num}
//                   </div>
//                   <span className="text-[10px] mt-1 font-medium hidden sm:block">
//                     {num === 1 ? 'Consulter' : num === 2 ? 'Vérifier' : num === 3 ? 'Analyser' : 'Transmettre'}
//                   </span>
//                 </button>
//                 {index < 3 && (
//                   <div className={`h-0.5 flex-1 -mt-4 ${num < etapeActuelle ? 'bg-green-400' : 'bg-gray-200'}`} />
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="p-6">
//           {error && (
//             <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-center gap-2">
//               <AlertCircle className="h-4 w-4" /> {error}
//             </div>
//           )}
//           {success && (
//             <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 flex items-center gap-2">
//               <CheckCircle className="h-4 w-4" /> {success}
//             </div>
//           )}

//           {/* ÉTAPE 1 - Consultation */}
//           {etapeActuelle === 1 && (
//             <div className="space-y-4">
//               <div className="text-center py-8">
//                 <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
//                   <FileText className="h-8 w-8 text-blue-600" />
//                 </div>
//                 <h3 className="text-lg font-semibold mb-2">Consultation du dossier</h3>
//                 <p className="text-sm text-gray-500 mb-6">Prenez connaissance du projet avant de commencer l'analyse.</p>
//                 <div className="bg-blue-50 rounded-xl p-4 text-left">
//                   <p className="text-sm text-blue-800">
//                     <strong>Promoteur :</strong> {projet.promoteur_nom_complet}<br />
//                     <strong>Montant :</strong> {projet.montant_sollicite ? formatMontant(projet.montant_sollicite) : '-'}<br />
//                     <strong>Documents :</strong> {documents.length} fichier(s)
//                   </p>
//                 </div>
//               </div>
//               <button onClick={() => setEtapeActuelle(2)} className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 flex items-center justify-center gap-2">
//                 J'ai consulté le dossier <ArrowRight className="h-4 w-4" />
//               </button>
//             </div>
//           )}

//           {/* ÉTAPE 2 - Vérification */}
//           {etapeActuelle === 2 && (
//             <div className="space-y-4">
//               <h3 className="text-base font-semibold">Vérification du dossier</h3>
              
//               <div className="bg-gray-50 rounded-xl p-4 space-y-2">
//                 <h4 className="text-sm font-medium">Documents :</h4>
//                 {documents.map((doc) => (
//                   <div key={doc.id} className="flex items-center justify-between text-sm">
//                     <span className="flex items-center gap-2">
//                       <FileText className="h-4 w-4 text-gray-400" />
//                       {getDocTypeName(doc.type_document)}
//                     </span>
//                     <a href={doc.chemin_fichier} target="_blank" className="text-primary text-xs hover:underline">Voir</a>
//                   </div>
//                 ))}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-2">Le dossier est-il complet ?</label>
//                 <div className="flex gap-3">
//                   <button
//                     type="button"
//                     onClick={() => setDossierComplet(true)}
//                     className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${
//                       dossierComplet === true ? 'bg-green-500 text-white border-green-500' : 'border-gray-300'
//                     }`}
//                   >
//                     ✅ Complet
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setDossierComplet(false)}
//                     className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${
//                       dossierComplet === false ? 'bg-red-500 text-white border-red-500' : 'border-gray-300'
//                     }`}
//                   >
//                     ❌ Incomplet
//                   </button>
//                 </div>
//               </div>

//               {dossierComplet === false && (
//                 <div>
//                   <label className="block text-sm font-medium mb-1">Documents manquants</label>
//                   <textarea value={documentsManquants} onChange={(e) => setDocumentsManquants(e.target.value)} rows={3}
//                     className="w-full px-4 py-2 border rounded-xl text-sm resize-none" placeholder="Listez les documents manquants..." />
//                 </div>
//               )}

//               <div className="flex gap-3">
//                 <button onClick={() => setEtapeActuelle(1)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm">← Retour</button>
//                 <button
//                   onClick={() => {
//                     if (dossierComplet !== null) setEtapeActuelle(3)
//                     else setError('Veuillez indiquer si le dossier est complet')
//                   }}
//                   className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90"
//                 >
//                   Continuer
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* ÉTAPE 3 - Analyse */}
//           {etapeActuelle === 3 && (
//             <div className="space-y-6">
//               <h3 className="text-base font-semibold">Grille d'analyse</h3>
//               <p className="text-sm text-gray-500">Évaluez chaque critère de 1 à 5</p>

//               {CRITERES.map((critere) => (
//                 <div key={critere.key} className="bg-gray-50 rounded-xl p-4 space-y-3">
//                   <div className="flex items-center gap-2">
//                     <span className="text-lg">{critere.icon}</span>
//                     <span className="text-sm font-semibold">{critere.label}</span>
//                   </div>

//                   <div className="flex items-center gap-1 flex-wrap">
//                     {NOTES.map((note) => (
//                       <button
//                         key={note}
//                         type="button"
//                         onClick={() => setNotes(prev => ({ ...prev, [critere.key]: note }))}
//                         className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
//                           notes[critere.key] === note
//                             ? `${getNoteColor(note)} text-white scale-110 shadow-md`
//                             : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
//                         }`}
//                       >
//                         {note}
//                       </button>
//                     ))}
//                     {notes[critere.key] > 0 && (
//                       <span className="ml-2 text-xs font-medium">{NOTE_LABELS[notes[critere.key]]}</span>
//                     )}
//                   </div>

//                   <textarea
//                     value={commentaires[critere.key] || ''}
//                     onChange={(e) => setCommentaires(prev => ({ ...prev, [critere.key]: e.target.value }))}
//                     rows={2}
//                     className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none bg-white"
//                     placeholder={`Commentaire sur ${critere.label.toLowerCase()}...`}
//                   />
//                 </div>
//               ))}

//               <div className="bg-primary/5 rounded-xl p-4 flex items-center justify-between">
//                 <span className="text-sm font-semibold">Note globale</span>
//                 <div className="flex items-center gap-2">
//                   <div className="flex gap-0.5">
//                     {[1, 2, 3, 4, 5].map(star => (
//                       <Star
//                         key={star}
//                         className={`h-4 w-4 ${
//                           star <= Math.round(calculerNoteTotale())
//                             ? 'text-yellow-400 fill-yellow-400'
//                             : 'text-gray-300'
//                         }`}
//                       />
//                     ))}
//                   </div>
//                   <span className="text-2xl font-bold text-primary">{calculerNoteTotale().toFixed(1)}/5</span>
//                 </div>
//               </div>

//               <div className="flex gap-3">
//                 <button onClick={() => setEtapeActuelle(2)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm">← Retour</button>
//                 <button
//                   onClick={() => {
//                     if (peutPasserEtapeSuivante()) setEtapeActuelle(4)
//                     else setError('Veuillez noter tous les critères')
//                   }}
//                   className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90"
//                 >
//                   Continuer
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* ÉTAPE 4 - Décision et Transmission */}
//           {etapeActuelle === 4 && (
//             <div className="space-y-4">
//               <h3 className="text-base font-semibold">Décision et transmission</h3>

//               <div className="bg-gray-50 rounded-xl p-4">
//                 <h4 className="text-sm font-semibold mb-3">Résumé</h4>
//                 <div className="grid grid-cols-5 gap-2 mb-3">
//                   {CRITERES.map((critere) => (
//                     <div key={critere.key} className="text-center">
//                       <span className="text-xs">{critere.icon}</span>
//                       <p className="text-lg font-bold">{notes[critere.key] || '-'}</p>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="text-center">
//                   <span className="text-2xl font-bold text-primary">{calculerNoteTotale().toFixed(1)}/5</span>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-2">Décision finale</label>
//                 <div className="flex gap-2">
//                   {['favorable', 'defavorable', 'reserve'].map((d) => (
//                     <button
//                       key={d}
//                       type="button"
//                       onClick={() => setDecision(d)}
//                       className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${
//                         decision === d
//                           ? d === 'favorable' ? 'bg-green-500 text-white border-green-500'
//                             : d === 'defavorable' ? 'bg-red-500 text-white border-red-500'
//                             : 'bg-orange-500 text-white border-orange-500'
//                           : 'border-gray-300'
//                       }`}
//                     >
//                       {d.charAt(0).toUpperCase() + d.slice(1)}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Commentaire global</label>
//                 <textarea value={commentaireGlobal} onChange={(e) => setCommentaireGlobal(e.target.value)} rows={4}
//                   className="w-full px-4 py-2 border rounded-xl text-sm resize-none" placeholder="Synthèse..." />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Recommandations</label>
//                 <textarea value={recommandations} onChange={(e) => setRecommandations(e.target.value)} rows={2}
//                   className="w-full px-4 py-2 border rounded-xl text-sm resize-none" placeholder="Recommandations..." />
//               </div>

//               <div className="flex gap-3">
//                 <button onClick={() => setEtapeActuelle(3)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm">← Retour</button>
//                 <button onClick={handleSubmit} disabled={saving || !peutPasserEtapeSuivante()}
//                   className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
//                   {saving ? <><Loader2 className="h-5 w-5 animate-spin" /> Transmission...</> : <><Send className="h-4 w-4" /> Transmettre</>}
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircle, AlertCircle, Send, ArrowRight, Star, 
  FileText, Loader2
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
  created_at: string
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

const CRITERES = [
  { key: 'faisabilite', label: 'Faisabilité technique', icon: '🔧' },
  { key: 'impact', label: 'Impact socio-économique', icon: '📈' },
  { key: 'finance', label: 'Viabilité financière', icon: '💰' },
  { key: 'equipe', label: 'Qualité de l\'équipe', icon: '👥' },
  { key: 'marche', label: 'Potentiel du marché', icon: '🎯' }
]

const NOTES = [1, 2, 3, 4, 5]
const NOTE_LABELS: Record<number, string> = {
  1: 'Très faible',
  2: 'Faible',
  3: 'Moyen',
  4: 'Bon',
  5: 'Excellent'
}

interface RapportAnalyseModalProps {
  projet: ProjetATraiter | null
  documents: DocumentProjet[]
  rapportComplet: RapportExistant | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  formatMontant: (montant: number) => string
  getDocTypeName: (type: string) => string
}

export default function RapportAnalyseModal({
  projet,
  documents,
  rapportComplet,
  isOpen,
  onClose,
  onSubmit,
  formatMontant,
  getDocTypeName
}: RapportAnalyseModalProps) {
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

  // Réinitialiser les états quand le modal s'ouvre avec un nouveau projet
  useEffect(() => {
    if (isOpen && projet) {
      // Charger les données existantes si disponibles
      setDossierComplet(rapportComplet?.dossier_complet ?? null)
      setDocumentsManquants(rapportComplet?.documents_manquants ?? '')
      setNotes({
        faisabilite: rapportComplet?.note_faisabilite ?? 0,
        impact: rapportComplet?.note_impact ?? 0,
        finance: rapportComplet?.note_finance ?? 0,
        equipe: rapportComplet?.note_equipe ?? 0,
        marche: rapportComplet?.note_marche ?? 0
      })
      setCommentaires({
        faisabilite: rapportComplet?.commentaire_faisabilite ?? '',
        impact: rapportComplet?.commentaire_impact ?? '',
        finance: rapportComplet?.commentaire_finance ?? '',
        equipe: rapportComplet?.commentaire_equipe ?? '',
        marche: rapportComplet?.commentaire_marche ?? ''
      })
      setDecision(rapportComplet?.decision ?? '')
      setCommentaireGlobal(rapportComplet?.commentaire_global ?? '')
      setRecommandations(rapportComplet?.recommandations ?? '')
      
      // Déterminer l'étape actuelle
      if (rapportComplet?.statut === 'transmis') {
        setEtapeActuelle(4)
      } else if (rapportComplet?.decision && rapportComplet.decision !== '') {
        setEtapeActuelle(4)
      } else if (rapportComplet?.note_faisabilite && rapportComplet.note_faisabilite > 0) {
        setEtapeActuelle(3)
      } else if (rapportComplet?.dossier_complet !== null) {
        setEtapeActuelle(2)
      } else {
        setEtapeActuelle(1)
      }
    }
  }, [isOpen, projet, rapportComplet])

  const getNoteColor = (note: number): string => {
    if (note <= 2) return 'bg-red-500'
    if (note === 3) return 'bg-orange-500'
    if (note === 4) return 'bg-green-500'
    return 'bg-emerald-500'
  }

  const calculerNoteTotale = (): number => {
    const valeurs = CRITERES.map(c => notes[c.key] || 0)
    const somme = valeurs.reduce((a, b) => a + b, 0)
    const toutesRemplies = valeurs.every(n => n > 0)
    return toutesRemplies ? somme / CRITERES.length : 0
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

  const handleSubmit = async () => {
    if (!peutPasserEtapeSuivante()) {
      setError('Veuillez remplir tous les champs requis')
      return
    }

    setSaving(true)
    setError('')
    try {
      await onSubmit({
        projet_id: projet?.id,
        dossier_complet: dossierComplet,
        documents_manquants: documentsManquants,
        notes: notes,
        commentaires: commentaires,
        decision: decision,
        commentaire_global: commentaireGlobal,
        recommandations: recommandations
      })
      setSuccess('✅ Rapport transmis avec succès !')
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la transmission')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen || !projet) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl">
        <div className="sticky top-0 bg-white px-6 py-4 border-b z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Rapport d'analyse</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">✕</button>
          </div>
          <p className="text-sm text-gray-500 mb-4">{projet.nom_projet}</p>
          
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((num, index) => (
              <div key={num} className="flex items-center flex-1">
                <button
                  onClick={() => { if (num <= etapeActuelle) setEtapeActuelle(num) }}
                  className={`flex flex-col items-center flex-1 ${num <= etapeActuelle ? 'cursor-pointer' : 'cursor-default opacity-50'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    num < etapeActuelle ? 'bg-green-500 text-white' :
                    num === etapeActuelle ? 'bg-primary text-white ring-4 ring-primary/20' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {num < etapeActuelle ? <CheckCircle className="h-4 w-4" /> : num}
                  </div>
                  <span className="text-[10px] mt-1 font-medium hidden sm:block">
                    {num === 1 ? 'Consulter' : num === 2 ? 'Vérifier' : num === 3 ? 'Analyser' : 'Transmettre'}
                  </span>
                </button>
                {index < 3 && (
                  <div className={`h-0.5 flex-1 -mt-4 ${num < etapeActuelle ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> {success}
            </div>
          )}

          {/* ÉTAPE 1 - Consultation */}
          {etapeActuelle === 1 && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Consultation du dossier</h3>
                <div className="bg-blue-50 rounded-xl p-4 text-left">
                  <p className="text-sm text-blue-800">
                    <strong>Promoteur :</strong> {projet.promoteur_nom_complet}<br />
                    <strong>Montant :</strong> {projet.montant_sollicite ? formatMontant(projet.montant_sollicite) : '-'}<br />
                    <strong>Documents :</strong> {documents.length} fichier(s)
                  </p>
                </div>
              </div>
              <button onClick={() => setEtapeActuelle(2)} className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 flex items-center justify-center gap-2">
                Commencer <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ÉTAPE 2 - Vérification */}
          {etapeActuelle === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold">Vérification des documents</h3>
              
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-medium">Documents :</h4>
                {documents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Aucun document téléchargé</p>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        {getDocTypeName(doc.type_document)}
                      </span>
                      <a href={doc.chemin_fichier} target="_blank" className="text-primary text-xs hover:underline">Voir</a>
                    </div>
                  ))
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Le dossier est-il complet ?</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDossierComplet(true)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      dossierComplet === true ? 'bg-green-500 text-white border-green-500' : 'border-gray-300 hover:bg-green-50'
                    }`}
                  >
                    ✅ Complet
                  </button>
                  <button
                    type="button"
                    onClick={() => setDossierComplet(false)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      dossierComplet === false ? 'bg-red-500 text-white border-red-500' : 'border-gray-300 hover:bg-red-50'
                    }`}
                  >
                    ❌ Incomplet
                  </button>
                </div>
              </div>

              {dossierComplet === false && (
                <div>
                  <label className="block text-sm font-medium mb-1">Documents manquants</label>
                  <textarea 
                    value={documentsManquants} 
                    onChange={(e) => setDocumentsManquants(e.target.value)} 
                    rows={3}
                    className="w-full px-4 py-2 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    placeholder="Listez les documents manquants..." 
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setEtapeActuelle(1)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  ← Retour
                </button>
                <button
                  onClick={() => {
                    if (dossierComplet !== null) {
                      setEtapeActuelle(3)
                      setError('')
                    } else {
                      setError('Veuillez indiquer si le dossier est complet')
                    }
                  }}
                  className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Continuer
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 - Analyse */}
          {etapeActuelle === 3 && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold">Grille d'analyse</h3>
              <p className="text-sm text-gray-500">Évaluez chaque critère de 1 à 5</p>

              {CRITERES.map((critere) => (
                <div key={critere.key} className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{critere.icon}</span>
                    <span className="text-sm font-semibold">{critere.label}</span>
                  </div>

                  <div className="flex items-center gap-1 flex-wrap">
                    {NOTES.map((note) => (
                      <button
                        key={note}
                        type="button"
                        onClick={() => setNotes(prev => ({ ...prev, [critere.key]: note }))}
                        className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                          notes[critere.key] === note
                            ? `${getNoteColor(note)} text-white scale-110 shadow-md`
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {note}
                      </button>
                    ))}
                    {notes[critere.key] > 0 && (
                      <span className="ml-2 text-xs font-medium">{NOTE_LABELS[notes[critere.key]]}</span>
                    )}
                  </div>

                  <textarea
                    value={commentaires[critere.key] || ''}
                    onChange={(e) => setCommentaires(prev => ({ ...prev, [critere.key]: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder={`Commentaire sur ${critere.label.toLowerCase()}...`}
                  />
                </div>
              ))}

              <div className="bg-primary/5 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm font-semibold">Note globale</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(calculerNoteTotale())
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-2xl font-bold text-primary">{calculerNoteTotale().toFixed(1)}/5</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setEtapeActuelle(2)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  ← Retour
                </button>
                <button
                  onClick={() => {
                    const notesManquantes = CRITERES.filter(c => !notes[c.key] || notes[c.key] <= 0)
                    if (notesManquantes.length === 0) {
                      setEtapeActuelle(4)
                      setError('')
                    } else {
                      setError('Veuillez noter tous les critères')
                    }
                  }}
                  className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Continuer
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 4 - Décision et Transmission */}
          {etapeActuelle === 4 && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold">Décision et transmission</h3>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold mb-3">Résumé</h4>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {CRITERES.map((critere) => (
                    <div key={critere.key} className="text-center">
                      <span className="text-xs">{critere.icon}</span>
                      <p className="text-lg font-bold">{notes[critere.key] || '-'}</p>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-primary">{calculerNoteTotale().toFixed(1)}/5</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Décision finale</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision('favorable')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      decision === 'favorable'
                        ? 'bg-green-500 text-white border-green-500 shadow-md'
                        : 'border-gray-300 hover:bg-green-50'
                    }`}
                  >
                    ✅ Favorable
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('defavorable')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      decision === 'defavorable'
                        ? 'bg-red-500 text-white border-red-500 shadow-md'
                        : 'border-gray-300 hover:bg-red-50'
                    }`}
                  >
                    ❌ Défavorable
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('reserve')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      decision === 'reserve'
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                        : 'border-gray-300 hover:bg-orange-50'
                    }`}
                  >
                    ⏸️ Réservé
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Commentaire global</label>
                <textarea 
                  value={commentaireGlobal} 
                  onChange={(e) => setCommentaireGlobal(e.target.value)} 
                  rows={4}
                  className="w-full px-4 py-2 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  placeholder="Synthèse de l'analyse et justification de la décision..." 
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Recommandations (optionnel)</label>
                <textarea 
                  value={recommandations} 
                  onChange={(e) => setRecommandations(e.target.value)} 
                  rows={2}
                  className="w-full px-4 py-2 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  placeholder="Suggestions d'amélioration, points à corriger..." 
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setEtapeActuelle(3)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  ← Retour
                </button>
                <button 
                  onClick={handleSubmit} 
                  disabled={saving || !peutPasserEtapeSuivante()}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {saving ? <><Loader2 className="h-5 w-5 animate-spin" /> Transmission...</> : <><Send className="h-4 w-4" /> Transmettre au comité</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}