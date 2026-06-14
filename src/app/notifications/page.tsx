// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/context/AuthContext';
// import { supabase } from '@/lib/supabase';
// import Navigation from '@/components/Navigation';
// import {
//   Bell, BellRing, CheckCheck, Search, Filter, X, Trash2,
//   Clock, FileText, Shield, CreditCard, CheckCircle, 
//   XCircle, AlertCircle, TrendingUp, Users, Building2,
//   DollarSign, FileCheck, Activity, ChevronDown, SlidersHorizontal,
//   ArrowRight, Loader2, Inbox, RefreshCw, Check
// } from 'lucide-react';
// import Link from 'next/link';

// // Types
// // Types mis à jour selon votre schéma
// type Notification = {
//   id: number; // BIGSERIAL devient number
//   user_id: number; // BIGINT
//   type: 'info' | 'success' | 'warning' | 'error' | 'paiement' | 'document' | 'validation' | 'analyse' | 'decision';
//   titre: string;
//   message: string;
//   lien: string | null;
//   projet_id: number | null;
//   document_id: number | null;
//   rapport_id: number | null;
//   est_lue: boolean;
//   date_lecture: string | null;
//   icone: string | null;
//   created_at: string;
//   updated_at: string;
//   projet_titre?: string | null;
//   user_name?: string;
//   user_email?: string;
//   temps_ecoule?: string;
// };

// type FilterTab = 'tous' | 'non_lues' | 'lues';
// type FilterType = 'tous' | 'info' | 'success' | 'warning' | 'error' | 'paiement' | 'document' | 'validation' | 'analyse' | 'decision';

// const iconeMap: Record<string, any> = {
//   DollarSign, FileText, Clock, FileCheck, Shield, CreditCard,
//   CheckCircle, Activity, XCircle, BellRing, AlertCircle: Activity,
//   Check, TrendingUp, Users, Building2,
// };

// export default function NotificationsPage() {
//   const router = useRouter();
//   const { user, isAuthenticated } = useAuth();
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [activeTab, setActiveTab] = useState<FilterTab>('tous');
//   const [selectedType, setSelectedType] = useState<FilterType>('tous');
//   const [showFilters, setShowFilters] = useState(false);
//   const [selectionMode, setSelectionMode] = useState(false);
//   const [selectedIds, setSelectedIds] = useState<number[]>([]);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [notificationToDelete, setNotificationToDelete] = useState<number | null>(null);

//   // Mapping des couleurs
//   const getNotificationColor = (type: string) => {
//     const colors: Record<string, string> = {
//       'info': 'bg-blue-50 border-blue-200 text-blue-600',
//       'success': 'bg-green-50 border-green-200 text-green-600',
//       'warning': 'bg-yellow-50 border-yellow-200 text-yellow-600',
//       'error': 'bg-red-50 border-red-200 text-red-600',
//       'paiement': 'bg-yellow-50 border-yellow-200 text-yellow-600',
//       'document': 'bg-purple-50 border-purple-200 text-purple-600',
//       'validation': 'bg-green-50 border-green-200 text-green-600',
//       'analyse': 'bg-indigo-50 border-indigo-200 text-indigo-600',
//       'decision': 'bg-orange-50 border-orange-200 text-orange-600',
//     };
//     return colors[type] || 'bg-gray-50 border-gray-200 text-gray-600';
//   };

//   const getTypeLabel = (type: string) => {
//     const labels: Record<string, string> = {
//       'info': 'Information',
//       'success': 'Succès',
//       'warning': 'Alerte',
//       'error': 'Erreur',
//       'paiement': 'Paiement',
//       'document': 'Document',
//       'validation': 'Validation',
//       'analyse': 'Analyse',
//       'decision': 'Décision',
//     };
//     return labels[type] || type;
//   };

//   const getTypeBadgeColor = (type: string) => {
//     const colors: Record<string, string> = {
//       'info': 'bg-blue-100 text-blue-700',
//       'success': 'bg-green-100 text-green-700',
//       'warning': 'bg-yellow-100 text-yellow-700',
//       'error': 'bg-red-100 text-red-700',
//       'paiement': 'bg-yellow-100 text-yellow-700',
//       'document': 'bg-purple-100 text-purple-700',
//       'validation': 'bg-green-100 text-green-700',
//       'analyse': 'bg-indigo-100 text-indigo-700',
//       'decision': 'bg-orange-100 text-orange-700',
//     };
//     return colors[type] || 'bg-gray-100 text-gray-700';
//   };

//   // Calculer le temps écoulé
//   const getTempsEcoule = (date: string) => {
//     const now = new Date();
//     const notifDate = new Date(date);
//     const diff = Math.floor((now.getTime() - notifDate.getTime()) / 1000);
    
//     if (diff < 60) return 'À l\'instant';
//     if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
//     if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
//     if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} j`;
//     return notifDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
//   };

//   // Formater la date complète
//   const formatDateComplete = (date: string) => {
//     return new Date(date).toLocaleDateString('fr-FR', {
//       day: 'numeric',
//       month: 'long',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   // Charger les notifications
//   const chargerNotifications = useCallback(async () => {
//     if (!user) return;
    
//     setLoading(true);
//     try {
//       const { data, error } = await supabase
//         .from('notifications')
//         .select(`
//           id, user_id, type, titre, message, lien,
//           projet_id, est_lue, icone, created_at,
//           projets!projet_id (titre)
//         `)
//         .eq('user_id', user.id)
//         .order('created_at', { ascending: false })
//         .limit(100);

//       if (error) {
//         if (error.code === '42P01') {
//           setNotifications([]);
//         } else {
//           throw error;
//         }
//       } else {
//         const formattedData = data?.map((item: any) => ({
//           ...item,
//           projet_titre: item.projets?.titre || null,
//           temps_ecoule: getTempsEcoule(item.created_at),
//           est_lue: item.est_lue || false,
//           type: item.type || 'info',
//         })) || [];
        
