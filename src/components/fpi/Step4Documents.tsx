

// 'use client'

// import { useState,useEffect } from 'react'
// import { FileText, CheckCircle, Upload, AlertCircle, Eye, Trash2, Loader2, Sparkles, ShieldAlert, ShieldCheck, Link2, Link2Off } from 'lucide-react'
// import { DocumentsFPI } from '@/types/fpi'
// import { verifierDocumentAvecAI, validateDocumentFile, type VerificationResult } from '@/lib/documentVerification'

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
//     champsAVerifier: ['nom_complet', 'postnom', 'prenom', 'numero_electeur', 'date_naissance'],
//     motsCles: ['carte', 'électeur', 'CENI', 'commission électorale'],
//   },
//   {
//     key: 'rccm',
//     nom: 'RCCM',
//     description: 'Registre du Commerce et du Crédit Mobilier',
//     obligatoire: true,
//     champsAVerifier: ['nom', 'postnom', 'prenom', 'numero_rccm', 'siege_social'],
//     motsCles: ['RCCM', 'registre du commerce', 'immatriculation'],
//   },
//   {
//     key: 'id_nat',
//     nom: 'ID NAT',
//     description: "Carte d'identité nationale",
//     obligatoire: true,
//     champsAVerifier: ['nom_complet', 'numero_national', 'siege_social'],
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

// // Structure des croisements selon l'image
// type Croisement = {
//   champ: string
//   docSource: string
//   champSource: string
//   docCible: string
//   champCible: string
// }

// const CROISEMENTS: Croisement[] = [
//   {
//     champ: "Identité Complète",
//     docSource: "carte_electeur",
//     champSource: "nom_complet",
//     docCible: "rccm",
//     champCible: "nom_complet"
//   },
//   {
//     champ: "Numéro National",
//     docSource: "id_nat",
//     champSource: "numero_national",
//     docCible: "carte_electeur",
//     champCible: "numero_electeur"
//   },
//   {
//     champ: "Numéro RCCM",
//     docSource: "rccm",
//     champSource: "numero_rccm",
//     docCible: "attestation_fiscale",
//     champCible: "numero_rccm"
//   },
//   {
//     champ: "Siège Social",
//     docSource: "id_nat",
//     champSource: "siege_social",
//     docCible: "rccm",
//     champCible: "siege_social"
//   }
// ]

// type MatchStatus = {
//   champ: string
//   valeurSource: string
//   valeurCible: string
//   sourceDoc: string
//   cibleDoc: string
//   estMatch: boolean | null
// }

// export default function Step4Documents({ documents, onChange, onVerificationChange }: Props) {
//   const [previewDoc, setPreviewDoc] = useState<{ key: keyof DocumentsFPI; url: string } | null>(null)
//   const [verificationEnCours, setVerificationEnCours] = useState<Record<string, boolean>>({})
//   const [resultatsVerification, setResultatsVerification] = useState<Record<string, VerificationResult | null>>({})
//   const [verificationGlobale, setVerificationGlobale] = useState(false)
//   const [errors, setErrors] = useState<Record<string, string>>({})

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
//     setResultatsVerification(prev => ({ ...prev, [key]: null }))
//   }

//   const handleRemove = (key: keyof DocumentsFPI) => {
//     onChange({ ...documents, [key]: undefined })
//     setResultatsVerification(prev => ({ ...prev, [key]: null }))
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

//   // Obtenir les statuts de match
//   const getMatchStatuses = (): MatchStatus[] => {
//     return CROISEMENTS.map(croisement => {
//       const resultatSource = resultatsVerification[croisement.docSource]
//       const resultatCible = resultatsVerification[croisement.docCible]
      
//       let valeurSource = ''
//       let valeurCible = ''
      
//       if (resultatSource?.champsExtraits) {
//         const champ = resultatSource.champsExtraits.find(
//           e => e.nom.toLowerCase().replace(/[\s_]/g, '') === croisement.champSource.toLowerCase().replace(/[\s_]/g, '')
//         )
//         valeurSource = champ?.valeur || ''
//       }
      
