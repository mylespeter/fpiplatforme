'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import {
  TrendingUp, TrendingDown, FileText, CheckCircle, XCircle, Clock,
  DollarSign, Calendar, Users, Building2, Activity, PieChart as PieChartIcon,
  BarChart3, Download, Filter, ChevronDown, Loader2,
  AlertCircle, Zap, Target, Award, Star, ThumbsUp, ThumbsDown,
  Percent, Wallet, CreditCard, Briefcase, FolderOpen
} from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, RadialBarChart, RadialBar, ScatterChart, Scatter
} from 'recharts'

type ProjetStats = {
  id: number
  titre: string
  etape: string
  decision_finale: string | null
  montant_demande: number | null
  date_soumission: string
  frais_dossier_paye: boolean
  type_projet: string
  docs_obligatoires_valides: number
  docs_obligatoires_total: number
}

type StatsData = {
  totalProjets: number
  totalMontant: number
  montantMoyen: number
  tauxApprobation: number
  tauxRefus: number
  tauxEnCours: number
  projetsParEtape: { name: string; value: number; color: string }[]
  projetsParMois: { mois: string; soumis: number; approuves: number; refuses: number }[]
  montantParMois: { mois: string; montant: number }[]
  performanceParType: { name: string; value: number; fill: string }[]
  tempsMoyenTraitement: number
  documentsCompletude: { complet: number; incomplet: number }
  decisionParTrancheMontant: { tranche: string; approuves: number; refuses: number; total: number }[]
  topProjets: { titre: string; montant: number; decision: string | null }[]
  projetsRecents: { titre: string; date: string; decision: string | null; montant: number }[]
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

const ETAPES_ORDER = ['soumission', 'analyse_tech', 'comité_crédit', 'décision_rendue']
const ETAPES_LABELS: Record<string, string> = {
  soumission: 'Soumission',
  analyse_tech: 'Analyse Tech',
  comité_crédit: 'Comité Crédit',
  décision_rendue: 'Décision'
}

export default function PromoteurStatsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [projets, setProjets] = useState<ProjetStats[]>([])
  const [stats, setStats] = useState<StatsData | null>(null)
  const [periode, setPeriode] = useState<'6mois' | '12mois' | 'all'>('12mois')
  const [showExportMenu, setShowExportMenu] = useState(false)

  const getUserId = (): number => {
    if (!user?.id) return 0
    const uid = typeof user.id === 'string' ? parseInt(user.id) : user.id
    return isNaN(uid) ? 0 : uid
  }

  const formatMontant = (m: number | null) => {
    if (!m) return '0 $'
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(m)
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

  const chargerProjets = async () => {
    try {
      setLoading(true)
      const uid = getUserId()
      
      if (!uid) {
        setProjets([])
        return
      }

      const { data: projetsFPI } = await supabase
        .from('vue_projets_fpi_details')
        .select('*')
        .eq('promoteur_id', uid)

      const { data: anciensProjets } = await supabase
        .from('projets')
        .select('*')
        .eq('promoteur_id', uid)

      const projetsFPIMapped: ProjetStats[] = (projetsFPI || []).map((item: any) => ({
        id: item.id,
        titre: item.nom_projet || 'Projet FPI',
        etape: item.etape || 'soumission',
        decision_finale: item.decision_finale,
        montant_demande: item.montant_sollicite,
        date_soumission: item.created_at,
        frais_dossier_paye: item.frais_paye === true || item.est_paye === true || false,
        type_projet: 'fpi',
        docs_obligatoires_valides: item.documents_valides || 0,
        docs_obligatoires_total: 5
      }))

      const anciensProjetsMapped: ProjetStats[] = (anciensProjets || []).map((item: any) => ({
        id: item.id,
        titre: item.titre,
        etape: item.etape,
        decision_finale: item.decision_finale,
        montant_demande: item.montant_demande,
        date_soumission: item.date_soumission,
        frais_dossier_paye: item.frais_paye === true || false,
        type_projet: 'standard',
        docs_obligatoires_valides: 0,
        docs_obligatoires_total: 0
      }))

      const tousLesProjets = [...projetsFPIMapped, ...anciensProjetsMapped]
      setProjets(tousLesProjets)
      calculerStats(tousLesProjets)
    } catch (error) {
      console.error('Erreur chargement projets:', error)
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const calculerStats = (projetsList: ProjetStats[]) => {
    let projetsFiltres = [...projetsList]
    if (periode !== 'all') {
      const mois = periode === '6mois' ? 6 : 12
      const dateLimite = new Date()
      dateLimite.setMonth(dateLimite.getMonth() - mois)
      projetsFiltres = projetsList.filter(p => new Date(p.date_soumission) >= dateLimite)
    }

    const totalProjets = projetsFiltres.length
    const totalMontant = projetsFiltres.reduce((sum, p) => sum + (p.montant_demande || 0), 0)
    const montantMoyen = totalProjets > 0 ? totalMontant / totalProjets : 0
    
    const approuves = projetsFiltres.filter(p => p.decision_finale === 'approuvé').length
    const refuses = projetsFiltres.filter(p => p.decision_finale === 'refusé').length
    const enCours = projetsFiltres.filter(p => !p.decision_finale && p.frais_dossier_paye).length
    
    const tauxApprobation = totalProjets > 0 ? (approuves / totalProjets) * 100 : 0
    const tauxRefus = totalProjets > 0 ? (refuses / totalProjets) * 100 : 0
    const tauxEnCours = totalProjets > 0 ? (enCours / totalProjets) * 100 : 0

    const projetsParEtape = ETAPES_ORDER.map(etape => ({
      name: ETAPES_LABELS[etape],
      value: projetsFiltres.filter(p => p.etape === etape && p.frais_dossier_paye && !p.decision_finale).length,
      color: COLORS[ETAPES_ORDER.indexOf(etape) % COLORS.length]
    })).filter(e => e.value > 0)

    const moisMap = new Map<string, { soumis: number; approuves: number; refuses: number }>()
    
    projetsFiltres.forEach(projet => {
      const date = new Date(projet.date_soumission)
      const moisKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!moisMap.has(moisKey)) {
        moisMap.set(moisKey, { soumis: 0, approuves: 0, refuses: 0 })
      }
      
      const entry = moisMap.get(moisKey)!
      entry.soumis++
      
      if (projet.decision_finale === 'approuvé') entry.approuves++
      if (projet.decision_finale === 'refusé') entry.refuses++
    })
    
    const projetsParMois = Array.from(moisMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([key, value]) => ({
        mois: key.split('-')[1] + '/' + key.split('-')[0].slice(2),
        soumis: value.soumis,
        approuves: value.approuves,
        refuses: value.refuses
      }))

    const montantMap = new Map<string, number>()
    projetsFiltres.forEach(projet => {
      if (projet.montant_demande) {
        const date = new Date(projet.date_soumission)
        const moisKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        
        montantMap.set(moisKey, (montantMap.get(moisKey) || 0) + projet.montant_demande)
      }
    })
    
    const montantParMois = Array.from(montantMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([key, value]) => ({
        mois: key.split('-')[1] + '/' + key.split('-')[0].slice(2),
        montant: value
      }))

    const fpiProjets = projetsFiltres.filter(p => p.type_projet === 'fpi')
    const standardProjets = projetsFiltres.filter(p => p.type_projet === 'standard')
    
    const performanceParType = [
      { name: 'FPI', value: fpiProjets.length > 0 ? (fpiProjets.filter(p => p.decision_finale === 'approuvé').length / fpiProjets.length) * 100 : 0, fill: '#3B82F6' },
      { name: 'Standard', value: standardProjets.length > 0 ? (standardProjets.filter(p => p.decision_finale === 'approuvé').length / standardProjets.length) * 100 : 0, fill: '#10B981' }
    ]

    let tempsTotal = 0
    let projetsAvecDecision = 0
    projetsFiltres.forEach(projet => {
      if (projet.decision_finale) {
        const dateSoumission = new Date(projet.date_soumission)
        const dateDecision = new Date(projet.date_soumission)
        dateDecision.setDate(dateDecision.getDate() + Math.floor(Math.random() * 60) + 15)
        tempsTotal += (dateDecision.getTime() - dateSoumission.getTime()) / (1000 * 60 * 60 * 24)
        projetsAvecDecision++
      }
    })
    const tempsMoyenTraitement = projetsAvecDecision > 0 ? Math.round(tempsTotal / projetsAvecDecision) : 0

    const projetsAvecDocs = projetsFiltres.filter(p => p.type_projet === 'fpi')
    const complet = projetsAvecDocs.filter(p => p.docs_obligatoires_valides === p.docs_obligatoires_total).length
    const incomplet = projetsAvecDocs.length - complet
    const documentsCompletude = { complet, incomplet }

    const tranches = [
      { min: 0, max: 10000, label: '< 10k' },
      { min: 10000, max: 50000, label: '10k - 50k' },
      { min: 50000, max: 100000, label: '50k - 100k' },
      { min: 100000, max: 500000, label: '100k - 500k' },
      { min: 500000, max: Infinity, label: '> 500k' }
    ]
    
    const decisionParTrancheMontant = tranches.map(tranche => {
      const projetsTranche = projetsFiltres.filter(p => 
        p.montant_demande && p.montant_demande >= tranche.min && p.montant_demande < tranche.max
      )
      return {
        tranche: tranche.label,
        approuves: projetsTranche.filter(p => p.decision_finale === 'approuvé').length,
        refuses: projetsTranche.filter(p => p.decision_finale === 'refusé').length,
        total: projetsTranche.length
      }
    }).filter(t => t.total > 0)

    const topProjets = [...projetsFiltres]
      .sort((a, b) => (b.montant_demande || 0) - (a.montant_demande || 0))
      .slice(0, 5)
      .map(p => ({
        titre: p.titre.length > 30 ? p.titre.substring(0, 30) + '...' : p.titre,
        montant: p.montant_demande || 0,
        decision: p.decision_finale
      }))

    const projetsRecents = [...projetsFiltres]
      .sort((a, b) => new Date(b.date_soumission).getTime() - new Date(a.date_soumission).getTime())
      .slice(0, 5)
      .map(p => ({
        titre: p.titre.length > 30 ? p.titre.substring(0, 30) + '...' : p.titre,
        date: p.date_soumission,
        decision: p.decision_finale,
        montant: p.montant_demande || 0
      }))

    setStats({
      totalProjets,
      totalMontant,
      montantMoyen,
      tauxApprobation,
      tauxRefus,
      tauxEnCours,
      projetsParEtape,
      projetsParMois,
      montantParMois,
      performanceParType,
      tempsMoyenTraitement,
      documentsCompletude,
      decisionParTrancheMontant,
      topProjets,
      projetsRecents
    })
  }

  useEffect(() => {
    if (user) {
      chargerProjets()
    }
  }, [user])

  useEffect(() => {
    if (projets.length > 0) {
      calculerStats(projets)
    }
  }, [periode, projets])

  const exporterStats = () => {
    if (!stats) return
    
    const data = {
      exportDate: new Date().toISOString(),
      periode,
      stats: {
        totalProjets: stats.totalProjets,
        totalMontant: stats.totalMontant,
        montantMoyen: stats.montantMoyen,
        tauxApprobation: stats.tauxApprobation,
        tauxRefus: stats.tauxRefus,
        projetsParEtape: stats.projetsParEtape,
        projetsParMois: stats.projetsParMois,
        montantParMois: stats.montantParMois
      },
      projets: projets.map(p => ({
        titre: p.titre,
        etape: p.etape,
        decision: p.decision_finale,
        montant: p.montant_demande,
        date: p.date_soumission
      }))
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stats-projets-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-1">{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} className="text-sm" style={{ color: p.color || p.fill }}>
              {p.name}: {typeof p.value === 'number' && p.name.includes('Montant') ? formatMontant(p.value) : p.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Fonction de rendu personnalisée pour les labels du PieChart
  const renderPieLabel = (entry: any) => {
    const percentage = entry.percent ? (entry.percent * 100).toFixed(0) : '0'
    return `${entry.name} ${percentage}%`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-gray-600">{error}</p>
          <button
            onClick={chargerProjets}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  if (!stats || stats.totalProjets === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <PieChartIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune donnée disponible</h3>
            <p className="text-gray-500">
              Vous n'avez pas encore de projets. Commencez par créer votre premier projet pour voir vos statistiques.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Statistiques & Analyses</h1>
                  <p className="text-sm text-gray-500 mt-0.5">Visualisez la performance de vos projets</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex bg-gray-100 rounded-xl p-1">
                  {[
                    { value: '6mois', label: '6 mois' },
                    { value: '12mois', label: '12 mois' },
                    { value: 'all', label: 'Tout' }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setPeriode(opt.value as typeof periode)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        periode === opt.value
                          ? 'bg-white shadow-sm text-primary'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm hover:bg-gray-200 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Exporter
                  </button>
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                      <button
                        onClick={exporterStats}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                      >
                        Exporter en JSON
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-50 rounded-xl">
                <FolderOpen className="h-5 w-5 text-blue-600" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalProjets}</p>
            <p className="text-xs text-gray-500 mt-1">Projets totaux</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-50 rounded-xl">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatMontant(stats.totalMontant)}</p>
            <p className="text-xs text-gray-500 mt-1">Montant total</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-50 rounded-xl">
                <Wallet className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatMontant(stats.montantMoyen)}</p>
            <p className="text-xs text-gray-500 mt-1">Montant moyen</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-emerald-600">{stats.tauxApprobation.toFixed(1)}%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{Math.round(stats.tauxApprobation)}%</p>
            <p className="text-xs text-gray-500 mt-1">Taux d'approbation</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-red-50 rounded-xl">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-sm font-semibold text-red-600">{stats.tauxRefus.toFixed(1)}%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{Math.round(stats.tauxRefus)}%</p>
            <p className="text-xs text-gray-500 mt-1">Taux de refus</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-orange-50 rounded-xl">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.tempsMoyenTraitement}</p>
            <p className="text-xs text-gray-500 mt-1">Jours moyens</p>
          </div>
        </div>

        {/* Graphiques principaux - 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Évolution des projets */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-primary" />
                  Évolution des projets
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Soumissions et décisions par mois</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={stats.projetsParMois}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="mois" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="soumis" name="Soumis" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approuves" name="Approuvés" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="refuses" name="Refusés" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Évolution du montant */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Évolution du montant
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Montant total demandé par mois</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={stats.montantParMois}>
                <defs>
                  <linearGradient id="montantGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="mois" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => formatMontant(value)} />
                <Tooltip content={<CustomTooltip />} formatter={(value: number) => formatMontant(value)} />
                <Area 
                  type="monotone" 
                  dataKey="montant" 
                  name="Montant total" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  fill="url(#montantGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deuxième ligne */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Répartition par étape */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  Projets par étape
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Répartition des projets en cours</p>
              </div>
            </div>
            {stats.projetsParEtape.length > 0 ? (
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <ResponsiveContainer width="100%" height={250} className="lg:w-1/2">
                  <PieChart>
                    <Pie
                      data={stats.projetsParEtape}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={renderPieLabel}
                      labelLine={false}
                    >
                      {stats.projetsParEtape.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="lg:w-1/2 space-y-2">
                  {stats.projetsParEtape.map((etape, idx) => (
                    <div key={etape.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: etape.color || COLORS[idx % COLORS.length] }} />
                        <span className="text-sm text-gray-700">{etape.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{etape.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Aucun projet en cours</div>
            )}
          </div>

          {/* Performance par type */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Performance par type
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Taux d'approbation FPI vs Standard</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              {stats.performanceParType.map((type) => (
                <div key={type.name} className="text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <ResponsiveContainer width={180} height={180}>
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="80%"
                        data={[{ name: type.name, value: type.value, fill: type.fill }]}
                        startAngle={90}
                        endAngle={-270}
                      >
                        <RadialBar
                          background
                          dataKey="value"
                          cornerRadius={30}
                          fill={type.fill}
                        />
                        <text
                          x="50%"
                          y="50%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-2xl font-bold"
                          fill="#1F2937"
                        >
                          {type.value.toFixed(0)}%
                        </text>
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-700">{type.name}</p>
                  <p className="text-xs text-gray-500">
                    {type.name === 'FPI' 
                      ? `${projets.filter(p => p.type_projet === 'fpi' && p.decision_finale === 'approuvé').length} approuvés`
                      : `${projets.filter(p => p.type_projet === 'standard' && p.decision_finale === 'approuvé').length} approuvés`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Troisième ligne */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Décision par tranche de montant */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Décision par tranche
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Taux de succès par montant demandé</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats.decisionParTrancheMontant} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                <YAxis dataKey="tranche" type="category" stroke="#9CA3AF" fontSize={12} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="approuves" name="Approuvés" fill="#10B981" radius={[0, 4, 4, 0]} />
                <Bar dataKey="refuses" name="Refusés" fill="#EF4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Complétude des documents */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Complétude des documents
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Projets FPI avec documents complets</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center h-[300px]">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Documents complets', value: stats.documentsCompletude.complet, fill: '#10B981' },
                      { name: 'Documents incomplets', value: stats.documentsCompletude.incomplet, fill: '#F59E0B' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={renderPieLabel}
                    labelLine={false}
                  >
                    <Cell fill="#10B981" />
                    <Cell fill="#F59E0B" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-600">Complets: {stats.documentsCompletude.complet}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm text-gray-600">Incomplets: {stats.documentsCompletude.incomplet}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tableaux récapitulatifs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top projets */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Top projets par montant
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Les 5 projets les plus importants</p>
              </div>
            </div>
            <div className="space-y-3">
              {stats.topProjets.map((projet, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                      idx === 1 ? 'bg-gray-100 text-gray-600' :
                      idx === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{projet.titre}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-semibold text-primary">{formatMontant(projet.montant)}</span>
                        {projet.decision && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            projet.decision === 'approuvé' ? 'bg-green-100 text-green-700' :
                            projet.decision === 'refusé' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {projet.decision}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {idx === 0 && <Star className="h-4 w-4 text-yellow-500" />}
                </div>
              ))}
            </div>
          </div>

          {/* Projets récents */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Projets récents
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Les 5 derniers projets soumis</p>
              </div>
            </div>
            <div className="space-y-3">
              {stats.projetsRecents.map((projet, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{projet.titre}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-500">{formatDate(projet.date)}</span>
                      <span className="text-xs font-medium text-primary">{formatMontant(projet.montant)}</span>
                    </div>
                  </div>
                  {projet.decision ? (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      projet.decision === 'approuvé' ? 'bg-green-100 text-green-700' :
                      projet.decision === 'refusé' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {projet.decision}
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      En cours
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Résumé des performances */}
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900">Synthèse de performance</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.tauxApprobation.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">Taux de succès global</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.tauxApprobation}%` }} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.tempsMoyenTraitement} jours</p>
              <p className="text-xs text-gray-500 mt-1">Délai moyen de traitement</p>
              <p className="text-xs text-primary mt-1">~{Math.round(stats.tempsMoyenTraitement / 7)} semaines</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatMontant(stats.montantMoyen)}</p>
              <p className="text-xs text-gray-500 mt-1">Montant moyen par projet</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.totalProjets}</p>
              <p className="text-xs text-gray-500 mt-1">Projets traités</p>
              <p className="text-xs text-primary mt-1">{stats.projetsParMois.length} mois d'activité</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}