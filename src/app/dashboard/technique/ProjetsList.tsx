



// 'use client'

// import { Eye, Shield, User, Calendar, FileText, Loader2, RefreshCw } from 'lucide-react'

// // ⚠️ IMPORTANT : Ce type doit correspondre EXACTEMENT à celui dans ServiceTechniquePage.tsx
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
//   numero_rccm: string | null
//   secteur_activite: string | null
//   cout_total: number | null
//   apport_personnel: number | null
//   duree_remboursement: string | null
//   banque_partenaire: string | null
//   objectifs_projet: string | null
//   localisation_projet: string | null
//   nombre_emplois: number | null
//   promoteur_id: number | null
// }

// interface ProjetsListProps {
//   projets: ProjetATraiter[]
//   onViewDetail: (projet: ProjetATraiter) => void
//   onStartConsultation: (projet: ProjetATraiter) => void
//   onReconsulter?: (projet: ProjetATraiter) => Promise<void>  // ← Ajout du type Promise
//   formatDate: (date: string) => string
//   formatMontant: (montant: number) => string
//   consultingId: number | null
// }

// export default function ProjetsList({ 
//   projets, 
//   onViewDetail, 
//   onStartConsultation, 
//   onReconsulter,
//   formatDate, 
//   formatMontant,
//   consultingId
// }: ProjetsListProps) {
//   if (projets.length === 0) {
//     return (
//       <div className="text-center py-16 bg-white rounded-xl">
//         <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
//         <p className="text-gray-500">Aucun dossier trouvé</p>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-2">
//       {projets.map((projet) => {
//         const isLoading = consultingId === projet.id
//         const isEnComite = projet.etape === 'comité_crédit'
//         const aUnRapport = projet.rapport_id !== null
        
//         return (
//           <div key={projet.id} className="bg- bg-white rounded-x border-b p-4 transition-all">
//             <div className="flex items-start justify-between gap-4">
//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center gap-2 mb-1 flex-wrap">
//                   <h3 className="text-sm font-semibold text-gray-900">{projet.nom_projet}</h3>
                  
//                   <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
//                     projet.etape === 'analyse_tech' ? 'bg-purple-100 text-purple-700' :
//                     projet.etape === 'comité_crédit' ? 'bg-green-100 text-green-700' :
//                     'bg-blue-100 text-blue-700'
//                   }`}>
//                     {projet.etape === 'analyse_tech' ? '🔧 Analyse technique' :
//                      projet.etape === 'comité_crédit' ? '✅ Comité crédit' : 
//                      projet.etape}
//                   </span>
                  
//                   {projet.rapport_decision && (
//                     <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
//                       projet.rapport_decision === 'favorable' ? 'bg-green-100 text-green-700' : 
//                       projet.rapport_decision === 'defavorable' ? 'bg-red-100 text-red-700' :
//                       'bg-orange-100 text-orange-700'
//                     }`}>
//                       {projet.rapport_decision === 'favorable' ? '✅ Favorable' : 
//                        projet.rapport_decision === 'defavorable' ? '❌ Défavorable' : '⏸️ Réservé'}
//                     </span>
//                   )}
//                 </div>
                
//                 <div className="flex items-center gap-3 text-xs text-gray-500">
//                   <span className="flex items-center gap-1">
//                     <User className="h-3 w-3" /> {projet.promoteur_nom_complet}
//                   </span>
//                   <span className="flex items-center gap-1">
//                     <Calendar className="h-3 w-3" /> {formatDate(projet.created_at)}
//                   </span>
//                   {projet.montant_sollicite && (
//                     <span className="font-semibold">{formatMontant(projet.montant_sollicite)}</span>
//                   )}
//                 </div>
//               </div>

//               <div className="flex items-center gap-2 flex-shrink-0">
//                 {/* Bouton Détail */}
//                 <button
//                   onClick={() => onViewDetail(projet)}
//                   className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-1 transition-colors"
//                 >
//                   <Eye className="h-3 w-3" /> Détail
//                 </button>
                
//                 {/* Bouton Consulter / Modifier (pour projets non en comité) */}
//                 {!isEnComite && (
//                   <button
//                     onClick={() => onStartConsultation(projet)}
//                     disabled={isLoading}
//                     className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {isLoading ? (
//                       <>
//                         <Loader2 className="h-3 w-3 animate-spin" />
//                         Chargement...
//                       </>
//                     ) : (
//                       <>
//                         <Shield className="h-3 w-3" />
//                         {aUnRapport ? 'Modifier' : 'Consulter'}
//                       </>
//                     )}
//                   </button>
//                 )}
                
