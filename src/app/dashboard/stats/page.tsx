// // app/dashboard/statistiques/page.tsx
// 'use client'

// import { useState, useEffect, useCallback } from 'react'
// import { useAuth } from '@/context/AuthContext'
// import { supabase } from '@/lib/supabase'
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
//   PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart
// } from 'recharts'
// import {
//   TrendingUp, Users, FolderOpen, CheckCircle, Clock, AlertCircle,
//   DollarSign, Activity, Filter, Calendar, Download, RefreshCw,
//   Loader2, ChevronDown, BarChart3, PieChartIcon, TrendingDown
// } from 'lucide-react'

// // Types
// type StatsData = {
//   projetsParEtape: { name: string; value: number; count: number }[]
//   projetsParMois: { month: string; total: number; approuves: number; refus: number }[]
//   projetsParRole: { name: string; value: number }[]
//   montantsParMois: { month: string; montant: number; approuve: number }[]
//   decisionsStats: { name: string; value: number; color: string }[]
//   tauxValidation: { etape: string; taux: number; projets: number }[]
//   topPromoteurs: { name: string; projets: number; montant: number }[]
//   resume: {
//     totalProjets: number
//     projetsActifs: number
//     projetsApprouves: number
//     projetsRefuses: number
//     montantTotal: number
//     montantApprouve: number
//     tauxApprobation: number
//     delaiMoyen: number
//     documentsMoyen: number
//   }
// }

// const COLORS = {
//   primary: '#3B82F6',
//   success: '#10B981',
//   warning: '#F59E0B',
//   danger: '#EF4444',
//   purple: '#8B5CF6',
//   indigo: '#6366F1',
//   pink: '#EC4899',
//   teal: '#14B8A6',
//   orange: '#F97316',
//   gray: '#6B7280'
// }

// const ETAPE_COLORS: Record<string, string> = {
//   'reçu': '#60A5FA',
//   'vérif_docs': '#F59E0B',
//   'analyse_tech': '#8B5CF6',
//   'comité_crédit': '#EC4899',
//   'décision_rendue': '#10B981'
// }

// export default function StatistiquesPage() {
//   const { user: currentUser } = useAuth()
//   const [stats, setStats] = useState<StatsData | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [periode, setPeriode] = useState('12') // mois
//   const [isRefreshing, setIsRefreshing] = useState(false)
//   const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'financial' | 'performance'>('overview')

//   const chargerStatistiques = useCallback(async (silent = false) => {
//     try {
//       if (!silent) setLoading(true)
//       else setIsRefreshing(true)

//       const dateDebut = new Date()
//       dateDebut.setMonth(dateDebut.getMonth() - parseInt(periode))

//       // 1. Projets par étape
//       const { data: projetsEtape } = await supabase
//         .from('projets')
//         .select('etape')
//         .gte('created_at', dateDebut.toISOString())

//       const etapeCount = projetsEtape?.reduce((acc: Record<string, number>, p) => {
//         acc[p.etape] = (acc[p.etape] || 0) + 1
//         return acc
//       }, {})

//       const projetsParEtape = Object.entries(etapeCount || {}).map(([name, value]) => ({
//         name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
//         value,
//         count: value
//       }))

//       // 2. Projets par mois
//       const { data: projetsMensuels } = await supabase
//         .from('projets')
//         .select('created_at, decision_finale, montant_demande')
//         .gte('created_at', dateDebut.toISOString())
//         .order('created_at')

//       const monthlyData: Record<string, any> = {}
//       projetsMensuels?.forEach(p => {
//         const month = new Date(p.created_at).toLocaleString('fr-FR', { month: 'short', year: '2-digit' })
//         if (!monthlyData[month]) {
//           monthlyData[month] = { month, total: 0, approuves: 0, refus: 0, montant: 0, montantApprouve: 0 }
//         }
//         monthlyData[month].total++
//         monthlyData[month].montant += Number(p.montant_demande) || 0
//         if (p.decision_finale === 'approuvé') {
//           monthlyData[month].approuves++
//           monthlyData[month].montantApprouve += Number(p.montant_demande) || 0
//         }
//         if (p.decision_finale === 'refusé') monthlyData[month].refus++
//       })

//       const projetsParMois = Object.values(monthlyData)

//       // 3. Projets par rôle de promoteur
//       const { data: projetsRole } = await supabase
//         .from('vue_projets_details')
//         .select('promoteur_id')

//       // Compter les promoteurs uniques et leurs projets
//       const promoteurStats = projetsRole?.reduce((acc: Record<string, number>, p) => {
//         acc[p.promoteur_id] = (acc[p.promoteur_id] || 0) + 1
//         return acc
//       }, {})

