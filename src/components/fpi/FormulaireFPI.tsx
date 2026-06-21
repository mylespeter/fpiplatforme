

// // // // 'use client'

// // // // import { useState } from 'react'
// // // // import { useAuth } from '@/context/AuthContext'
// // // // import { usePushNotifications } from '@/context/PushNotificationContext'
// // // // import { supabase } from '@/lib/supabase'
// // // // import {
// // // //   ArrowRight, ArrowLeft, Loader2, CheckCircle, CreditCard, FileText, X, Building2
// // // // } from 'lucide-react'
// // // // import { PromoteurInfo, ProjetInfo, InfoFinanciere, DocumentsFPI, EntiteInfo } from '@/types/fpi'
// // // // import Step0Entite from './Step0Entite'
// // // // import Step1Promoteur from './Step1Promoteur'
// // // // import Step2Projet from './Step2Projet'
// // // // import Step3Finance from './Step3Finance'
// // // // import Step4Documents from './Step4Documents'
// // // // import Step5Paiement, { PaiementData } from './Step5Paiement'
// // // // import { verifierTousLesDocuments, type VerificationResult } from '@/lib/documentVerification'

// // // // const FRAIS_DOSSIER = 500

// // // // const STEPS = [
// // // //   { id: 0, title: 'Entité', icon: Building2 },
// // // //   { id: 1, title: 'Promoteur', icon: FileText },
// // // //   { id: 2, title: 'Projet', icon: FileText },
// // // //   { id: 3, title: 'Finance', icon: CreditCard },
// // // //   { id: 4, title: 'Documents', icon: FileText },
// // // //   { id: 5, title: 'Paiement', icon: CreditCard }
// // // // ]

// // // // type Props = {
// // // //   onClose: () => void
// // // //   onSuccess: () => void
// // // // }

// // // // export default function FormulaireFPI({ onClose, onSuccess }: Props) {
// // // //   const { user } = useAuth()
// // // //   const { isSubscribed } = usePushNotifications()
// // // //   const [currentStep, setCurrentStep] = useState(0)
// // // //   const [submitting, setSubmitting] = useState(false)
// // // //   const [error, setError] = useState('')
// // // //   const [success, setSuccess] = useState('')
// // // //   const [projetId, setProjetId] = useState<number | null>(null)
// // // //   const [showCloseConfirm, setShowCloseConfirm] = useState(false)

// // // //   // Données du formulaire - Étape 0: Entité
// // // //   const [entite, setEntite] = useState<EntiteInfo>({
// // // //     nom_entite: '',
// // // //     num_national: '',
// // // //     numero_rccm: '',
// // // //     siege_social: ''
// // // //   })

// // // //   // Données du formulaire - Étape 1: Promoteur
// // // //   const [promoteur, setPromoteur] = useState<PromoteurInfo>({
// // // //     nom_complet: '',
// // // //     sexe: 'M',
// // // //     numero_telephone: '',
// // // //     adresse_email: '',
// // // //     adresse_physique: '',
// // // //     province: '',
// // // //     ville: '',
// // // //     profession: ''
// // // //   })

// // // //   // Données du formulaire - Étape 2: Projet
// // // //   const [projet, setProjet] = useState<ProjetInfo>({
// // // //     nom_projet: '',
// // // //     secteur_activite: '',
// // // //     description_projet: '',
// // // //     localisation_projet: '',
// // // //     cout_total: 0,
// // // //     montant_sollicite: 0,
// // // //     nombre_emplois: 0,
// // // //     duree_realisation: '',
// // // //     objectifs_projet: ''
// // // //   })

// // // //   // Données du formulaire - Étape 3: Finance
// // // //   const [finance, setFinance] = useState<InfoFinanciere>({
// // // //     apport_personnel: 0,
// // // //     source_financement: '',
// // // //     chiffre_affaires_previsionnel: 0,
// // // //     benefice_previsionnel: 0,
// // // //     duree_remboursement: '',
// // // //     garanties_proposees: '',
// // // //     banque_partenaire: '',
// // // //     numero_compte_bancaire: ''
// // // //   })

// // // //   // Données du formulaire - Étape 4: Documents
// // // //   const [documents, setDocuments] = useState<DocumentsFPI>({})

// // // //   const [verificationResultats, setVerificationResultats] = useState<Record<string, VerificationResult | null>>({})
// // // //   const [verificationEnCours, setVerificationEnCours] = useState(false)

// // // //   const referencePaiement = `FPI-${Date.now().toString(36).toUpperCase()}`

// // // //   const [errors, setErrors] = useState<Record<string, string>>({})

// // // //   const envoyerNotificationPush = async (
// // // //     titre: string,
// // // //     message: string,
// // // //     type: 'info' | 'success' | 'warning' | 'error' | 'paiement' | 'document' = 'info',
// // // //     projetId?: number
// // // //   ) => {
// // // //     if (!user?.id) return false

// // // //     try {
// // // //       await supabase.from('notifications').insert({
// // // //         user_id: user.id,
// // // //         type,
// // // //         titre,
// // // //         message,
// // // //         lien: '/dashboard',
// // // //         projet_id: projetId || null,
// // // //         icone: type === 'paiement' ? 'CreditCard' : 'FileText',
// // // //         est_lue: false
// // // //       })

// // // //       if (isSubscribed) {
// // // //         await fetch('/api/push/send', {
// // // //           method: 'POST',
// // // //           headers: {
// // // //             'Content-Type': 'application/json',
// // // //             'x-user-id': user.id.toString()
// // // //           },
// // // //           body: JSON.stringify({
// // // //             userId: user.id,
// // // //             notification: {
// // // //               title: titre,
// // // //               body: message,
// // // //               url: '/dashboard',
// // // //               type,
// // // //               projetId,
// // // //               requireInteraction: type === 'paiement' || type === 'error'
// // // //             }
// // // //           })
// // // //         })
// // // //       }

// // // //       return true
// // // //     } catch (error) {
// // // //       console.error('Erreur notification:', error)
// // // //       return false
// // // //     }
// // // //   }
// // // // const envoyerNotificationServiceTechnique = async (projetId: number, nomProjet: string) => {
// // // //   try {
// // // //     console.log('🔍 Recherche des techniciens...');
    
// // // //     // Utiliser la table 'users' avec le rôle 'technique'
// // // //     const { data: techniciens, error: techError } = await supabase
// // // //       .from('users')  // Table correcte
// // // //       .select('id, email, username, role')
// // // //       .eq('role', 'technique');  // Rôle correct: 'technique' pas 'technicien'

// // // //     if (techError) {
// // // //       console.error('❌ Erreur détaillée:', {
// // // //         message: techError.message,
// // // //         code: techError.code,
// // // //         details: techError.details
// // // //       });
// // // //       return false;
// // // //     }

// // // //     if (!techniciens || techniciens.length === 0) {
// // // //       console.warn('⚠️ Aucun technicien trouvé dans la table users avec le rôle "technique"');
      
// // // //       // Vérifier quels rôles existent
// // // //       const { data: allRoles } = await supabase
// // // //         .from('users')
// // // //         .select('role')
// // // //         .limit(5);
      
// // // //       console.log('📊 Rôles existants:', allRoles);
// // // //       return false;
// // // //     }

// // // //     console.log(`✅ ${techniciens.length} technicien(s) trouvé(s):`, techniciens.map(t => ({ id: t.id, role: t.role })));

// // // //     // Envoyer les notifications
// // // //     for (const technicien of techniciens) {
// // // //       // Notification en base de données
// // // //       const { error: dbError } = await supabase
// // // //         .from('notifications')
// // // //         .insert({
// // // //           user_id: technicien.id,
// // // //           type: 'info',
// // // //           titre: '🆕 NOUVEAU PROJET FPI À ANALYSER',
// // // //           message: `Le projet "${nomProjet}" vient d'être soumis et nécessite votre analyse technique.`,
// // // //           lien: '/dashboard',
// // // //           projet_id: projetId,
// // // //           icone: 'FileText',
// // // //           est_lue: false
// // // //         });

// // // //       if (dbError) {
// // // //         console.error(`Erreur insertion notification pour technicien ${technicien.id}:`, dbError);
// // // //       } else {
// // // //         console.log(`✅ Notification DB envoyée au technicien ${technicien.id}`);
// // // //       }

// // // //       // Notification push
// // // //       try {
// // // //         const response = await fetch('/api/push/send', {
// // // //           method: 'POST',
// // // //           headers: {
// // // //             'Content-Type': 'application/json',
// // // //             'x-user-id': technicien.id.toString()
// // // //           },
// // // //           body: JSON.stringify({
// // // //             userId: technicien.id.toString(),
// // // //             notification: {
// // // //               title: '🆕 NOUVEAU PROJET FPI',
// // // //               body: `"${nomProjet}" - Projet soumis, analyse technique requise`,
// // // //               url: '/dashboard',
// // // //               type: 'info',
// // // //               projetId: projetId,
// // // //               requireInteraction: true,
// // // //               vibrate: [200, 100, 200]
// // // //             }
// // // //           })
// // // //         });

// // // //         if (response.ok) {
// // // //           console.log(`✅ Notification push envoyée au technicien ${technicien.id}`);
// // // //         }
// // // //       } catch (pushError) {
// // // //         console.error(`Erreur push pour technicien ${technicien.id}:`, pushError);
// // // //       }
// // // //     }

// // // //     return true;

// // // //   } catch (error) {
// // // //     console.error('❌ Erreur générale:', error);
// // // //     return false;
// // // //   }
// // // // };

// // // //   const validateStep = (step: number): boolean => {
// // // //     const newErrors: Record<string, string> = {}

// // // //     switch (step) {
// // // //       case 0: // Étape Entité
// // // //         if (!entite.nom_entite.trim()) newErrors.nom_entite = "Le nom de l'entité est obligatoire"
// // // //         if (!entite.num_national.trim()) newErrors.num_national = 'Le numéro national est obligatoire'
// // // //         if (!entite.numero_rccm.trim()) newErrors.numero_rccm = 'Le numéro RCCM est obligatoire'
// // // //         if (!entite.siege_social.trim()) newErrors.siege_social = 'Le siège social est obligatoire'
// // // //         break

// // // //       case 1: // Étape Promoteur
// // // //         if (!promoteur.nom_complet.trim()) newErrors.nom_complet = 'Le nom complet est obligatoire'
// // // //         if (!promoteur.sexe) newErrors.sexe = 'Le sexe est obligatoire'
// // // //         if (!promoteur.numero_telephone.trim()) newErrors.numero_telephone = 'Le numéro de téléphone est obligatoire'
// // // //         if (!promoteur.adresse_email.trim()) newErrors.adresse_email = "L'adresse e-mail est obligatoire"
// // // //         else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(promoteur.adresse_email)) 
// // // //           newErrors.adresse_email = 'Adresse e-mail invalide'
// // // //         if (!promoteur.adresse_physique.trim()) newErrors.adresse_physique = "L'adresse physique est obligatoire"
// // // //         if (!promoteur.province) newErrors.province = 'La province est obligatoire'
// // // //         if (!promoteur.ville.trim()) newErrors.ville = 'La ville est obligatoire'
// // // //         if (!promoteur.profession.trim()) newErrors.profession = 'La profession est obligatoire'
// // // //         break

// // // //       case 2: // Étape Projet
// // // //         if (!projet.nom_projet.trim()) newErrors.nom_projet = 'Le nom du projet est obligatoire'
// // // //         if (!projet.secteur_activite) newErrors.secteur_activite = "Le secteur d'activité est obligatoire"
// // // //         if (!projet.description_projet.trim()) newErrors.description_projet = 'La description du projet est obligatoire'
// // // //         if (!projet.localisation_projet.trim()) newErrors.localisation_projet = 'La localisation est obligatoire'
// // // //         if (!projet.cout_total || projet.cout_total <= 0) newErrors.cout_total = 'Le coût total doit être supérieur à 0'
// // // //         if (!projet.montant_sollicite || projet.montant_sollicite <= 0) 
// // // //           newErrors.montant_sollicite = 'Le montant sollicité doit être supérieur à 0'
// // // //         if (projet.montant_sollicite > projet.cout_total) 
// // // //           newErrors.montant_sollicite = 'Le montant sollicité ne peut pas dépasser le coût total'
// // // //         if (!projet.nombre_emplois || projet.nombre_emplois <= 0) 
// // // //           newErrors.nombre_emplois = "Le nombre d'emplois doit être supérieur à 0"
// // // //         if (!projet.duree_realisation.trim()) newErrors.duree_realisation = 'La durée de réalisation est obligatoire'
// // // //         if (!projet.objectifs_projet.trim()) newErrors.objectifs_projet = 'Les objectifs sont obligatoires'
// // // //         break

// // // //       case 3: // Étape Finance
// // // //         if (!finance.apport_personnel && finance.apport_personnel !== 0) 
// // // //           newErrors.apport_personnel = "L'apport personnel est obligatoire"
// // // //         if (!finance.chiffre_affaires_previsionnel || finance.chiffre_affaires_previsionnel <= 0) 
// // // //           newErrors.chiffre_affaires_previsionnel = "Le chiffre d'affaires prévisionnel est obligatoire"
// // // //         if (!finance.benefice_previsionnel || finance.benefice_previsionnel <= 0) 
// // // //           newErrors.benefice_previsionnel = 'Le bénéfice prévisionnel est obligatoire'
// // // //         if (!finance.duree_remboursement) 
// // // //           newErrors.duree_remboursement = 'La durée de remboursement est obligatoire'
// // // //         if (!finance.garanties_proposees.trim()) 
// // // //           newErrors.garanties_proposees = 'Les garanties sont obligatoires'
// // // //         if (!finance.banque_partenaire) 
// // // //           newErrors.banque_partenaire = 'La banque partenaire est obligatoire'
// // // //         if (!finance.numero_compte_bancaire.trim()) 
// // // //           newErrors.numero_compte_bancaire = 'Le numéro de compte est obligatoire'
// // // //         break

