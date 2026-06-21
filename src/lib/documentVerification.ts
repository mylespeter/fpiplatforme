
// // documentVerification.ts
// import { DocumentsFPI } from '@/types/fpi'

// type ChampExtrait = {
//   nom: string
//   valeur: string
//   confiance: number
// }

// export type VerificationResult = {
//   estValide: boolean
//   score: number
//   champsTrouves: string[]
//   champsManquants: string[]
//   champsExtraits: ChampExtrait[]
//   commentaire: string
//   confiance: 'eleve' | 'moyen' | 'faible'
// }

// type DocumentConfig = {
//   key: keyof DocumentsFPI
//   nom: string
//   champsAVerifier: string[]
//   motsCles: string[]
// }

// const DOCUMENTS_CONFIG: DocumentConfig[] = [
//   {
//     key: 'carte_electeur',
//     nom: "Carte d'électeur",
//     // Carte d'électeur : nom, postnom, prenom SEPARES
//     champsAVerifier: ['nom', 'postnom', 'prenom', 'numero_electeur', 'date_naissance'],
//     motsCles: ['carte', 'électeur', 'CENI'],
//   },
//   {
//     key: 'rccm',
//     nom: 'RCCM',
//     // RCCM : nom_complet (un seul champ) et localite
//     champsAVerifier: ['nom_complet', 'numero_rccm', 'localite'],
//     motsCles: ['RCCM', 'registre du commerce'],
//   },
//   {
//     key: 'id_nat',
//     nom: 'ID NAT',
//     // ID NAT : le champ s'appelle "localite_rccm" dans le document
//     // (c'est écrit "Localité RCCM" sur la carte d'identité nationale)
//     champsAVerifier: ['nom_complet', 'numero_national', 'localite_rccm'],
//     motsCles: ['carte identité', 'nationale', 'ID'],
//   },
//   {
//     key: 'attestation_fiscale',
//     nom: 'Attestation fiscale',
//     champsAVerifier: ['numero_rccm', 'raison_sociale'],
//     motsCles: ['attestation', 'fiscale', 'DGI'],
//   },
//   {
//     key: 'attestation_cnss',
//     nom: 'Attestation CNSS',
//     champsAVerifier: ['raison_sociale', 'numero_affiliation'],
//     motsCles: ['CNSS', 'sécurité sociale'],
//   },
// ]

// const fileToBase64 = (file: File): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader()
//     reader.readAsDataURL(file)
//     reader.onload = () => {
//       const result = reader.result as string
//       const base64 = result.split(',')[1]
//       resolve(base64)
//     }
//     reader.onerror = reject
//   })
// }

// export const validateDocumentFile = (file: File): { valid: boolean; message?: string } => {
//   const maxSize = 10 * 1024 * 1024
//   if (file.size > maxSize) {
//     return { valid: false, message: 'Le fichier est trop volumineux. Maximum 10MB.' }
//   }

//   const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
//   if (!allowedTypes.includes(file.type)) {
//     return { valid: false, message: 'Format non supporté. Utilisez JPG, PNG ou PDF.' }
//   }

//   return { valid: true }
// }

// const buildVerificationPrompt = (docInfo: DocumentConfig): string => {
//   // Pour la carte d'électeur : nom, postnom, prenom SEPARES
//   if (docInfo.key === 'carte_electeur') {
//     return `Tu es un expert en vérification de documents officiels congolais (RDC). 
// Analyse cette image de document "${docInfo.nom}" et EXTRAIS les valeurs des champs suivants :

// **Champs à extraire avec leurs valeurs exactes :**
// - nom: [NOM DE FAMILLE uniquement - ex: KABILA]
// - postnom: [POSTNOM uniquement - ex: MUAMBA]
// - prenom: [PRENOM uniquement - ex: JOSEPH]
// - numero_electeur: [NUMERO]
// - date_naissance: [DATE]

// ⚠️ IMPORTANT : 
// - Extrais nom, postnom, prenom SEPAREMENT, pas en un seul champ.
// - Ne mélange pas les trois dans un seul champ.
// - Si un champ n'est pas visible, mets une chaîne vide "".
// - Réponds UNIQUEMENT avec un objet JSON valide.
// - Format exact :

// {
//   "estValide": true,
//   "score": 85,
//   "champsTrouves": ["nom", "postnom", "prenom", "numero_electeur"],
//   "champsManquants": ["date_naissance"],
//   "champsExtraits": [
//     {"nom": "nom", "valeur": "KABILA", "confiance": 0.95},
//     {"nom": "postnom", "valeur": "MUAMBA", "confiance": 0.95},
//     {"nom": "prenom", "valeur": "JOSEPH", "confiance": 0.90},
//     {"nom": "numero_electeur", "valeur": "12345678", "confiance": 0.90}
//   ],
//   "commentaire": "Document valide",
//   "confiance": "eleve"
// }`
//   }

