// // ServiceTechniqueHeader.tsx
// 'use client'

// import { Search } from 'lucide-react'

// interface ServiceTechniqueHeaderProps {
//   projetsCount: number
//   searchTerm: string
//   onSearchChange: (value: string) => void
// }

// export default function ServiceTechniqueHeader({ 
//   projetsCount, 
//   searchTerm, 
//   onSearchChange 
// }: ServiceTechniqueHeaderProps) {
//   return (
//     <div className="flex-shrink-0 bg-white border-b px-4 py-4">
//       <div className="max-w-6xl mx-auto flex items-center justify-between">
//         <div>
//           <h1 className="text-xl font-bold text-gray-900">Service Technique</h1>
//           <p className="text-sm text-gray-500">
//             {projetsCount} dossier{projetsCount > 1 ? 's' : ''}
//           </p>
//         </div>
//         <div className="relative w-64">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//           <input
//             type="text"
//             value={searchTerm}
//             onChange={(e) => onSearchChange(e.target.value)}
//             placeholder="Rechercher..."
//             className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
//           />
//         </div>
//       </div>
//     </div>
//   )
// }

// ServiceTechniqueHeader.tsx
'use client'

import { Search, FileText, Eye, Send, Clock, Archive } from 'lucide-react'

interface ServiceTechniqueHeaderProps {
  projetsCount: number
  searchTerm: string
  onSearchChange: (value: string) => void
  statsTechnicien?: {
    totalProjets: number
    projetsConsultes: number
    projetsAConsulter: number
    projetsTransmis: number
    projetsPrisParAutres: number  // AJOUTÉ
  }
  technicienNom?: string
}

export default function ServiceTechniqueHeader({ 
  projetsCount, 
  searchTerm, 
  onSearchChange,
  statsTechnicien,
  technicienNom
}: ServiceTechniqueHeaderProps) {
  return (
    <div className="flex-shrink-0 bg-white border-b px-4 py-4">
      <div className="max-w-6xl mx-auto">
        {/* Titre et recherche */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Service Technique</h1>
            <p className="text-sm text-gray-500">
              {technicienNom && <span className="font-medium">{technicienNom}</span>}
              {projetsCount > 0 && <span> • {projetsCount} dossier{projetsCount > 1 ? 's' : ''} au total</span>}
            </p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Stats du technicien */}
        {statsTechnicien && (
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-blue-600" />
                <p className="text-xs text-blue-600 font-medium">Mes consultations</p>
              </div>
              <p className="text-xl font-bold text-blue-900">{statsTechnicien.projetsConsultes}</p>
            </div>

            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-amber-600" />
                <p className="text-xs text-amber-600 font-medium">À consulter</p>
              </div>
              <p className="text-xl font-bold text-amber-900">{statsTechnicien.projetsAConsulter}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
              <div className="flex items-center gap-2 mb-1">
                <Send className="h-4 w-4 text-green-600" />
                <p className="text-xs text-green-600 font-medium">Transmis</p>
              </div>
              <p className="text-xl font-bold text-green-900">{statsTechnicien.projetsTransmis}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Archive className="h-4 w-4 text-gray-600" />
                <p className="text-xs text-gray-600 font-medium">Total dossiers</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{statsTechnicien.totalProjets}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}