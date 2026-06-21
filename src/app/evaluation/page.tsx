
// 'use client'

// import { useState, useEffect } from 'react'
// import { useAuth } from '@/context/AuthContext'
// import { supabase } from '@/lib/supabase'
// import { 
//   Search, FileText, CheckCircle, 
//   Clock, Loader2, Eye, AlertCircle, Send, User, 
//   Calendar, Download, TrendingUp,
//   Banknote, Briefcase, ThumbsUp, ThumbsDown, Minus,
//   FileCheck, ShieldCheck
// } from 'lucide-react'
// import Image from 'next/image'

// // Types
// type ProjetPourComite = {
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
// }

// type RapportAnalyse = {
//   id: number
//   projet_id: number
//   technicien_id: number  // BIGSERIAL -> number
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

// export default function ComiteCreditPage() {
//   const { user } = useAuth()

//   // États
//   const [projets, setProjets] = useState<ProjetPourComite[]>([])
//   const [loading, setLoading] = useState(true)
//   const [searchTerm, setSearchTerm] = useState('')
  
//   const [showDetailModal, setShowDetailModal] = useState(false)
//   const [selectedProjet, setSelectedProjet] = useState<ProjetPourComite | null>(null)
//   const [rapport, setRapport] = useState<RapportAnalyse | null>(null)
//   const [loadingRapport, setLoadingRapport] = useState(false)
  
//   const [showDecisionModal, setShowDecisionModal] = useState(false)
//   const [decisionFinale, setDecisionFinale] = useState('')
//   const [montantApprouve, setMontantApprouve] = useState<number | null>(null)
//   const [conditions, setConditions] = useState('')
//   const [commentaireComite, setCommentaireComite] = useState('')
//   const [dateReunion, setDateReunion] = useState('')
  
//   const [submitting, setSubmitting] = useState(false)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')

//   // Charger les projets en attente du comité
//   useEffect(() => {
//     if (user) {
//       chargerProjetsComite()
//     }
//   }, [user])

//   const chargerProjetsComite = async () => {
//     setLoading(true)
    
//     // Récupérer les projets à l'étape "comité_crédit"
//     const { data: projetsData, error: projetsError } = await supabase
//       .from('projets_fpi')
//       .select('*')
//       .eq('etape', 'comité_crédit')
//       .order('created_at', { ascending: false })

//     if (projetsError) {
//       console.error('Erreur chargement projets:', projetsError)
//       setLoading(false)
//       return
//     }

//     // Récupérer les rapports associés
//     if (projetsData && projetsData.length > 0) {
//       const projetIds = projetsData.map(p => p.id)
//       const { data: rapportsData, error: rapportsError } = await supabase
//         .from('rapport_analyse')
//         .select('*')
//         .in('projet_id', projetIds)

//       if (rapportsError) {
//         console.error('Erreur chargement rapports:', rapportsError)
//       }

//       const projetsAvecRapport = projetsData.map(projet => {
//         const rapport = (rapportsData || []).find(r => r.projet_id === projet.id)
//         return {
//           ...projet,
//           rapport_id: rapport?.id || null,
//           rapport_statut: rapport?.statut || null,
//           rapport_decision: rapport?.decision || null
//         }
//       })

//       setProjets(projetsAvecRapport)
//     } else {
//       setProjets([])
//     }
    
//     setLoading(false)
//   }

//   const chargerRapport = async (projetId: number) => {
//     setLoadingRapport(true)
    
//     const { data, error } = await supabase
//       .from('rapport_analyse')
//       .select('*')
//       .eq('projet_id', projetId)
//       .single()

//     if (!error && data) {
//       setRapport(data as RapportAnalyse)
//     } else {
//       setRapport(null)
//     }
    
//     setLoadingRapport(false)
//   }

//   const ouvrirDetail = async (projet: ProjetPourComite) => {
//     setSelectedProjet(projet)
//     setShowDetailModal(true)
//     await chargerRapport(projet.id)
//   }

//   const ouvrirDecision = (projet: ProjetPourComite) => {
//     setSelectedProjet(projet)
//     setDecisionFinale('')
//     setMontantApprouve(projet.montant_sollicite)
//     setConditions('')
//     setCommentaireComite('')
//     setDateReunion(new Date().toISOString().split('T')[0])
//     setError('')
//     setSuccess('')
//     setShowDecisionModal(true)
//   }

//   const calculerNoteTotale = (): number => {
//     if (!rapport) return 0
//     const valeurs = [
//       rapport.note_faisabilite || 0,
//       rapport.note_impact || 0,
//       rapport.note_finance || 0,
//       rapport.note_equipe || 0,
//       rapport.note_marche || 0
//     ]
//     const somme = valeurs.reduce((a, b) => a + b, 0)
//     return somme / CRITERES.length
//   }

//   const getNoteColor = (note: number): string => {
//     if (note <= 2) return 'text-red-600 bg-red-50'
//     if (note === 3) return 'text-orange-600 bg-orange-50'
//     if (note === 4) return 'text-green-600 bg-green-50'
//     return 'text-emerald-600 bg-emerald-50'
//   }

//   const getDecisionBadge = (decision: string | null) => {
//     if (decision === 'favorable') {
//       return { color: 'bg-green-100 text-green-700', icon: <ThumbsUp className="h-3 w-3" />, text: 'Favorable' }
//     } else if (decision === 'defavorable') {
//       return { color: 'bg-red-100 text-red-700', icon: <ThumbsDown className="h-3 w-3" />, text: 'Défavorable' }
//     }
//     return { color: 'bg-orange-100 text-orange-700', icon: <Minus className="h-3 w-3" />, text: 'Réservé' }
//   }

//   const soumettreDecision = async () => {
//     if (!selectedProjet || !user) return
    
//     if (!decisionFinale) {
//       setError('Veuillez choisir une décision')
//       return
//     }

//     setSubmitting(true)
//     setError('')

//     try {
//       // 1. Mettre à jour le rapport avec la décision du comité
//       const { error: rapportError } = await supabase
//         .from('rapport_analyse')
//         .update({
//           decision: decisionFinale,
//           commentaire_global: commentaireComite || null,
//           recommandations: conditions || null,
//           statut: 'valide_comite',
//           date_decision: new Date().toISOString(),
//           updated_at: new Date().toISOString()
//         })
//         .eq('projet_id', selectedProjet.id)

//       if (rapportError) throw rapportError

//       // 2. Mettre à jour l'étape du projet selon la décision
//       const nouvelleEtape = decisionFinale === 'favorable' ? 'financement_approuve' : 'financement_rejete'
      
//       const { error: projetError } = await supabase
//         .from('projets_fpi')
//         .update({
//           etape: nouvelleEtape,
//           updated_at: new Date().toISOString()
//         })
//         .eq('id', selectedProjet.id)

//       if (projetError) throw projetError

//       // 3. Enregistrer la décision du comité (user.id est number car BIGSERIAL)
//       const { error: comiteError } = await supabase
//         .from('decisions_comite')
//         .insert({
//           projet_id: selectedProjet.id,
//           membre_id: user.id,  // user.id est number
//           decision: decisionFinale,
//           montant_approuve: montantApprouve,
//           conditions: conditions || null,
//           commentaire: commentaireComite || null,
//           date_reunion: dateReunion,
//           created_at: new Date().toISOString()
//         })

