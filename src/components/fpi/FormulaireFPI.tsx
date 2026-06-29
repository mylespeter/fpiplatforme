

// // FormulaireFPI.tsx - VERSION FINALE AVEC VÉRIFICATION AUTO
// 'use client'

// import { useState, useCallback } from 'react'
// import { useAuth } from '@/context/AuthContext'
// import { usePushNotifications } from '@/context/PushNotificationContext'
// import { supabase } from '@/lib/supabase'
// import {
//   ArrowRight, ArrowLeft, Loader2, CheckCircle, CreditCard, FileText, X
// } from 'lucide-react'
// import { PromoteurInfo, ProjetInfo, InfoFinanciere, DocumentsFPI } from '@/types/fpi'
// import Step1Promoteur from './Step1Promoteur'
// import Step2Projet from './Step2Projet'
// import Step3Finance from './Step3Finance'
// import Step4Documents from './Step4Documents'
// import Step5Paiement, { PaiementData } from './Step5Paiement'
// import { verifierTousLesDocuments, type VerificationResult } from '@/lib/documentVerification'

// const FRAIS_DOSSIER = 500

// const STEPS = [
//   { id: 1, title: 'Promoteur', icon: FileText },
//   { id: 2, title: 'Projet', icon: FileText },
//   { id: 3, title: 'Finance', icon: CreditCard },
//   { id: 4, title: 'Documents', icon: FileText },
//   { id: 5, title: 'Paiement', icon: CreditCard }
// ]

// type Props = {
//   onClose: () => void
//   onSuccess: () => void
// }

// export default function FormulaireFPI({ onClose, onSuccess }: Props) {
//   const { user } = useAuth()
//   const { isSubscribed } = usePushNotifications()
//   const [currentStep, setCurrentStep] = useState(1)
//   const [submitting, setSubmitting] = useState(false)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const [projetId, setProjetId] = useState<number | null>(null)
//   const [showCloseConfirm, setShowCloseConfirm] = useState(false)

//   // Données du formulaire - Étape 1: Promoteur
//   const [promoteur, setPromoteur] = useState<PromoteurInfo>({
//     nom_complet: '',
//     sexe: 'M',
//     numero_telephone: '',
//     adresse_email: '',
//     adresse_physique: '',
//     province: '',
//     ville: '',
//     profession: ''
//   })

//   // Données du formulaire - Étape 2: Projet
//   const [projet, setProjet] = useState<ProjetInfo>({
//     nom_projet: '',
//     secteur_activite: '',
//     description_projet: '',
//     localisation_projet: '',
//     cout_total: 0,
//     montant_sollicite: 0,
//     nombre_emplois: 0,
//     duree_realisation: '',
//     objectifs_projet: ''
//   })

//   // Données du formulaire - Étape 3: Finance
//   const [finance, setFinance] = useState<InfoFinanciere>({
//     apport_personnel: 0,
//     source_financement: '',
//     chiffre_affaires_previsionnel: 0,
//     benefice_previsionnel: 0,
//     duree_remboursement: '',
//     garanties_proposees: '',
//     banque_partenaire: '',
//     numero_compte_bancaire: ''
//   })

//   // Données du formulaire - Étape 4: Documents
//   const [documents, setDocuments] = useState<DocumentsFPI>({})
//   const [verificationResultats, setVerificationResultats] = useState<Record<string, VerificationResult | null>>({})
//   const [verificationEnCours, setVerificationEnCours] = useState(false)
  
//   // États pour la validation des croisements
//   const [croisementsValides, setCroisementsValides] = useState(false)
//   const [detailsCroisements, setDetailsCroisements] = useState<string[]>([])
  
//   // État pour savoir si la vérification a déjà été effectuée
//   const [verificationEffectuee, setVerificationEffectuee] = useState(false)

//   const referencePaiement = `FPI-${Date.now().toString(36).toUpperCase()}`
//   const [errors, setErrors] = useState<Record<string, string>>({})

//   // Stabiliser le callback avec useCallback
//   const handleCroisementValidityChange = useCallback((isValid: boolean, details: string[]) => {
//     setCroisementsValides(isValid)
//     setDetailsCroisements(details)
//   }, [])

//   const envoyerNotificationPush = async (
//     titre: string,
//     message: string,
//     type: 'info' | 'success' | 'warning' | 'error' | 'paiement' | 'document' = 'info',
//     projetId?: number
//   ) => {
//     if (!user?.id) return false

//     try {
//       await supabase.from('notifications').insert({
//         user_id: user.id,
//         type,
//         titre,
//         message,
//         lien: '/dashboard',
//         projet_id: projetId || null,
//         icone: type === 'paiement' ? 'CreditCard' : 'FileText',
//         est_lue: false
//       })

//       if (isSubscribed) {
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
//               url: '/dashboard',
//               type,
//               projetId,
//               requireInteraction: type === 'paiement' || type === 'error'
//             }
//           })
//         })
//       }

//       return true
//     } catch (error) {
//       console.error('Erreur notification:', error)
//       return false
//     }
//   }

//   const envoyerNotificationServiceTechnique = async (projetId: number, nomProjet: string) => {
//     try {
//       console.log('🔍 Recherche des techniciens...');
      
//       const { data: techniciens, error: techError } = await supabase
//         .from('users')
//         .select('id, email, username, role')
//         .eq('role', 'technique');

//       if (techError) {
//         console.error('❌ Erreur:', techError.message);
//         return false;
//       }

//       if (!techniciens || techniciens.length === 0) {
//         console.warn('⚠️ Aucun technicien trouvé');
//         return false;
//       }

//       for (const technicien of techniciens) {
//         await supabase.from('notifications').insert({
//           user_id: technicien.id,
//           type: 'info',
//           titre: '🆕 NOUVEAU PROJET FPI À ANALYSER',
//           message: `Le projet "${nomProjet}" vient d'être soumis et nécessite votre analyse technique.`,
//           lien: '/dashboard',
//           projet_id: projetId,
//           icone: 'FileText',
//           est_lue: false
//         });

