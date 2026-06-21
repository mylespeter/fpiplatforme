
// // // components/Sidebar.tsx
// // 'use client';

// // import { 
// //   LogOut, User as UserIcon, Home, Building2, 
// //   Wrench, CreditCard, Shield, Users, BarChart3, 
// //   Bell, Search, Briefcase, CheckCircle,X,ChevronDown,
// //   TrendingUp, FileText, Activity, Check, Trash2, Clock, XCircle,
// //   Loader2, ArrowRight, BellRing, CheckCheck, FileCheck, DollarSign,
// //   Eye, EyeOff, LayoutDashboard, FolderKanban, UserCircle, BellDot
// // } from 'lucide-react';
// // import Link from 'next/link';
// // import { usePathname, useRouter } from 'next/navigation';
// // import { useAuth } from '@/context/AuthContext';
// // import { supabase } from '@/lib/supabase';
// // import { useState, useEffect, useCallback, createContext, useContext } from 'react';

// // // Types
// // type Notification = {
// //   id: number;
// //   user_id: number;
// //   type: string;
// //   titre: string;
// //   message: string;
// //   lien: string | null;
// //   projet_id: number | null;
// //   document_id: number | null;
// //   rapport_id: number | null;
// //   est_lue: boolean;
// //   date_lecture: string | null;
// //   icone: string | null;
// //   created_at: string;
// //   updated_at: string;
// //   projet_titre?: string | null;
// //   temps_ecoule?: string;
// // };

// // // Contexte pour partager l'état de la sidebar
// // export const SidebarContext = createContext<{
// //   isCollapsed: boolean;
// //   setIsCollapsed: (value: boolean) => void;
// // }>({
// //   isCollapsed: false,
// //   setIsCollapsed: () => {},
// // });

// // export const useSidebar = () => useContext(SidebarContext);

// // // Définition des menus par rôle
// // const menuConfig = {
// //   promoteur: [
// //     { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
// //     { href: '/dashboard/projets', label: 'Mes projets', icon: FolderKanban },
// //     { href: '/profil', label: 'Profil', icon: UserCircle },
// //     { href: '/notifications', label: 'Notifications', icon: BellDot },
// //   ],
// //   technique: [
// //     { href: '/dashboard/technique', label: 'Tableau de bord', icon: LayoutDashboard },
// //     { href: '/dashboard/technique/projets', label: 'Tous les projets', icon: FolderKanban },
// //     { href: '/profil', label: 'Profil', icon: UserCircle },
// //     { href: '/notifications', label: 'Notifications', icon: BellDot },
// //   ],
// //   credit: [
// //     { href: '/dashboard/credit', label: 'Tableau de bord', icon: LayoutDashboard },
// //     { href: '/dashboard/credit/projets', label: 'Tous les projets', icon: FolderKanban },
// //     { href: '/profil', label: 'Profil', icon: UserCircle },
// //     { href: '/notifications', label: 'Notifications', icon: BellDot },
// //   ],
// //   admin: [
// //     { href: '/dashboard/admin', label: 'Tableau de bord', icon: LayoutDashboard },
// //     { href: '/dashboard/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
// //     { href: '/dashboard/stats', label: 'Statistiques', icon: BarChart3 },
// //     { href: '/profil', label: 'Profil', icon: UserCircle },
// //     { href: '/notifications', label: 'Notifications', icon: BellDot },
// //   ],
// // };

// // // Mapping des icônes
// // const iconeMap: Record<string, any> = {
// //   DollarSign,
// //   FileText,
// //   Clock,
// //   FileCheck,
// //   Shield,
// //   CreditCard,
// //   CheckCircle,
// //   Activity,
// //   XCircle,
// //   BellRing,
// //   AlertCircle: Activity,
// //   Check,
// //   TrendingUp,
// //   Users,
// //   Building2,
// //   Eye,
// //   EyeOff,
// // };

// // export default function Sidebar() {
// //   const pathname = usePathname();
// //   const router = useRouter();
// //   const { user, isAuthenticated, logout } = useAuth();
// //   const [isCollapsed, setIsCollapsed] = useState(false);
// //   const [showNotifications, setShowNotifications] = useState(false);
  
// //   // Notifications
// //   const [notifications, setNotifications] = useState<Notification[]>([]);
// //   const [notificationsLoading, setNotificationsLoading] = useState(false);
// //   const [unreadCount, setUnreadCount] = useState(0);
// //   const [actionLoading, setActionLoading] = useState<number | null>(null);