//       if (comiteError) {
//         console.error('Erreur enregistrement décision comité:', comiteError)
//         // On continue même si cette insertion échoue
//       }

//       setSuccess(`✅ Décision ${decisionFinale === 'favorable' ? 'd\'approbation' : 'de rejet'} enregistrée avec succès !`)
      
//       setTimeout(() => {
//         setShowDecisionModal(false)
//         chargerProjetsComite()
//         if (showDetailModal) setShowDetailModal(false)
//       }, 2000)

//     } catch (err: any) {
//       console.error('Erreur:', err)
//       setError(err.message || 'Erreur lors de l\'enregistrement')
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   const telechargerRapportPDF = () => {
//     if (!selectedProjet || !rapport) return

//     const noteTotale = calculerNoteTotale()
    
//     const printWindow = window.open('', '_blank')
//     if (!printWindow) return

//     printWindow.document.write(`
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="utf-8">
//         <title>Rapport d'analyse - ${selectedProjet.nom_projet}</title>
//         <style>
//           * { margin: 0; padding: 0; box-sizing: border-box; }
//           body { 
//             font-family: 'Segoe UI', Arial, sans-serif; 
//             padding: 40px; 
//             color: #1a1a2e; 
//             font-size: 12px;
//             background: white;
//           }
//           .header { 
//             display: flex; 
//             align-items: center; 
//             gap: 20px; 
//             border-bottom: 3px solid #2563eb; 
//             padding-bottom: 20px; 
//             margin-bottom: 30px;
//           }
//           .logo-container {
//             width: 80px;
//             height: 80px;
//             flex-shrink: 0;
//           }
//           .logo-img {
//             width: 80px;
//             height: 80px;
//             object-fit: contain;
//           }
//           .header-text {
//             flex: 1;
//           }
//           .header h1 { 
//             font-size: 24px; 
//             color: #2563eb;
//             margin-bottom: 5px;
//           }
//           .section { 
//             margin-bottom: 25px; 
//             page-break-inside: avoid; 
//           }
//           .section h2 { 
//             font-size: 16px; 
//             color: #2563eb; 
//             border-left: 4px solid #2563eb; 
//             padding-left: 12px; 
//             margin-bottom: 15px;
//           }
//           .info-grid { 
//             display: grid; 
//             grid-template-columns: repeat(2, 1fr); 
//             gap: 12px; 
//             background: #f8fafc;
//             padding: 15px;
//             border-radius: 12px;
//           }
//           .info-item {
//             display: flex;
//             flex-direction: column;
//           }
//           .label { 
//             font-size: 10px; 
//             color: #64748b; 
//             text-transform: uppercase;
//             margin-bottom: 4px;
//           }
//           .value { 
//             font-size: 13px; 
//             font-weight: 600;
//             color: #0f172a;
//           }
//           table { 
//             width: 100%; 
//             border-collapse: collapse; 
//             margin: 15px 0;
//           }
//           th { 
//             background: #2563eb; 
//             color: white; 
//             padding: 12px; 
//             font-size: 12px; 
//             text-align: left;
//           }
//           td { 
//             padding: 12px; 
//             font-size: 11px; 
//             border-bottom: 1px solid #e2e8f0;
//           }
//           .badge { 
//             display: inline-block; 
//             padding: 6px 16px; 
//             border-radius: 20px; 
//             font-size: 12px; 
//             font-weight: bold;
//             margin-bottom: 15px;
//           }
//           .favorable { background: #d1fae5; color: #065f46; }
//           .defavorable { background: #fee2e2; color: #991b1b; }
//           .reserve { background: #fed7aa; color: #9a3412; }
//           .footer { 
//             margin-top: 40px; 
//             border-top: 1px solid #e2e8f0; 
//             padding-top: 20px; 
//             font-size: 10px; 
//             color: #94a3b8; 
//             text-align: center;
//           }
//           .critere-grid {
//             display: grid;
//             grid-template-columns: repeat(5, 1fr);
//             gap: 12px;
//             margin: 15px 0;
//           }
//           .critere-card {
//             background: #f8fafc;
//             border-radius: 10px;
//             padding: 10px;
//             text-align: center;
//           }
//           .critere-note {
//             font-size: 18px;
//             font-weight: bold;
//             color: #2563eb;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="header">
//           <div class="logo-container">
//             <img src="/logo.png" alt="Logo FPI" class="logo-img" onerror="this.style.display='none'" />
//           </div>
//           <div class="header-text">
//             <h1>Rapport d'Analyse Technique</h1>
//             <p>Fonds de Promotion de l'Industrie - Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
//           </div>
//         </div>
        
//         <div class="section">
//           <h2>Informations du Projet</h2>
//           <div class="info-grid">
//             <div class="info-item"><span class="label">Nom du projet</span><span class="value">${selectedProjet.nom_projet}</span></div>
//             <div class="info-item"><span class="label">Promoteur</span><span class="value">${selectedProjet.promoteur_nom_complet}</span></div>
//             <div class="info-item"><span class="label">Montant sollicité</span><span class="value">${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD' }).format(selectedProjet.montant_sollicite || 0)}</span></div>
//             <div class="info-item"><span class="label">Date de soumission</span><span class="value">${new Date(selectedProjet.created_at).toLocaleDateString('fr-FR')}</span></div>
//           </div>
//         </div>
        
//         <div class="section">
//           <h2>Grille d'Évaluation</h2>
//           <div class="critere-grid">
//             ${CRITERES.map(c => {
//               const note = rapport[`note_${c.key}` as keyof RapportAnalyse] as number || 0
//               return `
//                 <div class="critere-card">
//                   <div>${c.icon}</div>
//                   <div style="font-size: 10px; margin: 5px 0;">${c.label}</div>
//                   <div class="critere-note">${note}/5</div>
//                 </div>
//               `
//             }).join('')}
//           </div>
          
//           <div style="text-align: center; padding: 15px; background: #eff6ff; border-radius: 12px;">
//             <span>Note globale</span>
//             <div style="font-size: 36px; font-weight: bold; color: #2563eb;">${noteTotale.toFixed(1)}/5</div>
//           </div>
//         </div>
        
//         <div class="section">
//           <h2>Analyse Détaillée</h2>
//           <table>
//             <thead>
//               <tr><th>Critère</th><th>Note</th><th>Commentaire</th></tr>
//             </thead>
//             <tbody>
//               ${CRITERES.map(c => `
//                 <tr>
//                   <td>${c.icon} ${c.label}</td>
//                   <td style="text-align: center;">${rapport[`note_${c.key}` as keyof RapportAnalyse] || '-'}/5</td>
//                   <td>${rapport[`commentaire_${c.key}` as keyof RapportAnalyse] || '-'}</td>
//                 </tr>
//               `).join('')}
//             </tbody>
//           </table>
//         </div>
        
//         <div class="section">
//           <h2>Avis du Service Technique</h2>
//           <div><span class="badge ${rapport.decision || 'reserve'}">${rapport.decision === 'favorable' ? 'FAVORABLE' : rapport.decision === 'defavorable' ? 'DÉFAVORABLE' : 'RÉSERVÉ'}</span></div>
//           <div class="info-grid" style="grid-template-columns: 1fr;">
//             <div class="info-item"><span class="label">Commentaire</span><span class="value">${rapport.commentaire_global || '-'}</span></div>
//             ${rapport.recommandations ? `<div class="info-item"><span class="label">Recommandations</span><span class="value">${rapport.recommandations}</span></div>` : ''}
//           </div>
//         </div>
        
//         <div class="footer">
//           <p>Document généré automatiquement par le système FPI</p>
//         </div>
//       </body>
//       </html>
//     `)
    
//     printWindow.document.close()
//     setTimeout(() => printWindow.print(), 500)
//   }

//   const formatMontant = (m: number) => 
//     new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(m)

//   const formatDate = (d: string) => 
//     new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

//   const projetsFiltres = projets.filter(p => 
//     p.nom_projet.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     p.promoteur_nom_complet.toLowerCase().includes(searchTerm.toLowerCase())
//   )

//   if (loading) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-gray-50">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* HEADER */}
//       <div className="bg-white border-b sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 relative">
//                 <Image 
//                   src="/logo.png" 
//                   alt="Logo FPI" 
//                   width={40} 
//                   height={40}
//                   className="object-contain"
//                   onError={(e) => { e.currentTarget.style.display = 'none' }}
//                 />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-gray-900">Comité de Crédit</h1>
//                 <p className="text-sm text-gray-500">{projets.length} dossier(s) à examiner</p>
//               </div>
//             </div>
//             <div className="relative w-72">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 placeholder="Rechercher un projet ou promoteur..."
//                 className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* STATS */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div className="bg-white rounded- p-4 border">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-blue-100 rounded-lg"><Clock className="h-5 w-5 text-blue-600" /></div>
//               <div><p className="text-2xl font-bold">{projets.length}</p><p className="text-xs text-gray-500">En attente</p></div>
//             </div>
//           </div>
//           <div className="bg-white rounded- p-4 border">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-green-100 rounded-lg"><TrendingUp className="h-5 w-5 text-green-600" /></div>
//               <div><p className="text-2xl font-bold">{projets.filter(p => p.rapport_decision === 'favorable').length}</p><p className="text-xs text-gray-500">Avis favorables</p></div>
//             </div>
//           </div>
//           <div className="bg-white rounded- p-4 border">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-red-100 rounded-lg"><ThumbsDown className="h-5 w-5 text-red-600" /></div>
//               <div><p className="text-2xl font-bold">{projets.filter(p => p.rapport_decision === 'defavorable').length}</p><p className="text-xs text-gray-500">Avis défavorables</p></div>
//             </div>
//           </div>
//           <div className="bg-white rounded- p-4 border">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-purple-100 rounded-lg"><Banknote className="h-5 w-5 text-purple-600" /></div>
//               <div><p className="text-2xl font-bold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0, notation: 'compact' }).format(projets.reduce((sum, p) => sum + (p.montant_sollicite || 0), 0))}</p><p className="text-xs text-gray-500">Total sollicité</p></div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* LISTE PROJETS */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
//         {projetsFiltres.length === 0 ? (
//           <div className="text-center py-16 bg-white rounded-xl border">
//             <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
//             <p className="text-gray-500">Aucun dossier en attente d'examen</p>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {projetsFiltres.map((projet) => {
//               const decisionBadge = getDecisionBadge(projet.rapport_decision)
//               return (
//                 <div key={projet.id} className="bg-white rounded-xl border p-4 hover:shadow-md transition-all">
//                   <div className="flex items-start justify-between gap-4">
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center gap-2 mb-1 flex-wrap">
//                         <h3 className="text-base font-semibold text-gray-900">{projet.nom_projet}</h3>
//                         <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
//                           ⚖️ Comité crédit
//                         </span>
//                         {projet.rapport_decision && (
//                           <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${decisionBadge.color}`}>
//                             {decisionBadge.icon} {decisionBadge.text}
//                           </span>
//                         )}
//                       </div>
                      
//                       <div className="flex items-center gap-4 text-xs text-gray-500">
//                         <span className="flex items-center gap-1"><User className="h-3 w-3" /> {projet.promoteur_nom_complet}</span>
//                         <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(projet.created_at)}</span>
//                         {projet.montant_sollicite && (
//                           <span className="font-semibold text-gray-700">{formatMontant(projet.montant_sollicite)}</span>
//                         )}
//                         {projet.secteur_activite && (
//                           <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {projet.secteur_activite}</span>
//                         )}
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2 flex-shrink-0">
//                       <button
//                         onClick={() => ouvrirDetail(projet)}
//                         className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-1"
//                       >
//                         <Eye className="h-3 w-3" /> Consulter
//                       </button>
                      
//                       <button
//                         onClick={() => ouvrirDecision(projet)}
//                         className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-1"
//                       >
//                         <ShieldCheck className="h-3 w-3" /> Décision
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         )}
//       </div>

