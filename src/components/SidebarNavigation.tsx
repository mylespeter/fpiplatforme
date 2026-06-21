'use client';

import { 
  LogOut, User as UserIcon, Menu, X, Home, Building2, 
  Wrench, CreditCard, Shield, Users, BarChart3, 
  ChevronDown, Settings, Bell, Search, Briefcase,CheckCircle,
  TrendingUp, FileText, Activity, Check, Trash2,Clock,XCircle,
  Loader2, ArrowRight, BellRing, CheckCheck,FileCheck,DollarSign,
  ChevronLeft, ChevronRight, PanelLeftClose, PanelLeft
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback } from 'react';

// Types
type Notification = {
  id: number;
  user_id: string;
  type: string;
  titre: string;
  message: string;
  lien: string | null;
  projet_id: number | null;
  est_lue: boolean;
  icone: string | null;
  created_at: string;
  projet_titre?: string | null;
  temps_ecoule?: string;
};

// Définition des menus par rôle
const menuConfig = {
  promoteur: [
    { href: '/dashboard', label: 'Vue d\'ensemble', icon: Activity, tooltip: 'Tableau de bord général' },
    { href: '/dashboard/dashboard', label: 'Mes Projets', icon: Building2, tooltip: 'Gérer mes projets industriels' },
    { href: '/dashboard/demandes', label: 'Demandes', icon: FileText, tooltip: 'Suivre mes demandes' },
  ],
  technique: [
    { href: '/dashboard/technique', label: 'Vue d\'ensemble', icon: Activity, tooltip: 'Tableau de bord général' },
    { href: '/dashboard/technique/projets', label: 'Validation & Analyse', icon: Shield, tooltip: 'Valider et analyser les projets' },
    { href: '/dashboard/technique/rapports', label: 'Rapports', icon: FileText, tooltip: 'Rapports techniques' },
  ],
  credit: [
    { href: '/dashboard/credit', label: 'Vue d\'ensemble', icon: Activity, tooltip: 'Tableau de bord général' },
    { href: '/dashboard/credit/dossiers', label: 'Dossiers', icon: Briefcase, tooltip: 'Dossiers de crédit' },
    { href: '/dashboard/credit/analyses', label: 'Analyses', icon: TrendingUp, tooltip: 'Analyses financières' },
  ],
  admin: [
    { href: '/dashboard/admin', label: 'Vue d\'ensemble', icon: Activity, tooltip: 'Tableau de bord général' },
    { href: '/dashboard/admin/utilisateurs', label: 'Utilisateurs', icon: Users, tooltip: 'Gérer les utilisateurs' },
    { href: '/dashboard/admin/statistiques', label: 'Statistiques', icon: BarChart3, tooltip: 'Voir les statistiques' },
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
};

export default function SidebarNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  
  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [marquageLoading, setMarquageLoading] = useState<number | null>(null);

  // Fermer les menus au changement de route
  useEffect(() => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
    setShowNotifications(false);
  }, [pathname]);

  // Ajuster le margin du contenu principal quand la sidebar est toggle
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      if (collapsed) {
        mainContent.classList.remove('ml-72');
        mainContent.classList.add('ml-20');
      } else {
        mainContent.classList.remove('ml-20');
        mainContent.classList.add('ml-72');
      }
    }
  }, [collapsed]);

  // Charger les notifications
  const chargerNotifications = useCallback(async () => {
    if (!user) return;
    
    setNotificationsLoading(true);
    try {
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
          est_lue,
          icone,
          created_at,
          projets!projet_id (
            titre
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Erreur Supabase:', error);
        if (error.code === '42P01') {
          console.log('Table notifications non trouvée, création nécessaire');
          setNotifications([]);
          setUnreadCount(0);
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
          est_lue: item.est_lue || false,
          icone: item.icone,
          created_at: item.created_at,
          projet_titre: item.projets?.titre || null,
          temps_ecoule: getTempsEcoule(item.created_at)
        })) || [];
        
        setNotifications(formattedData);
        setUnreadCount(formattedData.filter(n => !n.est_lue).length);
      }
    } catch (error: any) {
      console.error('Erreur chargement notifications:', error.message || error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setNotificationsLoading(false);
    }
  }, [user]);

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
    setMarquageLoading(notificationId);
    try {
      await supabase.rpc('marquer_notification_lue', { 
        p_notification_id: notificationId,
        p_user_id: user?.id 
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, est_lue: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      if (lien) {
        setShowNotifications(false);
        router.push(lien);
      }
    } catch (error) {
      console.error('Erreur marquage:', error);
    } finally {
      setMarquageLoading(null);
    }
  };

  // Marquer tout comme lu
  const marquerToutLu = async () => {
    try {
      await supabase.rpc('marquer_toutes_notifications_lues', {
        p_user_id: user?.id
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, est_lue: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Supprimer une notification
  const supprimerNotification = async (notificationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const notif = notifications.find(n => n.id === notificationId);
      if (notif && !notif.est_lue) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
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

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      {/* Sidebar desktop */}
      <aside 
        className={`hidden md:flex fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300 flex-col ${
          collapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center space-x-3 group min-w-0">
              <div className="relative flex-shrink-0">
                <img src="logo.png" className='w-10 h-auto' alt="Logo"/>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent truncate">
                  FPI Platform
                </h1>
                <p className="text-xs text-gray-500 -mt-0.5">Gestion industrielle</p>
              </div>
            </Link>
          )}
          {collapsed && (
            <div className="flex justify-center w-full">
              <img src="logo.png" className='w-10 h-auto' alt="Logo"/>
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation principale */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary/5 text-primary font-medium shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.tooltip : undefined}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                {!collapsed && (
                  <>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isActive ? 'text-primary' : 'text-gray-700'}`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{item.tooltip}</p>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-8 bg-primary rounded-full ml-auto flex-shrink-0"></div>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Section notifications rapide */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
              if (!showNotifications) chargerNotifications();
            }}
            className={`w-full flex items-center px-3 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Bell className="h-5 w-5 text-yellow-600" />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 border-2 border-white shadow-sm">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            {!collapsed && (
              <>
                <div className="ml-3 text-left flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">Notifications</p>
                  <p className="text-xs text-gray-400 truncate">
                    {unreadCount > 0 ? `${unreadCount} non lue(s)` : 'Aucune nouvelle'}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <span className="min-w-[24px] h-6 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-2 flex-shrink-0">
                    {unreadCount}
                  </span>
                )}
              </>
            )}
          </button>
        </div>

        {/* Profil utilisateur */}
        <div className="p-3 border-t border-gray-100">
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className={`w-full flex items-center p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <div className="relative flex-shrink-0">
                {user.photo_profil ? (
                  <img 
                    src={user.photo_profil} 
                    alt={user.username} 
                    className="w-10 h-10 rounded-xl object-cover border-2 border-gray-100 shadow-sm"
                  />
                ) : (
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center shadow-sm`}>
                    <span className="text-white font-semibold text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
              </div>
              
              {!collapsed && (
                <>
                  <div className="ml-3 text-left flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{user.username}</p>
                    <p className="text-xs text-gray-500 truncate">{getRoleLabel(user.role)}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                    showUserMenu ? 'rotate-180' : ''
                  }`} />
                </>
              )}
            </button>

            {/* Dropdown menu utilisateur */}
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
                  <div className="p-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      {user.photo_profil ? (
                        <img 
                          src={user.photo_profil} 
                          alt={user.username} 
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md"
                        />
                      ) : (
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center shadow-md`}>
                          <span className="text-white font-bold text-lg">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{user.username}</h3>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 mt-1 text-xs font-medium rounded-full border ${getRoleBgLight(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <Link
                      href="/profile"
                      className="flex items-center px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <UserIcon className="w-4 h-4 mr-3 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium">Mon profil</p>
                        <p className="text-xs text-gray-400 truncate">Gérer mes informations</p>
                      </div>
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors mt-1"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4 mr-3 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium">Paramètres</p>
                        <p className="text-xs text-gray-400 truncate">Préférences du compte</p>
                      </div>
                    </Link>
                  </div>

                  <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium">Déconnexion</p>
                        <p className="text-xs text-red-400 truncate">Se déconnecter du système</p>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dropdown notifications */}
        {showNotifications && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
            <div className="absolute left-full top-0 ml-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden animate-in slide-in-from-left-2 duration-200">
              {/* En-tête */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <p className="text-xs text-gray-500">
                    {unreadCount > 0 ? `${unreadCount} non lue(s)` : 'Tout est lu'}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={marquerToutLu}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors flex-shrink-0"
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
                  <div className="flex flex-col items-center justify-center py-12 text-center">
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
                      
                      return (
                        <div
                          key={notif.id}
                          onClick={() => marquerLue(notif.id, notif.lien)}
                          className={`w-full text-left p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${
                            !notif.est_lue ? 'bg-primary/[0.02]' : ''
                          } ${marquageLoading === notif.id ? 'pointer-events-none' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                              getNotificationColor(notif.type)
                            }`}>
                              <IconComponent className="h-5 w-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm ${!notif.est_lue ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                  {notif.titre}
                                </p>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {!notif.est_lue && (
                                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                                  )}
                                  <span
                                    onClick={(e) => supprimerNotification(notif.id, e)}
                                    className="p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer"
                                    role="button"
                                    tabIndex={0}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                {notif.message}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] text-gray-400">
                                  {notif.temps_ecoule || 'À l\'instant'}
                                </span>
                                {notif.projet_titre && (
                                  <span className="text-[10px] text-primary/70 truncate max-w-[150px]">
                                    • {notif.projet_titre}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {marquageLoading === notif.id && (
                            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
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
      </aside>

      {/* Menu mobile */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
            {/* En-tête mobile */}
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

            {/* Notifications rapides mobile */}
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

            {/* Navigation mobile */}
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

            {/* Profil mobile */}
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

      {/* Bouton menu mobile */}
      <button
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="fixed top-4 right-4 z-50 md:hidden flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
      >
        {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
    </>
  );
}