//       const projetsParRole = [
//         { name: '1 projet', value: Object.values(promoteurStats || {}).filter(v => v === 1).length },
//         { name: '2-3 projets', value: Object.values(promoteurStats || {}).filter(v => v >= 2 && v <= 3).length },
//         { name: '4-5 projets', value: Object.values(promoteurStats || {}).filter(v => v >= 4 && v <= 5).length },
//         { name: '5+ projets', value: Object.values(promoteurStats || {}).filter(v => v > 5).length }
//       ]

//       // 4. Décisions
//       const { data: decisions } = await supabase
//         .from('projets')
//         .select('decision_finale')

//       const decisionCount = decisions?.reduce((acc: Record<string, number>, d) => {
//         const key = d.decision_finale || 'en_attente'
//         acc[key] = (acc[key] || 0) + 1
//         return acc
//       }, {})

//       const decisionsStats = [
//         { name: 'Approuvés', value: decisionCount?.['approuvé'] || 0, color: COLORS.success },
//         { name: 'Refusés', value: decisionCount?.['refusé'] || 0, color: COLORS.danger },
//         { name: 'En attente', value: decisionCount?.['en_attente'] || 0, color: COLORS.warning }
//       ]

//       // 5. Taux de validation par étape
//       const { data: validationData } = await supabase
//         .from('projets')
//         .select('etape')
//         .gte('created_at', dateDebut.toISOString())

//       const tauxValidation = [
//         { etape: 'Réception', taux: 100, projets: validationData?.length || 0 },
//         { etape: 'Vérif. Docs', taux: Math.round(((validationData?.filter(p => ['vérif_docs', 'analyse_tech', 'comité_crédit', 'décision_rendue'].includes(p.etape)).length || 0) / (validationData?.length || 1)) * 100), projets: validationData?.filter(p => ['vérif_docs', 'analyse_tech', 'comité_crédit', 'décision_rendue'].includes(p.etape)).length || 0 },
//         { etape: 'Analyse Tech', taux: Math.round(((validationData?.filter(p => ['analyse_tech', 'comité_crédit', 'décision_rendue'].includes(p.etape)).length || 0) / (validationData?.length || 1)) * 100), projets: validationData?.filter(p => ['analyse_tech', 'comité_crédit', 'décision_rendue'].includes(p.etape)).length || 0 },
//         { etape: 'Comité', taux: Math.round(((validationData?.filter(p => ['comité_crédit', 'décision_rendue'].includes(p.etape)).length || 0) / (validationData?.length || 1)) * 100), projets: validationData?.filter(p => ['comité_crédit', 'décision_rendue'].includes(p.etape)).length || 0 },
//         { etape: 'Décision', taux: Math.round(((validationData?.filter(p => p.etape === 'décision_rendue').length || 0) / (validationData?.length || 1)) * 100), projets: validationData?.filter(p => p.etape === 'décision_rendue').length || 0 }
//       ]

//       // 6. Top promoteurs
//       const { data: topPromoteursData } = await supabase
//         .from('vue_projets_details')
//         .select('promoteur_nom, montant_demande, decision_finale')
//         .limit(20)

//       const promoteurAgg: Record<string, { projets: number; montant: number }> = {}
//       topPromoteursData?.forEach(p => {
//         const name = p.promoteur_nom || 'Anonyme'
//         if (!promoteurAgg[name]) promoteurAgg[name] = { projets: 0, montant: 0 }
//         promoteurAgg[name].projets++
//         promoteurAgg[name].montant += Number(p.montant_demande) || 0
//       })

//       const topPromoteurs = Object.entries(promoteurAgg)
//         .map(([name, data]) => ({ name, ...data }))
//         .sort((a, b) => b.projets - a.projets)
//         .slice(0, 10)

//       // 7. Résumé global
//       const { data: allProjets } = await supabase
//         .from('projets')
//         .select('decision_finale, montant_demande, created_at')

//       const totalProjets = allProjets?.length || 0
//       const projetsApprouves = allProjets?.filter(p => p.decision_finale === 'approuvé').length || 0
//       const projetsRefuses = allProjets?.filter(p => p.decision_finale === 'refusé').length || 0
//       const montantTotal = allProjets?.reduce((sum, p) => sum + Number(p.montant_demande || 0), 0) || 0
//       const montantApprouve = allProjets?.filter(p => p.decision_finale === 'approuvé')
//         .reduce((sum, p) => sum + Number(p.montant_demande || 0), 0) || 0

//       // Calculer le délai moyen (en jours)
//       const delaiData = allProjets?.filter(p => p.decision_finale).map(p => {
//         const soumission = new Date(p.created_at).getTime()
//         const decision = new Date(p.created_at).getTime() // À adapter si vous avez une date de décision
//         return (decision - soumission) / (1000 * 60 * 60 * 24)
//       }) || []