//       if (resultatCible?.champsExtraits) {
//         const champ = resultatCible.champsExtraits.find(
//           e => e.nom.toLowerCase().replace(/[\s_]/g, '') === croisement.champCible.toLowerCase().replace(/[\s_]/g, '')
//         )
//         valeurCible = champ?.valeur || ''
//       }
      
//       const estMatch = valeurSource && valeurCible ? sontIdentiques(valeurSource, valeurCible) : null
      
//       return {
//         champ: croisement.champ,
//         valeurSource,
//         valeurCible,
//         sourceDoc: croisement.docSource,
//         cibleDoc: croisement.docCible,
//         estMatch
//       }
//     })
//   }

//   // Calculer la conformité globale
//   const getConformiteGlobale = () => {
//     const matches = getMatchStatuses()
//     const matchesValides = matches.filter(m => m.estMatch === true)
//     const totalVerifies = matches.filter(m => m.estMatch !== null)
    
//     if (totalVerifies.length === 0) {
//       return { pourcentage: 0, message: "Vérification en attente", estValide: false }
//     }
    
//     const pourcentage = (matchesValides.length / totalVerifies.length) * 100
//     const estValide = pourcentage === 100
    
//     return {
//       pourcentage,
//       message: estValide ? "CONFORMITÉ GLOBALE : 100% VALIDE" : `Conformité: ${Math.round(pourcentage)}%`,
//       estValide
//     }
//   }
// // Step4Documents.tsx

// // Add this useEffect to sync verification results with parent
// useEffect(() => {
//   onVerificationChange?.(resultatsVerification)
// }, [resultatsVerification, onVerificationChange])

// // Then fix the verifierDocument function:
// const verifierDocument = async (key: keyof DocumentsFPI) => {
//   const file = documents[key]
//   if (!file) return

//   setVerificationEnCours(prev => ({ ...prev, [key]: true }))

//   try {
//     const resultat = await verifierDocumentAvecAI(key, file)
    
//     // Just update the state - useEffect will handle the parent notification
//     setResultatsVerification(prev => ({
//       ...prev,
//       [key]: resultat
//     }))
//   } catch (error) {
//     console.error('Erreur vérification:', error)
//   } finally {
//     setVerificationEnCours(prev => ({ ...prev, [key]: false }))
//   }
// }
//   // Vérifier un document individuel
//   // const verifierDocument = async (key: keyof DocumentsFPI) => {
//   //   const file = documents[key]
//   //   if (!file) return

//   //   setVerificationEnCours(prev => ({ ...prev, [key]: true }))

//   //   try {
//   //     const resultat = await verifierDocumentAvecAI(key, file)
      
//   //     setResultatsVerification(prev => {
//   //       const newResults = { ...prev, [key]: resultat }
//   //       onVerificationChange?.(newResults)
//   //       return newResults
//   //     })
//   //   } catch (error) {
//   //     console.error('Erreur vérification:', error)
//   //   } finally {
//   //     setVerificationEnCours(prev => ({ ...prev, [key]: false }))
//   //   }
//   // }

//   // Vérifier tous les documents
//   const verifierTousLesDocuments = async () => {
//     setVerificationGlobale(true)
    
//     const docsAVerifier = DOCUMENTS_REQUIS.filter(d => documents[d.key])
    
//     for (const doc of docsAVerifier) {
//       await verifierDocument(doc.key)
//       await new Promise(resolve => setTimeout(resolve, 1000))
//     }
    
//     setVerificationGlobale(false)
//   }

//   const documentsUploaded = Object.values(documents).filter(Boolean).length
//   const allUploaded = documentsUploaded === DOCUMENTS_REQUIS.length
//   const documentsVerifies = Object.values(resultatsVerification).filter(r => r !== null).length
//   const conformite = getConformiteGlobale()
//   const matchStatuses = getMatchStatuses()

