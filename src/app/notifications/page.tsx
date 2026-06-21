'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Bell, BellRing, CheckCheck, Search, X, Trash2,
  Clock, FileText, CheckCircle, AlertCircle,
  ArrowRight, Loader2, Inbox, RefreshCw, Check, Eye,
  Filter, ChevronDown
} from 'lucide-react';
import Link from 'next/link';

type Notification = {
  id: number;
  user_id: number;
  type: string;
  titre: string;
  message: string;
  lien: string | null;
  projet_id: number | null;
  est_lue: boolean;
  date_lecture: string | null;
  icone: string | null;
  created_at: string;
  projet_titre?: string | null;
  temps_ecoule?: string;
};

// Mapping des icônes simplifié
const iconeMap: Record<string, any> = {
  BellRing, FileText, CheckCircle, AlertCircle, Clock, Check
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'tous' | 'non_lues' | 'lues'>('tous');
  const [selectedType, setSelectedType] = useState<string>('tous');
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const getTypeColor = (type: string) => {
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

  const chargerNotifications = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id, user_id, type, titre, message, lien,
          projet_id, document_id, rapport_id,
          est_lue, date_lecture, icone, created_at, updated_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Erreur chargement:', error.message);
        setError('Erreur lors du chargement des notifications.');
        setNotifications([]);
        return;
      }

      if (data && data.length > 0) {
        const projetIds = [...new Set(data.map((n: any) => n.projet_id).filter(Boolean))];
        let projetsMap: Record<number, string> = {};
        
        if (projetIds.length > 0) {
          const { data: projets } = await supabase
            .from('projets_fpi')
            .select('id, nom_projet')
            .in('id', projetIds);
          
          if (projets) {
            projetsMap = projets.reduce((acc: any, p: any) => {
              acc[p.id] = p.nom_projet || 'Sans titre';
              return acc;
            }, {});
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
          est_lue: Boolean(item.est_lue),
          date_lecture: item.date_lecture || null,
          icone: item.icone || null,
          created_at: item.created_at || new Date().toISOString(),
          projet_titre: item.projet_id ? projetsMap[item.projet_id] || null : null,
          temps_ecoule: getTempsEcoule(item.created_at || new Date().toISOString()),
        }));
        
        setNotifications(formattedData);
      } else {
        setNotifications([]);
      }
    } catch (error: any) {
      console.error('Erreur:', error.message);
      setError('Erreur lors du chargement des notifications.');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) chargerNotifications();
  }, [user, chargerNotifications]);

  // Filtrage
  useEffect(() => {
    let filtered = [...notifications];

    if (activeTab === 'non_lues') {
      filtered = filtered.filter(n => !n.est_lue);
    } else if (activeTab === 'lues') {
      filtered = filtered.filter(n => n.est_lue);
    }

    if (selectedType !== 'tous') {
      filtered = filtered.filter(n => n.type === selectedType);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(n => 
        n.titre?.toLowerCase().includes(term) ||
        n.message?.toLowerCase().includes(term) ||
        n.projet_titre?.toLowerCase().includes(term)
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, activeTab, selectedType, searchTerm]);

  const marquerLue = async (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, est_lue: true, date_lecture: new Date().toISOString() } : n));
    
    try {
      await supabase
        .from('notifications')
        .update({ est_lue: true, date_lecture: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user?.id);
    } catch (error) {
      console.error('Erreur marquage:', error);
    }
  };

  const marquerToutLu = async () => {
    setActionLoading(true);
    setNotifications(prev => prev.map(n => ({ ...n, est_lue: true, date_lecture: new Date().toISOString() })));
    
    try {
      await supabase
        .from('notifications')
        .update({ est_lue: true, date_lecture: new Date().toISOString() })
        .eq('user_id', user?.id)
        .eq('est_lue', false);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const supprimerNotification = async (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const supprimerTout = async () => {
    setActionLoading(true);
    const idsToDelete = activeTab === 'tous' ? notifications.map(n => n.id) : filteredNotifications.map(n => n.id);
    setNotifications(prev => prev.filter(n => !idsToDelete.includes(n.id)));
    
    try {
      await supabase
        .from('notifications')
        .delete()
        .in('id', idsToDelete)
        .eq('user_id', user?.id);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setActionLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.est_lue) await marquerLue(notification.id);
    if (notification.lien) router.push(notification.lien);
  };

  const stats = {
    total: notifications.length,
    nonLues: notifications.filter(n => !n.est_lue).length,
    lues: notifications.filter(n => n.est_lue).length,
  };

  const typesUniques = [...new Set(notifications.map(n => n.type))];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className=" flex items-center justify-center ">
                <BellRing className="h-7 w-7 rotate-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.nonLues > 0 
                    ? `${stats.nonLues} notification${stats.nonLues > 1 ? 's' : ''} non lue${stats.nonLues > 1 ? 's' : ''}`
                    : 'Tout est lu ! 🎉'}
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
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800">{error}</p>
              <button onClick={chargerNotifications} className="mt-2 text-sm font-medium text-amber-800 hover:text-amber-900 underline">
                Réessayer
              </button>
            </div>
          </div>
        )}

      <div className="grid grid-cols-3 gap-4 mb-6">
  {[
    { label: 'Total', value: stats.total, icon: Bell },
    { label: 'Non lues', value: stats.nonLues, icon: BellRing },
    { label: 'Lues', value: stats.lues, icon: CheckCheck },
  ].map(stat => (
    <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <stat.icon className="h-4 w-4 text-gray-400" />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</span>
      </div>
      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
    </div>
  ))}
