

// 'use client';

// import { 
//   LogOut, User as UserIcon, Menu, X, Home, Building2, 
//   Wrench, CreditCard, Shield, Users, BarChart3, 
//   ChevronDown, Settings, Bell, Search, Briefcase, CheckCircle,
//   TrendingUp, FileText, Activity, Check, Trash2, Clock, XCircle,
//   Loader2, ArrowRight, BellRing, CheckCheck, FileCheck, DollarSign,
//   Eye, EyeOff
// } from 'lucide-react';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import { useAuth } from '@/context/AuthContext';
// import { supabase } from '@/lib/supabase';
// import { useState, useEffect, useCallback } from 'react';

// // Types
// type Notification = {
//   id: number;
//   user_id: number;
//   type: string;
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
//   temps_ecoule?: string;
// };

// // Définition des menus par rôle
// const menuConfig = {
//   promoteur: [
//     { href: '/dashboard/promoteur', label: 'Voir mes dossiers', icon: Activity, tooltip: 'Tableau de bord général' },
//   ],
//   technique: [
//     { href: '/dashboard/technique', label: 'Voir tous les dossiers', icon: Activity, tooltip: 'Tableau de bord général' },
//   ],
//   credit: [
//     { href: '/dashboard/credit', label: 'Voir tous les dossiers', icon: Activity, tooltip: 'Tableau de bord général' },
//   ],
//   admin: [
//     { href: '/dashboard/admin', label: 'Utilisateurs', icon: Activity, tooltip: 'Tableau de bord général' },
//     { href: '/dashboard/stats', label: 'Statistiques', icon: BarChart3, tooltip: 'Voir les statistiques' },
//   ],
// };

// // Mapping des icônes
// const iconeMap: Record<string, any> = {
//   DollarSign,
//   FileText,
//   Clock,
//   FileCheck,
//   Shield,
//   CreditCard,
//   CheckCircle,
//   Activity,
//   XCircle,
//   BellRing,
//   AlertCircle: Activity,
//   Check,
//   TrendingUp,
//   Users,
//   Building2,
//   Eye,
//   EyeOff,
// };

// export default function Navigation() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const { user, isAuthenticated, logout } = useAuth();
//   const [showUserMenu, setShowUserMenu] = useState(false);
//   const [showMobileMenu, setShowMobileMenu] = useState(false);
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
  
//   // Notifications
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [notificationsLoading, setNotificationsLoading] = useState(false);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [actionLoading, setActionLoading] = useState<number | null>(null);

//   // Effet de scroll
//   useEffect(() => {
//     const handleScroll = () => setScrolled(window.scrollY > 10);
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   // Fermer les menus au changement de route
//   useEffect(() => {
//     setShowMobileMenu(false);
//     setShowUserMenu(false);
//     setShowNotifications(false);
//   }, [pathname]);

//   // Fonction helper pour calculer le temps écoulé
//   const getTempsEcoule = (date: string) => {
//     const now = new Date();
//     const notifDate = new Date(date);
//     const diff = Math.floor((now.getTime() - notifDate.getTime()) / 1000);
    
//     if (diff < 60) return 'À l\'instant';
//     if (diff < 3600) return Math.floor(diff / 60) + ' min';
//     if (diff < 86400) return Math.floor(diff / 3600) + ' h';
//     if (diff < 604800) return Math.floor(diff / 86400) + ' j';
//     return notifDate.toLocaleDateString('fr-FR');
//   };

 

//   const chargerNotifications = useCallback(async () => {
//   if (!user) return;
  
//   setNotificationsLoading(true);
//   try {
//     // First, let's try without the join to see if notifications load correctly
//     const { data, error } = await supabase
//       .from('notifications')
//       .select(`
//         id,
//         user_id,
//         type,
//         titre,
//         message,
//         lien,
//         projet_id,
//         document_id,
//         rapport_id,
//         est_lue,
//         date_lecture,
//         icone,
//         created_at,
//         updated_at
//       `)
//       .eq('user_id', user.id)
//       .order('created_at', { ascending: false })
//       .limit(20);

//     if (error) {
//       console.error('Erreur chargement:', error.message);
//       setNotifications([]);
//       setUnreadCount(0);
//       return;
//     }

//     if (data && data.length > 0) {
//       // If notifications load, let's fetch project titles separately
//       const projetIds = [...new Set(data.map((n: any) => n.projet_id).filter(Boolean))];
      
//       let projetsMap: Record<number, string> = {};
      
//       if (projetIds.length > 0) {
//         // Try different column names
//         const { data: projets, error: projetsError } = await supabase
//           .from('projets_fpi')
//           .select('id, titre') // Change 'titre' to the correct column name if needed
//           .in('id', projetIds);
        
//         if (!projetsError && projets) {
//           projetsMap = projets.reduce((acc: any, p: any) => {
//             acc[p.id] = p.titre || p.nom || p.name || p.libelle || 'Sans titre'; // Try multiple possible column names
//             return acc;
//           }, {});
//         } else if (projetsError) {
//           console.error('Erreur chargement projets:', projetsError.message);
//           // Try alternative column names
//           const { data: projets2 } = await supabase
//             .from('projets_fpi')
//             .select('id, nom') // Try 'nom' instead of 'titre'
//             .in('id', projetIds);
          