//   return (
//     <div className="space-y-6">
//       {/* Bannière AI */}
//       <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
//         <div className="flex items-start gap-3">
//           <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
//             <Sparkles className="h-5 w-5 text-indigo-600" />
//           </div>
//           <div className="flex-1">
//             <h3 className="text-sm font-semibold text-indigo-900 mb-1">
//               Vérification Intelligente par IA
//             </h3>
//             <p className="text-xs text-indigo-700 mb-3">
//               Notre IA analyse automatiquement vos documents, extrait les informations 
//               et <strong>vérifie la cohérence entre vos documents</strong> selon la logique de croisement.
//             </p>
            
//             {allUploaded && (
//               <button
//                 type="button"
//                 onClick={verifierTousLesDocuments}
//                 disabled={verificationGlobale}
//                 className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
//               >
//                 {verificationGlobale ? (
//                   <>
//                     <Loader2 className="h-3.5 w-3.5 animate-spin" />
//                     Analyse en cours...
//                   </>
//                 ) : (
//                   <>
//                     <Sparkles className="h-3.5 w-3.5" />
//                     Vérifier tous les documents
//                   </>
//                 )}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* TABLEAU DE CROISEMENT - EXACTEMENT COMME DANS L'IMAGE */}
//       {documentsVerifies >= 2 && (
//         <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-gray-50 border-b border-gray-200">
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Champ de Donnée</th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Document Source A</th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Document Source B</th>
//                   <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Statut de Match</th>
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
//                         <div className="text-xs text-gray-500">{docANom}</div>
//                         <div className="font-mono text-sm text-gray-800">
//                           {match.valeurSource || <span className="text-gray-400 italic">Non extrait</span>}
//                         </div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="text-xs text-gray-500">{docBNom}</div>
//                         <div className="font-mono text-sm text-gray-800">
//                           {match.valeurCible || <span className="text-gray-400 italic">Non extrait</span>}
//                         </div>
//                        </td>
//                       <td className="px-4 py-3 text-center">
//                         {match.estMatch === null ? (
//                           <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
//                             En attente
//                           </span>
//                         ) : match.estMatch ? (
//                           <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
//                             <CheckCircle className="h-3 w-3" />
//                             ✓ Identique
//                           </span>
//                         ) : (
//                           <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
//                             <AlertCircle className="h-3 w-3" />
//                             ✗ Incohérence
//                           </span>
//                         )}
//                        </td>
//                      </tr>
//                   )
//                 })}
//               </tbody>
              
//               {/* Ligne de conformité globale */}
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
//                       {conformite.pourcentage > 0 && (
//                         <div className="flex items-center gap-2">
//                           <span className="text-xs text-gray-500">Taux de conformité:</span>
//                           <span className={`text-sm font-bold ${conformite.estValide ? 'text-green-600' : 'text-yellow-600'}`}>
//                             {Math.round(conformite.pourcentage)}%
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                    </td>
//                  </tr>
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

//       {/* Liste des documents */}
//       <div className="space-y-3">
//         {DOCUMENTS_REQUIS.map((doc) => {
//           const file = documents[doc.key]
//           const verification = resultatsVerification[doc.key]
//           const isVerifying = verificationEnCours[doc.key]
//           const error = errors[doc.key]
          
//           let borderColor = 'border-gray-200'
//           let bgColor = 'bg-white'
//           let statusIcon = <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
          
//           if (error) {
//             borderColor = 'border-red-200'
//             bgColor = 'bg-red-50'
//             statusIcon = <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
//           } else if (file) {
//             if (isVerifying) {
//               borderColor = 'border-indigo-200'
//               bgColor = 'bg-indigo-50'
//               statusIcon = <Loader2 className="h-5 w-5 text-indigo-500 animate-spin flex-shrink-0" />
//             } else if (verification) {
//               if (verification.estValide) {
//                 borderColor = 'border-green-200'
//                 bgColor = 'bg-green-50'
//                 statusIcon = <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
//               } else {
//                 borderColor = 'border-yellow-200'
//                 bgColor = 'bg-yellow-50'
//                 statusIcon = <ShieldAlert className="h-5 w-5 text-yellow-500 flex-shrink-0" />
//               }
//             } else {
//               borderColor = 'border-green-200'
//               bgColor = 'bg-green-50'
//               statusIcon = <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
//             }
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
//                     </div>
//                     <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                    
//                     {error && (
//                       <p className="text-xs text-red-600 mt-1 font-medium">
//                         {error}
//                       </p>
//                     )}
                    