//   // Pour RCCM : nom_complet et localite
//   if (docInfo.key === 'rccm') {
//     return `Tu es un expert en vérification de documents officiels congolais (RDC). 
// Analyse cette image de document "${docInfo.nom}" et EXTRAIS les valeurs des champs suivants :

// **Champs à extraire avec leurs valeurs exactes :**
// - nom_complet: [NOM COMPLET - ex: KABILA MUAMBA JOSEPH]
// - numero_rccm: [NUMERO RCCM]
// - localite: [LOCALITE / VILLE DU SIEGE - ex: Lubumbashi, Kinshasa]

// ⚠️ IMPORTANT : 
// - nom_complet contient le nom complet en un seul champ.
// - localite est la ville/localité du siège social (pas l'adresse complète).
// - Extrais les valeurs EXACTEMENT comme elles apparaissent sur le document.
// - Si un champ n'est pas visible, mets une chaîne vide "".
// - Réponds UNIQUEMENT avec un objet JSON valide.
// - Format exact :

// {
//   "estValide": true,
//   "score": 85,
//   "champsTrouves": ["nom_complet", "numero_rccm", "localite"],
//   "champsManquants": [],
//   "champsExtraits": [
//     {"nom": "nom_complet", "valeur": "KABILA MUAMBA JOSEPH", "confiance": 0.95},
//     {"nom": "numero_rccm", "valeur": "CD/KNG/RCCM/12345", "confiance": 0.90},
//     {"nom": "localite", "valeur": "Lubumbashi", "confiance": 0.85}
//   ],
//   "commentaire": "Document valide",
//   "confiance": "eleve"
// }`
//   }

//   // Pour ID NAT : le champ s'appelle "localite_rccm" sur le document
//   if (docInfo.key === 'id_nat') {
//     return `Tu es un expert en vérification de documents officiels congolais (RDC). 
// Analyse cette image de document "${docInfo.nom}" et EXTRAIS les valeurs des champs suivants :

// **Champs à extraire avec leurs valeurs exactes :**
// - nom_complet: [NOM COMPLET]
// - numero_national: [NUMERO NATIONAL]
// - localite_rccm: [LOCALITE RCCM - la ville de résidence RCCM indiquée sur la carte]

// ⚠️ IMPORTANT : 
// - localite_rccm est le champ "Localité RCCM" sur la carte d'identité nationale.
// - C'est la ville où le RCCM a été enregistré (ex: Lubumbashi, Kinshasa, Goma).
// - Extrais la valeur EXACTE telle qu'elle apparaît.
// - Si un champ n'est pas visible, mets une chaîne vide "".
// - Réponds UNIQUEMENT avec un objet JSON valide.
// - Format exact :

// {
//   "estValide": true,
//   "score": 85,
//   "champsTrouves": ["nom_complet", "numero_national", "localite_rccm"],
//   "champsManquants": [],
//   "champsExtraits": [
//     {"nom": "nom_complet", "valeur": "KABILA MUAMBA JOSEPH", "confiance": 0.95},
//     {"nom": "numero_national", "valeur": "123456789", "confiance": 0.90},
//     {"nom": "localite_rccm", "valeur": "Lubumbashi", "confiance": 0.85}
//   ],
//   "commentaire": "Document valide",
//   "confiance": "eleve"
// }`
//   }

//   // Pour les autres documents (attestation_fiscale, attestation_cnss)
//   return `Tu es un expert en vérification de documents officiels congolais (RDC). 
// Analyse cette image de document "${docInfo.nom}" et EXTRAIS les valeurs des champs suivants :

// **Champs à extraire avec leurs valeurs exactes :**
// ${docInfo.champsAVerifier.map(c => `- ${c}: [EXTRAIRE LA VALEUR EXACTE]`).join('\n')}

// ⚠️ IMPORTANT : 
// - Extrais les valeurs TELLES QU'ELLES APPARAISSENT sur le document.
// - Si un champ n'est pas visible, mets une chaîne vide "".
// - Réponds UNIQUEMENT avec un objet JSON valide.
// - Format exact :

// {
//   "estValide": true,
//   "score": 85,
//   "champsTrouves": ["numero_rccm", "raison_sociale"],
//   "champsManquants": [],
//   "champsExtraits": [
//     {"nom": "numero_rccm", "valeur": "12345", "confiance": 0.95},
//     {"nom": "raison_sociale", "valeur": "ENTREPRISE SARL", "confiance": 0.90}
//   ],
//   "commentaire": "Document valide",
//   "confiance": "eleve"
// }`
// }

// const cleanJsonResponse = (content: string): string => {
//   let jsonStr = content.trim()
  
//   jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '')
  
//   const firstBrace = jsonStr.indexOf('{')
//   const lastBrace = jsonStr.lastIndexOf('}')
  
//   if (firstBrace >= 0 && lastBrace > firstBrace) {
//     jsonStr = jsonStr.substring(firstBrace, lastBrace + 1)
//   } else {
//     throw new Error('Aucun objet JSON trouvé dans la réponse')
//   }
  
