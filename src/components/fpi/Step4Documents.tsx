
// // Step4Documents.tsx - VERSION SIMPLIFIÉE
// 'use client'

// import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
// import { FileText, CheckCircle, Upload, AlertCircle, Eye, Trash2, Loader2, Sparkles, ShieldAlert, ShieldCheck } from 'lucide-react'
// import { DocumentsFPI } from '@/types/fpi'
// import { 
//   validateDocumentFile, 
//   reconstituerIdentiteCompletteDepuisCarte,
//   getNomCompletRCCM,
//   getLocaliteRCCM,
//   getLocaliteRCCMFromIDNat,
//   getNumeroNational,
//   getNumeroElecteur,
//   getNumeroRCCM,
//   getChampValeur,
//   type VerificationResult 
// } from '@/lib/documentVerification'

// type DocumentType = {
//   key: keyof DocumentsFPI
//   nom: string
//   description: string
//   obligatoire: boolean
//   champsAVerifier?: string[]
//   motsCles?: string[]
// }

// const DOCUMENTS_REQUIS: DocumentType[] = [
//   {
//     key: 'carte_electeur',
//     nom: "Carte d'électeur",
//     description: "Carte d'électeur valide (recto)",
//     obligatoire: true,
//     champsAVerifier: ['nom', 'postnom', 'prenom', 'numero_electeur', 'date_naissance'],
//     motsCles: ['carte', 'électeur', 'CENI', 'commission électorale'],
//   },
//   {
//     key: 'rccm',
//     nom: 'RCCM',
//     description: 'Registre du Commerce et du Crédit Mobilier',
//     obligatoire: true,
//     champsAVerifier: ['nom_complet', 'numero_rccm', 'localite'],
//     motsCles: ['RCCM', 'registre du commerce', 'immatriculation'],
//   },
//   {
//     key: 'id_nat',
//     nom: 'ID NAT',
//     description: "Carte d'identité nationale",
//     obligatoire: true,
//     champsAVerifier: ['nom_complet', 'numero_national', 'localite_rccm'],
//     motsCles: ['carte identité', 'identification', 'nationale', 'ID'],
//   },
//   {
//     key: 'attestation_fiscale',
//     nom: 'Attestation fiscale',
//     description: 'Attestation fiscale en cours de validité',
//     obligatoire: true,
//     champsAVerifier: ['numero_rccm', 'raison_sociale'],
//     motsCles: ['attestation', 'fiscale', 'impôt', 'DGI'],
//   },
//   {
//     key: 'attestation_cnss',
//     nom: 'Attestation CNSS',
//     description: 'Attestation de la Caisse Nationale de Sécurité Sociale',
//     obligatoire: true,
//     champsAVerifier: ['raison_sociale', 'numero_affiliation'],
//     motsCles: ['CNSS', 'sécurité sociale', 'caisse nationale'],
//   },
// ]

// type Props = {
//   documents: DocumentsFPI
//   onChange: (documents: DocumentsFPI) => void
//   onVerificationChange?: (resultats: Record<string, VerificationResult | null>) => void
//   onCroisementValidityChange?: (isValid: boolean, details: string[]) => void
//   // NOUVEAU : Reçoit les résultats de vérification du parent
//   resultatsExternes?: Record<string, VerificationResult | null>
// }

// // Fonctions de comparaison
// const normaliserPourComparaison = (texte: string): string => {
//   if (!texte) return ''
//   return texte
//     .toLowerCase()
//     .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
//     .replace(/[^a-z0-9]/g, '')
//     .trim()
// }

// const sontIdentiques = (a: string, b: string): boolean => {
//   if (!a || !b) return false
//   const normalisedA = normaliserPourComparaison(a)
//   const normalisedB = normaliserPourComparaison(b)
//   return normalisedA === normalisedB
// }

// const sontNomsIdentiques = (nom1: string, nom2: string): boolean => {
//   if (!nom1 || !nom2) return false
  
//   const mots1 = nom1.toLowerCase()
//     .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
//     .replace(/[^a-z0-9\s]/g, '')
//     .trim()
//     .split(/\s+/)
//     .filter(m => m.length > 0)
//     .sort()
  
//   const mots2 = nom2.toLowerCase()
//     .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
//     .replace(/[^a-z0-9\s]/g, '')
//     .trim()
//     .split(/\s+/)
//     .filter(m => m.length > 0)
//     .sort()
  
//   if (mots1.length !== mots2.length) return false
  
//   return mots1.every((mot, index) => mot === mots2[index])
// }

// type Croisement = {
//   champ: string
//   docSource: string
//   docCible: string
//   extraireValeurSource: (resultats: Record<string, VerificationResult | null>) => string
//   extraireValeurCible: (resultats: Record<string, VerificationResult | null>) => string
//   comparer: (a: string, b: string) => boolean
// }