//                     {file && (
//                       <div className="flex items-center gap-2 mt-1">
//                         <p className="text-xs text-green-600 font-medium">
//                           {file.name}
//                         </p>
//                         <p className="text-xs text-gray-400">
//                           ({getFileSize(file)})
//                         </p>
//                       </div>
//                     )}

//                     {/* Résultat vérification AI */}
//                     {verification && (
//                       <div className="mt-2 p-2 bg-white rounded border border-gray-100">
//                         <div className="flex items-center gap-2 mb-1">
//                           {verification.estValide ? (
//                             <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
//                           ) : (
//                             <ShieldAlert className="h-3.5 w-3.5 text-yellow-600" />
//                           )}
//                           <span className="text-xs font-medium">
//                             Score: {verification.score}% - Confiance: {verification.confiance}
//                           </span>
//                         </div>
                        
//                         {verification.champsExtraits && verification.champsExtraits.length > 0 && (
//                           <div className="mb-1">
//                             {verification.champsExtraits.map((champ: any, idx: number) => (
//                               <div key={idx} className="flex items-center justify-between py-0.5 text-xs">
//                                 <span className="text-gray-500">{champ.nom} :</span>
//                                 <span className="font-medium">{champ.valeur}</span>
//                               </div>
//                             ))}
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
                      
//                       {!isVerifying && (
//                         <button
//                           type="button"
//                           onClick={() => verifierDocument(doc.key)}
//                           className="p-2 text-indigo-400 hover:text-indigo-600 rounded-lg hover:bg-white"
//                           title="Vérifier avec l'IA"
//                         >
//                           <Sparkles className="h-4 w-4" />
//                         </button>
//                       )}
                      
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
//         <p className="text-xs text-blue-700">
//           Formats acceptés : JPG, PNG, PDF (max 10MB). L'IA extrait les valeurs et vérifie les correspondances.
//         </p>
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

// Step4Documents.tsx
'use client'

import { useState, useEffect } from 'react'
import { FileText, CheckCircle, Upload, AlertCircle, Eye, Trash2, Loader2, Sparkles, ShieldAlert, ShieldCheck } from 'lucide-react'
import { DocumentsFPI } from '@/types/fpi'
import { 
  verifierDocumentAvecAI, 
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

/**
 * Compare deux noms complets en ignorant l'ordre des mots
 * Utile pour comparer "KABILA MUAMBA JOSEPH" avec "JOSEPH KABILA MUAMBA"
 */
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

// Structure des croisements
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
    // Carte d'électeur : concaténer nom + postnom + prenom
    extraireValeurSource: (resultats) => {
      const resultat = resultats['carte_electeur']
      return reconstituerIdentiteCompletteDepuisCarte(resultat)
    },
    // RCCM : récupérer nom_complet directement
    extraireValeurCible: (resultats) => {
      const resultat = resultats['rccm']
      return getNomCompletRCCM(resultat)
    },
    comparer: sontNomsIdentiques
  },
  {
    champ: "Numéro National",
    docSource: "id_nat",
    docCible: "carte_electeur",
    // ID NAT : numero_national
    extraireValeurSource: (resultats) => {
      return getNumeroNational(resultats['id_nat'])
    },
    // Carte d'électeur : numero_electeur
    extraireValeurCible: (resultats) => {
      return getNumeroElecteur(resultats['carte_electeur'])
    },
    comparer: sontIdentiques
  },
  {
    champ: "Numéro RCCM",
    docSource: "rccm",
    docCible: "attestation_fiscale",
    // RCCM : numero_rccm
    extraireValeurSource: (resultats) => {
      return getNumeroRCCM(resultats['rccm'])
    },
    // Attestation fiscale : numero_rccm
    extraireValeurCible: (resultats) => {
      return getNumeroRCCM(resultats['attestation_fiscale'])
    },
    comparer: sontIdentiques
  },
  {
    champ: "Siège Social",
    docSource: "id_nat",
    docCible: "rccm",
    // ID NAT : localite_rccm (le champ "Localité RCCM" sur la carte)
    extraireValeurSource: (resultats) => {
      return getLocaliteRCCMFromIDNat(resultats['id_nat'])
    },
    // RCCM : localite
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
  // Pour l'affichage détaillé de l'identité complète
  detailCarteElecteur?: { nom: string; postnom: string; prenom: string }
}

