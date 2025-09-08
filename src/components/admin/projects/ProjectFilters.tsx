import React from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'
import { SECTORS, MATURITIES } from './constants'
import type { FilterState } from './types'

interface ProjectFiltersProps {
  filters: FilterState
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
}

export const ProjectFilters: React.FC<ProjectFiltersProps> = ({ filters, onFilterChange }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          type="text"
          placeholder="Search by name, description, or email..."
          className="pl-10"
          value={filters.searchTerm}
          onChange={(e) => onFilterChange('searchTerm', e.target.value)}
        />
      </div>
      <Select
        value={filters.selectedSector}
        onValueChange={(value) => onFilterChange('selectedSector', value as FilterState['selectedSector'])}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All sectors" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All sectors</SelectItem>
          {SECTORS.map(sector => (
            <SelectItem key={sector} value={sector}>{sector}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.selectedMaturity}
        onValueChange={(value) => onFilterChange('selectedMaturity', value as FilterState['selectedMaturity'])}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All maturities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All maturities</SelectItem>
          {MATURITIES.map(maturity => (
            <SelectItem key={maturity} value={maturity}>{maturity}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}