// // // //       case 4: // Étape Documents
// // // //         const docsRequis = ['carte_electeur', 'rccm', 'id_nat', 'attestation_fiscale', 'attestation_cnss'] as const
// // // //         const allDocsPresent = docsRequis.every(key => documents[key])
// // // //         if (!allDocsPresent) {
// // // //           newErrors.documents = 'Tous les documents obligatoires doivent être téléchargés'
// // // //         }
// // // //         break
// // // //     }

// // // //     setErrors(newErrors)
// // // //     return Object.keys(newErrors).length === 0
// // // //   }

 
// // // // const verifierDocumentsAvantPaiement = async (): Promise<boolean> => {
// // // //   setVerificationEnCours(true)
// // // //   setError('')
  
// // // //   try {
// // // //     const docsRequis = ['carte_electeur', 'rccm', 'id_nat', 'attestation_fiscale', 'attestation_cnss'] as const
// // // //     const allDocsPresent = docsRequis.every(key => documents[key])
    
// // // //     if (!allDocsPresent) {
// // // //       setError('❌ Tous les documents obligatoires doivent être téléchargés avant de continuer.')
// // // //       setVerificationEnCours(false)
// // // //       return false
// // // //     }

// // // //     const resultats = await verifierTousLesDocuments(documents)
// // // //     setVerificationResultats(resultats)

// // // //     // Vérifier si tous les documents sont valides
// // // //     const tousValides = Object.values(resultats).every(r => r.estValide)
    
// // // //     if (!tousValides) {
// // // //       const docsInvalides = Object.entries(resultats)
// // // //         .filter(([_, r]) => !r.estValide)
// // // //         .map(([key, r]) => {
// // // //           const docNames: Record<string, string> = {
// // // //             'carte_electeur': "Carte d'électeur",
// // // //             'rccm': 'RCCM',
// // // //             'id_nat': 'ID NAT',
// // // //             'attestation_fiscale': 'Attestation fiscale',
// // // //             'attestation_cnss': 'Attestation CNSS'
// // // //           }
// // // //           return `${docNames[key] || key} (${r.commentaire})`
// // // //         })
      
// // // //       setError(`⚠️ Certains documents n'ont pas passé la vérification : ${docsInvalides.join(', ')}. Veuillez vérifier et réessayer.`)
// // // //       setVerificationEnCours(false)
// // // //       return false
// // // //     }

// // // //     // Vérifier les documents avec une confiance faible ou des champs manquants
// // // //     const documentsAProblem = Object.entries(resultats).filter(([_, r]) => 
// // // //       r.confiance === 'faible' || (r.champsManquants && r.champsManquants.length > 0)
// // // //     )
    
// // // //     if (documentsAProblem.length > 0) {
// // // //       const problems = documentsAProblem.map(([key, r]) => {
// // // //         const docNames: Record<string, string> = {
// // // //           'carte_electeur': "Carte d'électeur",
// // // //           'rccm': 'RCCM',
// // // //           'id_nat': 'ID NAT',
// // // //           'attestation_fiscale': 'Attestation fiscale',
// // // //           'attestation_cnss': 'Attestation CNSS'
// // // //         }
// // // //         const champsManquants = r.champsManquants?.length 
// // // //           ? ` (champs manquants: ${r.champsManquants.join(', ')})` 
// // // //           : ''
// // // //         return `${docNames[key] || key}${champsManquants}`
// // // //       })
      
// // // //       setError(`⚠️ Des problèmes ont été détectés dans certains documents : ${problems.join(', ')}. Veuillez vérifier les informations.`)
// // // //       setVerificationEnCours(false)
// // // //       return false
// // // //     }

// // // //     setVerificationEnCours(false)
// // // //     return true
    
// // // //   } catch (err: any) {
// // // //     console.error('Erreur de vérification:', err)
// // // //     setError('❌ Erreur lors de la vérification des documents. Veuillez réessayer.')
// // // //     setVerificationEnCours(false)
// // // //     return false
// // // //   }
// // // // }
// // // //   const handleNext = async () => {
// // // //     if (validateStep(currentStep)) {
// // // //       if (currentStep === 4) {
// // // //         // Étape Documents - Vérifier avant d'aller au paiement
// // // //         const verificationOk = await verifierDocumentsAvantPaiement()
        
// // // //         if (!verificationOk) {
// // // //           return
// // // //         }
        
// // // //         setCurrentStep(5)
// // // //         window.scrollTo({ top: 0, behavior: 'smooth' })
// // // //       } else if (currentStep < 5) {
// // // //         setCurrentStep(currentStep + 1)
// // // //         window.scrollTo({ top: 0, behavior: 'smooth' })
// // // //       }
// // // //     }
// // // //   }

// // // //   const handlePrevious = () => {
// // // //     if (currentStep > 0) {
// // // //       setCurrentStep(currentStep - 1)
// // // //       window.scrollTo({ top: 0, behavior: 'smooth' })
// // // //     }
// // // //   }

// // // //   const handleClose = () => {
// // // //     const hasData = 
// // // //       entite.nom_entite.trim() !== '' ||
// // // //       entite.num_national.trim() !== '' ||
// // // //       entite.numero_rccm.trim() !== '' ||
// // // //       entite.siege_social.trim() !== '' ||
// // // //       promoteur.nom_complet.trim() !== '' ||
// // // //       promoteur.numero_telephone.trim() !== '' ||
// // // //       promoteur.adresse_email.trim() !== '' ||
// // // //       projet.nom_projet.trim() !== '' ||
// // // //       projet.description_projet.trim() !== '' ||
// // // //       finance.apport_personnel > 0 ||
// // // //       Object.keys(documents).length > 0

// // // //     if (hasData) {
// // // //       setShowCloseConfirm(true)
// // // //     } else {
// // // //       onClose()
// // // //     }
// // // //   }

// // // //   const confirmClose = () => {
// // // //     setShowCloseConfirm(false)
// // // //     onClose()
// // // //   }

// // // //   const sauvegarderProjet = async (): Promise<number> => {
// // // //     if (!user) throw new Error('Utilisateur non connecté')

// // // //     const { data: projetData, error: projetError } = await supabase
// // // //       .from('projets_fpi')
// // // //       .insert({
// // // //         promoteur_id: user.id,
// // // //         // Étape 0: Informations entité
// // // //         nom_entite: entite.nom_entite,
// // // //         num_national: entite.num_national,
// // // //         numero_rccm: entite.numero_rccm,
// // // //         siege_social: entite.siege_social,
// // // //         // Étape 1: Informations promoteur
// // // //         promoteur_nom_complet: promoteur.nom_complet,
// // // //         promoteur_sexe: promoteur.sexe,
// // // //         promoteur_telephone: promoteur.numero_telephone,
// // // //         promoteur_email: promoteur.adresse_email,
// // // //         promoteur_adresse: promoteur.adresse_physique,
// // // //         promoteur_province: promoteur.province,
// // // //         promoteur_ville: promoteur.ville,
// // // //         promoteur_profession: promoteur.profession,
// // // //         // Étape 2: Informations projet
// // // //         nom_projet: projet.nom_projet,
// // // //         secteur_activite: projet.secteur_activite,
// // // //         description_projet: projet.description_projet,
// // // //         localisation_projet: projet.localisation_projet,
// // // //         cout_total: projet.cout_total,
// // // //         montant_sollicite: projet.montant_sollicite,
// // // //         nombre_emplois: projet.nombre_emplois,
// // // //         duree_realisation: projet.duree_realisation,
// // // //         objectifs_projet: projet.objectifs_projet,
// // // //         // Étape 3: Informations financières
// // // //         apport_personnel: finance.apport_personnel,
// // // //         source_financement: finance.source_financement,
// // // //         chiffre_affaires_previsionnel: finance.chiffre_affaires_previsionnel,
// // // //         benefice_previsionnel: finance.benefice_previsionnel,
// // // //         duree_remboursement: finance.duree_remboursement,
// // // //         garanties_proposees: finance.garanties_proposees,
// // // //         banque_partenaire: finance.banque_partenaire,
// // // //         numero_compte_bancaire: finance.numero_compte_bancaire,
// // // //         // Statut
// // // //         statut: 'brouillon',
// // // //         etape: 'creation',
// // // //         verification_documents: verificationResultats
// // // //       })
// // // //       .select()
// // // //       .single()

// // // //     if (projetError) throw projetError
// // // //     const projetId = projetData.id

// // // //     // Sauvegarder les documents
// // // //     const docsKeys = Object.keys(documents) as (keyof DocumentsFPI)[]
// // // //     for (const key of docsKeys) {
// // // //       const file = documents[key]
// // // //       if (file) {
// // // //         const fileExt = file.name.split('.').pop()
// // // //         const fileName = `${projetId}/${key}_${Date.now()}.${fileExt}`

// // // //         const { error: uploadError } = await supabase.storage
// // // //           .from('documents_fpi')
// // // //           .upload(fileName, file)

// // // //         if (uploadError) {
// // // //           console.error(`Erreur upload ${key}:`, uploadError)
// // // //           continue
// // // //         }

// // // //         const { data: { publicUrl } } = supabase.storage
// // // //           .from('documents_fpi')
// // // //           .getPublicUrl(fileName)

// // // //         await supabase.from('documents_fpi').insert({
// // // //           projet_id: projetId,
// // // //           type_document: key,
// // // //           chemin_fichier: publicUrl,
// // // //           nom_fichier: file.name
// // // //         })
// // // //       }
// // // //     }

// // // //     // Créer l'entrée des frais de dossier
// // // //     await supabase.from('frais_dossier_fpi').insert({
// // // //       projet_id: projetId,
// // // //       montant: FRAIS_DOSSIER,
// // // //       est_paye: false
// // // //     })

// // // //     return projetId
// // // //   }
// // // // const handlePaiementComplete = async (paiementData: PaiementData) => {
// // // //   setSubmitting(true)
// // // //   setError('')
// // // //   setSuccess('')

// // // //   try {
// // // //     const id = await sauvegarderProjet()
// // // //     setProjetId(id)

// // // //     // Mettre à jour le paiement
// // // //     await supabase
// // // //       .from('frais_dossier_fpi')
// // // //       .update({
// // // //         est_paye: true,
// // // //         reference_paiement: paiementData.reference,
// // // //         date_paiement: paiementData.date_paiement,
// // // //         methode_paiement: paiementData.methode,
// // // //         operateur: paiementData.operateur || null,
// // // //         numero: paiementData.numero || null
// // // //       })
// // // //       .eq('projet_id', id)

// // // //     // Mettre à jour le statut du projet
// // // //     await supabase
// // // //       .from('projets_fpi')
// // // //       .update({ 
// // // //         frais_paye: true,
// // // //         statut: 'soumis',
// // // //         etape: 'soumission'
// // // //       })
// // // //       .eq('id', id)

// // // //     // 🔔🔔🔔 NOTIFICATION AU SERVICE TECHNIQUE (PUSH + DB) 🔔🔔🔔
// // // //     await envoyerNotificationServiceTechnique(id, projet.nom_projet)

// // // //     // Notification au promoteur
// // // //     await envoyerNotificationPush(
// // // //       '✅ Demande FPI soumise avec succès',
// // // //       `Votre demande "${projet.nom_projet}" a été soumise. Référence: ${paiementData.reference}`,
// // // //       'paiement',
// // // //       id
// // // //     )

// // // //     setSuccess('✅ Votre demande a été soumise avec succès !')
    
// // // //     setTimeout(() => {
// // // //       onSuccess()
// // // //     }, 3000)

// // // //   } catch (error: any) {
// // // //     console.error('Erreur finalisation:', error)
// // // //     setError(error.message || 'Erreur lors de la finalisation')
// // // //     setSubmitting(false)
// // // //   }
// // // // }
// // // //   // const handlePaiementComplete = async (paiementData: PaiementData) => {
// // // //   //   setSubmitting(true)
// // // //   //   setError('')
// // // //   //   setSuccess('')

// // // //   //   try {
// // // //   //     const id = await sauvegarderProjet()
// // // //   //     setProjetId(id)

// // // //   //     // Mettre à jour le paiement
// // // //   //     await supabase
// // // //   //       .from('frais_dossier_fpi')
// // // //   //       .update({
// // // //   //         est_paye: true,
// // // //   //         reference_paiement: paiementData.reference,
// // // //   //         date_paiement: paiementData.date_paiement,
// // // //   //         methode_paiement: paiementData.methode,
// // // //   //         operateur: paiementData.operateur || null,
// // // //   //         numero: paiementData.numero || null
// // // //   //       })
// // // //   //       .eq('projet_id', id)

// // // //   //     // Mettre à jour le statut du projet
// // // //   //     await supabase
// // // //   //       .from('projets_fpi')
// // // //   //       .update({ 
// // // //   //         frais_paye: true,
// // // //   //         statut: 'soumis',
// // // //   //         etape: 'soumission'
// // // //   //       })
// // // //   //       .eq('id', id)

