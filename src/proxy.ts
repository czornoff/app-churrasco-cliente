import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

// No Next.js 16, a função deve se chamar 'proxy' ou ser o export default
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split('/').filter(Boolean);
  const tenantSlug = segments[0];

  if (!tenantSlug) {
    return NextResponse.next();
  }

  const reservedPaths = ['admin', 'login', 'register', 'dashboard'];
  if (reservedPaths.includes(tenantSlug)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Opcional: manter o config para filtrar as rotas que o proxy observa
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};