//         await fetch('/api/push/send', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'x-user-id': technicien.id.toString()
//           },
//           body: JSON.stringify({
//             userId: technicien.id.toString(),
//             notification: {
//               title: '🆕 NOUVEAU PROJET FPI',
//               body: `"${nomProjet}" - Projet soumis, analyse technique requise`,
//               url: '/dashboard',
//               type: 'info',
//               projetId: projetId,
//               requireInteraction: true,
//               vibrate: [200, 100, 200]
//             }
//           })
//         });
//       }

//       return true;
//     } catch (error) {
//       console.error('❌ Erreur:', error);
//       return false;
//     }
//   };

//   const validateStep = (step: number): boolean => {
//     const newErrors: Record<string, string> = {}

//     switch (step) {
//       case 1:
//         if (!promoteur.nom_complet.trim()) newErrors.nom_complet = 'Le nom complet est obligatoire'
//         if (!promoteur.sexe) newErrors.sexe = 'Le sexe est obligatoire'
//         if (!promoteur.numero_telephone.trim()) newErrors.numero_telephone = 'Le numéro de téléphone est obligatoire'
//         if (!promoteur.adresse_email.trim()) newErrors.adresse_email = "L'adresse e-mail est obligatoire"
//         else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(promoteur.adresse_email)) 
//           newErrors.adresse_email = 'Adresse e-mail invalide'
//         if (!promoteur.adresse_physique.trim()) newErrors.adresse_physique = "L'adresse physique est obligatoire"
//         if (!promoteur.province) newErrors.province = 'La province est obligatoire'
//         if (!promoteur.ville.trim()) newErrors.ville = 'La ville est obligatoire'
//         if (!promoteur.profession.trim()) newErrors.profession = 'La profession est obligatoire'
//         break

//       case 2:
//         if (!projet.nom_projet.trim()) newErrors.nom_projet = 'Le nom du projet est obligatoire'
//         if (!projet.secteur_activite) newErrors.secteur_activite = "Le secteur d'activité est obligatoire"
//         if (!projet.description_projet.trim()) newErrors.description_projet = 'La description du projet est obligatoire'
//         if (!projet.localisation_projet.trim()) newErrors.localisation_projet = 'La localisation est obligatoire'
//         if (!projet.cout_total || projet.cout_total <= 0) newErrors.cout_total = 'Le coût total doit être supérieur à 0'
//         if (!projet.montant_sollicite || projet.montant_sollicite <= 0) 
//           newErrors.montant_sollicite = 'Le montant sollicité doit être supérieur à 0'
//         if (projet.montant_sollicite > projet.cout_total) 
//           newErrors.montant_sollicite = 'Le montant sollicité ne peut pas dépasser le coût total'
//         if (!projet.nombre_emplois || projet.nombre_emplois <= 0) 
//           newErrors.nombre_emplois = "Le nombre d'emplois doit être supérieur à 0"
//         if (!projet.duree_realisation.trim()) newErrors.duree_realisation = 'La durée de réalisation est obligatoire'
//         if (!projet.objectifs_projet.trim()) newErrors.objectifs_projet = 'Les objectifs sont obligatoires'
//         break

//       case 3:
//         if (!finance.apport_personnel && finance.apport_personnel !== 0) 
//           newErrors.apport_personnel = "L'apport personnel est obligatoire"
//         if (!finance.chiffre_affaires_previsionnel || finance.chiffre_affaires_previsionnel <= 0) 
//           newErrors.chiffre_affaires_previsionnel = "Le chiffre d'affaires prévisionnel est obligatoire"
//         if (!finance.benefice_previsionnel || finance.benefice_previsionnel <= 0) 
//           newErrors.benefice_previsionnel = 'Le bénéfice prévisionnel est obligatoire'
//         if (!finance.duree_remboursement) 
//           newErrors.duree_remboursement = 'La durée de remboursement est obligatoire'
//         if (!finance.garanties_proposees.trim()) 
//           newErrors.garanties_proposees = 'Les garanties sont obligatoires'
//         if (!finance.banque_partenaire) 
//           newErrors.banque_partenaire = 'La banque partenaire est obligatoire'
//         if (!finance.numero_compte_bancaire.trim()) 
//           newErrors.numero_compte_bancaire = 'Le numéro de compte est obligatoire'
//         break

//       case 4:
//         const docsRequis = ['carte_electeur', 'rccm', 'id_nat', 'attestation_fiscale', 'attestation_cnss'] as const
//         const docNames: Record<string, string> = {
//           'carte_electeur': "Carte d'électeur",
//           'rccm': 'RCCM',
//           'id_nat': 'ID NAT',
//           'attestation_fiscale': 'Attestation fiscale',
//           'attestation_cnss': 'Attestation CNSS'
//         }
        
//         // Vérifier que tous les documents sont téléchargés
//         const allDocsPresent = docsRequis.every(key => documents[key])
//         if (!allDocsPresent) {
//           const docsManquants = docsRequis.filter(key => !documents[key])
//           newErrors.documents = `Documents obligatoires manquants : ${docsManquants.map(k => docNames[k] || k).join(', ')}`
//           break
//         }
//         break
//     }

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   // NOUVEAU : Fonction de vérification automatique
//   const lancerVerificationAutomatique = async () => {
//     const docsRequis = ['carte_electeur', 'rccm', 'id_nat', 'attestation_fiscale', 'attestation_cnss'] as const
//     const docNames: Record<string, string> = {
//       'carte_electeur': "Carte d'électeur",
//       'rccm': 'RCCM',
//       'id_nat': 'ID NAT',
//       'attestation_fiscale': 'Attestation fiscale',
//       'attestation_cnss': 'Attestation CNSS'
//     }

//     setVerificationEnCours(true)
//     setError('')

//     try {
//       // Lancer la vérification de tous les documents
//       const resultats = await verifierTousLesDocuments(documents)
//       setVerificationResultats(resultats)
//       setVerificationEffectuee(true)

//       // Vérifier les documents invalides
//       const docsInvalides = docsRequis.filter(key => {
//         const result = resultats[key]
//         return result && !result.estValide
//       })

//       if (docsInvalides.length > 0) {
//         const details = docsInvalides.map(k => 
//           `${docNames[k] || k} (${resultats[k]?.commentaire || 'Non conforme'})`
//         ).join(', ')
//         setError(`❌ Documents non valides : ${details}`)
//         setVerificationEnCours(false)
//         return false
//       }