// // // //   //     // Envoyer notification
// // // //   //     await envoyerNotificationPush(
// // // //   //       '✅ Demande FPI soumise',
// // // //   //       `Votre demande "${projet.nom_projet}" a été soumise avec succès. Paiement reçu: ${paiementData.reference}`,
// // // //   //       'paiement',
// // // //   //       id
// // // //   //     )

// // // //   //     setSuccess('✅ Votre demande a été soumise avec succès ! Vous allez être redirigé...')
      
// // // //   //     setTimeout(() => {
// // // //   //       onSuccess()
// // // //   //     }, 3000)

// // // //   //   } catch (error: any) {
// // // //   //     console.error('Erreur finalisation:', error)
// // // //   //     setError(error.message || 'Erreur lors de la finalisation de la demande')
// // // //   //     setSubmitting(false)
// // // //   //   }
// // // //   // }

// // // //   const renderStep = () => {
// // // //     switch (currentStep) {
// // // //       case 0:
// // // //         return (
// // // //           <Step0Entite
// // // //             data={entite}
// // // //             onChange={setEntite}
// // // //             errors={errors}
// // // //           />
// // // //         )
// // // //       case 1:
// // // //         return (
// // // //           <Step1Promoteur
// // // //             data={promoteur}
// // // //             onChange={setPromoteur}
// // // //             errors={errors}
// // // //           />
// // // //         )
// // // //       case 2:
// // // //         return (
// // // //           <Step2Projet
// // // //             data={projet}
// // // //             onChange={setProjet}
// // // //             errors={errors}
// // // //           />
// // // //         )
// // // //       case 3:
// // // //         return (
// // // //           <Step3Finance
// // // //             data={finance}
// // // //             onChange={setFinance}
// // // //             errors={errors}
// // // //             montantSollicite={projet.montant_sollicite}
// // // //           />
// // // //         )
// // // //       case 4:
// // // //         return (
// // // //           <Step4Documents
// // // //             documents={documents}
// // // //             onChange={setDocuments}
// // // //             onVerificationChange={setVerificationResultats}
// // // //           />
// // // //         )
// // // //       case 5:
// // // //         return (
// // // //           <Step5Paiement
// // // //             montant={FRAIS_DOSSIER}
// // // //             reference={referencePaiement}
// // // //             onRetour={() => setCurrentStep(4)}
// // // //             onPaiementComplete={handlePaiementComplete}
// // // //             submitting={submitting}
// // // //           />
// // // //         )
// // // //       default:
// // // //         return null
// // // //     }
// // // //   }

// // // //   return (
// // // //     <div className="flex flex-col  h-full overflow-auto">
// // // //       {/* Header avec progression et bouton fermer */}
// // // //       <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 relative">
// // // //         {/* Bouton fermer */}
// // // //         <button
// // // //           type="button"
// // // //           onClick={handleClose}
// // // //           className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 z-10"
// // // //           title="Fermer le formulaire"
// // // //         >
// // // //           <X className="h-5 w-5" />
// // // //         </button>

// // // //         <h2 className="text-lg font-bold text-gray-900 mb-4 pr-8">
// // // //           Nouvelle demande de financement FPI
// // // //         </h2>
        
// // // //         {/* Indicateur d'étapes */}
// // // //         <div className="flex items-center gap-1 overflow-x-auto">
// // // //           {STEPS.map((step, index) => (
// // // //             <div key={step.id} className="flex items-center flex-1 min-w-fit">
// // // //               <button
// // // //                 type="button"
// // // //                 onClick={() => {
// // // //                   if (step.id < currentStep) {
// // // //                     setCurrentStep(step.id)
// // // //                   }
// // // //                 }}
// // // //                 disabled={step.id > currentStep}
// // // //                 className={`flex flex-col items-center flex-1 ${
// // // //                   step.id < currentStep ? 'cursor-pointer' : 'cursor-default'
// // // //                 }`}
// // // //               >
// // // //                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
// // // //                   step.id < currentStep
// // // //                     ? 'bg-green-500 text-white'
// // // //                     : step.id === currentStep
// // // //                     ? 'bg-primary text-white ring-4 ring-primary/20'
// // // //                     : 'bg-gray-100 text-gray-400'
// // // //                 }`}>
// // // //                   {step.id < currentStep ? (
// // // //                     <CheckCircle className="h-4 w-4" />
// // // //                   ) : (
// // // //                     step.id
// // // //                   )}
// // // //                 </div>
// // // //                 <span className={`text-[10px] mt-1 font-medium hidden sm:block whitespace-nowrap ${
// // // //                   step.id <= currentStep ? 'text-gray-700' : 'text-gray-400'
// // // //                 }`}>
// // // //                   {step.title}
// // // //                 </span>
// // // //               </button>
// // // //               {index < STEPS.length - 1 && (
// // // //                 <div className={`h-0.5 flex-1 -mt-4 ${
// // // //                   step.id < currentStep ? 'bg-green-400' : 'bg-gray-200'
// // // //                 }`} />
// // // //               )}
// // // //             </div>
// // // //           ))}
// // // //         </div>
// // // //       </div>

// // // //       {/* Messages */}
// // // //       {(error || success) && (
// // // //         <div className={`mx-6 mt-4 p-3 rounded-xl text-sm ${
// // // //           success ? 'bg-green-50 border border-green-200 text-green-700' :
// // // //           'bg-red-50 border border-red-200 text-red-700'
// // // //         }`}>
// // // //           {success || error}
// // // //         </div>
// // // //       )}

// // // //       {/* Overlay de vérification */}
// // // //       {verificationEnCours && (
// // // //         <div className="mx-6 mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-200">
// // // //           <div className="flex items-center gap-3">
// // // //             <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
// // // //             <div>
// // // //               <p className="text-sm font-semibold text-indigo-900">
// // // //                 Vérification automatique des documents en cours...
// // // //               </p>
// // // //               <p className="text-xs text-indigo-700 mt-1">
// // // //                 Notre IA analyse vos documents pour vérifier leur validité et leur cohérence.
// // // //                 Veuillez patienter quelques instants...
// // // //               </p>
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       )}

// // // //       {/* Contenu du formulaire */}
// // // //       <div className="flex-1 overflow-y-auto p-6">
// // // //         {renderStep()}
// // // //       </div>

// // // //       {/* Footer avec boutons (caché à l'étape 6 car géré par Step5Paiement) */}
// // // //       {currentStep < 5 && (
// // // //         <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
// // // //           <div className="flex gap-3">
// // // //             {currentStep > 0 && (
// // // //               <button
// // // //                 type="button"
// // // //                 onClick={handlePrevious}
// // // //                 disabled={verificationEnCours}
// // // //                 className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-white transition-colors disabled:opacity-50"
// // // //               >
// // // //                 <ArrowLeft className="h-4 w-4" />
// // // //                 Précédent
// // // //               </button>
// // // //             )}

// // // //             <button
// // // //               type="button"
// // // //               onClick={handleNext}
// // // //               disabled={verificationEnCours}
// // // //               className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 ml-auto transition-colors disabled:opacity-50"
// // // //             >
// // // //               {verificationEnCours ? (
// // // //                 <>
// // // //                   <Loader2 className="h-4 w-4 animate-spin" />
// // // //                   Vérification en cours...
// // // //                 </>
// // // //               ) : currentStep === 4 ? (
// // // //                 <>
// // // //                   Aller au paiement
// // // //                   <ArrowRight className="h-4 w-4" />
// // // //                 </>
// // // //               ) : (
// // // //                 <>
// // // //                   Suivant
// // // //                   <ArrowRight className="h-4 w-4" />
// // // //                 </>
// // // //               )}
// // // //             </button>
// // // //           </div>
// // // //         </div>
// // // //       )}

// // // //       {/* Modal de confirmation de fermeture */}
// // // //       {showCloseConfirm && (
// // // //         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
// // // //           <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
// // // //             <div className="text-center">
// // // //               <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
// // // //                 <FileText className="h-6 w-6 text-yellow-600" />
// // // //               </div>
// // // //               <h3 className="text-lg font-semibold text-gray-900 mb-2">
// // // //                 Fermer le formulaire ?
// // // //               </h3>
// // // //               <p className="text-sm text-gray-600 mb-6">
// // // //                 Vous avez déjà saisi des informations. Si vous fermez maintenant, 
// // // //                 toutes les données seront perdues.
// // // //               </p>
// // // //               <div className="flex gap-3">
// // // //                 <button
// // // //                   type="button"
// // // //                   onClick={() => setShowCloseConfirm(false)}
// // // //                   className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
// // // //                 >
// // // //                   Continuer
// // // //                 </button>
// // // //                 <button
// // // //                   type="button"
// // // //                   onClick={confirmClose}
// // // //                   className="flex-1 py-2.5 px-4 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors"
// // // //                 >
// // // //                   Fermer
// // // //                 </button>
// // // //               </div>
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   )
// // // // }

// // // 'use client'

// // // import { useState } from 'react'
// // // import { useAuth } from '@/context/AuthContext'
// // // import { usePushNotifications } from '@/context/PushNotificationContext'
// // // import { supabase } from '@/lib/supabase'
// // // import {
// // //   ArrowRight, ArrowLeft, Loader2, CheckCircle, CreditCard, FileText, X
// // // } from 'lucide-react'
// // // import { PromoteurInfo, ProjetInfo, InfoFinanciere, DocumentsFPI } from '@/types/fpi'
// // // // Supprimer l'import de Step0Entite
// // // import Step1Promoteur from './Step1Promoteur'
// // // import Step2Projet from './Step2Projet'
// // // import Step3Finance from './Step3Finance'
// // // import Step4Documents from './Step4Documents'
// // // import Step5Paiement, { PaiementData } from './Step5Paiement'
// // // import { verifierTousLesDocuments, type VerificationResult } from '@/lib/documentVerification'

// // // const FRAIS_DOSSIER = 500

// // // // Supprimer l'étape 0 de la liste des étapes
// // // const STEPS = [
// // //   { id: 1, title: 'Promoteur', icon: FileText },
// // //   { id: 2, title: 'Projet', icon: FileText },
// // //   { id: 3, title: 'Finance', icon: CreditCard },
// // //   { id: 4, title: 'Documents', icon: FileText },
// // //   { id: 5, title: 'Paiement', icon: CreditCard }
// // // ]

// // // type Props = {
// // //   onClose: () => void
// // //   onSuccess: () => void
// // // }

// // // export default function FormulaireFPI({ onClose, onSuccess }: Props) {
// // //   const { user } = useAuth()
// // //   const { isSubscribed } = usePushNotifications()
// // //   const [currentStep, setCurrentStep] = useState(1) // Démarrer à l'étape 1 au lieu de 0
// // //   const [submitting, setSubmitting] = useState(false)
// // //   const [error, setError] = useState('')
// // //   const [success, setSuccess] = useState('')
// // //   const [projetId, setProjetId] = useState<number | null>(null)
// // //   const [showCloseConfirm, setShowCloseConfirm] = useState(false)

// // //   // Supprimer les états de l'entité

// // //   // Données du formulaire - Étape 1: Promoteur (maintenant étape 1)
// // //   const [promoteur, setPromoteur] = useState<PromoteurInfo>({
// // //     nom_complet: '',
// // //     sexe: 'M',
// // //     numero_telephone: '',
// // //     adresse_email: '',
// // //     adresse_physique: '',
// // //     province: '',
// // //     ville: '',
// // //     profession: ''
// // //   })

// // //   // Données du formulaire - Étape 2: Projet (maintenant étape 2)
// // //   const [projet, setProjet] = useState<ProjetInfo>({
// // //     nom_projet: '',
// // //     secteur_activite: '',
// // //     description_projet: '',
// // //     localisation_projet: '',
// // //     cout_total: 0,
// // //     montant_sollicite: 0,
// // //     nombre_emplois: 0,
// // //     duree_realisation: '',
// // //     objectifs_projet: ''
// // //   })

// // //   // Données du formulaire - Étape 3: Finance (maintenant étape 3)
// // //   const [finance, setFinance] = useState<InfoFinanciere>({
// // //     apport_personnel: 0,
// // //     source_financement: '',
// // //     chiffre_affaires_previsionnel: 0,
// // //     benefice_previsionnel: 0,
// // //     duree_remboursement: '',
// // //     garanties_proposees: '',
// // //     banque_partenaire: '',
// // //     numero_compte_bancaire: ''
// // //   })

// // //   // Données du formulaire - Étape 4: Documents (maintenant étape 4)
// // //   const [documents, setDocuments] = useState<DocumentsFPI>({})

// // //   const [verificationResultats, setVerificationResultats] = useState<Record<string, VerificationResult | null>>({})
// // //   const [verificationEnCours, setVerificationEnCours] = useState(false)

// // //   const referencePaiement = `FPI-${Date.now().toString(36).toUpperCase()}`

// // //   const [errors, setErrors] = useState<Record<string, string>>({})

// // //   const envoyerNotificationPush = async (
// // //     titre: string,
// // //     message: string,
// // //     type: 'info' | 'success' | 'warning' | 'error' | 'paiement' | 'document' = 'info',
// // //     projetId?: number
// // //   ) => {
// // //     if (!user?.id) return false