//       {/* MODAL DÉTAIL PROJET */}
//       {showDetailModal && selectedProjet && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
//           <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-auto shadow-2xl">
//             <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
//               <h2 className="text-lg font-bold">{selectedProjet.nom_projet}</h2>
//               <div className="flex items-center gap-2">
//                 {rapport && (
//                   <button
//                     onClick={telechargerRapportPDF}
//                     className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
//                   >
//                     <Download className="h-3 w-3" /> PDF
//                   </button>
//                 )}
//                 <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
//               </div>
//             </div>
            
//             <div className="p-6 space-y-5">
//               {loadingRapport ? (
//                 <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
//               ) : (
//                 <>
//                   {/* Infos projet */}
//                   <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4">
//                     <div><p className="text-xs text-gray-500">Promoteur</p><p className="text-sm font-medium">{selectedProjet.promoteur_nom_complet}</p></div>
//                     <div><p className="text-xs text-gray-500">Email</p><p className="text-sm">{selectedProjet.promoteur_email || '-'}</p></div>
//                     <div><p className="text-xs text-gray-500">Téléphone</p><p className="text-sm">{selectedProjet.promoteur_telephone || '-'}</p></div>
//                     <div><p className="text-xs text-gray-500">Date dépôt</p><p className="text-sm">{formatDate(selectedProjet.created_at)}</p></div>
//                     <div><p className="text-xs text-gray-500">Montant sollicité</p><p className="text-sm font-semibold text-primary">{formatMontant(selectedProjet.montant_sollicite || 0)}</p></div>
//                     <div><p className="text-xs text-gray-500">Secteur</p><p className="text-sm">{selectedProjet.secteur_activite || '-'}</p></div>
//                     {selectedProjet.nom_entite && <div><p className="text-xs text-gray-500">Entité</p><p className="text-sm">{selectedProjet.nom_entite}</p></div>}
//                     {selectedProjet.localisation_projet && <div><p className="text-xs text-gray-500">Localisation</p><p className="text-sm">{selectedProjet.localisation_projet}</p></div>}
//                   </div>

