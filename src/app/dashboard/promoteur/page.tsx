
// // app/dashboard/promoteur/page.tsx
// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import { supabase } from '@/lib/supabase';
// import { 
//   BarChart3, TrendingUp, TrendingDown, PieChart,
//   FileText, CheckCircle, XCircle, Clock,
//   Loader2, ChevronDown, Users, Target, DollarSign,
//   Briefcase, AlertCircle, ThumbsUp, ThumbsDown,
//   FolderOpen, CreditCard,
//   BarChart4
// } from 'lucide-react';
// import { PieChart as RePieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import Link from 'next/link';

// // Types
// type ProjetPromoteur = {
//   id: number;
//   nom_projet: string;
//   montant_sollicite: number | null;
//   etape: string;
//   created_at: string;
//   decision: string | null;
//   frais_paye: boolean;
//   cout_total: number | null;
//   apport_personnel: number | null;
//   nombre_emplois: number | null;
//   secteur_activite: string | null;
//   promoteur_province: string | null;
// };

// // Couleurs
// const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// export default function DashboardPromoteur() {
//   const { user } = useAuth();
//   const [projets, setProjets] = useState<ProjetPromoteur[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     chargerProjets();
//   }, [user]);

//   const getUserId = (): number => {
//     if (!user?.id) return 0;
//     const uid = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
//     return isNaN(uid) ? 0 : uid;
//   };

//   const chargerProjets = async () => {
//     setLoading(true);
//     try {
//       const uid = getUserId();
//       if (!uid) {
//         setProjets([]);
//         setLoading(false);
//         return;
//       }

//       const { data, error } = await supabase
//         .from('projets_fpi')
//         .select('*')
//         .eq('promoteur_id', uid)
//         .order('created_at', { ascending: false });

//       if (error) throw error;

//       // Récupérer les décisions des rapports
//       const projetIds = (data || []).map(p => p.id);
//       const { data: rapports } = await supabase
//         .from('rapport_analyse')
//         .select('projet_id, decision')
//         .in('projet_id', projetIds);

//       const decisionsMap: Record<number, string> = {};
//       (rapports || []).forEach(r => {
//         if (r.decision) decisionsMap[r.projet_id] = r.decision;
//       });

//       const projetsMapped: ProjetPromoteur[] = (data || []).map(p => ({
//         ...p,
//         decision: decisionsMap[p.id] || null,
//       }));

//       setProjets(projetsMapped);
//     } catch (error) {
//       console.error('Erreur chargement projets:', error);
//       setProjets([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ============================================
//   // STATISTIQUES
//   // ============================================
//   const totalProjets = projets.length;
  
//   const projetsSoumis = projets.filter(p => 
//     p.etape === 'soumis' || p.etape === 'reçu' || p.etape === 'creation'
//   ).length;
  
//   const projetsEnAnalyse = projets.filter(p => 
//     p.etape === 'analyse_tech'
//   ).length;
  
//   const projetsEnComite = projets.filter(p => 
//     p.etape === 'comité_crédit'
//   ).length;
  
//   const projetsApprouves = projets.filter(p => 
//     p.etape === 'financement_approuve'
//   ).length;
  
//   const projetsRejetes = projets.filter(p => 
//     p.etape === 'financement_rejete'
//   ).length;

//   const projetsEnAttentePaiement = projets.filter(p => 
//     !p.frais_paye && p.etape !== 'financement_approuve' && p.etape !== 'financement_rejete'
//   ).length;

//   // Montants
//   const montantTotalSollicite = projets.reduce((sum, p) => sum + (Number(p.montant_sollicite) || 0), 0);
//   const montantApprouve = projets
//     .filter(p => p.etape === 'financement_approuve')
//     .reduce((sum, p) => sum + (Number(p.montant_sollicite) || 0), 0);
//   const montantEnAttente = projets
//     .filter(p => p.etape !== 'financement_approuve' && p.etape !== 'financement_rejete')
//     .reduce((sum, p) => sum + (Number(p.montant_sollicite) || 0), 0);

//   // Taux
//   const tauxApprobation = totalProjets > 0 ? ((projetsApprouves / totalProjets) * 100).toFixed(1) : '0';
//   const tauxRejet = totalProjets > 0 ? ((projetsRejetes / totalProjets) * 100).toFixed(1) : '0';
  