// const CROISEMENTS: Croisement[] = [
//   {
//     champ: "Identité Complète",
//     docSource: "carte_electeur",
//     docCible: "rccm",
//     extraireValeurSource: (resultats) => {
//       return reconstituerIdentiteCompletteDepuisCarte(resultats['carte_electeur'])
//     },
//     extraireValeurCible: (resultats) => {
//       return getNomCompletRCCM(resultats['rccm'])
//     },
//     comparer: sontNomsIdentiques
//   },
//   {
//     champ: "Numéro National",
//     docSource: "id_nat",
//     docCible: "carte_electeur",
//     extraireValeurSource: (resultats) => {
//       return getNumeroNational(resultats['id_nat'])
//     },
//     extraireValeurCible: (resultats) => {
//       return getNumeroElecteur(resultats['carte_electeur'])
//     },
//     comparer: sontIdentiques
//   },
//   {
//     champ: "Numéro RCCM",
//     docSource: "rccm",
//     docCible: "attestation_fiscale",
//     extraireValeurSource: (resultats) => {
//       return getNumeroRCCM(resultats['rccm'])
//     },
//     extraireValeurCible: (resultats) => {
//       return getNumeroRCCM(resultats['attestation_fiscale'])
//     },
//     comparer: sontIdentiques
//   },
//   {
//     champ: "Siège Social",
//     docSource: "id_nat",
//     docCible: "rccm",
//     extraireValeurSource: (resultats) => {
//       return getLocaliteRCCMFromIDNat(resultats['id_nat'])
//     },
//     extraireValeurCible: (resultats) => {
//       return getLocaliteRCCM(resultats['rccm'])
//     },
//     comparer: sontIdentiques
//   }
// ]

// type MatchStatus = {
//   champ: string
//   valeurSource: string
//   valeurCible: string
//   sourceDoc: string
//   cibleDoc: string
//   estMatch: boolean | null
//   detailCarteElecteur?: { nom: string; postnom: string; prenom: string }
// }

// export default function Step4Documents({ 
//   documents, 
//   onChange, 
//   onVerificationChange,
//   onCroisementValidityChange,
//   resultatsExternes
// }: Props) {
//   const [previewDoc, setPreviewDoc] = useState<{ key: keyof DocumentsFPI; url: string } | null>(null)
//   const [errors, setErrors] = useState<Record<string, string>>({})

//   // Utiliser les résultats externes (du parent) ou un état local vide
//   const resultatsVerification = resultatsExternes || {}

//   const handleFileChange = (key: keyof DocumentsFPI, file: File | undefined) => {
//     if (file) {
//       const validation = validateDocumentFile(file)
//       if (!validation.valid) {
//         setErrors(prev => ({ ...prev, [key]: validation.message || 'Fichier invalide' }))
//         return
//       }
//     }
    
//     setErrors(prev => ({ ...prev, [key]: '' }))
//     onChange({ ...documents, [key]: file || null })
//   }

//   const handleRemove = (key: keyof DocumentsFPI) => {
//     onChange({ ...documents, [key]: undefined })
//     setErrors(prev => ({ ...prev, [key]: '' }))
//   }

//   const handlePreview = (key: keyof DocumentsFPI) => {
//     const file = documents[key]
//     if (file) {
//       const url = URL.createObjectURL(file)
//       setPreviewDoc({ key, url })
//     }
//   }

//   const getFileSize = (file: File) => {
//     const sizeKB = file.size / 1024
//     if (sizeKB < 1024) return `${sizeKB.toFixed(1)} KB`
//     return `${(sizeKB / 1024).toFixed(1)} MB`
//   }

//   const getMatchStatuses = useCallback((): MatchStatus[] => {
//     return CROISEMENTS.map(croisement => {
//       const valeurSource = croisement.extraireValeurSource(resultatsVerification)
//       const valeurCible = croisement.extraireValeurCible(resultatsVerification)
      
//       let estMatch: boolean | null = null
//       if (valeurSource && valeurCible) {
//         estMatch = croisement.comparer(valeurSource, valeurCible)
//       }
      
//       let detailCarteElecteur: { nom: string; postnom: string; prenom: string } | undefined
//       if (croisement.champ === "Identité Complète") {
//         const resultatCE = resultatsVerification['carte_electeur']
//         detailCarteElecteur = {
//           nom: getChampValeur(resultatCE, 'nom'),
//           postnom: getChampValeur(resultatCE, 'postnom'),
//           prenom: getChampValeur(resultatCE, 'prenom')
//         }
//       }
      
//       return {
//         champ: croisement.champ,
//         valeurSource,
//         valeurCible,
//         sourceDoc: croisement.docSource,
//         cibleDoc: croisement.docCible,
//         estMatch,
//         detailCarteElecteur
//       }
//     })
//   }, [resultatsVerification])

//   const getValidationCroisements = useCallback((): { estValide: boolean; details: string[] } => {
//     const matches = getMatchStatuses()
//     const details: string[] = []
    
//     const docsRequis = ['carte_electeur', 'rccm', 'id_nat', 'attestation_fiscale', 'attestation_cnss'] as const
//     const docsNonVerifies = docsRequis.filter(key => {
//       const file = documents[key]
//       const verification = resultatsVerification[key]
//       return file && !verification
//     })
    
//     if (docsNonVerifies.length > 0) {
//       const noms = docsNonVerifies.map(k => 
//         DOCUMENTS_REQUIS.find(d => d.key === k)?.nom || k
//       )
//       details.push(`Documents en attente de vérification : ${noms.join(', ')}`)
//       return { estValide: false, details }
//     }
    
