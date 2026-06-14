// 'use client'

// import { useState, useEffect } from 'react'
// import { supabase } from '@/lib/supabase'
// import {
//   Loader2, CheckCircle, AlertCircle, X, Save, 
//   Building2, User, FileText, CreditCard, Upload,
//   Eye, Trash2, Edit3, ArrowLeft, ArrowRight
// } from 'lucide-react'

// type Props = {
//   projetId: number
//   onClose: () => void
//   onSuccess: () => void
// }

// type ProjetFPI = {
//   id: number
//   nom_entite: string
//   num_national: string
//   numero_rccm: string
//   siege_social: string
//   promoteur_nom_complet: string
//   promoteur_sexe: string
//   promoteur_telephone: string
//   promoteur_email: string
//   promoteur_adresse: string
//   promoteur_province: string
//   promoteur_ville: string
//   promoteur_profession: string
//   nom_projet: string
//   secteur_activite: string
//   description_projet: string
//   localisation_projet: string
//   cout_total: number
//   montant_sollicite: number
//   nombre_emplois: number
//   duree_realisation: string
//   objectifs_projet: string
//   apport_personnel: number
//   source_financement: string
//   chiffre_affaires_previsionnel: number
//   benefice_previsionnel: number
//   duree_remboursement: string
//   garanties_proposees: string
//   banque_partenaire: string
//   numero_compte_bancaire: string
//   frais_paye: boolean
//   statut: string
//   etape: string
// }

// type DocumentExistant = {
//   id: number
//   type_document: string
//   chemin_fichier: string
//   nom_fichier: string
// }

// const PROVINCES = [
//   'Kinshasa', 'Kongo Central', 'Kwango', 'Kwilu', 'Mai-Ndombe',
//   'Kasaï', 'Kasaï Central', 'Kasaï Oriental', 'Lomami', 'Sankuru',
//   'Maniema', 'Sud-Kivu', 'Nord-Kivu', 'Ituri', 'Haut-Uele',
//   'Tshopo', 'Bas-Uele', 'Mongala', 'Nord-Ubangi', 'Sud-Ubangi',
//   'Équateur', 'Tshuapa', 'Tanganyika', 'Haut-Lomami', 'Lualaba', 'Haut-Katanga'
// ]

// const SECTEURS = [
//   'Agriculture', 'Élevage', 'Pêche', 'Mines', 'Énergie',
//   'Construction', 'Transport', 'Télécommunications', 'Commerce',
//   'Santé', 'Éducation', 'Tourisme', 'Industrie', 'Artisanat', 'Autre'
// ]

// const BANQUES = [
//   'Rawbank', 'BCDC', 'TMB', 'Equity BCDC', 'Afriland',
//   'Sofibanque', 'FBN Bank', 'Access Bank', 'UBA', 'Standard Bank'
// ]

// const STEPS = [
//   { id: 0, title: 'Entité', icon: Building2 },
//   { id: 1, title: 'Promoteur', icon: User },
//   { id: 2, title: 'Projet', icon: FileText },
//   { id: 3, title: 'Finance', icon: CreditCard },
//   { id: 4, title: 'Documents', icon: Upload }
// ]

// export default function FormulaireFPIModification({ projetId, onClose, onSuccess }: Props) {
//   const [loading, setLoading] = useState(true)
//   const [saving, setSaving] = useState(false)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const [currentStep, setCurrentStep] = useState(0)
//   const [hasChanges, setHasChanges] = useState(false)

//   // Données du projet
//   const [formData, setFormData] = useState<ProjetFPI>({
//     id: 0,
//     nom_entite: '',
//     num_national: '',
//     numero_rccm: '',
//     siege_social: '',
//     promoteur_nom_complet: '',
//     promoteur_sexe: 'M',
//     promoteur_telephone: '',
//     promoteur_email: '',
//     promoteur_adresse: '',
//     promoteur_province: '',
//     promoteur_ville: '',
//     promoteur_profession: '',
//     nom_projet: '',
//     secteur_activite: '',
//     description_projet: '',
//     localisation_projet: '',
//     cout_total: 0,
//     montant_sollicite: 0,
//     nombre_emplois: 0,
//     duree_realisation: '',
//     objectifs_projet: '',
//     apport_personnel: 0,
//     source_financement: '',
//     chiffre_affaires_previsionnel: 0,
//     benefice_previsionnel: 0,
//     duree_remboursement: '',
//     garanties_proposees: '',
//     banque_partenaire: '',
//     numero_compte_bancaire: '',
//     frais_paye: false,
//     statut: '',
//     etape: ''
//   })

//   const [documentsExistants, setDocumentsExistants] = useState<DocumentExistant[]>([])
//   const [nouveauxDocuments, setNouveauxDocuments] = useState<Record<string, File>>({})
//   const [suppressionDocs, setSuppressionDocs] = useState<number[]>([])
//   const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)
//   const [deletingDocId, setDeletingDocId] = useState<number | null>(null)

//   const [errors, setErrors] = useState<Record<string, string>>({})

//   useEffect(() => {
//     chargerProjet()
//   }, [projetId])

//   const chargerProjet = async () => {
//     try {
//       setLoading(true)
      
//       const { data: projet, error: projetError } = await supabase
//         .from('projets_fpi')
//         .select('*')
//         .eq('id', projetId) 
//         .single()

//       if (projetError) throw projetError
//       if (!projet) throw new Error('Projet non trouvé')

//       // Vérifier que le projet est bien au statut "reçu"
//       if (projet.etape !== 'soumission') {
//         throw new Error('Ce projet ne peut plus être modifié car il est en cours de traitement')
//       }

//       setFormData(projet)

//       // Charger les documents existants
//       const { data: docs } = await supabase
//         .from('documents_fpi')
//         .select('*')
//         .eq('projet_id', projetId)

//       if (docs) {
//         setDocumentsExistants(docs)
//       }

//     } catch (error: any) {
//       console.error('Erreur chargement:', error)
//       setError(error.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleChange = (field: string, value: any) => {
//     setFormData(prev => ({ ...prev, [field]: value }))
//     setHasChanges(true)
//     // Effacer l'erreur du champ modifié
//     if (errors[field]) {
//       setErrors(prev => {
//         const newErrors = { ...prev }
//         delete newErrors[field]
//         return newErrors
//       })
//     }
//   }

//   const validateStep = (step: number): boolean => {
//     const newErrors: Record<string, string> = {}

//     switch (step) {
//       case 0:
//         if (!formData.nom_entite.trim()) newErrors.nom_entite = 'Obligatoire'
//         if (!formData.num_national.trim()) newErrors.num_national = 'Obligatoire'
//         if (!formData.numero_rccm.trim()) newErrors.numero_rccm = 'Obligatoire'
//         if (!formData.siege_social.trim()) newErrors.siege_social = 'Obligatoire'
//         break

//       case 1:
//         if (!formData.promoteur_nom_complet.trim()) newErrors.promoteur_nom_complet = 'Obligatoire'
//         if (!formData.promoteur_sexe) newErrors.promoteur_sexe = 'Obligatoire'
//         if (!formData.promoteur_telephone.trim()) newErrors.promoteur_telephone = 'Obligatoire'
//         if (!formData.promoteur_email.trim()) newErrors.promoteur_email = 'Obligatoire'
//         else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.promoteur_email))
//           newErrors.promoteur_email = 'Email invalide'
//         if (!formData.promoteur_adresse.trim()) newErrors.promoteur_adresse = 'Obligatoire'
//         if (!formData.promoteur_province) newErrors.promoteur_province = 'Obligatoire'
//         if (!formData.promoteur_ville.trim()) newErrors.promoteur_ville = 'Obligatoire'
//         if (!formData.promoteur_profession.trim()) newErrors.promoteur_profession = 'Obligatoire'
//         break

