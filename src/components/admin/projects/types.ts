import type { LegalStatus, Sector, Maturity } from './constants'

export interface Project {
  id: number
  name: string
  legal_status: LegalStatus
  sector: Sector
  maturity: Maturity
  address: string
  phone: string
  email: string
  description: string
  created_at: string
  viewsCount: number
  likesCount: number
  bookmarksCount: number
  followersCount: number
}

export interface ProjectFormData {
  name: string
  legal_status: LegalStatus
  sector: Sector
  maturity: Maturity
  address: string
  phone: string
  email: string
  description: string
}

export interface AlertState {
  isOpen: boolean
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

export interface FilterState {
  searchTerm: string
  selectedSector: Sector | ''
  selectedMaturity: Maturity | ''
}