// //   // Fermer les menus au changement de route
// //   useEffect(() => {
// //     setShowNotifications(false);
// //   }, [pathname]);

// //   // Fonction helper pour calculer le temps écoulé
// //   const getTempsEcoule = (date: string) => {
// //     const now = new Date();
// //     const notifDate = new Date(date);
// //     const diff = Math.floor((now.getTime() - notifDate.getTime()) / 1000);
    
// //     if (diff < 60) return 'À l\'instant';
// //     if (diff < 3600) return Math.floor(diff / 60) + ' min';
// //     if (diff < 86400) return Math.floor(diff / 3600) + ' h';
// //     if (diff < 604800) return Math.floor(diff / 86400) + ' j';
// //     return notifDate.toLocaleDateString('fr-FR');
// //   };

// //   const chargerNotifications = useCallback(async () => {
// //     if (!user) return;
    
// //     setNotificationsLoading(true);
// //     try {
// //       const { data, error } = await supabase
// //         .from('notifications')
// //         .select(`
// //           id,
// //           user_id,
// //           type,
// //           titre,
// //           message,
// //           lien,
// //           projet_id,
// //           document_id,
// //           rapport_id,
// //           est_lue,
// //           date_lecture,
// //           icone,
// //           created_at,
// //           updated_at
// //         `)
// //         .eq('user_id', user.id)
// //         .order('created_at', { ascending: false })
// //         .limit(20);

// //       if (error) {
// //         console.error('Erreur chargement:', error.message);
// //         setNotifications([]);
// //         setUnreadCount(0);
// //         return;
// //       }

// //       if (data && data.length > 0) {
// //         const projetIds = [...new Set(data.map((n: any) => n.projet_id).filter(Boolean))];
        
// //         let projetsMap: Record<number, string> = {};
        
// //         if (projetIds.length > 0) {
// //           const { data: projets, error: projetsError } = await supabase
// //             .from('projets_fpi')
// //             .select('id, nom_projet')
// //             .in('id', projetIds);
          
// //           if (!projetsError && projets) {
// //             projetsMap = projets.reduce((acc: any, p: any) => {
// //               acc[p.id] = p.nom_projet || 'Sans titre';
// //               return acc;
// //             }, {});
// //           }
// //         }

// //         const formattedData: Notification[] = data.map((item: any) => ({
// //           id: item.id,
// //           user_id: item.user_id,
// //           type: item.type || 'info',
// //           titre: item.titre || '',
// //           message: item.message || '',
// //           lien: item.lien || null,
// //           projet_id: item.projet_id || null,
// //           document_id: item.document_id || null,
// //           rapport_id: item.rapport_id || null,
// //           est_lue: Boolean(item.est_lue),
// //           date_lecture: item.date_lecture || null,
// //           icone: item.icone || null,
// //           created_at: item.created_at || new Date().toISOString(),
// //           updated_at: item.updated_at || new Date().toISOString(),
// //           projet_titre: item.projet_id ? projetsMap[item.projet_id] || null : null,
// //           temps_ecoule: getTempsEcoule(item.created_at || new Date().toISOString()),
// //         }));
        
// //         setNotifications(formattedData);
// //         setUnreadCount(formattedData.filter(n => !n.est_lue).length);
// //       } else {
// //         setNotifications([]);
// //         setUnreadCount(0);
// //       }
// //     } catch (error: any) {
// //       console.error('Erreur:', error.message);
// //       setNotifications([]);
// //       setUnreadCount(0);
// //     } finally {
// //       setNotificationsLoading(false);
// //     }
// //   }, [user]);
  
// //   // Charger au montage
// //   useEffect(() => {
// //     if (user) {
// //       chargerNotifications();
// //     }
// //   }, [user, chargerNotifications]);

// //   // Rafraîchir toutes les 30 secondes
// //   useEffect(() => {
// //     if (!user) return;
// //     const interval = setInterval(chargerNotifications, 30000);
// //     return () => clearInterval(interval);
// //   }, [user, chargerNotifications]);

// //   // Marquer une notification comme lue
// //   const marquerLue = async (notificationId: number, lien?: string | null) => {
// //     setNotifications(prev => 
// //       prev.map(n => 
// //         n.id === notificationId 
// //           ? { ...n, est_lue: true, date_lecture: new Date().toISOString() } 
// //           : n
// //       )
// //     );
// //     setUnreadCount(prev => Math.max(0, prev - 1));
    
// //     if (lien) {
// //       setShowNotifications(false);
// //       router.push(lien);
// //     }
    
// //     setActionLoading(notificationId);
    