//   const totalProjetsDecides = projetsApprouves + projetsRejetes;
//   const tauxApprobationDecides = totalProjetsDecides > 0 
//     ? ((projetsApprouves / totalProjetsDecides) * 100).toFixed(1) 
//     : '0';

//   // Décisions techniques
//   const decisionsFavorables = projets.filter(p => p.decision === 'favorable').length;
//   const decisionsDefavorables = projets.filter(p => p.decision === 'defavorable').length;
//   const decisionsReserves = projets.filter(p => p.decision === 'reserve').length;
//   const decisionsEnAttente = projets.filter(p => 
//     (p.etape === 'soumis' || p.etape === 'analyse_tech') && !p.decision
//   ).length;

//   // Emplois
//   const totalEmplois = projets.reduce((sum, p) => sum + (Number(p.nombre_emplois) || 0), 0);

//   // Données pour les Donuts
//   const donutStatutData = [
//     { name: 'Soumis', value: projetsSoumis, color: '#3B82F6' },
//     { name: 'En analyse', value: projetsEnAnalyse, color: '#F59E0B' },
//     { name: 'En comité', value: projetsEnComite, color: '#8B5CF6' },
//     { name: 'Approuvés', value: projetsApprouves, color: '#10B981' },
//     { name: 'Rejetés', value: projetsRejetes, color: '#EF4444' },
//   ].filter(item => item.value > 0);

//   const donutDecisionData = [
//     { name: 'Favorable', value: decisionsFavorables, color: '#10B981' },
//     { name: 'Défavorable', value: decisionsDefavorables, color: '#EF4444' },
//     { name: 'Réservé', value: decisionsReserves, color: '#F59E0B' },
//     { name: 'En attente', value: decisionsEnAttente, color: '#6B7280' },
//   ].filter(item => item.value > 0);

//   // Projets récents (5 derniers)
//   const projetsRecents = projets.slice(0, 5);

//   const formatMontant = (m: number): string => 
//     new Intl.NumberFormat('fr-FR', { 
//       style: 'currency', 
//       currency: 'USD', 
//       notation: 'compact',
//       maximumFractionDigits: 1 
//     }).format(m);

//   const formatDate = (d: string) => 
//     new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

//   const getEtapeLabel = (etape: string) => {
//     const labels: Record<string, string> = {
//       'creation': 'Brouillon',
//       'reçu': 'Reçu',
//       'soumis': 'Soumis',
//       'analyse_tech': 'Analyse technique',
//       'comité_crédit': 'Comité de crédit',
//       'financement_approuve': 'Approuvé',
//       'financement_rejete': 'Rejeté',
//     };
//     return labels[etape] || etape;
//   };

//   const getEtapeColor = (etape: string) => {
//     const colors: Record<string, string> = {
//       'soumis': 'bg-blue-100 text-blue-700',
//       'analyse_tech': 'bg-amber-100 text-amber-700',
//       'comité_crédit': 'bg-purple-100 text-purple-700',
//       'financement_approuve': 'bg-green-100 text-green-700',
//       'financement_rejete': 'bg-red-100 text-red-700',
//     };
//     return colors[etape] || 'bg-gray-100 text-gray-700';
//   };

//   const renderCustomLabel = useCallback(({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
//     const RADIAN = Math.PI / 180;
//     const radius = outerRadius + 25;
//     const x = cx + radius * Math.cos(-midAngle * RADIAN);
//     const y = cy + radius * Math.sin(-midAngle * RADIAN);

//     if (percent < 0.05) return null;

//     return (
//       <text 
//         x={x} 
//         y={y} 
//         fill="#4B5563"
//         textAnchor={x > cx ? 'start' : 'end'} 
//         dominantBaseline="central"
//         fontSize={11}
//         fontWeight={500}
//       >
//         {`${name} (${(percent * 100).toFixed(0)}%)`}
//       </text>
//     );
//   }, []);

//   const CustomTooltip = useCallback(({ active, payload }: any) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       return (
//         <div className="bg-white p-3 rounded-lg shadow-lg border">
//           <p className="text-sm font-semibold text-gray-800">{data.name}</p>
//           <p className="text-sm text-gray-600">
//             <span className="font-medium">{data.value}</span> projets
//           </p>
//         </div>
//       );
//     }
//     return null;
//   }, []);