//           if (projets2) {
//             projetsMap = projets2.reduce((acc: any, p: any) => {
//               acc[p.id] = p.nom || 'Sans titre';
//               return acc;
//             }, {});
//           }
//         }
//       }

//       const formattedData: Notification[] = data.map((item: any) => ({
//         id: item.id,
//         user_id: item.user_id,
//         type: item.type || 'info',
//         titre: item.titre || '',
//         message: item.message || '',
//         lien: item.lien || null,
//         projet_id: item.projet_id || null,
//         document_id: item.document_id || null,
//         rapport_id: item.rapport_id || null,
//         est_lue: Boolean(item.est_lue),
//         date_lecture: item.date_lecture || null,
//         icone: item.icone || null,
//         created_at: item.created_at || new Date().toISOString(),
//         updated_at: item.updated_at || new Date().toISOString(),
//         projet_titre: item.projet_id ? projetsMap[item.projet_id] || null : null,
//         temps_ecoule: getTempsEcoule(item.created_at || new Date().toISOString()),
//       }));
      
//       console.log('✅ Notifications chargées:', formattedData.length);
//       setNotifications(formattedData);
//       setUnreadCount(formattedData.filter(n => !n.est_lue).length);
//     } else {
//       setNotifications([]);
//       setUnreadCount(0);
//     }
//   } catch (error: any) {
//     console.error('Erreur:', error.message);
//     setNotifications([]);
//     setUnreadCount(0);
//   } finally {
//     setNotificationsLoading(false);
//   }
// }, [user]);
//   // Charger au montage
//   useEffect(() => {
//     if (user) {
//       chargerNotifications();
//     }
//   }, [user, chargerNotifications]);

//   // Rafraîchir toutes les 30 secondes
//   useEffect(() => {
//     if (!user) return;
//     const interval = setInterval(chargerNotifications, 30000);
//     return () => clearInterval(interval);
//   }, [user, chargerNotifications]);

//   // Marquer une notification comme lue - UPDATE DIRECT
//   const marquerLue = async (notificationId: number, lien?: string | null) => {
//     console.log('Marquage comme lu:', notificationId);
    
//     // 1. Mise à jour locale IMMÉDIATE
//     setNotifications(prev => 
//       prev.map(n => 
//         n.id === notificationId 
//           ? { ...n, est_lue: true, date_lecture: new Date().toISOString() } 
//           : n
//       )
//     );
//     setUnreadCount(prev => Math.max(0, prev - 1));
    
//     // Navigation immédiate si lien
//     if (lien) {
//       setShowNotifications(false);
//       router.push(lien);
//     }
    
//     // 2. Mise à jour en base de données
//     setActionLoading(notificationId);
    
//     try {
//       const { error } = await supabase
//         .from('notifications')
//         .update({ 
//           est_lue: true,
//           date_lecture: new Date().toISOString()
//         })
//         .eq('id', notificationId)
//         .eq('user_id', user?.id);

//       if (error) {
//         console.error('Erreur update:', error.message);
//       } else {
//         console.log('✅ Notification marquée comme lue en base');
//       }
//     } catch (error: any) {
//       console.error('Erreur:', error.message);
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   // Marquer tout comme lu - UPDATE DIRECT
//   const marquerToutLu = async () => {
//     console.log('Marquage tout lu');
    
//     // 1. Mise à jour locale IMMÉDIATE
//     setNotifications(prev => 
//       prev.map(n => ({ 
//         ...n, 
//         est_lue: true,
//         date_lecture: n.est_lue ? n.date_lecture : new Date().toISOString()
//       }))
//     );
//     setUnreadCount(0);
    
//     // 2. Mise à jour en base de données
//     try {
//       const { error } = await supabase
//         .from('notifications')
//         .update({ 
//           est_lue: true,
//           date_lecture: new Date().toISOString()
//         })
//         .eq('user_id', user?.id)
//         .eq('est_lue', false);

//       if (error) {
//         console.error('Erreur update:', error.message);
//       } else {
//         console.log('✅ Toutes les notifications marquées comme lues');
//       }
//     } catch (error: any) {
//       console.error('Erreur:', error.message);
//     }
//   };

//   // Supprimer une notification - DELETE DIRECT
//   const supprimerNotification = async (notificationId: number, e: React.MouseEvent) => {
//     e.stopPropagation();
//     console.log('Suppression:', notificationId);
    
//     // 1. Mise à jour locale IMMÉDIATE
//     const notifToDelete = notifications.find(n => n.id === notificationId);
    
//     setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
//     if (notifToDelete && !notifToDelete.est_lue) {
//       setUnreadCount(prev => Math.max(0, prev - 1));
//     }
    
//     // 2. Suppression en base de données
//     setActionLoading(notificationId);
    
//     try {
//       const { error } = await supabase
//         .from('notifications')
//         .delete()
//         .eq('id', notificationId)
//         .eq('user_id', user?.id);