// //     try {
// //       const { error } = await supabase
// //         .from('notifications')
// //         .update({ 
// //           est_lue: true,
// //           date_lecture: new Date().toISOString()
// //         })
// //         .eq('id', notificationId)
// //         .eq('user_id', user?.id);

// //       if (error) {
// //         console.error('Erreur update:', error.message);
// //       }
// //     } catch (error: any) {
// //       console.error('Erreur:', error.message);
// //     } finally {
// //       setActionLoading(null);
// //     }
// //   };

// //   // Marquer tout comme lu
// //   const marquerToutLu = async () => {
// //     setNotifications(prev => 
// //       prev.map(n => ({ 
// //         ...n, 
// //         est_lue: true,
// //         date_lecture: n.est_lue ? n.date_lecture : new Date().toISOString()
// //       }))
// //     );
// //     setUnreadCount(0);
    
// //     try {
// //       const { error } = await supabase
// //         .from('notifications')
// //         .update({ 
// //           est_lue: true,
// //           date_lecture: new Date().toISOString()
// //         })
// //         .eq('user_id', user?.id)
// //         .eq('est_lue', false);

// //       if (error) {
// //         console.error('Erreur update:', error.message);
// //       }
// //     } catch (error: any) {
// //       console.error('Erreur:', error.message);
// //     }
// //   };

// //   // Supprimer une notification
// //   const supprimerNotification = async (notificationId: number, e: React.MouseEvent) => {
// //     e.stopPropagation();
    
// //     const notifToDelete = notifications.find(n => n.id === notificationId);
    
// //     setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
// //     if (notifToDelete && !notifToDelete.est_lue) {
// //       setUnreadCount(prev => Math.max(0, prev - 1));
// //     }
    
// //     setActionLoading(notificationId);
    
// //     try {
// //       const { error } = await supabase
// //         .from('notifications')
// //         .delete()
// //         .eq('id', notificationId)
// //         .eq('user_id', user?.id);

// //       if (error) {
// //         console.error('Erreur suppression:', error.message);
// //         chargerNotifications();
// //       }
// //     } catch (error: any) {
// //       console.error('Erreur:', error.message);
// //       chargerNotifications();
// //     } finally {
// //       setActionLoading(null);
// //     }
// //   };

// //   const getNavItems = () => {
// //     if (!user) return [];
// //     return menuConfig[user.role as keyof typeof menuConfig] || [];
// //   };

// //   const navItems = getNavItems();

// //   const handleLogout = () => {
// //     logout();
// //     router.push('/login');
// //   };

// //   const getRoleLabel = (role: string) => {
// //     const roles: Record<string, string> = {
// //       'promoteur': 'Promoteur',
// //       'technique': 'Agent Technique',
// //       'credit': 'Agent de Crédit',
// //       'admin': 'Administrateur'
// //     };
// //     return roles[role] || role;
// //   };

// //   const getRoleColor = (role: string) => {
// //     const colors: Record<string, string> = {
// //       'promoteur': 'from-blue-500 to-cyan-500',
// //       'technique': 'from-emerald-500 to-teal-500',
// //       'credit': 'from-violet-500 to-purple-500',
// //       'admin': 'from-amber-500 to-orange-500'
// //     };
// //     return colors[role] || 'from-gray-500 to-gray-600';
// //   };

// //   const getNotificationColor = (type: string) => {
// //     const colors: Record<string, string> = {
// //       'info': 'bg-blue-50 border-blue-200',
// //       'success': 'bg-green-50 border-green-200',
// //       'warning': 'bg-yellow-50 border-yellow-200',
// //       'error': 'bg-red-50 border-red-200',
// //       'paiement': 'bg-yellow-50 border-yellow-200',
// //       'document': 'bg-purple-50 border-purple-200',
// //       'validation': 'bg-green-50 border-green-200',
// //       'analyse': 'bg-indigo-50 border-indigo-200',
// //       'decision': 'bg-orange-50 border-orange-200',
// //     };
// //     return colors[type] || 'bg-gray-50 border-gray-200';
// //   };

// //   if (!isAuthenticated || !user) {
// //     return null;
// //   }

