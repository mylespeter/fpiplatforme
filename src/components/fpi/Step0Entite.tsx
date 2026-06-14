// components/fpi/Step0Entite.tsx
'use client'

import { Building2, Hash, FileText, MapPin } from 'lucide-react'
import { EntiteInfo } from '@/types/fpi'

type Props = {
  data: EntiteInfo
  onChange: (data: EntiteInfo) => void
  errors: Record<string, string>
}

export default function Step0Entite({ data, onChange, errors }: Props) {
  const updateField = (field: keyof EntiteInfo, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-3">
          <Building2 className="h-8 w-8 text-indigo-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Informations de l'entité</h3>
        <p className="text-sm text-gray-500 mt-1">
          Renseignez les informations légales de votre entreprise ou organisation
        </p>
      </div>

      {/* Nom de l'entité */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <span className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-400" />
            Nom de l'entité <span className="text-red-500">*</span>
          </span>
        </label>
        <input
          type="text"
          value={data.nom_entite || ''}
          onChange={(e) => updateField('nom_entite', e.target.value)}
          placeholder="Ex: Ets KIVU Services SARL"
          className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
            errors.nom_entite ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        />
        {errors.nom_entite && (
          <p className="text-xs text-red-600 mt-1">{errors.nom_entite}</p>
        )}
      </div>

      {/* Numéro National */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <span className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-gray-400" />
            Numéro National <span className="text-red-500">*</span>
          </span>
        </label>
        <input
          type="text"
          value={data.num_national || ''}
          onChange={(e) => updateField('num_national', e.target.value)}
          placeholder="Ex: NN-12345678"
          className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
            errors.num_national ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        />
        {errors.num_national && (
          <p className="text-xs text-red-600 mt-1">{errors.num_national}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Numéro d'identification nationale de votre entreprise
        </p>
      </div>

      {/* Numéro RCCM */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" />
            Numéro RCCM <span className="text-red-500">*</span>
          </span>
        </label>
        <input
          type="text"
          value={data.numero_rccm || ''}
          onChange={(e) => updateField('numero_rccm', e.target.value)}
          placeholder="Ex: RCCM/CD-KIV/12345"
          className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
            errors.numero_rccm ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        />
        {errors.numero_rccm && (
          <p className="text-xs text-red-600 mt-1">{errors.numero_rccm}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Numéro du Registre du Commerce et du Crédit Mobilier
        </p>
      </div>

      {/* Siège social */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            Siège social <span className="text-red-500">*</span>
          </span>
        </label>
        <input
          type="text"
          value={data.siege_social || ''}
          onChange={(e) => updateField('siege_social', e.target.value)}
          placeholder="Ex: 123 Avenue des Entreprises, Goma"
          className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
            errors.siege_social ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        />
        {errors.siege_social && (
          <p className="text-xs text-red-600 mt-1">{errors.siege_social}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Adresse complète du siège social de l'entreprise
        </p>
      </div>
    </div>
  )
}