//       case 2:
//         if (!formData.nom_projet.trim()) newErrors.nom_projet = 'Obligatoire'
//         if (!formData.secteur_activite) newErrors.secteur_activite = 'Obligatoire'
//         if (!formData.description_projet.trim()) newErrors.description_projet = 'Obligatoire'
//         if (!formData.localisation_projet.trim()) newErrors.localisation_projet = 'Obligatoire'
//         if (!formData.cout_total || formData.cout_total <= 0) newErrors.cout_total = 'Doit être > 0'
//         if (!formData.montant_sollicite || formData.montant_sollicite <= 0)
//           newErrors.montant_sollicite = 'Doit être > 0'
//         if (formData.montant_sollicite > formData.cout_total)
//           newErrors.montant_sollicite = 'Ne peut pas dépasser le coût total'
//         if (!formData.nombre_emplois || formData.nombre_emplois <= 0)
//           newErrors.nombre_emplois = 'Doit être > 0'
//         if (!formData.duree_realisation.trim()) newErrors.duree_realisation = 'Obligatoire'
//         if (!formData.objectifs_projet.trim()) newErrors.objectifs_projet = 'Obligatoire'
//         break

//       case 3:
//         if (formData.apport_personnel < 0) newErrors.apport_personnel = 'Ne peut pas être négatif'
//         if (!formData.chiffre_affaires_previsionnel || formData.chiffre_affaires_previsionnel <= 0)
//           newErrors.chiffre_affaires_previsionnel = 'Doit être > 0'
//         if (!formData.benefice_previsionnel || formData.benefice_previsionnel <= 0)
//           newErrors.benefice_previsionnel = 'Doit être > 0'
//         if (!formData.duree_remboursement) newErrors.duree_remboursement = 'Obligatoire'
//         if (!formData.garanties_proposees.trim()) newErrors.garanties_proposees = 'Obligatoire'
//         if (!formData.banque_partenaire) newErrors.banque_partenaire = 'Obligatoire'
//         if (!formData.numero_compte_bancaire.trim()) newErrors.numero_compte_bancaire = 'Obligatoire'
//         break
//     }

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleNext = () => {
//     if (validateStep(currentStep)) {
//       setCurrentStep(prev => prev + 1)
//     }
//   }

//   const handlePrevious = () => {
//     setCurrentStep(prev => prev - 1)
//   }

//   const handleFileSelect = (type: string, file: File) => {
//     setNouveauxDocuments(prev => ({ ...prev, [type]: file }))
//     setHasChanges(true)
//   }

//   const handleDeleteDocument = async (docId: number) => {
//     if (!window.confirm('Supprimer ce document ?')) return

//     setDeletingDocId(docId)
//     try {
//       const { error } = await supabase
//         .from('documents_fpi')
//         .delete()
//         .eq('id', docId)

//       if (error) throw error

//       setDocumentsExistants(prev => prev.filter(d => d.id !== docId))
//       setHasChanges(true)
//     } catch (error: any) {
//       setError('Erreur lors de la suppression')
//     } finally {
//       setDeletingDocId(null)
//     }
//   }

//   const handleSave = async () => {
//     // Valider toutes les étapes
//     let allValid = true
//     for (let i = 0; i <= 4; i++) {
//       if (!validateStep(i)) {
//         setCurrentStep(i)
//         allValid = false
//         break
//       }
//     }

//     if (!allValid) return

//     setSaving(true)
//     setError('')
//     setSuccess('')

//     try {
//       // 1. Mettre à jour les données du projet
//       const { error: updateError } = await supabase
//         .from('projets_fpi')
//         .update({
//           nom_entite: formData.nom_entite,
//           num_national: formData.num_national,
//           numero_rccm: formData.numero_rccm,
//           siege_social: formData.siege_social,
//           promoteur_nom_complet: formData.promoteur_nom_complet,
//           promoteur_sexe: formData.promoteur_sexe,
//           promoteur_telephone: formData.promoteur_telephone,
//           promoteur_email: formData.promoteur_email,
//           promoteur_adresse: formData.promoteur_adresse,
//           promoteur_province: formData.promoteur_province,
//           promoteur_ville: formData.promoteur_ville,
//           promoteur_profession: formData.promoteur_profession,
//           nom_projet: formData.nom_projet,
//           secteur_activite: formData.secteur_activite,
//           description_projet: formData.description_projet,
//           localisation_projet: formData.localisation_projet,
//           cout_total: formData.cout_total,
//           montant_sollicite: formData.montant_sollicite,
//           nombre_emplois: formData.nombre_emplois,
//           duree_realisation: formData.duree_realisation,
//           objectifs_projet: formData.objectifs_projet,
//           apport_personnel: formData.apport_personnel,
//           source_financement: formData.source_financement,
//           chiffre_affaires_previsionnel: formData.chiffre_affaires_previsionnel,
//           benefice_previsionnel: formData.benefice_previsionnel,
//           duree_remboursement: formData.duree_remboursement,
//           garanties_proposees: formData.garanties_proposees,
//           banque_partenaire: formData.banque_partenaire,
//           numero_compte_bancaire: formData.numero_compte_bancaire,
//           updated_at: new Date().toISOString()
//         })
//         .eq('id', projetId)

//       if (updateError) throw updateError

//       // 2. Supprimer les documents marqués pour suppression
//       for (const docId of suppressionDocs) {
//         await supabase.from('documents_fpi').delete().eq('id', docId)
//       }

//       // 3. Uploader les nouveaux documents
//       const docKeys = Object.keys(nouveauxDocuments)
//       for (const key of docKeys) {
//         const file = nouveauxDocuments[key]
//         if (!file) continue

//         setUploadingDoc(key)

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

//         setUploadingDoc(null)
//       }

//       setSuccess('✅ Projet modifié avec succès !')
      
//       setTimeout(() => {
//         onSuccess()
//       }, 2000)

//     } catch (error: any) {
//       console.error('Erreur sauvegarde:', error)
//       setError(error.message || 'Erreur lors de la sauvegarde')
//     } finally {
//       setSaving(false)
//     }
//   }

//   const formatMontant = (m: number) => 
//     new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(m)

//   const getDocName = (type: string) => {
//     const names: Record<string, string> = {
//       'carte_electeur': 'Carte d\'électeur',
//       'rccm': 'RCCM',
//       'id_nat': 'ID National',
//       'attestation_fiscale': 'Attestation fiscale',
//       'attestation_cnss': 'Attestation CNSS',
//       'business_plan': 'Business Plan',
//       'autres': 'Autre document'
//     }
//     return names[type] || type
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
//           <p className="mt-3 text-sm text-gray-500">Chargement du projet...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="flex flex-col h-full overflow-auto">
//       {/* Header */}
//       <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white">
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
//               <Edit3 className="h-5 w-5 text-amber-600" />
//             </div>
//             <div>
//               <h2 className="text-lg font-bold text-gray-900">Modifier la demande</h2>
//               <p className="text-xs text-gray-500">{formData.nom_projet}</p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
//           >
//             <X className="h-5 w-5 text-gray-500" />
//           </button>
//         </div>

//         {/* Indicateur d'étapes */}
//         <div className="flex items-center gap-1">
//           {STEPS.map((step, index) => (
//             <div key={step.id} className="flex items-center flex-1">
//               <button
//                 onClick={() => {
//                   if (step.id <= currentStep && validateStep(currentStep)) {
//                     setCurrentStep(step.id)
//                   }
//                 }}
//                 className={`flex flex-col items-center flex-1 ${
//                   step.id <= currentStep ? 'cursor-pointer' : 'cursor-default'
//                 }`}
//               >
//                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
//                   step.id < currentStep
//                     ? 'bg-green-500 text-white'
//                     : step.id === currentStep
//                     ? 'bg-amber-500 text-white ring-4 ring-amber-200'
//                     : 'bg-gray-100 text-gray-400'
//                 }`}>
//                   {step.id < currentStep ? (
//                     <CheckCircle className="h-4 w-4" />
//                   ) : (
//                     step.id + 1
//                   )}
//                 </div>
//                 <span className="text-[10px] mt-1 font-medium hidden sm:block">
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

//       {/* Messages */}
//       {(error || success) && (
//         <div className={`mx-6 mt-4 p-3 rounded-xl text-sm flex items-start gap-2 ${
//           success ? 'bg-green-50 border border-green-200 text-green-700' :
//           'bg-red-50 border border-red-200 text-red-700'
//         }`}>
//           {success ? <CheckCircle className="h-4 w-4 mt-0.5" /> : <AlertCircle className="h-4 w-4 mt-0.5" />}
//           <span>{success || error}</span>
//         </div>
//       )}

//       {/* Contenu du formulaire */}
//       <div className="flex-1 overflow-y-auto p-6 space-y-4">
        
//         {/* ÉTAPE 0 : ENTITÉ */}
//         {currentStep === 0 && (
//           <div className="space-y-4">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
//                 <Building2 className="h-5 w-5 text-blue-600" />
//               </div>
//               <div>
//                 <h3 className="text-base font-semibold text-gray-900">Informations de l'entité</h3>
//                 <p className="text-xs text-gray-500">Modifiez les informations de votre entreprise</p>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Nom de l'entité <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={formData.nom_entite}
//                 onChange={(e) => handleChange('nom_entite', e.target.value)}
//                 className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                   errors.nom_entite ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                 }`}
//                 placeholder="Nom de votre entreprise"
//               />
//               {errors.nom_entite && <p className="text-xs text-red-500 mt-1">{errors.nom_entite}</p>}
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Numéro National <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.num_national}
//                   onChange={(e) => handleChange('num_national', e.target.value)}
//                   className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                     errors.num_national ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                   }`}
//                   placeholder="Ex: 01-1234567"
//                 />
//                 {errors.num_national && <p className="text-xs text-red-500 mt-1">{errors.num_national}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Numéro RCCM <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.numero_rccm}
//                   onChange={(e) => handleChange('numero_rccm', e.target.value)}
//                   className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                     errors.numero_rccm ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                   }`}
//                   placeholder="Ex: RCCM-12345"
//                 />
//                 {errors.numero_rccm && <p className="text-xs text-red-500 mt-1">{errors.numero_rccm}</p>}
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Siège Social <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={formData.siege_social}
//                 onChange={(e) => handleChange('siege_social', e.target.value)}
//                 className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                   errors.siege_social ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                 }`}
//                 placeholder="Adresse du siège social"
//               />
//               {errors.siege_social && <p className="text-xs text-red-500 mt-1">{errors.siege_social}</p>}
//             </div>
//           </div>
//         )}