//       const delaiMoyen = delaiData.length > 0 ? Math.round(delaiData.reduce((a, b) => a + b, 0) / delaiData.length) : 0

//       // Documents moyens par projet
//       const { count: docsCount } = await supabase
//         .from('documents')
//         .select('*', { count: 'exact', head: true })

//       const documentsMoyen = totalProjets > 0 ? Math.round((docsCount || 0) / totalProjets) : 0

//       const montantsParMois = projetsParMois.map(m => ({
//         month: m.month,
//         montant: Math.round(m.montant / 1000),
//         approuve: Math.round(m.montantApprouve / 1000)
//       }))

//       setStats({
//         projetsParEtape,
//         projetsParMois,
//         projetsParRole,
//         decisionsStats,
//         tauxValidation,
//         topPromoteurs,
//         montantsParMois,
//         resume: {
//           totalProjets,
//           projetsActifs: totalProjets - projetsApprouves - projetsRefuses,
//           projetsApprouves,
//           projetsRefuses,
//           montantTotal,
//           montantApprouve,
//           tauxApprobation: totalProjets > 0 ? Math.round((projetsApprouves / totalProjets) * 100) : 0,
//           delaiMoyen,
//           documentsMoyen
//         }
//       })

//     } catch (error) {
//       console.error('Erreur chargement statistiques:', error)
//     } finally {
//       setLoading(false)
//       setIsRefreshing(false)
//     }
//   }, [periode])

//   useEffect(() => {
//     chargerStatistiques()
//   }, [chargerStatistiques])

//   const formatMontant = (montant: number) => {
//     if (montant >= 1000000) return `${(montant / 1000000).toFixed(1)}M USD`
//     if (montant >= 1000) return `${(montant / 1000).toFixed(0)}K USD`
//     return `${montant} USD`
//   }

//   if (loading) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
//           <p className="mt-4 text-sm font-medium text-gray-700">Chargement des statistiques...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200 px-6 py-4">
//         <div className="max-w-7xl mx-auto">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Statistiques & Analytiques</h1>
//               <p className="text-sm text-gray-500">Vue d'ensemble des performances de la plateforme</p>
//             </div>
//             <div className="flex items-center gap-3">
//               <select
//                 value={periode}
//                 onChange={(e) => setPeriode(e.target.value)}
//                 className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary/20"
//               >
//                 <option value="1">Dernier mois</option>
//                 <option value="3">3 derniers mois</option>
//                 <option value="6">6 derniers mois</option>
//                 <option value="12">12 derniers mois</option>
//                 <option value="24">24 derniers mois</option>
//               </select>
//               <button
//                 onClick={() => chargerStatistiques(true)}
//                 disabled={isRefreshing}
//                 className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg"
//               >
//                 <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
//               </button>
//             </div>
//           </div>

//           {/* Navigation par onglets */}
//           <div className="flex gap-4 mt-4 border-b border-gray-100">
//             {[
//               { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
//               { id: 'projects', label: 'Projets', icon: FolderOpen },
//               { id: 'financial', label: 'Finances', icon: DollarSign },
//               { id: 'performance', label: 'Performance', icon: Activity }
//             ].map(tab => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id as any)}
//                 className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
//                   activeTab === tab.id
//                     ? 'border-primary text-primary'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 <tab.icon className="h-4 w-4" />
//                 {tab.label}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Contenu */}
//       <div className="max-w-7xl mx-auto p-6 space-y-6">
//         {/* KPIs */}
//         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
//           <KpiCard
//             icon={FolderOpen}
//             label="Total Projets"
//             value={stats?.resume.totalProjets.toString() || '0'}
//             color="bg-blue-50 text-blue-600"
//             trend="+12%"
//           />
//           <KpiCard
//             icon={CheckCircle}
//             label="Approuvés"
//             value={stats?.resume.projetsApprouves.toString() || '0'}
//             color="bg-green-50 text-green-600"
//             trend={`${stats?.resume.tauxApprobation}%`}
//           />
//           <KpiCard
//             icon={AlertCircle}
//             label="Refusés"
//             value={stats?.resume.projetsRefuses.toString() || '0'}
//             color="bg-red-50 text-red-600"
//           />
//           <KpiCard
//             icon={DollarSign}
//             label="Montant Total"
//             value={formatMontant(stats?.resume.montantTotal || 0)}
//             color="bg-purple-50 text-purple-600"
//           />
//           <KpiCard
//             icon={Clock}
//             label="Délai Moyen"
//             value={`${stats?.resume.delaiMoyen || 0}j`}
//             color="bg-orange-50 text-orange-600"
//           />
//         </div>

