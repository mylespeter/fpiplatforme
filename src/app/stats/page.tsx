

'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  BarChart3, TrendingUp, TrendingDown, PieChart,
  MapPin, Briefcase, Building2, DollarSign,
  FileText, CheckCircle, XCircle, Clock,
  Loader2, ChevronDown, Users, Target, Banknote
} from 'lucide-react'
import { PieChart as RePieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// ... (types restent les mêmes)

type ProjetStats = {
  id: number
  nom_projet: string
  montant_sollicite: number | null
  etape: string
  promoteur_province: string | null
  promoteur_ville: string | null
  secteur_activite: string | null
  cout_total: number | null
  apport_personnel: number | null
  nombre_emplois: number | null
  created_at: string
  promoteur_sexe: string | null
  nom_entite: string | null
}

type ProvinceStat = {
  province: string
  total: number
  finances: number
  rejetes: number
  enAttente: number
  montantTotal: number
  tauxFinancement: number
}

type SecteurStat = {
  secteur: string
  total: number
  finances: number
  rejetes: number
  enAttente: number
  montantTotal: number
  tauxFinancement: number
}

// Couleurs pour le graphique Donut
const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#E11D48', '#7C3AED', '#059669', '#DC2626',
  '#2563EB', '#9333EA', '#0D9488', '#EA580C', '#4F46E5'
]

const COLORS_PROVINCE = [
  '#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED',
  '#DB2777', '#0891B2', '#65A30D', '#EA580C', '#4F46E5'
]