//       if (error) {
//         console.error('Erreur suppression:', error.message);
//         // Recharger les notifications en cas d'erreur
//         chargerNotifications();
//       } else {
//         console.log('✅ Notification supprimée de la base');
//       }
//     } catch (error: any) {
//       console.error('Erreur:', error.message);
//       // Recharger les notifications en cas d'erreur
//       chargerNotifications();
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const getNavItems = () => {
//     if (!user) return [];
//     return menuConfig[user.role as keyof typeof menuConfig] || [];
//   };

//   const navItems = getNavItems();

//   const handleLogout = () => {
//     logout();
//     setShowUserMenu(false);
//     setShowMobileMenu(false);
//     setShowNotifications(false);
//     router.push('/login');
//   };

//   const getRoleLabel = (role: string) => {
//     const roles: Record<string, string> = {
//       'promoteur': 'Promoteur',
//       'technique': 'Agent Technique',
//       'credit': 'Agent de Crédit',
//       'admin': 'Administrateur'
//     };
//     return roles[role] || role;
//   };

//   const getRoleColor = (role: string) => {
//     const colors: Record<string, string> = {
//       'promoteur': 'from-blue-500 to-cyan-500',
//       'technique': 'from-emerald-500 to-teal-500',
//       'credit': 'from-violet-500 to-purple-500',
//       'admin': 'from-amber-500 to-orange-500'
//     };
//     return colors[role] || 'from-gray-500 to-gray-600';
//   };

//   const getRoleBgLight = (role: string) => {
//     const colors: Record<string, string> = {
//       'promoteur': 'bg-blue-50 text-blue-700 border-blue-200',
//       'technique': 'bg-emerald-50 text-emerald-700 border-emerald-200',
//       'credit': 'bg-violet-50 text-violet-700 border-violet-200',
//       'admin': 'bg-amber-50 text-amber-700 border-amber-200'
//     };
//     return colors[role] || 'bg-gray-50 text-gray-700 border-gray-200';
//   };

//   const getNotificationColor = (type: string) => {
//     const colors: Record<string, string> = {
//       'info': 'bg-blue-50 border-blue-200',
//       'success': 'bg-green-50 border-green-200',
//       'warning': 'bg-yellow-50 border-yellow-200',
//       'error': 'bg-red-50 border-red-200',
//       'paiement': 'bg-yellow-50 border-yellow-200',
//       'document': 'bg-purple-50 border-purple-200',
//       'validation': 'bg-green-50 border-green-200',
//       'analyse': 'bg-indigo-50 border-indigo-200',
//       'decision': 'bg-orange-50 border-orange-200',
//     };
//     return colors[type] || 'bg-gray-50 border-gray-200';
//   };

//   if (!isAuthenticated || !user) {
//     return null;
//   }

//   return (
//     <>
//       {/* Navbar principale */}
//       <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
//         scrolled 
//           ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-gray-100/50' 
//           : 'bg-white'
//       }`}>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             {/* Logo et Navigation principale */}
//             <div className="flex items-center space-x-8">
//               {/* Logo */}
//               <Link href="/dashboard" className="flex items-center space-x-3 group">
//                 <div className="relative">
//                   <img src="logo.png" className='w-20 h-auto' alt="Logo"/>
//                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
//                     <div className="w-2 h-2 bg-green-400 rounded-full"></div>
//                   </div>
//                 </div>
//                 <div className="hidden lg:block">
//                   <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
//                     FPI Platform
//                   </h1>
//                   <p className="text-xs text-gray-500 -mt-0.5">Gestion industrielle</p>
//                 </div>
//               </Link>

//               {/* Navigation desktop */}
//               <div className="hidden md:flex items-center space-x-1 bg-gray-50/50 rounded-xl p-1">
//                 {navItems.map((item) => {
//                   const Icon = item.icon;
//                   const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
//                   return (
//                     <Link
//                       key={item.href}
//                       href={item.href}
//                       className={`relative flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
//                         isActive
//                           ? 'bg-white text-gray-900 shadow-sm'
//                           : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
//                       }`}
//                     >
//                       <Icon className={`h-4 w-4 mr-2 transition-colors ${
//                         isActive ? 'text-primary' : ''
//                       }`} />
//                       <span>{item.label}</span>
//                     </Link>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Actions droite */}
//             <div className="flex items-center space-x-3">
//               {/* Bouton notifications avec badge */}
//               <div className="relative">
//                 <button
//                   onClick={() => {
//                     setShowNotifications(!showNotifications);
//                     setShowUserMenu(false);
//                     if (!showNotifications) chargerNotifications();
//                   }}
//                   className="relative flex items-center justify-center w-10 h-10 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200"
//                 >
//                   <Bell className="h-5 w-5" />
//                   {unreadCount > 0 && (
//                     <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 border-2 border-white shadow-sm">
//                       {unreadCount > 99 ? '99+' : unreadCount}
//                     </span>
//                   )}
//                 </button>

//                 {/* Dropdown notifications */}
//                 {showNotifications && (
//                   <>
//                     <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
//                     <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden">
//                       {/* En-tête */}
//                       <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
//                         <div>
//                           <h3 className="font-semibold text-gray-900">Notifications</h3>
//                           <p className="text-xs text-gray-500">
//                             {unreadCount > 0 
//                               ? `${unreadCount} non lue(s)` 
//                               : 'Tout est lu'}
//                           </p>
//                         </div>
//                         {unreadCount > 0 && (
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               marquerToutLu();
//                             }}
//                             className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
//                           >
//                             <CheckCheck className="h-3.5 w-3.5" />
//                             Tout marquer lu
//                           </button>
//                         )}
//                       </div>

//                       {/* Liste */}
//                       <div className="max-h-[400px] overflow-y-auto">
//                         {notificationsLoading ? (
//                           <div className="flex items-center justify-center py-12">
//                             <Loader2 className="h-6 w-6 animate-spin text-primary" />
//                           </div>
//                         ) : notifications.length === 0 ? (
//                           <div className="flex flex-col items-center justify-center py-12 text-center px-4">
//                             <BellRing className="h-10 w-10 text-gray-300 mb-3" />
//                             <p className="text-sm text-gray-500">Aucune notification</p>
//                             <p className="text-xs text-gray-400 mt-1">
//                               Vous serez notifié des mises à jour importantes
//                             </p>
//                           </div>
//                         ) : (
//                           <div className="divide-y divide-gray-50">
//                             {notifications.map((notif) => {
//                               const IconComponent = notif.icone ? iconeMap[notif.icone] || BellRing : BellRing;
//                               const isLoading = actionLoading === notif.id;
                              
//                               return (
//                                 <div
//                                   key={notif.id}
//                                   onClick={() => !isLoading && marquerLue(notif.id, notif.lien)}
//                                   className={`w-full text-left p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${
//                                     !notif.est_lue 
//                                       ? 'bg-primary/[0.02] border-l-4 border-l-primary' 
//                                       : 'border-l-4 border-l-transparent'
//                                   } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
//                                 >
//                                   <div className="flex items-start gap-3">
//                                     {/* Icône */}
//                                     <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${
//                                       getNotificationColor(notif.type)
//                                     }`}>
//                                       <IconComponent className="h-5 w-5" />
//                                     </div>

//                                     <div className="flex-1 min-w-0">
//                                       <div className="flex items-start justify-between gap-2">
//                                         <div className="flex-1">
//                                           <div className="flex items-center gap-2">
//                                             <p className={`text-sm ${!notif.est_lue ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
//                                               {notif.titre}
//                                             </p>
//                                             {!notif.est_lue && (
//                                               <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
//                                             )}
//                                           </div>
//                                         </div>
//                                         <div className="flex items-center gap-1 flex-shrink-0">
//                                           {/* Statut */}
//                                           {notif.est_lue && (
//                                             <CheckCheck className="h-3.5 w-3.5 text-green-500" />
//                                           )}
//                                           {/* Bouton supprimer */}
//                                           <button
//                                             onClick={(e) => supprimerNotification(notif.id, e)}
//                                             className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
//                                             title="Supprimer"
//                                             disabled={isLoading}
//                                           >
//                                             {actionLoading === notif.id ? (
//                                               <Loader2 className="h-3.5 w-3.5 animate-spin" />
//                                             ) : (
//                                               <X className="h-3.5 w-3.5" />
//                                             )}
//                                           </button>
//                                         </div>
//                                       </div>
//                                       <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
//                                         {notif.message}
//                                       </p>
//                                       <div className="flex items-center gap-2 mt-2">
//                                         <span className="text-[10px] text-gray-400 flex items-center gap-1">
//                                           <Clock className="h-3 w-3" />
//                                           {notif.temps_ecoule || 'À l\'instant'}
//                                         </span>
//                                         {notif.projet_titre && (
//                                           <span className="text-[10px] text-primary/70 truncate max-w-[150px] bg-primary/5 px-1.5 py-0.5 rounded-full">
//                                             • {notif.projet_titre}
//                                           </span>
//                                         )}
//                                       </div>
//                                     </div>
//                                   </div>

//                                   {/* Overlay de chargement */}
//                                   {isLoading && (
//                                     <div className="absolute inset-0 bg-white/40 flex items-center justify-center rounded-xl">
//                                       <Loader2 className="h-5 w-5 animate-spin text-primary" />
//                                     </div>
//                                   )}
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         )}
//                       </div>