// //   return (
// //     <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
// // <aside 
// //   className={`sticky top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 z-40 ${
// //     isCollapsed ? 'w-20' : 'w-64'
// //   }`}
// // >
// //         {/* Logo et toggle */}
// //         <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
// //           <Link href="/dashboard" className="flex items-center space-x-3">
// //             <img src="logo.png" className={`h-10 w-auto ${isCollapsed ? 'mx-auto hidden' : 'w-10s'}`} alt="Logo"/>
// //             {!isCollapsed && (
// //               <div>
// //                 <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
// //                   FPI Platform
// //                 </h1>
// //                 <p className="text-xs text-gray-500 -mt-0.5">Gestion industrielle</p>
// //               </div>
// //             )}
// //           </Link>
// //           <button
// //             onClick={() => setIsCollapsed(!isCollapsed)}
// //             className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
// //           >
// //             {isCollapsed ? <ArrowRight className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400 rotate-90" />}
// //           </button>
// //         </div>

// //         {/* Menu utilisateur compact */}
// //         <div className={`p-4 border-b border-gray-200 ${isCollapsed ? 'text-center' : ''}`}>
// //           <div className="flex items-center space-x-3">
// //             {user.photo_profil ? (
// //               <img 
// //                 src={user.photo_profil} 
// //                 alt={user.username} 
// //                 className={`${isCollapsed ? 'w-10 h-10 mx-auto' : 'w-11 h-11'} rounded-full object-cover border-2 border-gray-100 shadow-sm`}
// //               />
// //             ) : (
// //               <div className={`${isCollapsed ? 'w-10 h-10 mx-auto' : 'w-11 h-11'} rounded-full bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center shadow-sm`}>
// //                 <span className="text-white font-semibold text-sm">
// //                   {user.username.charAt(0).toUpperCase()}
// //                 </span>
// //               </div>
// //             )}
// //             {!isCollapsed && (
// //               <div className="flex-1 min-w-0">
// //                 <p className="text-sm font-semibold text-gray-900 truncate">{user.username}</p>
// //                 <p className="text-xs text-gray-500 truncate">{getRoleLabel(user.role)}</p>
// //               </div>
// //             )}
// //           </div>
// //         </div>

// //         {/* Navigation */}
// //         <nav className="flex-1 overflow-y-auto p-3 space-y-1">
// //           {navItems.map((item) => {
// //             const Icon = item.icon;
// //             const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            
// //             return (
// //               <Link
// //                 key={item.href}
// //                 href={item.href}
// //                 className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 rounded-xl transition-all duration-200 ${
// //                   isActive 
// //                     ? 'bg-primary/10 text-primary font-medium shadow-sm' 
// //                     : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
// //                 }`}
// //                 title={isCollapsed ? item.label : undefined}
// //               >
// //                 <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
// //                 {!isCollapsed && <span className="flex-1">{item.label}</span>}
// //                 {!isCollapsed && isActive && (
// //                   <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
// //                 )}
// //               </Link>
// //             );
// //           })}
// //         </nav>

// //         {/* Notifications compact */}
// //         <div className="border-t border-gray-200 p-3">
// //           <div className="relative">
// //             <button
// //               onClick={() => setShowNotifications(!showNotifications)}
// //               className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} w-full px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors`}
// //               title={isCollapsed ? 'Notifications' : undefined}
// //             >
// //               <div className="relative">
// //                 <Bell className="h-5 w-5 text-gray-600" />
// //                 {unreadCount > 0 && (
// //                   <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 border-2 border-white shadow-sm">
// //                     {unreadCount > 99 ? '99+' : unreadCount}
// //                   </span>
// //                 )}
// //               </div>
// //               {!isCollapsed && <span className="flex-1 text-gray-600">Notifications</span>}
// //             </button>
// //           </div>

// //           {/* Déconnexion */}
// //           <button
// //             onClick={handleLogout}
// //             className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} w-full px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors mt-1`}
// //             title={isCollapsed ? 'Déconnexion' : undefined}
// //           >
// //             <LogOut className="h-5 w-5 flex-shrink-0" />
// //             {!isCollapsed && <span>Déconnexion</span>}
// //           </button>
// //         </div>

// //         {/* Dropdown notifications */}
// //         {/* Dropdown notifications */}
// // {showNotifications && (
// //   <>
// //     {/* Overlay pour fermer - z-index très élevé */}
// //     <div 
// //       className="fixed inset-0 z-[9998]" 
// //       onClick={() => setShowNotifications(false)} 
// //     />
    
// //     {/* Dropdown - z-index encore plus élevé */}
// //     <div className={`fixed ${isCollapsed ? 'left-20' : 'left-64'} top-16 ml-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999] overflow-hidden`}>
// //               {/* En-tête */}
// //               <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
// //                 <div>
// //                   <h3 className="font-semibold text-gray-900">Notifications</h3>
// //                   <p className="text-xs text-gray-500">
// //                     {unreadCount > 0 
// //                       ? `${unreadCount} non lue(s)` 
// //                       : 'Tout est lu'}
// //                   </p>
// //                 </div>
// //                 {unreadCount > 0 && (
// //                   <button
// //                     onClick={(e) => {
// //                       e.stopPropagation();
// //                       marquerToutLu();
// //                     }}
// //                     className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
// //                   >
// //                     <CheckCheck className="h-3.5 w-3.5" />
// //                     Tout marquer lu
// //                   </button>
// //                 )}
// //               </div>