//                   {/* Description */}
//                   {selectedProjet.description_projet && (
//                     <div><h3 className="text-sm font-semibold mb-2">Description</h3><p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">{selectedProjet.description_projet}</p></div>
//                   )}

//                   {/* Rapport technique */}
//                   {rapport ? (
//                     <div className="space-y-4">
//                       <div className="flex items-center justify-between">
//                         <h3 className="text-sm font-semibold flex items-center gap-2"><FileCheck className="h-4 w-4 text-primary" /> Rapport d'analyse technique</h3>
//                         <button onClick={telechargerRapportPDF} className="text-xs text-primary hover:underline flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
//                       </div>

//                       {/* Notes */}
//                       <div className="grid grid-cols-5 gap-2">
//                         {CRITERES.map(c => {
//                           const note = rapport[`note_${c.key}` as keyof RapportAnalyse] as number || 0
//                           return (
//                             <div key={c.key} className={`text-center p-2 rounded-xl ${getNoteColor(note)}`}>
//                               <span className="text-lg">{c.icon}</span>
//                               <p className="text-xl font-bold">{note || '-'}</p>
//                               <p className="text-[10px]">{c.label.split(' ')[0]}</p>
//                             </div>
//                           )
//                         })}
//                       </div>

//                       <div className="text-center py-3 bg-primary/5 rounded-xl">
//                         <span className="text-sm text-gray-500">Note globale</span>
//                         <p className="text-3xl font-bold text-primary">{calculerNoteTotale().toFixed(1)}<span className="text-lg">/5</span></p>
//                       </div>

//                       {/* Avis technique */}
//                       <div className={`rounded-xl p-4 border-l-4 ${rapport.decision === 'favorable' ? 'border-green-500 bg-green-50' : rapport.decision === 'defavorable' ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50'}`}>
//                         <div className="flex items-center gap-2 mb-2">
//                           <span className="text-sm font-semibold">Avis du service technique :</span>
//                           <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rapport.decision === 'favorable' ? 'bg-green-200 text-green-800' : rapport.decision === 'defavorable' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'}`}>
//                             {rapport.decision === 'favorable' ? 'FAVORABLE' : rapport.decision === 'defavorable' ? 'DÉFAVORABLE' : 'RÉSERVÉ'}
//                           </span>
//                         </div>
//                         <p className="text-sm text-gray-700">{rapport.commentaire_global || 'Aucun commentaire'}</p>
//                         {rapport.recommandations && <p className="text-sm text-gray-600 mt-2"><strong>Recommandations :</strong> {rapport.recommandations}</p>}
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="text-center py-8 bg-yellow-50 rounded-xl"><AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" /><p className="text-sm text-yellow-700">Aucun rapport d'analyse disponible</p></div>
//                   )}

//                   {/* Bouton décision */}
//                   <button onClick={() => ouvrirDecision(selectedProjet)} className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 flex items-center justify-center gap-2">
//                     <ShieldCheck className="h-4 w-4" /> Prendre une décision
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* MODAL DÉCISION COMITÉ */}
//       {showDecisionModal && selectedProjet && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
//           <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto shadow-2xl">
//             <div className="sticky top-0 bg-white px-6 py-4 border-b">
//               <div className="flex items-center justify-between">
//                 <h2 className="text-lg font-bold">Décision du Comité</h2>
//                 <button onClick={() => setShowDecisionModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
//               </div>
//               <p className="text-sm text-gray-500 mt-1">{selectedProjet.nom_projet}</p>
//             </div>

//             <div className="p-6 space-y-5">
//               {error && (
//                 <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-center gap-2">
//                   <AlertCircle className="h-4 w-4" /> {error}
//                 </div>
//               )}
//               {success && (
//                 <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 flex items-center gap-2">
//                   <CheckCircle className="h-4 w-4" /> {success}
//                 </div>
//               )}

//               {/* Décision */}
//               <div>
//                 <label className="block text-sm font-medium mb-2">Décision finale</label>
//                 <div className="grid grid-cols-3 gap-2">
//                   <button
//                     type="button"
//                     onClick={() => setDecisionFinale('favorable')}
//                     className={`py-2.5 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition-all ${
//                       decisionFinale === 'favorable' 
//                         ? 'bg-green-500 text-white border-green-500 shadow-md' 
//                         : 'border-gray-200 hover:border-green-300'
//                     }`}
//                   >
//                     <ThumbsUp className="h-4 w-4" /> Approuver
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setDecisionFinale('reserve')}
//                     className={`py-2.5 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition-all ${
//                       decisionFinale === 'reserve' 
//                         ? 'bg-orange-500 text-white border-orange-500 shadow-md' 
//                         : 'border-gray-200 hover:border-orange-300'
//                     }`}
//                   >
//                     <Minus className="h-4 w-4" /> Ajourner
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setDecisionFinale('defavorable')}
//                     className={`py-2.5 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition-all ${
//                       decisionFinale === 'defavorable' 
//                         ? 'bg-red-500 text-white border-red-500 shadow-md' 
//                         : 'border-gray-200 hover:border-red-300'
//                     }`}
//                   >
//                     <ThumbsDown className="h-4 w-4" /> Rejeter
//                   </button>
//                 </div>
//               </div>

//               {/* Montant approuvé (si favorable) */}
//               {decisionFinale === 'favorable' && (
//                 <div>
//                   <label className="block text-sm font-medium mb-1">Montant approuvé (USD)</label>
//                   <input
//                     type="number"
//                     value={montantApprouve || ''}
//                     onChange={(e) => setMontantApprouve(Number(e.target.value))}
//                     className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
//                     placeholder={selectedProjet.montant_sollicite?.toString()}
//                   />
//                   <p className="text-xs text-gray-400 mt-1">Montant sollicité : {formatMontant(selectedProjet.montant_sollicite || 0)}</p>
//                 </div>
//               )}

//               {/* Conditions */}
//               <div>
//                 <label className="block text-sm font-medium mb-1">Conditions / Réserves</label>
//                 <textarea
//                   value={conditions}
//                   onChange={(e) => setConditions(e.target.value)}
//                   rows={3}
//                   className="w-full px-4 py-2 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
//                   placeholder="Ex: Justificatifs supplémentaires, garanties, etc."
//                 />
//               </div>

//               {/* Commentaire */}
//               <div>
//                 <label className="block text-sm font-medium mb-1">Commentaire du comité</label>
//                 <textarea
//                   value={commentaireComite}
//                   onChange={(e) => setCommentaireComite(e.target.value)}
//                   rows={3}
//                   className="w-full px-4 py-2 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
//                   placeholder="Motif de la décision, observations..."
//                 />
//               </div>

//               {/* Date réunion */}
//               <div>
//                 <label className="block text-sm font-medium mb-1">Date de la réunion</label>
//                 <input
//                   type="date"
//                   value={dateReunion}
//                   onChange={(e) => setDateReunion(e.target.value)}
//                   className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
//                 />
//               </div>

