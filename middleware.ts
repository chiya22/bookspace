import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/register'];
const adminPaths = ['/reception', '/admin'];

function isPublic(pathname: string) {
  return publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isAdminPath(pathname: string) {
  return adminPaths.some((p) => pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (isPublic(pathname)) {
    if (token) {
      const url = req.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  const role = token.role as string | undefined;
  if (isAdminPath(pathname) && role !== 'librarian' && role !== 'admin') {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // 認証チェックの対象外: API・Next 内部・favicon・public の静的ファイル（ロゴなど）
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|company_logo\\.svg).*)'],
};