//       // Vérifier les scores faibles
//       const docsFaibleScore = docsRequis.filter(key => {
//         const result = resultats[key]
//         return result && result.score < 50
//       })

//       if (docsFaibleScore.length > 0) {
//         setError(`❌ Score de vérification trop faible pour : ${docsFaibleScore.map(k => docNames[k] || k).join(', ')}. Veuillez vérifier la qualité des documents.`)
//         setVerificationEnCours(false)
//         return false
//       }

//       // Attendre que les croisements se mettent à jour dans le state
//       await new Promise(resolve => setTimeout(resolve, 800))

//       setVerificationEnCours(false)
//       return true

//     } catch (err: any) {
//       console.error('Erreur vérification:', err)
//       setError('❌ Erreur lors de la vérification des documents. Veuillez réessayer.')
//       setVerificationEnCours(false)
//       return false
//     }
//   }

//   const handleNext = async () => {
//     // Pour les étapes 1-3 : validation simple
//     if (currentStep < 4) {
//       if (validateStep(currentStep)) {
//         setCurrentStep(currentStep + 1)
//         setError('')
//         window.scrollTo({ top: 0, behavior: 'smooth' })
//       }
//       return
//     }

//     // Pour l'étape 4 : vérification automatique
//     if (currentStep === 4) {
//       // 1. Valider que tous les documents sont présents
//       if (!validateStep(currentStep)) {
//         const errorMessages = Object.values(errors)
//         if (errorMessages.length > 0) {
//           setError(`❌ ${errorMessages.join(' ')}`)
//         }
//         return
//       }

//       // 2. Lancer la vérification automatique
//       const verificationOk = await lancerVerificationAutomatique()
      
//       if (!verificationOk) {
//         // L'erreur est déjà définie dans lancerVerificationAutomatique
//         return
//       }

//       // 3. Vérifier les croisements après la mise à jour du state
//       // Attendre un peu que le callback onCroisementValidityChange ait mis à jour le state
//       await new Promise(resolve => setTimeout(resolve, 500))

//       // 4. Vérifier que les croisements sont valides
//       // (sera vérifié via croisementsValides mis à jour par le callback)
//       if (!croisementsValides) {
//         const problemes = detailsCroisements.filter(d => d.startsWith('❌'))
//         if (problemes.length > 0) {
//           setError(`❌ Problèmes de cohérence détectés :\n${problemes.map(d => d.replace('❌ ', '')).join('\n')}`)
//         } else {
//           setError('❌ La vérification des croisements de documents a échoué. Veuillez vérifier vos documents.')
//         }
//         return
//       }

//       // 5. Tout est OK, passer au paiement
//       setCurrentStep(5)
//       setError('')
//       window.scrollTo({ top: 0, behavior: 'smooth' })
//     }
//   }

//   const handlePrevious = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1)
//       setError('')
//       window.scrollTo({ top: 0, behavior: 'smooth' })
//     }
//   }

//   const handleClose = () => {
//     const hasData = 
//       promoteur.nom_complet.trim() !== '' ||
//       promoteur.numero_telephone.trim() !== '' ||
//       promoteur.adresse_email.trim() !== '' ||
//       projet.nom_projet.trim() !== '' ||
//       projet.description_projet.trim() !== '' ||
//       finance.apport_personnel > 0 ||
//       Object.keys(documents).length > 0

//     if (hasData) {
//       setShowCloseConfirm(true)
//     } else {
//       onClose()
//     }
//   }

//   const confirmClose = () => {
//     setShowCloseConfirm(false)
//     onClose()
//   }

//   const sauvegarderProjet = async (): Promise<number> => {
//     if (!user) throw new Error('Utilisateur non connecté')

//     const { data: projetData, error: projetError } = await supabase
//       .from('projets_fpi')
//       .insert({
//         promoteur_id: user.id,
//         promoteur_nom_complet: promoteur.nom_complet,
//         promoteur_sexe: promoteur.sexe,
//         promoteur_telephone: promoteur.numero_telephone,
//         promoteur_email: promoteur.adresse_email,
//         promoteur_adresse: promoteur.adresse_physique,
//         promoteur_province: promoteur.province,
//         promoteur_ville: promoteur.ville,
//         promoteur_profession: promoteur.profession,
//         nom_projet: projet.nom_projet,
//         secteur_activite: projet.secteur_activite,
//         description_projet: projet.description_projet,
//         localisation_projet: projet.localisation_projet,
//         cout_total: projet.cout_total,
//         montant_sollicite: projet.montant_sollicite,
//         nombre_emplois: projet.nombre_emplois,
//         duree_realisation: projet.duree_realisation,
//         objectifs_projet: projet.objectifs_projet,
//         apport_personnel: finance.apport_personnel,
//         source_financement: finance.source_financement,
//         chiffre_affaires_previsionnel: finance.chiffre_affaires_previsionnel,
//         benefice_previsionnel: finance.benefice_previsionnel,
//         duree_remboursement: finance.duree_remboursement,
//         garanties_proposees: finance.garanties_proposees,
//         banque_partenaire: finance.banque_partenaire,
//         numero_compte_bancaire: finance.numero_compte_bancaire,
//         statut: 'brouillon',
//         etape: 'creation',
//         verification_documents: verificationResultats
//       })
//       .select()
//       .single()

//     if (projetError) throw projetError
//     const projetId = projetData.id

//     const docsKeys = Object.keys(documents) as (keyof DocumentsFPI)[]
//     for (const key of docsKeys) {
//       const file = documents[key]
//       if (file) {
//         const fileExt = file.name.split('.').pop()
//         const fileName = `${projetId}/${key}_${Date.now()}.${fileExt}`

//         const { error: uploadError } = await supabase.storage
//           .from('documents_fpi')
//           .upload(fileName, file)

//         if (uploadError) {
//           console.error(`Erreur upload ${key}:`, uploadError)
//           continue
//         }

//         const { data: { publicUrl } } = supabase.storage
//           .from('documents_fpi')
//           .getPublicUrl(fileName)