//         setNotifications(formattedData);
//       }
//     } catch (error: any) {
//       console.error('Erreur chargement:', error);
//       setNotifications([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [user]);

//   // Appliquer les filtres
//   useEffect(() => {
//     let filtered = [...notifications];

//     // Filtre par statut (lu/non lu)
//     if (activeTab === 'non_lues') {
//       filtered = filtered.filter(n => !n.est_lue);
//     } else if (activeTab === 'lues') {
//       filtered = filtered.filter(n => n.est_lue);
//     }

//     // Filtre par type
//     if (selectedType !== 'tous') {
//       filtered = filtered.filter(n => n.type === selectedType);
//     }

//     // Recherche textuelle
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(n => 
//         n.titre.toLowerCase().includes(term) ||
//         n.message.toLowerCase().includes(term) ||
//         n.projet_titre?.toLowerCase().includes(term)
//       );
//     }

//     setFilteredNotifications(filtered);
//   }, [notifications, activeTab, selectedType, searchTerm]);

//   useEffect(() => {
//     if (user) chargerNotifications();
//   }, [user, chargerNotifications]);

//   // Marquer comme lu
//   const marquerLue = async (id: number) => {
//     try {
//       await supabase.rpc('marquer_notification_lue', {
//         p_notification_id: id,
//         p_user_id: user?.id
//       });
      
//       setNotifications(prev => 
//         prev.map(n => n.id === id ? { ...n, est_lue: true } : n)
//       );
//     } catch (error) {
//       console.error('Erreur marquage:', error);
//     }
//   };

//   // Marquer tout comme lu
//   const marquerToutLu = async () => {
//     setActionLoading(true);
//     try {
//       await supabase.rpc('marquer_toutes_notifications_lues', {
//         p_user_id: user?.id
//       });
      
//       setNotifications(prev => prev.map(n => ({ ...n, est_lue: true })));
//     } catch (error) {
//       console.error('Erreur:', error);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // Marquer la sélection comme lue
//   const marquerSelectionLue = async () => {
//     if (selectedIds.length === 0) return;
//     setActionLoading(true);
//     try {
//       for (const id of selectedIds) {
//         await supabase.rpc('marquer_notification_lue', {
//           p_notification_id: id,
//           p_user_id: user?.id
//         });
//       }
      
//       setNotifications(prev => 
//         prev.map(n => selectedIds.includes(n.id) ? { ...n, est_lue: true } : n)
//       );
//       setSelectedIds([]);
//       setSelectionMode(false);
//     } catch (error) {
//       console.error('Erreur:', error);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // Supprimer une notification
//   const supprimerNotification = async (id: number) => {
//     try {
//       await supabase.from('notifications').delete().eq('id', id);
//       setNotifications(prev => prev.filter(n => n.id !== id));
//       setFilteredNotifications(prev => prev.filter(n => n.id !== id));
//     } catch (error) {
//       console.error('Erreur suppression:', error);
//     }
//   };

//   // Supprimer la sélection
//   const supprimerSelection = async () => {
//     if (selectedIds.length === 0) return;
//     setActionLoading(true);
//     try {
//       for (const id of selectedIds) {
//         await supabase.from('notifications').delete().eq('id', id);
//       }
      
//       setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
//       setSelectedIds([]);
//       setSelectionMode(false);
//     } catch (error) {
//       console.error('Erreur suppression:', error);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // Supprimer tout
//   const supprimerTout = async () => {
//     setActionLoading(true);
//     try {
//       const idsToDelete = activeTab === 'tous' 
//         ? notifications.map(n => n.id)
//         : filteredNotifications.map(n => n.id);
      
//       for (const id of idsToDelete) {
//         await supabase.from('notifications').delete().eq('id', id);
//       }
      
//       setNotifications(prev => prev.filter(n => !idsToDelete.includes(n.id)));
//     } catch (error) {
//       console.error('Erreur suppression:', error);
//     } finally {
//       setActionLoading(false);
//       setShowDeleteConfirm(false);
//     }
//   };

//   // Gérer le clic sur une notification
//   const handleNotificationClick = async (notification: Notification) => {
//     if (selectionMode) {
//       toggleSelection(notification.id);
//       return;
//     }

//     if (!notification.est_lue) {
//       await marquerLue(notification.id);
//     }

//     if (notification.lien) {
//       router.push(notification.lien);
//     }
//   };

//   // Toggle sélection
//   const toggleSelection = (id: number) => {
//     setSelectedIds(prev => 
//       prev.includes(id) 
//         ? prev.filter(i => i !== id)
//         : [...prev, id]
//     );
//   };

//   // Sélectionner tout
//   const selectionnerTout = () => {
//     if (selectedIds.length === filteredNotifications.length) {
//       setSelectedIds([]);
//     } else {
//       setSelectedIds(filteredNotifications.map(n => n.id));
//     }
//   };

//   // Statistiques
//   const stats = {
//     total: notifications.length,
//     nonLues: notifications.filter(n => !n.est_lue).length,
//     lues: notifications.filter(n => n.est_lue).length,
//   };

//   // Types uniques pour le filtre
//   const typesUniques = [...new Set(notifications.map(n => n.type))];

//   if (!isAuthenticated) {
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
//       <Navigation />
      
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* En-tête */}
//         <div className="mb-8">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
//               <BellRing className="h-5 w-5 text-primary" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
//               <p className="text-sm text-gray-500">
//                 Gérez toutes vos notifications en un seul endroit
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Barre de statistiques */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
//             <div className="flex items-center justify-between mb-2">
//               <Bell className="h-5 w-5 text-gray-400" />
//               <span className="text-xs font-medium text-gray-500">Total</span>
//             </div>
//             <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
//           </div>
          