</div>

        {/* Contenu principal */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Barre de recherche et filtres */}
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filtre par type */}
              <div className="relative">
                <button
                  onClick={() => setShowTypeFilter(!showTypeFilter)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                    selectedType !== 'tous' 
                      ? 'bg-primary/10 text-primary border-primary/20' 
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  {selectedType !== 'tous' ? getTypeLabel(selectedType) : 'Type'}
                  <ChevronDown className={`h-3 w-3 transition-transform ${showTypeFilter ? 'rotate-180' : ''}`} />
                </button>

                {showTypeFilter && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowTypeFilter(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-20">
                      <button
                        onClick={() => { setSelectedType('tous'); setShowTypeFilter(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${selectedType === 'tous' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                      >
                        Tous les types
                      </button>
                      {typesUniques.map(type => (
                        <button
                          key={type}
                          onClick={() => { setSelectedType(type); setShowTypeFilter(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3 ${selectedType === type ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full ${getTypeBadgeColor(type).split(' ')[0]}`} />
                          {getTypeLabel(type)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Onglets */}
          <div className="flex items-center justify-between px-4 sm:px-6 border-b border-gray-100">
            <div className="flex gap-0">
              {[
                { id: 'tous' as const, label: 'Toutes', count: stats.total },
                { id: 'non_lues' as const, label: 'Non lues', count: stats.nonLues },
                { id: 'lues' as const, label: 'Lues', count: stats.lues },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 sm:px-6 py-3.5 text-sm font-medium transition-all ${
                    activeTab === tab.id ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {tab.label}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
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

            {activeTab === 'non_lues' && stats.nonLues > 0 && (
              <button
                onClick={marquerToutLu}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-colors"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
                Tout marquer lu
              </button>
            )}
          </div>

          {/* Liste des notifications */}
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-gray-500 font-medium">Chargement...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
                  <Inbox className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm || selectedType !== 'tous' ? 'Aucun résultat' : 'Aucune notification'}
                </h3>
                <p className="text-sm text-gray-500 text-center max-w-md">
                  {searchTerm || selectedType !== 'tous'
                    ? 'Modifiez vos critères de recherche.'
                    : 'Vous recevrez des notifications pour vos projets et mises à jour.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`group relative px-4 sm:px-6 py-5 hover:bg-gray-50/80 transition-all cursor-pointer ${
                    !notification.est_lue ? 'bg-primary/[0.02] border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icône */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border-2 ${getTypeColor(notification.type)}`}>
                      {(() => {
                        const Icon = notification.icone && iconeMap[notification.icone] ? iconeMap[notification.icone] : BellRing;
                        return <Icon className="h-5 w-5" />;
                      })()}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className={`text-sm font-semibold ${!notification.est_lue ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.titre}
                            </h3>
                            {!notification.est_lue && (
                              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            )}
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${getTypeBadgeColor(notification.type)}`}>
                              {getTypeLabel(notification.type)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {notification.temps_ecoule}
                            </span>
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
                            <Link href={notification.lien} onClick={(e) => e.stopPropagation()} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          )}
                          {!notification.est_lue && (
                            <button onClick={(e) => { e.stopPropagation(); marquerLue(notification.id); }} className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Marquer comme lu">
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); setNotificationToDelete(notification.id); setShowDeleteConfirm(true); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
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
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {filteredNotifications.length} notification{filteredNotifications.length > 1 ? 's' : ''}
                {notifications.length !== filteredNotifications.length && (
                  <span> sur {notifications.length}</span>
                )}
              </p>
              <button
                onClick={() => { setNotificationToDelete(-1); setShowDeleteConfirm(true); }}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1.5 font-medium"
              >
                <Trash2 className="h-3 w-3" />
                {activeTab === 'tous' ? 'Vider tout' : 'Supprimer cette liste'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="h-7 w-7 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              {notificationToDelete === -1 ? 'Supprimer toutes les notifications' : 'Supprimer la notification'}
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-3 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                Annuler
              </button>
              <button
                onClick={() => {
                  if (notificationToDelete === -1) supprimerTout();
                  else if (notificationToDelete !== null) {
                    supprimerNotification(notificationToDelete);
                    setShowDeleteConfirm(false);
                  }
                }}
                className="flex-1 px-4 py-3 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}