// // //     try {
// // //       await supabase.from('notifications').insert({
// // //         user_id: user.id,
// // //         type,
// // //         titre,
// // //         message,
// // //         lien: '/dashboard',
// // //         projet_id: projetId || null,
// // //         icone: type === 'paiement' ? 'CreditCard' : 'FileText',
// // //         est_lue: false
// // //       })

// // //       if (isSubscribed) {
// // //         await fetch('/api/push/send', {
// // //           method: 'POST',
// // //           headers: {
// // //             'Content-Type': 'application/json',
// // //             'x-user-id': user.id.toString()
// // //           },
// // //           body: JSON.stringify({
// // //             userId: user.id,
// // //             notification: {
// // //               title: titre,
// // //               body: message,
// // //               url: '/dashboard',
// // //               type,
// // //               projetId,
// // //               requireInteraction: type === 'paiement' || type === 'error'
// // //             }
// // //           })
// // //         })
// // //       }

// // //       return true
// // //     } catch (error) {
// // //       console.error('Erreur notification:', error)
// // //       return false
// // //     }
// // //   }

// // //   const envoyerNotificationServiceTechnique = async (projetId: number, nomProjet: string) => {
// // //     try {
// // //       console.log('🔍 Recherche des techniciens...');
      
// // //       const { data: techniciens, error: techError } = await supabase
// // //         .from('users')
// // //         .select('id, email, username, role')
// // //         .eq('role', 'technique');

// // //       if (techError) {
// // //         console.error('❌ Erreur détaillée:', {
// // //           message: techError.message,
// // //           code: techError.code,
// // //           details: techError.details
// // //         });
// // //         return false;
// // //       }

// // //       if (!techniciens || techniciens.length === 0) {
// // //         console.warn('⚠️ Aucun technicien trouvé dans la table users avec le rôle "technique"');
        
// // //         const { data: allRoles } = await supabase
// // //           .from('users')
// // //           .select('role')
// // //           .limit(5);
        
// // //         console.log('📊 Rôles existants:', allRoles);
// // //         return false;
// // //       }

// // //       console.log(`✅ ${techniciens.length} technicien(s) trouvé(s):`, techniciens.map(t => ({ id: t.id, role: t.role })));

// // //       for (const technicien of techniciens) {
// // //         const { error: dbError } = await supabase
// // //           .from('notifications')
// // //           .insert({
// // //             user_id: technicien.id,
// // //             type: 'info',
// // //             titre: '🆕 NOUVEAU PROJET FPI À ANALYSER',
// // //             message: `Le projet "${nomProjet}" vient d'être soumis et nécessite votre analyse technique.`,
// // //             lien: '/dashboard',
// // //             projet_id: projetId,
// // //             icone: 'FileText',
// // //             est_lue: false
// // //           });

// // //         if (dbError) {
// // //           console.error(`Erreur insertion notification pour technicien ${technicien.id}:`, dbError);
// // //         } else {
// // //           console.log(`✅ Notification DB envoyée au technicien ${technicien.id}`);
// // //         }

// // //         try {
// // //           const response = await fetch('/api/push/send', {
// // //             method: 'POST',
// // //             headers: {
// // //               'Content-Type': 'application/json',
// // //               'x-user-id': technicien.id.toString()
// // //             },
// // //             body: JSON.stringify({
// // //               userId: technicien.id.toString(),
// // //               notification: {
// // //                 title: '🆕 NOUVEAU PROJET FPI',
// // //                 body: `"${nomProjet}" - Projet soumis, analyse technique requise`,
// // //                 url: '/dashboard',
// // //                 type: 'info',
// // //                 projetId: projetId,
// // //                 requireInteraction: true,
// // //                 vibrate: [200, 100, 200]
// // //               }
// // //             })
// // //           });

// // //           if (response.ok) {
// // //             console.log(`✅ Notification push envoyée au technicien ${technicien.id}`);
// // //           }
// // //         } catch (pushError) {
// // //           console.error(`Erreur push pour technicien ${technicien.id}:`, pushError);
// // //         }
// // //       }

// // //       return true;

// // //     } catch (error) {
// // //       console.error('❌ Erreur générale:', error);
// // //       return false;
// // //     }
// // //   };

// // //   const validateStep = (step: number): boolean => {
// // //     const newErrors: Record<string, string> = {}

// // //     switch (step) {
// // //       case 1: // Étape Promoteur
// // //         if (!promoteur.nom_complet.trim()) newErrors.nom_complet = 'Le nom complet est obligatoire'
// // //         if (!promoteur.sexe) newErrors.sexe = 'Le sexe est obligatoire'
// // //         if (!promoteur.numero_telephone.trim()) newErrors.numero_telephone = 'Le numéro de téléphone est obligatoire'
// // //         if (!promoteur.adresse_email.trim()) newErrors.adresse_email = "L'adresse e-mail est obligatoire"
// // //         else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(promoteur.adresse_email)) 
// // //           newErrors.adresse_email = 'Adresse e-mail invalide'
// // //         if (!promoteur.adresse_physique.trim()) newErrors.adresse_physique = "L'adresse physique est obligatoire"
// // //         if (!promoteur.province) newErrors.province = 'La province est obligatoire'
// // //         if (!promoteur.ville.trim()) newErrors.ville = 'La ville est obligatoire'
// // //         if (!promoteur.profession.trim()) newErrors.profession = 'La profession est obligatoire'
// // //         break

// // //       case 2: // Étape Projet
// // //         if (!projet.nom_projet.trim()) newErrors.nom_projet = 'Le nom du projet est obligatoire'
// // //         if (!projet.secteur_activite) newErrors.secteur_activite = "Le secteur d'activité est obligatoire"
// // //         if (!projet.description_projet.trim()) newErrors.description_projet = 'La description du projet est obligatoire'
// // //         if (!projet.localisation_projet.trim()) newErrors.localisation_projet = 'La localisation est obligatoire'
// // //         if (!projet.cout_total || projet.cout_total <= 0) newErrors.cout_total = 'Le coût total doit être supérieur à 0'
// // //         if (!projet.montant_sollicite || projet.montant_sollicite <= 0) 
// // //           newErrors.montant_sollicite = 'Le montant sollicité doit être supérieur à 0'
// // //         if (projet.montant_sollicite > projet.cout_total) 
// // //           newErrors.montant_sollicite = 'Le montant sollicité ne peut pas dépasser le coût total'
// // //         if (!projet.nombre_emplois || projet.nombre_emplois <= 0) 
// // //           newErrors.nombre_emplois = "Le nombre d'emplois doit être supérieur à 0"
// // //         if (!projet.duree_realisation.trim()) newErrors.duree_realisation = 'La durée de réalisation est obligatoire'
// // //         if (!projet.objectifs_projet.trim()) newErrors.objectifs_projet = 'Les objectifs sont obligatoires'
// // //         break

// // //       case 3: // Étape Finance
// // //         if (!finance.apport_personnel && finance.apport_personnel !== 0) 
// // //           newErrors.apport_personnel = "L'apport personnel est obligatoire"
// // //         if (!finance.chiffre_affaires_previsionnel || finance.chiffre_affaires_previsionnel <= 0) 
// // //           newErrors.chiffre_affaires_previsionnel = "Le chiffre d'affaires prévisionnel est obligatoire"
// // //         if (!finance.benefice_previsionnel || finance.benefice_previsionnel <= 0) 
// // //           newErrors.benefice_previsionnel = 'Le bénéfice prévisionnel est obligatoire'
// // //         if (!finance.duree_remboursement) 
// // //           newErrors.duree_remboursement = 'La durée de remboursement est obligatoire'
// // //         if (!finance.garanties_proposees.trim()) 
// // //           newErrors.garanties_proposees = 'Les garanties sont obligatoires'
// // //         if (!finance.banque_partenaire) 
// // //           newErrors.banque_partenaire = 'La banque partenaire est obligatoire'
// // //         if (!finance.numero_compte_bancaire.trim()) 
// // //           newErrors.numero_compte_bancaire = 'Le numéro de compte est obligatoire'
// // //         break

// // //       case 4: // Étape Documents
// // //         const docsRequis = ['carte_electeur', 'rccm', 'id_nat', 'attestation_fiscale', 'attestation_cnss'] as const
// // //         const allDocsPresent = docsRequis.every(key => documents[key])
// // //         if (!allDocsPresent) {
// // //           newErrors.documents = 'Tous les documents obligatoires doivent être téléchargés'
// // //         }
// // //         break
// // //     }

// // //     setErrors(newErrors)
// // //     return Object.keys(newErrors).length === 0
// // //   }

// // //   const verifierDocumentsAvantPaiement = async (): Promise<boolean> => {
// // //     setVerificationEnCours(true)
// // //     setError('')
    
// // //     try {
// // //       const docsRequis = ['carte_electeur', 'rccm', 'id_nat', 'attestation_fiscale', 'attestation_cnss'] as const
// // //       const allDocsPresent = docsRequis.every(key => documents[key])
      
// // //       if (!allDocsPresent) {
// // //         setError('❌ Tous les documents obligatoires doivent être téléchargés avant de continuer.')
// // //         setVerificationEnCours(false)
// // //         return false
// // //       }

// // //       const resultats = await verifierTousLesDocuments(documents)
// // //       setVerificationResultats(resultats)

// // //       const tousValides = Object.values(resultats).every(r => r.estValide)
      
// // //       if (!tousValides) {
// // //         const docsInvalides = Object.entries(resultats)
// // //           .filter(([_, r]) => !r.estValide)
// // //           .map(([key, r]) => {
// // //             const docNames: Record<string, string> = {
// // //               'carte_electeur': "Carte d'électeur",
// // //               'rccm': 'RCCM',
// // //               'id_nat': 'ID NAT',
// // //               'attestation_fiscale': 'Attestation fiscale',
// // //               'attestation_cnss': 'Attestation CNSS'
// // //             }
// // //             return `${docNames[key] || key} (${r.commentaire})`
// // //           })
        
// // //         setError(`⚠️ Certains documents n'ont pas passé la vérification : ${docsInvalides.join(', ')}. Veuillez vérifier et réessayer.`)
// // //         setVerificationEnCours(false)
// // //         return false
// // //       }

// // //       const documentsAProblem = Object.entries(resultats).filter(([_, r]) => 
// // //         r.confiance === 'faible' || (r.champsManquants && r.champsManquants.length > 0)
// // //       )
      
// // //       if (documentsAProblem.length > 0) {
// // //         const problems = documentsAProblem.map(([key, r]) => {
// // //           const docNames: Record<string, string> = {
// // //             'carte_electeur': "Carte d'électeur",
// // //             'rccm': 'RCCM',
// // //             'id_nat': 'ID NAT',
// // //             'attestation_fiscale': 'Attestation fiscale',
// // //             'attestation_cnss': 'Attestation CNSS'
// // //           }
// // //           const champsManquants = r.champsManquants?.length 
// // //             ? ` (champs manquants: ${r.champsManquants.join(', ')})` 
// // //             : ''
// // //           return `${docNames[key] || key}${champsManquants}`
// // //         })
        
// // //         setError(`⚠️ Des problèmes ont été détectés dans certains documents : ${problems.join(', ')}. Veuillez vérifier les informations.`)
// // //         setVerificationEnCours(false)
// // //         return false
// // //       }

// // //       setVerificationEnCours(false)
// // //       return true
      
// // //     } catch (err: any) {
// // //       console.error('Erreur de vérification:', err)
// // //       setError('❌ Erreur lors de la vérification des documents. Veuillez réessayer.')
// // //       setVerificationEnCours(false)
// // //       return false
// // //     }
// // //   }

// // //   const handleNext = async () => {
// // //     if (validateStep(currentStep)) {
// // //       if (currentStep === 4) {
// // //         const verificationOk = await verifierDocumentsAvantPaiement()
        
// // //         if (!verificationOk) {
// // //           return
// // //         }
        
// // //         setCurrentStep(5)
// // //         window.scrollTo({ top: 0, behavior: 'smooth' })
// // //       } else if (currentStep < 5) {
// // //         setCurrentStep(currentStep + 1)
// // //         window.scrollTo({ top: 0, behavior: 'smooth' })
// // //       }
// // //     }
// // //   }

// // //   const handlePrevious = () => {
// // //     if (currentStep > 1) { // Changé de > 0 à > 1
// // //       setCurrentStep(currentStep - 1)
// // //       window.scrollTo({ top: 0, behavior: 'smooth' })
// // //     }
// // //   }

// // //   const handleClose = () => {
// // //     const hasData = 
// // //       promoteur.nom_complet.trim() !== '' ||
// // //       promoteur.numero_telephone.trim() !== '' ||
// // //       promoteur.adresse_email.trim() !== '' ||
// // //       projet.nom_projet.trim() !== '' ||
// // //       projet.description_projet.trim() !== '' ||
// // //       finance.apport_personnel > 0 ||
// // //       Object.keys(documents).length > 0

// // //     if (hasData) {
// // //       setShowCloseConfirm(true)
// // //     } else {
// // //       onClose()
// // //     }
// // //   }

// // //   const confirmClose = () => {
// // //     setShowCloseConfirm(false)
// // //     onClose()
// // //   }

// // //   const sauvegarderProjet = async (): Promise<number> => {
// // //     if (!user) throw new Error('Utilisateur non connecté')

