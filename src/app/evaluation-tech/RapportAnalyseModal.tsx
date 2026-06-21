
// 'use client'

// import { useState, useEffect } from 'react'
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
//   const [dossierComplet, setDossierComplet] = useState<boolean | null>(null)
//   const [documentsManquants, setDocumentsManquants] = useState('')
//   const [notes, setNotes] = useState<Record<string, number>>({})
//   const [commentaires, setCommentaires] = useState<Record<string, string>>({})
//   const [decision, setDecision] = useState('')
//   const [commentaireGlobal, setCommentaireGlobal] = useState('')
//   const [recommandations, setRecommandations] = useState('')
//   const [saving, setSaving] = useState(false)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')

//   // Réinitialiser les états quand le modal s'ouvre avec un nouveau projet
//   useEffect(() => {
//     if (isOpen && projet) {
//       // Charger les données existantes si disponibles
//       setDossierComplet(rapportComplet?.dossier_complet ?? null)
//       setDocumentsManquants(rapportComplet?.documents_manquants ?? '')
//       setNotes({
//         faisabilite: rapportComplet?.note_faisabilite ?? 0,
//         impact: rapportComplet?.note_impact ?? 0,
//         finance: rapportComplet?.note_finance ?? 0,
//         equipe: rapportComplet?.note_equipe ?? 0,
//         marche: rapportComplet?.note_marche ?? 0
//       })
//       setCommentaires({
//         faisabilite: rapportComplet?.commentaire_faisabilite ?? '',
//         impact: rapportComplet?.commentaire_impact ?? '',
//         finance: rapportComplet?.commentaire_finance ?? '',
//         equipe: rapportComplet?.commentaire_equipe ?? '',
//         marche: rapportComplet?.commentaire_marche ?? ''
//       })
//       setDecision(rapportComplet?.decision ?? '')
//       setCommentaireGlobal(rapportComplet?.commentaire_global ?? '')
//       setRecommandations(rapportComplet?.recommandations ?? '')
      
//       // Déterminer l'étape actuelle
//       if (rapportComplet?.statut === 'transmis') {
//         setEtapeActuelle(4)
//       } else if (rapportComplet?.decision && rapportComplet.decision !== '') {
//         setEtapeActuelle(4)
//       } else if (rapportComplet?.note_faisabilite && rapportComplet.note_faisabilite > 0) {
//         setEtapeActuelle(3)
//       } else if (rapportComplet?.dossier_complet !== null) {
//         setEtapeActuelle(2)
//       } else {
//         setEtapeActuelle(1)
//       }
//     }
//   }, [isOpen, projet, rapportComplet])

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
//     if (!peutPasserEtapeSuivante()) {
//       setError('Veuillez remplir tous les champs requis')
//       return
//     }

//     setSaving(true)
//     setError('')
//     try {
//       await onSubmit({
//         projet_id: projet?.id,
//         dossier_complet: dossierComplet,
//         documents_manquants: documentsManquants,
//         notes: notes,
//         commentaires: commentaires,
//         decision: decision,
//         commentaire_global: commentaireGlobal,
//         recommandations: recommandations
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
//                 <div className="bg-blue-50 rounded-xl p-4 text-left">
//                   <p className="text-sm text-blue-800">
//                     <strong>Promoteur :</strong> {projet.promoteur_nom_complet}<br />
//                     <strong>Montant :</strong> {projet.montant_sollicite ? formatMontant(projet.montant_sollicite) : '-'}<br />
//                     <strong>Documents :</strong> {documents.length} fichier(s)
//                   </p>
//                 </div>
//               </div>
//               <button onClick={() => setEtapeActuelle(2)} className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 flex items-center justify-center gap-2">
//                 Commencer <ArrowRight className="h-4 w-4" />
//               </button>
//             </div>
//           )}

//           {/* ÉTAPE 2 - Vérification */}
//           {etapeActuelle === 2 && (
//             <div className="space-y-4">
//               <h3 className="text-base font-semibold">Vérification des documents</h3>
              