//           <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
//             <div className="flex items-center justify-between mb-2">
//               <div className="w-5 h-5 rounded-full bg-primary"></div>
//               <span className="text-xs font-medium text-gray-500">Non lues</span>
//             </div>
//             <p className="text-2xl font-bold text-primary">{stats.nonLues}</p>
//           </div>

//           <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
//             <div className="flex items-center justify-between mb-2">
//               <CheckCheck className="h-5 w-5 text-green-500" />
//               <span className="text-xs font-medium text-gray-500">Lues</span>
//             </div>
//             <p className="text-2xl font-bold text-green-600">{stats.lues}</p>
//           </div>

//           <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
//             <div className="flex items-center justify-between mb-2">
//               <SlidersHorizontal className="h-5 w-5 text-gray-400" />
//               <span className="text-xs font-medium text-gray-500">Types</span>
//             </div>
//             <p className="text-2xl font-bold text-gray-900">{typesUniques.length}</p>
//           </div>
//         </div>

//         {/* Contenu principal */}
//         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//           {/* Barre d'outils */}
//           <div className="p-4 border-b border-gray-100">
//             <div className="flex flex-col sm:flex-row gap-4">
//               {/* Recherche */}
//               <div className="flex-1 relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Rechercher dans les notifications..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//                 />
//                 {searchTerm && (
//                   <button
//                     onClick={() => setSearchTerm('')}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     <X className="h-4 w-4" />
//                   </button>
//                 )}
//               </div>

//               {/* Actions */}
//               <div className="flex items-center gap-2">
//                 {/* Filtres */}
//                 <div className="relative">
//                   <button
//                     onClick={() => setShowFilters(!showFilters)}
//                     className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
//                       showFilters || selectedType !== 'tous'
//                         ? 'bg-primary/10 text-primary'
//                         : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
//                     }`}
//                   >
//                     <Filter className="h-4 w-4" />
//                     Filtres
//                     {selectedType !== 'tous' && (
//                       <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
//                         1
//                       </span>
//                     )}
//                   </button>

//                   {showFilters && (
//                     <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-10">
//                       <h4 className="text-sm font-medium text-gray-900 mb-3">Type de notification</h4>
//                       <div className="space-y-1">
//                         <button
//                           onClick={() => { setSelectedType('tous'); setShowFilters(false); }}
//                           className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
//                             selectedType === 'tous' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50'
//                           }`}
//                         >
//                           Tous les types
//                         </button>
//                         {typesUniques.map(type => (
//                           <button
//                             key={type}
//                             onClick={() => { setSelectedType(type); setShowFilters(false); }}
//                             className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
//                               selectedType === type ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50'
//                             }`}
//                           >
//                             <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getTypeBadgeColor(type)}`}></span>
//                             {getTypeLabel(type)}
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <button
//                   onClick={() => setSelectionMode(!selectionMode)}
//                   className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
//                     selectionMode
//                       ? 'bg-primary/10 text-primary'
//                       : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
//                   }`}
//                 >
//                   <Check className="h-4 w-4" />
//                   Sélection
//                 </button>

//                 <button
//                   onClick={chargerNotifications}
//                   className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all"
//                 >
//                   <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Onglets */}
//           <div className="flex items-center justify-between px-4 border-b border-gray-100">
//             <div className="flex gap-0">
//               {[
//                 { id: 'tous', label: 'Toutes', count: stats.total },
//                 { id: 'non_lues', label: 'Non lues', count: stats.nonLues },
//                 { id: 'lues', label: 'Lues', count: stats.lues },
//               ].map(tab => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id as FilterTab)}
//                   className={`relative px-6 py-3 text-sm font-medium transition-all ${
//                     activeTab === tab.id
//                       ? 'text-primary'
//                       : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {tab.label}
//                   <span className={`ml-2 text-xs ${
//                     activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
//                   } px-2 py-0.5 rounded-full`}>
//                     {tab.count}
//                   </span>
//                   {activeTab === tab.id && (
//                     <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
//                   )}
//                 </button>
//               ))}
//             </div>

