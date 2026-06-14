// 'use client'

// import { User, Phone, Mail, MapPin, Briefcase } from 'lucide-react'
// import { PromoteurInfo, PROVINCES_RDC } from '@/types/fpi'

// type Props = {
//   data: PromoteurInfo
//   onChange: (data: PromoteurInfo) => void
//   errors?: Partial<Record<keyof PromoteurInfo, string>>
// }

// export default function Step1Promoteur({ data, onChange, errors = {} }: Props) {
//   const updateField = (field: keyof PromoteurInfo, value: any) => {
//     onChange({ ...data, [field]: value })
//   }

//   return (
//     <div className="space-y-6 overflow-auto">
//       <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
//         <h3 className="text-sm font-semibold text-blue-900 mb-1">
//           Informations du Promoteur
//         </h3>
//         <p className="text-xs text-blue-700">
//           Veuillez remplir tous les champs obligatoires marqués d'un astérisque (*)
//         </p>
//       </div>

//       {/* Nom complet */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1.5">
//           Nom complet <span className="text-red-500">*</span>
//         </label>
//         <div className="relative">
//           <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//           <input
//             type="text"
//             value={data.nom_complet}
//             onChange={(e) => updateField('nom_complet', e.target.value)}
//             placeholder="Ex: Jean Dupont"
//             className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
//               errors.nom_complet ? 'border-red-300 bg-red-50' : 'border-gray-300'
//             }`}
//           />
//         </div>
//         {errors.nom_complet && (
//           <p className="mt-1 text-xs text-red-600">{errors.nom_complet}</p>
//         )}
//       </div>

//       {/* Sexe */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1.5">
//           Sexe <span className="text-red-500">*</span>
//         </label>
//         <div className="flex gap-3">
//           <button
//             type="button"
//             onClick={() => updateField('sexe', 'M')}
//             className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${
//               data.sexe === 'M'
//                 ? 'border-blue-500 bg-blue-50 text-blue-700'
//                 : 'border-gray-300 text-gray-600 hover:border-gray-400'
//             }`}
//           >
//             Masculin
//           </button>
//           <button
//             type="button"
//             onClick={() => updateField('sexe', 'F')}
//             className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${
//               data.sexe === 'F'
//                 ? 'border-pink-500 bg-pink-50 text-pink-700'
//                 : 'border-gray-300 text-gray-600 hover:border-gray-400'
//             }`}
//           >
//             Féminin
//           </button>
//         </div>
//         {errors.sexe && (
//           <p className="mt-1 text-xs text-red-600">{errors.sexe}</p>
//         )}
//       </div>

//       {/* Numéro de téléphone */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1.5">
//           Numéro de téléphone <span className="text-red-500">*</span>
//         </label>
//         <div className="relative">
//           <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//           <input
//             type="tel"
//             value={data.numero_telephone}
//             onChange={(e) => updateField('numero_telephone', e.target.value)}
//             placeholder="Ex: +243 812345678"
//             className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
//               errors.numero_telephone ? 'border-red-300 bg-red-50' : 'border-gray-300'
//             }`}
//           />
//         </div>
//         {errors.numero_telephone && (
//           <p className="mt-1 text-xs text-red-600">{errors.numero_telephone}</p>
//         )}
//       </div>

//       {/* Adresse e-mail */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1.5">
//           Adresse e-mail <span className="text-red-500">*</span>
//         </label>
//         <div className="relative">
//           <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//           <input
//             type="email"
//             value={data.adresse_email}
//             onChange={(e) => updateField('adresse_email', e.target.value)}
//             placeholder="Ex: jean@example.com"
//             className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
//               errors.adresse_email ? 'border-red-300 bg-red-50' : 'border-gray-300'
//             }`}
//           />
//         </div>
//         {errors.adresse_email && (
//           <p className="mt-1 text-xs text-red-600">{errors.adresse_email}</p>
//         )}
//       </div>

//       {/* Adresse physique */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1.5">
//           Adresse physique <span className="text-red-500">*</span>
//         </label>
//         <div className="relative">
//           <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//           <input
//             type="text"
//             value={data.adresse_physique}
//             onChange={(e) => updateField('adresse_physique', e.target.value)}
//             placeholder="Ex: 123 Avenue de la Liberté"
//             className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
//               errors.adresse_physique ? 'border-red-300 bg-red-50' : 'border-gray-300'
//             }`}
//           />
//         </div>
//         {errors.adresse_physique && (
//           <p className="mt-1 text-xs text-red-600">{errors.adresse_physique}</p>
//         )}
//       </div>

//       {/* Province et Ville */}
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1.5">
//             Province <span className="text-red-500">*</span>
//           </label>
//           <select
//             value={data.province}
//             onChange={(e) => updateField('province', e.target.value)}
//             className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
//               errors.province ? 'border-red-300 bg-red-50' : 'border-gray-300'
//             }`}
//           >
//             <option value="">Sélectionner...</option>
//             {PROVINCES_RDC.map((province) => (
//               <option key={province} value={province}>
//                 {province}
//               </option>
//             ))}
//           </select>
//           {errors.province && (
//             <p className="mt-1 text-xs text-red-600">{errors.province}</p>
//           )}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1.5">
//             Ville <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="text"
//             value={data.ville}
//             onChange={(e) => updateField('ville', e.target.value)}
//             placeholder="Ex: Kinshasa"
//             className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
//               errors.ville ? 'border-red-300 bg-red-50' : 'border-gray-300'
//             }`}
//           />
//           {errors.ville && (
//             <p className="mt-1 text-xs text-red-600">{errors.ville}</p>
//           )}
//         </div>
//       </div>