//   jsonStr = jsonStr
//     .replace(/[\u0000-\u001F]+/g, ' ')
//     .replace(/\n/g, ' ')
//     .replace(/\r/g, '')
//     .replace(/\t/g, ' ')
  
//   if (!jsonStr.startsWith('{')) {
//     throw new Error('La réponse ne commence pas par une accolade ouvrante')
//   }
  
//   return jsonStr
// }

// export const verifierDocumentAvecAI = async (
//   key: keyof DocumentsFPI,
//   file: File,
// ): Promise<VerificationResult> => {
//   const docInfo = DOCUMENTS_CONFIG.find(d => d.key === key)
  
//   if (!docInfo) {
//     return {
//       estValide: false,
//       score: 0,
//       champsTrouves: [],
//       champsManquants: [],
//       champsExtraits: [],
//       commentaire: 'Type de document non reconnu',
//       confiance: 'faible'
//     }
//   }

//   const validation = validateDocumentFile(file)
//   if (!validation.valid) {
//     return {
//       estValide: false,
//       score: 0,
//       champsTrouves: [],
//       champsManquants: docInfo.champsAVerifier,
//       champsExtraits: [],
//       commentaire: validation.message || 'Fichier invalide',
//       confiance: 'faible'
//     }
//   }

//   try {
//     const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
//     if (!apiKey) {
//       throw new Error('Clé API non configurée')
//     }

//     const base64Image = await fileToBase64(file)
//     const mimeType = file.type || 'image/jpeg'
//     const imageUrl = `data:${mimeType};base64,${base64Image}`
//     const prompt = buildVerificationPrompt(docInfo)

//     const controller = new AbortController()
//     const timeoutId = setTimeout(() => controller.abort(), 30000)

//     const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${apiKey}`,
//         'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
//         'X-Title': 'FPI Document Verification'
//       },
//       body: JSON.stringify({
//         model: 'google/gemini-2.5-flash-lite',
//         messages: [
//           {
//             role: 'user',
//             content: [
//               { type: 'text', text: prompt },
//               { type: 'image_url', image_url: { url: imageUrl } }
//             ]
//           }
//         ],
//         max_tokens: 800,
//         temperature: 0.1,
//         response_format: { type: "json_object" }
//       }),
//       signal: controller.signal
//     })

//     clearTimeout(timeoutId)

//     if (!response.ok) {
//       const errorText = await response.text()
//       throw new Error(`Erreur API (${response.status}): ${errorText}`)
//     }

//     const data = await response.json()
//     const content = data.choices?.[0]?.message?.content || ''
    
//     console.log('Réponse brute:', content)
    
//     let resultat: VerificationResult
    
//     try {
//       const jsonStr = cleanJsonResponse(content)
//       resultat = JSON.parse(jsonStr) as VerificationResult
//     } catch (parseError) {
//       console.error('Erreur de parsing JSON:', parseError)
//       console.error('Contenu reçu:', content)
      
//       return {
//         estValide: false,
//         score: 0,
//         champsTrouves: [],
//         champsManquants: docInfo.champsAVerifier,
//         champsExtraits: [],
//         commentaire: "Erreur lors de l'analyse du document. Format de réponse invalide.",
//         confiance: 'faible'
//       }
//     }

//     return {
//       estValide: resultat.estValide || false,
//       score: Math.min(100, Math.max(0, resultat.score || 0)),
//       champsTrouves: resultat.champsTrouves || [],
//       champsManquants: resultat.champsManquants || [],
//       champsExtraits: resultat.champsExtraits || [],
//       commentaire: resultat.commentaire || 'Analyse terminée',
//       confiance: resultat.confiance || 'moyen'
//     }

//   } catch (error: any) {
//     console.error('❌ Erreur vérification:', error)
    
//     if (error.name === 'AbortError') {
//       return {
//         estValide: false,
//         score: 0,
//         champsTrouves: [],
//         champsManquants: docInfo.champsAVerifier,
//         champsExtraits: [],
//         commentaire: 'La vérification a pris trop de temps. Veuillez réessayer.',
//         confiance: 'faible'
//       }
//     }
    
//     return {
//       estValide: false,
//       score: 0,
//       champsTrouves: [],
//       champsManquants: docInfo.champsAVerifier,
//       champsExtraits: [],
//       commentaire: 'Erreur lors de la vérification. Veuillez réessayer.',
//       confiance: 'faible'
//     }
//   }
// }

// // ============================================
// // FONCTIONS D'EXTRACTION POUR LES CROISEMENTS
// // ============================================

// /**
//  * Récupère la valeur d'un champ extrait par son nom
//  */
// export const getChampValeur = (resultat: VerificationResult | null, nomChamp: string): string => {
//   if (!resultat?.champsExtraits) return ''
//   const champ = resultat.champsExtraits.find(e => e.nom === nomChamp)
//   return champ?.valeur || ''
// }

