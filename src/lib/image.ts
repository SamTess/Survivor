// Helper utilities for working with binary image data (Uint8Array) in the UI layer.
// Converts a Uint8Array coming from the database (e.g. Prisma bytes / bytea column)
// into a data: URL that can be rendered directly by <img /> or next/image.

/** Detect a basic mime type from leading bytes (very small heuristic). */
export function detectMime(bytes: Uint8Array): string {
  if (bytes.length >= 4) {
    // PNG 89 50 4E 47
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return 'image/png';
    // JPEG FF D8 FF
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return 'image/jpeg';
    // GIF GIF87a / GIF89a
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return 'image/gif';
    // WEBP RIFF....WEBP (bytes 0-3 RIFF & 8-11 WEBP)
    if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'image/webp';
  }
  // Very naive SVG detection (<svg...) – ensure printable ascii
  const maybeSvgStart = new TextDecoder().decode(bytes.slice(0, 5)).toLowerCase();
  if (maybeSvgStart.startsWith('<svg')) return 'image/svg+xml';
  return 'image/png'; // Fallback default
}

/** Convert Uint8Array to base64 string (works on server & client). */
export function uint8ToBase64(bytes: Uint8Array): string {
  if (typeof window === 'undefined') {
    // Server side – Buffer available
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  const chunkSize = 0x8000; // Avoid call stack overflow for large arrays
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const sub = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...sub);
  }
  return btoa(binary);
}

/** Build a data URL from a Uint8Array (auto-detects mime type). */
export function bytesToDataUrl(bytes?: Uint8Array | null): string | null {
  if (!bytes || bytes.length === 0) return null;
  const mime = detectMime(bytes);
  const b64 = uint8ToBase64(bytes);
  return `data:${mime};base64,${b64}`;
}