//     let tousValides = true
    
//     for (const match of matches) {
//       if (match.estMatch === null) {
//         const docANom = DOCUMENTS_REQUIS.find(d => d.key === match.sourceDoc)?.nom || match.sourceDoc
//         const docBNom = DOCUMENTS_REQUIS.find(d => d.key === match.cibleDoc)?.nom || match.cibleDoc
        
//         if (!match.valeurSource && !match.valeurCible) {
//           details.push(`❌ ${match.champ} : Aucune valeur extraite de ${docANom} ni de ${docBNom}`)
//         } else if (!match.valeurSource) {
//           details.push(`❌ ${match.champ} : Valeur manquante dans ${docANom}`)
//         } else if (!match.valeurCible) {
//           details.push(`❌ ${match.champ} : Valeur manquante dans ${docBNom}`)
//         }
//         tousValides = false
//       } else if (match.estMatch === false) {
//         details.push(`❌ ${match.champ} : Incohérence détectée - "${match.valeurSource}" ≠ "${match.valeurCible}"`)
//         tousValides = false
//       } else {
//         details.push(`✅ ${match.champ} : Correspondance validée`)
//       }
//     }
    
//     if (tousValides) {
//       details.unshift('✅ Tous les croisements sont valides.')
//     } else {
//       details.unshift('⚠️ Des problèmes de cohérence ont été détectés :')
//     }
    
//     return { estValide: tousValides, details }
//   }, [getMatchStatuses, documents, resultatsVerification])

//   const validationCroisements = useMemo(() => {
//     return getValidationCroisements()
//   }, [getValidationCroisements])

//   const prevValidationRef = useRef<string>('')

//   useEffect(() => {
//     if (onCroisementValidityChange) {
//       const currentValidation = JSON.stringify({
//         estValide: validationCroisements.estValide,
//         details: validationCroisements.details
//       })
      
//       if (currentValidation !== prevValidationRef.current) {
//         prevValidationRef.current = currentValidation
//         onCroisementValidityChange(
//           validationCroisements.estValide, 
//           validationCroisements.details
//         )
//       }
//     }
//   }, [validationCroisements, onCroisementValidityChange])

//   const getConformiteGlobale = useCallback(() => {
//     const matches = getMatchStatuses()
//     const totalCroisements = matches.length
    
//     const matchesValides = matches.filter(m => m.estMatch === true)
//     const matchesEnAttente = matches.filter(m => m.estMatch === null)
    
//     if (matchesEnAttente.length === totalCroisements) {
//       return { 
//         pourcentage: 0, 
//         message: "Vérification en attente", 
//         estValide: false 
//       }
//     }
    
//     const pourcentage = (matchesValides.length / totalCroisements) * 100
//     const estValide = pourcentage === 100
    
//     return {
//       pourcentage,
//       message: estValide 
//         ? "✅ CONFORMITÉ GLOBALE : 100% VALIDE" 
//         : `⚠️ Conformité: ${Math.round(pourcentage)}% - ${totalCroisements - matchesValides.length} problème(s)`,
//       estValide
//     }
//   }, [getMatchStatuses])

//   const documentsUploaded = Object.values(documents).filter(Boolean).length
//   const allUploaded = documentsUploaded === DOCUMENTS_REQUIS.length
//   const documentsVerifies = Object.values(resultatsVerification).filter(r => r !== null).length
  
//   const conformite = useMemo(() => getConformiteGlobale(), [getConformiteGlobale])
//   const matchStatuses = useMemo(() => getMatchStatuses(), [getMatchStatuses])
//   const detailsValidation = validationCroisements.details

//   return (
//     <div className="space-y-6">
//       {/* Bannière info */}
//       <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
//         <div className="flex items-start gap-3">
//           <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
//             <Sparkles className="h-5 w-5 text-indigo-600" />
//           </div>
//           <div className="flex-1">
//             <h3 className="text-sm font-semibold text-indigo-900 mb-1">
//               Documents requis
//             </h3>
//             <p className="text-xs text-indigo-700">
//               Téléchargez tous les documents obligatoires. La vérification sera effectuée automatiquement lors du passage au paiement.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Bannière de statut des croisements - affiché seulement après vérification */}
//       {documentsVerifies >= 2 && (
//         <div className={`rounded-xl p-4 border ${
//           conformite.estValide 
//             ? 'bg-green-50 border-green-200' 
//             : 'bg-amber-50 border-amber-200'
//         }`}>
//           <div className="flex items-center gap-2 mb-2">
//             {conformite.estValide ? (
//               <ShieldCheck className="h-5 w-5 text-green-600" />
//             ) : (
//               <ShieldAlert className="h-5 w-5 text-amber-600" />
//             )}
//             <span className={`text-sm font-bold ${
//               conformite.estValide ? 'text-green-700' : 'text-amber-700'
//             }`}>
//               {conformite.message}
//             </span>
//           </div>
          