//   const DonutChart = ({ data, title, icon }: { 
//     data: { name: string; value: number; color: string }[]; 
//     title: string; 
//     icon: React.ReactNode;
//   }) => (
//     <div className="bg-white rounded-xl border p-6">
//       <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
//         {icon}
//         {title}
//       </h3>
//       <ResponsiveContainer width="100%" height={350}>
//         <RePieChart>
//           <Pie
//             data={data}
//             cx="50%"
//             cy="50%"
//             innerRadius={70}
//             outerRadius={120}
//             paddingAngle={3}
//             dataKey="value"
//             label={renderCustomLabel}
//             isAnimationActive={false}
//             stroke="none"
//           >
//             {data.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={entry.color} />
//             ))}
//           </Pie>
//           <Tooltip content={<CustomTooltip />} />
//           <Legend 
//             verticalAlign="bottom" 
//             height={36}
//             formatter={(value: string) => <span className="text-sm text-gray-600">{value}</span>}
//           />
//         </RePieChart>
//       </ResponsiveContainer>
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <div className="text-center">
//           <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
//           <p className="text-gray-500">Chargement de votre tableau de bord...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* En-tête */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <div className="p-2  rounded-lg">
//             <BarChart4 className="h-6 w-6 text-primary" />
//           </div>
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
//             <p className="text-sm text-gray-500">Vue d'ensemble de vos projets de financement</p>
//           </div>
//         </div>
//         <Link
//           href="/mes-projets"
//           className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600  hover:bg-primary-dark transition-colors"
//         >
//           <FolderOpen className="h-4 w-4" />
//           Tous mes projets
//         </Link>
//       </div>

//       {/* KPIs Principaux */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         <div className="bg-white rounded-xl p-5 border hover:shadow-md transition-shadow">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="p-2 bg-blue-50 rounded-lg">
//               <FolderOpen className="h-5 w-5 text-blue-600" />
//             </div>
//           </div>
//           <p className="text-2xl font-bold text-gray-800">{totalProjets}</p>
//           <p className="text-xs text-gray-500">Total projets</p>
//         </div>

//         <div className="bg-white rounded-xl p-5 border hover:shadow-md transition-shadow">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="p-2 bg-amber-50 rounded-lg">
//               <Clock className="h-5 w-5 text-amber-600" />
//             </div>
//           </div>
//           <p className="text-2xl font-bold text-amber-600">{projetsSoumis + projetsEnAnalyse + projetsEnComite}</p>
//           <p className="text-xs text-gray-500">En cours de traitement</p>
//         </div>

//         <div className="bg-white rounded-xl p-5 border hover:shadow-md transition-shadow">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="p-2 bg-green-50 rounded-lg">
//               <CheckCircle className="h-5 w-5 text-green-600" />
//             </div>
//           </div>
//           <p className="text-2xl font-bold text-green-600">{projetsApprouves}</p>
//           <p className="text-xs text-gray-500">Projets approuvés</p>
//         </div>

//         <div className="bg-white rounded-xl p-5 border hover:shadow-md transition-shadow">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="p-2 bg-red-50 rounded-lg">
//               <XCircle className="h-5 w-5 text-red-600" />
//             </div>
//           </div>
//           <p className="text-2xl font-bold text-red-600">{projetsRejetes}</p>
//           <p className="text-xs text-gray-500">Projets rejetés</p>
//         </div>
//       </div>

//       {/* Taux et montants */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         <div className="bg-white rounded-xl p-4 border">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm text-gray-500">Taux d'approbation</span>
//             <ThumbsUp className="h-4 w-4 text-green-500" />
//           </div>
//           <p className="text-2xl font-bold text-green-600">{tauxApprobation}%</p>
//           <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
//             <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${tauxApprobation}%` }}></div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl p-4 border">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm text-gray-500">Taux de rejet</span>
//             <ThumbsDown className="h-4 w-4 text-red-500" />
//           </div>
//           <p className="text-2xl font-bold text-red-600">{tauxRejet}%</p>
//           <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
//             <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${tauxRejet}%` }}></div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl p-4 border">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm text-gray-500">Montant total sollicité</span>
//             <DollarSign className="h-4 w-4 text-blue-500" />
//           </div>
//           <p className="text-xl font-bold text-blue-600">{formatMontant(montantTotalSollicite)}</p>
//         </div>

