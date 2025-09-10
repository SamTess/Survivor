import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwtEdge } from './src/infrastructure/security/auth-edge';

const PUBLIC_PATHS = ['/login', '/signup', '/favicon.ico', '/', '/about', '/news', '/events', '/projects', '/health', '/home', '/logo.png'];

function isPublic(path: string): boolean {
  if (PUBLIC_PATHS.includes(path)) return true;
  if (path.startsWith('/auth/')) return true;
  if (path.startsWith('/api/auth/')) return true;
  if (path.startsWith('/api/health')) return true;
  if (path.startsWith('/api/sync/')) return true;
  if (path.startsWith('/api/events')) return true;
  if (path.startsWith('/api/startups')) return true;
  if (path.startsWith('/api/news')) return true;
  if (path.startsWith('/api/investors')) return true;
  if (path.startsWith('/api/partners')) return true;
  if (path.startsWith('/api/users')) return true;
  if (path.startsWith('/_next/') || path.startsWith('/static/')) return true;
  if (path.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/i)) return true;
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