//               <div className="bg-gray-50 rounded-xl p-4 space-y-2">
//                 <h4 className="text-sm font-medium">Documents :</h4>
//                 {documents.length === 0 ? (
//                   <p className="text-sm text-gray-500 text-center py-4">Aucun document téléchargé</p>
//                 ) : (
//                   documents.map((doc) => (
//                     <div key={doc.id} className="flex items-center justify-between text-sm">
//                       <span className="flex items-center gap-2">
//                         <FileText className="h-4 w-4 text-gray-400" />
//                         {getDocTypeName(doc.type_document)}
//                       </span>
//                       <a href={doc.chemin_fichier} target="_blank" className="text-primary text-xs hover:underline">Voir</a>
//                     </div>
//                   ))
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-2">Le dossier est-il complet ?</label>
//                 <div className="flex gap-3">
//                   <button
//                     type="button"
//                     onClick={() => setDossierComplet(true)}
//                     className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
//                       dossierComplet === true ? 'bg-green-500 text-white border-green-500' : 'border-gray-300 hover:bg-green-50'
//                     }`}
//                   >
//                     ✅ Complet
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setDossierComplet(false)}
//                     className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
//                       dossierComplet === false ? 'bg-red-500 text-white border-red-500' : 'border-gray-300 hover:bg-red-50'
//                     }`}
//                   >
//                     ❌ Incomplet
//                   </button>
//                 </div>
//               </div>

//               {dossierComplet === false && (
//                 <div>
//                   <label className="block text-sm font-medium mb-1">Documents manquants</label>
//                   <textarea 
//                     value={documentsManquants} 
//                     onChange={(e) => setDocumentsManquants(e.target.value)} 
//                     rows={3}
//                     className="w-full px-4 py-2 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" 
//                     placeholder="Listez les documents manquants..." 
//                   />
//                 </div>
//               )}

//               <div className="flex gap-3">
//                 <button onClick={() => setEtapeActuelle(1)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition-colors">
//                   ← Retour
//                 </button>
//                 <button
//                   onClick={() => {
//                     if (dossierComplet !== null) {
//                       setEtapeActuelle(3)
//                       setError('')
//                     } else {
//                       setError('Veuillez indiquer si le dossier est complet')
//                     }
//                   }}
//                   className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
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
//                     className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
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
//                 <button onClick={() => setEtapeActuelle(2)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition-colors">
//                   ← Retour
//                 </button>
//                 <button
//                   onClick={() => {
//                     const notesManquantes = CRITERES.filter(c => !notes[c.key] || notes[c.key] <= 0)
//                     if (notesManquantes.length === 0) {
//                       setEtapeActuelle(4)
//                       setError('')
//                     } else {
//                       setError('Veuillez noter tous les critères')
//                     }
//                   }}
//                   className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
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
//                   <button
//                     type="button"
//                     onClick={() => setDecision('favorable')}
//                     className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
//                       decision === 'favorable'
//                         ? 'bg-green-500 text-white border-green-500 shadow-md'
//                         : 'border-gray-300 hover:bg-green-50'
//                     }`}
//                   >
//                     ✅ Favorable
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setDecision('defavorable')}
//                     className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
//                       decision === 'defavorable'
//                         ? 'bg-red-500 text-white border-red-500 shadow-md'
//                         : 'border-gray-300 hover:bg-red-50'
//                     }`}
//                   >
//                     ❌ Défavorable
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setDecision('reserve')}
//                     className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
//                       decision === 'reserve'
//                         ? 'bg-orange-500 text-white border-orange-500 shadow-md'
//                         : 'border-gray-300 hover:bg-orange-50'
//                     }`}
//                   >
//                     ⏸️ Réservé
//                   </button>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Commentaire global</label>
//                 <textarea 
//                   value={commentaireGlobal} 
//                   onChange={(e) => setCommentaireGlobal(e.target.value)} 
//                   rows={4}
//                   className="w-full px-4 py-2 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" 
//                   placeholder="Synthèse de l'analyse et justification de la décision..." 
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Recommandations (optionnel)</label>
//                 <textarea 
//                   value={recommandations} 
//                   onChange={(e) => setRecommandations(e.target.value)} 
//                   rows={2}
//                   className="w-full px-4 py-2 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" 
//                   placeholder="Suggestions d'amélioration, points à corriger..." 
//                 />
//               </div>