// // //     const { data: projetData, error: projetError } = await supabase
// // //       .from('projets_fpi')
// // //       .insert({
// // //         promoteur_id: user.id,
// // //         // Supprimer toutes les colonnes de l'entité
// // //         // Étape 1: Informations promoteur
// // //         promoteur_nom_complet: promoteur.nom_complet,
// // //         promoteur_sexe: promoteur.sexe,
// // //         promoteur_telephone: promoteur.numero_telephone,
// // //         promoteur_email: promoteur.adresse_email,
// // //         promoteur_adresse: promoteur.adresse_physique,
// // //         promoteur_province: promoteur.province,
// // //         promoteur_ville: promoteur.ville,
// // //         promoteur_profession: promoteur.profession,
// // //         // Étape 2: Informations projet
// // //         nom_projet: projet.nom_projet,
// // //         secteur_activite: projet.secteur_activite,
// // //         description_projet: projet.description_projet,
// // //         localisation_projet: projet.localisation_projet,
// // //         cout_total: projet.cout_total,
// // //         montant_sollicite: projet.montant_sollicite,
// // //         nombre_emplois: projet.nombre_emplois,
// // //         duree_realisation: projet.duree_realisation,
// // //         objectifs_projet: projet.objectifs_projet,
// // //         // Étape 3: Informations financières
// // //         apport_personnel: finance.apport_personnel,
// // //         source_financement: finance.source_financement,
// // //         chiffre_affaires_previsionnel: finance.chiffre_affaires_previsionnel,
// // //         benefice_previsionnel: finance.benefice_previsionnel,
// // //         duree_remboursement: finance.duree_remboursement,
// // //         garanties_proposees: finance.garanties_proposees,
// // //         banque_partenaire: finance.banque_partenaire,
// // //         numero_compte_bancaire: finance.numero_compte_bancaire,
// // //         // Statut
// // //         statut: 'brouillon',
// // //         etape: 'creation',
// // //         verification_documents: verificationResultats
// // //       })
// // //       .select()
// // //       .single()

// // //     if (projetError) throw projetError
// // //     const projetId = projetData.id

// // //     // Sauvegarder les documents
// // //     const docsKeys = Object.keys(documents) as (keyof DocumentsFPI)[]
// // //     for (const key of docsKeys) {
// // //       const file = documents[key]
// // //       if (file) {
// // //         const fileExt = file.name.split('.').pop()
// // //         const fileName = `${projetId}/${key}_${Date.now()}.${fileExt}`

// // //         const { error: uploadError } = await supabase.storage
// // //           .from('documents_fpi')
// // //           .upload(fileName, file)

// // //         if (uploadError) {
// // //           console.error(`Erreur upload ${key}:`, uploadError)
// // //           continue
// // //         }

// // //         const { data: { publicUrl } } = supabase.storage
// // //           .from('documents_fpi')
// // //           .getPublicUrl(fileName)

// // //         await supabase.from('documents_fpi').insert({
// // //           projet_id: projetId,
// // //           type_document: key,
// // //           chemin_fichier: publicUrl,
// // //           nom_fichier: file.name
// // //         })
// // //       }
// // //     }

// // //     // Créer l'entrée des frais de dossier
// // //     await supabase.from('frais_dossier_fpi').insert({
// // //       projet_id: projetId,
// // //       montant: FRAIS_DOSSIER,
// // //       est_paye: false
// // //     })

// // //     return projetId
// // //   }

// // //   const handlePaiementComplete = async (paiementData: PaiementData) => {
// // //     setSubmitting(true)
// // //     setError('')
// // //     setSuccess('')

// // //     try {
// // //       const id = await sauvegarderProjet()
// // //       setProjetId(id)

// // //       await supabase
// // //         .from('frais_dossier_fpi')
// // //         .update({
// // //           est_paye: true,
// // //           reference_paiement: paiementData.reference,
// // //           date_paiement: paiementData.date_paiement,
// // //           methode_paiement: paiementData.methode,
// // //           operateur: paiementData.operateur || null,
// // //           numero: paiementData.numero || null
// // //         })
// // //         .eq('projet_id', id)

// // //       await supabase
// // //         .from('projets_fpi')
// // //         .update({ 
// // //           frais_paye: true,
// // //           statut: 'soumis',
// // //           etape: 'soumission'
// // //         })
// // //         .eq('id', id)

// // //       await envoyerNotificationServiceTechnique(id, projet.nom_projet)

// // //       await envoyerNotificationPush(
// // //         '✅ Demande FPI soumise avec succès',
// // //         `Votre demande "${projet.nom_projet}" a été soumise. Référence: ${paiementData.reference}`,
// // //         'paiement',
// // //         id
// // //       )

// // //       setSuccess('✅ Votre demande a été soumise avec succès !')
      
// // //       setTimeout(() => {
// // //         onSuccess()
// // //       }, 3000)

// // //     } catch (error: any) {
// // //       console.error('Erreur finalisation:', error)
// // //       setError(error.message || 'Erreur lors de la finalisation')
// // //       setSubmitting(false)
// // //     }
// // //   }

// // //   const renderStep = () => {
// // //     switch (currentStep) {
// // //       case 1: // Maintenant l'étape 1 est Promoteur
// // //         return (
// // //           <Step1Promoteur
// // //             data={promoteur}
// // //             onChange={setPromoteur}
// // //             errors={errors}
// // //           />
// // //         )
// // //       case 2:
// // //         return (
// // //           <Step2Projet
// // //             data={projet}
// // //             onChange={setProjet}
// // //             errors={errors}
// // //           />
// // //         )
// // //       case 3:
// // //         return (
// // //           <Step3Finance
// // //             data={finance}
// // //             onChange={setFinance}
// // //             errors={errors}
// // //             montantSollicite={projet.montant_sollicite}
// // //           />
// // //         )
// // //       case 4:
// // //         return (
// // //           <Step4Documents
// // //             documents={documents}
// // //             onChange={setDocuments}
// // //             onVerificationChange={setVerificationResultats}
// // //           />
// // //         )
// // //       case 5:
// // //         return (
// // //           <Step5Paiement
// // //             montant={FRAIS_DOSSIER}
// // //             reference={referencePaiement}
// // //             onRetour={() => setCurrentStep(4)}
// // //             onPaiementComplete={handlePaiementComplete}
// // //             submitting={submitting}
// // //           />
// // //         )
// // //       default:
// // //         return null
// // //     }
// // //   }

// // //   return (
// // //     <div className="flex flex-col h-full overflow-auto">
// // //       {/* Header avec progression et bouton fermer */}
// // //       <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 relative">
// // //         <button
// // //           type="button"
// // //           onClick={handleClose}
// // //           className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 z-10"
// // //           title="Fermer le formulaire"
// // //         >
// // //           <X className="h-5 w-5" />
// // //         </button>

// // //         <h2 className="text-lg font-bold text-gray-900 mb-4 pr-8">
// // //           Nouvelle demande de financement FPI
// // //         </h2>
        
// // //         {/* Indicateur d'étapes - Les IDs sont maintenant décalés */}
// // //         <div className="flex items-center gap-1 overflow-x-auto">
// // //           {STEPS.map((step, index) => (
// // //             <div key={step.id} className="flex items-center flex-1 min-w-fit">
// // //               <button
// // //                 type="button"
// // //                 onClick={() => {
// // //                   if (step.id < currentStep) {
// // //                     setCurrentStep(step.id)
// // //                   }
// // //                 }}
// // //                 disabled={step.id > currentStep}
// // //                 className={`flex flex-col items-center flex-1 ${
// // //                   step.id < currentStep ? 'cursor-pointer' : 'cursor-default'
// // //                 }`}
// // //               >
// // //                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
// // //                   step.id < currentStep
// // //                     ? 'bg-green-500 text-white'
// // //                     : step.id === currentStep
// // //                     ? 'bg-primary text-white ring-4 ring-primary/20'
// // //                     : 'bg-gray-100 text-gray-400'
// // //                 }`}>
// // //                   {step.id < currentStep ? (
// // //                     <CheckCircle className="h-4 w-4" />
// // //                   ) : (
// // //                     index // Utiliser index pour afficher les numéros 1-5
// // //                   )}
// // //                 </div>
// // //                 <span className={`text-[10px] mt-1 font-medium hidden sm:block whitespace-nowrap ${
// // //                   step.id <= currentStep ? 'text-gray-700' : 'text-gray-400'
// // //                 }`}>
// // //                   {step.title}
// // //                 </span>
// // //               </button>
// // //               {index < STEPS.length - 1 && (
// // //                 <div className={`h-0.5 flex-1 -mt-4 ${
// // //                   step.id < currentStep ? 'bg-green-400' : 'bg-gray-200'
// // //                 }`} />
// // //               )}
// // //             </div>
// // //           ))}
// // //         </div>
// // //       </div>

// // //       {/* Messages */}
// // //       {(error || success) && (
// // //         <div className={`mx-6 mt-4 p-3 rounded-xl text-sm ${
// // //           success ? 'bg-green-50 border border-green-200 text-green-700' :
// // //           'bg-red-50 border border-red-200 text-red-700'
// // //         }`}>
// // //           {success || error}
// // //         </div>
// // //       )}

// // //       {/* Overlay de vérification */}
// // //       {verificationEnCours && (
// // //         <div className="mx-6 mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-200">
// // //           <div className="flex items-center gap-3">
// // //             <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
// // //             <div>
// // //               <p className="text-sm font-semibold text-indigo-900">
// // //                 Vérification automatique des documents en cours...
// // //               </p>
// // //               <p className="text-xs text-indigo-700 mt-1">
// // //                 Notre IA analyse vos documents pour vérifier leur validité et leur cohérence.
// // //                 Veuillez patienter quelques instants...
// // //               </p>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       )}

// // //       {/* Contenu du formulaire */}
// // //       <div className="flex-1 overflow-y-auto p-6">
// // //         {renderStep()}
// // //       </div>

// // //       {/* Footer avec boutons */}
// // //       {currentStep < 5 && (
// // //         <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
// // //           <div className="flex gap-3">
// // //             {currentStep > 1 && ( // Changé de > 0 à > 1
// // //               <button
// // //                 type="button"
// // //                 onClick={handlePrevious}
// // //                 disabled={verificationEnCours}
// // //                 className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-white transition-colors disabled:opacity-50"
// // //               >
// // //                 <ArrowLeft className="h-4 w-4" />
// // //                 Précédent
// // //               </button>
// // //             )}

// // //             <button
// // //               type="button"
// // //               onClick={handleNext}
// // //               disabled={verificationEnCours}
// // //               className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 ml-auto transition-colors disabled:opacity-50"
// // //             >
// // //               {verificationEnCours ? (
// // //                 <>
// // //                   <Loader2 className="h-4 w-4 animate-spin" />
// // //                   Vérification en cours...
// // //                 </>
// // //               ) : currentStep === 4 ? (
// // //                 <>
// // //                   Aller au paiement
// // //                   <ArrowRight className="h-4 w-4" />
// // //                 </>
// // //               ) : (
// // //                 <>
// // //                   Suivant
// // //                   <ArrowRight className="h-4 w-4" />
// // //                 </>
// // //               )}
// // //             </button>
// // //           </div>
// // //         </div>
// // //       )}

// // //       {/* Modal de confirmation de fermeture */}
// // //       {showCloseConfirm && (
// // //         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
// // //           <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
// // //             <div className="text-center">
// // //               <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
// // //                 <FileText className="h-6 w-6 text-yellow-600" />
// // //               </div>
// // //               <h3 className="text-lg font-semibold text-gray-900 mb-2">
// // //                 Fermer le formulaire ?
// // //               </h3>
// // //               <p className="text-sm text-gray-600 mb-6">
// // //                 Vous avez déjà saisi des informations. Si vous fermez maintenant, 
// // //                 toutes les données seront perdues.
// // //               </p>
// // //               <div className="flex gap-3">
// // //                 <button
// // //                   type="button"
// // //                   onClick={() => setShowCloseConfirm(false)}
// // //                   className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
// // //                 >
// // //                   Continuer
// // //                 </button>
// // //                 <button
// // //                   type="button"
// // //                   onClick={confirmClose}
// // //                   className="flex-1 py-2.5 px-4 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors"
// // //                 >
// // //                   Fermer
// // //                 </button>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       )}
// // //     </div>
// // //   )
// // // }

// // // FormulaireFPI.tsx
// // 'use client'

// // import { useState } from 'react'
// // import { useAuth } from '@/context/AuthContext'
// // import { usePushNotifications } from '@/context/PushNotificationContext'
// // import { supabase } from '@/lib/supabase'
// // import {
// //   ArrowRight, ArrowLeft, Loader2, CheckCircle, CreditCard, FileText, X
// // } from 'lucide-react'
// // import { PromoteurInfo, ProjetInfo, InfoFinanciere, DocumentsFPI } from '@/types/fpi'
// // import Step1Promoteur from './Step1Promoteur'
// // import Step2Projet from './Step2Projet'
// // import Step3Finance from './Step3Finance'
// // import Step4Documents from './Step4Documents'
// // import Step5Paiement, { PaiementData } from './Step5Paiement'
// // import { verifierTousLesDocuments, type VerificationResult } from '@/lib/documentVerification'

// // const FRAIS_DOSSIER = 500

// // const STEPS = [
// //   { id: 1, title: 'Promoteur', icon: FileText },
// //   { id: 2, title: 'Projet', icon: FileText },
// //   { id: 3, title: 'Finance', icon: CreditCard },
// //   { id: 4, title: 'Documents', icon: FileText },
// //   { id: 5, title: 'Paiement', icon: CreditCard }
// // ]

