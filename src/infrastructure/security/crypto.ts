import { randomBytes, createCipheriv, createDecipheriv, createHash } from 'crypto';

// AES-256-GCM encryption helpers for message content at rest
// MESSAGE_ENC_KEY must be a 32-byte key provided as base64 or hex. We accept base64 by default.

function getRawKey(): Buffer {
  const key = process.env.MESSAGE_ENC_KEY;
  if (!key) {
    const secret = process.env.AUTH_SECRET || 'dev-secret';
    return createHash('sha256').update(secret).digest(); // 32 bytes
  }
  try {
    const b64 = Buffer.from(key, 'base64');
    if (b64.length === 32) return b64;
  } catch {}
  try {
    const hex = Buffer.from(key, 'hex');
    if (hex.length === 32) return hex;
  } catch {}
  const raw = Buffer.from(key);
  if (raw.length !== 32) {
    throw new Error('MESSAGE_ENC_KEY must be 32 bytes (base64 or hex)');
  }
  return raw;
}

export function encryptText(plain: string): string {
  const key = getRawKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}.${encrypted.toString('base64')}.${tag.toString('base64')}`;
}

export function decryptText(payload: string): string {
  const [ivB64, dataB64, tagB64] = payload.split('.');
  if (!ivB64 || !dataB64 || !tagB64) throw new Error('Invalid ciphertext format');
  const key = getRawKey();
  const iv = Buffer.from(ivB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
}