//           <div className="space-y-1 mt-2">
//             {detailsValidation.map((detail, idx) => (
//               <p 
//                 key={idx} 
//                 className={`text-xs ${
//                   detail.startsWith('✅') 
//                     ? 'text-green-600' 
//                     : detail.startsWith('⚠️') 
//                       ? 'text-amber-600 font-medium' 
//                       : 'text-red-600'
//                 }`}
//               >
//                 {detail}
//               </p>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* TABLEAU DE CROISEMENT - affiché seulement après vérification */}
//       {documentsVerifies >= 2 && (
//         <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
//           <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
//             <h3 className="text-sm font-semibold text-gray-700">
//               Résultat du Croisement des Données
//             </h3>
//             <p className="text-xs text-gray-500 mt-0.5">
//               Vérification de la cohérence entre les documents
//             </p>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-gray-50 border-b border-gray-200">
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Champ</th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Document Source A</th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Document Source B</th>
//                   <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Statut</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {matchStatuses.map((match, idx) => {
//                   const docANom = DOCUMENTS_REQUIS.find(d => d.key === match.sourceDoc)?.nom || match.sourceDoc
//                   const docBNom = DOCUMENTS_REQUIS.find(d => d.key === match.cibleDoc)?.nom || match.cibleDoc
                  
//                   return (
//                     <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
//                       <td className="px-4 py-3 font-medium text-gray-800">{match.champ}</td>
//                       <td className="px-4 py-3">
//                         <div className="text-xs text-gray-500 mb-1">{docANom}</div>
//                         <div className="font-mono text-sm text-gray-800">
//                           {match.valeurSource || <span className="text-gray-400 italic">Non extrait</span>}
//                         </div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="text-xs text-gray-500 mb-1">{docBNom}</div>
//                         <div className="font-mono text-sm text-gray-800">
//                           {match.valeurCible || <span className="text-gray-400 italic">Non extrait</span>}
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 text-center">
//                         {match.estMatch === null ? (
//                           <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
//                             <AlertCircle className="h-3 w-3" />
//                             Données manquantes
//                           </span>
//                         ) : match.estMatch ? (
//                           <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
//                             <CheckCircle className="h-3 w-3" />
//                             Identique
//                           </span>
//                         ) : (
//                           <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
//                             <AlertCircle className="h-3 w-3" />
//                             ✗ Incohérence
//                           </span>
//                         )}
//                       </td>
//                     </tr>
//                   )
//                 })}
//               </tbody>
              
//               <tfoot>
//                 <tr className="bg-gray-100 border-t-2 border-gray-200">
//                   <td colSpan={4} className="px-4 py-3">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         {conformite.estValide ? (
//                           <ShieldCheck className="h-5 w-5 text-green-600" />
//                         ) : (
//                           <ShieldAlert className="h-5 w-5 text-yellow-600" />
//                         )}
//                         <span className={`text-sm font-bold ${conformite.estValide ? 'text-green-700' : 'text-yellow-700'}`}>
//                           {conformite.message}
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <span className="text-xs text-gray-500">Taux de conformité:</span>
//                         <span className={`text-sm font-bold ${conformite.estValide ? 'text-green-600' : 'text-red-600'}`}>
//                           {Math.round(conformite.pourcentage)}%
//                         </span>
//                       </div>
//                     </div>
//                   </td>
//                 </tr>
//               </tfoot>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Progression */}
//       <div className="bg-gray-50 rounded-xl p-4">
//         <div className="flex items-center justify-between mb-2">
//           <span className="text-sm font-medium text-gray-700">
//             Progression des documents
//           </span>
//           <span className="text-sm font-semibold text-primary">
//             {documentsUploaded}/{DOCUMENTS_REQUIS.length}
//           </span>
//         </div>
//         <div className="w-full bg-gray-200 rounded-full h-2">
//           <div
//             className={`h-2 rounded-full transition-all duration-500 ${
//               allUploaded ? 'bg-green-500' : 'bg-primary'
//             }`}
//             style={{ width: `${(documentsUploaded / DOCUMENTS_REQUIS.length) * 100}%` }}
//           />
//         </div>
//       </div>

//       {/* Liste des documents - SIMPLIFIÉE : juste upload, pas de vérification manuelle */}
//       <div className="space-y-3">
//         {DOCUMENTS_REQUIS.map((doc) => {
//           const file = documents[doc.key]
//           const verification = resultatsVerification[doc.key]
//           const error = errors[doc.key]
          
//           let borderColor = 'border-gray-200'
//           let bgColor = 'bg-white'
//           let statusIcon = <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
          
//           if (error) {
//             borderColor = 'border-red-200'
//             bgColor = 'bg-red-50'
//             statusIcon = <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
//           } else if (file && verification) {
//             if (verification.estValide) {
//               borderColor = 'border-green-200'
//               bgColor = 'bg-green-50'
//               statusIcon = <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
//             } else {
//               borderColor = 'border-yellow-200'
//               bgColor = 'bg-yellow-50'
//               statusIcon = <ShieldAlert className="h-5 w-5 text-yellow-500 flex-shrink-0" />
//             }
//           } else if (file) {
//             borderColor = 'border-blue-200'
//             bgColor = 'bg-blue-50'
//             statusIcon = <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
//           }
          