// /**
//  * Reconstitue l'identité complète depuis les champs séparés de la carte d'électeur
//  * Carte d'électeur a : nom, postnom, prenom → on les concatène : "NOM POSTNOM PRENOM"
//  */
// export const reconstituerIdentiteCompletteDepuisCarte = (resultat: VerificationResult | null): string => {
//   const nom = getChampValeur(resultat, 'nom')
//   const postnom = getChampValeur(resultat, 'postnom')
//   const prenom = getChampValeur(resultat, 'prenom')
  
//   const parties = [nom, postnom, prenom].filter(p => p && p.trim().length > 0)
//   return parties.join(' ')
// }

// /**
//  * Récupère le nom_complet du RCCM
//  * RCCM a : nom_complet (un seul champ)
//  */
// export const getNomCompletRCCM = (resultat: VerificationResult | null): string => {
//   return getChampValeur(resultat, 'nom_complet')
// }

// /**
//  * Récupère la localite du RCCM
//  * RCCM a : localite
//  */
// export const getLocaliteRCCM = (resultat: VerificationResult | null): string => {
//   return getChampValeur(resultat, 'localite')
// }

// /**
//  * Récupère la localite_rccm de l'ID NAT
//  * ID NAT a : localite_rccm (le champ "Localité RCCM" sur la carte)
//  */
// export const getLocaliteRCCMFromIDNat = (resultat: VerificationResult | null): string => {
//   return getChampValeur(resultat, 'localite_rccm')
// }

// /**
//  * Récupère le numero_national de l'ID NAT
//  */
// export const getNumeroNational = (resultat: VerificationResult | null): string => {
//   return getChampValeur(resultat, 'numero_national')
// }

// /**
//  * Récupère le numero_electeur de la carte d'électeur
//  */
// export const getNumeroElecteur = (resultat: VerificationResult | null): string => {
//   return getChampValeur(resultat, 'numero_electeur')
// }

// /**
//  * Récupère le numero_rccm d'un document
//  */
// export const getNumeroRCCM = (resultat: VerificationResult | null): string => {
//   return getChampValeur(resultat, 'numero_rccm')
// }

// export const verifierTousLesDocuments = async (
//   documents: DocumentsFPI
// ): Promise<Record<string, VerificationResult>> => {
//   const resultats: Record<string, VerificationResult> = {}
  
//   const docsConfig = [
//     { key: 'carte_electeur' as keyof DocumentsFPI },
//     { key: 'rccm' as keyof DocumentsFPI },
//     { key: 'id_nat' as keyof DocumentsFPI },
//     { key: 'attestation_fiscale' as keyof DocumentsFPI },
//     { key: 'attestation_cnss' as keyof DocumentsFPI }
//   ]
  
//   for (const doc of docsConfig) {
//     const file = documents[doc.key]
//     if (file) {
//       try {
//         const resultat = await verifierDocumentAvecAI(doc.key, file)
//         resultats[doc.key] = resultat
//       } catch (error) {
//         console.error(`Erreur lors de la vérification du document ${doc.key}:`, error)
//         resultats[doc.key] = {
//           estValide: false,
//           score: 0,
//           champsTrouves: [],
//           champsManquants: [],
//           champsExtraits: [],
//           commentaire: 'Erreur lors de la vérification de ce document.',
//           confiance: 'faible'
//         }
//       }
//     }
//   }
  
//   return resultats
// }

// documentVerification.ts - VERSION CORRIGÉE
import { DocumentsFPI } from '@/types/fpi'

type ChampExtrait = {
  nom: string
  valeur: string
  confiance: number
}

export type VerificationResult = {
  estValide: boolean
  score: number
  champsTrouves: string[]
  champsManquants: string[]
  champsExtraits: ChampExtrait[]
  commentaire: string
  confiance: 'eleve' | 'moyen' | 'faible'
}

type DocumentConfig = {
  key: keyof DocumentsFPI
  nom: string
  champsAVerifier: string[]
  motsCles: string[]
}

const DOCUMENTS_CONFIG: DocumentConfig[] = [
  {
    key: 'carte_electeur',
    nom: "Carte d'électeur",
    champsAVerifier: ['nom', 'postnom', 'prenom', 'numero_electeur', 'date_naissance'],
    motsCles: ['carte', 'électeur', 'CENI'],
  },
  {
    key: 'rccm',
    nom: 'RCCM',
    champsAVerifier: ['nom_complet', 'numero_rccm', 'localite'],
    motsCles: ['RCCM', 'registre du commerce'],
  },
  {
    key: 'id_nat',
    nom: 'ID NAT',
    champsAVerifier: ['nom_complet', 'numero_national', 'localite_rccm'],
    motsCles: ['carte identité', 'nationale', 'ID'],
  },
  {
    key: 'attestation_fiscale',
    nom: 'Attestation fiscale',
    champsAVerifier: ['numero_rccm', 'raison_sociale'],
    motsCles: ['attestation', 'fiscale', 'DGI'],
  },
  {
    key: 'attestation_cnss',
    nom: 'Attestation CNSS',
    champsAVerifier: ['raison_sociale', 'numero_affiliation'],
    motsCles: ['CNSS', 'sécurité sociale'],
  },
]

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
  })
}

