// Centralized URL builder helpers to avoid scattering magic strings
// Base paths can later be made configurable via env variables if needed.

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api';

export function buildNewsImageUrl(id: number): string {
  return `${API_BASE}/news/${id}/image`;
}

export function buildStartupImageUrl(id: number): string {
  return `${API_BASE}/startups/${id}/image`;
}

export function buildEventImageUrl(id: number): string {
  return `${API_BASE}/events/${id}/image`;
}

// Generic helper allowing custom segment injection if needed later
export function buildContentImageUrl(contentType: string, id: number): string {
  return `${API_BASE}/${contentType}/${id}/image`;
}
