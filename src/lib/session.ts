// Edge-safe (used by middleware AND server code): HMAC-SHA256 signed session token. No external dependency.
export const COOKIE = 'tp_session';
export type Session = { uid: string; role: 'CLIENT' | 'FREELANCER' | 'ADMIN'; exp: number };

const enc = new TextEncoder();
const b64 = (b: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

function key() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error('AUTH_SECRET is missing or shorter than 32 characters (see .env.example).');
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
export async function signSession(s: Session) {
  const body = b64(enc.encode(JSON.stringify(s)));
  return `${body}.${b64(await crypto.subtle.sign('HMAC', await key(), enc.encode(body)))}`;
}
export async function verifySession(token?: string): Promise<Session | null> {
  const [body, sig] = (token ?? '').split('.');
  if (!body || !sig) return null;
  try {
    if (!(await crypto.subtle.verify('HMAC', await key(), unb64(sig), enc.encode(body)))) return null; // constant-time check
    const s = JSON.parse(new TextDecoder().decode(unb64(body))) as Session;
    return s.exp > Date.now() ? s : null;
  } catch { return null; }
}