//           return (
//             <div
//               key={doc.key}
//               className={`p-4 rounded-xl border-2 transition-all ${borderColor} ${bgColor}`}
//             >
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3 flex-1 min-w-0">
//                   {statusIcon}
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2">
//                       <p className="text-sm font-medium text-gray-900">
//                         {doc.nom}
//                       </p>
//                       {doc.obligatoire && (
//                         <span className="inline-flex items-center px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
//                           Obligatoire
//                         </span>
//                       )}
//                       {verification && (
//                         <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
//                           verification.estValide 
//                             ? 'bg-green-100 text-green-700' 
//                             : 'bg-yellow-100 text-yellow-700'
//                         }`}>
//                           Score: {verification.score}%
//                         </span>
//                       )}
//                     </div>
//                     <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                    
//                     {error && (
//                       <p className="text-xs text-red-600 mt-1 font-medium">{error}</p>
//                     )}
                    
//                     {file && (
//                       <div className="flex items-center gap-2 mt-1">
//                         <p className="text-xs text-green-600 font-medium">{file.name}</p>
//                         <p className="text-xs text-gray-400">({getFileSize(file)})</p>
//                       </div>
//                     )}

//                     {/* Résultat vérification AI */}
//                     {verification && (
//                       <div className={`mt-2 p-2 rounded border ${
//                         verification.estValide 
//                           ? 'bg-green-50 border-green-200' 
//                           : 'bg-yellow-50 border-yellow-200'
//                       }`}>
//                         {verification.champsExtraits && verification.champsExtraits.length > 0 && (
//                           <div className="mb-1">
//                             {verification.champsExtraits.map((champ: any, idx: number) => (
//                               <div key={idx} className="flex items-center justify-between py-0.5 text-xs">
//                                 <span className="text-gray-500 capitalize">{champ.nom.replace(/_/g, ' ')} :</span>
//                                 <span className={`font-medium ${champ.valeur ? 'text-gray-800' : 'text-red-400 italic'}`}>
//                                   {champ.valeur || 'Non extrait'}
//                                 </span>
//                               </div>
//                             ))}
//                           </div>
//                         )}
                        
//                         {verification.champsManquants && verification.champsManquants.length > 0 && (
//                           <div className="mb-1">
//                             <p className="text-xs text-red-600 font-medium">
//                               ⚠️ Champs manquants : {verification.champsManquants.join(', ')}
//                             </p>
//                           </div>
//                         )}
                        
//                         <p className="text-xs text-gray-500 italic mt-1">{verification.commentaire}</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2 ml-4">
//                   {file ? (
//                     <>
//                       <button
//                         type="button"
//                         onClick={() => handlePreview(doc.key)}
//                         className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-white"
//                         title="Aperçu"
//                       >
//                         <Eye className="h-4 w-4" />
//                       </button>
                      
//                       <button
//                         type="button"
//                         onClick={() => handleRemove(doc.key)}
//                         className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-white"
//                         title="Supprimer"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </button>
//                     </>
//                   ) : (
//                     <label className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 cursor-pointer transition-colors">
//                       <Upload className="h-3 w-3" />
//                       Télécharger
//                       <input
//                         type="file"
//                         className="hidden"
//                         accept=".pdf,.jpg,.jpeg,.png"
//                         onChange={(e) => {
//                           const file = e.target.files?.[0]
//                           if (file) {
//                             handleFileChange(doc.key, file)
//                           }
//                         }}
//                       />
//                     </label>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )
//         })}
//       </div>

//       {/* Information */}
//       <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
//         <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
//         <div className="text-xs text-blue-700">
//           <p className="mb-1">Formats acceptés : JPG, PNG, PDF (max 10MB).</p>
//           <p>La vérification et le croisement des documents seront effectués automatiquement lors du passage au paiement.</p>
//         </div>
//       </div>

//       {/* Modal d'aperçu */}
//       {previewDoc && (
//         <div
//           className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4"
//           onClick={() => setPreviewDoc(null)}
//         >
//           <div 
//             className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="p-4 border-b border-gray-100 flex items-center justify-between">
//               <h4 className="text-sm font-semibold">
//                 Aperçu: {DOCUMENTS_REQUIS.find(d => d.key === previewDoc.key)?.nom}
//               </h4>
//               <button
//                 onClick={() => setPreviewDoc(null)}
//                 className="p-1 hover:bg-gray-100 rounded-lg"
//               >
//                 ✕
//               </button>
//             </div>
//             <div className="p-4 flex items-center justify-center max-h-[60vh] overflow-auto">
//               {documents[previewDoc.key]?.type.startsWith('image/') ? (
//                 <img
//                   src={previewDoc.url}
//                   alt="Aperçu du document"
//                   className="max-w-full max-h-[50vh] object-contain"
//                 />
//               ) : (
//                 <div className="text-center py-8">
//                   <FileText className="h-16 w-16 text-gray-300 mx-auto mb-2" />
//                   <p className="text-sm text-gray-500">
//                     Fichier: {documents[previewDoc.key]?.name}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// Step4Documents.tsx - VERSION SIMPLIFIÉE
'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { FileText, CheckCircle, Upload, AlertCircle, Eye, Trash2, ShieldAlert, ShieldCheck } from 'lucide-react'
import { DocumentsFPI } from '@/types/fpi'
import { 
  validateDocumentFile, 
  reconstituerIdentiteCompletteDepuisCarte,
  getNomCompletRCCM,
  getLocaliteRCCM,
  getLocaliteRCCMFromIDNat,
  getNumeroNational,
  getNumeroElecteur,
  getNumeroRCCM,
  getChampValeur,
  type VerificationResult 
} from '@/lib/documentVerification'

