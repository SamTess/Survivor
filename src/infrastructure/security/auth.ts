import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'crypto';
export const __SERVER_ONLY__ = true;

export interface JwtPayload {
  userId: number;
  exp: number;
}

function base64UrlEncode(data: Buffer | Uint8Array | string): string {
  const buf = typeof data === 'string' ? Buffer.from(data) : Buffer.from(data);
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str: string): Buffer {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64');
}

export function signJwt(payload: Omit<JwtPayload, 'exp'>, expiresInSeconds: number, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const full: JwtPayload = { ...payload, exp };
  const headerPart = base64UrlEncode(JSON.stringify(header));
  const payloadPart = base64UrlEncode(JSON.stringify(full));
  const data = `${headerPart}.${payloadPart}`;
  const sig = createHmac('sha256', secret).update(data).digest();
  return `${data}.${base64UrlEncode(sig)}`;
}

export function verifyJwt(token: string | undefined | null, secret: string): JwtPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sigB64] = parts;
  const data = `${headerB64}.${payloadB64}`;
  const expected = createHmac('sha256', secret).update(data).digest();
  const given = base64UrlDecode(sigB64);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const payload: JwtPayload = JSON.parse(base64UrlDecode(payloadB64).toString('utf8'));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  const derived = scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(key, 'hex');
  return keyBuf.length === derived.length && timingSafeEqual(keyBuf, derived);
}

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('Missing AUTH_SECRET env variable');
  return secret;
}
