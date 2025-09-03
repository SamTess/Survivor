export interface JwtPayloadEdge { userId: number; exp: number; }

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const bin = atob(str);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function importKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function verifyJwtEdge(token: string | undefined | null, secret: string): Promise<JwtPayloadEdge | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sigB64] = parts;
  const data = `${headerB64}.${payloadB64}`;
  try {
    const key = await importKey(secret);
    const sig = base64UrlDecode(sigB64);
    const msg = new TextEncoder().encode(data);
    const sigBuf = sig.byteOffset === 0 && sig.byteLength === sig.buffer.byteLength
      ? sig.buffer
      : sig.buffer.slice(sig.byteOffset, sig.byteOffset + sig.byteLength);
    const dataBuf = msg.byteOffset === 0 && msg.byteLength === msg.buffer.byteLength
      ? msg.buffer
      : msg.buffer.slice(msg.byteOffset, msg.byteOffset + msg.byteLength);
  // Conversion explicite vers ArrayBuffer standard pour éviter conflits de types TS
  const sigView = new Uint8Array(sigBuf.slice(0));
  const dataView = new Uint8Array(dataBuf.slice(0));
  // Cast explicite pour satisfaire le typage TS dans l'environnement Edge
  const ok = await crypto.subtle.verify('HMAC', key, sigView as unknown as BufferSource, dataView as unknown as BufferSource);
    if (!ok) return null;
    const payload: JwtPayloadEdge = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64)));
    if (payload.exp < Math.floor(Date.now()/1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