type DocumentType = {
  key: keyof DocumentsFPI
  nom: string
  description: string
  obligatoire: boolean
  champsAVerifier?: string[]
  motsCles?: string[]
}

const DOCUMENTS_REQUIS: DocumentType[] = [
  {
    key: 'carte_electeur',
    nom: "Carte d'électeur",
    description: "Carte d'électeur valide (recto)",
    obligatoire: true,
    champsAVerifier: ['nom', 'postnom', 'prenom', 'numero_electeur', 'date_naissance'],
    motsCles: ['carte', 'électeur', 'CENI', 'commission électorale'],
  },
  {
    key: 'rccm',
    nom: 'RCCM',
    description: 'Registre du Commerce et du Crédit Mobilier',
    obligatoire: true,
    champsAVerifier: ['nom_complet', 'numero_rccm', 'localite'],
    motsCles: ['RCCM', 'registre du commerce', 'immatriculation'],
  },
  {
    key: 'id_nat',
    nom: 'ID NAT',
    description: "Carte d'identité nationale",
    obligatoire: true,
    champsAVerifier: ['nom_complet', 'numero_national', 'localite_rccm'],
    motsCles: ['carte identité', 'identification', 'nationale', 'ID'],
  },
  {
    key: 'attestation_fiscale',
    nom: 'Attestation fiscale',
    description: 'Attestation fiscale en cours de validité',
    obligatoire: true,
    champsAVerifier: ['numero_rccm', 'raison_sociale'],
    motsCles: ['attestation', 'fiscale', 'impôt', 'DGI'],
  },
  {
    key: 'attestation_cnss',
    nom: 'Attestation CNSS',
    description: 'Attestation de la Caisse Nationale de Sécurité Sociale',
    obligatoire: true,
    champsAVerifier: ['raison_sociale', 'numero_affiliation'],
    motsCles: ['CNSS', 'sécurité sociale', 'caisse nationale'],
  },
]

type Props = {
  documents: DocumentsFPI
  onChange: (documents: DocumentsFPI) => void
  onVerificationChange?: (resultats: Record<string, VerificationResult | null>) => void
  onCroisementValidityChange?: (isValid: boolean, details: string[]) => void
  resultatsExternes?: Record<string, VerificationResult | null>
}