export const validateDocumentFile = (file: File): { valid: boolean; message?: string } => {
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, message: 'Le fichier est trop volumineux. Maximum 10MB.' }
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: 'Format non supporté. Utilisez JPG, PNG ou PDF.' }
  }

  return { valid: true }
}

const buildVerificationPrompt = (docInfo: DocumentConfig): string => {
  // Pour la carte d'électeur : nom, postnom, prenom SEPARES
  if (docInfo.key === 'carte_electeur') {
    return `Tu es un expert en vérification de documents officiels congolais (RDC). 
Analyse cette image de document "${docInfo.nom}" et EXTRAIS les valeurs des champs suivants :

**Champs à extraire avec leurs valeurs exactes :**
- nom: [NOM DE FAMILLE uniquement - ex: KABILA]
- postnom: [POSTNOM uniquement - ex: MUAMBA]
- prenom: [PRENOM uniquement - ex: JOSEPH]
- numero_electeur: [NUMERO]
- date_naissance: [DATE]

⚠️ IMPORTANT : 
- Extrais nom, postnom, prenom SEPAREMENT, pas en un seul champ.
- Ne mélange pas les trois dans un seul champ.
- Si un champ n'est pas visible, mets une chaîne vide "".
- Réponds UNIQUEMENT avec un objet JSON valide.
- Format exact :

{
  "estValide": true,
  "score": 85,
  "champsTrouves": ["nom", "postnom", "prenom", "numero_electeur"],
  "champsManquants": ["date_naissance"],
  "champsExtraits": [
    {"nom": "nom", "valeur": "KABILA", "confiance": 0.95},
    {"nom": "postnom", "valeur": "MUAMBA", "confiance": 0.95},
    {"nom": "prenom", "valeur": "JOSEPH", "confiance": 0.90},
    {"nom": "numero_electeur", "valeur": "12345678", "confiance": 0.90}
  ],
  "commentaire": "Document valide, tous les champs principaux extraits avec succès",
  "confiance": "eleve"
}`
  }

  // Pour RCCM : nom_complet et localite
  if (docInfo.key === 'rccm') {
    return `Tu es un expert en vérification de documents officiels congolais (RDC). 
Analyse cette image de document "${docInfo.nom}" et EXTRAIS les valeurs des champs suivants :

**Champs à extraire avec leurs valeurs exactes :**
- nom_complet: [NOM COMPLET - ex: KABILA MUAMBA JOSEPH]
- numero_rccm: [NUMERO RCCM]
- localite: [LOCALITE / VILLE DU SIEGE - ex: Lubumbashi, Kinshasa]

⚠️ IMPORTANT : 
- nom_complet contient le nom complet en un seul champ.
- localite est la ville/localité du siège social (pas l'adresse complète).
- Extrais les valeurs EXACTEMENT comme elles apparaissent sur le document.
- Si un champ n'est pas visible, mets une chaîne vide "".
- Réponds UNIQUEMENT avec un objet JSON valide.
- Format exact :

{
  "estValide": true,
  "score": 85,
  "champsTrouves": ["nom_complet", "numero_rccm", "localite"],
  "champsManquants": [],
  "champsExtraits": [
    {"nom": "nom_complet", "valeur": "KABILA MUAMBA JOSEPH", "confiance": 0.95},
    {"nom": "numero_rccm", "valeur": "CD/KNG/RCCM/12345", "confiance": 0.90},
    {"nom": "localite", "valeur": "Lubumbashi", "confiance": 0.85}
  ],
  "commentaire": "Document valide, toutes les informations extraites",
  "confiance": "eleve"
}`
  }

  // Pour ID NAT : le champ s'appelle "localite_rccm" sur le document
  if (docInfo.key === 'id_nat') {
    return `Tu es un expert en vérification de documents officiels congolais (RDC). 
Analyse cette image de document "${docInfo.nom}" et EXTRAIS les valeurs des champs suivants :

**Champs à extraire avec leurs valeurs exactes :**
- nom_complet: [NOM COMPLET]
- numero_national: [NUMERO NATIONAL]
- localite_rccm: [LOCALITE RCCM - la ville de résidence RCCM indiquée sur la carte]

⚠️ IMPORTANT : 
- localite_rccm est le champ "Localité RCCM" sur la carte d'identité nationale.
- C'est la ville où le RCCM a été enregistré (ex: Lubumbashi, Kinshasa, Goma).
- Extrais la valeur EXACTE telle qu'elle apparaît.
- Si un champ n'est pas visible, mets une chaîne vide "".
- Réponds UNIQUEMENT avec un objet JSON valide.
- Format exact :

{
  "estValide": true,
  "score": 85,
  "champsTrouves": ["nom_complet", "numero_national", "localite_rccm"],
  "champsManquants": [],
  "champsExtraits": [
    {"nom": "nom_complet", "valeur": "KABILA MUAMBA JOSEPH", "confiance": 0.95},
    {"nom": "numero_national", "valeur": "123456789", "confiance": 0.90},
    {"nom": "localite_rccm", "valeur": "Lubumbashi", "confiance": 0.85}
  ],
  "commentaire": "Document valide, toutes les informations extraites",
  "confiance": "eleve"
}`
  }

  // Pour les autres documents (attestation_fiscale, attestation_cnss)
  return `Tu es un expert en vérification de documents officiels congolais (RDC). 
Analyse cette image de document "${docInfo.nom}" et EXTRAIS les valeurs des champs suivants :

**Champs à extraire avec leurs valeurs exactes :**
${docInfo.champsAVerifier.map(c => `- ${c}: [EXTRAIRE LA VALEUR EXACTE]`).join('\n')}

⚠️ IMPORTANT : 
- Extrais les valeurs TELLES QU'ELLES APPARAISSENT sur le document.
- Si un champ n'est pas visible, mets une chaîne vide "".
- Réponds UNIQUEMENT avec un objet JSON valide.
- Format exact :

{
  "estValide": true,
  "score": 85,
  "champsTrouves": ${JSON.stringify(docInfo.champsAVerifier)},
  "champsManquants": [],
  "champsExtraits": [
    ${docInfo.champsAVerifier.map(c => `{"nom": "${c}", "valeur": "EXEMPLE", "confiance": 0.90}`).join(',\n    ')}
  ],
  "commentaire": "Document valide",
  "confiance": "eleve"
}`
}

