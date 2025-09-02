import type { Startup } from '@/domain/entities/Startup'
import { MapPin, Phone, Mail, Building2, Calendar } from 'lucide-react'

export type StartupCardFieldKey = keyof Startup

export interface StartupCardFieldDescriptor<K extends StartupCardFieldKey = StartupCardFieldKey> {
  key: K
  label: string
  icon?: React.ComponentType<{ className?: string }>
  format?: (value: Startup[K], full: Startup) => string
}

// Order determines rendering order beneath description.
export const startupCardFieldConfig: StartupCardFieldDescriptor[] = [
  { key: 'address', label: 'Address', icon: MapPin },
  { key: 'legal_status', label: 'Legal', icon: Building2 },
  { key: 'phone', label: 'Phone', icon: Phone },
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'created_at', label: 'Created', icon: Calendar, format: (v) => v instanceof Date ? v.toISOString().slice(0,10) : '' },
]

// Helper to easily extend / prune fields in one place.
// To remove a field from the card, delete it from the array above.
// To add: push a new descriptor with { key, label, icon?, format? }.