//         {/* ÉTAPE 1 : PROMOTEUR */}
//         {currentStep === 1 && (
//           <div className="space-y-4">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
//                 <User className="h-5 w-5 text-purple-600" />
//               </div>
//               <div>
//                 <h3 className="text-base font-semibold text-gray-900">Informations du promoteur</h3>
//                 <p className="text-xs text-gray-500">Modifiez vos informations personnelles</p>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Nom complet <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={formData.promoteur_nom_complet}
//                 onChange={(e) => handleChange('promoteur_nom_complet', e.target.value)}
//                 className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                   errors.promoteur_nom_complet ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                 }`}
//                 placeholder="Votre nom complet"
//               />
//               {errors.promoteur_nom_complet && <p className="text-xs text-red-500 mt-1">{errors.promoteur_nom_complet}</p>}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Sexe <span className="text-red-500">*</span>
//               </label>
//               <div className="flex gap-3">
//                 <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
//                   formData.promoteur_sexe === 'M' 
//                     ? 'border-amber-500 bg-amber-50' 
//                     : 'border-gray-200 hover:border-gray-300'
//                 }`}>
//                   <input
//                     type="radio"
//                     name="sexe"
//                     value="M"
//                     checked={formData.promoteur_sexe === 'M'}
//                     onChange={(e) => handleChange('promoteur_sexe', e.target.value)}
//                     className="sr-only"
//                   />
//                   <span className="text-lg">👨</span>
//                   <span className="text-sm font-medium">Masculin</span>
//                 </label>
//                 <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
//                   formData.promoteur_sexe === 'F' 
//                     ? 'border-amber-500 bg-amber-50' 
//                     : 'border-gray-200 hover:border-gray-300'
//                 }`}>
//                   <input
//                     type="radio"
//                     name="sexe"
//                     value="F"
//                     checked={formData.promoteur_sexe === 'F'}
//                     onChange={(e) => handleChange('promoteur_sexe', e.target.value)}
//                     className="sr-only"
//                   />
//                   <span className="text-lg">👩</span>
//                   <span className="text-sm font-medium">Féminin</span>
//                 </label>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Téléphone <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="tel"
//                   value={formData.promoteur_telephone}
//                   onChange={(e) => handleChange('promoteur_telephone', e.target.value)}
//                   className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                     errors.promoteur_telephone ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                   }`}
//                   placeholder="0812345678"
//                 />
//                 {errors.promoteur_telephone && <p className="text-xs text-red-500 mt-1">{errors.promoteur_telephone}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Email <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="email"
//                   value={formData.promoteur_email}
//                   onChange={(e) => handleChange('promoteur_email', e.target.value)}
//                   className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                     errors.promoteur_email ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                   }`}
//                   placeholder="email@exemple.com"
//                 />
//                 {errors.promoteur_email && <p className="text-xs text-red-500 mt-1">{errors.promoteur_email}</p>}
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Adresse physique <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={formData.promoteur_adresse}
//                 onChange={(e) => handleChange('promoteur_adresse', e.target.value)}
//                 className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                   errors.promoteur_adresse ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                 }`}
//                 placeholder="Votre adresse"
//               />
//               {errors.promoteur_adresse && <p className="text-xs text-red-500 mt-1">{errors.promoteur_adresse}</p>}
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Province <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   value={formData.promoteur_province}
//                   onChange={(e) => handleChange('promoteur_province', e.target.value)}
//                   className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                     errors.promoteur_province ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                   }`}
//                 >
//                   <option value="">Sélectionner</option>
//                   {PROVINCES.map(p => (
//                     <option key={p} value={p}>{p}</option>
//                   ))}
//                 </select>
//                 {errors.promoteur_province && <p className="text-xs text-red-500 mt-1">{errors.promoteur_province}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Ville <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.promoteur_ville}
//                   onChange={(e) => handleChange('promoteur_ville', e.target.value)}
//                   className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                     errors.promoteur_ville ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                   }`}
//                   placeholder="Votre ville"
//                 />
//                 {errors.promoteur_ville && <p className="text-xs text-red-500 mt-1">{errors.promoteur_ville}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Profession <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.promoteur_profession}
//                   onChange={(e) => handleChange('promoteur_profession', e.target.value)}
//                   className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                     errors.promoteur_profession ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                   }`}
//                   placeholder="Votre profession"
//                 />
//                 {errors.promoteur_profession && <p className="text-xs text-red-500 mt-1">{errors.promoteur_profession}</p>}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ÉTAPE 2 : PROJET */}
//         {currentStep === 2 && (
//           <div className="space-y-4">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
//                 <FileText className="h-5 w-5 text-green-600" />
//               </div>
//               <div>
//                 <h3 className="text-base font-semibold text-gray-900">Informations du projet</h3>
//                 <p className="text-xs text-gray-500">Modifiez les détails de votre projet</p>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Nom du projet <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={formData.nom_projet}
//                 onChange={(e) => handleChange('nom_projet', e.target.value)}
//                 className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                   errors.nom_projet ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                 }`}
//                 placeholder="Nom de votre projet"
//               />
//               {errors.nom_projet && <p className="text-xs text-red-500 mt-1">{errors.nom_projet}</p>}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Secteur d'activité <span className="text-red-500">*</span>
//               </label>
//               <select
//                 value={formData.secteur_activite}
//                 onChange={(e) => handleChange('secteur_activite', e.target.value)}
//                 className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                   errors.secteur_activite ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                 }`}
//               >
//                 <option value="">Sélectionner un secteur</option>
//                 {SECTEURS.map(s => (
//                   <option key={s} value={s}>{s}</option>
//                 ))}
//               </select>
//               {errors.secteur_activite && <p className="text-xs text-red-500 mt-1">{errors.secteur_activite}</p>}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Description du projet <span className="text-red-500">*</span>
//               </label>
//               <textarea
//                 value={formData.description_projet}
//                 onChange={(e) => handleChange('description_projet', e.target.value)}
//                 rows={4}
//                 className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none ${
//                   errors.description_projet ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                 }`}
//                 placeholder="Décrivez votre projet en détail..."
//               />
//               {errors.description_projet && <p className="text-xs text-red-500 mt-1">{errors.description_projet}</p>}
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Localisation <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.localisation_projet}
//                   onChange={(e) => handleChange('localisation_projet', e.target.value)}
//                   className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                     errors.localisation_projet ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                   }`}
//                   placeholder="Où sera réalisé le projet ?"
//                 />
//                 {errors.localisation_projet && <p className="text-xs text-red-500 mt-1">{errors.localisation_projet}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Durée de réalisation <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.duree_realisation}
//                   onChange={(e) => handleChange('duree_realisation', e.target.value)}
//                   className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                     errors.duree_realisation ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                   }`}
//                   placeholder="Ex: 12 mois"
//                 />
//                 {errors.duree_realisation && <p className="text-xs text-red-500 mt-1">{errors.duree_realisation}</p>}
//               </div>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Coût total ($) <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   value={formData.cout_total || ''}
//                   onChange={(e) => handleChange('cout_total', parseFloat(e.target.value) || 0)}
//                   className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                     errors.cout_total ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                   }`}
//                   placeholder="0"
//                   min="0"
//                 />
//                 {errors.cout_total && <p className="text-xs text-red-500 mt-1">{errors.cout_total}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Montant sollicité ($) <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   value={formData.montant_sollicite || ''}
//                   onChange={(e) => handleChange('montant_sollicite', parseFloat(e.target.value) || 0)}
//                   className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                     errors.montant_sollicite ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                   }`}
//                   placeholder="0"
//                   min="0"
//                 />
//                 {errors.montant_sollicite && <p className="text-xs text-red-500 mt-1">{errors.montant_sollicite}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Nombre d'emplois <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   value={formData.nombre_emplois || ''}
//                   onChange={(e) => handleChange('nombre_emplois', parseInt(e.target.value) || 0)}
//                   className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                     errors.nombre_emplois ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                   }`}
//                   placeholder="0"
//                   min="0"
//                 />
//                 {errors.nombre_emplois && <p className="text-xs text-red-500 mt-1">{errors.nombre_emplois}</p>}
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Objectifs du projet <span className="text-red-500">*</span>
//               </label>
//               <textarea
//                 value={formData.objectifs_projet}
//                 onChange={(e) => handleChange('objectifs_projet', e.target.value)}
//                 rows={3}
//                 className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none ${
//                   errors.objectifs_projet ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                 }`}
//                 placeholder="Quels sont les objectifs de votre projet ?"
//               />
//               {errors.objectifs_projet && <p className="text-xs text-red-500 mt-1">{errors.objectifs_projet}</p>}
//             </div>
//           </div>
//         )}