//                       {/* Footer */}
//                       <div className="p-3 border-t border-gray-100 bg-gray-50/50">
//                         <Link
//                           href="/notifications"
//                           onClick={() => setShowNotifications(false)}
//                           className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
//                         >
//                           Voir toutes les notifications
//                           <ArrowRight className="h-3 w-3" />
//                         </Link>
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </div>

//               {/* Séparateur */}
//               <div className="hidden sm:block w-px h-8 bg-gray-200"></div>

//               {/* Menu utilisateur */}
//               <div className="relative">
//                 <button
//                   onClick={() => {
//                     setShowUserMenu(!showUserMenu);
//                     setShowNotifications(false);
//                   }}
//                   className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200"
//                 >
//                   {/* Avatar */}
//                   <div className="relative">
//                     {user.photo_profil ? (
//                       <img 
//                         src={user.photo_profil} 
//                         alt={user.username} 
//                         className="w-9 h-9 rounded-xl object-cover border-2 border-gray-100 shadow-sm"
//                       />
//                     ) : (
//                       <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center shadow-sm`}>
//                         <span className="text-white font-semibold text-sm">
//                           {user.username.charAt(0).toUpperCase()}
//                         </span>
//                       </div>
//                     )}
//                     <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
//                   </div>
                  
//                   {/* Info utilisateur */}
//                   <div className="hidden lg:block text-left">
//                     <p className="text-sm font-semibold text-gray-900 leading-tight">{user.username}</p>
//                     <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
//                   </div>
                  
//                   <ChevronDown className={`hidden lg:block w-4 h-4 text-gray-400 transition-transform duration-200 ${
//                     showUserMenu ? 'rotate-180' : ''
//                   }`} />
//                 </button>