//       {/* Profession */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1.5">
//           Profession <span className="text-red-500">*</span>
//         </label>
//         <div className="relative">
//           <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//           <input
//             type="text"
//             value={data.profession}
//             onChange={(e) => updateField('profession', e.target.value)}
//             placeholder="Ex: Entrepreneur"
//             className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
//               errors.profession ? 'border-red-300 bg-red-50' : 'border-gray-300'
//             }`}
//           />
//         </div>
//         {errors.profession && (
//           <p className="mt-1 text-xs text-red-600">{errors.profession}</p>
//         )}
//       </div>
//     </div>
//   )
// }

// Step1Promoteur.tsx
'use client'

import { useEffect, useRef } from 'react'
import { User, Phone, Mail, MapPin, Briefcase } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { PromoteurInfo, PROVINCES_RDC } from '@/types/fpi'

type Props = {
  data: PromoteurInfo
  onChange: (data: PromoteurInfo) => void
  errors?: Partial<Record<keyof PromoteurInfo, string>>
}

export default function Step1Promoteur({ data, onChange, errors = {} }: Props) {
  const { user } = useAuth()
  const hasAutoFilled = useRef(false)

  // Remplissage automatique depuis le profil utilisateur connecté
  useEffect(() => {
    if (user && !hasAutoFilled.current) {
      const updates: Partial<PromoteurInfo> = {}

      // Nom complet (si non déjà rempli)
      if (!data.nom_complet.trim() && user.username) {
        updates.nom_complet = user.username
      }

      // Téléphone (si non déjà rempli)
      if (!data.numero_telephone.trim() && user.telephone) {
        updates.numero_telephone = user.telephone
      }

      // Email (toujours pré-rempli depuis le compte)
      if (!data.adresse_email.trim() && user.email) {
        updates.adresse_email = user.email
      }

      // Genre/Sexe (si non défini et disponible dans le profil)
      if (!data.sexe && user.genre) {
        updates.sexe = user.genre
      }

      // Appliquer les mises à jour si nécessaire
      if (Object.keys(updates).length > 0) {
        onChange({ ...data, ...updates })
        hasAutoFilled.current = true
      }
    }
  }, [user])

  const updateField = (field: keyof PromoteurInfo, value: any) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6 overflow-auto">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-1">
          Informations du Promoteur
        </h3>
        <p className="text-xs text-blue-700">
          Veuillez remplir tous les champs obligatoires marqués d'un astérisque (*)
        </p>
        {user && (
          <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
            <User className="h-3 w-3" />
            Certains champs ont été pré-remplis depuis votre profil
          </p>
        )}
      </div>

      {/* Nom complet */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Nom complet <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={data.nom_complet}
            onChange={(e) => updateField('nom_complet', e.target.value)}
            placeholder="Ex: Jean Dupont"
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              errors.nom_complet ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.nom_complet && (
          <p className="mt-1 text-xs text-red-600">{errors.nom_complet}</p>
        )}
      </div>

      {/* Sexe */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Sexe <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => updateField('sexe', 'M')}
            className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${
              data.sexe === 'M'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            Masculin
          </button>
          <button
            type="button"
            onClick={() => updateField('sexe', 'F')}
            className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${
              data.sexe === 'F'
                ? 'border-pink-500 bg-pink-50 text-pink-700'
                : 'border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            Féminin
          </button>
        </div>
        {errors.sexe && (
          <p className="mt-1 text-xs text-red-600">{errors.sexe}</p>
        )}
      </div>

      {/* Numéro de téléphone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Numéro de téléphone <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="tel"
            value={data.numero_telephone}
            onChange={(e) => updateField('numero_telephone', e.target.value)}
            placeholder="Ex: +243 812345678"
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              errors.numero_telephone ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.numero_telephone && (
          <p className="mt-1 text-xs text-red-600">{errors.numero_telephone}</p>
        )}
      </div>

      {/* Adresse e-mail */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Adresse e-mail <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="email"
            value={data.adresse_email}
            onChange={(e) => updateField('adresse_email', e.target.value)}
            placeholder="Ex: jean@example.com"
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              errors.adresse_email ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.adresse_email && (
          <p className="mt-1 text-xs text-red-600">{errors.adresse_email}</p>
        )}
      </div>

      {/* Adresse physique */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Adresse physique <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={data.adresse_physique}
            onChange={(e) => updateField('adresse_physique', e.target.value)}
            placeholder="Ex: 123 Avenue de la Liberté"
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              errors.adresse_physique ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.adresse_physique && (
          <p className="mt-1 text-xs text-red-600">{errors.adresse_physique}</p>
        )}
      </div>

      {/* Province et Ville */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Province <span className="text-red-500">*</span>
          </label>
          <select
            value={data.province}
            onChange={(e) => updateField('province', e.target.value)}
            className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              errors.province ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Sélectionner...</option>
            {PROVINCES_RDC.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
          {errors.province && (
            <p className="mt-1 text-xs text-red-600">{errors.province}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Ville <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.ville}
            onChange={(e) => updateField('ville', e.target.value)}
            placeholder="Ex: Kinshasa"
            className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              errors.ville ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.ville && (
            <p className="mt-1 text-xs text-red-600">{errors.ville}</p>
          )}
        </div>
      </div>

      {/* Profession */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Profession <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={data.profession}
            onChange={(e) => updateField('profession', e.target.value)}
            placeholder="Ex: Entrepreneur"
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              errors.profession ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.profession && (
          <p className="mt-1 text-xs text-red-600">{errors.profession}</p>
        )}
      </div>
    </div>
  )
}