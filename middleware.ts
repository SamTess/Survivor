import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwtEdge } from './src/infrastructure/security/auth-edge';

const PUBLIC_PATHS = ['/login','/signup','/favicon.ico', '/'];

function isPublic(path: string): boolean {
  if (PUBLIC_PATHS.includes(path)) return true;
  if (path.startsWith('/api/auth/')) return true;
  if (path.startsWith('/api/health')) return true;
  if (path.startsWith('/_next/') || path.startsWith('/static/')) return true;
  if (path.startsWith('/public/')) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();
  const token = req.cookies.get('auth')?.value;
  const secret = process.env.AUTH_SECRET || 'dev-secret';
  const payload = await verifyJwtEdge(token, secret);
  if (!payload) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!api/analytics).*)'] };