//                 {/* Dropdown menu utilisateur */}
//                 {showUserMenu && (
//                   <>
//                     <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
//                     <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden">
//                       <div className="p-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
//                         <div className="flex items-center space-x-3">
//                           {user.photo_profil ? (
//                             <img 
//                               src={user.photo_profil} 
//                               alt={user.username} 
//                               className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"
//                             />
//                           ) : (
//                             <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center shadow-md`}>
//                               <span className="text-white font-bold text-xl">
//                                 {user.username.charAt(0).toUpperCase()}
//                               </span>
//                             </div>
//                           )}
//                           <div>
//                             <h3 className="font-semibold text-gray-900">{user.username}</h3>
//                             <p className="text-sm text-gray-500">{user.email}</p>
//                             <span className={`inline-flex items-center px-2 py-0.5 mt-1 text-xs font-medium rounded-full border ${getRoleBgLight(user.role)}`}>
//                               {getRoleLabel(user.role)}
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="p-2">
//                         <Link
//                           href="/profile"
//                           className="flex items-center px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
//                           onClick={() => setShowUserMenu(false)}
//                         >
//                           <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-colors">
//                             <UserIcon className="w-4 h-4 text-gray-600" />
//                           </div>
//                           <div>
//                             <p className="font-medium">Mon profil</p>
//                             <p className="text-xs text-gray-400">Gérer mes informations</p>
//                           </div>
//                         </Link>

//                         <Link
//                           href="/notifications"
//                           className="flex items-center px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors group mt-1"
//                           onClick={() => setShowUserMenu(false)}
//                         >
//                           <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-colors">
//                             <BellRing className="w-4 h-4 text-gray-600" />
//                           </div>
//                           <div>
//                             <p className="font-medium">Notifications</p>
//                             {unreadCount > 0 && (
//                               <p className="text-xs text-primary">{unreadCount} non lue(s)</p>
//                             )}
//                           </div>
//                         </Link>
//                       </div>

//                       <div className="p-2 border-t border-gray-100 bg-gray-50/50">
//                         <button
//                           onClick={handleLogout}
//                           className="flex items-center w-full px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors group"
//                         >
//                           <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center mr-3 group-hover:bg-red-100 transition-colors">
//                             <LogOut className="w-4 h-4" />
//                           </div>
//                           <div>
//                             <p className="font-medium">Déconnexion</p>
//                             <p className="text-xs text-red-400">Se déconnecter du système</p>
//                           </div>
//                         </button>
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </div>

//               {/* Bouton menu mobile */}
//               <button
//                 onClick={() => setShowMobileMenu(!showMobileMenu)}
//                 className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
//               >
//                 {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//               </button>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Menu mobile */}
//       {showMobileMenu && (
//         <div className="md:hidden fixed inset-0 z-50">
//           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)} />
//           <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-50 overflow-y-auto">
//             <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 p-4">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <img src="logo.png" className='w-32 h-auto' alt="Logo"/>
//                   <div>
//                     <h2 className="font-bold text-gray-900">FPI Platform</h2>
//                     <p className="text-xs text-gray-500">Menu navigation</p>
//                   </div>
//                 </div>
//                 <button 
//                   onClick={() => setShowMobileMenu(false)}
//                   className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
//                 >
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>
//             </div>

//             <div className="p-4 border-b border-gray-100">
//               <Link
//                 href="/notifications"
//                 onClick={() => setShowMobileMenu(false)}
//                 className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="w-11 h-11 rounded-xl bg-yellow-100 flex items-center justify-center">
//                     <Bell className="h-5 w-5 text-yellow-600" />
//                   </div>
//                   <div>
//                     <p className="font-medium text-gray-900">Notifications</p>
//                     <p className="text-xs text-gray-500">
//                       {unreadCount > 0 ? `${unreadCount} notification(s) non lue(s)` : 'Aucune nouvelle notification'}
//                     </p>
//                   </div>
//                 </div>
//                 {unreadCount > 0 && (
//                   <span className="min-w-[24px] h-6 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-2">
//                     {unreadCount}
//                   </span>
//                 )}
//               </Link>
//             </div>

//             <div className="p-4 space-y-1">
//               {navItems.map((item) => {
//                 const Icon = item.icon;
//                 const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
//                 return (
//                   <Link
//                     key={item.href}
//                     href={item.href}
//                     onClick={() => setShowMobileMenu(false)}
//                     className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-200 ${
//                       isActive 
//                         ? 'bg-primary/5 text-primary font-medium shadow-sm' 
//                         : 'text-gray-600 hover:bg-gray-50'
//                     }`}
//                   >
//                     <div className={`w-11 h-11 rounded-xl flex items-center justify-center mr-3 ${
//                       isActive 
//                         ? 'bg-primary/10 text-primary' 
//                         : 'bg-gray-100 text-gray-500'
//                     }`}>
//                       <Icon className="h-5 w-5" />
//                     </div>
//                     <div className="flex-1">
//                       <p className="font-medium">{item.label}</p>
//                       <p className="text-xs text-gray-400">{item.tooltip}</p>
//                     </div>
//                     {isActive && (
//                       <div className="w-2 h-2 bg-primary rounded-full"></div>
//                     )}
//                   </Link>
//                 );
//               })}
//             </div>

