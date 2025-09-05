import type { Startup } from '@/domain/entities/Startup'
import { bytesToDataUrl } from '@/utils/image'

export function computeStartupImageSrc(s: Startup & { image_url?: string }): string | null {
  if (s.image_url) return s.image_url
  const data: unknown = s.image_data
  if (!data) return null
  if (data instanceof Uint8Array) return bytesToDataUrl(data)
  if (typeof data === 'object') {
    try {
      const values = Object.values(data as Record<string, unknown>).filter(v => typeof v === 'number') as number[]
      if (values.length) return bytesToDataUrl(new Uint8Array(values))
    } catch { /* ignore */ }
  }
  return null
}