//         {/* Graphiques selon l'onglet actif */}
//         {activeTab === 'overview' && (
//           <div className="space-y-6">
//             {/* Projets par mois + Distribution */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <ChartCard title="Évolution des projets" icon={BarChart3}>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <BarChart data={stats?.projetsParMois}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
//                     <XAxis dataKey="month" fontSize={12} tickLine={false} />
//                     <YAxis fontSize={12} tickLine={false} />
//                     <Tooltip />
//                     <Legend />
//                     <Bar dataKey="total" name="Total" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
//                     <Bar dataKey="approuves" name="Approuvés" fill={COLORS.success} radius={[4, 4, 0, 0]} />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </ChartCard>

//               <ChartCard title="Distribution des décisions" icon={PieChartIcon}>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={stats?.decisionsStats}
//                       cx="50%"
//                       cy="50%"
//                       innerRadius={60}
//                       outerRadius={100}
//                       paddingAngle={5}
//                       dataKey="value"
//                     >
//                       {stats?.decisionsStats.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={entry.color} />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                     <Legend />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </ChartCard>
//             </div>

//             {/* Étapes du pipeline */}
//             <ChartCard title="Pipeline des projets" icon={Activity}>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={stats?.projetsParEtape} layout="vertical">
//                   <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
//                   <XAxis type="number" fontSize={12} />
//                   <YAxis dataKey="name" type="category" fontSize={12} width={120} />
//                   <Tooltip />
//                   <Bar dataKey="value" name="Projets" radius={[0, 4, 4, 0]}>
//                     {stats?.projetsParEtape.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={Object.values(ETAPE_COLORS)[index % 5]} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             </ChartCard>
//           </div>
//         )}

//         {activeTab === 'projects' && (
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <ChartCard title="Taux de passage par étape" icon={TrendingUp}>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <AreaChart data={stats?.tauxValidation}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
//                     <XAxis dataKey="etape" fontSize={12} />
//                     <YAxis fontSize={12} domain={[0, 100]} />
//                     <Tooltip formatter={(value: any) => `${value}%`} />
//                     <Area type="monotone" dataKey="taux" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.2} />
//                   </AreaChart>
//                 </ResponsiveContainer>
//               </ChartCard>

//               <ChartCard title="Top 10 Promoteurs" icon={Users}>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <BarChart data={stats?.topPromoteurs} layout="vertical">
//                     <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
//                     <XAxis type="number" fontSize={12} />
//                     <YAxis dataKey="name" type="category" fontSize={11} width={100} />
//                     <Tooltip />
//                     <Bar dataKey="projets" name="Projets" fill={COLORS.purple} radius={[0, 4, 4, 0]} />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </ChartCard>
//             </div>
//           </div>
//         )}

//         {activeTab === 'financial' && (
//           <div className="space-y-6">
//             <ChartCard title="Évolution des montants (en milliers USD)" icon={DollarSign}>
//               <ResponsiveContainer width="100%" height={400}>
//                 <ComposedChart data={stats?.montantsParMois}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
//                   <XAxis dataKey="month" fontSize={12} />
//                   <YAxis fontSize={12} />
//                   <Tooltip formatter={(value: any) => `${value}K USD`} />
//                   <Legend />
//                   <Bar dataKey="montant" name="Montant Total" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
//                   <Line type="monotone" dataKey="approuve" name="Montant Approuvé" stroke={COLORS.success} strokeWidth={2} />
//                 </ComposedChart>
//               </ResponsiveContainer>
//             </ChartCard>
//           </div>
//         )}