// //               {/* Liste */}
// //               <div className="max-h-[400px] overflow-y-auto">
// //                 {notificationsLoading ? (
// //                   <div className="flex items-center justify-center py-12">
// //                     <Loader2 className="h-6 w-6 animate-spin text-primary" />
// //                   </div>
// //                 ) : notifications.length === 0 ? (
// //                   <div className="flex flex-col items-center justify-center py-12 text-center px-4">
// //                     <BellRing className="h-10 w-10 text-gray-300 mb-3" />
// //                     <p className="text-sm text-gray-500">Aucune notification</p>
// //                     <p className="text-xs text-gray-400 mt-1">
// //                       Vous serez notifié des mises à jour importantes
// //                     </p>
// //                   </div>
// //                 ) : (
// //                   <div className="divide-y divide-gray-50">
// //                     {notifications.map((notif) => {
// //                       const IconComponent = notif.icone ? iconeMap[notif.icone] || BellRing : BellRing;
// //                       const isLoading = actionLoading === notif.id;
                      
// //                       return (
// //                         <div
// //                           key={notif.id}
// //                           onClick={() => !isLoading && marquerLue(notif.id, notif.lien)}
// //                           className={`w-full text-left p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${
// //                             !notif.est_lue 
// //                               ? 'bg-primary/[0.02] border-l-4 border-l-primary' 
// //                               : 'border-l-4 border-l-transparent'
// //                           } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
// //                         >
// //                           <div className="flex items-start gap-3">
// //                             <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${
// //                               getNotificationColor(notif.type)
// //                             }`}>
// //                               <IconComponent className="h-5 w-5" />
// //                             </div>

// //                             <div className="flex-1 min-w-0">
// //                               <div className="flex items-start justify-between gap-2">
// //                                 <div className="flex-1">
// //                                   <div className="flex items-center gap-2">
// //                                     <p className={`text-sm ${!notif.est_lue ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
// //                                       {notif.titre}
// //                                     </p>
// //                                     {!notif.est_lue && (
// //                                       <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
// //                                     )}
// //                                   </div>
// //                                 </div>
// //                                 <div className="flex items-center gap-1 flex-shrink-0">
// //                                   {notif.est_lue && (
// //                                     <CheckCheck className="h-3.5 w-3.5 text-green-500" />
// //                                   )}
// //                                   <button
// //                                     onClick={(e) => supprimerNotification(notif.id, e)}
// //                                     className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
// //                                     title="Supprimer"
// //                                     disabled={isLoading}
// //                                   >
// //                                     {actionLoading === notif.id ? (
// //                                       <Loader2 className="h-3.5 w-3.5 animate-spin" />
// //                                     ) : (
// //                                       <X className="h-3.5 w-3.5" />
// //                                     )}
// //                                   </button>
// //                                 </div>
// //                               </div>
// //                               <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
// //                                 {notif.message}
// //                               </p>
// //                               <div className="flex items-center gap-2 mt-2">
// //                                 <span className="text-[10px] text-gray-400 flex items-center gap-1">
// //                                   <Clock className="h-3 w-3" />
// //                                   {notif.temps_ecoule || 'À l\'instant'}
// //                                 </span>
// //                                 {notif.projet_titre && (
// //                                   <span className="text-[10px] text-primary/70 truncate max-w-[150px] bg-primary/5 px-1.5 py-0.5 rounded-full">
// //                                     • {notif.projet_titre}
// //                                   </span>
// //                                 )}
// //                               </div>
// //                             </div>
// //                           </div>

// //                           {isLoading && (
// //                             <div className="absolute inset-0 bg-white/40 flex items-center justify-center rounded-xl">
// //                               <Loader2 className="h-5 w-5 animate-spin text-primary" />
// //                             </div>
// //                           )}
// //                         </div>
// //                       );
// //                     })}
// //                   </div>
// //                 )}
// //               </div>

