export const LEGAL_STATUSES = [
  'LLC', 'SAS', 'SA', 'Partnership', 'Civil Company', 'Sole Proprietorship', 'Association', 'Other'
] as const

export const SECTORS = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Gaming',
  'Food & Agriculture', 'Energy', 'Transportation', 'Real Estate', 'Media', 'Other'
] as const

export const MATURITIES = [
  'Idea', 'Prototype', 'MVP', 'Early Stage', 'Growth', 'Mature', 'Scale-up'
] as const

export type LegalStatus = typeof LEGAL_STATUSES[number]
export type Sector = typeof SECTORS[number]
export type Maturity = typeof MATURITIES[number]

export const getMaturityColor = (maturity: Maturity) => {
  const colors = {
    'Idea': 'admin-maturity-idea',
    'Prototype': 'admin-maturity-prototype',
    'MVP': 'admin-maturity-mvp',
    'Early Stage': 'admin-maturity-early',
    'Growth': 'admin-maturity-growth',
    'Mature': 'admin-maturity-mature',
    'Scale-up': 'admin-maturity-scaleup'
  }
  return colors[maturity] || colors['Idea']
}