// Fonctions de comparaison
const normaliserPourComparaison = (texte: string): string => {
  if (!texte) return ''
  return texte
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

const sontIdentiques = (a: string, b: string): boolean => {
  if (!a || !b) return false
  const normalisedA = normaliserPourComparaison(a)
  const normalisedB = normaliserPourComparaison(b)
  return normalisedA === normalisedB
}

const sontNomsIdentiques = (nom1: string, nom2: string): boolean => {
  if (!nom1 || !nom2) return false
  
  const mots1 = nom1.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(m => m.length > 0)
    .sort()
  
  const mots2 = nom2.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(m => m.length > 0)
    .sort()
  
  if (mots1.length !== mots2.length) return false
  
  return mots1.every((mot, index) => mot === mots2[index])
}

type Croisement = {
  champ: string
  docSource: string
  docCible: string
  extraireValeurSource: (resultats: Record<string, VerificationResult | null>) => string
  extraireValeurCible: (resultats: Record<string, VerificationResult | null>) => string
  comparer: (a: string, b: string) => boolean
}

const CROISEMENTS: Croisement[] = [
  {
    champ: "Identité Complète",
    docSource: "carte_electeur",
    docCible: "rccm",
    extraireValeurSource: (resultats) => {
      return reconstituerIdentiteCompletteDepuisCarte(resultats['carte_electeur'])
    },
    extraireValeurCible: (resultats) => {
      return getNomCompletRCCM(resultats['rccm'])
    },
    comparer: sontNomsIdentiques
  },
  {
    champ: "Numéro National",
    docSource: "id_nat",
    docCible: "carte_electeur",
    extraireValeurSource: (resultats) => {
      return getNumeroNational(resultats['id_nat'])
    },
    extraireValeurCible: (resultats) => {
      return getNumeroElecteur(resultats['carte_electeur'])
    },
    comparer: sontIdentiques
  },
  {
    champ: "Numéro RCCM",
    docSource: "rccm",
    docCible: "attestation_fiscale",
    extraireValeurSource: (resultats) => {
      return getNumeroRCCM(resultats['rccm'])
    },
    extraireValeurCible: (resultats) => {
      return getNumeroRCCM(resultats['attestation_fiscale'])
    },
    comparer: sontIdentiques
  },
  {
    champ: "Siège Social",
    docSource: "id_nat",
    docCible: "rccm",
    extraireValeurSource: (resultats) => {
      return getLocaliteRCCMFromIDNat(resultats['id_nat'])
    },
    extraireValeurCible: (resultats) => {
      return getLocaliteRCCM(resultats['rccm'])
    },
    comparer: sontIdentiques
  }
]

type MatchStatus = {
  champ: string
  valeurSource: string
  valeurCible: string
  sourceDoc: string
  cibleDoc: string
  estMatch: boolean | null
}

export default function Step4Documents({ 
  documents, 
  onChange, 
  onVerificationChange,
  onCroisementValidityChange,
  resultatsExternes
}: Props) {
  const [previewDoc, setPreviewDoc] = useState<{ key: keyof DocumentsFPI; url: string } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resultatsVerification = resultatsExternes || {}

  const handleFileChange = (key: keyof DocumentsFPI, file: File | undefined) => {
    if (file) {
      const validation = validateDocumentFile(file)
      if (!validation.valid) {
        setErrors(prev => ({ ...prev, [key]: validation.message || 'Fichier invalide' }))
        return
      }
    }
    
    setErrors(prev => ({ ...prev, [key]: '' }))
    onChange({ ...documents, [key]: file || null })
  }

  const handleRemove = (key: keyof DocumentsFPI) => {
    onChange({ ...documents, [key]: undefined })
    setErrors(prev => ({ ...prev, [key]: '' }))
  }

  const handlePreview = (key: keyof DocumentsFPI) => {
    const file = documents[key]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewDoc({ key, url })
    }
  }

  const getFileSize = (file: File) => {
    const sizeKB = file.size / 1024
    if (sizeKB < 1024) return `${sizeKB.toFixed(1)} KB`
    return `${(sizeKB / 1024).toFixed(1)} MB`
  }

  const getMatchStatuses = useCallback((): MatchStatus[] => {
    return CROISEMENTS.map(croisement => {
      const valeurSource = croisement.extraireValeurSource(resultatsVerification)
      const valeurCible = croisement.extraireValeurCible(resultatsVerification)
      
      let estMatch: boolean | null = null
      if (valeurSource && valeurCible) {
        estMatch = croisement.comparer(valeurSource, valeurCible)
      }
      
      return {
        champ: croisement.champ,
        valeurSource,
        valeurCible,
        sourceDoc: croisement.docSource,
        cibleDoc: croisement.docCible,
        estMatch
      }
    })
  }, [resultatsVerification])

  const getValidationCroisements = useCallback((): { estValide: boolean; details: string[] } => {
    const matches = getMatchStatuses()
    const details: string[] = []
    
    let tousValides = true
    
    for (const match of matches) {
      if (match.estMatch === null) {
        tousValides = false
      } else if (match.estMatch === false) {
        details.push(`❌ ${match.champ} : Incohérence détectée`)
        tousValides = false
      } else {
        details.push(`✅ ${match.champ} : Correspondance validée`)
      }
    }
    
    if (tousValides && matches.every(m => m.estMatch === true)) {
      details.unshift('✅ Tous les croisements sont valides.')
    } else {
      details.unshift('⚠️ Des problèmes de cohérence ont été détectés :')
    }
    
    return { estValide: tousValides, details }
  }, [getMatchStatuses])

  const validationCroisements = useMemo(() => {
    return getValidationCroisements()
  }, [getValidationCroisements])

  const prevValidationRef = useRef<string>('')

  useEffect(() => {
    if (onCroisementValidityChange) {
      const currentValidation = JSON.stringify({
        estValide: validationCroisements.estValide,
        details: validationCroisements.details
      })
      
      if (currentValidation !== prevValidationRef.current) {
        prevValidationRef.current = currentValidation
        onCroisementValidityChange(
          validationCroisements.estValide, 
          validationCroisements.details
        )
      }
    }
  }, [validationCroisements, onCroisementValidityChange])

  const getConformiteGlobale = useCallback(() => {
    const matches = getMatchStatuses()
    const totalCroisements = matches.length
    
    const matchesValides = matches.filter(m => m.estMatch === true)
    const matchesEnAttente = matches.filter(m => m.estMatch === null)
    
    if (matchesEnAttente.length === totalCroisements) {
      return { 
        pourcentage: 0, 
        message: "Vérification en attente", 
        estValide: false 
      }
    }
    
    const pourcentage = (matchesValides.length / totalCroisements) * 100
    const estValide = pourcentage === 100
    
    return {
      pourcentage,
      message: estValide 
        ? "✅ CONFORMITÉ GLOBALE : 100% VALIDE" 
        : `⚠️ Conformité: ${Math.round(pourcentage)}% - ${totalCroisements - matchesValides.length} problème(s)`,
      estValide
    }
  }, [getMatchStatuses])

  const documentsUploaded = Object.values(documents).filter(Boolean).length
  const allUploaded = documentsUploaded === DOCUMENTS_REQUIS.length
  const documentsVerifies = Object.values(resultatsVerification).filter(r => r !== null).length
  
  const conformite = useMemo(() => getConformiteGlobale(), [getConformiteGlobale])
  const matchStatuses = useMemo(() => getMatchStatuses(), [getMatchStatuses])
  const detailsValidation = validationCroisements.details

  return (
    <div className="space-y-6">
      {/* Bannière info */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-indigo-900 mb-1">
              Documents requis
            </h3>
            <p className="text-xs text-indigo-700">
              Téléchargez tous les documents obligatoires. La vérification sera effectuée automatiquement lors du passage au paiement.
            </p>
          </div>
        </div>
      </div>

      {/* Bannière de statut des croisements */}
      {documentsVerifies >= 2 && (
        <div className={`rounded-xl p-4 border ${
          conformite.estValide 
            ? 'bg-green-50 border-green-200' 
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {conformite.estValide ? (
              <ShieldCheck className="h-5 w-5 text-green-600" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-amber-600" />
            )}
            <span className={`text-sm font-bold ${
              conformite.estValide ? 'text-green-700' : 'text-amber-700'
            }`}>
              {conformite.message}
            </span>
          </div>
        </div>
      )}

      {/* TABLEAU DE CROISEMENT */}
      {documentsVerifies >= 2 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">
              Résultat du Croisement des Données
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Champ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Document Source A</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Document Source B</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Statut</th>
                </tr>
              </thead>
              <tbody>
                {matchStatuses.map((match, idx) => {
                  const docANom = DOCUMENTS_REQUIS.find(d => d.key === match.sourceDoc)?.nom || match.sourceDoc
                  const docBNom = DOCUMENTS_REQUIS.find(d => d.key === match.cibleDoc)?.nom || match.cibleDoc
                  
                  return (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{match.champ}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-500 mb-1">{docANom}</div>
                        <div className="font-mono text-sm text-gray-800">
                          {match.valeurSource || <span className="text-gray-400 italic">Non extrait</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-500 mb-1">{docBNom}</div>
                        <div className="font-mono text-sm text-gray-800">
                          {match.valeurCible || <span className="text-gray-400 italic">Non extrait</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {match.estMatch === null ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            <AlertCircle className="h-3 w-3" />
                            Données manquantes
                          </span>
                        ) : match.estMatch ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <CheckCircle className="h-3 w-3" />
                            Identique
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            <AlertCircle className="h-3 w-3" />
                            ✗ Incohérence
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              
              <tfoot>
                <tr className="bg-gray-100 border-t-2 border-gray-200">
                  <td colSpan={4} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {conformite.estValide ? (
                          <ShieldCheck className="h-5 w-5 text-green-600" />
                        ) : (
                          <ShieldAlert className="h-5 w-5 text-yellow-600" />
                        )}
                        <span className={`text-sm font-bold ${conformite.estValide ? 'text-green-700' : 'text-yellow-700'}`}>
                          {conformite.message}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Taux de conformité:</span>
                        <span className={`text-sm font-bold ${conformite.estValide ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.round(conformite.pourcentage)}%
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Progression */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progression des documents
          </span>
          <span className="text-sm font-semibold text-primary">
            {documentsUploaded}/{DOCUMENTS_REQUIS.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              allUploaded ? 'bg-green-500' : 'bg-primary'
            }`}
            style={{ width: `${(documentsUploaded / DOCUMENTS_REQUIS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Liste des documents - État visuel uniquement */}
      <div className="space-y-3">
        {DOCUMENTS_REQUIS.map((doc) => {
          const file = documents[doc.key]
          const verification = resultatsVerification[doc.key]
          const error = errors[doc.key]
          
          let borderColor = 'border-gray-200'
          let bgColor = 'bg-white'
          let statusIcon = <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
          
          if (error) {
            borderColor = 'border-red-200'
            bgColor = 'bg-red-50'
            statusIcon = <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          } else if (file && verification) {
            if (verification.estValide) {
              borderColor = 'border-green-200'
              bgColor = 'bg-green-50'
              statusIcon = <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
            } else {
              borderColor = 'border-orange-200'
              bgColor = 'bg-orange-50'
              statusIcon = <ShieldAlert className="h-5 w-5 text-orange-500 flex-shrink-0" />
            }
          } else if (file) {
            borderColor = 'border-blue-200'
            bgColor = 'bg-blue-50'
            statusIcon = <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
          }
          
          return (
            <div
              key={doc.key}
              className={`p-4 rounded-xl border-2 transition-all ${borderColor} ${bgColor}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {statusIcon}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {doc.nom}
                      </p>
                      {doc.obligatoire && (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                          Obligatoire
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                    
                    {error && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{error}</p>
                    )}
                    
                    {file && (
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-green-600 font-medium">{file.name}</p>
                        <p className="text-xs text-gray-400">({getFileSize(file)})</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {file ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handlePreview(doc.key)}
                        className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-white"
                        title="Aperçu"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleRemove(doc.key)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-white"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <label className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 cursor-pointer transition-colors">
                      <Upload className="h-3 w-3" />
                      Télécharger
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleFileChange(doc.key, file)
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-700">
          <p className="mb-1">Formats acceptés : JPG, PNG, PDF (max 10MB).</p>
          <p>La vérification et le croisement des documents seront effectués automatiquement lors du passage au paiement.</p>
        </div>
      </div>

      {/* Modal d'aperçu */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div 
            className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h4 className="text-sm font-semibold">
                Aperçu: {DOCUMENTS_REQUIS.find(d => d.key === previewDoc.key)?.nom}
              </h4>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[60vh] overflow-auto">
              {documents[previewDoc.key]?.type.startsWith('image/') ? (
                <img
                  src={previewDoc.url}
                  alt="Aperçu du document"
                  className="max-w-full max-h-[50vh] object-contain"
                />
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Fichier: {documents[previewDoc.key]?.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}