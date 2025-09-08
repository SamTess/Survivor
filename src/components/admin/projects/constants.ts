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
    'Idea': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    'Prototype': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'MVP': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Early Stage': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Growth': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Mature': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Scale-up': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
  }
  return colors[maturity] || colors['Idea']
}