// //               {/* Footer */}
// //               <div className="p-3 border-t border-gray-100 bg-gray-50/50">
// //                 <Link
// //                   href="/notifications"
// //                   onClick={() => setShowNotifications(false)}
// //                   className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
// //                 >
// //                   Voir toutes les notifications
// //                   <ArrowRight className="h-3 w-3" />
// //                 </Link>
// //               </div>
// //             </div>
// //           </>
// //         )}
// //       </aside>
// //     </SidebarContext.Provider>
// //   );
// // }


// // components/Sidebar.tsx
// 'use client';

// import { 
//   LogOut, User as UserIcon, Home, Building2, 
//   Wrench, CreditCard, Shield, Users, BarChart3, 
//   Bell, Search, Briefcase, CheckCircle, X, ChevronDown,
//   TrendingUp, FileText, Activity, Check, Trash2, Clock, XCircle,
//   Loader2, ArrowRight, BellRing, CheckCheck, FileCheck, DollarSign,
//   Eye, EyeOff, LayoutDashboard, FolderKanban, UserCircle, BellDot
// } from 'lucide-react';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import { useAuth } from '@/context/AuthContext';
// import { supabase } from '@/lib/supabase';
// import { useState, useEffect, useCallback, createContext, useContext } from 'react';

// // Contexte pour partager l'état de la sidebar
// export const SidebarContext = createContext<{
//   isCollapsed: boolean;
//   setIsCollapsed: (value: boolean) => void;
// }>({
//   isCollapsed: false,
//   setIsCollapsed: () => {},
// });

// export const useSidebar = () => useContext(SidebarContext);

// // Définition des menus par rôle
// const menuConfig = {
//   promoteur: [
//     { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
//     { href: '/mes-projets', label: 'Mes projets', icon: FolderKanban },
//     { href: '/profile', label: 'Profil', icon: UserCircle },
//     { href: '/notifications', label: 'Notifications', icon: BellDot, badge: true },
//   ],

//   credit: [
//     { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
//     { href: '/evaluation', label: 'Evaluation', icon: FolderKanban },
//     { href: '/profile', label: 'Profil', icon: UserCircle },
//     { href: '/notifications', label: 'Notifications', icon: BellDot, badge: true },
//     { href: '/stats', label: 'Statistiques', icon:BarChart3 },
//   ],
//   technique: [
//     { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
//     { href: '/evaluation-tech', label: 'Evaluation', icon: FolderKanban },
//     { href: '/profile', label: 'Profil', icon: UserCircle },
//     { href: '/notifications', label: 'Notifications', icon: BellDot, badge: true },
//   ],
//   admin: [
//     { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
//     { href: '/users', label: 'Utilisateurs', icon: Users },
//     // { href: '/dashboard/stats', label: 'Statistiques', icon: BarChart3 },
//     { href: '/profile', label: 'Profil', icon: UserCircle },
//     { href: '/notifications', label: 'Notifications', icon: BellDot, badge: true },
//   ],
// };

// export default function Sidebar() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const { user, isAuthenticated, logout } = useAuth();
//   const [isCollapsed, setIsCollapsed] = useState(false);
  
//   // État pour le compteur de notifications non lues
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [loadingCount, setLoadingCount] = useState(false);

//   // Fonction pour récupérer le nombre de notifications non lues
//   const fetchUnreadCount = useCallback(async () => {
//     if (!user) return;
    
//     setLoadingCount(true);
//     try {
//       const { count, error } = await supabase
//         .from('notifications')
//         .select('id', { count: 'exact', head: true })
//         .eq('user_id', user.id)
//         .eq('est_lue', false);

//       if (!error) {
//         setUnreadCount(count || 0);
//       }
//     } catch (error) {
//       // Silencieux - ne pas bloquer l'UI pour le compteur
//     } finally {
//       setLoadingCount(false);
//     }
//   }, [user]);

//   // Charger le compteur au montage
//   useEffect(() => {
//     if (user) {
//       fetchUnreadCount();
//     }
//   }, [user, fetchUnreadCount]);

//   // Rafraîchir le compteur toutes les 30 secondes
//   useEffect(() => {
//     if (!user) return;
//     const interval = setInterval(fetchUnreadCount, 30000);
//     return () => clearInterval(interval);
//   }, [user, fetchUnreadCount]);

//   const getNavItems = () => {
//     if (!user) return [];
//     return menuConfig[user.role as keyof typeof menuConfig] || [];
//   };

//   const navItems = getNavItems();

//   const handleLogout = () => {
//     logout();
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

//   if (!isAuthenticated || !user) {
//     return null;
//   }