//         {activeTab === 'performance' && (
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//   <ChartCard title="Répartition des projets par promoteur" icon={Users}>
//     {stats?.projetsParRole && stats.projetsParRole.filter(entry => entry.value > 0).length > 0 ? (
//       <ResponsiveContainer width="100%" height={300}>
//         <PieChart>
//           <Pie
//             data={stats.projetsParRole.filter(entry => entry.value > 0)}
//             cx="50%"
//             cy="50%"
//             innerRadius={60}
//             outerRadius={100}
//             paddingAngle={5}
//             dataKey="value"
//             nameKey="name"
//             label={({ name, value, percent }) => 
//               `${name}: ${value} (${((percent ?? 0) * 100).toFixed(0)}%)`
//             }
//             labelLine={true}
//             animationBegin={0}
//             animationDuration={1500}
//           >
//             {stats.projetsParRole
//               .filter(entry => entry.value > 0)
//               .map((entry, index) => (
//                 <Cell 
//                   key={`cell-promoteur-${index}`} 
//                   fill={[COLORS.primary, COLORS.success, COLORS.warning, COLORS.purple][index % 4]} 
//                   stroke="#fff"
//                   strokeWidth={2}
//                   className="hover:opacity-80 transition-opacity cursor-pointer"
//                 />
//               ))}
//           </Pie>
//           <Tooltip 
//             formatter={(value: number, name: string) => [`${value} promoteurs`, name]}
//             contentStyle={{ 
//               backgroundColor: 'white', 
//               border: '1px solid #E5E7EB',
//               borderRadius: '8px',
//               boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//             }}
//           />
//           <Legend 
//             verticalAlign="bottom" 
//             height={36}
//             iconType="circle"
//             formatter={(value) => <span className="text-sm text-gray-700 font-medium">{value}</span>}
//           />
//         </PieChart>
//       </ResponsiveContainer>
//     ) : (
//       <div className="flex items-center justify-center h-[300px] text-gray-400">
//         <div className="text-center">
//           <PieChartIcon className="h-12 w-12 mx-auto mb-2" />
//           <p className="text-sm">Aucune donnée disponible</p>
//         </div>
//       </div>
//     )}
//   </ChartCard>
// </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// // Composant carte KPI
// function KpiCard({ icon: Icon, label, value, color, trend }: {
//   icon: any
//   label: string
//   value: string
//   color: string
//   trend?: string
// }) {
//   return (
//     <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
//       <div className="flex items-center justify-between mb-2">
//         <div className={`p-2 rounded-lg ${color}`}>
//           <Icon className="h-5 w-5" />
//         </div>
//         {trend && (
//           <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
//             {trend}
//           </span>
//         )}
//       </div>
//       <p className="text-2xl font-bold text-gray-900">{value}</p>
//       <p className="text-xs text-gray-500 mt-1">{label}</p>
//     </div>
//   )
// }

// // Composant carte graphique
// function ChartCard({ title, icon: Icon, children }: {
//   title: string
//   icon: any
//   children: React.ReactNode
// }) {
//   return (
//     <div className="bg-white rounded-xl border border-gray-200 p-6">
//       <div className="flex items-center gap-2 mb-4">
//         <Icon className="h-5 w-5 text-gray-400" />
//         <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
//       </div>
//       {children}
//     </div>
//   )
// }

// app/dashboard/statistiques/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts'
import {
  TrendingUp, Users, FolderOpen, CheckCircle, Clock, AlertCircle,
  DollarSign, Activity, Filter, Calendar, Download, RefreshCw,
  Loader2, ChevronDown, BarChart3, PieChartIcon, TrendingDown
} from 'lucide-react'

// Types
type StatsData = {
  projetsParEtape: { name: string; value: number; count: number }[]
  projetsParMois: { month: string; total: number; approuves: number; refus: number }[]
  projetsParRole: { name: string; value: number }[]
  montantsParMois: { month: string; montant: number; approuve: number }[]
  decisionsStats: { name: string; value: number; color: string }[]
  tauxValidation: { etape: string; taux: number; projets: number }[]
  topPromoteurs: { name: string; projets: number; montant: number }[]
  statsFinancieres: {
    totalSollicite: number
    totalApprouve: number
    apportMoyen: number
    tauxRecouvrement: number
  }
  resume: {
    totalProjets: number
    projetsActifs: number
    projetsApprouves: number
    projetsRefuses: number
    montantTotal: number
    montantApprouve: number
    tauxApprobation: number
    delaiMoyen: number
    documentsMoyen: number
    tauxPaiementFrais: number
  }
}

const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  indigo: '#6366F1',
  pink: '#EC4899',
  teal: '#14B8A6',
  orange: '#F97316',
  gray: '#6B7280'
}

const STATUT_COLORS: Record<string, string> = {
  'brouillon': '#9CA3AF',
  'soumis': '#3B82F6',
  'en_revision': '#F59E0B',
  'valide': '#10B981',
  'rejete': '#EF4444'
}