// NOUVEAU : Fonction de validation plus robuste pour le JSON reçu
// documentVerification.ts - remplacer TOUTE la fonction validateVerificationResult

const validateVerificationResult = (data: any, docInfo: DocumentConfig): VerificationResult | null => {
  // Vérifier les champs obligatoires
  if (typeof data.estValide !== 'boolean') return null
  if (typeof data.score !== 'number') return null
  if (!Array.isArray(data.champsTrouves)) return null
  if (!Array.isArray(data.champsManquants)) return null
  if (!Array.isArray(data.champsExtraits)) return null
  if (typeof data.commentaire !== 'string') return null
  if (!['eleve', 'moyen', 'faible'].includes(data.confiance)) return null

  // Normaliser les champs - avec typage explicite
  const champsExtraits: ChampExtrait[] = data.champsExtraits
    .filter((c: any) => c && typeof c.nom === 'string')
    .map((c: any) => ({
      nom: c.nom as string,
      valeur: typeof c.valeur === 'string' ? (c.valeur as string).trim() : '',
      confiance: typeof c.confiance === 'number' ? c.confiance as number : 0
    }))

  const champsConfig: string[] = docInfo.champsAVerifier
  
  // ============================================
  // CORRECTION AGRESSIVE : Recalcul complet du score
  // ============================================
  
  // 1. Compter les champs avec une VRAIE valeur (non vide)
  const champsAvecValeur: ChampExtrait[] = champsExtraits.filter((c: ChampExtrait) => c.valeur.length > 0)
  const champsSansValeur: ChampExtrait[] = champsExtraits.filter((c: ChampExtrait) => c.valeur.length === 0)
  
  // 2. Trouver les champs configurés qui n'ont pas été extraits du tout
  const nomsChampsExtraits: string[] = champsExtraits.map((c: ChampExtrait) => c.nom)
  const champsNonExtraits: string[] = champsConfig.filter((c: string) => !nomsChampsExtraits.includes(c))
  
  // 3. Fusionner tous les champs manquants
  const tousChampsManquants: string[] = [
    ...new Set([
      ...(data.champsManquants || []),
      ...champsSansValeur.map((c: ChampExtrait) => c.nom),
      ...champsNonExtraits
    ])
  ]
  
  // 4. Ratio d'extraction RÉEL
  const nombreChampsAvecValeur: number = champsAvecValeur.length
  const nombreTotalChamps: number = champsConfig.length
  const ratioExtraction: number = nombreChampsAvecValeur / nombreTotalChamps
  
  // ============================================
  // RECALCUL STRICT DU SCORE
  // ============================================
  let scoreRecalcule: number
  
  if (nombreChampsAvecValeur === 0) {
    // RIEN extrait → score 0-10
    scoreRecalcule = Math.min(data.score, 10)
  } else if (ratioExtraction <= 0.25) {
    // 25% ou moins → max 25
    scoreRecalcule = Math.min(data.score, 25)
  } else if (ratioExtraction <= 0.5) {
    // 50% ou moins → max 45
    scoreRecalcule = Math.min(data.score, 45)
  } else if (ratioExtraction <= 0.75) {
    // 75% ou moins → max 65
    scoreRecalcule = Math.min(data.score, 65)
  } else if (ratioExtraction < 1) {
    // Moins de 100% → max 85
    scoreRecalcule = Math.min(data.score, 85)
  } else {
    // 100% → garder le score de l'IA (max 100)
    scoreRecalcule = data.score
  }
  
  // Arrondir
  scoreRecalcule = Math.round(Math.min(100, Math.max(0, scoreRecalcule)))
  
  // ============================================
  // RECALCUL DE LA VALIDITÉ
  // ============================================
  // Un document n'est valide QUE si :
  // - Au moins 50% des champs ont une valeur
  // - ET le score recalculé >= 50
  // - ET l'IA n'a pas explicitement dit false
  const estValide: boolean = ratioExtraction >= 0.5 && 
                    scoreRecalcule >= 50 && 
                    data.estValide !== false
  
  // ============================================
  // RECALCUL DE LA CONFIANCE
  // ============================================
  let confianceCalculee: 'eleve' | 'moyen' | 'faible'
  
  if (nombreChampsAvecValeur === 0 || ratioExtraction < 0.5) {
    confianceCalculee = 'faible'
  } else if (ratioExtraction < 0.75 || scoreRecalcule < 65) {
    confianceCalculee = 'moyen'
  } else {
    confianceCalculee = 'eleve'
  }
  
  // ============================================
  // RECALCUL DU COMMENTAIRE
  // ============================================
  let commentaireFinal: string = data.commentaire || ''
  
  if (nombreChampsAvecValeur === 0 && commentaireFinal.includes('valide')) {
    commentaireFinal = `⚠️ Aucun champ extrait. ${commentaireFinal}`
  } else if (ratioExtraction < 0.5 && commentaireFinal.includes('valide')) {
    commentaireFinal = `⚠️ Seulement ${nombreChampsAvecValeur}/${nombreTotalChamps} champs extraits. ${commentaireFinal}`
  }

  console.log(`📊 Validation ${docInfo.nom}:`, {
    scoreOriginal: data.score,
    scoreRecalcule,
    ratioExtraction: `${Math.round(ratioExtraction * 100)}%`,
    champsAvecValeur: nombreChampsAvecValeur,
    champsManquants: tousChampsManquants,
    estValide,
    confiance: confianceCalculee
  })

  return {
    estValide,
    score: scoreRecalcule,
    champsTrouves: champsAvecValeur.map((c: ChampExtrait) => c.nom),
    champsManquants: tousChampsManquants,
    champsExtraits,
    commentaire: commentaireFinal,
    confiance: confianceCalculee
  }
}
const cleanJsonResponse = (content: string): string => {
  let jsonStr = content.trim()
  
  // Supprimer les marqueurs de code markdown
  jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '')
  
  // Trouver le premier et dernier objet JSON
  const firstBrace = jsonStr.indexOf('{')
  const lastBrace = jsonStr.lastIndexOf('}')
  
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    jsonStr = jsonStr.substring(firstBrace, lastBrace + 1)
  } else {
    throw new Error('Aucun objet JSON trouvé dans la réponse')
  }
  
  // Nettoyer les caractères de contrôle
  jsonStr = jsonStr
    .replace(/[\u0000-\u001F]+/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
  
  if (!jsonStr.startsWith('{')) {
    throw new Error('La réponse ne commence pas par une accolade ouvrante')
  }
  
  return jsonStr
}