//         <div className="bg-white rounded-xl p-4 border">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm text-gray-500">Emplois prévus</span>
//             <Users className="h-4 w-4 text-indigo-500" />
//           </div>
//           <p className="text-xl font-bold text-indigo-600">{totalEmplois}</p>
//         </div>
//       </div>

//       {/* GRAPHIQUES DONUT */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <DonutChart 
//           data={donutStatutData}
//           title="Statut de vos projets"
//           icon={<PieChart className="h-5 w-5 text-primary" />}
//         />
        
//         <DonutChart 
//           data={donutDecisionData}
//           title="Décisions d'analyse technique"
//           icon={<Target className="h-5 w-5 text-primary" />}
//         />
//       </div>

//       {/* Montants par statut */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
//           <p className="text-sm text-gray-600 mb-1">Montant approuvé</p>
//           <p className="text-2xl font-bold text-green-700">{formatMontant(montantApprouve)}</p>
//           <p className="text-xs text-gray-500 mt-1">{projetsApprouves} projets</p>
//         </div>

//         <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
//           <p className="text-sm text-gray-600 mb-1">Montant en attente</p>
//           <p className="text-2xl font-bold text-blue-700">{formatMontant(montantEnAttente)}</p>
//           <p className="text-xs text-gray-500 mt-1">{projetsSoumis + projetsEnAnalyse + projetsEnComite} projets</p>
//         </div>

//         <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-5 border border-amber-200">
//           <p className="text-sm text-gray-600 mb-1">En attente de paiement</p>
//           <p className="text-2xl font-bold text-amber-700">{projetsEnAttentePaiement}</p>
//           <p className="text-xs text-gray-500 mt-1">projets non payés</p>
//         </div>
//       </div>

//       {/* Projets récents */}
//       {/* <div className="bg-white rounded-xl border">
//         <div className="p-5 border-b">
//           <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
//             <Clock className="h-5 w-5 text-primary" />
//             Projets récents
//           </h2>
//         </div>
//         <div className="divide-y divide-gray-100">
//           {projetsRecents.length === 0 ? (
//             <div className="p-12 text-center">
//               <FolderOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
//               <p className="text-gray-500">Aucun projet pour le moment</p>
//               <Link
//                 href="/dashboard/promoteur/projets/nouveau"
//                 className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors"
//               >
//                 <FileText className="h-4 w-4" />
//                 Créer un projet
//               </Link>
//             </div>
//           ) : (
//             projetsRecents.map((projet) => (
//               <Link
//                 key={projet.id}
//                 href={`/dashboard/promoteur/projets/${projet.id}`}
//                 className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
//               >
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-3">
//                     <h3 className="text-sm font-medium text-gray-900 truncate">
//                       {projet.nom_projet}
//                     </h3>
//                     <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEtapeColor(projet.etape)}`}>
//                       {getEtapeLabel(projet.etape)}
//                     </span>
//                     {projet.decision && (
//                       <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
//                         projet.decision === 'favorable' ? 'bg-green-100 text-green-700' :
//                         projet.decision === 'defavorable' ? 'bg-red-100 text-red-700' :
//                         'bg-yellow-100 text-yellow-700'
//                       }`}>
//                         {projet.decision}
//                       </span>
//                     )}
//                   </div>
//                   <p className="text-xs text-gray-500 mt-1">
//                     {formatDate(projet.created_at)}
//                     {projet.secteur_activite && ` • ${projet.secteur_activite}`}
//                   </p>
//                 </div>
                
//                 <div className="flex items-center gap-4 ml-4">
//                   <p className="text-sm font-semibold text-gray-900">
//                     {formatMontant(projet.montant_sollicite || 0)}
//                   </p>
//                   <ChevronDown className="h-4 w-4 text-gray-400 rotate-270" />
//                 </div>
//               </Link>
//             ))
//           )}
//         </div>

//         {projets.length > 5 && (
//           <div className="p-4 border-t border-gray-100 bg-gray-50/50">
//             <Link
//               href="/dashboard/promoteur/projets"
//               className="flex items-center justify-center gap-2 w-full py-2 text-sm text-primary hover:bg-white rounded-lg transition-colors"
//             >
//               Voir tous les projets ({totalProjets})
//               <ChevronDown className="h-4 w-4 -rotate-90" />
//             </Link>
//           </div>
//         )}
//       </div> */}