//               <div className="flex gap-3">
//                 <button onClick={() => setEtapeActuelle(3)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition-colors">
//                   ← Retour
//                 </button>
//                 <button 
//                   onClick={handleSubmit} 
//                   disabled={saving || !peutPasserEtapeSuivante()}
//                   className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
//                 >
//                   {saving ? <><Loader2 className="h-5 w-5 animate-spin" /> Transmission...</> : <><Send className="h-4 w-4" /> Transmettre au comité</>}
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
  FileText, Loader2, Eye,
  User, Mail, Phone, MapPin, Building2, Hash, Briefcase,
  DollarSign, Users, Clock, Target, CreditCard, Banknote,
  Building, Shield, TrendingUp
} from 'lucide-react'

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
  promoteur_profession?: string | null
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
  technicien_id: number | null
  date_consultation: string | null
  date_verification: string | null
  date_analyse: string | null
  date_decision: string | null
}

// ============================================
// CONSTANTES
// ============================================
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

  useEffect(() => {
    if (isOpen && projet) {
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

  // ============================================
  // FONCTIONS UTILITAIRES
  // ============================================
  const formatDate = (d: string) => 
    new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

  const getNoteColor = (note: number): string => {
    if (note <= 2) return 'bg-red-500'
    if (note === 3) return 'bg-orange-500'
    if (note === 4) return 'bg-green-500'
    return 'bg-emerald-500'
  }

  const getNoteBgColor = (note: number): string => {
    if (note <= 2) return 'bg-red-50 border-red-200'
    if (note === 3) return 'bg-orange-50 border-orange-200'
    if (note === 4) return 'bg-green-50 border-green-200'
    return 'bg-emerald-50 border-emerald-200'
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

  // ============================================
  // COMPOSANT LIGNE D'INFO - TAILLE AUGMENTÉE
  // ============================================
  const InfoRow = ({ label, value, icon, highlight = false }: { 
    label: string; value?: string | number | null; icon: React.ReactNode; highlight?: boolean 
  }) => (
    <div className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
      <div className="flex-shrink-0 text-gray-400">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
        <p className={`text-sm font-medium ${highlight ? 'text-primary font-semibold' : 'text-gray-800'}`}>
          {value ?? '-'}
        </p>
      </div>
    </div>
  )

  // ============================================
  // RENDU PRINCIPAL
  // ============================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl w-full max-w-[96vw] max-h-[92vh] flex shadow-2xl overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================== */}
        {/* PARTIE GAUCHE : DÉTAILS DU PROJET */}
        {/* ========================================== */}
        <div className="w-[40%] border-r border-gray-200 flex flex-col bg-gray-50/50">
          {/* En-tête */}
          <div className="flex-shrink-0 px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl flex-shrink-0">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-gray-900 truncate">{projet.nom_projet}</h3>
                <p className="text-sm text-gray-500">Soumis le {formatDate(projet.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            
            {/* SECTION 1: PROMOTEUR */}
            <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                Promoteur
              </h4>
              <div className="space-y-0">
                <InfoRow label="Nom complet" value={projet.promoteur_nom_complet} icon={<User className="h-4 w-4" />} highlight />
                <InfoRow label="Email" value={projet.promoteur_email} icon={<Mail className="h-4 w-4" />} />
                <InfoRow label="Téléphone" value={projet.promoteur_telephone} icon={<Phone className="h-4 w-4" />} />
                <InfoRow label="Adresse" value={projet.promoteur_adresse} icon={<MapPin className="h-4 w-4" />} />
                <InfoRow label="Ville" value={projet.promoteur_ville} icon={<MapPin className="h-4 w-4" />} />
                <InfoRow label="Province" value={projet.promoteur_province} icon={<MapPin className="h-4 w-4" />} />
                {projet.promoteur_profession && (
                  <InfoRow label="Profession" value={projet.promoteur_profession} icon={<Briefcase className="h-4 w-4" />} />
                )}
              </div>
            </div>

          

            {/* SECTION 3: PROJET */}
            <div className="bg-white rounded-xl p-4 border border-green-100 shadow-sm">
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-green-600" />
                Projet
              </h4>
              <div className="space-y-0">
                <InfoRow label="Secteur d'activité" value={projet.secteur_activite} icon={<Briefcase className="h-4 w-4" />} />
                <InfoRow label="Localisation" value={projet.localisation_projet} icon={<MapPin className="h-4 w-4" />} />
                <InfoRow label="Coût total" value={projet.cout_total ? formatMontant(projet.cout_total) : null} icon={<DollarSign className="h-4 w-4" />} highlight />
                <InfoRow label="Montant sollicité" value={projet.montant_sollicite ? formatMontant(projet.montant_sollicite) : null} icon={<DollarSign className="h-4 w-4" />} highlight />
                <InfoRow label="Emplois prévus" value={projet.nombre_emplois} icon={<Users className="h-4 w-4" />} />
                {projet.duree_realisation && (
                  <InfoRow label="Durée réalisation" value={projet.duree_realisation} icon={<Clock className="h-4 w-4" />} />
                )}
                {projet.objectifs_projet && (
                  <InfoRow label="Objectifs" value={projet.objectifs_projet} icon={<Target className="h-4 w-4" />} />
                )}
              </div>
            </div>

            {/* SECTION 4: FINANCES */}
            <div className="bg-white rounded-xl p-4 border border-yellow-100 shadow-sm">
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Banknote className="h-4 w-4 text-yellow-600" />
                Finance
              </h4>
              <div className="space-y-0">
                <InfoRow label="Apport personnel" value={projet.apport_personnel ? formatMontant(projet.apport_personnel) : null} icon={<CreditCard className="h-4 w-4" />} />
                {projet.source_financement && (
                  <InfoRow label="Source financement" value={projet.source_financement} icon={<Banknote className="h-4 w-4" />} />
                )}
                {projet.chiffre_affaires_previsionnel && (
                  <InfoRow label="CA prévisionnel" value={formatMontant(projet.chiffre_affaires_previsionnel)} icon={<TrendingUp className="h-4 w-4" />} />
                )}
                {projet.benefice_previsionnel && (
                  <InfoRow label="Bénéfice prévisionnel" value={formatMontant(projet.benefice_previsionnel)} icon={<TrendingUp className="h-4 w-4" />} />
                )}
                <InfoRow label="Durée remboursement" value={projet.duree_remboursement} icon={<Clock className="h-4 w-4" />} />
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
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  Description
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {projet.description_projet}
                </p>
              </div>
            )}

            {/* SECTION 6: DOCUMENTS */}
            <div className="bg-white rounded-xl p-4 border border-indigo-100 shadow-sm">
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                Documents ({documents.length})
              </h4>
              {documents.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-3">Aucun document disponible</p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700 truncate flex-1">{getDocTypeName(doc.type_document)}</span>
                      <a 
                        href={doc.chemin_fichier} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary text-sm font-medium hover:underline ml-3 flex-shrink-0 flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" /> Voir
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* PARTIE DROITE : FORMULAIRE D'ANALYSE */}
        {/* ========================================== */}
        <div className="w-[60%] flex flex-col">
          {/* En-tête avec progression */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Rapport d'analyse</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">✕</button>
            </div>
            
            <div className="flex items-center gap-1">
              {[
                { num: 1, label: 'Consulter' },
                { num: 2, label: 'Vérifier' },
                { num: 3, label: 'Analyser' },
                { num: 4, label: 'Transmettre' }
              ].map((etape, index) => (
                <div key={etape.num} className="flex items-center flex-1">
                  <button
                    onClick={() => { if (etape.num <= etapeActuelle) setEtapeActuelle(etape.num) }}
                    className={`flex flex-col items-center flex-1 ${etape.num <= etapeActuelle ? 'cursor-pointer' : 'cursor-default opacity-50'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      etape.num < etapeActuelle ? 'bg-green-500 text-white' :
                      etape.num === etapeActuelle ? 'bg-primary text-white ring-4 ring-primary/20' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {etape.num < etapeActuelle ? <CheckCircle className="h-4 w-4" /> : etape.num}
                    </div>
                    <span className="text-[10px] mt-1 font-medium hidden sm:block">{etape.label}</span>
                  </button>
                  {index < 3 && (
                    <div className={`h-0.5 flex-1 -mt-4 ${etape.num < etapeActuelle ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-shrink-0 px-6 pt-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 flex-shrink-0" /> {success}
              </div>
            )}
          </div>

          {/* Contenu du formulaire */}
          <div className="flex-1 overflow-y-auto p-6">
            
            {/* ÉTAPE 1 - Consultation */}
            {etapeActuelle === 1 && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="w-20 h-20 l bg-blue-100 flex items-center justify-center mx-auto mb-5">
                    <FileText className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Consultation du dossier</h3>
                  <p className="text-base text-gray-600 mb-6 max-w-md mx-auto">
                    Examinez attentivement tous les détails du projet affichés dans le panneau de gauche avant de commencer votre analyse.
                  </p>
             
                </div>
                <button 
                  onClick={() => setEtapeActuelle(2)} 
                  className="w-1/2 mx-auto py-4 bg-primary text-white rounded-xl text-base font-semibold hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  Commencer l'analyse <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* ÉTAPE 2 - Vérification */}
            {etapeActuelle === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Vérification des documents</h3>
                  <p className="text-base text-gray-600">
                    Consultez les documents dans le panneau de gauche, puis indiquez si le dossier est complet.
                  </p>
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-4">Le dossier est-il complet ?</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setDossierComplet(true)}
                      className={`flex-1 py-4 rounded-xl text-base font-semibold border-2 transition-all ${
                        dossierComplet === true 
                          ? 'bg-green-500 text-white border-green-500 shadow-md' 
                          : 'border-gray-300 hover:bg-green-50 hover:border-green-300 text-gray-700'
                      }`}
                    >
                      ✅ Complet
                    </button>
                    <button
                      type="button"
                      onClick={() => setDossierComplet(false)}
                      className={`flex-1 py-4 rounded-xl text-base font-semibold border-2 transition-all ${
                        dossierComplet === false 
                          ? 'bg-red-500 text-white border-red-500 shadow-md' 
                          : 'border-gray-300 hover:bg-red-50 hover:border-red-300 text-gray-700'
                      }`}
                    >
                      ❌ Incomplet
                    </button>
                  </div>
                </div>

                {dossierComplet === false && (
                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">Documents manquants</label>
                    <textarea 
                      value={documentsManquants} 
                      onChange={(e) => setDocumentsManquants(e.target.value)} 
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                      placeholder="Listez les documents manquants..." 
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-2">
                  <button 
                    onClick={() => setEtapeActuelle(1)} 
                    className="px-6 py-3 border border-gray-300 rounded-xl text-base font-medium hover:bg-gray-50 transition-colors"
                  >
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
                    className="flex-1 py-3 bg-primary text-white rounded-xl text-base font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 - Analyse */}
            {etapeActuelle === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Grille d'analyse</h3>
                  <p className="text-base text-gray-600">Évaluez chaque critère de 1 à 5</p>
                </div>

                {CRITERES.map((critere) => (
                  <div key={critere.key} className={`rounded-xl p-5 border ${getNoteBgColor(notes[critere.key] || 0)}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xl">{critere.icon}</span>
                      <span className="text-base font-bold text-gray-900">{critere.label}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      {NOTES.map((note) => (
                        <button
                          key={note}
                          type="button"
                          onClick={() => setNotes(prev => ({ ...prev, [critere.key]: note }))}
                          className={`w-12 h-12 rounded-xl text-base font-bold transition-all ${
                            notes[critere.key] === note
                              ? `${getNoteColor(note)} text-white scale-110 shadow-md`
                              : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {note}
                        </button>
                      ))}
                      {notes[critere.key] > 0 && (
                        <span className="ml-3 text-base font-medium text-gray-700">{NOTE_LABELS[notes[critere.key]]}</span>
                      )}
                    </div>

                    <textarea
                      value={commentaires[critere.key] || ''}
                      onChange={(e) => setCommentaires(prev => ({ ...prev, [critere.key]: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base resize-none bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder={`Commentaire sur ${critere.label.toLowerCase()}...`}
                    />
                  </div>
                ))}

                <div className="bg-primary/5 rounded-xl p-5 flex items-center justify-between border border-primary/20">
                  <span className="text-base font-bold text-gray-900">Note globale</span>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`h-6 w-6 ${
                            star <= Math.round(calculerNoteTotale())
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-3xl font-bold text-primary">{calculerNoteTotale().toFixed(1)}/5</span>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    onClick={() => setEtapeActuelle(2)} 
                    className="px-6 py-3 border border-gray-300 rounded-xl text-base font-medium hover:bg-gray-50 transition-colors"
                  >
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
                    className="flex-1 py-3 bg-primary text-white rounded-xl text-base font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 4 - Décision et Transmission */}
            {etapeActuelle === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900">Décision et transmission</h3>

                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="text-base font-bold text-gray-900 mb-4">Résumé de l'analyse</h4>
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    {CRITERES.map((critere) => (
                      <div key={critere.key} className="text-center">
                        <span className="text-2xl block mb-1">{critere.icon}</span>
                        <p className="text-2xl font-bold text-gray-900">{notes[critere.key] || '-'}</p>
                        <p className="text-xs text-gray-500 mt-1">{critere.label.split(' ')[0]}</p>
                      </div>
                    ))}
                  </div>
                  <div className="text-center pt-3 border-t border-gray-200">
                    <span className="text-3xl font-bold text-primary">{calculerNoteTotale().toFixed(1)}/5</span>
                  </div>
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-4">Décision finale</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setDecision('favorable')}
                      className={`flex-1 py-4 rounded-xl text-base font-semibold border-2 transition-all ${
                        decision === 'favorable'
                          ? 'bg-green-500 text-white border-green-500 shadow-md'
                          : 'border-gray-300 hover:bg-green-50 hover:border-green-300 text-gray-700'
                      }`}
                    >
                      ✅ Favorable
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecision('defavorable')}
                      className={`flex-1 py-4 rounded-xl text-base font-semibold border-2 transition-all ${
                        decision === 'defavorable'
                          ? 'bg-red-500 text-white border-red-500 shadow-md'
                          : 'border-gray-300 hover:bg-red-50 hover:border-red-300 text-gray-700'
                      }`}
                    >
                      ❌ Défavorable
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecision('reserve')}
                      className={`flex-1 py-4 rounded-xl text-base font-semibold border-2 transition-all ${
                        decision === 'reserve'
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                          : 'border-gray-300 hover:bg-orange-50 hover:border-orange-300 text-gray-700'
                      }`}
                    >
                      ⏸️ Réservé
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2">Commentaire global *</label>
                  <textarea 
                    value={commentaireGlobal} 
                    onChange={(e) => setCommentaireGlobal(e.target.value)} 
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                    placeholder="Synthèse de l'analyse et justification de la décision..." 
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2">Recommandations (optionnel)</label>
                  <textarea 
                    value={recommandations} 
                    onChange={(e) => setRecommandations(e.target.value)} 
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                    placeholder="Suggestions d'amélioration, points à corriger..." 
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    onClick={() => setEtapeActuelle(3)} 
                    className="px-6 py-3 border border-gray-300 rounded-xl text-base font-medium hover:bg-gray-50 transition-colors"
                  >
                    ← Retour
                  </button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={saving || !peutPasserEtapeSuivante()}
                    className="flex-1 py-3 bg-green-600 text-white rounded-xl text-base font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-md"
                  >
                    {saving ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Transmission en cours...</>
                    ) : (
                      <><Send className="h-5 w-5" /> Transmettre au comité</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}