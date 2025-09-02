import type { Startup } from '@/domain/entities/Startup'

const encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : undefined as unknown as TextEncoder

function makeSvg(label: string, bg: string, accent: string, accent2?: string): Uint8Array {
  const safe = label.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const grad = accent2 ? `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${accent}"/><stop offset="100%" stop-color="${accent2}"/></linearGradient>` : ''
  const fill = accent2 ? 'url(#g)' : accent
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='225' viewBox='0 0 400 225'>`+
    `<defs>${grad}<pattern id='grid' width='32' height='32' patternUnits='userSpaceOnUse'><rect width='32' height='32' fill='${bg}'/><path d='M0 0H32V32' fill='none' stroke='${fill}' stroke-width='2' opacity='0.25'/></pattern></defs>`+
    `<rect width='400' height='225' fill='url(#grid)'/>`+
    `<rect x='8' y='8' width='384' height='209' rx='16' fill='${fill}' opacity='0.12'/>`+
    `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='28' font-weight='700' fill='${accent2 ? accent2 : accent}'>${safe}</text>`+
    `</svg>`
  return encoder.encode(svg)
}

export const startups: Startup[] = [
  {
    id: 1,
    name: 'EcoTech Solutions',
    legal_status: 'SAS',
    address: '500 Green Blvd, San Francisco, CA',
    phone: '+1-415-555-0101',
    sector: 'CleanTech',
    maturity: 'Series A',
    email: 'contact@ecotech.io',
    description: 'Solutions de stockage d\'énergie durable pour optimiser la transition énergétique.',
    image_data: makeSvg('EcoTech', '#0f172a', '#00d37f', '#0066ff'),
    created_at: new Date('2024-01-02T00:00:00Z'),
  },
  {
    id: 2,
    name: 'HealthAI',
    legal_status: 'SAS',
    address: '42 Medical Park, Boston, MA',
    phone: '+1-617-555-0142',
    sector: 'HealthTech',
    maturity: 'Seed',
    email: 'hello@healthai.app',
    description: 'Diagnostic précoce assisté par IA pour maladies chroniques et rares.',
    image_data: makeSvg('HealthAI', '#1e293b', '#ff2e63', '#ffa600'),
    created_at: new Date('2024-02-10T00:00:00Z'),
  },
  {
    id: 3,
    name: 'FinFlow',
    legal_status: 'SARL',
    address: '120 Finance Ave, New York, NY',
    phone: '+1-212-555-0199',
    sector: 'FinTech',
    maturity: 'Pre-Seed',
    email: 'team@finflow.co',
    description: 'Plateforme de gestion de trésorerie automatisée pour PME.',
    image_data: makeSvg('FinFlow', '#0a0f1c', '#4f46e5', '#6366f1'),
    created_at: new Date('2024-03-05T00:00:00Z'),
  },
  {
    id: 4,
    name: 'AgriSmart',
    legal_status: 'SAS',
    address: '77 Soil Way, Austin, TX',
    phone: '+1-512-555-0117',
    sector: 'AgTech',
    maturity: 'Seed',
    email: 'contact@agrismart.io',
    description: 'Capteurs IoT et analytics pour agriculture de précision et optimisation des intrants.',
    image_data: makeSvg('AgriSmart', '#052e16', '#16a34a', '#65d26e'),
    created_at: new Date('2024-03-20T00:00:00Z'),
  },
  {
    id: 5,
    name: 'EduVerse',
    legal_status: 'SAS',
    address: '900 Learning St, Seattle, WA',
    phone: '+1-206-555-0175',
    sector: 'EdTech',
    maturity: 'Series A',
    email: 'support@eduverse.app',
    description: 'Expériences immersives VR pour l\'apprentissage collaboratif international.',
    image_data: makeSvg('EduVerse', '#1e1b4b', '#6366f1', '#a78bfa'),
    created_at: new Date('2024-04-15T00:00:00Z'),
  },
  {
    id: 6,
    name: 'CyberShield',
    legal_status: 'SARL',
    address: '15 Secure Plaza, Denver, CO',
    phone: '+1-303-555-0133',
    sector: 'CyberSecurity',
    maturity: 'Seed',
    email: 'security@cybershield.io',
    description: 'Détection proactive des menaces pour PME avec moteur ML temps réel.',
    image_data: makeSvg('CyberShield', '#111827', '#10b981', '#0ea5e9'),
    created_at: new Date('2024-05-01T00:00:00Z'),
  },
  {
    id: 7,
    name: 'SpaceLogistics',
    legal_status: 'SAS',
    address: '400 Orbit Lane, Los Angeles, CA',
    phone: '+1-310-555-0128',
    sector: 'SpaceTech',
    maturity: 'Pre-Seed',
    email: 'mission@spacelogistics.ai',
    description: 'Traçabilité supply chain basée sur données satellites et optimisation de routes.',
    image_data: makeSvg('SpaceLog', '#020617', '#38bdf8', '#6366f1'),
    created_at: new Date('2024-05-18T00:00:00Z'),
  },
  {
    id: 8,
    name: 'BioMaterials',
    legal_status: 'SAS',
    address: '66 Eco Park, Portland, OR',
    phone: '+1-971-555-0166',
    sector: 'CleanTech',
    maturity: 'Seed',
    email: 'hello@biomaterials.green',
    description: 'Matériaux d\'emballage biosourcés remplaçant les plastiques pétrochimiques.',
    image_data: makeSvg('BioMat', '#022c22', '#34d399', '#84cc16'),
    created_at: new Date('2024-06-07T00:00:00Z'),
  },
]
