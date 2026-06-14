'use client'

import { Building2, MapPin, DollarSign, Users, Clock, Target } from 'lucide-react'
import { ProjetInfo, SECTEURS_ACTIVITE } from '@/types/fpi'

type Props = {
  data: ProjetInfo
  onChange: (data: ProjetInfo) => void
  errors?: Partial<Record<keyof ProjetInfo, string>>
}

export default function Step2Projet({ data, onChange, errors = {} }: Props) {
  const updateField = (field: keyof ProjetInfo, value: any) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-green-900 mb-1">
          Informations du Projet
        </h3>
        <p className="text-xs text-green-700">
          Décrivez votre projet en détail pour une meilleure évaluation
        </p>
      </div>

      {/* Nom du projet */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Nom du projet <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={data.nom_projet}
            onChange={(e) => updateField('nom_projet', e.target.value)}
            placeholder="Ex: Construction d'une école primaire"
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              errors.nom_projet ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.nom_projet && (
          <p className="mt-1 text-xs text-red-600">{errors.nom_projet}</p>
        )}
      </div>

      {/* Secteur d'activité */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Secteur d'activité <span className="text-red-500">*</span>
        </label>
        <select
          value={data.secteur_activite}
          onChange={(e) => updateField('secteur_activite', e.target.value)}
          className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
            errors.secteur_activite ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        >
          <option value="">Sélectionner un secteur...</option>
          {SECTEURS_ACTIVITE.map((secteur) => (
            <option key={secteur} value={secteur}>
              {secteur}
            </option>
          ))}
        </select>
        {errors.secteur_activite && (
          <p className="mt-1 text-xs text-red-600">{errors.secteur_activite}</p>
        )}
      </div>

      {/* Description du projet */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Description du projet <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.description_projet}
          onChange={(e) => updateField('description_projet', e.target.value)}
          placeholder="Décrivez votre projet en détail (objectifs, activités, bénéficiaires, etc.)"
          rows={4}
          className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none ${
            errors.description_projet ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        />
        {errors.description_projet && (
          <p className="mt-1 text-xs text-red-600">{errors.description_projet}</p>
        )}
      </div>

      {/* Localisation du projet */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Localisation du projet <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={data.localisation_projet}
            onChange={(e) => updateField('localisation_projet', e.target.value)}
            placeholder="Ex: Kinshasa, Commune de Limete"
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              errors.localisation_projet ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.localisation_projet && (
          <p className="mt-1 text-xs text-red-600">{errors.localisation_projet}</p>
        )}
      </div>

      {/* Coût total et Montant sollicité */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Coût total du projet (USD) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="number"
              value={data.cout_total || ''}
              onChange={(e) => updateField('cout_total', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                errors.cout_total ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.cout_total && (
            <p className="mt-1 text-xs text-red-600">{errors.cout_total}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Montant sollicité (USD) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="number"
              value={data.montant_sollicite || ''}
              onChange={(e) => updateField('montant_sollicite', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                errors.montant_sollicite ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.montant_sollicite && (
            <p className="mt-1 text-xs text-red-600">{errors.montant_sollicite}</p>
          )}
        </div>
      </div>

      {/* Nombre d'emplois et Durée */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nombre d'emplois prévus <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="number"
              value={data.nombre_emplois || ''}
              onChange={(e) => updateField('nombre_emplois', parseInt(e.target.value) || 0)}
              placeholder="0"
              min="0"
              className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                errors.nombre_emplois ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.nombre_emplois && (
            <p className="mt-1 text-xs text-red-600">{errors.nombre_emplois}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Durée de réalisation <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={data.duree_realisation}
              onChange={(e) => updateField('duree_realisation', e.target.value)}
              placeholder="Ex: 12 mois"
              className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                errors.duree_realisation ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.duree_realisation && (
            <p className="mt-1 text-xs text-red-600">{errors.duree_realisation}</p>
          )}
        </div>
      </div>

      {/* Objectifs du projet */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Objectifs du projet <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Target className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <textarea
            value={data.objectifs_projet}
            onChange={(e) => updateField('objectifs_projet', e.target.value)}
            placeholder="Décrivez les objectifs spécifiques de votre projet..."
            rows={3}
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none ${
              errors.objectifs_projet ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.objectifs_projet && (
          <p className="mt-1 text-xs text-red-600">{errors.objectifs_projet}</p>
        )}
      </div>
    </div>
  )
}