//         {/* ÉTAPE 3 : FINANCE */}
//         {currentStep === 3 && (
//           <div className="space-y-4">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
//                 <CreditCard className="h-5 w-5 text-orange-600" />
//               </div>
//               <div>
//                 <h3 className="text-base font-semibold text-gray-900">Informations financières</h3>
//                 <p className="text-xs text-gray-500">Modifiez les détails financiers de votre projet</p>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Apport personnel ($)
//                 </label>
//                 <input
//                   type="number"
//                   value={formData.apport_personnel || ''}
//                   onChange={(e) => handleChange('apport_personnel', parseFloat(e.target.value) || 0)}
//                   className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                     errors.apport_personnel ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                   }`}
//                   placeholder="0"
//                   min="0"
//                 />
//                 {errors.apport_personnel && <p className="text-xs text-red-500 mt-1">{errors.apport_personnel}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   CA prévisionnel ($) <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   value={formData.chiffre_affaires_previsionnel || ''}
//                   onChange={(e) => handleChange('chiffre_affaires_previsionnel', parseFloat(e.target.value) || 0)}
//                   className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                     errors.chiffre_affaires_previsionnel ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                   }`}
//                   placeholder="0"
//                   min="0"
//                 />
//                 {errors.chiffre_affaires_previsionnel && <p className="text-xs text-red-500 mt-1">{errors.chiffre_affaires_previsionnel}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Bénéfice prévisionnel ($) <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   value={formData.benefice_previsionnel || ''}
//                   onChange={(e) => handleChange('benefice_previsionnel', parseFloat(e.target.value) || 0)}
//                   className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                     errors.benefice_previsionnel ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                   }`}
//                   placeholder="0"
//                   min="0"
//                 />
//                 {errors.benefice_previsionnel && <p className="text-xs text-red-500 mt-1">{errors.benefice_previsionnel}</p>}
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Source de financement
//               </label>
//               <input
//                 type="text"
//                 value={formData.source_financement}
//                 onChange={(e) => handleChange('source_financement', e.target.value)}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
//                 placeholder="Autres sources de financement"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Durée de remboursement <span className="text-red-500">*</span>
//               </label>
//               <select
//                 value={formData.duree_remboursement}
//                 onChange={(e) => handleChange('duree_remboursement', e.target.value)}
//                 className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                   errors.duree_remboursement ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                 }`}
//               >
//                 <option value="">Sélectionner</option>
//                 <option value="6 mois">6 mois</option>
//                 <option value="12 mois">12 mois</option>
//                 <option value="18 mois">18 mois</option>
//                 <option value="24 mois">24 mois</option>
//                 <option value="36 mois">36 mois</option>
//                 <option value="48 mois">48 mois</option>
//                 <option value="60 mois">60 mois</option>
//               </select>
//               {errors.duree_remboursement && <p className="text-xs text-red-500 mt-1">{errors.duree_remboursement}</p>}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Garanties proposées <span className="text-red-500">*</span>
//               </label>
//               <textarea
//                 value={formData.garanties_proposees}
//                 onChange={(e) => handleChange('garanties_proposees', e.target.value)}
//                 rows={3}
//                 className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none ${
//                   errors.garanties_proposees ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                 }`}
//                 placeholder="Quelles garanties proposez-vous ?"
//               />
//               {errors.garanties_proposees && <p className="text-xs text-red-500 mt-1">{errors.garanties_proposees}</p>}
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Banque partenaire <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   value={formData.banque_partenaire}
//                   onChange={(e) => handleChange('banque_partenaire', e.target.value)}
//                   className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                     errors.banque_partenaire ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                   }`}
//                 >
//                   <option value="">Sélectionner une banque</option>
//                   {BANQUES.map(b => (
//                     <option key={b} value={b}>{b}</option>
//                   ))}
//                 </select>
//                 {errors.banque_partenaire && <p className="text-xs text-red-500 mt-1">{errors.banque_partenaire}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   N° Compte bancaire <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.numero_compte_bancaire}
//                   onChange={(e) => handleChange('numero_compte_bancaire', e.target.value)}
//                   className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
//                     errors.numero_compte_bancaire ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                   }`}
//                   placeholder="Numéro de compte"
//                 />
//                 {errors.numero_compte_bancaire && <p className="text-xs text-red-500 mt-1">{errors.numero_compte_bancaire}</p>}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ÉTAPE 4 : DOCUMENTS */}
//         {currentStep === 4 && (
//           <div className="space-y-4">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
//                 <Upload className="h-5 w-5 text-red-600" />
//               </div>
//               <div>
//                 <h3 className="text-base font-semibold text-gray-900">Documents</h3>
//                 <p className="text-xs text-gray-500">Gérez les documents de votre dossier</p>
//               </div>
//             </div>

