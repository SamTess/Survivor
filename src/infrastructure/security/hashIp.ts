const encoder = new TextEncoder();

export async function hashIp(ip?: string | null): Promise<string | undefined> {
  if (!ip) return undefined;
  const webCrypto: Crypto | undefined = (globalThis as unknown as { crypto?: Crypto }).crypto;
  if (webCrypto?.subtle) {
    try {
      const data = encoder.encode(ip);
      const digest = await webCrypto.subtle.digest("SHA-256", data);
      return bufferToHex(digest);
    } catch (err) {
      console.error("Web Crypto API failed to hash IP:", err);
    }
  }
  return sha256Sync(ip);
}

function bufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function sha256Sync(str: string): string {
  const msg = utf8ToBytes(str);
  const K = new Uint32Array([
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
  ]);
  let H0=0x6a09e667,H1=0xbb67ae85,H2=0x3c6ef372,H3=0xa54ff53a,H4=0x510e527f,H5=0x9b05688c,H6=0x1f83d9ab,H7=0x5be0cd19;
  const l = msg.length * 8;
  const withOne = new Uint8Array(((msg.length + 9 + 63) & ~63));
  withOne.set(msg);
  withOne[msg.length] = 0x80;
  const dv = new DataView(withOne.buffer);
  dv.setUint32(withOne.length - 4, l, false);
  const W = new Uint32Array(64);
  for (let i = 0; i < withOne.length; i += 64) {
    for (let t = 0; t < 16; t++) W[t] = dv.getUint32(i + t * 4, false);
    for (let t = 16; t < 64; t++) {
      const a=W[t-15], b=W[t-2];
      const s0 = (ror(a,7) ^ ror(a,18) ^ (a>>>3)) >>> 0;
      const s1 = (ror(b,17) ^ ror(b,19) ^ (b>>>10)) >>> 0;
      W[t] = (W[t-16] + s0 + W[t-7] + s1) >>> 0;
    }
    let a=H0,b=H1,c=H2,d=H3,e=H4,f=H5,g=H6,h=H7;
    for (let t=0;t<64;t++) {
      const S1 = (ror(e,6)^ror(e,11)^ror(e,25))>>>0;
      const ch = ((e & f) ^ (~e & g))>>>0;
      const temp1 = (h + S1 + ch + K[t] + W[t])>>>0;
      const S0 = (ror(a,2)^ror(a,13)^ror(a,22))>>>0;
      const maj = ((a & b) ^ (a & c) ^ (b & c))>>>0;
      const temp2 = (S0 + maj)>>>0;
      h=g; g=f; f=e; e=(d + temp1)>>>0; d=c; c=b; b=a; a=(temp1 + temp2)>>>0;
    }
    H0=(H0+a)>>>0; H1=(H1+b)>>>0; H2=(H2+c)>>>0; H3=(H3+d)>>>0;
    H4=(H4+e)>>>0; H5=(H5+f)>>>0; H6=(H6+g)>>>0; H7=(H7+h)>>>0;
  }
  const out = new Uint32Array([H0,H1,H2,H3,H4,H5,H6,H7]);
  let hex = ""; for (let i=0;i<out.length;i++) hex += out[i].toString(16).padStart(8,"0");
  return hex;
}

function ror(x: number, n: number) { return (x>>>n) | (x<<(32-n)); }
function utf8ToBytes(str: string): Uint8Array { return new TextEncoder().encode(str); }