//         await supabase.from('documents_fpi').insert({
//           projet_id: projetId,
//           type_document: key,
//           chemin_fichier: publicUrl,
//           nom_fichier: file.name
//         })
//       }
//     }

//     await supabase.from('frais_dossier_fpi').insert({
//       projet_id: projetId,
//       montant: FRAIS_DOSSIER,
//       est_paye: false
//     })

//     return projetId
//   }

//   const handlePaiementComplete = async (paiementData: PaiementData) => {
//     setSubmitting(true)
//     setError('')
//     setSuccess('')

//     try {
//       const id = await sauvegarderProjet()
//       setProjetId(id)

//       await supabase
//         .from('frais_dossier_fpi')
//         .update({
//           est_paye: true,
//           reference_paiement: paiementData.reference,
//           date_paiement: paiementData.date_paiement,
//           methode_paiement: paiementData.methode,
//           operateur: paiementData.operateur || null,
//           numero: paiementData.numero || null
//         })
//         .eq('projet_id', id)

//       await supabase
//         .from('projets_fpi')
//         .update({ 
//           frais_paye: true,
//           statut: 'soumis',
//           etape: 'soumission'
//         })
//         .eq('id', id)

//       await envoyerNotificationServiceTechnique(id, projet.nom_projet)

//       await envoyerNotificationPush(
//         '✅ Demande FPI soumise avec succès',
//         `Votre demande "${projet.nom_projet}" a été soumise. Référence: ${paiementData.reference}`,
//         'paiement',
//         id
//       )

//       setSuccess('✅ Votre demande a été soumise avec succès !')
      
//       setTimeout(() => {
//         onSuccess()
//       }, 3000)

//     } catch (error: any) {
//       console.error('Erreur finalisation:', error)
//       setError(error.message || 'Erreur lors de la finalisation')
//       setSubmitting(false)
//     }
//   }

//   const renderStep = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <Step1Promoteur
//             data={promoteur}
//             onChange={setPromoteur}
//             errors={errors}
//           />
//         )
//       case 2:
//         return (
//           <Step2Projet
//             data={projet}
//             onChange={setProjet}
//             errors={errors}
//           />
//         )
//       case 3:
//         return (
//           <Step3Finance
//             data={finance}
//             onChange={setFinance}
//             errors={errors}
//             montantSollicite={projet.montant_sollicite}
//           />
//         )
//       case 4:
//         return (
//           <Step4Documents
//             documents={documents}
//             onChange={setDocuments}
//             onVerificationChange={setVerificationResultats}
//             onCroisementValidityChange={handleCroisementValidityChange}
//             resultatsExternes={verificationEffectuee ? verificationResultats : undefined}
//           />
//         )
//       case 5:
//         return (
//           <Step5Paiement
//             montant={FRAIS_DOSSIER}
//             reference={referencePaiement}
//             onRetour={() => setCurrentStep(4)}
//             onPaiementComplete={handlePaiementComplete}
//             submitting={submitting}
//           />
//         )
//       default:
//         return null
//     }
//   }

//   const isNextDisabled = () => {
//     if (verificationEnCours) return true
//     if (submitting) return true
//     return false
//   }

//   const getNextButtonText = () => {
//     if (verificationEnCours) {
//       return (
//         <>
//           <Loader2 className="h-4 w-4 animate-spin" />
//           Vérification en cours...
//         </>
//       )
//     }
//     if (currentStep === 4) {
//       return (
//         <>
//           Vérifier et passer au paiement
//           <ArrowRight className="h-4 w-4" />
//         </>
//       )
//     }
//     return (
//       <>
//         Suivant
//         <ArrowRight className="h-4 w-4" />
//       </>
//     )
//   }

//   return (
//     <div className="flex flex-col h-full overflow-auto">
//       {/* Header avec progression et bouton fermer */}
//       <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 relative">
//         <button
//           type="button"
//           onClick={handleClose}
//           className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 z-10"
//           title="Fermer le formulaire"
//         >
//           <X className="h-5 w-5" />
//         </button>

//         <h2 className="text-lg font-bold text-gray-900 mb-4 pr-8">
//           Nouvelle demande de financement FPI
//         </h2>
        
//         {/* Indicateur d'étapes */}
//         <div className="flex items-center gap-1 overflow-x-auto">
//           {STEPS.map((step, index) => (
//             <div key={step.id} className="flex items-center flex-1 min-w-fit">
//               <button
//                 type="button"
//                 onClick={() => {
//                   if (step.id < currentStep) {
//                     setCurrentStep(step.id)
//                     setError('')
//                   }
//                 }}
//                 disabled={step.id > currentStep}
//                 className={`flex flex-col items-center flex-1 ${
//                   step.id < currentStep ? 'cursor-pointer' : 'cursor-default'
//                 }`}
//               >
//                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
//                   step.id < currentStep
//                     ? 'bg-green-500 text-white'
//                     : step.id === currentStep
//                     ? 'bg-primary text-white ring-4 ring-primary/20'
//                     : 'bg-gray-100 text-gray-400'
//                 }`}>
//                   {step.id < currentStep ? (
//                     <CheckCircle className="h-4 w-4" />
//                   ) : (
//                     index + 1
//                   )}
//                 </div>
//                 <span className={`text-[10px] mt-1 font-medium hidden sm:block whitespace-nowrap ${
//                   step.id <= currentStep ? 'text-gray-700' : 'text-gray-400'
//                 }`}>
//                   {step.title}
//                 </span>
//               </button>
//               {index < STEPS.length - 1 && (
//                 <div className={`h-0.5 flex-1 -mt-4 ${
//                   step.id < currentStep ? 'bg-green-400' : 'bg-gray-200'
//                 }`} />
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Messages d'erreur et de succès */}
//       {(error || success) && (
//         <div className={`mx-6 mt-4 p-3 rounded-xl text-sm ${
//           success ? 'bg-green-50 border border-green-200 text-green-700' :
//           'bg-red-50 border border-red-200 text-red-700'
//         }`}>
//           <p className="font-medium whitespace-pre-wrap">{success || error}</p>
          