//             {/* Documents existants */}
//             {documentsExistants.length > 0 && (
//               <div className="space-y-2">
//                 <h4 className="text-sm font-medium text-gray-700">Documents actuels</h4>
//                 {documentsExistants.map(doc => (
//                   <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
//                     <div className="flex items-center gap-3">
//                       <FileText className="h-5 w-5 text-gray-400" />
//                       <div>
//                         <p className="text-sm font-medium">{getDocName(doc.type_document)}</p>
//                         <p className="text-xs text-gray-500">{doc.nom_fichier}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <a
//                         href={doc.chemin_fichier}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg"
//                       >
//                         <Eye className="h-4 w-4" />
//                       </a>
//                       <button
//                         onClick={() => handleDeleteDocument(doc.id)}
//                         disabled={deletingDocId === doc.id}
//                         className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
//                       >
//                         {deletingDocId === doc.id ? (
//                           <Loader2 className="h-4 w-4 animate-spin" />
//                         ) : (
//                           <Trash2 className="h-4 w-4" />
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Ajouter nouveaux documents */}
//             <div className="space-y-2">
//               <h4 className="text-sm font-medium text-gray-700">Ajouter des documents</h4>
              
//               {['carte_electeur', 'rccm', 'id_nat', 'attestation_fiscale', 'attestation_cnss'].map(type => {
//                 const hasExisting = documentsExistants.some(d => d.type_document === type)
//                 const hasNew = nouveauxDocuments[type]
                
//                 return (
//                   <div key={type} className={`p-3 rounded-xl border ${
//                     hasNew ? 'bg-green-50 border-green-200' : 
//                     hasExisting ? 'bg-blue-50 border-blue-200' : 
//                     'bg-white border-gray-200'
//                   }`}>
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-3">
//                         {hasNew ? <CheckCircle className="h-5 w-5 text-green-500" /> :
//                          hasExisting ? <FileText className="h-5 w-5 text-blue-500" /> :
//                          <Upload className="h-5 w-5 text-gray-400" />}
//                         <div>
//                           <p className="text-sm font-medium">
//                             {getDocName(type)}
//                             <span className="text-red-500 ml-1">*</span>
//                           </p>
//                           {hasNew && <p className="text-xs text-green-600">Nouveau fichier sélectionné</p>}
//                           {hasExisting && !hasNew && <p className="text-xs text-blue-600">Document existant</p>}
//                         </div>
//                       </div>
//                       <label className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
//                         hasNew ? 'bg-green-500 text-white' :
//                         'bg-amber-500 text-white hover:bg-amber-600'
//                       }`}>
//                         {hasNew ? 'Modifier' : 'Ajouter'}
//                         <input
//                           type="file"
//                           className="hidden"
//                           accept=".pdf,.jpg,.jpeg,.png"
//                           onChange={(e) => {
//                             const file = e.target.files?.[0]
//                             if (file) handleFileSelect(type, file)
//                           }}
//                         />
//                       </label>
//                     </div>
//                     {uploadingDoc === type && (
//                       <div className="mt-2 flex items-center gap-2 text-xs text-amber-600">
//                         <Loader2 className="h-3 w-3 animate-spin" />
//                         Upload en cours...
//                       </div>
//                     )}
//                   </div>
//                 )
//               })}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Footer avec boutons */}
//       <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
//         <div className="flex gap-3">
//           {currentStep > 0 && (
//             <button
//               onClick={handlePrevious}
//               className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-white transition-colors"
//             >
//               <ArrowLeft className="h-4 w-4" />
//               Précédent
//             </button>
//           )}

//           {currentStep < 4 ? (
//             <button
//               onClick={handleNext}
//               className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 ml-auto transition-colors"
//             >
//               Suivant
//               <ArrowRight className="h-4 w-4" />
//             </button>
//           ) : (
//             <button
//               onClick={handleSave}
//               disabled={saving}
//               className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 ml-auto transition-colors disabled:opacity-50"
//             >
//               {saving ? (
//                 <>
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                   Sauvegarde...
//                 </>
//               ) : (
//                 <>
//                   <Save className="h-4 w-4" />
//                   Enregistrer les modifications
//                 </>
//               )}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Loader2, CheckCircle, AlertCircle, X, Save, 
  Building2, User, FileText, CreditCard, Upload,
  Eye, Trash2, Edit3, ArrowLeft, ArrowRight
} from 'lucide-react'

type Props = {
  projetId: number
  onClose: () => void
  onSuccess: () => void
}

type ProjetFPI = {
  id: number
  nom_entite: string
  num_national: string
  numero_rccm: string
  siege_social: string
  promoteur_nom_complet: string
  promoteur_sexe: string
  promoteur_telephone: string
  promoteur_email: string
  promoteur_adresse: string
  promoteur_province: string
  promoteur_ville: string
  promoteur_profession: string
  nom_projet: string
  secteur_activite: string
  description_projet: string
  localisation_projet: string
  cout_total: number
  montant_sollicite: number
  nombre_emplois: number
  duree_realisation: string
  objectifs_projet: string
  apport_personnel: number
  source_financement: string
  chiffre_affaires_previsionnel: number
  benefice_previsionnel: number
  duree_remboursement: string
  garanties_proposees: string
  banque_partenaire: string
  numero_compte_bancaire: string
  frais_paye: boolean
  statut: string
  etape: string
}

type DocumentExistant = {
  id: number
  type_document: string
  chemin_fichier: string
  nom_fichier: string
}

const PROVINCES = [
  'Kinshasa', 'Kongo Central', 'Kwango', 'Kwilu', 'Mai-Ndombe',
  'Kasaï', 'Kasaï Central', 'Kasaï Oriental', 'Lomami', 'Sankuru',
  'Maniema', 'Sud-Kivu', 'Nord-Kivu', 'Ituri', 'Haut-Uele',
  'Tshopo', 'Bas-Uele', 'Mongala', 'Nord-Ubangi', 'Sud-Ubangi',
  'Équateur', 'Tshuapa', 'Tanganyika', 'Haut-Lomami', 'Lualaba', 'Haut-Katanga'
]

const SECTEURS = [
  'Agriculture', 'Élevage', 'Pêche', 'Mines', 'Énergie',
  'Construction', 'Transport', 'Télécommunications', 'Commerce',
  'Santé', 'Éducation', 'Tourisme', 'Industrie', 'Artisanat', 'Autre'
]

const BANQUES = [
  'Rawbank', 'BCDC', 'TMB', 'Equity BCDC', 'Afriland',
  'Sofibanque', 'FBN Bank', 'Access Bank', 'UBA', 'Standard Bank'
]

const STEPS = [
  { id: 0, title: 'Entité', icon: Building2 },
  { id: 1, title: 'Promoteur', icon: User },
  { id: 2, title: 'Projet', icon: FileText },
  { id: 3, title: 'Finance', icon: CreditCard },
  { id: 4, title: 'Documents', icon: Upload }
]

// ✅ Fonction helper pour normaliser les valeurs (remplace null/undefined par des valeurs par défaut)
const normaliserValeur = (value: any, defaultValue: any): any => {
  if (value === null || value === undefined) return defaultValue
  return value
}

