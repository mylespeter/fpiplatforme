'use client'

import { DollarSign, PiggyBank, TrendingUp, Clock, Shield, Building2, CreditCard } from 'lucide-react'
import { InfoFinanciere, BANQUES_PARTENAIRES } from '@/types/fpi'

type Props = {
  data: InfoFinanciere
  onChange: (data: InfoFinanciere) => void
  errors?: Partial<Record<keyof InfoFinanciere, string>>
  montantSollicite: number
}

export default function Step3Finance({ data, onChange, errors = {}, montantSollicite }: Props) {
  const updateField = (field: keyof InfoFinanciere, value: any) => {
    onChange({ ...data, [field]: value })
  }

  const apportPercentage = montantSollicite > 0 
    ? ((data.apport_personnel / montantSollicite) * 100).toFixed(1) 
    : '0'

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-purple-900 mb-1">
          Informations Financières
        </h3>
        <p className="text-xs text-purple-700">
          Fournissez des informations précises sur le financement de votre projet
        </p>
      </div>

      {/* Apport personnel */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Apport personnel (USD) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <PiggyBank className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="number"
            value={data.apport_personnel || ''}
            onChange={(e) => updateField('apport_personnel', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              errors.apport_personnel ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
        </div>
        {montantSollicite > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            Votre apport représente {apportPercentage}% du montant sollicité
            {parseFloat(apportPercentage) < 10 && (
              <span className="text-yellow-600 ml-1">(minimum 10% recommandé)</span>
            )}
          </p>
        )}
        {errors.apport_personnel && (
          <p className="mt-1 text-xs text-red-600">{errors.apport_personnel}</p>
        )}
      </div>

      {/* Source de financement complémentaire */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Source de financement complémentaire
        </label>
        <input
          type="text"
          value={data.source_financement}
          onChange={(e) => updateField('source_financement', e.target.value)}
          placeholder="Ex: Banque, Partenaire, Autres sources..."
          className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
            errors.source_financement ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        />
        {errors.source_financement && (
          <p className="mt-1 text-xs text-red-600">{errors.source_financement}</p>
        )}
      </div>

      {/* Chiffre d'affaires prévisionnel */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Chiffre d'affaires prévisionnel (USD/an) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="number"
            value={data.chiffre_affaires_previsionnel || ''}
            onChange={(e) => updateField('chiffre_affaires_previsionnel', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              errors.chiffre_affaires_previsionnel ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.chiffre_affaires_previsionnel && (
          <p className="mt-1 text-xs text-red-600">{errors.chiffre_affaires_previsionnel}</p>
        )}
      </div>

      {/* Bénéfice prévisionnel */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Bénéfice prévisionnel (USD/an) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="number"
            value={data.benefice_previsionnel || ''}
            onChange={(e) => updateField('benefice_previsionnel', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              errors.benefice_previsionnel ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.benefice_previsionnel && (
          <p className="mt-1 text-xs text-red-600">{errors.benefice_previsionnel}</p>
        )}
      </div>

      {/* Durée de remboursement souhaitée */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Durée souhaitée du remboursement <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={data.duree_remboursement}
            onChange={(e) => updateField('duree_remboursement', e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              errors.duree_remboursement ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Sélectionner une durée...</option>
            <option value="6 mois">6 mois</option>
            <option value="12 mois">12 mois</option>
            <option value="18 mois">18 mois</option>
            <option value="24 mois">24 mois</option>
            <option value="36 mois">36 mois</option>
            <option value="48 mois">48 mois</option>
            <option value="60 mois">60 mois</option>
            <option value="Autre">Autre (à préciser)</option>
          </select>
        </div>
        {errors.duree_remboursement && (
          <p className="mt-1 text-xs text-red-600">{errors.duree_remboursement}</p>
        )}
      </div>

      {/* Garanties proposées */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Garanties proposées <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <textarea
            value={data.garanties_proposees}
            onChange={(e) => updateField('garanties_proposees', e.target.value)}
            placeholder="Décrivez les garanties que vous proposez (biens, cautions, etc.)"
            rows={3}
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none ${
              errors.garanties_proposees ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.garanties_proposees && (
          <p className="mt-1 text-xs text-red-600">{errors.garanties_proposees}</p>
        )}
      </div>

      {/* Banque partenaire */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Banque partenaire <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={data.banque_partenaire}
            onChange={(e) => updateField('banque_partenaire', e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              errors.banque_partenaire ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Sélectionner une banque...</option>
            {BANQUES_PARTENAIRES.map((banque) => (
              <option key={banque} value={banque}>
                {banque}
              </option>
            ))}
          </select>
        </div>
        {errors.banque_partenaire && (
          <p className="mt-1 text-xs text-red-600">{errors.banque_partenaire}</p>
        )}
      </div>

      {/* Numéro de compte bancaire */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Numéro de compte bancaire <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={data.numero_compte_bancaire}
            onChange={(e) => updateField('numero_compte_bancaire', e.target.value)}
            placeholder="Ex: 1234567890"
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              errors.numero_compte_bancaire ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.numero_compte_bancaire && (
          <p className="mt-1 text-xs text-red-600">{errors.numero_compte_bancaire}</p>
        )}
      </div>
    </div>
  )
}