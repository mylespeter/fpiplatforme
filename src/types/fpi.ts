export type PromoteurInfo = {
  nom_complet: string
  sexe: 'M' | 'F'
  numero_telephone: string
  adresse_email: string
  adresse_physique: string
  province: string
  ville: string
  profession: string
}

export type ProjetInfo = {
  nom_projet: string
  secteur_activite: string
  description_projet: string
  localisation_projet: string
  cout_total: number
  montant_sollicite: number
  nombre_emplois: number
  duree_realisation: string
  objectifs_projet: string
}

export type InfoFinanciere = {
  apport_personnel: number
  source_financement: string
  chiffre_affaires_previsionnel: number
  benefice_previsionnel: number
  duree_remboursement: string
  garanties_proposees: string
  banque_partenaire: string
  numero_compte_bancaire: string
}

export type DocumentsFPI = {
  carte_electeur?: File
  rccm?: File
  id_nat?: File
  attestation_fiscale?: File
  attestation_cnss?: File
}

export type FormulaireFPI = {
  promoteur: PromoteurInfo
  projet: ProjetInfo
  finance: InfoFinanciere
  documents: DocumentsFPI
}

export const PROVINCES_RDC = [
  'Kinshasa',
  'Kongo Central',
  'Kwango',
  'Kwilu',
  'Mai-Ndombe',
  'Kasaï',
  'Kasaï-Central',
  'Kasaï-Oriental',
  'Lomami',
  'Sankuru',
  'Maniema',
  'Sud-Kivu',
  'Nord-Kivu',
  'Ituri',
  'Haut-Uele',
  'Tshopo',
  'Bas-Uele',
  'Nord-Ubangi',
  'Mongala',
  'Sud-Ubangi',
  'Équateur',
  'Tshuapa',
  'Tanganyika',
  'Haut-Lomami',
  'Lualaba',
  'Haut-Katanga'
]

export const SECTEURS_ACTIVITE = [
  'Agriculture',
  'Élevage',
  'Pêche',
  'Industrie manufacturière',
  'Agroalimentaire',
  'Mines',
  'Énergie',
  'Construction',
  'Transport',
  'Télécommunications',
  'Commerce',
  'Santé',
  'Éducation',
  'Technologie',
  'Environnement',
  'Artisanat',
  'Tourisme',
  'Services financiers',
  'Autre'
]

export const BANQUES_PARTENAIRES = [
  'Rawbank',
  'BCDC',
  'TMB',
  'Equity BCDC',
  'Afriland',
  'Sofibanque',
  'FBN Bank',
  'Access Bank',
  'UBA',
  'Standard Bank',
  'Autre'
]


// types/fpi.ts - Ajouter ce type
export type EntiteInfo = {
  nom_entite: string
  num_national: string
  numero_rccm: string
  siege_social: string
}