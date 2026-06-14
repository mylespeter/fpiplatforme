// ServiceTechniqueHeader.tsx
'use client'

import { Search } from 'lucide-react'

interface ServiceTechniqueHeaderProps {
  projetsCount: number
  searchTerm: string
  onSearchChange: (value: string) => void
}

export default function ServiceTechniqueHeader({ 
  projetsCount, 
  searchTerm, 
  onSearchChange 
}: ServiceTechniqueHeaderProps) {
  return (
    <div className="flex-shrink-0 bg-white border-b px-4 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Service Technique</h1>
          <p className="text-sm text-gray-500">
            {projetsCount} dossier{projetsCount > 1 ? 's' : ''}
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
    </div>
  )
}