//             {/* Actions groupées */}
//             {activeTab === 'non_lues' && stats.nonLues > 0 && (
//               <button
//                 onClick={marquerToutLu}
//                 disabled={actionLoading}
//                 className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
//               >
//                 {actionLoading ? (
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                 ) : (
//                   <CheckCheck className="h-4 w-4" />
//                 )}
//                 Tout marquer comme lu
//               </button>
//             )}
//           </div>

//           {/* Barre d'actions de sélection */}
//           {selectionMode && selectedIds.length > 0 && (
//             <div className="px-4 py-3 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
//               <div className="flex items-center gap-4">
//                 <button
//                   onClick={selectionnerTout}
//                   className="text-sm text-primary hover:underline"
//                 >
//                   {selectedIds.length === filteredNotifications.length ? 'Désélectionner tout' : 'Sélectionner tout'}
//                 </button>
//                 <span className="text-sm text-gray-600">
//                   {selectedIds.length} sélectionnée(s)
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={marquerSelectionLue}
//                   disabled={actionLoading}
//                   className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   <CheckCheck className="h-4 w-4" />
//                   Marquer comme lu
//                 </button>
//                 <button
//                   onClick={supprimerSelection}
//                   disabled={actionLoading}
//                   className="flex items-center gap-2 px-4 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
//                 >
//                   <Trash2 className="h-4 w-4" />
//                   Supprimer
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Liste des notifications */}
//           <div className="divide-y divide-gray-50">
//             {loading ? (
//               <div className="flex flex-col items-center justify-center py-20">
//                 <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
//                 <p className="text-gray-500">Chargement des notifications...</p>
//               </div>
//             ) : filteredNotifications.length === 0 ? (
//               <div className="flex flex-col items-center justify-center py-20">
//                 <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
//                   <Inbox className="h-8 w-8 text-gray-400" />
//                 </div>
//                 <h3 className="text-lg font-medium text-gray-900 mb-1">
//                   {searchTerm || selectedType !== 'tous' 
//                     ? 'Aucun résultat trouvé' 
//                     : activeTab === 'non_lues' 
//                       ? 'Tout est lu !' 
//                       : 'Aucune notification'}
//                 </h3>
//                 <p className="text-sm text-gray-500 mb-6">
//                   {searchTerm || selectedType !== 'tous'
//                     ? 'Essayez de modifier vos critères de recherche'
//                     : activeTab === 'non_lues'
//                       ? 'Vous avez traité toutes vos notifications'
//                       : 'Vous recevrez des notifications pour vos dossiers'}
//                 </p>
//                 {(searchTerm || selectedType !== 'tous') && (
//                   <button
//                     onClick={() => { setSearchTerm(''); setSelectedType('tous'); setActiveTab('tous'); }}
//                     className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors"
//                   >
//                     <X className="h-4 w-4" />
//                     Réinitialiser les filtres
//                   </button>
//                 )}
//               </div>
//             ) : (
//               filteredNotifications.map((notification) => (
//                 <div
//                   key={notification.id}
//                   onClick={() => handleNotificationClick(notification)}
//                   className={`group px-4 sm:px-6 py-4 hover:bg-gray-50/50 transition-all cursor-pointer ${
//                     !notification.est_lue ? 'bg-primary/[0.02]' : ''
//                   }`}
//                 >
//                   <div className="flex items-start gap-4">
//                     {/* Checkbox de sélection */}
//                     {selectionMode && (
//                       <div className="flex-shrink-0 pt-1" onClick={(e) => e.stopPropagation()}>
//                         <div
//                           onClick={() => toggleSelection(notification.id)}
//                           className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
//                             selectedIds.includes(notification.id)
//                               ? 'bg-primary border-primary'
//                               : 'border-gray-300 hover:border-primary'
//                           }`}
//                         >
//                           {selectedIds.includes(notification.id) && (
//                             <Check className="h-3 w-3 text-white" />
//                           )}
//                         </div>
//                       </div>
//                     )}

//                     {/* Icône */}
//                     <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border ${
//                       getNotificationColor(notification.type)
//                     }`}>
//                       {(() => {
//                         const IconComponent = notification.icone && iconeMap[notification.icone] 
//                           ? iconeMap[notification.icone] 
//                           : BellRing;
//                         return <IconComponent className="h-5 w-5" />;
//                       })()}
//                     </div>

//                     {/* Contenu */}
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-start justify-between gap-4">
//                         <div>
//                           <div className="flex items-center gap-2 flex-wrap">
//                             <h3 className={`text-sm font-semibold ${
//                               !notification.est_lue ? 'text-gray-900' : 'text-gray-700'
//                             }`}>
//                               {notification.titre}
//                             </h3>
//                             {!notification.est_lue && (
//                               <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
//                             )}
//                             <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${getTypeBadgeColor(notification.type)}`}>
//                               {getTypeLabel(notification.type)}
//                             </span>
//                           </div>
//                           <p className="text-sm text-gray-600 mt-1 line-clamp-2">
//                             {notification.message}
//                           </p>
//                           <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
//                             <span className="flex items-center gap-1">
//                               <Clock className="h-3 w-3" />
//                               {notification.temps_ecoule || 'À l\'instant'}
//                             </span>
//                             {notification.projet_titre && (
//                               <span className="flex items-center gap-1 text-primary/70">
//                                 <FileText className="h-3 w-3" />
//                                 {notification.projet_titre}
//                               </span>
//                             )}
//                           </div>
//                         </div>

//                         {/* Actions */}
//                         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
//                           {notification.lien && (
//                             <Link
//                               href={notification.lien}
//                               onClick={(e) => e.stopPropagation()}
//                               className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
//                               title="Voir le détail"
//                             >
//                               <ArrowRight className="h-4 w-4" />
//                             </Link>
//                           )}
//                           {!notification.est_lue && (
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 marquerLue(notification.id);
//                               }}
//                               className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
//                               title="Marquer comme lu"
//                             >
//                               <CheckCheck className="h-4 w-4" />
//                             </button>
//                           )}
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setNotificationToDelete(notification.id);
//                               setShowDeleteConfirm(true);
//                             }}
//                             className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
//                             title="Supprimer"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>