export const verifierDocumentAvecAI = async (
  key: keyof DocumentsFPI,
  file: File,
): Promise<VerificationResult> => {
  const docInfo = DOCUMENTS_CONFIG.find(d => d.key === key)
  
  if (!docInfo) {
    return {
      estValide: false,
      score: 0,
      champsTrouves: [],
      champsManquants: [],
      champsExtraits: [],
      commentaire: 'Type de document non reconnu',
      confiance: 'faible'
    }
  }

  const validation = validateDocumentFile(file)
  if (!validation.valid) {
    return {
      estValide: false,
      score: 0,
      champsTrouves: [],
      champsManquants: docInfo.champsAVerifier,
      champsExtraits: [],
      commentaire: validation.message || 'Fichier invalide',
      confiance: 'faible'
    }
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
    if (!apiKey) {
      // NOUVEAU : Fallback pour le développement
      console.warn('⚠️ Clé API non configurée, utilisation du mode simulation')
      return simulerVerificationDocument(docInfo)
    }

    const base64Image = await fileToBase64(file)
    const mimeType = file.type || 'image/jpeg'
    const imageUrl = `data:${mimeType};base64,${base64Image}`
    const prompt = buildVerificationPrompt(docInfo)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'FPI Document Verification'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 800,
        temperature: 0.1,
        response_format: { type: "json_object" }
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Erreur API (${response.status}):`, errorText)
      throw new Error(`Erreur API (${response.status})`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''
    
    console.log('📄 Réponse brute pour', docInfo.nom, ':', content.substring(0, 200) + '...')
    
    let resultat: VerificationResult
    
    try {
      const jsonStr = cleanJsonResponse(content)
      const parsed = JSON.parse(jsonStr)
      
      // NOUVEAU : Valider et normaliser le résultat
      const validated = validateVerificationResult(parsed, docInfo)
      
      if (!validated) {
        throw new Error('Format de réponse invalide après parsing')
      }
      
      resultat = validated
    } catch (parseError) {
      console.error('❌ Erreur de parsing JSON:', parseError)
      console.error('Contenu reçu:', content)
      
      return {
        estValide: false,
        score: 0,
        champsTrouves: [],
        champsManquants: docInfo.champsAVerifier,
        champsExtraits: [],
        commentaire: "Erreur lors de l'analyse du document. Format de réponse invalide.",
        confiance: 'faible'
      }
    }

    // NOUVEAU : Ajuster la confiance en fonction du nombre de champs extraits
    const ratioExtraction = resultat.champsExtraits.length / docInfo.champsAVerifier.length
    if (resultat.confiance === 'eleve' && ratioExtraction < 0.5) {
      resultat.confiance = 'moyen'
    }

    console.log('✅ Résultat vérification', docInfo.nom, ':', {
      score: resultat.score,
      confiance: resultat.confiance,
      champsTrouves: resultat.champsTrouves.length,
      champsManquants: resultat.champsManquants.length
    })

    return resultat

  } catch (error: any) {
    console.error('❌ Erreur vérification:', error)
    
    if (error.name === 'AbortError') {
      return {
        estValide: false,
        score: 0,
        champsTrouves: [],
        champsManquants: docInfo.champsAVerifier,
        champsExtraits: [],
        commentaire: 'La vérification a pris trop de temps. Veuillez réessayer.',
        confiance: 'faible'
      }
    }
    
    return {
      estValide: false,
      score: 0,
      champsTrouves: [],
      champsManquants: docInfo.champsAVerifier,
      champsExtraits: [],
      commentaire: `Erreur lors de la vérification: ${error.message || 'Erreur inconnue'}`,
      confiance: 'faible'
    }
  }
}

// NOUVEAU : Fonction de simulation pour le développement
const simulerVerificationDocument = (docInfo: DocumentConfig): VerificationResult => {
  console.log('🔧 Simulation de vérification pour:', docInfo.nom)
  
  const champsExtraits = docInfo.champsAVerifier.map(champ => ({
    nom: champ,
    valeur: `SIMULATION_${champ.toUpperCase()}`,
    confiance: 0.85
  }))
  
  return {
    estValide: true,
    score: 75,
    champsTrouves: docInfo.champsAVerifier,
    champsManquants: [],
    champsExtraits,
    commentaire: '⚠️ Mode simulation - Document analysé localement. Configurez la clé API pour la vérification réelle.',
    confiance: 'moyen'
  }
}

// ============================================
// FONCTIONS D'EXTRACTION POUR LES CROISEMENTS
// ============================================

export const getChampValeur = (resultat: VerificationResult | null, nomChamp: string): string => {
  if (!resultat?.champsExtraits) return ''
  const champ = resultat.champsExtraits.find(e => e.nom === nomChamp)
  return champ?.valeur || ''
}

export const reconstituerIdentiteCompletteDepuisCarte = (resultat: VerificationResult | null): string => {
  const nom = getChampValeur(resultat, 'nom')
  const postnom = getChampValeur(resultat, 'postnom')
  const prenom = getChampValeur(resultat, 'prenom')
  
  const parties = [nom, postnom, prenom].filter(p => p && p.trim().length > 0)
  return parties.join(' ')
}

export const getNomCompletRCCM = (resultat: VerificationResult | null): string => {
  return getChampValeur(resultat, 'nom_complet')
}

export const getLocaliteRCCM = (resultat: VerificationResult | null): string => {
  return getChampValeur(resultat, 'localite')
}

export const getLocaliteRCCMFromIDNat = (resultat: VerificationResult | null): string => {
  return getChampValeur(resultat, 'localite_rccm')
}

export const getNumeroNational = (resultat: VerificationResult | null): string => {
  return getChampValeur(resultat, 'numero_national')
}

export const getNumeroElecteur = (resultat: VerificationResult | null): string => {
  return getChampValeur(resultat, 'numero_electeur')
}

export const getNumeroRCCM = (resultat: VerificationResult | null): string => {
  return getChampValeur(resultat, 'numero_rccm')
}

export const verifierTousLesDocuments = async (
  documents: DocumentsFPI
): Promise<Record<string, VerificationResult>> => {
  const resultats: Record<string, VerificationResult> = {}
  
  const docsConfig: { key: keyof DocumentsFPI }[] = [
    { key: 'carte_electeur' },
    { key: 'rccm' },
    { key: 'id_nat' },
    { key: 'attestation_fiscale' },
    { key: 'attestation_cnss' }
  ]
  
  for (const doc of docsConfig) {
    const file = documents[doc.key]
    if (file) {
      try {
        const resultat = await verifierDocumentAvecAI(doc.key, file)
        resultats[doc.key] = resultat
      } catch (error) {
        console.error(`Erreur lors de la vérification du document ${doc.key}:`, error)
        resultats[doc.key] = {
          estValide: false,
          score: 0,
          champsTrouves: [],
          champsManquants: [],
          champsExtraits: [],
          commentaire: 'Erreur lors de la vérification de ce document.',
          confiance: 'faible'
        }
      }
    }
  }
  
  return resultats
}