const normaliserProjet = (projet: any): ProjetFPI => ({
  id: normaliserValeur(projet.id, 0),
  nom_entite: normaliserValeur(projet.nom_entite, ''),
  num_national: normaliserValeur(projet.num_national, ''),
  numero_rccm: normaliserValeur(projet.numero_rccm, ''),
  siege_social: normaliserValeur(projet.siege_social, ''),
  promoteur_nom_complet: normaliserValeur(projet.promoteur_nom_complet, ''),
  promoteur_sexe: normaliserValeur(projet.promoteur_sexe, 'M'),
  promoteur_telephone: normaliserValeur(projet.promoteur_telephone, ''),
  promoteur_email: normaliserValeur(projet.promoteur_email, ''),
  promoteur_adresse: normaliserValeur(projet.promoteur_adresse, ''),
  promoteur_province: normaliserValeur(projet.promoteur_province, ''),
  promoteur_ville: normaliserValeur(projet.promoteur_ville, ''),
  promoteur_profession: normaliserValeur(projet.promoteur_profession, ''),
  nom_projet: normaliserValeur(projet.nom_projet, ''),
  secteur_activite: normaliserValeur(projet.secteur_activite, ''),
  description_projet: normaliserValeur(projet.description_projet, ''),
  localisation_projet: normaliserValeur(projet.localisation_projet, ''),
  cout_total: normaliserValeur(projet.cout_total, 0),
  montant_sollicite: normaliserValeur(projet.montant_sollicite, 0),
  nombre_emplois: normaliserValeur(projet.nombre_emplois, 0),
  duree_realisation: normaliserValeur(projet.duree_realisation, ''),
  objectifs_projet: normaliserValeur(projet.objectifs_projet, ''),
  apport_personnel: normaliserValeur(projet.apport_personnel, 0),
  source_financement: normaliserValeur(projet.source_financement, ''),
  chiffre_affaires_previsionnel: normaliserValeur(projet.chiffre_affaires_previsionnel, 0),
  benefice_previsionnel: normaliserValeur(projet.benefice_previsionnel, 0),
  duree_remboursement: normaliserValeur(projet.duree_remboursement, ''),
  garanties_proposees: normaliserValeur(projet.garanties_proposees, ''),
  banque_partenaire: normaliserValeur(projet.banque_partenaire, ''),
  numero_compte_bancaire: normaliserValeur(projet.numero_compte_bancaire, ''),
  frais_paye: normaliserValeur(projet.frais_paye, false),
  statut: normaliserValeur(projet.statut, ''),
  etape: normaliserValeur(projet.etape, '')
})