//           {/* Pied de page */}
//           {filteredNotifications.length > 0 && (
//             <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
//               <p className="text-xs text-gray-500">
//                 {filteredNotifications.length} notification{filteredNotifications.length > 1 ? 's' : ''} affichée{filteredNotifications.length > 1 ? 's' : ''}
//               </p>
//               <button
//                 onClick={() => {
//                   setNotificationToDelete(-1);
//                   setShowDeleteConfirm(true);
//                 }}
//                 className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
//               >
//                 <Trash2 className="h-3 w-3" />
//                 Vider la corbeille
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Modal de confirmation de suppression */}
//       {showDeleteConfirm && (
//         <div className="fixed inset-0 z-[100]">
//           <div 
//             className="fixed inset-0 bg-black/50 backdrop-blur-sm"
//             onClick={() => setShowDeleteConfirm(false)}
//           />
//           <div className="fixed inset-0 flex items-center justify-center p-4">
//             <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
//               <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mb-4 mx-auto">
//                 <Trash2 className="h-6 w-6 text-red-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
//                 Supprimer {notificationToDelete === -1 ? 'toutes les notifications' : 'la notification'}
//               </h3>
//               <p className="text-sm text-gray-500 text-center mb-6">
//                 {notificationToDelete === -1 
//                   ? 'Êtes-vous sûr de vouloir supprimer définitivement toutes les notifications ? Cette action est irréversible.'
//                   : 'Êtes-vous sûr de vouloir supprimer définitivement cette notification ?'}
//               </p>
//               <div className="flex gap-3">
//                 <button
//                   onClick={() => setShowDeleteConfirm(false)}
//                   className="flex-1 px-4 py-2.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
//                 >
//                   Annuler
//                 </button>
//                 <button
//                   onClick={() => {
//                     if (notificationToDelete === -1) {
//                       supprimerTout();
//                     } else if (notificationToDelete) {
//                       supprimerNotification(notificationToDelete);
//                       setShowDeleteConfirm(false);
//                     }
//                   }}
//                   disabled={actionLoading}
//                   className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
//                 >
//                   {actionLoading ? (
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                   ) : (
//                     <Trash2 className="h-4 w-4" />
//                   )}
//                   Supprimer
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import {
  Bell, BellRing, CheckCheck, Search, Filter, X, Trash2,
  Clock, FileText, Shield, CreditCard, CheckCircle, 
  XCircle, AlertCircle, TrendingUp, Users, Building2,
  DollarSign, FileCheck, Activity, ChevronDown, SlidersHorizontal,
  ArrowRight, Loader2, Inbox, RefreshCw, Check, Eye, EyeOff,
  Calendar, Tag, Info
} from 'lucide-react';
import Link from 'next/link';

// Types adaptés à votre schéma SQL
type Notification = {
  id: number;
  user_id: number;
  type: 'info' | 'success' | 'warning' | 'error' | 'paiement' | 'document' | 'validation' | 'analyse' | 'decision';
  titre: string;
  message: string;
  lien: string | null;
  projet_id: number | null;
  document_id: number | null;
  rapport_id: number | null;
  est_lue: boolean;
  date_lecture: string | null;
  icone: string | null;
  created_at: string;
  updated_at: string;
  projet_titre?: string | null;
  temps_ecoule?: string;
};

type FilterTab = 'tous' | 'non_lues' | 'lues';
type FilterType = 'tous' | 'info' | 'success' | 'warning' | 'error' | 'paiement' | 'document' | 'validation' | 'analyse' | 'decision';

// Mapping des icônes
const iconeMap: Record<string, any> = {
  DollarSign,
  FileText,
  Clock,
  FileCheck,
  Shield,
  CreditCard,
  CheckCircle,
  Activity,
  XCircle,
  BellRing,
  AlertCircle: Activity,
  Check,
  TrendingUp,
  Users,
  Building2,
  Eye,
  Info,
  Calendar,
  Tag,
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  // États
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('tous');
  const [selectedType, setSelectedType] = useState<FilterType>('tous');
  const [showFilters, setShowFilters] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fonctions utilitaires
  const getTempsEcoule = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = Math.floor((now.getTime() - notifDate.getTime()) / 1000);
    
    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} j`;
    return notifDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      'info': 'bg-blue-50 border-blue-200 text-blue-600',
      'success': 'bg-green-50 border-green-200 text-green-600',
      'warning': 'bg-yellow-50 border-yellow-200 text-yellow-600',
      'error': 'bg-red-50 border-red-200 text-red-600',
      'paiement': 'bg-yellow-50 border-yellow-200 text-yellow-600',
      'document': 'bg-purple-50 border-purple-200 text-purple-600',
      'validation': 'bg-green-50 border-green-200 text-green-600',
      'analyse': 'bg-indigo-50 border-indigo-200 text-indigo-600',
      'decision': 'bg-orange-50 border-orange-200 text-orange-600',
    };
    return colors[type] || 'bg-gray-50 border-gray-200 text-gray-600';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'info': 'Information',
      'success': 'Succès',
      'warning': 'Alerte',
      'error': 'Erreur',
      'paiement': 'Paiement',
      'document': 'Document',
      'validation': 'Validation',
      'analyse': 'Analyse',
      'decision': 'Décision',
    };
    return labels[type] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      'info': 'bg-blue-100 text-blue-700',
      'success': 'bg-green-100 text-green-700',
      'warning': 'bg-yellow-100 text-yellow-700',
      'error': 'bg-red-100 text-red-700',
      'paiement': 'bg-yellow-100 text-yellow-700',
      'document': 'bg-purple-100 text-purple-700',
      'validation': 'bg-green-100 text-green-700',
      'analyse': 'bg-indigo-100 text-indigo-700',
      'decision': 'bg-orange-100 text-orange-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  // Charger les notifications
  const chargerNotifications = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Essayer d'abord avec la vue
      const { data: vueData, error: vueError } = await supabase
        .from('vue_notifications_details')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (vueError) {
        console.log('Vue non disponible, fallback sur table directe');
        
        // Fallback: requête directe sur la table
        const { data, error } = await supabase
          .from('notifications')
          .select(`
            id,
            user_id,
            type,
            titre,
            message,
            lien,
            projet_id,
            document_id,
            rapport_id,
            est_lue,
            date_lecture,
            icone,
            created_at,
            updated_at,
            projets!projet_id (titre)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) {
          if (error.code === '42P01') {
            // Table non trouvée
            setError('La table des notifications n\'existe pas encore. Veuillez exécuter le script SQL de création.');
            setNotifications([]);
          } else {
            throw error;
          }
        } else {
          const formattedData = data?.map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            type: item.type || 'info',
            titre: item.titre,
            message: item.message,
            lien: item.lien,
            projet_id: item.projet_id,
            document_id: item.document_id,
            rapport_id: item.rapport_id,
            est_lue: item.est_lue || false,
            date_lecture: item.date_lecture,
            icone: item.icone,
            created_at: item.created_at,
            updated_at: item.updated_at,
            projet_titre: item.projets?.titre || null,
            temps_ecoule: getTempsEcoule(item.created_at),
          })) || [];
          
          setNotifications(formattedData);
        }
      } else {
        // Données de la vue
        const formattedData = vueData?.map((item: any) => ({
          ...item,
          temps_ecoule: item.temps_ecoule || getTempsEcoule(item.created_at),
          est_lue: item.est_lue || false,
        })) || [];
        
        setNotifications(formattedData);
      }
    } catch (error: any) {
      console.error('Erreur chargement notifications:', error);
      setError('Erreur lors du chargement des notifications. Veuillez réessayer.');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      chargerNotifications();
    }
  }, [user, chargerNotifications]);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...notifications];

    // Filtre par statut (lu/non lu)
    if (activeTab === 'non_lues') {
      filtered = filtered.filter(n => !n.est_lue);
    } else if (activeTab === 'lues') {
      filtered = filtered.filter(n => n.est_lue);
    }

    // Filtre par type
    if (selectedType !== 'tous') {
      filtered = filtered.filter(n => n.type === selectedType);
    }

    // Recherche textuelle
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(n => 
        n.titre?.toLowerCase().includes(term) ||
        n.message?.toLowerCase().includes(term) ||
        n.projet_titre?.toLowerCase().includes(term) ||
        getTypeLabel(n.type).toLowerCase().includes(term)
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, activeTab, selectedType, searchTerm]);

  // Marquer une notification comme lue
  const marquerLue = async (id: number) => {
    try {
      // Essayer d'abord la fonction RPC
      const { error: rpcError } = await supabase
        .rpc('marquer_notification_lue', {
          p_notification_id: id,
          p_user_id: user?.id
        });

      if (rpcError) {
        // Fallback: mise à jour directe
        const { error: updateError } = await supabase
          .from('notifications')
          .update({ 
            est_lue: true,
            date_lecture: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', user?.id);

        if (updateError) throw updateError;
      }
      
      // Mise à jour locale
      setNotifications(prev => 
        prev.map(n => n.id === id ? { 
          ...n, 
          est_lue: true,
          date_lecture: new Date().toISOString()
        } : n)
      );
      setFilteredNotifications(prev => 
        prev.map(n => n.id === id ? { 
          ...n, 
          est_lue: true,
          date_lecture: new Date().toISOString()
        } : n)
      );
      
    } catch (error: any) {
      console.error('Erreur marquage:', error.message);
      // Mise à jour locale en dernier recours
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, est_lue: true } : n)
      );
      setFilteredNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, est_lue: true } : n)
      );
    }
  };

  // Marquer toutes les notifications comme lues
  const marquerToutLu = async () => {
    setActionLoading(true);
    try {
      // Essayer la fonction RPC
      const { error: rpcError } = await supabase
        .rpc('marquer_toutes_notifications_lues', {
          p_user_id: user?.id
        });

      if (rpcError) {
        // Fallback: mise à jour directe
        const { error: updateError } = await supabase
          .from('notifications')
          .update({ 
            est_lue: true,
            date_lecture: new Date().toISOString()
          })
          .eq('user_id', user?.id)
          .eq('est_lue', false);

        if (updateError) throw updateError;
      }
      
      setNotifications(prev => prev.map(n => ({ 
        ...n, 
        est_lue: true,
        date_lecture: n.est_lue ? n.date_lecture : new Date().toISOString()
      })));
      setFilteredNotifications(prev => prev.map(n => ({ 
        ...n, 
        est_lue: true,
        date_lecture: n.est_lue ? n.date_lecture : new Date().toISOString()
      })));
      
    } catch (error: any) {
      console.error('Erreur marquage tout lu:', error.message);
      // Mise à jour locale
      setNotifications(prev => prev.map(n => ({ ...n, est_lue: true })));
      setFilteredNotifications(prev => prev.map(n => ({ ...n, est_lue: true })));
    } finally {
      setActionLoading(false);
    }
  };

  // Marquer la sélection comme lue
  const marquerSelectionLue = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          est_lue: true,
          date_lecture: new Date().toISOString()
        })
        .in('id', selectedIds)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => selectedIds.includes(n.id) ? { 
          ...n, 
          est_lue: true,
          date_lecture: new Date().toISOString()
        } : n)
      );
      setFilteredNotifications(prev => 
        prev.map(n => selectedIds.includes(n.id) ? { 
          ...n, 
          est_lue: true,
          date_lecture: new Date().toISOString()
        } : n)
      );
      setSelectedIds([]);
      setSelectionMode(false);
      
    } catch (error: any) {
      console.error('Erreur marquage sélection:', error.message);
      // Mise à jour locale
      setNotifications(prev => 
        prev.map(n => selectedIds.includes(n.id) ? { ...n, est_lue: true } : n)
      );
      setFilteredNotifications(prev => 
        prev.map(n => selectedIds.includes(n.id) ? { ...n, est_lue: true } : n)
      );
      setSelectedIds([]);
      setSelectionMode(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Supprimer une notification
  const supprimerNotification = async (id: number) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setNotifications(prev => prev.filter(n => n.id !== id));
      setFilteredNotifications(prev => prev.filter(n => n.id !== id));
      
    } catch (error: any) {
      console.error('Erreur suppression:', error.message);
      // Suppression locale en fallback
      setNotifications(prev => prev.filter(n => n.id !== id));
      setFilteredNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  // Supprimer la sélection
  const supprimerSelection = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', selectedIds)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
      setFilteredNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
      setSelectedIds([]);
      setSelectionMode(false);
      
    } catch (error: any) {
      console.error('Erreur suppression sélection:', error.message);
      // Suppression locale en fallback
      setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
      setFilteredNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
      setSelectedIds([]);
      setSelectionMode(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Supprimer tout
  const supprimerTout = async () => {
    setActionLoading(true);
    
    try {
      let idsToDelete: number[];
      
      if (activeTab === 'tous') {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('user_id', user?.id);
        
        if (error) throw error;
        idsToDelete = notifications.map(n => n.id);
      } else {
        idsToDelete = filteredNotifications.map(n => n.id);
        const { error } = await supabase
          .from('notifications')
          .delete()
          .in('id', idsToDelete)
          .eq('user_id', user?.id);
        
        if (error) throw error;
      }
      
      setNotifications(prev => prev.filter(n => !idsToDelete.includes(n.id)));
      setFilteredNotifications(prev => prev.filter(n => !idsToDelete.includes(n.id)));
      
    } catch (error: any) {
      console.error('Erreur suppression tout:', error.message);
      // Suppression locale en fallback
      const idsToDelete = activeTab === 'tous' 
        ? notifications.map(n => n.id)
        : filteredNotifications.map(n => n.id);
      
      setNotifications(prev => prev.filter(n => !idsToDelete.includes(n.id)));
      setFilteredNotifications(prev => prev.filter(n => !idsToDelete.includes(n.id)));
    } finally {
      setActionLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Gérer le clic sur une notification
  const handleNotificationClick = async (notification: Notification) => {
    if (selectionMode) {
      toggleSelection(notification.id);
      return;
    }

    // Marquer comme lue si nécessaire
    if (!notification.est_lue) {
      await marquerLue(notification.id);
    }

    // Naviguer vers le lien
    if (notification.lien) {
      router.push(notification.lien);
    }
  };

  // Toggle sélection
  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  // Sélectionner tout
  const selectionnerTout = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map(n => n.id));
    }
  };

  // Statistiques
  const stats = {
    total: notifications.length,
    nonLues: notifications.filter(n => !n.est_lue).length,
    lues: notifications.filter(n => n.est_lue).length,
  };

  // Types uniques pour le filtre
  const typesUniques = [...new Set(notifications.map(n => n.type))];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm">
                <BellRing className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Notifications
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Gérez et consultez toutes vos notifications
                </p>
              </div>
            </div>
            
            <button
              onClick={chargerNotifications}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-amber-800">Information</h3>
                <p className="text-sm text-amber-700 mt-1">{error}</p>
                <button
                  onClick={chargerNotifications}
                  className="mt-2 text-sm font-medium text-amber-800 hover:text-amber-900 underline"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Barre de statistiques */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Bell className="h-5 w-5 text-gray-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">notifications</p>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BellRing className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-gray-500">Non lues</span>
            </div>
            <p className="text-3xl font-bold text-primary">{stats.nonLues}</p>
            <p className="text-xs text-gray-500 mt-1">à traiter</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCheck className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">Lues</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.lues}</p>
            <p className="text-xs text-gray-500 mt-1">traitées</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Tag className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">Types</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">{typesUniques.length}</p>
            <p className="text-xs text-gray-500 mt-1">différents</p>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Barre d'outils */}
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher dans les notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Filtre par type */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      showFilters || selectedType !== 'tous'
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <Filter className="h-4 w-4" />
                    {selectedType !== 'tous' ? getTypeLabel(selectedType) : 'Type'}
                    {selectedType !== 'tous' && (
                      <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center ml-1">
                        <X className="h-3 w-3" onClick={(e) => {
                          e.stopPropagation();
                          setSelectedType('tous');
                        }} />
                      </span>
                    )}
                    <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>

                  {showFilters && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowFilters(false)} />
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-3 z-20">
                        <div className="flex items-center justify-between mb-2 px-2">
                          <h4 className="text-sm font-medium text-gray-900">Type de notification</h4>
                          {selectedType !== 'tous' && (
                            <button
                              onClick={() => setSelectedType('tous')}
                              className="text-xs text-primary hover:underline"
                            >
                              Réinitialiser
                            </button>
                          )}
                        </div>
                        <div className="space-y-1">
                          <button
                            onClick={() => { setSelectedType('tous'); setShowFilters(false); }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                              selectedType === 'tous' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-50 text-gray-600'
                            }`}
                          >
                            Tous les types
                          </button>
                          {typesUniques.map(type => (
                            <button
                              key={type}
                              onClick={() => { setSelectedType(type as FilterType); setShowFilters(false); }}
                              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-3 ${
                                selectedType === type ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-50 text-gray-600'
                              }`}
                            >
                              <span className={`w-2.5 h-2.5 rounded-full ${getTypeBadgeColor(type).split(' ')[0]}`}></span>
                              {getTypeLabel(type)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Mode sélection */}
                <button
                  onClick={() => {
                    setSelectionMode(!selectionMode);
                    setSelectedIds([]);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    selectionMode
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  <Check className="h-4 w-4" />
                  {selectionMode ? 'Terminé' : 'Sélectionner'}
                </button>
              </div>
            </div>
          </div>

          {/* Onglets */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 border-b border-gray-100">
            <div className="flex gap-0 overflow-x-auto">
              {[
                { id: 'tous' as FilterTab, label: 'Toutes', count: stats.total },
                { id: 'non_lues' as FilterTab, label: 'Non lues', count: stats.nonLues },
                { id: 'lues' as FilterTab, label: 'Lues', count: stats.lues },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 sm:px-6 py-3.5 text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {tab.label}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      activeTab === tab.id 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {tab.count}
                    </span>
                  </span>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Action rapide */}
            {activeTab === 'non_lues' && stats.nonLues > 0 && (
              <button
                onClick={marquerToutLu}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-colors mt-2 sm:mt-0"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCheck className="h-4 w-4" />
                )}
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Barre d'actions de sélection */}
          {selectionMode && selectedIds.length > 0 && (
            <div className="px-4 sm:px-6 py-3 bg-primary/5 border-b border-primary/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={selectionnerTout}
                  className="text-sm text-primary hover:underline"
                >
                  {selectedIds.length === filteredNotifications.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                </button>
                <span className="text-sm text-gray-600 font-medium">
                  {selectedIds.length} sélectionnée{selectedIds.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={marquerSelectionLue}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCheck className="h-4 w-4" />
                  )}
                  Marquer comme lu
                </button>
                <button
                  onClick={supprimerSelection}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Supprimer
                </button>
              </div>
            </div>
          )}

          {/* Liste des notifications */}
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </div>
                <p className="text-gray-500 mt-4 font-medium">Chargement des notifications...</p>
                <p className="text-xs text-gray-400 mt-1">Veuillez patienter un instant</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
                  {searchTerm || selectedType !== 'tous' ? (
                    <Search className="h-10 w-10 text-gray-400" />
                  ) : activeTab === 'non_lues' ? (
                    <CheckCheck className="h-10 w-10 text-green-400" />
                  ) : (
                    <Inbox className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm || selectedType !== 'tous' 
                    ? 'Aucun résultat trouvé' 
                    : activeTab === 'non_lues' 
                      ? 'Tout est lu ! 🎉' 
                      : 'Aucune notification'}
                </h3>
                <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
                  {searchTerm || selectedType !== 'tous'
                    ? 'Essayez de modifier vos critères de recherche ou de réinitialiser les filtres.'
                    : activeTab === 'non_lues'
                      ? 'Vous avez traité toutes vos notifications. Revenez plus tard pour les nouvelles mises à jour.'
                      : 'Vous recevrez des notifications concernant vos projets, paiements et mises à jour importantes.'}
                </p>
                {(searchTerm || selectedType !== 'tous') && (
                  <button
                    onClick={() => { 
                      setSearchTerm(''); 
                      setSelectedType('tous'); 
                      setActiveTab('tous'); 
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`group relative px-4 sm:px-6 py-4 hover:bg-gray-50/80 transition-all cursor-pointer ${
                    !notification.est_lue 
                      ? 'bg-primary/[0.02] border-l-4 border-l-primary' 
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox de sélection */}
                    {selectionMode && (
                      <div 
                        className="flex-shrink-0 pt-1" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => toggleSelection(notification.id)}
                          className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                            selectedIds.includes(notification.id)
                              ? 'bg-primary border-primary scale-100'
                              : 'border-gray-300 hover:border-primary scale-95'
                          }`}
                        >
                          {selectedIds.includes(notification.id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Icône */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border-2 ${
                      getNotificationColor(notification.type)
                    }`}>
                      {(() => {
                        const IconComponent = notification.icone && iconeMap[notification.icone] 
                          ? iconeMap[notification.icone] 
                          : BellRing;
                        return <IconComponent className="h-5 w-5" />;
                      })()}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className={`text-sm font-semibold ${
                              !notification.est_lue ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.titre}
                            </h3>
                            {!notification.est_lue && (
                              <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse"></span>
                            )}
                            <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${getTypeBadgeColor(notification.type)}`}>
                              {getTypeLabel(notification.type)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {notification.temps_ecoule || 'À l\'instant'}
                            </span>
                            {notification.est_lue && notification.date_lecture && (
                              <span className="flex items-center gap-1.5 text-green-500">
                                <CheckCheck className="h-3.5 w-3.5" />
                                Lu {getTempsEcoule(notification.date_lecture)}
                              </span>
                            )}
                            {notification.projet_titre && (
                              <span className="flex items-center gap-1.5 text-primary/70 bg-primary/5 px-2 py-0.5 rounded-full">
                                <FileText className="h-3 w-3" />
                                {notification.projet_titre}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions rapides */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          {notification.lien && (
                            <Link
                              href={notification.lien}
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                              title="Voir le détail"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          )}
                          {!notification.est_lue ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                marquerLue(notification.id);
                              }}
                              className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                              title="Marquer comme lu"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Option pour marquer comme non lu
                              }}
                              className="p-2 text-gray-300 hover:text-gray-400 hover:bg-gray-50 rounded-lg transition-colors cursor-not-allowed"
                              title="Déjà lu"
                              disabled
                            >
                              <EyeOff className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setNotificationToDelete(notification.id);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pied de page */}
          {filteredNotifications.length > 0 && !loading && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-xs text-gray-500">
                Affichage de <span className="font-medium text-gray-700">{filteredNotifications.length}</span> notification{filteredNotifications.length > 1 ? 's' : ''}
                {notifications.length !== filteredNotifications.length && (
                  <span> sur <span className="font-medium text-gray-700">{notifications.length}</span> au total</span>
                )}
              </p>
              <div className="flex items-center gap-3">
                {activeTab !== 'tous' && filteredNotifications.length > 0 && (
                  <button
                    onClick={() => {
                      setNotificationToDelete(-1);
                      setShowDeleteConfirm(true);
                    }}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1.5 font-medium transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Supprimer cette liste
                  </button>
                )}
                {activeTab === 'tous' && notifications.length > 0 && (
                  <button
                    onClick={() => {
                      setNotificationToDelete(-1);
                      setShowDeleteConfirm(true);
                    }}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1.5 font-medium transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Vider tout
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100]">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => {
              setShowDeleteConfirm(false);
              setNotificationToDelete(null);
            }}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-4 mx-auto">
                <Trash2 className="h-7 w-7 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                {notificationToDelete === -1 
                  ? 'Supprimer toutes les notifications' 
                  : 'Supprimer la notification'}
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                {notificationToDelete === -1 
                  ? 'Êtes-vous sûr de vouloir supprimer définitivement toutes les notifications de cette liste ? Cette action est irréversible.'
                  : 'Êtes-vous sûr de vouloir supprimer définitivement cette notification ? Cette action est irréversible.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setNotificationToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    if (notificationToDelete === -1) {
                      supprimerTout();
                    } else if (notificationToDelete !== null) {
                      supprimerNotification(notificationToDelete);
                      setShowDeleteConfirm(false);
                      setNotificationToDelete(null);
                    }
                  }}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-3 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}