// // type Props = {
// //   onClose: () => void
// //   onSuccess: () => void
// // }

// // export default function FormulaireFPI({ onClose, onSuccess }: Props) {
// //   const { user } = useAuth()
// //   const { isSubscribed } = usePushNotifications()
// //   const [currentStep, setCurrentStep] = useState(1)
// //   const [submitting, setSubmitting] = useState(false)
// //   const [error, setError] = useState('')
// //   const [success, setSuccess] = useState('')
// //   const [projetId, setProjetId] = useState<number | null>(null)
// //   const [showCloseConfirm, setShowCloseConfirm] = useState(false)

// //   // Données du formulaire - Étape 1: Promoteur
// //   const [promoteur, setPromoteur] = useState<PromoteurInfo>({
// //     nom_complet: '',
// //     sexe: 'M',
// //     numero_telephone: '',
// //     adresse_email: '',
// //     adresse_physique: '',
// //     province: '',
// //     ville: '',
// //     profession: ''
// //   })

// //   // Données du formulaire - Étape 2: Projet
// //   const [projet, setProjet] = useState<ProjetInfo>({
// //     nom_projet: '',
// //     secteur_activite: '',
// //     description_projet: '',
// //     localisation_projet: '',
// //     cout_total: 0,
// //     montant_sollicite: 0,
// //     nombre_emplois: 0,
// //     duree_realisation: '',
// //     objectifs_projet: ''
// //   })

// //   // Données du formulaire - Étape 3: Finance
// //   const [finance, setFinance] = useState<InfoFinanciere>({
// //     apport_personnel: 0,
// //     source_financement: '',
// //     chiffre_affaires_previsionnel: 0,
// //     benefice_previsionnel: 0,
// //     duree_remboursement: '',
// //     garanties_proposees: '',
// //     banque_partenaire: '',
// //     numero_compte_bancaire: ''
// //   })

// //   // Données du formulaire - Étape 4: Documents
// //   const [documents, setDocuments] = useState<DocumentsFPI>({})
// //   const [verificationResultats, setVerificationResultats] = useState<Record<string, VerificationResult | null>>({})
// //   const [verificationEnCours, setVerificationEnCours] = useState(false)
  
// //   // NOUVEAU : États pour la validation des croisements
// //   const [croisementsValides, setCroisementsValides] = useState(false)
// //   const [detailsCroisements, setDetailsCroisements] = useState<string[]>([])

// //   const referencePaiement = `FPI-${Date.now().toString(36).toUpperCase()}`
// //   const [errors, setErrors] = useState<Record<string, string>>({})

// //   const envoyerNotificationPush = async (
// //     titre: string,
// //     message: string,
// //     type: 'info' | 'success' | 'warning' | 'error' | 'paiement' | 'document' = 'info',
// //     projetId?: number
// //   ) => {
// //     if (!user?.id) return false

// //     try {
// //       await supabase.from('notifications').insert({
// //         user_id: user.id,
// //         type,
// //         titre,
// //         message,
// //         lien: '/dashboard',
// //         projet_id: projetId || null,
// //         icone: type === 'paiement' ? 'CreditCard' : 'FileText',
// //         est_lue: false
// //       })

// //       if (isSubscribed) {
// //         await fetch('/api/push/send', {
// //           method: 'POST',
// //           headers: {
// //             'Content-Type': 'application/json',
// //             'x-user-id': user.id.toString()
// //           },
// //           body: JSON.stringify({
// //             userId: user.id,
// //             notification: {
// //               title: titre,
// //               body: message,
// //               url: '/dashboard',
// //               type,
// //               projetId,
// //               requireInteraction: type === 'paiement' || type === 'error'
// //             }
// //           })
// //         })
// //       }

// //       return true
// //     } catch (error) {
// //       console.error('Erreur notification:', error)
// //       return false
// //     }
// //   }

// //   const envoyerNotificationServiceTechnique = async (projetId: number, nomProjet: string) => {
// //     try {
// //       console.log('🔍 Recherche des techniciens...');
      
// //       const { data: techniciens, error: techError } = await supabase
// //         .from('users')
// //         .select('id, email, username, role')
// //         .eq('role', 'technique');

// //       if (techError) {
// //         console.error('❌ Erreur détaillée:', {
// //           message: techError.message,
// //           code: techError.code,
// //           details: techError.details
// //         });
// //         return false;
// //       }

// //       if (!techniciens || techniciens.length === 0) {
// //         console.warn('⚠️ Aucun technicien trouvé dans la table users avec le rôle "technique"');
        
// //         const { data: allRoles } = await supabase
// //           .from('users')
// //           .select('role')
// //           .limit(5);
        
// //         console.log('📊 Rôles existants:', allRoles);
// //         return false;
// //       }

// //       console.log(`✅ ${techniciens.length} technicien(s) trouvé(s):`, techniciens.map(t => ({ id: t.id, role: t.role })));

// //       for (const technicien of techniciens) {
// //         const { error: dbError } = await supabase
// //           .from('notifications')
// //           .insert({
// //             user_id: technicien.id,
// //             type: 'info',
// //             titre: '🆕 NOUVEAU PROJET FPI À ANALYSER',
// //             message: `Le projet "${nomProjet}" vient d'être soumis et nécessite votre analyse technique.`,
// //             lien: '/dashboard',
// //             projet_id: projetId,
// //             icone: 'FileText',
// //             est_lue: false
// //           });

// //         if (dbError) {
// //           console.error(`Erreur insertion notification pour technicien ${technicien.id}:`, dbError);
// //         } else {
// //           console.log(`✅ Notification DB envoyée au technicien ${technicien.id}`);
// //         }

// //         try {
// //           const response = await fetch('/api/push/send', {
// //             method: 'POST',
// //             headers: {
// //               'Content-Type': 'application/json',
// //               'x-user-id': technicien.id.toString()
// //             },
// //             body: JSON.stringify({
// //               userId: technicien.id.toString(),
// //               notification: {
// //                 title: '🆕 NOUVEAU PROJET FPI',
// //                 body: `"${nomProjet}" - Projet soumis, analyse technique requise`,
// //                 url: '/dashboard',
// //                 type: 'info',
// //                 projetId: projetId,
// //                 requireInteraction: true,
// //                 vibrate: [200, 100, 200]
// //               }
// //             })
// //           });

// //           if (response.ok) {
// //             console.log(`✅ Notification push envoyée au technicien ${technicien.id}`);
// //           }
// //         } catch (pushError) {
// //           console.error(`Erreur push pour technicien ${technicien.id}:`, pushError);
// //         }
// //       }

// //       return true;

// //     } catch (error) {
// //       console.error('❌ Erreur générale:', error);
// //       return false;
// //     }
// //   };

// //   const validateStep = (step: number): boolean => {
// //     const newErrors: Record<string, string> = {}

// //     switch (step) {
// //       case 1: // Étape Promoteur
// //         if (!promoteur.nom_complet.trim()) newErrors.nom_complet = 'Le nom complet est obligatoire'
// //         if (!promoteur.sexe) newErrors.sexe = 'Le sexe est obligatoire'
// //         if (!promoteur.numero_telephone.trim()) newErrors.numero_telephone = 'Le numéro de téléphone est obligatoire'
// //         if (!promoteur.adresse_email.trim()) newErrors.adresse_email = "L'adresse e-mail est obligatoire"
// //         else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(promoteur.adresse_email)) 
// //           newErrors.adresse_email = 'Adresse e-mail invalide'
// //         if (!promoteur.adresse_physique.trim()) newErrors.adresse_physique = "L'adresse physique est obligatoire"
// //         if (!promoteur.province) newErrors.province = 'La province est obligatoire'
// //         if (!promoteur.ville.trim()) newErrors.ville = 'La ville est obligatoire'
// //         if (!promoteur.profession.trim()) newErrors.profession = 'La profession est obligatoire'
// //         break

// //       case 2: // Étape Projet
// //         if (!projet.nom_projet.trim()) newErrors.nom_projet = 'Le nom du projet est obligatoire'
// //         if (!projet.secteur_activite) newErrors.secteur_activite = "Le secteur d'activité est obligatoire"
// //         if (!projet.description_projet.trim()) newErrors.description_projet = 'La description du projet est obligatoire'
// //         if (!projet.localisation_projet.trim()) newErrors.localisation_projet = 'La localisation est obligatoire'
// //         if (!projet.cout_total || projet.cout_total <= 0) newErrors.cout_total = 'Le coût total doit être supérieur à 0'
// //         if (!projet.montant_sollicite || projet.montant_sollicite <= 0) 
// //           newErrors.montant_sollicite = 'Le montant sollicité doit être supérieur à 0'
// //         if (projet.montant_sollicite > projet.cout_total) 
// //           newErrors.montant_sollicite = 'Le montant sollicité ne peut pas dépasser le coût total'
// //         if (!projet.nombre_emplois || projet.nombre_emplois <= 0) 
// //           newErrors.nombre_emplois = "Le nombre d'emplois doit être supérieur à 0"
// //         if (!projet.duree_realisation.trim()) newErrors.duree_realisation = 'La durée de réalisation est obligatoire'
// //         if (!projet.objectifs_projet.trim()) newErrors.objectifs_projet = 'Les objectifs sont obligatoires'
// //         break

// //       case 3: // Étape Finance
// //         if (!finance.apport_personnel && finance.apport_personnel !== 0) 
// //           newErrors.apport_personnel = "L'apport personnel est obligatoire"
// //         if (!finance.chiffre_affaires_previsionnel || finance.chiffre_affaires_previsionnel <= 0) 
// //           newErrors.chiffre_affaires_previsionnel = "Le chiffre d'affaires prévisionnel est obligatoire"
// //         if (!finance.benefice_previsionnel || finance.benefice_previsionnel <= 0) 
// //           newErrors.benefice_previsionnel = 'Le bénéfice prévisionnel est obligatoire'
// //         if (!finance.duree_remboursement) 
// //           newErrors.duree_remboursement = 'La durée de remboursement est obligatoire'
// //         if (!finance.garanties_proposees.trim()) 
// //           newErrors.garanties_proposees = 'Les garanties sont obligatoires'
// //         if (!finance.banque_partenaire) 
// //           newErrors.banque_partenaire = 'La banque partenaire est obligatoire'
// //         if (!finance.numero_compte_bancaire.trim()) 
// //           newErrors.numero_compte_bancaire = 'Le numéro de compte est obligatoire'
// //         break

// //       case 4: // Étape Documents - VALIDATION RENFORCÉE
// //         const docsRequis = ['carte_electeur', 'rccm', 'id_nat', 'attestation_fiscale', 'attestation_cnss'] as const
// //         const docNames: Record<string, string> = {
// //           'carte_electeur': "Carte d'électeur",
// //           'rccm': 'RCCM',
// //           'id_nat': 'ID NAT',
// //           'attestation_fiscale': 'Attestation fiscale',
// //           'attestation_cnss': 'Attestation CNSS'
// //         }
        
// //         // 1. Vérifier que tous les documents obligatoires sont téléchargés
// //         const allDocsPresent = docsRequis.every(key => documents[key])
// //         if (!allDocsPresent) {
// //           const docsManquants = docsRequis.filter(key => !documents[key])
// //           newErrors.documents = `Documents obligatoires manquants : ${docsManquants.map(k => docNames[k] || k).join(', ')}`
// //           break
// //         }
        
// //         // 2. Vérifier que tous les documents ont été vérifiés par l'IA
// //         const docsNonVerifies = docsRequis.filter(key => {
// //           return documents[key] && !verificationResultats[key]
// //         })
        
// //         if (docsNonVerifies.length > 0) {
// //           newErrors.documents = `Les documents suivants n'ont pas été vérifiés par l'IA : ${docsNonVerifies.map(k => docNames[k] || k).join(', ')}. Cliquez sur l'icône ✨ pour chaque document.`
// //           break
// //         }
        
// //         // 3. Vérifier que tous les documents ont un score suffisant
// //         const docsFaibleScore = docsRequis.filter(key => {
// //           const result = verificationResultats[key]
// //           return result && result.score < 50
// //         })
        
// //         if (docsFaibleScore.length > 0) {
// //           newErrors.documents = `Les documents suivants ont un score de vérification trop faible : ${docsFaibleScore.map(k => docNames[k] || k).join(', ')}. Veuillez vérifier la qualité des documents.`
// //           break
// //         }
        
// //         // 4. Vérifier les croisements entre documents
// //         if (!croisementsValides) {
// //           newErrors.documents = 'Les croisements de documents ne sont pas tous valides. Veuillez corriger les incohérences détectées.'
          
// //           // Ajouter les détails des problèmes de croisement
// //           const problemes = detailsCroisements.filter(d => d.startsWith('❌'))
// //           if (problemes.length > 0) {
// //             newErrors.detailsCroisements = problemes
// //               .map(d => d.replace('❌ ', ''))
// //               .join('\n')
// //           }
// //           break
// //         }
        
// //         // 5. Vérifier qu'aucun champ critique n'est manquant
// //         const docsChampsManquants = docsRequis.filter(key => {
// //           const result = verificationResultats[key]
// //           return result && result.champsManquants && result.champsManquants.length > 0
// //         })
        
// //         if (docsChampsManquants.length > 0) {
// //           const details = docsChampsManquants.map(key => {
// //             const result = verificationResultats[key]
// //             return `${docNames[key] || key} : ${result!.champsManquants.join(', ')}`
// //           }).join(' | ')
// //           newErrors.documents = `Champs non extraits dans certains documents : ${details}`
// //           break
// //         }
// //         break
// //     }

