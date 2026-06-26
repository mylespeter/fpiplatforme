

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  FileText, CheckCircle, Clock, AlertCircle,
  Banknote, TrendingUp, TrendingDown, FileCheck,
  BarChart3
} from 'lucide-react'

export default function DashboardComite() {
  const [stats, setStats] = useState({
    totalProjets: 0,
    totalRapports: 0,
    rapportsAAnalyser: 0,
    rapportsAnalyses: 0,
    totalMontantSollicite: 0,
    totalMontantApprouve: 0,
    totalMontantRejete: 0,
    tauxApprobation: 0,
    projetsEnAttente: 0,
    projetsApprouves: 0,
    projetsRejetes: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    chargerStats()
  }, [])

  const chargerStats = async () => {
    setLoading(true)
    try {
      // Projets
      const { data: projets } = await supabase
        .from('projets_fpi')
        .select('*')
        .in('etape', ['comité_crédit', 'financement_approuve', 'financement_rejete'])

      // Rapports
      const { data: rapports } = await supabase
        .from('rapport_analyse')
        .select('*')

      // Décisions
      const { data: decisions } = await supabase
        .from('decisions_comite')
        .select('*')

      const totalProjets = projets?.length || 0
      const projetsApprouves = projets?.filter(p => p.etape === 'financement_approuve').length || 0
      const projetsRejetes = projets?.filter(p => p.etape === 'financement_rejete').length || 0
      const projetsEnAttente = projets?.filter(p => p.etape === 'comité_crédit').length || 0

      setStats({
        totalProjets,
        totalRapports: rapports?.length || 0,
        rapportsAAnalyser: rapports?.filter(r => r.statut === 'en_attente' || r.statut === 'en_cours').length || 0,
        rapportsAnalyses: rapports?.filter(r => r.statut === 'analyse' || r.statut === 'valide_comite').length || 0,
        totalMontantSollicite: projets?.reduce((sum, p) => sum + (Number(p.montant_sollicite) || 0), 0) || 0,
        totalMontantApprouve: decisions?.filter(d => d.decision === 'favorable').reduce((sum, d) => sum + (Number(d.montant_approuve) || 0), 0) || 0,
        totalMontantRejete: projets?.filter(p => p.etape === 'financement_rejete').reduce((sum, p) => sum + (Number(p.montant_sollicite) || 0), 0) || 0,
        tauxApprobation: totalProjets ? Number(((projetsApprouves / totalProjets) * 100).toFixed(1)) : 0,
        projetsEnAttente,
        projetsApprouves,
        projetsRejetes
      })
    } catch (error) {
      console.error('Erreur chargement stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatMontant = (m: number): string => 
    new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'USD', 
      notation: 'compact',
      maximumFractionDigits: 1 
    }).format(m)

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border">
            <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3"></div>
            <div className="h-6 w-20 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-32 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-gray-800">Tableau de bord - Comité de Crédit</h2>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Projets */}
        <div className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.totalProjets}</p>
          <p className="text-xs text-gray-500">Total projets</p>
        </div>

        {/* Total Rapports */}
        <div className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <FileCheck className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.totalRapports}</p>
          <p className="text-xs text-gray-500">Total rapports</p>
        </div>

        {/* Rapports à analyser */}
        <div className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.rapportsAAnalyser}</p>
          <p className="text-xs text-gray-500">À analyser</p>
        </div>

        {/* Rapports analysés */}
        <div className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.rapportsAnalyses}</p>
          <p className="text-xs text-gray-500">Analysés</p>
        </div>

        {/* Montant sollicité */}
        <div className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Banknote className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-purple-600">{formatMontant(stats.totalMontantSollicite)}</p>
          <p className="text-xs text-gray-500">Total sollicité</p>
        </div>

        {/* Montant approuvé */}
        <div className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-emerald-600">{formatMontant(stats.totalMontantApprouve)}</p>
          <p className="text-xs text-gray-500">Total approuvé</p>
        </div>

        {/* Montant rejeté */}
        <div className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-red-600">{formatMontant(stats.totalMontantRejete)}</p>
          <p className="text-xs text-gray-500">Total rejeté</p>
        </div>

        {/* Taux d'approbation */}
        <div className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-teal-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-teal-600">{stats.tauxApprobation}%</p>
          <p className="text-xs text-gray-500">Taux d'approbation</p>
          <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
            <div 
              className="bg-teal-500 h-1.5 rounded-full" 
              style={{ width: `${stats.tauxApprobation}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Résumé rapide */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-purple-50 border-2 border-purple-400 rounded-lg p-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-purple-600" />
          <div>
            <p className="text-lg font-bold text-purple-700">{stats.projetsEnAttente}</p>
            <p className="text-xs text-purple-600">En attente</p>
          </div>
        </div>
        <div className="bg-green-50 border-2 border-green-400 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <div>
            <p className="text-lg font-bold text-green-700">{stats.projetsApprouves}</p>
            <p className="text-xs text-green-600">Approuvés</p>
          </div>
        </div>
        <div className="bg-red-50 border-2 border-red-400 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <div>
            <p className="text-lg font-bold text-red-700">{stats.projetsRejetes}</p>
            <p className="text-xs text-red-600">Rejetés</p>
          </div>
        </div>
      </div>
    </div>
  )
}