export default function Step4Documents({ documents, onChange, onVerificationChange }: Props) {
  const [previewDoc, setPreviewDoc] = useState<{ key: keyof DocumentsFPI; url: string } | null>(null)
  const [verificationEnCours, setVerificationEnCours] = useState<Record<string, boolean>>({})
  const [resultatsVerification, setResultatsVerification] = useState<Record<string, VerificationResult | null>>({})
  const [verificationGlobale, setVerificationGlobale] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Synchroniser les résultats avec le parent
  useEffect(() => {
    onVerificationChange?.(resultatsVerification)
  }, [resultatsVerification, onVerificationChange])

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
    setResultatsVerification(prev => ({ ...prev, [key]: null }))
  }

  const handleRemove = (key: keyof DocumentsFPI) => {
    onChange({ ...documents, [key]: undefined })
    setResultatsVerification(prev => ({ ...prev, [key]: null }))
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

  // Obtenir les statuts de match
  const getMatchStatuses = (): MatchStatus[] => {
    return CROISEMENTS.map(croisement => {
      const valeurSource = croisement.extraireValeurSource(resultatsVerification)
      const valeurCible = croisement.extraireValeurCible(resultatsVerification)
      
      let estMatch: boolean | null = null
      if (valeurSource && valeurCible) {
        estMatch = croisement.comparer(valeurSource, valeurCible)
      }
      
      // Détails pour l'identité complète (carte d'électeur)
      let detailCarteElecteur: { nom: string; postnom: string; prenom: string } | undefined
      if (croisement.champ === "Identité Complète") {
        const resultatCE = resultatsVerification['carte_electeur']
        detailCarteElecteur = {
          nom: getChampValeur(resultatCE, 'nom'),
          postnom: getChampValeur(resultatCE, 'postnom'),
          prenom: getChampValeur(resultatCE, 'prenom')
        }
      }
      
      return {
        champ: croisement.champ,
        valeurSource,
        valeurCible,
        sourceDoc: croisement.docSource,
        cibleDoc: croisement.docCible,
        estMatch,
        detailCarteElecteur
      }
    })
  }

  // Calculer la conformité globale
  const getConformiteGlobale = () => {
    const matches = getMatchStatuses()
    const matchesValides = matches.filter(m => m.estMatch === true)
    const totalVerifies = matches.filter(m => m.estMatch !== null)
    
    if (totalVerifies.length === 0) {
      return { pourcentage: 0, message: "Vérification en attente", estValide: false }
    }
    
    const pourcentage = (matchesValides.length / totalVerifies.length) * 100
    const estValide = pourcentage === 100
    
    return {
      pourcentage,
      message: estValide ? "CONFORMITÉ GLOBALE : 100% VALIDE" : `Conformité: ${Math.round(pourcentage)}%`,
      estValide
    }
  }

  // Vérifier un document individuel
  const verifierDocument = async (key: keyof DocumentsFPI) => {
    const file = documents[key]
    if (!file) return

    setVerificationEnCours(prev => ({ ...prev, [key]: true }))

    try {
      const resultat = await verifierDocumentAvecAI(key, file)
      
      setResultatsVerification(prev => ({
        ...prev,
        [key]: resultat
      }))
    } catch (error) {
      console.error('Erreur vérification:', error)
    } finally {
      setVerificationEnCours(prev => ({ ...prev, [key]: false }))
    }
  }

  // Vérifier tous les documents
  const verifierTousLesDocuments = async () => {
    setVerificationGlobale(true)
    
    const docsAVerifier = DOCUMENTS_REQUIS.filter(d => documents[d.key])
    
    for (const doc of docsAVerifier) {
      await verifierDocument(doc.key)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    setVerificationGlobale(false)
  }

  const documentsUploaded = Object.values(documents).filter(Boolean).length
  const allUploaded = documentsUploaded === DOCUMENTS_REQUIS.length
  const documentsVerifies = Object.values(resultatsVerification).filter(r => r !== null).length
  const conformite = getConformiteGlobale()
  const matchStatuses = getMatchStatuses()

  return (
    <div className="space-y-6">
      {/* Bannière AI */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-indigo-900 mb-1">
              Vérification Intelligente par IA
            </h3>
            <p className="text-xs text-indigo-700 mb-3">
              Notre IA analyse automatiquement vos documents, extrait les informations 
              et <strong>vérifie la cohérence entre vos documents</strong>.
            </p>
            
            {allUploaded && (
              <button
                type="button"
                onClick={verifierTousLesDocuments}
                disabled={verificationGlobale}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                {verificationGlobale ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Vérifier tous les documents
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TABLEAU DE CROISEMENT */}
      {documentsVerifies >= 2 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Champ de Donnée</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Document Source A</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Document Source B</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Statut de Match</th>
                </tr>
              </thead>
              <tbody>
                {matchStatuses.map((match, idx) => {
                  const docANom = DOCUMENTS_REQUIS.find(d => d.key === match.sourceDoc)?.nom || match.sourceDoc
                  const docBNom = DOCUMENTS_REQUIS.find(d => d.key === match.cibleDoc)?.nom || match.cibleDoc
                  
                  // Formater l'affichage pour la source (document A)
                  const affichageSource = () => {
                    const valeur = match.valeurSource
                    
                    // Cas spécial : Identité Complète depuis la carte d'électeur
                    if (match.champ === "Identité Complète" && match.detailCarteElecteur) {
                      const { nom, postnom, prenom } = match.detailCarteElecteur
                      if (nom || postnom || prenom) {
                        return (
                          <div>
                            <div className="font-mono text-sm text-gray-800">
                              {valeur || <span className="text-gray-400 italic">Non extrait</span>}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              Nom: {nom || '—'} | Postnom: {postnom || '—'} | Prénom: {prenom || '—'}
                            </div>
                          </div>
                        )
                      }
                    }
                    
                    // Affichage standard
                    return (
                      <div className="font-mono text-sm text-gray-800">
                        {valeur || <span className="text-gray-400 italic">Non extrait</span>}
                      </div>
                    )
                  }
                  
                  // Formater l'affichage pour la cible (document B)
                  const affichageCible = () => {
                    const valeur = match.valeurCible
                    
                    // Cas spécial : Identité Complète côté RCCM (nom_complet)
                    if (match.champ === "Identité Complète") {
                      return (
                        <div>
                          <div className="font-mono text-sm text-gray-800">
                            {valeur || <span className="text-gray-400 italic">Non extrait</span>}
                          </div>
                          {valeur && (
                            <div className="text-xs text-gray-400 mt-0.5">
                              Nom complet (RCCM)
                            </div>
                          )}
                        </div>
                      )
                    }
                    
                    // Cas spécial : Localité RCCM
                    if (match.champ === "Siège Social") {
                      return (
                        <div>
                          <div className="font-mono text-sm text-gray-800">
                            {valeur || <span className="text-gray-400 italic">Non extrait</span>}
                          </div>
                          {valeur && (
                            <div className="text-xs text-gray-400 mt-0.5">

                            </div>
                          )}
                        </div>
                      )
                    }
                    
                    // Affichage standard
                    return (
                      <div className="font-mono text-sm text-gray-800">
                        {valeur || <span className="text-gray-400 italic">Non extrait</span>}
                      </div>
                    )
                  }
                  
                  return (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{match.champ}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-500 mb-1">{docANom}</div>
                        {affichageSource()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-500 mb-1">{docBNom}</div>
                        {affichageCible()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {match.estMatch === null ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                            En attente
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
              
              {/* Ligne de conformité globale */}
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
                      {conformite.pourcentage > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Taux de conformité:</span>
                          <span className={`text-sm font-bold ${conformite.estValide ? 'text-green-600' : 'text-yellow-600'}`}>
                            {Math.round(conformite.pourcentage)}%
                          </span>
                        </div>
                      )}
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

      {/* Liste des documents */}
      <div className="space-y-3">
        {DOCUMENTS_REQUIS.map((doc) => {
          const file = documents[doc.key]
          const verification = resultatsVerification[doc.key]
          const isVerifying = verificationEnCours[doc.key]
          const error = errors[doc.key]
          
          let borderColor = 'border-gray-200'
          let bgColor = 'bg-white'
          let statusIcon = <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
          
          if (error) {
            borderColor = 'border-red-200'
            bgColor = 'bg-red-50'
            statusIcon = <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          } else if (file) {
            if (isVerifying) {
              borderColor = 'border-indigo-200'
              bgColor = 'bg-indigo-50'
              statusIcon = <Loader2 className="h-5 w-5 text-indigo-500 animate-spin flex-shrink-0" />
            } else if (verification) {
              if (verification.estValide) {
                borderColor = 'border-green-200'
                bgColor = 'bg-green-50'
                statusIcon = <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
              } else {
                borderColor = 'border-yellow-200'
                bgColor = 'bg-yellow-50'
                statusIcon = <ShieldAlert className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              }
            } else {
              borderColor = 'border-green-200'
              bgColor = 'bg-green-50'
              statusIcon = <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            }
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
                      <p className="text-xs text-red-600 mt-1 font-medium">
                        {error}
                      </p>
                    )}
                    
                    {file && (
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-green-600 font-medium">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          ({getFileSize(file)})
                        </p>
                      </div>
                    )}

                    {/* Résultat vérification AI */}
                    {verification && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          {verification.estValide ? (
                            <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <ShieldAlert className="h-3.5 w-3.5 text-yellow-600" />
                          )}
                          <span className="text-xs font-medium">
                            Score: {verification.score}% - Confiance: {verification.confiance}
                          </span>
                        </div>
                        
                        {verification.champsExtraits && verification.champsExtraits.length > 0 && (
                          <div className="mb-1">
                            {verification.champsExtraits.map((champ: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between py-0.5 text-xs">
                                <span className="text-gray-500 capitalize">{champ.nom.replace(/_/g, ' ')} :</span>
                                <span className="font-medium">{champ.valeur || '—'}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500 italic mt-1">{verification.commentaire}</p>
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
                      
                      {!isVerifying && (
                        <button
                          type="button"
                          onClick={() => verifierDocument(doc.key)}
                          className="p-2 text-indigo-400 hover:text-indigo-600 rounded-lg hover:bg-white"
                          title="Vérifier avec l'IA"
                        >
                          <Sparkles className="h-4 w-4" />
                        </button>
                      )}
                      
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
          <p className="font-medium">Logique de croisement :</p>
          <ul className="list-disc list-inside mt-1 space-y-0.5">
            <li><strong>Identité Complète</strong> : Carte d'électeur (Nom + Postnom + Prénom) ↔ RCCM (Nom complet)</li>
            <li><strong>Numéro National</strong> : ID NAT ↔ Carte d'électeur</li>
            <li><strong>Numéro RCCM</strong> : RCCM ↔ Attestation fiscale</li>
            <li><strong>Siège Social</strong> : ID NAT (localite_rccm) ↔ RCCM (localite)</li>
          </ul>
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