// //     setErrors(newErrors)
// //     return Object.keys(newErrors).length === 0
// //   }

// //   const handleNext = async () => {
// //     if (validateStep(currentStep)) {
// //       if (currentStep === 4) {
// //         // Vérification supplémentaire avant d'aller au paiement
// //         const docsRequis = ['carte_electeur', 'rccm', 'id_nat', 'attestation_fiscale', 'attestation_cnss'] as const
        
// //         // Vérifier que tous les documents ont été vérifiés
// //         const tousVerifies = docsRequis.every(key => {
// //           return !documents[key] || verificationResultats[key] !== null
// //         })
        
// //         if (!tousVerifies) {
// //           setError('❌ Tous les documents doivent être vérifiés par l\'IA avant de continuer. Utilisez le bouton "Vérifier tous les documents" ou l\'icône ✨ sur chaque document.')
// //           return
// //         }
        
// //         // Vérifier les croisements
// //         if (!croisementsValides) {
// //           const problemes = detailsCroisements
// //             .filter(d => d.startsWith('❌'))
// //             .map(d => d.replace('❌ ', ''))
          
// //           if (problemes.length > 0) {
// //             setError(`❌ Problèmes de cohérence détectés :\n${problemes.join('\n')}\n\nVeuillez vérifier et corriger les documents concernés.`)
// //           } else {
// //             setError('❌ La vérification des croisements n\'est pas complète. Veuillez vérifier tous les documents.')
// //           }
// //           return
// //         }
        
// //         // Vérifier que tous les champs critiques sont extraits
// //         const champsManquants = docsRequis.filter(key => {
// //           const result = verificationResultats[key]
// //           return result && result.champsManquants && result.champsManquants.length > 0
// //         })
        
// //         if (champsManquants.length > 0) {
// //           const docNames: Record<string, string> = {
// //             'carte_electeur': "Carte d'électeur",
// //             'rccm': 'RCCM',
// //             'id_nat': 'ID NAT',
// //             'attestation_fiscale': 'Attestation fiscale',
// //             'attestation_cnss': 'Attestation CNSS'
// //           }
// //           const details = champsManquants.map(key => {
// //             const result = verificationResultats[key]
// //             return `${docNames[key] || key} : ${result!.champsManquants!.join(', ')}`
// //           }).join(' ; ')
// //           setError(`❌ Certains champs obligatoires n'ont pas pu être extraits : ${details}`)
// //           return
// //         }
        
// //         setCurrentStep(5)
// //         window.scrollTo({ top: 0, behavior: 'smooth' })
// //       } else if (currentStep < 5) {
// //         setCurrentStep(currentStep + 1)
// //         window.scrollTo({ top: 0, behavior: 'smooth' })
// //       }
// //     }
// //   }

// //   const handlePrevious = () => {
// //     if (currentStep > 1) {
// //       setCurrentStep(currentStep - 1)
// //       window.scrollTo({ top: 0, behavior: 'smooth' })
// //     }
// //   }

// //   const handleClose = () => {
// //     const hasData = 
// //       promoteur.nom_complet.trim() !== '' ||
// //       promoteur.numero_telephone.trim() !== '' ||
// //       promoteur.adresse_email.trim() !== '' ||
// //       projet.nom_projet.trim() !== '' ||
// //       projet.description_projet.trim() !== '' ||
// //       finance.apport_personnel > 0 ||
// //       Object.keys(documents).length > 0

// //     if (hasData) {
// //       setShowCloseConfirm(true)
// //     } else {
// //       onClose()
// //     }
// //   }

// //   const confirmClose = () => {
// //     setShowCloseConfirm(false)
// //     onClose()
// //   }

// //   const sauvegarderProjet = async (): Promise<number> => {
// //     if (!user) throw new Error('Utilisateur non connecté')

// //     const { data: projetData, error: projetError } = await supabase
// //       .from('projets_fpi')
// //       .insert({
// //         promoteur_id: user.id,
// //         // Étape 1: Informations promoteur
// //         promoteur_nom_complet: promoteur.nom_complet,
// //         promoteur_sexe: promoteur.sexe,
// //         promoteur_telephone: promoteur.numero_telephone,
// //         promoteur_email: promoteur.adresse_email,
// //         promoteur_adresse: promoteur.adresse_physique,
// //         promoteur_province: promoteur.province,
// //         promoteur_ville: promoteur.ville,
// //         promoteur_profession: promoteur.profession,
// //         // Étape 2: Informations projet
// //         nom_projet: projet.nom_projet,
// //         secteur_activite: projet.secteur_activite,
// //         description_projet: projet.description_projet,
// //         localisation_projet: projet.localisation_projet,
// //         cout_total: projet.cout_total,
// //         montant_sollicite: projet.montant_sollicite,
// //         nombre_emplois: projet.nombre_emplois,
// //         duree_realisation: projet.duree_realisation,
// //         objectifs_projet: projet.objectifs_projet,
// //         // Étape 3: Informations financières
// //         apport_personnel: finance.apport_personnel,
// //         source_financement: finance.source_financement,
// //         chiffre_affaires_previsionnel: finance.chiffre_affaires_previsionnel,
// //         benefice_previsionnel: finance.benefice_previsionnel,
// //         duree_remboursement: finance.duree_remboursement,
// //         garanties_proposees: finance.garanties_proposees,
// //         banque_partenaire: finance.banque_partenaire,
// //         numero_compte_bancaire: finance.numero_compte_bancaire,
// //         // Statut
// //         statut: 'brouillon',
// //         etape: 'creation',
// //         verification_documents: verificationResultats
// //       })
// //       .select()
// //       .single()

// //     if (projetError) throw projetError
// //     const projetId = projetData.id

// //     // Sauvegarder les documents
// //     const docsKeys = Object.keys(documents) as (keyof DocumentsFPI)[]
// //     for (const key of docsKeys) {
// //       const file = documents[key]
// //       if (file) {
// //         const fileExt = file.name.split('.').pop()
// //         const fileName = `${projetId}/${key}_${Date.now()}.${fileExt}`

// //         const { error: uploadError } = await supabase.storage
// //           .from('documents_fpi')
// //           .upload(fileName, file)

// //         if (uploadError) {
// //           console.error(`Erreur upload ${key}:`, uploadError)
// //           continue
// //         }

// //         const { data: { publicUrl } } = supabase.storage
// //           .from('documents_fpi')
// //           .getPublicUrl(fileName)

// //         await supabase.from('documents_fpi').insert({
// //           projet_id: projetId,
// //           type_document: key,
// //           chemin_fichier: publicUrl,
// //           nom_fichier: file.name
// //         })
// //       }
// //     }

// //     // Créer l'entrée des frais de dossier
// //     await supabase.from('frais_dossier_fpi').insert({
// //       projet_id: projetId,
// //       montant: FRAIS_DOSSIER,
// //       est_paye: false
// //     })

// //     return projetId
// //   }

// //   const handlePaiementComplete = async (paiementData: PaiementData) => {
// //     setSubmitting(true)
// //     setError('')
// //     setSuccess('')

// //     try {
// //       const id = await sauvegarderProjet()
// //       setProjetId(id)

// //       await supabase
// //         .from('frais_dossier_fpi')
// //         .update({
// //           est_paye: true,
// //           reference_paiement: paiementData.reference,
// //           date_paiement: paiementData.date_paiement,
// //           methode_paiement: paiementData.methode,
// //           operateur: paiementData.operateur || null,
// //           numero: paiementData.numero || null
// //         })
// //         .eq('projet_id', id)

// //       await supabase
// //         .from('projets_fpi')
// //         .update({ 
// //           frais_paye: true,
// //           statut: 'soumis',
// //           etape: 'soumission'
// //         })
// //         .eq('id', id)

// //       await envoyerNotificationServiceTechnique(id, projet.nom_projet)

// //       await envoyerNotificationPush(
// //         '✅ Demande FPI soumise avec succès',
// //         `Votre demande "${projet.nom_projet}" a été soumise. Référence: ${paiementData.reference}`,
// //         'paiement',
// //         id
// //       )

// //       setSuccess('✅ Votre demande a été soumise avec succès !')
      
// //       setTimeout(() => {
// //         onSuccess()
// //       }, 3000)

// //     } catch (error: any) {
// //       console.error('Erreur finalisation:', error)
// //       setError(error.message || 'Erreur lors de la finalisation')
// //       setSubmitting(false)
// //     }
// //   }

// //   const renderStep = () => {
// //     switch (currentStep) {
// //       case 1:
// //         return (
// //           <Step1Promoteur
// //             data={promoteur}
// //             onChange={setPromoteur}
// //             errors={errors}
// //           />
// //         )
// //       case 2:
// //         return (
// //           <Step2Projet
// //             data={projet}
// //             onChange={setProjet}
// //             errors={errors}
// //           />
// //         )
// //       case 3:
// //         return (
// //           <Step3Finance
// //             data={finance}
// //             onChange={setFinance}
// //             errors={errors}
// //             montantSollicite={projet.montant_sollicite}
// //           />
// //         )
// //       case 4:
// //         return (
// //           <Step4Documents
// //             documents={documents}
// //             onChange={setDocuments}
// //             onVerificationChange={setVerificationResultats}
// //             onCroisementValidityChange={(isValid, details) => {
// //               setCroisementsValides(isValid)
// //               setDetailsCroisements(details)
// //             }}
// //           />
// //         )
// //       case 5:
// //         return (
// //           <Step5Paiement
// //             montant={FRAIS_DOSSIER}
// //             reference={referencePaiement}
// //             onRetour={() => setCurrentStep(4)}
// //             onPaiementComplete={handlePaiementComplete}
// //             submitting={submitting}
// //           />
// //         )
// //       default:
// //         return null
// //     }
// //   }

// //   // Déterminer si le bouton "Suivant" doit être désactivé
// //   const isNextDisabled = () => {
// //     if (verificationEnCours) return true
// //     if (submitting) return true
// //     return false
// //   }

// //   // Obtenir le texte du bouton "Suivant"
// //   const getNextButtonText = () => {
// //     if (verificationEnCours) {
// //       return (
// //         <>
// //           <Loader2 className="h-4 w-4 animate-spin" />
// //           Vérification en cours...
// //         </>
// //       )
// //     }
// //     if (currentStep === 4) {
// //       return (
// //         <>
// //           Aller au paiement
// //           <ArrowRight className="h-4 w-4" />
// //         </>
// //       )
// //     }
// //     return (
// //       <>
// //         Suivant
// //         <ArrowRight className="h-4 w-4" />
// //       </>
// //     )
// //   }

// //   return (
// //     <div className="flex flex-col h-full overflow-auto">
// //       {/* Header avec progression et bouton fermer */}
// //       <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 relative">
// //         <button
// //           type="button"
// //           onClick={handleClose}
// //           className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 z-10"
// //           title="Fermer le formulaire"
// //         >
// //           <X className="h-5 w-5" />
// //         </button>

// //         <h2 className="text-lg font-bold text-gray-900 mb-4 pr-8">
// //           Nouvelle demande de financement FPI
// //         </h2>
        
// //         {/* Indicateur d'étapes */}
// //         <div className="flex items-center gap-1 overflow-x-auto">
// //           {STEPS.map((step, index) => (
// //             <div key={step.id} className="flex items-center flex-1 min-w-fit">
// //               <button
// //                 type="button"
// //                 onClick={() => {
// //                   if (step.id < currentStep) {
// //                     setCurrentStep(step.id)
// //                   }
// //                 }}
// //                 disabled={step.id > currentStep}
// //                 className={`flex flex-col items-center flex-1 ${
// //                   step.id < currentStep ? 'cursor-pointer' : 'cursor-default'
// //                 }`}
// //               >
// //                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
// //                   step.id < currentStep
// //                     ? 'bg-green-500 text-white'
// //                     : step.id === currentStep
// //                     ? 'bg-primary text-white ring-4 ring-primary/20'
// //                     : 'bg-gray-100 text-gray-400'
// //                 }`}>
// //                   {step.id < currentStep ? (
// //                     <CheckCircle className="h-4 w-4" />
// //                   ) : (
// //                     index + 1
// //                   )}
// //                 </div>
// //                 <span className={`text-[10px] mt-1 font-medium hidden sm:block whitespace-nowrap ${
// //                   step.id <= currentStep ? 'text-gray-700' : 'text-gray-400'
// //                 }`}>
// //                   {step.title}
// //                 </span>
// //               </button>
// //               {index < STEPS.length - 1 && (
// //                 <div className={`h-0.5 flex-1 -mt-4 ${
// //                   step.id < currentStep ? 'bg-green-400' : 'bg-gray-200'
// //                 }`} />
// //               )}
// //             </div>
// //           ))}
// //         </div>
// //       </div>

// //       {/* Messages d'erreur et de succès */}
// //       {(error || success) && (
// //         <div className={`mx-6 mt-4 p-3 rounded-xl text-sm ${
// //           success ? 'bg-green-50 border border-green-200 text-green-700' :
// //           'bg-red-50 border border-red-200 text-red-700'
// //         }`}>
// //           <p className="font-medium whitespace-pre-wrap">{success || error}</p>
          