//             <div className="border-t border-gray-100 p-4 mt-4">
//               <div className="bg-gray-50 rounded-2xl p-4">
//                 <div className="flex items-center space-x-3 mb-4">
//                   {user.photo_profil ? (
//                     <img 
//                       src={user.photo_profil} 
//                       alt={user.username} 
//                       className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
//                     />
//                   ) : (
//                     <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center shadow-sm`}>
//                       <span className="text-white font-bold text-lg">
//                         {user.username.charAt(0).toUpperCase()}
//                       </span>
//                     </div>
//                   )}
//                   <div>
//                     <p className="font-semibold text-gray-900">{user.username}</p>
//                     <p className="text-xs text-gray-500">{user.email}</p>
//                   </div>
//                 </div>

//                 <div className="space-y-1">
//                   <Link 
//                     href="/profile"
//                     className="flex items-center px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-white transition-colors"
//                     onClick={() => setShowMobileMenu(false)}
//                   >
//                     <UserIcon className="w-4 h-4 mr-3 text-gray-500" />
//                     Mon profil
//                   </Link>
                 
//                   <button 
//                     onClick={handleLogout}
//                     className="flex items-center w-full px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
//                   >
//                     <LogOut className="w-4 h-4 mr-3" />
//                     Déconnexion
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Espaceur */}
//       <div className="h-16"></div>
//     </>
//   );
// }









'use client';

import { 
  LogOut, User as UserIcon, Menu, X, Home, Building2, 
  Wrench, CreditCard, Shield, Users, BarChart3, 
  ChevronDown, Settings, Bell, Search, Briefcase, CheckCircle,
  TrendingUp, FileText, Activity, Check, Trash2, Clock, XCircle,
  Loader2, ArrowRight, BellRing, CheckCheck, FileCheck, DollarSign,
  Eye, EyeOff
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback } from 'react';