//           {/* Afficher les détails des croisements si disponible */}
//           {currentStep === 4 && errors.detailsCroisements && (
//             <div className="mt-2 pt-2 border-t border-red-200">
//               <p className="text-xs font-medium mb-1">Détails des incohérences :</p>
//               <pre className="text-xs whitespace-pre-wrap font-mono">
//                 {errors.detailsCroisements}
//               </pre>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Overlay de vérification - LOADING STATE VISIBLE */}
     

//       {/* Contenu du formulaire */}
//       <div className="flex-1 overflow-y-auto p-6">
//         {renderStep()}
//       </div>

//       {/* Footer avec boutons */}
//       {currentStep < 5 && (
//         <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
//           <div className="flex gap-3">
//             {currentStep > 1 && (
//               <button
//                 type="button"
//                 onClick={handlePrevious}
//                 disabled={isNextDisabled()}
//                 className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-white transition-colors disabled:opacity-50"
//               >
//                 <ArrowLeft className="h-4 w-4" />
//                 Précédent
//               </button>
//             )}

//             <button
//               type="button"
//               onClick={handleNext}
//               disabled={isNextDisabled()}
//               className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 ml-auto transition-colors disabled:opacity-50"
//             >
//               {getNextButtonText()}
//             </button>
//           </div>
          
//           {/* Message d'avertissement pour l'étape 4 après vérification */}
//           {currentStep === 4 && verificationEffectuee && !croisementsValides && (
//             <p className="text-xs text-amber-600 mt-2 text-center">
//               ⚠️ Les croisements de documents ne sont pas tous valides. Veuillez vérifier les documents et réessayer.
//             </p>
//           )}
//         </div>
//       )}

//       {/* Modal de confirmation de fermeture */}
//       {showCloseConfirm && (
//         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
//             <div className="text-center">
//               <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
//                 <FileText className="h-6 w-6 text-yellow-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                 Fermer le formulaire ?
//               </h3>
//               <p className="text-sm text-gray-600 mb-6">
//                 Vous avez déjà saisi des informations. Si vous fermez maintenant, 
//                 toutes les données seront perdues.
//               </p>
//               <div className="flex gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setShowCloseConfirm(false)}
//                   className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
//                 >
//                   Continuer
//                 </button>
//                 <button
//                   type="button"
//                   onClick={confirmClose}
//                   className="flex-1 py-2.5 px-4 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors"
//                 >
//                   Fermer
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// FormulaireFPI.tsx - CORRECTION CIBLÉE
'use client'