// //           {/* Afficher les détails des croisements si disponible */}
// //           {currentStep === 4 && errors.detailsCroisements && (
// //             <div className="mt-2 pt-2 border-t border-red-200">
// //               <p className="text-xs font-medium mb-1">Détails des incohérences :</p>
// //               <pre className="text-xs whitespace-pre-wrap font-mono">
// //                 {errors.detailsCroisements}
// //               </pre>
// //             </div>
// //           )}
// //         </div>
// //       )}

// //       {/* Overlay de vérification */}
// //       {verificationEnCours && (
// //         <div className="mx-6 mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-200">
// //           <div className="flex items-center gap-3">
// //             <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
// //             <div>
// //               <p className="text-sm font-semibold text-indigo-900">
// //                 Vérification automatique des documents en cours...
// //               </p>
// //               <p className="text-xs text-indigo-700 mt-1">
// //                 Notre IA analyse vos documents pour vérifier leur validité et leur cohérence.
// //                 Veuillez patienter quelques instants...
// //               </p>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Contenu du formulaire */}
// //       <div className="flex-1 overflow-y-auto p-6">
// //         {renderStep()}
// //       </div>

// //       {/* Footer avec boutons */}
// //       {currentStep < 5 && (
// //         <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
// //           <div className="flex gap-3">
// //             {currentStep > 1 && (
// //               <button
// //                 type="button"
// //                 onClick={handlePrevious}
// //                 disabled={isNextDisabled()}
// //                 className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-white transition-colors disabled:opacity-50"
// //               >
// //                 <ArrowLeft className="h-4 w-4" />
// //                 Précédent
// //               </button>
// //             )}

// //             <button
// //               type="button"
// //               onClick={handleNext}
// //               disabled={isNextDisabled()}
// //               className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 ml-auto transition-colors disabled:opacity-50"
// //             >
// //               {getNextButtonText()}
// //             </button>
// //           </div>
          
// //           {/* Message d'avertissement pour l'étape 4 */}
// //           {currentStep === 4 && !croisementsValides && Object.keys(verificationResultats).length > 0 && (
// //             <p className="text-xs text-amber-600 mt-2 text-center">
// //               ⚠️ Les croisements de documents doivent être tous valides avant de pouvoir continuer.
// //             </p>
// //           )}
// //         </div>
// //       )}

// //       {/* Modal de confirmation de fermeture */}
// //       {showCloseConfirm && (
// //         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
// //           <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
// //             <div className="text-center">
// //               <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
// //                 <FileText className="h-6 w-6 text-yellow-600" />
// //               </div>
// //               <h3 className="text-lg font-semibold text-gray-900 mb-2">
// //                 Fermer le formulaire ?
// //               </h3>
// //               <p className="text-sm text-gray-600 mb-6">
// //                 Vous avez déjà saisi des informations. Si vous fermez maintenant, 
// //                 toutes les données seront perdues.
// //               </p>
// //               <div className="flex gap-3">
// //                 <button
// //                   type="button"
// //                   onClick={() => setShowCloseConfirm(false)}
// //                   className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
// //                 >
// //                   Continuer
// //                 </button>
// //                 <button
// //                   type="button"
// //                   onClick={confirmClose}
// //                   className="flex-1 py-2.5 px-4 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors"
// //                 >
// //                   Fermer
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   )
// // }

// // FormulaireFPI.tsx - VERSION CORRIGÉE
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
// import { type VerificationResult } from '@/lib/documentVerification'

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

//   const referencePaiement = `FPI-${Date.now().toString(36).toUpperCase()}`
//   const [errors, setErrors] = useState<Record<string, string>>({})

//   // CORRECTION : Stabiliser le callback avec useCallback
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
//         console.error('❌ Erreur détaillée:', {
//           message: techError.message,
//           code: techError.code,
//           details: techError.details
//         });
//         return false;
//       }

//       if (!techniciens || techniciens.length === 0) {
//         console.warn('⚠️ Aucun technicien trouvé dans la table users avec le rôle "technique"');
        
//         const { data: allRoles } = await supabase
//           .from('users')
//           .select('role')
//           .limit(5);
        
//         console.log('📊 Rôles existants:', allRoles);
//         return false;
//       }

//       console.log(`✅ ${techniciens.length} technicien(s) trouvé(s):`, techniciens.map(t => ({ id: t.id, role: t.role })));

//       for (const technicien of techniciens) {
//         const { error: dbError } = await supabase
//           .from('notifications')
//           .insert({
//             user_id: technicien.id,
//             type: 'info',
//             titre: '🆕 NOUVEAU PROJET FPI À ANALYSER',
//             message: `Le projet "${nomProjet}" vient d'être soumis et nécessite votre analyse technique.`,
//             lien: '/dashboard',
//             projet_id: projetId,
//             icone: 'FileText',
//             est_lue: false
//           });

//         if (dbError) {
//           console.error(`Erreur insertion notification pour technicien ${technicien.id}:`, dbError);
//         } else {
//           console.log(`✅ Notification DB envoyée au technicien ${technicien.id}`);
//         }

//         try {
//           const response = await fetch('/api/push/send', {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-user-id': technicien.id.toString()
//             },
//             body: JSON.stringify({
//               userId: technicien.id.toString(),
//               notification: {
//                 title: '🆕 NOUVEAU PROJET FPI',
//                 body: `"${nomProjet}" - Projet soumis, analyse technique requise`,
//                 url: '/dashboard',
//                 type: 'info',
//                 projetId: projetId,
//                 requireInteraction: true,
//                 vibrate: [200, 100, 200]
//               }
//             })
//           });

//           if (response.ok) {
//             console.log(`✅ Notification push envoyée au technicien ${technicien.id}`);
//           }
//         } catch (pushError) {
//           console.error(`Erreur push pour technicien ${technicien.id}:`, pushError);
//         }
//       }

//       return true;

//     } catch (error) {
//       console.error('❌ Erreur générale:', error);
//       return false;
//     }
//   };

//   const validateStep = (step: number): boolean => {
//     const newErrors: Record<string, string> = {}

//     switch (step) {
//       case 1: // Étape Promoteur
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

//       case 2: // Étape Projet
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

//       case 3: // Étape Finance
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

//       case 4: // Étape Documents - VALIDATION SIMPLIFIÉE
//         const docsRequis = ['carte_electeur', 'rccm', 'id_nat', 'attestation_fiscale', 'attestation_cnss'] as const
//         const docNames: Record<string, string> = {
//           'carte_electeur': "Carte d'électeur",
//           'rccm': 'RCCM',
//           'id_nat': 'ID NAT',
//           'attestation_fiscale': 'Attestation fiscale',
//           'attestation_cnss': 'Attestation CNSS'
//         }
        
//         // 1. Vérifier que tous les documents obligatoires sont téléchargés
//         const allDocsPresent = docsRequis.every(key => documents[key])
//         if (!allDocsPresent) {
//           const docsManquants = docsRequis.filter(key => !documents[key])
//           newErrors.documents = `Documents obligatoires manquants : ${docsManquants.map(k => docNames[k] || k).join(', ')}`
//           break
//         }
        
//         // 2. Vérifier que tous les documents ont été vérifiés par l'IA
//         const docsNonVerifies = docsRequis.filter(key => {
//           return documents[key] && !verificationResultats[key]
//         })
        
//         if (docsNonVerifies.length > 0) {
//           newErrors.documents = `Les documents suivants n'ont pas été vérifiés : ${docsNonVerifies.map(k => docNames[k] || k).join(', ')}. Utilisez l'icône ✨ sur chaque document.`
//           break
//         }
        
//         // 3. Vérifier les croisements entre documents
//         if (!croisementsValides) {
//           const problemes = detailsCroisements.filter(d => d.startsWith('❌'))
//           if (problemes.length > 0) {
//             newErrors.documents = 'Les croisements de documents ne sont pas tous valides.'
//             newErrors.detailsCroisements = problemes
//               .map(d => d.replace('❌ ', ''))
//               .join('\n')
//           } else {
//             newErrors.documents = 'Veuillez vérifier tous les documents avant de continuer.'
//           }
//           break
//         }
//         break
//     }

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   // CORRECTION : handleNext simplifié - PAS de vérification automatique
//   const handleNext = () => {
//     if (validateStep(currentStep)) {
//       if (currentStep < 5) {
//         setCurrentStep(currentStep + 1)
//         setError('') // Effacer les erreurs précédentes
//         window.scrollTo({ top: 0, behavior: 'smooth' })
//       }
//     } else {
//       // Afficher les erreurs de validation dans le message d'erreur principal
//       if (currentStep === 4) {
//         const errorMessages = Object.entries(errors)
//           .filter(([key]) => key !== 'detailsCroisements')
//           .map(([_, value]) => value)
        
//         if (errorMessages.length > 0) {
//           setError(`❌ ${errorMessages.join(' ')}`)
//         }
//       }
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

//     // Sauvegarder les documents
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

//     // Créer l'entrée des frais de dossier
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
//           Aller au paiement
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

//       {/* Overlay de vérification */}
//       {verificationEnCours && (
//         <div className="mx-6 mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-200">
//           <div className="flex items-center gap-3">
//             <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
//             <div>
//               <p className="text-sm font-semibold text-indigo-900">
//                 Vérification automatique des documents en cours...
//               </p>
//               <p className="text-xs text-indigo-700 mt-1">
//                 Notre IA analyse vos documents pour vérifier leur validité et leur cohérence.
//                 Veuillez patienter quelques instants...
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

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
          
//           {/* Message d'avertissement pour l'étape 4 */}
//           {currentStep === 4 && !croisementsValides && Object.keys(verificationResultats).length > 0 && (
//             <p className="text-xs text-amber-600 mt-2 text-center">
//               ⚠️ Les croisements de documents doivent être tous valides avant de pouvoir continuer.
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

// FormulaireFPI.tsx - VERSION FINALE AVEC VÉRIFICATION AUTO
'use client'

import { useState, useCallback } from 'react'
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

  const referencePaiement = `FPI-${Date.now().toString(36).toUpperCase()}`
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Stabiliser le callback avec useCallback
  const handleCroisementValidityChange = useCallback((isValid: boolean, details: string[]) => {
    setCroisementsValides(isValid)
    setDetailsCroisements(details)
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
        
        // Vérifier que tous les documents sont téléchargés
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

  // NOUVEAU : Fonction de vérification automatique
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

    try {
      // Lancer la vérification de tous les documents
      const resultats = await verifierTousLesDocuments(documents)
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

      // Attendre que les croisements se mettent à jour dans le state
      await new Promise(resolve => setTimeout(resolve, 800))

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
    // Pour les étapes 1-3 : validation simple
    if (currentStep < 4) {
      if (validateStep(currentStep)) {
        setCurrentStep(currentStep + 1)
        setError('')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }

    // Pour l'étape 4 : vérification automatique
    if (currentStep === 4) {
      // 1. Valider que tous les documents sont présents
      if (!validateStep(currentStep)) {
        const errorMessages = Object.values(errors)
        if (errorMessages.length > 0) {
          setError(`❌ ${errorMessages.join(' ')}`)
        }
        return
      }

      // 2. Lancer la vérification automatique
      const verificationOk = await lancerVerificationAutomatique()
      
      if (!verificationOk) {
        // L'erreur est déjà définie dans lancerVerificationAutomatique
        return
      }

      // 3. Vérifier les croisements après la mise à jour du state
      // Attendre un peu que le callback onCroisementValidityChange ait mis à jour le state
      await new Promise(resolve => setTimeout(resolve, 500))

      // 4. Vérifier que les croisements sont valides
      // (sera vérifié via croisementsValides mis à jour par le callback)
      if (!croisementsValides) {
        const problemes = detailsCroisements.filter(d => d.startsWith('❌'))
        if (problemes.length > 0) {
          setError(`❌ Problèmes de cohérence détectés :\n${problemes.map(d => d.replace('❌ ', '')).join('\n')}`)
        } else {
          setError('❌ La vérification des croisements de documents a échoué. Veuillez vérifier vos documents.')
        }
        return
      }

      // 5. Tout est OK, passer au paiement
      setCurrentStep(5)
      setError('')
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
      {/* Header avec progression et bouton fermer */}
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
        
        {/* Indicateur d'étapes */}
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

      {/* Messages d'erreur et de succès */}
      {(error || success) && (
        <div className={`mx-6 mt-4 p-3 rounded-xl text-sm ${
          success ? 'bg-green-50 border border-green-200 text-green-700' :
          'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <p className="font-medium whitespace-pre-wrap">{success || error}</p>
          
          {/* Afficher les détails des croisements si disponible */}
          {currentStep === 4 && errors.detailsCroisements && (
            <div className="mt-2 pt-2 border-t border-red-200">
              <p className="text-xs font-medium mb-1">Détails des incohérences :</p>
              <pre className="text-xs whitespace-pre-wrap font-mono">
                {errors.detailsCroisements}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Overlay de vérification - LOADING STATE VISIBLE */}
     

      {/* Contenu du formulaire */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderStep()}
      </div>

      {/* Footer avec boutons */}
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
          
          {/* Message d'avertissement pour l'étape 4 après vérification */}
          {currentStep === 4 && verificationEffectuee && !croisementsValides && (
            <p className="text-xs text-amber-600 mt-2 text-center">
              ⚠️ Les croisements de documents ne sont pas tous valides. Veuillez vérifier les documents et réessayer.
            </p>
          )}
        </div>
      )}

      {/* Modal de confirmation de fermeture */}
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