// Types
type Notification = {
  id: number;
  user_id: number;
  type: string;
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

// Définition des menus par rôle
const menuConfig = {
  promoteur: [
    { href: '/dashboard/promoteur', label: 'Voir mes dossiers', icon: Activity, tooltip: 'Tableau de bord général' },
  ],
  technique: [
    { href: '/dashboard/technique', label: 'Voir tous les dossiers', icon: Activity, tooltip: 'Tableau de bord général' },
  ],
  credit: [
    { href: '/dashboard/credit', label: 'Voir tous les dossiers', icon: Activity, tooltip: 'Tableau de bord général' },
  ],
  admin: [
    { href: '/dashboard/admin', label: 'Utilisateurs', icon: Activity, tooltip: 'Tableau de bord général' },
    { href: '/dashboard/stats', label: 'Statistiques', icon: BarChart3, tooltip: 'Voir les statistiques' },
  ],
};

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
  EyeOff,
};

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Effet de scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer les menus au changement de route
  useEffect(() => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
    setShowNotifications(false);
  }, [pathname]);

  // Fonction helper pour calculer le temps écoulé
  const getTempsEcoule = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = Math.floor((now.getTime() - notifDate.getTime()) / 1000);
    
    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return Math.floor(diff / 60) + ' min';
    if (diff < 86400) return Math.floor(diff / 3600) + ' h';
    if (diff < 604800) return Math.floor(diff / 86400) + ' j';
    return notifDate.toLocaleDateString('fr-FR');
  };

  const chargerNotifications = useCallback(async () => {
    if (!user) return;
    
    setNotificationsLoading(true);
    try {
      // Charger les notifications
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
          updated_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Erreur chargement:', error.message);
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      if (data && data.length > 0) {
        // Récupérer les titres des projets avec la bonne colonne 'nom_projet'
        const projetIds = [...new Set(data.map((n: any) => n.projet_id).filter(Boolean))];
        
        let projetsMap: Record<number, string> = {};
        
        if (projetIds.length > 0) {
          // Utiliser 'nom_projet' au lieu de 'titre'
          const { data: projets, error: projetsError } = await supabase
            .from('projets_fpi')
            .select('id, nom_projet')
            .in('id', projetIds);
          
          if (!projetsError && projets) {
            projetsMap = projets.reduce((acc: any, p: any) => {
              acc[p.id] = p.nom_projet || 'Sans titre';
              return acc;
            }, {});
          } else if (projetsError) {
            console.error('Erreur chargement projets:', projetsError.message);
          }
        }

        const formattedData: Notification[] = data.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          type: item.type || 'info',
          titre: item.titre || '',
          message: item.message || '',
          lien: item.lien || null,
          projet_id: item.projet_id || null,
          document_id: item.document_id || null,
          rapport_id: item.rapport_id || null,
          est_lue: Boolean(item.est_lue),
          date_lecture: item.date_lecture || null,
          icone: item.icone || null,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
          projet_titre: item.projet_id ? projetsMap[item.projet_id] || null : null,
          temps_ecoule: getTempsEcoule(item.created_at || new Date().toISOString()),
        }));
        
        console.log('✅ Notifications chargées:', formattedData.length);
        setNotifications(formattedData);
        setUnreadCount(formattedData.filter(n => !n.est_lue).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error: any) {
      console.error('Erreur:', error.message);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setNotificationsLoading(false);
    }
  }, [user]);
  
  // Charger au montage
  useEffect(() => {
    if (user) {
      chargerNotifications();
    }
  }, [user, chargerNotifications]);

  // Rafraîchir toutes les 30 secondes
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(chargerNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, chargerNotifications]);

  // Marquer une notification comme lue
  const marquerLue = async (notificationId: number, lien?: string | null) => {
    console.log('Marquage comme lu:', notificationId);
    
    // 1. Mise à jour locale IMMÉDIATE
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId 
          ? { ...n, est_lue: true, date_lecture: new Date().toISOString() } 
          : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // Navigation immédiate si lien
    if (lien) {
      setShowNotifications(false);
      router.push(lien);
    }
    
    // 2. Mise à jour en base de données
    setActionLoading(notificationId);
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          est_lue: true,
          date_lecture: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Erreur update:', error.message);
      } else {
        console.log('✅ Notification marquée comme lue en base');
      }
    } catch (error: any) {
      console.error('Erreur:', error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Marquer tout comme lu
  const marquerToutLu = async () => {
    console.log('Marquage tout lu');
    
    // 1. Mise à jour locale IMMÉDIATE
    setNotifications(prev => 
      prev.map(n => ({ 
        ...n, 
        est_lue: true,
        date_lecture: n.est_lue ? n.date_lecture : new Date().toISOString()
      }))
    );
    setUnreadCount(0);
    
    // 2. Mise à jour en base de données
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          est_lue: true,
          date_lecture: new Date().toISOString()
        })
        .eq('user_id', user?.id)
        .eq('est_lue', false);

      if (error) {
        console.error('Erreur update:', error.message);
      } else {
        console.log('✅ Toutes les notifications marquées comme lues');
      }
    } catch (error: any) {
      console.error('Erreur:', error.message);
    }
  };

  // Supprimer une notification
  const supprimerNotification = async (notificationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Suppression:', notificationId);
    
    // 1. Mise à jour locale IMMÉDIATE
    const notifToDelete = notifications.find(n => n.id === notificationId);
    
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    if (notifToDelete && !notifToDelete.est_lue) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    // 2. Suppression en base de données
    setActionLoading(notificationId);
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Erreur suppression:', error.message);
        // Recharger les notifications en cas d'erreur
        chargerNotifications();
      } else {
        console.log('✅ Notification supprimée de la base');
      }
    } catch (error: any) {
      console.error('Erreur:', error.message);
      // Recharger les notifications en cas d'erreur
      chargerNotifications();
    } finally {
      setActionLoading(null);
    }
  };

  const getNavItems = () => {
    if (!user) return [];
    return menuConfig[user.role as keyof typeof menuConfig] || [];
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setShowMobileMenu(false);
    setShowNotifications(false);
    router.push('/login');
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      'promoteur': 'Promoteur',
      'technique': 'Agent Technique',
      'credit': 'Agent de Crédit',
      'admin': 'Administrateur'
    };
    return roles[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'promoteur': 'from-blue-500 to-cyan-500',
      'technique': 'from-emerald-500 to-teal-500',
      'credit': 'from-violet-500 to-purple-500',
      'admin': 'from-amber-500 to-orange-500'
    };
    return colors[role] || 'from-gray-500 to-gray-600';
  };

  const getRoleBgLight = (role: string) => {
    const colors: Record<string, string> = {
      'promoteur': 'bg-blue-50 text-blue-700 border-blue-200',
      'technique': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'credit': 'bg-violet-50 text-violet-700 border-violet-200',
      'admin': 'bg-amber-50 text-amber-700 border-amber-200'
    };
    return colors[role] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      'info': 'bg-blue-50 border-blue-200',
      'success': 'bg-green-50 border-green-200',
      'warning': 'bg-yellow-50 border-yellow-200',
      'error': 'bg-red-50 border-red-200',
      'paiement': 'bg-yellow-50 border-yellow-200',
      'document': 'bg-purple-50 border-purple-200',
      'validation': 'bg-green-50 border-green-200',
      'analyse': 'bg-indigo-50 border-indigo-200',
      'decision': 'bg-orange-50 border-orange-200',
    };
    return colors[type] || 'bg-gray-50 border-gray-200';
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      {/* Navbar principale */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-gray-100/50' 
          : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo et Navigation principale */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center space-x-3 group">
                <div className="relative">
                  <img src="logo.png" className='w-20 h-auto' alt="Logo"/>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    FPI Platform
                  </h1>
                  <p className="text-xs text-gray-500 -mt-0.5">Gestion industrielle</p>
                </div>
              </Link>

              {/* Navigation desktop */}
              <div className="hidden md:flex items-center space-x-1 bg-gray-50/50 rounded-xl p-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                      }`}
                    >
                      <Icon className={`h-4 w-4 mr-2 transition-colors ${
                        isActive ? 'text-primary' : ''
                      }`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Actions droite */}
            <div className="flex items-center space-x-3">
              {/* Bouton notifications avec badge */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                    if (!showNotifications) chargerNotifications();
                  }}
                  className="relative flex items-center justify-center w-10 h-10 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 border-2 border-white shadow-sm">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown notifications */}
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden">
                      {/* En-tête */}
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                        <div>
                          <h3 className="font-semibold text-gray-900">Notifications</h3>
                          <p className="text-xs text-gray-500">
                            {unreadCount > 0 
                              ? `${unreadCount} non lue(s)` 
                              : 'Tout est lu'}
                          </p>
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              marquerToutLu();
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Tout marquer lu
                          </button>
                        )}
                      </div>

                      {/* Liste */}
                      <div className="max-h-[400px] overflow-y-auto">
                        {notificationsLoading ? (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                            <BellRing className="h-10 w-10 text-gray-300 mb-3" />
                            <p className="text-sm text-gray-500">Aucune notification</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Vous serez notifié des mises à jour importantes
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-50">
                            {notifications.map((notif) => {
                              const IconComponent = notif.icone ? iconeMap[notif.icone] || BellRing : BellRing;
                              const isLoading = actionLoading === notif.id;
                              
                              return (
                                <div
                                  key={notif.id}
                                  onClick={() => !isLoading && marquerLue(notif.id, notif.lien)}
                                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${
                                    !notif.est_lue 
                                      ? 'bg-primary/[0.02] border-l-4 border-l-primary' 
                                      : 'border-l-4 border-l-transparent'
                                  } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
                                >
                                  <div className="flex items-start gap-3">
                                    {/* Icône */}
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${
                                      getNotificationColor(notif.type)
                                    }`}>
                                      <IconComponent className="h-5 w-5" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <p className={`text-sm ${!notif.est_lue ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                              {notif.titre}
                                            </p>
                                            {!notif.est_lue && (
                                              <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          {/* Statut */}
                                          {notif.est_lue && (
                                            <CheckCheck className="h-3.5 w-3.5 text-green-500" />
                                          )}
                                          {/* Bouton supprimer */}
                                          <button
                                            onClick={(e) => supprimerNotification(notif.id, e)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                                            title="Supprimer"
                                            disabled={isLoading}
                                          >
                                            {actionLoading === notif.id ? (
                                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                              <X className="h-3.5 w-3.5" />
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                        {notif.message}
                                      </p>
                                      <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {notif.temps_ecoule || 'À l\'instant'}
                                        </span>
                                        {notif.projet_titre && (
                                          <span className="text-[10px] text-primary/70 truncate max-w-[150px] bg-primary/5 px-1.5 py-0.5 rounded-full">
                                            • {notif.projet_titre}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Overlay de chargement */}
                                  {isLoading && (
                                    <div className="absolute inset-0 bg-white/40 flex items-center justify-center rounded-xl">
                                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                        <Link
                          href="/notifications"
                          onClick={() => setShowNotifications(false)}
                          className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                        >
                          Voir toutes les notifications
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Séparateur */}
              <div className="hidden sm:block w-px h-8 bg-gray-200"></div>

              {/* Menu utilisateur */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200"
                >
                  {/* Avatar */}
                  <div className="relative">
                    {user.photo_profil ? (
                      <img 
                        src={user.photo_profil} 
                        alt={user.username} 
                        className="w-9 h-9 rounded-xl object-cover border-2 border-gray-100 shadow-sm"
                      />
                    ) : (
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center shadow-sm`}>
                        <span className="text-white font-semibold text-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                  </div>
                  
                  {/* Info utilisateur */}
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{user.username}</p>
                    <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
                  </div>
                  
                  <ChevronDown className={`hidden lg:block w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    showUserMenu ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Dropdown menu utilisateur */}
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden">
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          {user.photo_profil ? (
                            <img 
                              src={user.photo_profil} 
                              alt={user.username} 
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"
                            />
                          ) : (
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center shadow-md`}>
                              <span className="text-white font-bold text-xl">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900">{user.username}</h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <span className={`inline-flex items-center px-2 py-0.5 mt-1 text-xs font-medium rounded-full border ${getRoleBgLight(user.role)}`}>
                              {getRoleLabel(user.role)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <Link
                          href="/profile"
                          className="flex items-center px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-colors">
                            <UserIcon className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">Mon profil</p>
                            <p className="text-xs text-gray-400">Gérer mes informations</p>
                          </div>
                        </Link>

                        <Link
                          href="/notifications"
                          className="flex items-center px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors group mt-1"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-colors">
                            <BellRing className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">Notifications</p>
                            {unreadCount > 0 && (
                              <p className="text-xs text-primary">{unreadCount} non lue(s)</p>
                            )}
                          </div>
                        </Link>
                      </div>

                      <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center mr-3 group-hover:bg-red-100 transition-colors">
                            <LogOut className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium">Déconnexion</p>
                            <p className="text-xs text-red-400">Se déconnecter du système</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Bouton menu mobile */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menu mobile */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src="logo.png" className='w-32 h-auto' alt="Logo"/>
                  <div>
                    <h2 className="font-bold text-gray-900">FPI Platform</h2>
                    <p className="text-xs text-gray-500">Menu navigation</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 border-b border-gray-100">
              <Link
                href="/notifications"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-yellow-100 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Notifications</p>
                    <p className="text-xs text-gray-500">
                      {unreadCount > 0 ? `${unreadCount} notification(s) non lue(s)` : 'Aucune nouvelle notification'}
                    </p>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <span className="min-w-[24px] h-6 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-2">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </div>

            <div className="p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary/5 text-primary font-medium shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mr-3 ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.tooltip}</p>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-gray-100 p-4 mt-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center space-x-3 mb-4">
                  {user.photo_profil ? (
                    <img 
                      src={user.photo_profil} 
                      alt={user.username} 
                      className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center shadow-sm`}>
                      <span className="text-white font-bold text-lg">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Link 
                    href="/profile"
                    className="flex items-center px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-white transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <UserIcon className="w-4 h-4 mr-3 text-gray-500" />
                    Mon profil
                  </Link>
                 
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Espaceur */}
      <div className="h-16"></div>
    </>
  );
}