//       {/* Guide rapide */}
//       {totalProjets === 0 && (
//         <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
//           <h3 className="font-semibold text-gray-900 mb-3">Commencez votre parcours</h3>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
//             <div className="flex items-start gap-3">
//               <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0 mt-0.5">1</span>
//               <p>Remplissez le formulaire FPI avec les informations de votre projet</p>
//             </div>
//             <div className="flex items-start gap-3">
//               <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0 mt-0.5">2</span>
//               <p>Téléchargez les documents requis et payez les frais de dossier</p>
//             </div>
//             <div className="flex items-start gap-3">
//               <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0 mt-0.5">3</span>
//               <p>Suivez l'avancement de votre demande jusqu'à la décision finale</p>
//             </div>
//           </div>
//           <div className="mt-4 text-center">
//             <Link
//               href="/dashboard/promoteur/projets/nouveau"
//               className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
//             >
//               <FileText className="h-5 w-5" />
//               Créer mon premier projet
//             </Link>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// app/dashboard/promoteur/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  BarChart3, TrendingUp, TrendingDown, PieChart,
  FileText, CheckCircle, XCircle, Clock,
  Loader2, ChevronDown, Users, Target, DollarSign,
  Briefcase, AlertCircle, ThumbsUp, ThumbsDown,
  FolderOpen, CreditCard,
  BarChart4, Plus
} from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import FormulaireFPI from '@/components/fpi/FormulaireFPI';

// Types
type ProjetPromoteur = {
  id: number;
  nom_projet: string;
  montant_sollicite: number | null;
  etape: string;
  created_at: string;
  decision: string | null;
  frais_paye: boolean;
  cout_total: number | null;
  apport_personnel: number | null;
  nombre_emplois: number | null;
  secteur_activite: string | null;
  promoteur_province: string | null;
};