export default function StatistiquesPage() {
  const { user: currentUser } = useAuth()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periode, setPeriode] = useState('12') // mois
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'financial' | 'performance'>('overview')

  const chargerStatistiques = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      else setIsRefreshing(true)

      const dateDebut = new Date()
      dateDebut.setMonth(dateDebut.getMonth() - parseInt(periode))

      // 1. Projets par statut (étape)
      const { data: projetsStatut } = await supabase
        .from('projets_fpi')
        .select('statut')
        .gte('created_at', dateDebut.toISOString())

      const statutCount = projetsStatut?.reduce((acc: Record<string, number>, p) => {
        acc[p.statut] = (acc[p.statut] || 0) + 1
        return acc
      }, {})

      const projetsParEtape = Object.entries(statutCount || {}).map(([name, value]) => ({
        name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value,
        count: value
      }))

      // 2. Projets par mois
      const { data: projetsMensuels } = await supabase
        .from('projets_fpi')
        .select('created_at, decision_finale, montant_sollicite')
        .gte('created_at', dateDebut.toISOString())
        .order('created_at')

      const monthlyData: Record<string, any> = {}
      projetsMensuels?.forEach(p => {
        const month = new Date(p.created_at).toLocaleString('fr-FR', { month: 'short', year: '2-digit' })
        if (!monthlyData[month]) {
          monthlyData[month] = { month, total: 0, approuves: 0, refus: 0, montant: 0, montantApprouve: 0 }
        }
        monthlyData[month].total++
        monthlyData[month].montant += Number(p.montant_sollicite) || 0
        if (p.decision_finale === 'favorable') {
          monthlyData[month].approuves++
          monthlyData[month].montantApprouve += Number(p.montant_sollicite) || 0
        }
        if (p.decision_finale === 'defavorable') monthlyData[month].refus++
      })

      const projetsParMois = Object.values(monthlyData)

      // 3. Projets par promoteur
      const { data: projetsPromoteur } = await supabase
        .from('projets_fpi')
        .select('promoteur_id')

      const promoteurStats = projetsPromoteur?.reduce((acc: Record<string, number>, p) => {
        acc[p.promoteur_id] = (acc[p.promoteur_id] || 0) + 1
        return acc
      }, {})

      const projetsParRole = [
        { name: '1 projet', value: Object.values(promoteurStats || {}).filter(v => v === 1).length },
        { name: '2-3 projets', value: Object.values(promoteurStats || {}).filter(v => v >= 2 && v <= 3).length },
        { name: '4-5 projets', value: Object.values(promoteurStats || {}).filter(v => v >= 4 && v <= 5).length },
        { name: '5+ projets', value: Object.values(promoteurStats || {}).filter(v => v > 5).length }
      ]

      // 4. Décisions du comité
      const { data: decisions } = await supabase
        .from('decisions_comite')
        .select('decision')

      const decisionCount = decisions?.reduce((acc: Record<string, number>, d) => {
        const key = d.decision || 'en_attente'
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})

      const decisionsStats = [
        { name: 'Favorable', value: decisionCount?.['favorable'] || 0, color: COLORS.success },
        { name: 'Défavorable', value: decisionCount?.['defavorable'] || 0, color: COLORS.danger },
        { name: 'Réserve', value: decisionCount?.['reserve'] || 0, color: COLORS.warning }
      ]

      // 5. Taux de validation par étape d'analyse
      const { data: validationData } = await supabase
        .from('rapport_analyse')
        .select('statut')
        .gte('created_at', dateDebut.toISOString())

      const totalAnalyses = validationData?.length || 1
      const tauxValidation = [
        { 
          etape: 'Analyse', 
          taux: Math.round(((validationData?.filter(p => p.statut === 'analyse').length || 0) / totalAnalyses) * 100), 
          projets: validationData?.filter(p => p.statut === 'analyse').length || 0 
        },
        { 
          etape: 'Transmis', 
          taux: Math.round(((validationData?.filter(p => p.statut === 'transmis').length || 0) / totalAnalyses) * 100), 
          projets: validationData?.filter(p => p.statut === 'transmis').length || 0 
        },
        { 
          etape: 'Validé Comité', 
          taux: Math.round(((validationData?.filter(p => p.statut === 'valide_comite').length || 0) / totalAnalyses) * 100), 
          projets: validationData?.filter(p => p.statut === 'valide_comite').length || 0 
        }
      ]

      // 6. Top promoteurs
      const { data: topPromoteursData } = await supabase
        .from('vue_projets_fpi_details')
        .select('promoteur_nom_complet, montant_sollicite, decision_finale')
        .limit(20)

      const promoteurAgg: Record<string, { projets: number; montant: number }> = {}
      topPromoteursData?.forEach(p => {
        const name = p.promoteur_nom_complet || 'Anonyme'
        if (!promoteurAgg[name]) promoteurAgg[name] = { projets: 0, montant: 0 }
        promoteurAgg[name].projets++
        promoteurAgg[name].montant += Number(p.montant_sollicite) || 0
      })

      const topPromoteurs = Object.entries(promoteurAgg)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.projets - a.projets)
        .slice(0, 10)

      // 7. Résumé global
      const { data: allProjets } = await supabase
        .from('projets_fpi')
        .select('decision_finale, montant_sollicite, created_at')

      const totalProjets = allProjets?.length || 0
      const projetsApprouves = allProjets?.filter(p => p.decision_finale === 'favorable').length || 0
      const projetsRefuses = allProjets?.filter(p => p.decision_finale === 'defavorable').length || 0
      const montantTotal = allProjets?.reduce((sum, p) => sum + Number(p.montant_sollicite || 0), 0) || 0
      const montantApprouve = allProjets?.filter(p => p.decision_finale === 'favorable')
        .reduce((sum, p) => sum + Number(p.montant_sollicite || 0), 0) || 0

      // Délai moyen
      const delaiData = allProjets?.filter(p => p.decision_finale).map(p => {
        const soumission = new Date(p.created_at).getTime()
        const decision = new Date(p.created_at).getTime() // À adapter si vous avez une date de décision
        return (decision - soumission) / (1000 * 60 * 60 * 24)
      }) || []

      const delaiMoyen = delaiData.length > 0 ? Math.round(delaiData.reduce((a, b) => a + b, 0) / delaiData.length) : 0

      // Documents moyens par projet
      const { count: docsCount } = await supabase
        .from('documents_fpi')
        .select('*', { count: 'exact', head: true })

      const documentsMoyen = totalProjets > 0 ? Math.round((docsCount || 0) / totalProjets) : 0

      // Taux de paiement des frais
      const { data: fraisPayes } = await supabase
        .from('frais_dossier_fpi')
        .select('est_paye')
        .eq('est_paye', true)

      const tauxPaiementFrais = totalProjets > 0 ? Math.round(((fraisPayes?.length || 0) / totalProjets) * 100) : 0

      // Statistiques financières
      const statsFinancieres = {
        totalSollicite: montantTotal,
        totalApprouve: montantApprouve,
        apportMoyen: totalProjets > 0 ? Math.round(montantTotal / totalProjets) : 0,
        tauxRecouvrement: projetsApprouves > 0 ? Math.round((projetsApprouves / totalProjets) * 100) : 0
      }

      const montantsParMois = projetsParMois.map(m => ({
        month: m.month,
        montant: Math.round(m.montant / 1000),
        approuve: Math.round(m.montantApprouve / 1000)
      }))

      setStats({
        projetsParEtape,
        projetsParMois,
        projetsParRole,
        decisionsStats,
        tauxValidation,
        topPromoteurs,
        montantsParMois,
        statsFinancieres,
        resume: {
          totalProjets,
          projetsActifs: totalProjets - projetsApprouves - projetsRefuses,
          projetsApprouves,
          projetsRefuses,
          montantTotal,
          montantApprouve,
          tauxApprobation: totalProjets > 0 ? Math.round((projetsApprouves / totalProjets) * 100) : 0,
          delaiMoyen,
          documentsMoyen,
          tauxPaiementFrais
        }
      })

    } catch (error) {
      console.error('Erreur chargement statistiques:', error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [periode])

  useEffect(() => {
    chargerStatistiques()
  }, [chargerStatistiques])

  const formatMontant = (montant: number) => {
    if (montant >= 1000000) return `${(montant / 1000000).toFixed(1)}M USD`
    if (montant >= 1000) return `${(montant / 1000).toFixed(0)}K USD`
    return `${montant} USD`
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-sm font-medium text-gray-700">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Statistiques & Analytiques FPI</h1>
              <p className="text-sm text-gray-500">Vue d'ensemble des performances de la plateforme FPI</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary/20"
              >
                <option value="1">Dernier mois</option>
                <option value="3">3 derniers mois</option>
                <option value="6">6 derniers mois</option>
                <option value="12">12 derniers mois</option>
                <option value="24">24 derniers mois</option>
              </select>
              <button
                onClick={() => chargerStatistiques(true)}
                disabled={isRefreshing}
                className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Navigation par onglets */}
          <div className="flex gap-4 mt-4 border-b border-gray-100">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
              { id: 'projects', label: 'Projets', icon: FolderOpen },
              { id: 'financial', label: 'Finances', icon: DollarSign },
              { id: 'performance', label: 'Performance', icon: Activity }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <KpiCard
            icon={FolderOpen}
            label="Total Projets"
            value={stats?.resume.totalProjets.toString() || '0'}
            color="bg-blue-50 text-blue-600"
            trend="+12%"
          />
          <KpiCard
            icon={CheckCircle}
            label="Favorables"
            value={stats?.resume.projetsApprouves.toString() || '0'}
            color="bg-green-50 text-green-600"
            trend={`${stats?.resume.tauxApprobation}%`}
          />
          <KpiCard
            icon={AlertCircle}
            label="Défavorables"
            value={stats?.resume.projetsRefuses.toString() || '0'}
            color="bg-red-50 text-red-600"
          />
          <KpiCard
            icon={DollarSign}
            label="Montant Total"
            value={formatMontant(stats?.resume.montantTotal || 0)}
            color="bg-purple-50 text-purple-600"
          />
          <KpiCard
            icon={Clock}
            label="Frais Payés"
            value={`${stats?.resume.tauxPaiementFrais || 0}%`}
            color="bg-orange-50 text-orange-600"
          />
        </div>

        {/* Graphiques selon l'onglet actif */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Projets par mois + Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Évolution des projets" icon={BarChart3}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats?.projetsParMois}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" fontSize={12} tickLine={false} />
                    <YAxis fontSize={12} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" name="Total" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="approuves" name="Favorables" fill={COLORS.success} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Décisions du comité" icon={PieChartIcon}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats?.decisionsStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats?.decisionsStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Statuts des projets */}
            <ChartCard title="Répartition par statut" icon={Activity}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.projetsParEtape} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis dataKey="name" type="category" fontSize={12} width={120} />
                  <Tooltip />
                  <Bar dataKey="value" name="Projets" radius={[0, 4, 4, 0]}>
                    {stats?.projetsParEtape.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={Object.values(STATUT_COLORS)[index % 5]} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Pipeline d'analyse" icon={TrendingUp}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats?.tauxValidation}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="etape" fontSize={12} />
                    <YAxis fontSize={12} domain={[0, 100]} />
                    <Tooltip formatter={(value: any) => `${value}%`} />
                    <Area type="monotone" dataKey="taux" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Top 10 Promoteurs" icon={Users}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats?.topPromoteurs} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" fontSize={12} />
                    <YAxis dataKey="name" type="category" fontSize={11} width={120} />
                    <Tooltip />
                    <Bar dataKey="projets" name="Projets" fill={COLORS.purple} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Répartition des promoteurs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Répartition des projets par promoteur" icon={Users}>
                {stats?.projetsParRole && stats.projetsParRole.filter(entry => entry.value > 0).length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.projetsParRole.filter(entry => entry.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, value, percent }) => 
                          `${name}: ${value} (${((percent ?? 0) * 100).toFixed(0)}%)`
                        }
                        labelLine={true}
                        animationBegin={0}
                        animationDuration={1500}
                      >
                        {stats.projetsParRole
                          .filter(entry => entry.value > 0)
                          .map((entry, index) => (
                            <Cell 
                              key={`cell-promoteur-${index}`} 
                              fill={[COLORS.primary, COLORS.success, COLORS.warning, COLORS.purple][index % 4]} 
                              stroke="#fff"
                              strokeWidth={2}
                              className="hover:opacity-80 transition-opacity cursor-pointer"
                            />
                          ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string) => [`${value} promoteurs`, name]}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-sm text-gray-700 font-medium">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-400">
                    <div className="text-center">
                      <PieChartIcon className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm">Aucune donnée disponible</p>
                    </div>
                  </div>
                )}
              </ChartCard>
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="space-y-6">
            <ChartCard title="Évolution des montants (en milliers USD)" icon={DollarSign}>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={stats?.montantsParMois}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value: any) => `${value}K USD`} />
                  <Legend />
                  <Bar dataKey="montant" name="Montant Sollicité" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="approuve" name="Montant Approuvé" stroke={COLORS.success} strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Indicateurs financiers */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Total Sollicité</p>
                <p className="text-2xl font-bold text-gray-900">{formatMontant(stats?.statsFinancieres.totalSollicite || 0)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Total Approuvé</p>
                <p className="text-2xl font-bold text-green-600">{formatMontant(stats?.statsFinancieres.totalApprouve || 0)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Montant Moyen</p>
                <p className="text-2xl font-bold text-blue-600">{formatMontant(stats?.statsFinancieres.apportMoyen || 0)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Taux Approbation</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.statsFinancieres.tauxRecouvrement || 0}%</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Répartition par secteur d'activité" icon={TrendingUp}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Agriculture', value: 35 },
                        { name: 'Technologie', value: 25 },
                        { name: 'Commerce', value: 20 },
                        { name: 'Services', value: 15 },
                        { name: 'Industrie', value: 5 }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill={COLORS.primary} />
                      <Cell fill={COLORS.success} />
                      <Cell fill={COLORS.warning} />
                      <Cell fill={COLORS.purple} />
                      <Cell fill={COLORS.pink} />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Délai moyen de traitement (jours)" icon={Clock}>
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center">
                    <Clock className="h-16 w-16 text-primary mx-auto mb-4" />
                    <p className="text-4xl font-bold text-gray-900">{stats?.resume.delaiMoyen || 0}</p>
                    <p className="text-sm text-gray-500 mt-2">jours en moyenne</p>
                  </div>
                </div>
              </ChartCard>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Composant carte KPI
function KpiCard({ icon: Icon, label, value, color, trend }: {
  icon: any
  label: string
  value: string
  color: string
  trend?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}

// Composant carte graphique
function ChartCard({ title, icon: Icon, children }: {
  title: string
  icon: any
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      {children}
    </div>
  )
}