'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  BarChart3, TrendingUp, TrendingDown, PieChart,
  MapPin, Briefcase, Building2, DollarSign,
  FileText, CheckCircle, XCircle, Clock,
  Loader2, ChevronDown, Users, Target, Banknote
} from 'lucide-react'

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

export default function StatistiquesPage() {
  const [projets, setProjets] = useState<ProjetStats[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProvince, setSelectedProvince] = useState<string>('toutes')
  const [selectedSecteur, setSelectedSecteur] = useState<string>('tous')
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

  // Statistiques par genre
  const projetsHommes = projets.filter(p => p.promoteur_sexe === 'M').length
  const projetsFemmes = projets.filter(p => p.promoteur_sexe === 'F').length
  const tauxFemmes = totalProjets > 0 ? ((projetsFemmes / totalProjets) * 100).toFixed(1) : '0'

  // Top provinces
  const topProvinces = statsParProvince.slice(0, 5)
  const topSecteurs = statsParSecteur.slice(0, 5)

  const formatMontant = (m: number): string => 
    new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'USD', 
      notation: 'compact',
      maximumFractionDigits: 1 
    }).format(m)

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

        {/* Statistiques par province */}
        <div className="bg-white rounded-xl border mb-8">
          <div className="p-5 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Projets par Province
              </h2>
              <button
                onClick={() => setShowProvinceDetails(!showProvinceDetails)}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {showProvinceDetails ? 'Moins de détails' : 'Plus de détails'}
                <ChevronDown className={`h-4 w-4 transition-transform ${showProvinceDetails ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {topProvinces.map((stat) => (
                <div key={stat.province} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{stat.province}</span>
                    <span className="text-sm text-gray-500">{stat.total} projets</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-4 relative overflow-hidden">
                    <div className="absolute inset-0 flex">
                      <div 
                        className="bg-green-500 h-full transition-all duration-500"
                        style={{ width: `${(stat.finances / Math.max(stat.total, 1)) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-red-500 h-full transition-all duration-500"
                        style={{ width: `${(stat.rejetes / Math.max(stat.total, 1)) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-purple-500 h-full transition-all duration-500"
                        style={{ width: `${(stat.enAttente / Math.max(stat.total, 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {stat.finances} financés
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      {stat.rejetes} rejetés
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      {stat.enAttente} en attente
                    </span>
                    <span className="ml-auto font-medium">
                      Taux: {stat.tauxFinancement}%
                    </span>
                  </div>
                  {showProvinceDetails && (
                    <p className="text-xs text-gray-500 mt-1">
                      Montant total: {formatMontant(stat.montantTotal)}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Tableau détaillé des provinces */}
            {showProvinceDetails && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-gray-600">Province</th>
                      <th className="text-center py-2 font-medium text-gray-600">Total</th>
                      <th className="text-center py-2 font-medium text-gray-600">Financés</th>
                      <th className="text-center py-2 font-medium text-gray-600">Rejetés</th>
                      <th className="text-center py-2 font-medium text-gray-600">En attente</th>
                      <th className="text-right py-2 font-medium text-gray-600">Montant</th>
                      <th className="text-right py-2 font-medium text-gray-600">Taux fin.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsParProvince.map((stat) => (
                      <tr key={stat.province} className="border-b hover:bg-gray-50">
                        <td className="py-2 font-medium">{stat.province}</td>
                        <td className="text-center py-2">{stat.total}</td>
                        <td className="text-center py-2 text-green-600">{stat.finances}</td>
                        <td className="text-center py-2 text-red-600">{stat.rejetes}</td>
                        <td className="text-center py-2 text-purple-600">{stat.enAttente}</td>
                        <td className="text-right py-2">{formatMontant(stat.montantTotal)}</td>
                        <td className="text-right py-2">{stat.tauxFinancement}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Statistiques par secteur */}
        <div className="bg-white rounded-xl border mb-8">
          <div className="p-5 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Projets par Secteur d'activité
              </h2>
              <button
                onClick={() => setShowSecteurDetails(!showSecteurDetails)}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {showSecteurDetails ? 'Moins de détails' : 'Plus de détails'}
                <ChevronDown className={`h-4 w-4 transition-transform ${showSecteurDetails ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {topSecteurs.map((stat) => (
                <div key={stat.secteur} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{stat.secteur}</span>
                    <span className="text-sm text-gray-500">{stat.total} projets</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-4 relative overflow-hidden">
                    <div className="absolute inset-0 flex">
                      <div 
                        className="bg-green-500 h-full transition-all duration-500"
                        style={{ width: `${(stat.finances / Math.max(stat.total, 1)) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-red-500 h-full transition-all duration-500"
                        style={{ width: `${(stat.rejetes / Math.max(stat.total, 1)) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-purple-500 h-full transition-all duration-500"
                        style={{ width: `${(stat.enAttente / Math.max(stat.total, 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {stat.finances} financés
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      {stat.rejetes} rejetés
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      {stat.enAttente} en attente
                    </span>
                    <span className="ml-auto font-medium">
                      Taux: {stat.tauxFinancement}%
                    </span>
                  </div>
                  {showSecteurDetails && (
                    <p className="text-xs text-gray-500 mt-1">
                      Montant total: {formatMontant(stat.montantTotal)}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Tableau détaillé des secteurs */}
            {showSecteurDetails && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-gray-600">Secteur</th>
                      <th className="text-center py-2 font-medium text-gray-600">Total</th>
                      <th className="text-center py-2 font-medium text-gray-600">Financés</th>
                      <th className="text-center py-2 font-medium text-gray-600">Rejetés</th>
                      <th className="text-center py-2 font-medium text-gray-600">En attente</th>
                      <th className="text-right py-2 font-medium text-gray-600">Montant</th>
                      <th className="text-right py-2 font-medium text-gray-600">Taux fin.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsParSecteur.map((stat) => (
                      <tr key={stat.secteur} className="border-b hover:bg-gray-50">
                        <td className="py-2 font-medium">{stat.secteur}</td>
                        <td className="text-center py-2">{stat.total}</td>
                        <td className="text-center py-2 text-green-600">{stat.finances}</td>
                        <td className="text-center py-2 text-red-600">{stat.rejetes}</td>
                        <td className="text-center py-2 text-purple-600">{stat.enAttente}</td>
                        <td className="text-right py-2">{formatMontant(stat.montantTotal)}</td>
                        <td className="text-right py-2">{stat.tauxFinancement}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Statistiques genre et autres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Répartition par Genre
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Hommes</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${totalProjets > 0 ? (projetsHommes / totalProjets) * 100 : 0}%` }}></div>
                  </div>
                  <span className="text-sm font-medium">{projetsHommes}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Femmes</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-100 rounded-full h-2">
                    <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${totalProjets > 0 ? (projetsFemmes / totalProjets) * 100 : 0}%` }}></div>
                  </div>
                  <span className="text-sm font-medium">{projetsFemmes}</span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">
                  Taux de participation féminine: <span className="font-bold text-pink-600">{tauxFemmes}%</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Résumé Financier
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Coût total des projets</span>
                <span className="font-medium">{formatMontant(coutTotalProjets)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Apport personnel total</span>
                <span className="font-medium">{formatMontant(apportTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Montant sollicité total</span>
                <span className="font-medium">{formatMontant(montantTotalSollicite)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taux d'apport moyen</span>
                <span className="font-medium">
                  {coutTotalProjets > 0 ? ((apportTotal / coutTotalProjets) * 100).toFixed(1) : '0'}%
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-gray-600">Nombre d'entités légales</span>
                <span className="font-medium">
                  {new Set(projets.filter(p => p.nom_entite).map(p => p.nom_entite)).size}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}