export default function FormulaireFPIModification({ projetId, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const [hasChanges, setHasChanges] = useState(false)

  // Données du projet - ✅ Toutes les valeurs initiales sont garanties non-null
  const [formData, setFormData] = useState<ProjetFPI>({
    id: 0,
    nom_entite: '',
    num_national: '',
    numero_rccm: '',
    siege_social: '',
    promoteur_nom_complet: '',
    promoteur_sexe: 'M',
    promoteur_telephone: '',
    promoteur_email: '',
    promoteur_adresse: '',
    promoteur_province: '',
    promoteur_ville: '',
    promoteur_profession: '',
    nom_projet: '',
    secteur_activite: '',
    description_projet: '',
    localisation_projet: '',
    cout_total: 0,
    montant_sollicite: 0,
    nombre_emplois: 0,
    duree_realisation: '',
    objectifs_projet: '',
    apport_personnel: 0,
    source_financement: '',
    chiffre_affaires_previsionnel: 0,
    benefice_previsionnel: 0,
    duree_remboursement: '',
    garanties_proposees: '',
    banque_partenaire: '',
    numero_compte_bancaire: '',
    frais_paye: false,
    statut: '',
    etape: ''
  })

  const [documentsExistants, setDocumentsExistants] = useState<DocumentExistant[]>([])
  const [nouveauxDocuments, setNouveauxDocuments] = useState<Record<string, File>>({})
  const [suppressionDocs, setSuppressionDocs] = useState<number[]>([])
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    chargerProjet()
  }, [projetId])

  const chargerProjet = async () => {
    try {
      setLoading(true)
      
      const { data: projet, error: projetError } = await supabase
        .from('projets_fpi')
        .select('*')
        .eq('id', projetId)
        .single()

      if (projetError) throw projetError
      if (!projet) throw new Error('Projet non trouvé')

      // ✅ Utiliser le normalisateur pour garantir aucune valeur null/undefined
      const projetNormalise = normaliserProjet(projet)
      console.log('📦 Projet normalisé:', projetNormalise)
      
      setFormData(projetNormalise)

      // Charger les documents existants
      const { data: docs } = await supabase
        .from('documents_fpi')
        .select('*')
        .eq('projet_id', projetId)

      if (docs) {
        setDocumentsExistants(docs)
      }

    } catch (error: any) {
      console.error('Erreur chargement:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 0:
        if (!formData.nom_entite.trim()) newErrors.nom_entite = 'Obligatoire'
        if (!formData.num_national.trim()) newErrors.num_national = 'Obligatoire'
        if (!formData.numero_rccm.trim()) newErrors.numero_rccm = 'Obligatoire'
        if (!formData.siege_social.trim()) newErrors.siege_social = 'Obligatoire'
        break

      case 1:
        if (!formData.promoteur_nom_complet.trim()) newErrors.promoteur_nom_complet = 'Obligatoire'
        if (!formData.promoteur_sexe) newErrors.promoteur_sexe = 'Obligatoire'
        if (!formData.promoteur_telephone.trim()) newErrors.promoteur_telephone = 'Obligatoire'
        if (!formData.promoteur_email.trim()) newErrors.promoteur_email = 'Obligatoire'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.promoteur_email))
          newErrors.promoteur_email = 'Email invalide'
        if (!formData.promoteur_adresse.trim()) newErrors.promoteur_adresse = 'Obligatoire'
        if (!formData.promoteur_province) newErrors.promoteur_province = 'Obligatoire'
        if (!formData.promoteur_ville.trim()) newErrors.promoteur_ville = 'Obligatoire'
        if (!formData.promoteur_profession.trim()) newErrors.promoteur_profession = 'Obligatoire'
        break

      case 2:
        if (!formData.nom_projet.trim()) newErrors.nom_projet = 'Obligatoire'
        if (!formData.secteur_activite) newErrors.secteur_activite = 'Obligatoire'
        if (!formData.description_projet.trim()) newErrors.description_projet = 'Obligatoire'
        if (!formData.localisation_projet.trim()) newErrors.localisation_projet = 'Obligatoire'
        if (!formData.cout_total || formData.cout_total <= 0) newErrors.cout_total = 'Doit être > 0'
        if (!formData.montant_sollicite || formData.montant_sollicite <= 0)
          newErrors.montant_sollicite = 'Doit être > 0'
        if (formData.montant_sollicite > formData.cout_total)
          newErrors.montant_sollicite = 'Ne peut pas dépasser le coût total'
        if (!formData.nombre_emplois || formData.nombre_emplois <= 0)
          newErrors.nombre_emplois = 'Doit être > 0'
        if (!formData.duree_realisation.trim()) newErrors.duree_realisation = 'Obligatoire'
        if (!formData.objectifs_projet.trim()) newErrors.objectifs_projet = 'Obligatoire'
        break

      case 3:
        if (formData.apport_personnel < 0) newErrors.apport_personnel = 'Ne peut pas être négatif'
        if (!formData.chiffre_affaires_previsionnel || formData.chiffre_affaires_previsionnel <= 0)
          newErrors.chiffre_affaires_previsionnel = 'Doit être > 0'
        if (!formData.benefice_previsionnel || formData.benefice_previsionnel <= 0)
          newErrors.benefice_previsionnel = 'Doit être > 0'
        if (!formData.duree_remboursement) newErrors.duree_remboursement = 'Obligatoire'
        if (!formData.garanties_proposees.trim()) newErrors.garanties_proposees = 'Obligatoire'
        if (!formData.banque_partenaire) newErrors.banque_partenaire = 'Obligatoire'
        if (!formData.numero_compte_bancaire.trim()) newErrors.numero_compte_bancaire = 'Obligatoire'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleFileSelect = (type: string, file: File) => {
    setNouveauxDocuments(prev => ({ ...prev, [type]: file }))
    setHasChanges(true)
  }

  const handleDeleteDocument = async (docId: number) => {
    if (!window.confirm('Supprimer ce document ?')) return

    setDeletingDocId(docId)
    try {
      const { error } = await supabase
        .from('documents_fpi')
        .delete()
        .eq('id', docId)

      if (error) throw error

      setDocumentsExistants(prev => prev.filter(d => d.id !== docId))
      setHasChanges(true)
    } catch (error: any) {
      setError('Erreur lors de la suppression')
    } finally {
      setDeletingDocId(null)
    }
  }

  const handleSave = async () => {
    // Valider toutes les étapes
    let allValid = true
    for (let i = 0; i <= 4; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i)
        allValid = false
        break
      }
    }

    if (!allValid) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // 1. Mettre à jour les données du projet
      const { error: updateError } = await supabase
        .from('projets_fpi')
        .update({
          nom_entite: formData.nom_entite,
          num_national: formData.num_national,
          numero_rccm: formData.numero_rccm,
          siege_social: formData.siege_social,
          promoteur_nom_complet: formData.promoteur_nom_complet,
          promoteur_sexe: formData.promoteur_sexe,
          promoteur_telephone: formData.promoteur_telephone,
          promoteur_email: formData.promoteur_email,
          promoteur_adresse: formData.promoteur_adresse,
          promoteur_province: formData.promoteur_province,
          promoteur_ville: formData.promoteur_ville,
          promoteur_profession: formData.promoteur_profession,
          nom_projet: formData.nom_projet,
          secteur_activite: formData.secteur_activite,
          description_projet: formData.description_projet,
          localisation_projet: formData.localisation_projet,
          cout_total: formData.cout_total,
          montant_sollicite: formData.montant_sollicite,
          nombre_emplois: formData.nombre_emplois,
          duree_realisation: formData.duree_realisation,
          objectifs_projet: formData.objectifs_projet,
          apport_personnel: formData.apport_personnel,
          source_financement: formData.source_financement,
          chiffre_affaires_previsionnel: formData.chiffre_affaires_previsionnel,
          benefice_previsionnel: formData.benefice_previsionnel,
          duree_remboursement: formData.duree_remboursement,
          garanties_proposees: formData.garanties_proposees,
          banque_partenaire: formData.banque_partenaire,
          numero_compte_bancaire: formData.numero_compte_bancaire,
          updated_at: new Date().toISOString()
        })
        .eq('id', projetId)

      if (updateError) throw updateError

      // 2. Supprimer les documents marqués pour suppression
      for (const docId of suppressionDocs) {
        await supabase.from('documents_fpi').delete().eq('id', docId)
      }

      // 3. Uploader les nouveaux documents
      const docKeys = Object.keys(nouveauxDocuments)
      for (const key of docKeys) {
        const file = nouveauxDocuments[key]
        if (!file) continue

        setUploadingDoc(key)

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

        setUploadingDoc(null)
      }

      setSuccess('✅ Projet modifié avec succès !')
      
      setTimeout(() => {
        onSuccess()
      }, 2000)

    } catch (error: any) {
      console.error('Erreur sauvegarde:', error)
      setError(error.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const formatMontant = (m: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(m)

  const getDocName = (type: string) => {
    const names: Record<string, string> = {
      'carte_electeur': 'Carte d\'électeur',
      'rccm': 'RCCM',
      'id_nat': 'ID National',
      'attestation_fiscale': 'Attestation fiscale',
      'attestation_cnss': 'Attestation CNSS',
      'business_plan': 'Business Plan',
      'autres': 'Autre document'
    }
    return names[type] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Chargement du projet...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Edit3 className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Modifier la demande</h2>
              <p className="text-xs text-gray-500">{formData.nom_projet}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Indicateur d'étapes */}
        <div className="flex items-center gap-1">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => {
                  if (step.id <= currentStep && validateStep(currentStep)) {
                    setCurrentStep(step.id)
                  }
                }}
                className={`flex flex-col items-center flex-1 ${
                  step.id <= currentStep ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step.id < currentStep
                    ? 'bg-green-500 text-white'
                    : step.id === currentStep
                    ? 'bg-amber-500 text-white ring-4 ring-amber-200'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {step.id < currentStep ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step.id + 1
                  )}
                </div>
                <span className="text-[10px] mt-1 font-medium hidden sm:block">
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

      {/* Messages */}
      {(error || success) && (
        <div className={`mx-6 mt-4 p-3 rounded-xl text-sm flex items-start gap-2 ${
          success ? 'bg-green-50 border border-green-200 text-green-700' :
          'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {success ? <CheckCircle className="h-4 w-4 mt-0.5" /> : <AlertCircle className="h-4 w-4 mt-0.5" />}
          <span>{success || error}</span>
        </div>
      )}

      {/* Contenu du formulaire */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        
        {/* ÉTAPE 0 : ENTITÉ */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Informations de l'entité</h3>
                <p className="text-xs text-gray-500">Modifiez les informations de votre entreprise</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'entité <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nom_entite}
                onChange={(e) => handleChange('nom_entite', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                  errors.nom_entite ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Nom de votre entreprise"
              />
              {errors.nom_entite && <p className="text-xs text-red-500 mt-1">{errors.nom_entite}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro National <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.num_national}
                  onChange={(e) => handleChange('num_national', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                    errors.num_national ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 01-1234567"
                />
                {errors.num_national && <p className="text-xs text-red-500 mt-1">{errors.num_national}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro RCCM <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.numero_rccm}
                  onChange={(e) => handleChange('numero_rccm', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                    errors.numero_rccm ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Ex: RCCM-12345"
                />
                {errors.numero_rccm && <p className="text-xs text-red-500 mt-1">{errors.numero_rccm}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Siège Social <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.siege_social}
                onChange={(e) => handleChange('siege_social', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                  errors.siege_social ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Adresse du siège social"
              />
              {errors.siege_social && <p className="text-xs text-red-500 mt-1">{errors.siege_social}</p>}
            </div>
          </div>
        )}

        {/* ÉTAPE 1 : PROMOTEUR */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Informations du promoteur</h3>
                <p className="text-xs text-gray-500">Modifiez vos informations personnelles</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.promoteur_nom_complet}
                onChange={(e) => handleChange('promoteur_nom_complet', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                  errors.promoteur_nom_complet ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Votre nom complet"
              />
              {errors.promoteur_nom_complet && <p className="text-xs text-red-500 mt-1">{errors.promoteur_nom_complet}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sexe <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.promoteur_sexe === 'M' 
                    ? 'border-amber-500 bg-amber-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="sexe"
                    value="M"
                    checked={formData.promoteur_sexe === 'M'}
                    onChange={(e) => handleChange('promoteur_sexe', e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-lg">👨</span>
                  <span className="text-sm font-medium">Masculin</span>
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.promoteur_sexe === 'F' 
                    ? 'border-amber-500 bg-amber-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="sexe"
                    value="F"
                    checked={formData.promoteur_sexe === 'F'}
                    onChange={(e) => handleChange('promoteur_sexe', e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-lg">👩</span>
                  <span className="text-sm font-medium">Féminin</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.promoteur_telephone}
                  onChange={(e) => handleChange('promoteur_telephone', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                    errors.promoteur_telephone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="0812345678"
                />
                {errors.promoteur_telephone && <p className="text-xs text-red-500 mt-1">{errors.promoteur_telephone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.promoteur_email}
                  onChange={(e) => handleChange('promoteur_email', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                    errors.promoteur_email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="email@exemple.com"
                />
                {errors.promoteur_email && <p className="text-xs text-red-500 mt-1">{errors.promoteur_email}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse physique <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.promoteur_adresse}
                onChange={(e) => handleChange('promoteur_adresse', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                  errors.promoteur_adresse ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Votre adresse"
              />
              {errors.promoteur_adresse && <p className="text-xs text-red-500 mt-1">{errors.promoteur_adresse}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Province <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.promoteur_province}
                  onChange={(e) => handleChange('promoteur_province', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                    errors.promoteur_province ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner</option>
                  {PROVINCES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {errors.promoteur_province && <p className="text-xs text-red-500 mt-1">{errors.promoteur_province}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.promoteur_ville}
                  onChange={(e) => handleChange('promoteur_ville', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                    errors.promoteur_ville ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Votre ville"
                />
                {errors.promoteur_ville && <p className="text-xs text-red-500 mt-1">{errors.promoteur_ville}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profession <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.promoteur_profession}
                  onChange={(e) => handleChange('promoteur_profession', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                    errors.promoteur_profession ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Votre profession"
                />
                {errors.promoteur_profession && <p className="text-xs text-red-500 mt-1">{errors.promoteur_profession}</p>}
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : PROJET */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Informations du projet</h3>
                <p className="text-xs text-gray-500">Modifiez les détails de votre projet</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du projet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nom_projet}
                onChange={(e) => handleChange('nom_projet', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                  errors.nom_projet ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Nom de votre projet"
              />
              {errors.nom_projet && <p className="text-xs text-red-500 mt-1">{errors.nom_projet}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secteur d'activité <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.secteur_activite}
                onChange={(e) => handleChange('secteur_activite', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                  errors.secteur_activite ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner un secteur</option>
                {SECTEURS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.secteur_activite && <p className="text-xs text-red-500 mt-1">{errors.secteur_activite}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description du projet <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description_projet}
                onChange={(e) => handleChange('description_projet', e.target.value)}
                rows={4}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none ${
                  errors.description_projet ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Décrivez votre projet en détail..."
              />
              {errors.description_projet && <p className="text-xs text-red-500 mt-1">{errors.description_projet}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localisation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.localisation_projet}
                  onChange={(e) => handleChange('localisation_projet', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                    errors.localisation_projet ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Où sera réalisé le projet ?"
                />
                {errors.localisation_projet && <p className="text-xs text-red-500 mt-1">{errors.localisation_projet}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée de réalisation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.duree_realisation}
                  onChange={(e) => handleChange('duree_realisation', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                    errors.duree_realisation ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 12 mois"
                />
                {errors.duree_realisation && <p className="text-xs text-red-500 mt-1">{errors.duree_realisation}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coût total ($) <span className="text-red-500">*</span>
                </label>
                {/* ✅ Input numérique avec fallback */}
                <input
                  type="number"
                  value={formData.cout_total ?? ''}
                  onChange={(e) => handleChange('cout_total', parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                    errors.cout_total ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.cout_total && <p className="text-xs text-red-500 mt-1">{errors.cout_total}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant sollicité ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.montant_sollicite ?? ''}
                  onChange={(e) => handleChange('montant_sollicite', parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                    errors.montant_sollicite ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.montant_sollicite && <p className="text-xs text-red-500 mt-1">{errors.montant_sollicite}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre d'emplois <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.nombre_emplois ?? ''}
                  onChange={(e) => handleChange('nombre_emplois', parseInt(e.target.value) || 0)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                    errors.nombre_emplois ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.nombre_emplois && <p className="text-xs text-red-500 mt-1">{errors.nombre_emplois}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Objectifs du projet <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.objectifs_projet}
                onChange={(e) => handleChange('objectifs_projet', e.target.value)}
                rows={3}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none ${
                  errors.objectifs_projet ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Quels sont les objectifs de votre projet ?"
              />
              {errors.objectifs_projet && <p className="text-xs text-red-500 mt-1">{errors.objectifs_projet}</p>}
            </div>
          </div>
        )}

        {/* ÉTAPE 3 : FINANCE */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Informations financières</h3>
                <p className="text-xs text-gray-500">Modifiez les détails financiers de votre projet</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apport personnel ($)
                </label>
                <input
                  type="number"
                  value={formData.apport_personnel ?? ''}
                  onChange={(e) => handleChange('apport_personnel', parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                    errors.apport_personnel ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.apport_personnel && <p className="text-xs text-red-500 mt-1">{errors.apport_personnel}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CA prévisionnel ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.chiffre_affaires_previsionnel ?? ''}
                  onChange={(e) => handleChange('chiffre_affaires_previsionnel', parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                    errors.chiffre_affaires_previsionnel ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.chiffre_affaires_previsionnel && <p className="text-xs text-red-500 mt-1">{errors.chiffre_affaires_previsionnel}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bénéfice prévisionnel ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.benefice_previsionnel ?? ''}
                  onChange={(e) => handleChange('benefice_previsionnel', parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                    errors.benefice_previsionnel ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.benefice_previsionnel && <p className="text-xs text-red-500 mt-1">{errors.benefice_previsionnel}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source de financement
              </label>
              <input
                type="text"
                value={formData.source_financement}
                onChange={(e) => handleChange('source_financement', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                placeholder="Autres sources de financement"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durée de remboursement <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.duree_remboursement}
                onChange={(e) => handleChange('duree_remboursement', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                  errors.duree_remboursement ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner</option>
                <option value="6 mois">6 mois</option>
                <option value="12 mois">12 mois</option>
                <option value="18 mois">18 mois</option>
                <option value="24 mois">24 mois</option>
                <option value="36 mois">36 mois</option>
                <option value="48 mois">48 mois</option>
                <option value="60 mois">60 mois</option>
              </select>
              {errors.duree_remboursement && <p className="text-xs text-red-500 mt-1">{errors.duree_remboursement}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Garanties proposées <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.garanties_proposees}
                onChange={(e) => handleChange('garanties_proposees', e.target.value)}
                rows={3}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none ${
                  errors.garanties_proposees ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Quelles garanties proposez-vous ?"
              />
              {errors.garanties_proposees && <p className="text-xs text-red-500 mt-1">{errors.garanties_proposees}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banque partenaire <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.banque_partenaire}
                  onChange={(e) => handleChange('banque_partenaire', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                    errors.banque_partenaire ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner une banque</option>
                  {BANQUES.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                {errors.banque_partenaire && <p className="text-xs text-red-500 mt-1">{errors.banque_partenaire}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° Compte bancaire <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.numero_compte_bancaire}
                  onChange={(e) => handleChange('numero_compte_bancaire', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                    errors.numero_compte_bancaire ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Numéro de compte"
                />
                {errors.numero_compte_bancaire && <p className="text-xs text-red-500 mt-1">{errors.numero_compte_bancaire}</p>}
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 4 : DOCUMENTS */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Upload className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Documents</h3>
                <p className="text-xs text-gray-500">Gérez les documents de votre dossier</p>
              </div>
            </div>

            {/* Documents existants */}
            {documentsExistants.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Documents actuels</h4>
                {documentsExistants.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">{getDocName(doc.type_document)}</p>
                        <p className="text-xs text-gray-500">{doc.nom_fichier}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={doc.chemin_fichier}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      {/* <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        disabled={deletingDocId === doc.id}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                      >
                        {deletingDocId === doc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button> */}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ajouter nouveaux documents */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Ajouter des documents</h4>
              
              {['carte_electeur', 'rccm', 'id_nat', 'attestation_fiscale', 'attestation_cnss'].map(type => {
                const hasExisting = documentsExistants.some(d => d.type_document === type)
                const hasNew = nouveauxDocuments[type]
                
                return (
                  <div key={type} className={`p-3 rounded-xl border ${
                    hasNew ? 'bg-green-50 border-green-200' : 
                    hasExisting ? 'bg-blue-50 border-blue-200' : 
                    'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {hasNew ? <CheckCircle className="h-5 w-5 text-green-500" /> :
                         hasExisting ? <FileText className="h-5 w-5 text-blue-500" /> :
                         <Upload className="h-5 w-5 text-gray-400" />}
                        <div>
                          <p className="text-sm font-medium">
                            {getDocName(type)}
                            <span className="text-red-500 ml-1">*</span>
                          </p>
                          {hasNew && <p className="text-xs text-green-600">Nouveau fichier sélectionné</p>}
                          {hasExisting && !hasNew && <p className="text-xs text-blue-600">Document existant</p>}
                        </div>
                      </div>
                      <label className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                        hasNew ? 'bg-green-500 text-white' :
                        'bg-amber-500 text-white hover:bg-amber-600'
                      }`}>
                        {hasNew ? 'Modifier' : 'Ajouter'}
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileSelect(type, file)
                          }}
                        />
                      </label>
                    </div>
                    {uploadingDoc === type && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-amber-600">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Upload en cours...
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer avec boutons */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handlePrevious}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Précédent
            </button>
          )}

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 ml-auto transition-colors"
            >
              Suivant
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 ml-auto transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Enregistrer les modifications
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}