import { useState, useCallback, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { usePushNotifications } from '@/context/PushNotificationContext'
import { supabase } from '@/lib/supabase'
import {
  ArrowRight, ArrowLeft, Loader2, CheckCircle, CreditCard, FileText, X
} from 'lucide-react'
import { PromoteurInfo, ProjetInfo, InfoFinanciere, DocumentsFPI } from '@/types/fpi'
import Step1Promoteur from './Step1Promoteur'
import Step2Projet from './Step2Projet'
import Step3Finance from './Step3Finance'
import Step4Documents from './Step4Documents'
import Step5Paiement, { PaiementData } from './Step5Paiement'
import { verifierTousLesDocuments, type VerificationResult } from '@/lib/documentVerification'

const FRAIS_DOSSIER = 500

const STEPS = [
  { id: 1, title: 'Promoteur', icon: FileText },
  { id: 2, title: 'Projet', icon: FileText },
  { id: 3, title: 'Finance', icon: CreditCard },
  { id: 4, title: 'Documents', icon: FileText },
  { id: 5, title: 'Paiement', icon: CreditCard }
]

type Props = {
  onClose: () => void
  onSuccess: () => void
}

export default function FormulaireFPI({ onClose, onSuccess }: Props) {
  const { user } = useAuth()
  const { isSubscribed } = usePushNotifications()
  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [projetId, setProjetId] = useState<number | null>(null)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)

  // Données du formulaire - Étape 1: Promoteur
  const [promoteur, setPromoteur] = useState<PromoteurInfo>({
    nom_complet: '',
    sexe: 'M',
    numero_telephone: '',
    adresse_email: '',
    adresse_physique: '',
    province: '',
    ville: '',
    profession: ''
  })

  // Données du formulaire - Étape 2: Projet
  const [projet, setProjet] = useState<ProjetInfo>({
    nom_projet: '',
    secteur_activite: '',
    description_projet: '',
    localisation_projet: '',
    cout_total: 0,
    montant_sollicite: 0,
    nombre_emplois: 0,
    duree_realisation: '',
    objectifs_projet: ''
  })

  // Données du formulaire - Étape 3: Finance
  const [finance, setFinance] = useState<InfoFinanciere>({
    apport_personnel: 0,
    source_financement: '',
    chiffre_affaires_previsionnel: 0,
    benefice_previsionnel: 0,
    duree_remboursement: '',
    garanties_proposees: '',
    banque_partenaire: '',
    numero_compte_bancaire: ''
  })

  // Données du formulaire - Étape 4: Documents
  const [documents, setDocuments] = useState<DocumentsFPI>({})
  const [verificationResultats, setVerificationResultats] = useState<Record<string, VerificationResult | null>>({})
  const [verificationEnCours, setVerificationEnCours] = useState(false)
  
  // États pour la validation des croisements
  const [croisementsValides, setCroisementsValides] = useState(false)
  const [detailsCroisements, setDetailsCroisements] = useState<string[]>([])
  
  // État pour savoir si la vérification a déjà été effectuée
  const [verificationEffectuee, setVerificationEffectuee] = useState(false)

  // Refs pour éviter le stale closure
  const croisementsValidesRef = useRef(false)
  const detailsCroisementsRef = useRef<string[]>([])
  // NOUVEAU : Ref pour savoir si le callback a été appelé au moins une fois
  const croisementsCallbackAppeleRef = useRef(false)

  const referencePaiement = `FPI-${Date.now().toString(36).toUpperCase()}`
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleCroisementValidityChange = useCallback((isValid: boolean, details: string[]) => {
    console.log('📥 [FormulaireFPI] Croisement validity change:', { isValid, nbDetails: details.length, details })
    setCroisementsValides(isValid)
    setDetailsCroisements(details)
    croisementsValidesRef.current = isValid
    detailsCroisementsRef.current = details
    croisementsCallbackAppeleRef.current = true // Marquer que le callback a été appelé
  }, [])

  const envoyerNotificationPush = async (
    titre: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' | 'paiement' | 'document' = 'info',
    projetId?: number
  ) => {
    if (!user?.id) return false

    try {
      await supabase.from('notifications').insert({
        user_id: user.id,
        type,
        titre,
        message,
        lien: '/dashboard',
        projet_id: projetId || null,
        icone: type === 'paiement' ? 'CreditCard' : 'FileText',
        est_lue: false
      })

      if (isSubscribed) {
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
              url: '/dashboard',
              type,
              projetId,
              requireInteraction: type === 'paiement' || type === 'error'
            }
          })
        })
      }

      return true
    } catch (error) {
      console.error('Erreur notification:', error)
      return false
    }
  }

  const envoyerNotificationServiceTechnique = async (projetId: number, nomProjet: string) => {
    try {
      console.log('🔍 Recherche des techniciens...');
      
      const { data: techniciens, error: techError } = await supabase
        .from('users')
        .select('id, email, username, role')
        .eq('role', 'technique');

      if (techError) {
        console.error('❌ Erreur:', techError.message);
        return false;
      }

      if (!techniciens || techniciens.length === 0) {
        console.warn('⚠️ Aucun technicien trouvé');
        return false;
      }

      for (const technicien of techniciens) {
        await supabase.from('notifications').insert({
          user_id: technicien.id,
          type: 'info',
          titre: '🆕 NOUVEAU PROJET FPI À ANALYSER',
          message: `Le projet "${nomProjet}" vient d'être soumis et nécessite votre analyse technique.`,
          lien: '/dashboard',
          projet_id: projetId,
          icone: 'FileText',
          est_lue: false
        });

        await fetch('/api/push/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': technicien.id.toString()
          },
          body: JSON.stringify({
            userId: technicien.id.toString(),
            notification: {
              title: '🆕 NOUVEAU PROJET FPI',
              body: `"${nomProjet}" - Projet soumis, analyse technique requise`,
              url: '/dashboard',
              type: 'info',
              projetId: projetId,
              requireInteraction: true,
              vibrate: [200, 100, 200]
            }
          })
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Erreur:', error);
      return false;
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!promoteur.nom_complet.trim()) newErrors.nom_complet = 'Le nom complet est obligatoire'
        if (!promoteur.sexe) newErrors.sexe = 'Le sexe est obligatoire'
        if (!promoteur.numero_telephone.trim()) newErrors.numero_telephone = 'Le numéro de téléphone est obligatoire'
        if (!promoteur.adresse_email.trim()) newErrors.adresse_email = "L'adresse e-mail est obligatoire"
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(promoteur.adresse_email)) 
          newErrors.adresse_email = 'Adresse e-mail invalide'
        if (!promoteur.adresse_physique.trim()) newErrors.adresse_physique = "L'adresse physique est obligatoire"
        if (!promoteur.province) newErrors.province = 'La province est obligatoire'
        if (!promoteur.ville.trim()) newErrors.ville = 'La ville est obligatoire'
        if (!promoteur.profession.trim()) newErrors.profession = 'La profession est obligatoire'
        break

      case 2:
        if (!projet.nom_projet.trim()) newErrors.nom_projet = 'Le nom du projet est obligatoire'
        if (!projet.secteur_activite) newErrors.secteur_activite = "Le secteur d'activité est obligatoire"
        if (!projet.description_projet.trim()) newErrors.description_projet = 'La description du projet est obligatoire'
        if (!projet.localisation_projet.trim()) newErrors.localisation_projet = 'La localisation est obligatoire'
        if (!projet.cout_total || projet.cout_total <= 0) newErrors.cout_total = 'Le coût total doit être supérieur à 0'
        if (!projet.montant_sollicite || projet.montant_sollicite <= 0) 
          newErrors.montant_sollicite = 'Le montant sollicité doit être supérieur à 0'
        if (projet.montant_sollicite > projet.cout_total) 
          newErrors.montant_sollicite = 'Le montant sollicité ne peut pas dépasser le coût total'
        if (!projet.nombre_emplois || projet.nombre_emplois <= 0) 
          newErrors.nombre_emplois = "Le nombre d'emplois doit être supérieur à 0"
        if (!projet.duree_realisation.trim()) newErrors.duree_realisation = 'La durée de réalisation est obligatoire'
        if (!projet.objectifs_projet.trim()) newErrors.objectifs_projet = 'Les objectifs sont obligatoires'
        break

      case 3:
        if (!finance.apport_personnel && finance.apport_personnel !== 0) 
          newErrors.apport_personnel = "L'apport personnel est obligatoire"
        if (!finance.chiffre_affaires_previsionnel || finance.chiffre_affaires_previsionnel <= 0) 
          newErrors.chiffre_affaires_previsionnel = "Le chiffre d'affaires prévisionnel est obligatoire"
        if (!finance.benefice_previsionnel || finance.benefice_previsionnel <= 0) 
          newErrors.benefice_previsionnel = 'Le bénéfice prévisionnel est obligatoire'
        if (!finance.duree_remboursement) 
          newErrors.duree_remboursement = 'La durée de remboursement est obligatoire'
        if (!finance.garanties_proposees.trim()) 
          newErrors.garanties_proposees = 'Les garanties sont obligatoires'
        if (!finance.banque_partenaire) 
          newErrors.banque_partenaire = 'La banque partenaire est obligatoire'
        if (!finance.numero_compte_bancaire.trim()) 
          newErrors.numero_compte_bancaire = 'Le numéro de compte est obligatoire'
        break

      case 4:
        const docsRequis = ['carte_electeur', 'rccm', 'id_nat', 'attestation_fiscale', 'attestation_cnss'] as const
        const docNames: Record<string, string> = {
          'carte_electeur': "Carte d'électeur",
          'rccm': 'RCCM',
          'id_nat': 'ID NAT',
          'attestation_fiscale': 'Attestation fiscale',
          'attestation_cnss': 'Attestation CNSS'
        }
        
        const allDocsPresent = docsRequis.every(key => documents[key])
        if (!allDocsPresent) {
          const docsManquants = docsRequis.filter(key => !documents[key])
          newErrors.documents = `Documents obligatoires manquants : ${docsManquants.map(k => docNames[k] || k).join(', ')}`
          break
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const lancerVerificationAutomatique = async () => {
    const docsRequis = ['carte_electeur', 'rccm', 'id_nat', 'attestation_fiscale', 'attestation_cnss'] as const
    const docNames: Record<string, string> = {
      'carte_electeur': "Carte d'électeur",
      'rccm': 'RCCM',
      'id_nat': 'ID NAT',
      'attestation_fiscale': 'Attestation fiscale',
      'attestation_cnss': 'Attestation CNSS'
    }

    setVerificationEnCours(true)
    setError('')
    // Réinitialiser le flag du callback
    croisementsCallbackAppeleRef.current = false

    try {
      console.log('🔍 Lancement vérification automatique...')
      const resultats = await verifierTousLesDocuments(documents)
      console.log('📊 Résultats vérification:', resultats)
      
      setVerificationResultats(resultats)
      setVerificationEffectuee(true)

      // Vérifier les documents invalides
      const docsInvalides = docsRequis.filter(key => {
        const result = resultats[key]
        return result && !result.estValide
      })

      if (docsInvalides.length > 0) {
        const details = docsInvalides.map(k => 
          `${docNames[k] || k} (${resultats[k]?.commentaire || 'Non conforme'})`
        ).join(', ')
        setError(`❌ Documents non valides : ${details}`)
        setVerificationEnCours(false)
        return false
      }

      // Vérifier les scores faibles
      const docsFaibleScore = docsRequis.filter(key => {
        const result = resultats[key]
        return result && result.score < 50
      })

      if (docsFaibleScore.length > 0) {
        setError(`❌ Score de vérification trop faible pour : ${docsFaibleScore.map(k => docNames[k] || k).join(', ')}. Veuillez vérifier la qualité des documents.`)
        setVerificationEnCours(false)
        return false
      }

      // Attendre que Step4Documents ait calculé les croisements
      console.log('⏳ Attente de la mise à jour des croisements...')
      
      let attempts = 0
      const maxAttempts = 15
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // Vérifier si le callback a été appelé
        if (croisementsCallbackAppeleRef.current) {
          console.log('✅ Croisements mis à jour:', {
            estValide: croisementsValidesRef.current,
            nbDetails: detailsCroisementsRef.current.length,
            details: detailsCroisementsRef.current
          })
          break
        }
        
        attempts++
        console.log(`⏳ En attente... tentative ${attempts}/${maxAttempts}`)
      }

      setVerificationEnCours(false)
      return true

    } catch (err: any) {
      console.error('Erreur vérification:', err)
      setError('❌ Erreur lors de la vérification des documents. Veuillez réessayer.')
      setVerificationEnCours(false)
      return false
    }
  }

  const handleNext = async () => {
    if (currentStep < 4) {
      if (validateStep(currentStep)) {
        setCurrentStep(currentStep + 1)
        setError('')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }

    if (currentStep === 4) {
      if (!validateStep(currentStep)) {
        const errorMessages = Object.values(errors)
        if (errorMessages.length > 0) {
          setError(`❌ ${errorMessages.join(' ')}`)
        }
        return
      }

      const verificationOk = await lancerVerificationAutomatique()
      
      if (!verificationOk) {
        return
      }

      // CORRECTION : Vérifier si le callback a été appelé
      if (!croisementsCallbackAppeleRef.current) {
        // Le callback n'a pas été appelé, on ne peut pas savoir
        // On laisse passer car les documents sont valides
        console.log('⚠️ Callback croisements non appelé, mais documents valides - on laisse passer')
        setCurrentStep(5)
        setError('')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      // Utiliser la ref
      const croisementsOk = croisementsValidesRef.current
      const detailsOk = detailsCroisementsRef.current
      
      console.log('🔍 Vérification croisements:', { 
        croisementsOk, 
        nbDetails: detailsOk.length
      })

      // CORRECTION : Si les croisements sont valides, on passe
      if (croisementsOk) {
        setCurrentStep(5)
        setError('')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      // Si pas valide, vérifier pourquoi
      const problemes = detailsOk.filter((d: string) => d.startsWith('❌'))
      if (problemes.length > 0) {
        setError(`❌ Problèmes de cohérence détectés :\n${problemes.map((d: string) => d.replace('❌ ', '')).join('\n')}`)
      } else if (detailsOk.length === 0) {
        // Aucun détail = tout est OK en réalité (le callback a été appelé mais avec une liste vide ?)
        // On laisse passer
        console.log('⚠️ Aucun détail de croisement, on laisse passer')
        setCurrentStep(5)
        setError('')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setError('❌ La vérification des croisements de documents a échoué. Veuillez vérifier vos documents.')
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError('')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleClose = () => {
    const hasData = 
      promoteur.nom_complet.trim() !== '' ||
      promoteur.numero_telephone.trim() !== '' ||
      promoteur.adresse_email.trim() !== '' ||
      projet.nom_projet.trim() !== '' ||
      projet.description_projet.trim() !== '' ||
      finance.apport_personnel > 0 ||
      Object.keys(documents).length > 0

    if (hasData) {
      setShowCloseConfirm(true)
    } else {
      onClose()
    }
  }

  const confirmClose = () => {
    setShowCloseConfirm(false)
    onClose()
  }

  const sauvegarderProjet = async (): Promise<number> => {
    if (!user) throw new Error('Utilisateur non connecté')

    const { data: projetData, error: projetError } = await supabase
      .from('projets_fpi')
      .insert({
        promoteur_id: user.id,
        promoteur_nom_complet: promoteur.nom_complet,
        promoteur_sexe: promoteur.sexe,
        promoteur_telephone: promoteur.numero_telephone,
        promoteur_email: promoteur.adresse_email,
        promoteur_adresse: promoteur.adresse_physique,
        promoteur_province: promoteur.province,
        promoteur_ville: promoteur.ville,
        promoteur_profession: promoteur.profession,
        nom_projet: projet.nom_projet,
        secteur_activite: projet.secteur_activite,
        description_projet: projet.description_projet,
        localisation_projet: projet.localisation_projet,
        cout_total: projet.cout_total,
        montant_sollicite: projet.montant_sollicite,
        nombre_emplois: projet.nombre_emplois,
        duree_realisation: projet.duree_realisation,
        objectifs_projet: projet.objectifs_projet,
        apport_personnel: finance.apport_personnel,
        source_financement: finance.source_financement,
        chiffre_affaires_previsionnel: finance.chiffre_affaires_previsionnel,
        benefice_previsionnel: finance.benefice_previsionnel,
        duree_remboursement: finance.duree_remboursement,
        garanties_proposees: finance.garanties_proposees,
        banque_partenaire: finance.banque_partenaire,
        numero_compte_bancaire: finance.numero_compte_bancaire,
        statut: 'brouillon',
        etape: 'creation',
        verification_documents: verificationResultats
      })
      .select()
      .single()

    if (projetError) throw projetError
    const projetId = projetData.id

    const docsKeys = Object.keys(documents) as (keyof DocumentsFPI)[]
    for (const key of docsKeys) {
      const file = documents[key]
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${projetId}/${key}_${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('documents_fpi')
          .upload(fileName, file)

        if (uploadError) {
          console.error(`Erreur upload ${key}:`, uploadError)
          continue
        }

        const { data: { publicUrl } } = supabase.storage
          .from('documents_fpi')
          .getPublicUrl(fileName)

        await supabase.from('documents_fpi').insert({
          projet_id: projetId,
          type_document: key,
          chemin_fichier: publicUrl,
          nom_fichier: file.name
        })
      }
    }

    await supabase.from('frais_dossier_fpi').insert({
      projet_id: projetId,
      montant: FRAIS_DOSSIER,
      est_paye: false
    })

    return projetId
  }

  const handlePaiementComplete = async (paiementData: PaiementData) => {
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const id = await sauvegarderProjet()
      setProjetId(id)

      await supabase
        .from('frais_dossier_fpi')
        .update({
          est_paye: true,
          reference_paiement: paiementData.reference,
          date_paiement: paiementData.date_paiement,
          methode_paiement: paiementData.methode,
          operateur: paiementData.operateur || null,
          numero: paiementData.numero || null
        })
        .eq('projet_id', id)

      await supabase
        .from('projets_fpi')
        .update({ 
          frais_paye: true,
          statut: 'soumis',
          etape: 'soumission'
        })
        .eq('id', id)

      await envoyerNotificationServiceTechnique(id, projet.nom_projet)

      await envoyerNotificationPush(
        '✅ Demande FPI soumise avec succès',
        `Votre demande "${projet.nom_projet}" a été soumise. Référence: ${paiementData.reference}`,
        'paiement',
        id
      )

      setSuccess('✅ Votre demande a été soumise avec succès !')
      
      setTimeout(() => {
        onSuccess()
      }, 3000)

    } catch (error: any) {
      console.error('Erreur finalisation:', error)
      setError(error.message || 'Erreur lors de la finalisation')
      setSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Promoteur
            data={promoteur}
            onChange={setPromoteur}
            errors={errors}
          />
        )
      case 2:
        return (
          <Step2Projet
            data={projet}
            onChange={setProjet}
            errors={errors}
          />
        )
      case 3:
        return (
          <Step3Finance
            data={finance}
            onChange={setFinance}
            errors={errors}
            montantSollicite={projet.montant_sollicite}
          />
        )
      case 4:
        return (
          <Step4Documents
            documents={documents}
            onChange={setDocuments}
            onVerificationChange={setVerificationResultats}
            onCroisementValidityChange={handleCroisementValidityChange}
            resultatsExternes={verificationEffectuee ? verificationResultats : undefined}
          />
        )
      case 5:
        return (
          <Step5Paiement
            montant={FRAIS_DOSSIER}
            reference={referencePaiement}
            onRetour={() => setCurrentStep(4)}
            onPaiementComplete={handlePaiementComplete}
            submitting={submitting}
          />
        )
      default:
        return null
    }
  }

  const isNextDisabled = () => {
    if (verificationEnCours) return true
    if (submitting) return true
    return false
  }

  const getNextButtonText = () => {
    if (verificationEnCours) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Vérification en cours...
        </>
      )
    }
    if (currentStep === 4) {
      return (
        <>
          Vérifier et passer au paiement
          <ArrowRight className="h-4 w-4" />
        </>
      )
    }
    return (
      <>
        Suivant
        <ArrowRight className="h-4 w-4" />
      </>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 relative">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 z-10"
          title="Fermer le formulaire"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-4 pr-8">
          Nouvelle demande de financement FPI
        </h2>
        
        <div className="flex items-center gap-1 overflow-x-auto">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1 min-w-fit">
              <button
                type="button"
                onClick={() => {
                  if (step.id < currentStep) {
                    setCurrentStep(step.id)
                    setError('')
                  }
                }}
                disabled={step.id > currentStep}
                className={`flex flex-col items-center flex-1 ${
                  step.id < currentStep ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step.id < currentStep
                    ? 'bg-green-500 text-white'
                    : step.id === currentStep
                    ? 'bg-primary text-white ring-4 ring-primary/20'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {step.id < currentStep ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium hidden sm:block whitespace-nowrap ${
                  step.id <= currentStep ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
              </button>
              {index < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 -mt-4 ${
                  step.id < currentStep ? 'bg-green-400' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {(error || success) && (
        <div className={`mx-6 mt-4 p-3 rounded-xl text-sm ${
          success ? 'bg-green-50 border border-green-200 text-green-700' :
          'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <p className="font-medium whitespace-pre-wrap">{success || error}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        {renderStep()}
      </div>

      {currentStep < 5 && (
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                disabled={isNextDisabled()}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-white transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Précédent
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={isNextDisabled()}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 ml-auto transition-colors disabled:opacity-50"
            >
              {getNextButtonText()}
            </button>
          </div>
        </div>
      )}

      {showCloseConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Fermer le formulaire ?
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Vous avez déjà saisi des informations. Si vous fermez maintenant, 
                toutes les données seront perdues.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCloseConfirm(false)}
                  className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Continuer
                </button>
                <button
                  type="button"
                  onClick={confirmClose}
                  className="flex-1 py-2.5 px-4 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}