//               {/* Récapitulatif */}
//               <div className="bg-gray-50 rounded-xl p-4">
//                 <p className="text-xs text-gray-500 mb-2">Récapitulatif</p>
//                 <div className="space-y-1 text-sm">
//                   <p><strong>Projet :</strong> {selectedProjet.nom_projet}</p>
//                   <p><strong>Promoteur :</strong> {selectedProjet.promoteur_nom_complet}</p>
//                   <p><strong>Montant sollicité :</strong> {formatMontant(selectedProjet.montant_sollicite || 0)}</p>
//                   <p><strong>Avis technique :</strong> {rapport?.decision === 'favorable' ? '✅ Favorable' : rapport?.decision === 'defavorable' ? '❌ Défavorable' : '⏸️ Réservé'}</p>
//                   {rapport && <p><strong>Note technique :</strong> {calculerNoteTotale().toFixed(1)}/5</p>}
//                 </div>
//               </div>

//               {/* Boutons */}
//               <div className="flex gap-3 pt-2">
//                 <button onClick={() => setShowDecisionModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm">Annuler</button>
//                 <button onClick={soumettreDecision} disabled={submitting} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
//                   {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Validation...</> : <><Send className="h-4 w-4" /> Valider la décision</>}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { 
  Search, FileText, CheckCircle, 
  Clock, Loader2, Eye, AlertCircle, Send, User, 
  Calendar, Download, TrendingUp,
  Banknote, Briefcase, ThumbsUp, ThumbsDown, Minus,
  FileCheck, ShieldCheck
} from 'lucide-react'
import Image from 'next/image'

// Types
// type ProjetPourComite = {
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
// }

type ProjetPourComite = {
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
  promoteur_id: number | null  // ✅ Ajouter cette ligne
}

type RapportAnalyse = {
  id: number
  projet_id: number
  technicien_id: number
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

export default function ComiteCreditPage() {
  const { user } = useAuth()

  // États
  const [projets, setProjets] = useState<ProjetPourComite[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedProjet, setSelectedProjet] = useState<ProjetPourComite | null>(null)
  const [rapport, setRapport] = useState<RapportAnalyse | null>(null)
  const [loadingRapport, setLoadingRapport] = useState(false)
  
  const [showDecisionModal, setShowDecisionModal] = useState(false)
  const [decisionFinale, setDecisionFinale] = useState('')
  const [montantApprouve, setMontantApprouve] = useState<number | null>(null)
  const [conditions, setConditions] = useState('')
  const [commentaireComite, setCommentaireComite] = useState('')
  const [dateReunion, setDateReunion] = useState('')
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Charger les projets en attente du comité + approuvés + rejetés
  useEffect(() => {
    if (user) {
      chargerProjetsComite()
    }
  }, [user])

  const chargerProjetsComite = async () => {
    setLoading(true)
    
    // Récupérer les projets à l'étape "comité_crédit", "financement_approuve" et "financement_rejete"
    const { data: projetsData, error: projetsError } = await supabase
      .from('projets_fpi')
      .select('*')
      .in('etape', ['comité_crédit', 'financement_approuve', 'financement_rejete'])
      .order('created_at', { ascending: false })

    if (projetsError) {
      console.error('Erreur chargement projets:', projetsError)
      setLoading(false)
      return
    }

    // Récupérer les rapports associés
    if (projetsData && projetsData.length > 0) {
      const projetIds = projetsData.map(p => p.id)
      const { data: rapportsData, error: rapportsError } = await supabase
        .from('rapport_analyse')
        .select('*')
        .in('projet_id', projetIds)

      if (rapportsError) {
        console.error('Erreur chargement rapports:', rapportsError)
      }

      const projetsAvecRapport = projetsData.map(projet => {
        const rapport = (rapportsData || []).find(r => r.projet_id === projet.id)
        return {
          ...projet,
          rapport_id: rapport?.id || null,
          rapport_statut: rapport?.statut || null,
          rapport_decision: rapport?.decision || null
        }
      })

      setProjets(projetsAvecRapport)
    } else {
      setProjets([])
    }
    
    setLoading(false)
  }

  const chargerRapport = async (projetId: number) => {
    setLoadingRapport(true)
    
    const { data, error } = await supabase
      .from('rapport_analyse')
      .select('*')
      .eq('projet_id', projetId)
      .single()

    if (!error && data) {
      setRapport(data as RapportAnalyse)
    } else {
      setRapport(null)
    }
    
    setLoadingRapport(false)
  }

  const ouvrirDetail = async (projet: ProjetPourComite) => {
    setSelectedProjet(projet)
    setShowDetailModal(true)
    await chargerRapport(projet.id)
  }

  const ouvrirDecision = (projet: ProjetPourComite) => {
    setSelectedProjet(projet)
    setDecisionFinale('')
    setMontantApprouve(projet.montant_sollicite)
    setConditions('')
    setCommentaireComite('')
    setDateReunion(new Date().toISOString().split('T')[0])
    setError('')
    setSuccess('')
    setShowDecisionModal(true)
  }

  const calculerNoteTotale = (): number => {
    if (!rapport) return 0
    const valeurs = [
      rapport.note_faisabilite || 0,
      rapport.note_impact || 0,
      rapport.note_finance || 0,
      rapport.note_equipe || 0,
      rapport.note_marche || 0
    ]
    const somme = valeurs.reduce((a, b) => a + b, 0)
    return somme / CRITERES.length
  }

  const getNoteColor = (note: number): string => {
    if (note <= 2) return 'text-red-600 bg-red-50'
    if (note === 3) return 'text-orange-600 bg-orange-50'
    if (note === 4) return 'text-green-600 bg-green-50'
    return 'text-emerald-600 bg-emerald-50'
  }

  const getDecisionBadge = (decision: string | null) => {
    if (decision === 'favorable') {
      return { color: 'bg-green-100 text-green-700', icon: <ThumbsUp className="h-3 w-3" />, text: 'Favorable' }
    } else if (decision === 'defavorable') {
      return { color: 'bg-red-100 text-red-700', icon: <ThumbsDown className="h-3 w-3" />, text: 'Défavorable' }
    }
    return { color: 'bg-orange-100 text-orange-700', icon: <Minus className="h-3 w-3" />, text: 'Réservé' }
  }

  // Fonction pour déterminer si un projet est en attente, approuvé ou rejeté
  const getEtapeProjet = (etape: string) => {
    switch (etape) {
      case 'financement_approuve':
        return { 
          label: 'Approuvé', 
          color: 'bg-green-100 text-green-700', 
          icon: <CheckCircle className="h-4 w-4" /> 
        }
      case 'financement_rejete':
        return { 
          label: 'Rejeté', 
          color: 'bg-red-100 text-red-700', 
          icon: <AlertCircle className="h-4 w-4" /> 
        }
      case 'comité_crédit':
        return { 
          label: 'Comité crédit', 
          color: 'bg-purple-100 text-purple-700', 
          icon: <Clock className="h-4 w-4" /> 
        }
      default:
        return { 
          label: etape, 
          color: 'bg-gray-100 text-gray-700', 
          icon: <FileText className="h-4 w-4" /> 
        }
    }
  }

const envoyerNotificationPush = async (
  userId: string,
  titre: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' | 'paiement' | 'document' | 'validation' | 'decision' = 'info',
  projetId?: number,
  url?: string
) => {
  if (!userId) return false

  try {
    // Sauvegarder dans la base de données
    const { error: dbError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: type,
        titre: titre,
        message: message,
        lien: url || null,
        projet_id: projetId || null,
        icone: type === 'decision' ? 'CheckCircle' : type === 'success' ? 'CheckCircle' : 'Bell',
        est_lue: false
      })

    if (dbError) {
      console.error('Erreur sauvegarde notification:', dbError)
    }

    // Envoyer notification push
    const response = await fetch('/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({
        userId: userId,
        notification: {
          title: titre,
          body: message,
          url: url || '/dashboard',
          type: type,
          projetId: projetId,
          requireInteraction: type === 'decision' || type === 'error',
          vibrate: [200, 100, 200]
        }
      })
    })

    return response.ok
  } catch (error) {
    console.error('Erreur envoi notification:', error)
    return false
  }
}