//   return (
//     <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
//       <aside 
//         className={`sticky top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 z-40 ${
//           isCollapsed ? 'w-20' : 'w-64'
//         }`}
//       >
//         {/* Logo et toggle */}
//         <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
//           <Link href="/dashboard" className="flex items-center space-x-3">
//             <img src="logo.png" className={`h-10 w-auto ${isCollapsed ? 'mx-auto hidden' : 'w-10'}`} alt="Logo"/>
//             {!isCollapsed && (
//               <div>
//                 <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
//                   FPI Platform
//                 </h1>
//                 <p className="text-xs text-gray-500 -mt-0.5">Gestion industrielle</p>
//               </div>
//             )}
//           </Link>
//           <button
//             onClick={() => setIsCollapsed(!isCollapsed)}
//             className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
//           >
//             {isCollapsed ? <ArrowRight className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400 rotate-90" />}
//           </button>
//         </div>

//         {/* Menu utilisateur compact */}
//         <div className={`p-4 border-b border-gray-200 ${isCollapsed ? 'text-center' : ''}`}>
//           <div className="flex items-center space-x-3">
//             {user.photo_profil ? (
//               <img 
//                 src={user.photo_profil} 
//                 alt={user.username} 
//                 className={`${isCollapsed ? 'w-10 h-10 mx-auto' : 'w-11 h-11'} rounded-full object-cover border-2 border-gray-100 shadow-sm`}
//               />
//             ) : (
//               <div className={`${isCollapsed ? 'w-10 h-10 mx-auto' : 'w-11 h-11'} rounded-full bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center shadow-sm`}>
//                 <span className="text-white font-semibold text-sm">
//                   {user.username.charAt(0).toUpperCase()}
//                 </span>
//               </div>
//             )}
//             {!isCollapsed && (
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-semibold text-gray-900 truncate">{user.username}</p>
//                 <p className="text-xs text-gray-500 truncate">{getRoleLabel(user.role)}</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 overflow-y-auto p-3 space-y-1">
//           {navItems.map((item) => {
//             const Icon = item.icon;
//             const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 rounded-xl transition-all duration-200 ${
//                   isActive 
//                     ? 'bg- text-blue-600 font-medium ' 
//                     : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//                 }`}
//                 title={isCollapsed ? item.label : undefined}
//               >
//                 <div className="relative">
//                   <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-600' : ''}`} />
//                   {/* Badge de notifications */}
//                   {(item as any).badge && unreadCount > 0 && (
//                     <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 border-2 border-white shadow-sm">
//                       {unreadCount > 99 ? '99+' : unreadCount}
//                     </span>
//                   )}
//                 </div>
//                 {!isCollapsed && (
//                   <>
//                     <span className="flex-1">{item.label}</span>
                   
//                   </>
//                 )}
//                 {!isCollapsed && isActive && !(item as any).badge && (
//                   <div className="w-1.5 h-5 bg-blue-600 "></div>
//                 )}
//               </Link>
//             );
//           })}
//         </nav>

//         {/* Déconnexion */}
//         <div className="border-t border-gray-200 p-3">
//           <button
//             onClick={handleLogout}
//             className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} w-full px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors`}
//             title={isCollapsed ? 'Déconnexion' : undefined}
//           >
//             <LogOut className="h-5 w-5 flex-shrink-0" />
//             {!isCollapsed && <span>Déconnexion</span>}
//           </button>
//         </div>
//       </aside>
//     </SidebarContext.Provider>
//   );
// }

// components/Sidebar.tsx - Version mise à jour
'use client';