//                 {/* Bouton Reconsulter (pour projets en comité avec rapport) */}
//                 {isEnComite && aUnRapport && onReconsulter && (
//                   <button
//                     onClick={() => onReconsulter(projet)}
//                     className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 transition-colors"
//                   >
//                     <RefreshCw className="h-3 w-3" />
//                     Reconsulter
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         )
//       })}
//     </div>
//   )
// }

'use client'

import { Eye, Shield, User, Calendar, FileText, Loader2, RefreshCw } from 'lucide-react'

// ⚠️ IMPORTANT : Ce type doit correspondre EXACTEMENT à celui dans ServiceTechniquePage.tsx
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
}

interface ProjetsListProps {
  projets: ProjetATraiter[]
  onViewDetail: (projet: ProjetATraiter) => void
  onStartConsultation: (projet: ProjetATraiter) => void
  onReconsulter?: (projet: ProjetATraiter) => Promise<void>
  formatDate: (date: string) => string
  formatMontant: (montant: number) => string
  consultingId: number | null
}

export default function ProjetsList({ 
  projets, 
  onViewDetail, 
  onStartConsultation, 
  onReconsulter,
  formatDate, 
  formatMontant,
  consultingId
}: ProjetsListProps) {
  if (projets.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl">
        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">Aucun dossier trouvé</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {projets.map((projet) => {
        const isLoading = consultingId === projet.id
        const isEnComite = projet.etape === 'comité_crédit'
        const aUnRapport = projet.rapport_id !== null
        
        // Vérifier si le financement est approuvé ou rejeté
        const isFinancementApprouve = projet.etape === 'financement_approuve'
        const isFinancementRejete = projet.etape === 'financement_rejete'
        const isDecisionFinale = isFinancementApprouve || isFinancementRejete
        
        return (
          <div key={projet.id} className="bg-white  border p-4 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-sm font-semibold text-gray-900">{projet.nom_projet}</h3>
                  
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    projet.etape === 'analyse_tech' ? 'bg-purple-100 text-purple-700' :
                    projet.etape === 'comité_crédit' ? 'bg-green-100 text-green-700' :
                    isFinancementApprouve ? 'bg-emerald-100 text-emerald-700' :
                    isFinancementRejete ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {projet.etape === 'analyse_tech' ? 'Analyse technique' :
                     projet.etape === 'comité_crédit' ? 'Comité crédit' :
                     isFinancementApprouve ? 'Financement approuvé' :
                     isFinancementRejete ? 'Financement rejeté' : 
                     projet.etape}
                  </span>
                  
                  {projet.rapport_decision && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      projet.rapport_decision === 'favorable' ? 'bg-green-100 text-green-700' : 
                      projet.rapport_decision === 'defavorable' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {projet.rapport_decision === 'favorable' ? 'Favorable' : 
                       projet.rapport_decision === 'defavorable' ? 'Défavorable' : 'Réservé'}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" /> {projet.promoteur_nom_complet}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {formatDate(projet.created_at)}
                  </span>
                  {projet.montant_sollicite && (
                    <span className="font-semibold">{formatMontant(projet.montant_sollicite)}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Bouton Détail - toujours visible */}
                <button
                  onClick={() => onViewDetail(projet)}
                  className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-1 transition-colors"
                >
                  <Eye className="h-3 w-3" /> Détail
                </button>
                
                {/* Bouton Consulter / Modifier - caché si financement approuvé ou rejeté */}
                {!isEnComite && !isDecisionFinale && (
                  <button
                    onClick={() => onStartConsultation(projet)}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Chargement...
                      </>
                    ) : (
                      <>
                        <Shield className="h-3 w-3" />
                        {aUnRapport ? 'Modifier' : 'Consulter'}
                      </>
                    )}
                  </button>
                )}
                
                {/* Bouton Reconsulter - caché si financement approuvé ou rejeté */}
                {isEnComite && aUnRapport && onReconsulter && !isDecisionFinale && (
                  <button
                    onClick={() => onReconsulter(projet)}
                    className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Reconsulter
                  </button>
                )}
                
                {/* Message pour les décisions finales */}
                {isDecisionFinale && (
                  <span className={`px-3 py-1.5 text-xs rounded-lg font-medium ${
                    isFinancementApprouve ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {isFinancementApprouve ? 'Dossier clôturé' : 'Dossier rejeté'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}