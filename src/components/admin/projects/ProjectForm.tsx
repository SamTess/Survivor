import React from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LEGAL_STATUSES, SECTORS, MATURITIES } from './constants'
import type { ProjectFormData } from './types'
import type { LegalStatus, Sector, Maturity } from './constants'

interface ProjectFormProps {
  formData: ProjectFormData
  onChange: (data: ProjectFormData) => void
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ formData, onChange }) => {
  const updateField = <K extends keyof ProjectFormData>(field: K, value: ProjectFormData[K]) => {
    onChange({ ...formData, [field]: value })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="project-name" className="block text-sm font-medium mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="project-name"
            type="text"
            required
            autoComplete="organization"
            placeholder="Enter project name"
            aria-describedby="project-name-help"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
          />
          <div id="project-name-help" className="text-xs text-muted-foreground mt-1">
            Enter the official name of the project
          </div>
        </div>

        <div>
          <label htmlFor="project-email" className="block text-sm font-medium mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            id="project-email"
            type="email"
            required
            autoComplete="email"
            placeholder="contact@project.com"
            aria-describedby="project-email-help"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
          <div id="project-email-help" className="text-xs text-muted-foreground mt-1">
            Primary contact email for the project
          </div>
        </div>

        <div>
          <label htmlFor="project-legal-status" className="block text-sm font-medium mb-1">
            Legal status <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.legal_status}
            onValueChange={(value) => updateField('legal_status', value as LegalStatus)}
          >
            <SelectTrigger aria-describedby="project-legal-status-help">
              <SelectValue placeholder="Select legal status" />
            </SelectTrigger>
            <SelectContent>
              {LEGAL_STATUSES.map(status => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div id="project-legal-status-help" className="text-xs text-muted-foreground mt-1">
            Choose the legal structure of the project
          </div>
        </div>

        <div>
          <label htmlFor="project-sector" className="block text-sm font-medium mb-1">
            Sector <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.sector}
            onValueChange={(value) => updateField('sector', value as Sector)}
          >
            <SelectTrigger aria-describedby="project-sector-help">
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map(sector => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div id="project-sector-help" className="text-xs text-muted-foreground mt-1">
            Select the industry sector of the project
          </div>
        </div>

        <div>
          <label htmlFor="project-maturity" className="block text-sm font-medium mb-1">
            Maturity <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.maturity}
            onValueChange={(value) => updateField('maturity', value as Maturity)}
          >
            <SelectTrigger aria-describedby="project-maturity-help">
              <SelectValue placeholder="Select maturity" />
            </SelectTrigger>
            <SelectContent>
              {MATURITIES.map(maturity => (
                <SelectItem key={maturity} value={maturity}>
                  {maturity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div id="project-maturity-help" className="text-xs text-muted-foreground mt-1">
            Choose the current development stage
          </div>
        </div>

        <div>
          <label htmlFor="project-phone" className="block text-sm font-medium mb-1">Phone</label>
          <Input
            id="project-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+33 6 12 34 56 78"
            aria-describedby="project-phone-help"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
          />
          <div id="project-phone-help" className="text-xs text-muted-foreground mt-1">
            Contact phone number for the project
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="project-address" className="block text-sm font-medium mb-1">
          Address <span className="text-red-500">*</span>
        </label>
        <Input
          id="project-address"
          type="text"
          required
          autoComplete="address-line1"
          placeholder="123 Main Street, City, Country"
          aria-describedby="project-address-help"
          value={formData.address}
          onChange={(e) => updateField('address', e.target.value)}
        />
        <div id="project-address-help" className="text-xs text-muted-foreground mt-1">
          Complete address of the project headquarters
        </div>
      </div>

      <div>
        <label htmlFor="project-description" className="block text-sm font-medium mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="project-description"
          required
          rows={4}
          autoComplete="off"
          placeholder="Describe the project, its mission, and objectives"
          aria-describedby="project-description-help"
          className="w-full px-3 py-2 border border-input bg-background rounded-md resize-none"
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
        />
        <div id="project-description-help" className="text-xs text-muted-foreground mt-1">
          Provide a detailed description of the project and its goals
        </div>
      </div>
    </div>
  )
}