import { 
  LogOut, User as UserIcon, Home, Building2, 
  Wrench, CreditCard, Shield, Users, BarChart3, 
  Bell, Search, Briefcase, CheckCircle, X, ChevronDown,
  TrendingUp, FileText, Activity, Check, Trash2, Clock, XCircle,
  Loader2, ArrowRight, BellRing, CheckCheck, FileCheck, DollarSign,
  Eye, EyeOff, LayoutDashboard, FolderKanban, UserCircle, BellDot,
  MessageCircle // Ajout de l'icône messagerie
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';

// Contexte pour partager l'état de la sidebar
export const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

// Définition des menus par rôle - AJOUT de l'item Messagerie
const menuConfig = {
  promoteur: [
    { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/mes-projets', label: 'Mes projets', icon: FolderKanban },
    { href: '/messagerie', label: 'Messagerie', icon: MessageCircle, badge: true }, // NOUVEAU
    { href: '/profile', label: 'Profil', icon: UserCircle },
    { href: '/notifications', label: 'Notifications', icon: BellDot, badge: true },
  ],

  credit: [
    { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/evaluation', label: 'Evaluation', icon: FolderKanban },
    { href: '/messagerie', label: 'Messagerie', icon: MessageCircle, badge: true }, // NOUVEAU
    { href: '/profile', label: 'Profil', icon: UserCircle },
    { href: '/notifications', label: 'Notifications', icon: BellDot, badge: true },
    { href: '/stats', label: 'Statistiques', icon: BarChart3 },
  ],
  
  technique: [
    { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/evaluation-tech', label: 'Evaluation', icon: FolderKanban },
    { href: '/messagerie', label: 'Messagerie', icon: MessageCircle, badge: true }, // NOUVEAU
    { href: '/profile', label: 'Profil', icon: UserCircle },
    { href: '/notifications', label: 'Notifications', icon: BellDot, badge: true },
  ],
  
  admin: [
    { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/users', label: 'Utilisateurs', icon: Users },
    { href: '/messagerie', label: 'Messagerie', icon: MessageCircle, badge: true }, // NOUVEAU
    { href: '/profile', label: 'Profil', icon: UserCircle },
    { href: '/notifications', label: 'Notifications', icon: BellDot, badge: true },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // État pour le compteur de notifications non lues
  const [unreadCount, setUnreadCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0); // NOUVEAU
  const [loadingCount, setLoadingCount] = useState(false);

  // Fonction pour récupérer le nombre de notifications non lues
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    
    setLoadingCount(true);
    try {
      // Notifications
      const { count: notifCount, error: notifError } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('est_lue', false);

      if (!notifError) {
        setUnreadCount(notifCount || 0);
      }

      // Messages non lus - NOUVEAU
      const { count: msgCount, error: msgError } = await supabase
        .from('messages_projet')
        .select('id', { count: 'exact', head: true })
        .neq('expediteur_id', user.id)
        .eq('est_lu', false);

      if (!msgError) {
        setMessagesCount(msgCount || 0);
      }
    } catch (error) {
      // Silencieux
    } finally {
      setLoadingCount(false);
    }
  }, [user]);

  // Charger le compteur au montage
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user, fetchUnreadCount]);

  // Rafraîchir le compteur toutes les 30 secondes
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  // S'abonner aux nouveaux messages en temps réel
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('sidebar_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages_projet',
        },
        (payload) => {
          const newMsg = payload.new as any;
          if (newMsg.expediteur_id !== user.id) {
            setMessagesCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getNavItems = () => {
    if (!user) return [];
    return menuConfig[user.role as keyof typeof menuConfig] || [];
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
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

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <aside 
        className={`sticky top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 z-40 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo et toggle */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <img src="logo.png" className={`h-10 w-auto ${isCollapsed ? 'mx-auto hidden' : 'w-10'}`} alt="Logo"/>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  FPI Platform
                </h1>
                <p className="text-xs text-gray-500 -mt-0.5">Gestion industrielle</p>
              </div>
            )}
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? <ArrowRight className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400 rotate-90" />}
          </button>
        </div>

        {/* Menu utilisateur compact */}
        <div className={`p-4 border-b border-gray-200 ${isCollapsed ? 'text-center' : ''}`}>
          <div className="flex items-center space-x-3">
            {user.photo_profil ? (
              <img 
                src={user.photo_profil} 
                alt={user.username} 
                className={`${isCollapsed ? 'w-10 h-10 mx-auto' : 'w-11 h-11'} rounded-full object-cover border-2 border-gray-100 shadow-sm`}
              />
            ) : (
              <div className={`${isCollapsed ? 'w-10 h-10 mx-auto' : 'w-11 h-11'} rounded-full bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center shadow-sm`}>
                <span className="text-white font-semibold text-sm">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.username}</p>
                <p className="text-xs text-gray-500 truncate">{getRoleLabel(user.role)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            
            // Déterminer quel badge afficher
            let badgeCount = 0;
            if (item.label === 'Messagerie') {
              badgeCount = messagesCount;
            } else if (item.label === 'Notifications') {
              badgeCount = unreadCount;
            }
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-600' : ''}`} />
                  {/* Badge pour messages ou notifications */}
                  {badgeCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 border-2 border-white shadow-sm">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {badgeCount > 0 && (
                      <span className="text-xs text-red-500 font-semibold">
                        {badgeCount > 99 ? '99+' : badgeCount}
                      </span>
                    )}
                  </>
                )}
                {!isCollapsed && isActive && !badgeCount && (
                  <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Déconnexion */}
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={handleLogout}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} w-full px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors`}
            title={isCollapsed ? 'Déconnexion' : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
    </SidebarContext.Provider>
  );
}