export default function StatistiquesPage() {
  const [projets, setProjets] = useState<ProjetStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showProvinceDetails, setShowProvinceDetails] = useState(false)
  const [showSecteurDetails, setShowSecteurDetails] = useState(false)

  useEffect(() => {
    chargerProjets()
  }, [])

  const chargerProjets = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projets_fpi')
        .select('*')
        .in('etape', ['comité_crédit', 'financement_approuve', 'financement_rejete'])
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjets(data || [])
    } catch (error) {
      console.error('Erreur chargement projets:', error)
    } finally {
      setLoading(false)
    }
  }

  // Statistiques globales
  const totalProjets = projets.length
  const projetsFinances = projets.filter(p => p.etape === 'financement_approuve').length
  const projetsRejetes = projets.filter(p => p.etape === 'financement_rejete').length
  const projetsEnAttente = projets.filter(p => p.etape === 'comité_crédit').length

  const montantTotalSollicite = projets.reduce((sum, p) => sum + (Number(p.montant_sollicite) || 0), 0)
  const montantTotalFinances = projets.filter(p => p.etape === 'financement_approuve').reduce((sum, p) => sum + (Number(p.montant_sollicite) || 0), 0)
  const montantTotalRejetes = projets.filter(p => p.etape === 'financement_rejete').reduce((sum, p) => sum + (Number(p.montant_sollicite) || 0), 0)
  const montantTotalAttente = projets.filter(p => p.etape === 'comité_crédit').reduce((sum, p) => sum + (Number(p.montant_sollicite) || 0), 0)

  const tauxFinancement = totalProjets > 0 ? ((projetsFinances / totalProjets) * 100).toFixed(1) : '0'
  const tauxRejet = totalProjets > 0 ? ((projetsRejetes / totalProjets) * 100).toFixed(1) : '0'

  const totalEmplois = projets.reduce((sum, p) => sum + (Number(p.nombre_emplois) || 0), 0)
  const coutTotalProjets = projets.reduce((sum, p) => sum + (Number(p.cout_total) || 0), 0)
  const apportTotal = projets.reduce((sum, p) => sum + (Number(p.apport_personnel) || 0), 0)

  // Statistiques par province
  const provinces = Array.from(new Set(projets.map(p => p.promoteur_province).filter(Boolean))) as string[]
  
  const statsParProvince: ProvinceStat[] = provinces.map(province => {
    const projetsProvince = projets.filter(p => p.promoteur_province === province)
    const finances = projetsProvince.filter(p => p.etape === 'financement_approuve').length
    const rejetes = projetsProvince.filter(p => p.etape === 'financement_rejete').length
    const enAttente = projetsProvince.filter(p => p.etape === 'comité_crédit').length
    const total = projetsProvince.length
    
    return {
      province,
      total,
      finances,
      rejetes,
      enAttente,
      montantTotal: projetsProvince.reduce((sum, p) => sum + (Number(p.montant_sollicite) || 0), 0),
      tauxFinancement: total > 0 ? Number(((finances / total) * 100).toFixed(1)) : 0
    }
  }).sort((a, b) => b.total - a.total)

  // Statistiques par secteur
  const secteurs = Array.from(new Set(projets.map(p => p.secteur_activite).filter(Boolean))) as string[]
  
  const statsParSecteur: SecteurStat[] = secteurs.map(secteur => {
    const projetsSecteur = projets.filter(p => p.secteur_activite === secteur)
    const finances = projetsSecteur.filter(p => p.etape === 'financement_approuve').length
    const rejetes = projetsSecteur.filter(p => p.etape === 'financement_rejete').length
    const enAttente = projetsSecteur.filter(p => p.etape === 'comité_crédit').length
    const total = projetsSecteur.length
    
    return {
      secteur,
      total,
      finances,
      rejetes,
      enAttente,
      montantTotal: projetsSecteur.reduce((sum, p) => sum + (Number(p.montant_sollicite) || 0), 0),
      tauxFinancement: total > 0 ? Number(((finances / total) * 100).toFixed(1)) : 0
    }
  }).sort((a, b) => b.total - a.total)

  // Données pour le Donut - Statut
  const donutStatutData = [
    { name: 'Financés', value: projetsFinances, color: '#10B981' },
    { name: 'Rejetés', value: projetsRejetes, color: '#EF4444' },
    { name: 'En attente', value: projetsEnAttente, color: '#8B5CF6' }
  ].filter(item => item.value > 0)

  // Données pour le Donut - Secteurs
  const donutSecteurData = statsParSecteur.map((stat, index) => ({
    name: stat.secteur,
    value: stat.total,
    color: COLORS[index % COLORS.length]
  }))

  // Données pour le Donut - Provinces
  const donutProvinceData = statsParProvince.slice(0, 10).map((stat, index) => ({
    name: stat.province,
    value: stat.total,
    color: COLORS_PROVINCE[index % COLORS_PROVINCE.length]
  }))

  // Données pour le Donut - Genre
  const projetsHommes = projets.filter(p => p.promoteur_sexe === 'M').length
  const projetsFemmes = projets.filter(p => p.promoteur_sexe === 'F').length
  const projetsGenreNonSpecifie = totalProjets - projetsHommes - projetsFemmes

  const donutGenreData = [
    { name: 'Hommes', value: projetsHommes, color: '#3B82F6' },
    { name: 'Femmes', value: projetsFemmes, color: '#EC4899' },
    ...(projetsGenreNonSpecifie > 0 ? [{ name: 'Non spécifié', value: projetsGenreNonSpecifie, color: '#9CA3AF' }] : [])
  ].filter(item => item.value > 0)

  const tauxFemmes = totalProjets > 0 ? ((projetsFemmes / totalProjets) * 100).toFixed(1) : '0'

  const formatMontant = (m: number): string => 
    new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'USD', 
      notation: 'compact',
      maximumFractionDigits: 1 
    }).format(m)

  // Rendu du label personnalisé
  const renderCustomLabel = useCallback(({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180
    const radius = outerRadius + 25
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (percent < 0.05) return null

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
    )
  }, [])

  // Tooltip personnalisé
  const CustomTooltip = useCallback(({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="text-sm font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{data.value}</span> projets
          </p>
          <p className="text-xs text-gray-500">
            {((data.value / totalProjets) * 100).toFixed(1)}% du total
          </p>
        </div>
      )
    }
    return null
  }, [totalProjets])

  // Composant Donut réutilisable pour éviter la duplication
  const DonutChart = ({ data, title, icon, colors }: { 
    data: { name: string; value: number; color: string }[]; 
    title: string; 
    icon: React.ReactNode;
    colors?: string[];
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
              <Cell 
                key={`cell-${index}`} 
                fill={colors ? colors[index % colors.length] : entry.color}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={data.length > 5 ? 72 : 36}
            formatter={(value: string) => <span className="text-sm text-gray-600">{value}</span>}
          />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  )

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Statistiques des Projets</h1>
            <p className="text-sm text-gray-500">Vue d'ensemble des financements du comité de crédit</p>
          </div>
        </div>

        {/* KPIs Principaux */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{totalProjets}</p>
            <p className="text-xs text-gray-500">Total projets</p>
          </div>

          <div className="bg-white rounded-xl p-5 border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600">{projetsFinances}</p>
            <p className="text-xs text-gray-500">Projets financés</p>
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

          <div className="bg-white rounded-xl p-5 border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-600">{projetsEnAttente}</p>
            <p className="text-xs text-gray-500">En attente</p>
          </div>
        </div>

        {/* Taux et montants */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Taux de financement</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">{tauxFinancement}%</p>
            <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${tauxFinancement}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Taux de rejet</span>
              <TrendingDown className="h-4 w-4 text-red-500" />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DonutChart 
            data={donutStatutData}
            title="Répartition par Statut"
            icon={<PieChart className="h-5 w-5 text-primary" />}
          />
          
          <DonutChart 
            data={donutSecteurData}
            title="Projets par Secteur d'activité"
            icon={<Briefcase className="h-5 w-5 text-primary" />}
            colors={COLORS}
          />
          
          <DonutChart 
            data={donutProvinceData}
            title="Projets par Province (Top 10)"
            icon={<MapPin className="h-5 w-5 text-primary" />}
            colors={COLORS_PROVINCE}
          />
          
          <DonutChart 
            data={donutGenreData}
            title="Répartition par Genre"
            icon={<Users className="h-5 w-5 text-primary" />}
          />
        </div>

        {/* Détails financiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Montant financé</p>
            <p className="text-2xl font-bold text-green-700">{formatMontant(montantTotalFinances)}</p>
            <p className="text-xs text-gray-500 mt-1">{projetsFinances} projets</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-5 border border-red-200">
            <p className="text-sm text-gray-600 mb-1">Montant rejeté</p>
            <p className="text-2xl font-bold text-red-700">{formatMontant(montantTotalRejetes)}</p>
            <p className="text-xs text-gray-500 mt-1">{projetsRejetes} projets</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-200">
            <p className="text-sm text-gray-600 mb-1">En attente de décision</p>
            <p className="text-2xl font-bold text-purple-700">{formatMontant(montantTotalAttente)}</p>
            <p className="text-xs text-gray-500 mt-1">{projetsEnAttente} projets</p>
          </div>
        </div>

        {/* Tableau détaillé des secteurs */}
        <div className="bg-white rounded-xl border mb-8">
          <div className="p-5 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Détails par Secteur d'activité
              </h2>
              <button
                onClick={() => setShowSecteurDetails(!showSecteurDetails)}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {showSecteurDetails ? 'Masquer' : 'Afficher tout'}
                <ChevronDown className={`h-4 w-4 transition-transform ${showSecteurDetails ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 font-medium text-gray-600">Secteur</th>
                    <th className="text-center py-3 font-medium text-gray-600">Total</th>
                    <th className="text-center py-3 font-medium text-gray-600">Financés</th>
                    <th className="text-center py-3 font-medium text-gray-600">Rejetés</th>
                    <th className="text-center py-3 font-medium text-gray-600">En attente</th>
                    <th className="text-right py-3 font-medium text-gray-600">Montant</th>
                    <th className="text-right py-3 font-medium text-gray-600">Taux fin.</th>
                  </tr>
                </thead>
                <tbody>
                  {(showSecteurDetails ? statsParSecteur : statsParSecteur.slice(0, 5)).map((stat) => (
                    <tr key={stat.secteur} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 font-medium text-gray-800">{stat.secteur}</td>
                      <td className="text-center py-3">{stat.total}</td>
                      <td className="text-center py-3">
                        <span className="text-green-600 font-medium">{stat.finances}</span>
                      </td>
                      <td className="text-center py-3">
                        <span className="text-red-600 font-medium">{stat.rejetes}</span>
                      </td>
                      <td className="text-center py-3">
                        <span className="text-purple-600 font-medium">{stat.enAttente}</span>
                      </td>
                      <td className="text-right py-3 text-gray-700">{formatMontant(stat.montantTotal)}</td>
                      <td className="text-right py-3">
                        <span className={`font-medium ${stat.tauxFinancement >= 50 ? 'text-green-600' : stat.tauxFinancement >= 30 ? 'text-orange-600' : 'text-red-600'}`}>
                          {stat.tauxFinancement}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Résumé financier */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Résumé Financier Global
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Coût total des projets</p>
              <p className="text-xl font-bold text-gray-800">{formatMontant(coutTotalProjets)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Apport personnel total</p>
              <p className="text-xl font-bold text-gray-800">{formatMontant(apportTotal)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Taux d'apport moyen</p>
              <p className="text-xl font-bold text-gray-800">
                {coutTotalProjets > 0 ? ((apportTotal / coutTotalProjets) * 100).toFixed(1) : '0'}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Entités légales</p>
              <p className="text-xl font-bold text-gray-800">
                {new Set(projets.filter(p => p.nom_entite).map(p => p.nom_entite)).size}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}