// Couleurs
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function DashboardPromoteur() {
  const { user } = useAuth();
  const [projets, setProjets] = useState<ProjetPromoteur[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormulaireFPI, setShowFormulaireFPI] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    chargerProjets();
  }, [user]);

  const getUserId = (): number => {
    if (!user?.id) return 0;
    const uid = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    return isNaN(uid) ? 0 : uid;
  };

  const chargerProjets = async () => {
    setLoading(true);
    try {
      const uid = getUserId();
      if (!uid) {
        setProjets([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('projets_fpi')
        .select('*')
        .eq('promoteur_id', uid)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Récupérer les décisions des rapports
      const projetIds = (data || []).map(p => p.id);
      const { data: rapports } = await supabase
        .from('rapport_analyse')
        .select('projet_id, decision')
        .in('projet_id', projetIds);

      const decisionsMap: Record<number, string> = {};
      (rapports || []).forEach(r => {
        if (r.decision) decisionsMap[r.projet_id] = r.decision;
      });

      const projetsMapped: ProjetPromoteur[] = (data || []).map(p => ({
        ...p,
        decision: decisionsMap[p.id] || null,
      }));

      setProjets(projetsMapped);
    } catch (error) {
      console.error('Erreur chargement projets:', error);
      setProjets([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // STATISTIQUES
  // ============================================
  const totalProjets = projets.length;
  
  const projetsSoumis = projets.filter(p => 
    p.etape === 'soumis' || p.etape === 'reçu' || p.etape === 'creation'
  ).length;
  
  const projetsEnAnalyse = projets.filter(p => 
    p.etape === 'analyse_tech'
  ).length;
  
  const projetsEnComite = projets.filter(p => 
    p.etape === 'comité_crédit'
  ).length;
  
  const projetsApprouves = projets.filter(p => 
    p.etape === 'financement_approuve'
  ).length;
  
  const projetsRejetes = projets.filter(p => 
    p.etape === 'financement_rejete'
  ).length;

  const projetsEnAttentePaiement = projets.filter(p => 
    !p.frais_paye && p.etape !== 'financement_approuve' && p.etape !== 'financement_rejete'
  ).length;

  // Montants
  const montantTotalSollicite = projets.reduce((sum, p) => sum + (Number(p.montant_sollicite) || 0), 0);
  const montantApprouve = projets
    .filter(p => p.etape === 'financement_approuve')
    .reduce((sum, p) => sum + (Number(p.montant_sollicite) || 0), 0);
  const montantEnAttente = projets
    .filter(p => p.etape !== 'financement_approuve' && p.etape !== 'financement_rejete')
    .reduce((sum, p) => sum + (Number(p.montant_sollicite) || 0), 0);

  // Taux
  const tauxApprobation = totalProjets > 0 ? ((projetsApprouves / totalProjets) * 100).toFixed(1) : '0';
  const tauxRejet = totalProjets > 0 ? ((projetsRejetes / totalProjets) * 100).toFixed(1) : '0';
  
  const totalProjetsDecides = projetsApprouves + projetsRejetes;
  const tauxApprobationDecides = totalProjetsDecides > 0 
    ? ((projetsApprouves / totalProjetsDecides) * 100).toFixed(1) 
    : '0';

  // Décisions techniques
  const decisionsFavorables = projets.filter(p => p.decision === 'favorable').length;
  const decisionsDefavorables = projets.filter(p => p.decision === 'defavorable').length;
  const decisionsReserves = projets.filter(p => p.decision === 'reserve').length;
  const decisionsEnAttente = projets.filter(p => 
    (p.etape === 'soumis' || p.etape === 'analyse_tech') && !p.decision
  ).length;

  // Emplois
  const totalEmplois = projets.reduce((sum, p) => sum + (Number(p.nombre_emplois) || 0), 0);

  // Données pour les Donuts
  const donutStatutData = [
    { name: 'Soumis', value: projetsSoumis, color: '#3B82F6' },
    { name: 'En analyse', value: projetsEnAnalyse, color: '#F59E0B' },
    { name: 'En comité', value: projetsEnComite, color: '#8B5CF6' },
    { name: 'Approuvés', value: projetsApprouves, color: '#10B981' },
    { name: 'Rejetés', value: projetsRejetes, color: '#EF4444' },
  ].filter(item => item.value > 0);

  const donutDecisionData = [
    { name: 'Favorable', value: decisionsFavorables, color: '#10B981' },
    { name: 'Défavorable', value: decisionsDefavorables, color: '#EF4444' },
    { name: 'Réservé', value: decisionsReserves, color: '#F59E0B' },
    { name: 'En attente', value: decisionsEnAttente, color: '#6B7280' },
  ].filter(item => item.value > 0);

  // Projets récents (5 derniers)
  const projetsRecents = projets.slice(0, 5);

  const formatMontant = (m: number): string => 
    new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'USD', 
      notation: 'compact',
      maximumFractionDigits: 1 
    }).format(m);

  const formatDate = (d: string) => 
    new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  const getEtapeLabel = (etape: string) => {
    const labels: Record<string, string> = {
      'creation': 'Brouillon',
      'reçu': 'Reçu',
      'soumis': 'Soumis',
      'analyse_tech': 'Analyse technique',
      'comité_crédit': 'Comité de crédit',
      'financement_approuve': 'Approuvé',
      'financement_rejete': 'Rejeté',
    };
    return labels[etape] || etape;
  };

  const getEtapeColor = (etape: string) => {
    const colors: Record<string, string> = {
      'soumis': 'bg-blue-100 text-blue-700',
      'analyse_tech': 'bg-amber-100 text-amber-700',
      'comité_crédit': 'bg-purple-100 text-purple-700',
      'financement_approuve': 'bg-green-100 text-green-700',
      'financement_rejete': 'bg-red-100 text-red-700',
    };
    return colors[etape] || 'bg-gray-100 text-gray-700';
  };

  const renderCustomLabel = useCallback(({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="#4B5563"
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={11}
        fontWeight={500}
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  }, []);

  const CustomTooltip = useCallback(({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="text-sm font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{data.value}</span> projets
          </p>
        </div>
      );
    }
    return null;
  }, []);

  const DonutChart = ({ data, title, icon }: { 
    data: { name: string; value: number; color: string }[]; 
    title: string; 
    icon: React.ReactNode;
  }) => (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <RePieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={120}
            paddingAngle={3}
            dataKey="value"
            label={renderCustomLabel}
            isAnimationActive={false}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value: string) => <span className="text-sm text-gray-600">{value}</span>}
          />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Messages Toast */}
      {success && (
        <div className="fixed top-4 right-4 z-50 max-w-sm animate-slide-in">
          <div className="rounded-2xl shadow-2xl p-4 flex items-start gap-3 backdrop-blur-sm bg-green-50/95 border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Succès</p>
              <p className="text-xs text-gray-600 mt-0.5">{success}</p>
            </div>
            <button onClick={() => setSuccess('')} className="text-gray-400 hover:text-gray-600 transition-colors">
              <span className="sr-only">Fermer</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg">
            <BarChart4 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-sm text-gray-500">Vue d'ensemble de vos projets de financement</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFormulaireFPI(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all transform hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle demande</span>
          </button>
          <Link
            href="/mes-projets"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <FolderOpen className="h-4 w-4" />
            Tous mes projets
          </Link>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FolderOpen className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalProjets}</p>
          <p className="text-xs text-gray-500">Total projets</p>
        </div>

        <div className="bg-white rounded-xl p-5 border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600">{projetsSoumis + projetsEnAnalyse + projetsEnComite}</p>
          <p className="text-xs text-gray-500">En cours de traitement</p>
        </div>

        <div className="bg-white rounded-xl p-5 border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">{projetsApprouves}</p>
          <p className="text-xs text-gray-500">Projets approuvés</p>
        </div>

        <div className="bg-white rounded-xl p-5 border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600">{projetsRejetes}</p>
          <p className="text-xs text-gray-500">Projets rejetés</p>
        </div>
      </div>

      {/* Taux et montants */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Taux d'approbation</span>
            <ThumbsUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{tauxApprobation}%</p>
          <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${tauxApprobation}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Taux de rejet</span>
            <ThumbsDown className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{tauxRejet}%</p>
          <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${tauxRejet}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Montant total sollicité</span>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-blue-600">{formatMontant(montantTotalSollicite)}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Emplois prévus</span>
            <Users className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-xl font-bold text-indigo-600">{totalEmplois}</p>
        </div>
      </div>

      {/* GRAPHIQUES DONUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChart 
          data={donutStatutData}
          title="Statut de vos projets"
          icon={<PieChart className="h-5 w-5 text-primary" />}
        />
        
        <DonutChart 
          data={donutDecisionData}
          title="Décisions d'analyse technique"
          icon={<Target className="h-5 w-5 text-primary" />}
        />
      </div>

      {/* Montants par statut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Montant approuvé</p>
          <p className="text-2xl font-bold text-green-700">{formatMontant(montantApprouve)}</p>
          <p className="text-xs text-gray-500 mt-1">{projetsApprouves} projets</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Montant en attente</p>
          <p className="text-2xl font-bold text-blue-700">{formatMontant(montantEnAttente)}</p>
          <p className="text-xs text-gray-500 mt-1">{projetsSoumis + projetsEnAnalyse + projetsEnComite} projets</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-5 border border-amber-200">
          <p className="text-sm text-gray-600 mb-1">En attente de paiement</p>
          <p className="text-2xl font-bold text-amber-700">{projetsEnAttentePaiement}</p>
          <p className="text-xs text-gray-500 mt-1">projets non payés</p>
        </div>
      </div>

      {/* Guide rapide */}
      {totalProjets === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-3">Commencez votre parcours</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0 mt-0.5">1</span>
              <p>Remplissez le formulaire FPI avec les informations de votre projet</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0 mt-0.5">2</span>
              <p>Téléchargez les documents requis et payez les frais de dossier</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0 mt-0.5">3</span>
              <p>Suivez l'avancement de votre demande jusqu'à la décision finale</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowFormulaireFPI(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
            >
              <FileText className="h-5 w-5" />
              Créer mon premier projet
            </button>
          </div>
        </div>
      )}

      {/* MODAL FORMULAIRE FPI */}
      {showFormulaireFPI && (
        <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
            <FormulaireFPI
              onClose={() => setShowFormulaireFPI(false)}
              onSuccess={async (projetData?: any) => {
                setShowFormulaireFPI(false);
                await chargerProjets();
                setSuccess('✅ Votre demande FPI a été soumise avec succès !');
              }}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}