const soumettreDecision = async () => {
  if (!selectedProjet || !user) return
  
  if (!decisionFinale) {
    setError('Veuillez choisir une décision')
    return
  }

  setSubmitting(true)
  setError('')

  try {
    // 1. Mettre à jour le rapport avec la décision du comité
    const { error: rapportError } = await supabase
      .from('rapport_analyse')
      .update({
        decision: decisionFinale,
        commentaire_global: commentaireComite || null,
        recommandations: conditions || null,
        statut: 'valide_comite',
        date_decision: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('projet_id', selectedProjet.id)

    if (rapportError) throw rapportError

    // 2. Mettre à jour l'étape du projet selon la décision
    const nouvelleEtape = decisionFinale === 'favorable' ? 'financement_approuve' : 'financement_rejete'
    
    const { error: projetError } = await supabase
      .from('projets_fpi')
      .update({
        etape: nouvelleEtape,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedProjet.id)

    if (projetError) throw projetError

    // 3. Enregistrer la décision du comité
    const { error: comiteError } = await supabase
      .from('decisions_comite')
      .insert({
        projet_id: selectedProjet.id,
        membre_id: user.id,
        decision: decisionFinale,
        montant_approuve: montantApprouve,
        conditions: conditions || null,
        commentaire: commentaireComite || null,
        date_reunion: dateReunion,
        created_at: new Date().toISOString()
      })

    if (comiteError) {
      console.error('Erreur enregistrement décision comité:', comiteError)
    }

    // ✅🆕 4. Envoyer notification au promoteur
    if (selectedProjet.promoteur_id) {
      const promoteurId = selectedProjet.promoteur_id.toString();
      
      let titreNotif = '';
      let messageNotif = '';
      let typeNotif: 'success' | 'warning' | 'error' | 'info' = 'info';
      if (decisionFinale === 'favorable') {
        titreNotif = '🎉 Félicitations ! Projet approuvé';
        messageNotif = `Votre projet "${selectedProjet.nom_projet}" a été approuvé par le comité de crédit. Montant approuvé: ${formatMontant(montantApprouve || selectedProjet.montant_sollicite || 0)}`;
        typeNotif = 'success';
      } else if (decisionFinale === 'defavorable') {
        titreNotif = '📋 Décision du comité - Projet non retenu';
        messageNotif = `Votre projet "${selectedProjet.nom_projet}" n'a pas été retenu par le comité de crédit. Motif: ${commentaireComite || 'Non spécifié'}`;
        typeNotif = 'error';
      } else {
        titreNotif = '⏸️ Décision du comité - Projet ajourné';
        messageNotif = `Votre projet "${selectedProjet.nom_projet}" a été ajourné par le comité de crédit. ${conditions ? `Conditions: ${conditions}` : ''}`;
        typeNotif = 'warning';
      }
      
      await envoyerNotificationPush(
        promoteurId,
        titreNotif,
        messageNotif,
        typeNotif,
        selectedProjet.id,
        '/dashboard'
      );
    }

    // ✅🆕 5. Envoyer notification au service technique
    if (rapport?.technicien_id) {
      const technicienId = rapport.technicien_id.toString();
      
      let messageTechnicien = '';
      if (decisionFinale === 'favorable') {
        messageTechnicien = `Le comité a validé votre rapport d'analyse pour le projet "${selectedProjet.nom_projet}". Projet approuvé.`;
      } else if (decisionFinale === 'defavorable') {
        messageTechnicien = `Le comité a rejeté le projet "${selectedProjet.nom_projet}" que vous avez analysé.`;
      } else {
        messageTechnicien = `Le comité a ajourné le projet "${selectedProjet.nom_projet}" que vous avez analysé.`;
      }
      
      await envoyerNotificationPush(
        technicienId,
        '📋 Décision du comité de crédit',
        messageTechnicien,
        'decision',
        selectedProjet.id,
        '/dashboard'
      );
    }

    setSuccess(`✅ Décision ${decisionFinale === 'favorable' ? 'd\'approbation' : 'de rejet'} enregistrée avec succès !`)
    
    setTimeout(() => {
      setShowDecisionModal(false)
      chargerProjetsComite()
      if (showDetailModal) setShowDetailModal(false)
    }, 2000)

  } catch (err: any) {
    console.error('Erreur:', err)
    setError(err.message || 'Erreur lors de l\'enregistrement')
  } finally {
    setSubmitting(false)
  }
}
  // const soumettreDecision = async () => {
  //   if (!selectedProjet || !user) return
    
  //   if (!decisionFinale) {
  //     setError('Veuillez choisir une décision')
  //     return
  //   }

  //   setSubmitting(true)
  //   setError('')

  //   try {
  //     // 1. Mettre à jour le rapport avec la décision du comité
  //     const { error: rapportError } = await supabase
  //       .from('rapport_analyse')
  //       .update({
  //         decision: decisionFinale,
  //         commentaire_global: commentaireComite || null,
  //         recommandations: conditions || null,
  //         statut: 'valide_comite',
  //         date_decision: new Date().toISOString(),
  //         updated_at: new Date().toISOString()
  //       })
  //       .eq('projet_id', selectedProjet.id)

  //     if (rapportError) throw rapportError

  //     // 2. Mettre à jour l'étape du projet selon la décision
  //     const nouvelleEtape = decisionFinale === 'favorable' ? 'financement_approuve' : 'financement_rejete'
      
  //     const { error: projetError } = await supabase
  //       .from('projets_fpi')
  //       .update({
  //         etape: nouvelleEtape,
  //         updated_at: new Date().toISOString()
  //       })
  //       .eq('id', selectedProjet.id)

  //     if (projetError) throw projetError

  //     // 3. Enregistrer la décision du comité
  //     const { error: comiteError } = await supabase
  //       .from('decisions_comite')
  //       .insert({
  //         projet_id: selectedProjet.id,
  //         membre_id: user.id,
  //         decision: decisionFinale,
  //         montant_approuve: montantApprouve,
  //         conditions: conditions || null,
  //         commentaire: commentaireComite || null,
  //         date_reunion: dateReunion,
  //         created_at: new Date().toISOString()
  //       })

  //     if (comiteError) {
  //       console.error('Erreur enregistrement décision comité:', comiteError)
  //       // On continue même si cette insertion échoue
  //     }

  //     setSuccess(`✅ Décision ${decisionFinale === 'favorable' ? 'd\'approbation' : 'de rejet'} enregistrée avec succès !`)
      
  //     setTimeout(() => {
  //       setShowDecisionModal(false)
  //       chargerProjetsComite()
  //       if (showDetailModal) setShowDetailModal(false)
  //     }, 2000)

  //   } catch (err: any) {
  //     console.error('Erreur:', err)
  //     setError(err.message || 'Erreur lors de l\'enregistrement')
  //   } finally {
  //     setSubmitting(false)
  //   }
  // }

  // Utilisation du composant PDF externe
  const telechargerRapportPDF = async () => {
    if (!selectedProjet || !rapport) return

    // Import dynamique du générateur PDF
    const { generateRapportPDF } = await import('@/components/PDFGenerator')
    
    const pdfData = {
      nomProjet: selectedProjet.nom_projet,
      promoteurNom: selectedProjet.promoteur_nom_complet,
      montantSollicite: formatMontant(selectedProjet.montant_sollicite || 0),
      dateSoumission: selectedProjet.created_at,
      notes: {
        faisabilite: rapport.note_faisabilite || 0,
        impact: rapport.note_impact || 0,
        finance: rapport.note_finance || 0,
        equipe: rapport.note_equipe || 0,
        marche: rapport.note_marche || 0,
      },
      commentaires: {
        faisabilite: rapport.commentaire_faisabilite || '-',
        impact: rapport.commentaire_impact || '-',
        finance: rapport.commentaire_finance || '-',
        equipe: rapport.commentaire_equipe || '-',
        marche: rapport.commentaire_marche || '-',
      },
      decision: rapport.decision || 'reserve',
      commentaireGlobal: rapport.commentaire_global || 'Aucun commentaire',
      recommandations: rapport.recommandations || '',
      logoUrl: '/logo.png'
    }

    await generateRapportPDF(pdfData)
  }

  const formatMontant = (m: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(m)

  const formatDate = (d: string) => 
    new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

  const projetsFiltres = projets.filter(p => 
    p.nom_projet.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.promoteur_nom_complet.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calcul des statistiques
  const statsEnAttente = projets.filter(p => p.etape === 'comité_crédit').length
  const statsApprouves = projets.filter(p => p.etape === 'financement_approuve').length
  const statsRejetes = projets.filter(p => p.etape === 'financement_rejete').length
  const statsAvisFavorable = projets.filter(p => p.rapport_decision === 'favorable').length
  const statsAvisDefavorable = projets.filter(p => p.rapport_decision === 'defavorable').length
  const montantTotal = projets.reduce((sum, p) => sum + (p.montant_sollicite || 0), 0)

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un projet ou promoteur..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white  p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Clock className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-2xl font-bold">{statsEnAttente}</p>
                <p className="text-xs text-gray-500">En attente</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded- p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-2xl font-bold">{statsApprouves}</p>
                <p className="text-xs text-gray-500">Approuvés</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded- p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg"><AlertCircle className="h-5 w-5 text-red-600" /></div>
              <div>
                <p className="text-2xl font-bold">{statsRejetes}</p>
                <p className="text-xs text-gray-500">Rejetés</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded- p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg"><Banknote className="h-5 w-5 text-purple-600" /></div>
              <div>
                <p className="text-2xl font-bold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0, notation: 'compact' }).format(montantTotal)}</p>
                <p className="text-xs text-gray-500">Total sollicité</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats détaillées */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-white roundel p-3 border flex items-center gap-3">
            <ThumbsUp className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-lg font-bold">{statsAvisFavorable}</p>
              <p className="text-xs text-gray-500">Avis techniques favorables</p>
            </div>
          </div>
          <div className="bg-white roundel p-3 border flex items-center gap-3">
            <ThumbsDown className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-lg font-bold">{statsAvisDefavorable}</p>
              <p className="text-xs text-gray-500">Avis techniques défavorables</p>
            </div>
          </div>
        </div>
      </div>

      {/* LISTE PROJETS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {projetsFiltres.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">Aucun dossier trouvé</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projetsFiltres.map((projet) => {
              const decisionBadge = getDecisionBadge(projet.rapport_decision)
              const etapeInfo = getEtapeProjet(projet.etape)
              const isTermine = projet.etape === 'financement_approuve' || projet.etape === 'financement_rejete'
              
              return (
                <div key={projet.id} className="bg-white rounded- border p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-base font-semibold text-gray-900">{projet.nom_projet}</h3>
                        
                        {/* Badge de l'étape */}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${etapeInfo.color}`}>
                          {etapeInfo.icon} {etapeInfo.label}
                        </span>
                        
                        {/* Badge de l'avis technique */}
                        {projet.rapport_decision && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${decisionBadge.color}`}>
                            {decisionBadge.icon} {decisionBadge.text}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {projet.promoteur_nom_complet}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(projet.created_at)}</span>
                        {projet.montant_sollicite && (
                          <span className="font-semibold text-gray-700">{formatMontant(projet.montant_sollicite)}</span>
                        )}
                        {projet.secteur_activite && (
                          <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {projet.secteur_activite}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => ouvrirDetail(projet)}
                        className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" /> Consulter
                      </button>
                      
                      {/* Afficher le bouton Décision uniquement pour les projets en attente */}
                      {!isTermine && (
                        <button
                          onClick={() => ouvrirDecision(projet)}
                          className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-1"
                        >
                          <ShieldCheck className="h-3 w-3" /> Décision
                        </button>
                      )}
                      
                      {/* Pour les projets terminés, afficher le statut final */}
                      {isTermine && (
                        <span className={`px-3 py-1.5 text-xs rounded-lg ${
                          projet.etape === 'financement_approuve' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {projet.etape === 'financement_approuve' ? '✅ Approuvé' : '❌ Rejeté'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* MODAL DÉTAIL PROJET */}
      {showDetailModal && selectedProjet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">{selectedProjet.nom_projet}</h2>
              <div className="flex items-center gap-2">
                {rapport && (
                  <button
                    onClick={telechargerRapportPDF}
                    className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" /> PDF
                  </button>
                )}
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              {loadingRapport ? (
                <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
              ) : (
                <>
                  {/* Infos projet */}
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4">
                    <div><p className="text-xs text-gray-500">Promoteur</p><p className="text-sm font-medium">{selectedProjet.promoteur_nom_complet}</p></div>
                    <div><p className="text-xs text-gray-500">Email</p><p className="text-sm">{selectedProjet.promoteur_email || '-'}</p></div>
                    <div><p className="text-xs text-gray-500">Téléphone</p><p className="text-sm">{selectedProjet.promoteur_telephone || '-'}</p></div>
                    <div><p className="text-xs text-gray-500">Date dépôt</p><p className="text-sm">{formatDate(selectedProjet.created_at)}</p></div>
                    <div><p className="text-xs text-gray-500">Montant sollicité</p><p className="text-sm font-semibold text-primary">{formatMontant(selectedProjet.montant_sollicite || 0)}</p></div>
                    <div><p className="text-xs text-gray-500">Secteur</p><p className="text-sm">{selectedProjet.secteur_activite || '-'}</p></div>
                    {selectedProjet.nom_entite && <div><p className="text-xs text-gray-500">Entité</p><p className="text-sm">{selectedProjet.nom_entite}</p></div>}
                    {selectedProjet.localisation_projet && <div><p className="text-xs text-gray-500">Localisation</p><p className="text-sm">{selectedProjet.localisation_projet}</p></div>}
                    <div>
                      <p className="text-xs text-gray-500">Statut</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        selectedProjet.etape === 'financement_approuve' ? 'bg-green-100 text-green-700' :
                        selectedProjet.etape === 'financement_rejete' ? 'bg-red-100 text-red-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {getEtapeProjet(selectedProjet.etape).icon} {getEtapeProjet(selectedProjet.etape).label}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedProjet.description_projet && (
                    <div><h3 className="text-sm font-semibold mb-2">Description</h3><p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">{selectedProjet.description_projet}</p></div>
                  )}

                  {/* Rapport technique */}
                  {rapport ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold flex items-center gap-2"><FileCheck className="h-4 w-4 text-primary" /> Rapport d'analyse technique</h3>
                        <button onClick={telechargerRapportPDF} className="text-xs text-primary hover:underline flex items-center gap-1"><Download className="h-3 w-3" /> Télécharger PDF</button>
                      </div>

                      {/* Notes */}
                      <div className="grid grid-cols-5 gap-2">
                        {CRITERES.map(c => {
                          const note = rapport[`note_${c.key}` as keyof RapportAnalyse] as number || 0
                          return (
                            <div key={c.key} className={`text-center p-2 rounded-xl ${getNoteColor(note)}`}>
                              <span className="text-lg">{c.icon}</span>
                              <p className="text-xl font-bold">{note || '-'}</p>
                              <p className="text-[10px]">{c.label.split(' ')[0]}</p>
                            </div>
                          )
                        })}
                      </div>

                      <div className="text-center py-3 bg-primary/5 rounded-xl">
                        <span className="text-sm text-gray-500">Note globale</span>
                        <p className="text-3xl font-bold text-primary">{calculerNoteTotale().toFixed(1)}<span className="text-lg">/5</span></p>
                      </div>

                      {/* Avis technique */}
                      <div className={`rounded-xl p-4 border-l-4 ${rapport.decision === 'favorable' ? 'border-green-500 bg-green-50' : rapport.decision === 'defavorable' ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold">Avis du service technique :</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rapport.decision === 'favorable' ? 'bg-green-200 text-green-800' : rapport.decision === 'defavorable' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'}`}>
                            {rapport.decision === 'favorable' ? 'FAVORABLE' : rapport.decision === 'defavorable' ? 'DÉFAVORABLE' : 'RÉSERVÉ'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{rapport.commentaire_global || 'Aucun commentaire'}</p>
                        {rapport.recommandations && <p className="text-sm text-gray-600 mt-2"><strong>Recommandations :</strong> {rapport.recommandations}</p>}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-yellow-50 rounded-xl"><AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" /><p className="text-sm text-yellow-700">Aucun rapport d'analyse disponible</p></div>
                  )}

                  {/* Bouton décision - seulement si en attente */}
                  {selectedProjet.etape === 'comité_crédit' && (
                    <button onClick={() => ouvrirDecision(selectedProjet)} className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 flex items-center justify-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> Prendre une décision
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DÉCISION COMITÉ */}
      {showDecisionModal && selectedProjet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Décision du Comité</h2>
                <button onClick={() => setShowDecisionModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
              </div>
              <p className="text-sm text-gray-500 mt-1">{selectedProjet.nom_projet}</p>
            </div>

            <div className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> {success}
                </div>
              )}

              {/* Décision */}
              <div>
                <label className="block text-sm font-medium mb-2">Décision finale</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecisionFinale('favorable')}
                    className={`py-2.5 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition-all ${
                      decisionFinale === 'favorable' 
                        ? 'bg-green-500 text-white border-green-500 shadow-md' 
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" /> Approuver
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionFinale('reserve')}
                    className={`py-2.5 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition-all ${
                      decisionFinale === 'reserve' 
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md' 
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <Minus className="h-4 w-4" /> Ajourner
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionFinale('defavorable')}
                    className={`py-2.5 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition-all ${
                      decisionFinale === 'defavorable' 
                        ? 'bg-red-500 text-white border-red-500 shadow-md' 
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <ThumbsDown className="h-4 w-4" /> Rejeter
                  </button>
                </div>
              </div>

              {/* Montant approuvé (si favorable) */}
              {decisionFinale === 'favorable' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Montant approuvé (USD)</label>
                  <input
                    type="number"
                    value={montantApprouve || ''}
                    onChange={(e) => setMontantApprouve(Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder={selectedProjet.montant_sollicite?.toString()}
                  />
                  <p className="text-xs text-gray-400 mt-1">Montant sollicité : {formatMontant(selectedProjet.montant_sollicite || 0)}</p>
                </div>
              )}

              {/* Conditions */}
              <div>
                <label className="block text-sm font-medium mb-1">Conditions / Réserves</label>
                <textarea
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Ex: Justificatifs supplémentaires, garanties, etc."
                />
              </div>

              {/* Commentaire */}
              <div>
                <label className="block text-sm font-medium mb-1">Commentaire du comité</label>
                <textarea
                  value={commentaireComite}
                  onChange={(e) => setCommentaireComite(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Motif de la décision, observations..."
                />
              </div>

              {/* Date réunion */}
              <div>
                <label className="block text-sm font-medium mb-1">Date de la réunion</label>
                <input
                  type="date"
                  value={dateReunion}
                  onChange={(e) => setDateReunion(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Récapitulatif */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-2">Récapitulatif</p>
                <div className="space-y-1 text-sm">
                  <p><strong>Projet :</strong> {selectedProjet.nom_projet}</p>
                  <p><strong>Promoteur :</strong> {selectedProjet.promoteur_nom_complet}</p>
                  <p><strong>Montant sollicité :</strong> {formatMontant(selectedProjet.montant_sollicite || 0)}</p>
                  {/* <p><strong>Avis technique :</strong> {rapport?.decision === 'favorable' ? '✅ Favorable' : rapport?.decision === 'defavorable' ? '❌ Défavorable' : '⏸️ Réservé'}</p> */}
                  {rapport && <p><strong>Note technique :</strong> {calculerNoteTotale().toFixed(1)}/5</p>}
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowDecisionModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm">Annuler</button>
                <button onClick={soumettreDecision} disabled={submitting} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Validation...</> : <><Send className="h-4 w-4" /> Valider la décision</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}