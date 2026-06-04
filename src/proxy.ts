import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';

import { authConfigEdge } from '@/server/auth/config.edge';

const { auth } = NextAuth(authConfigEdge);

/**
 * Proteksi route server-side (S0.4) — berjalan sebelum halaman dirender:
 * - `/dashboard/*` butuh sesi (login).
 * - `/admin/*` butuh sesi DAN role `ADMIN`.
 * Non-admin yang sudah login diarahkan ke beranda; yang belum login ke `/login`.
 */
export default auth((req) => {
	const { nextUrl } = req;
	const { pathname } = nextUrl;
	const user = req.auth?.user;

	const isAdminRoute = pathname.startsWith('/admin');
	const isDashboardRoute = pathname.startsWith('/dashboard');

	if (!isAdminRoute && !isDashboardRoute) return;

	if (!user) {
		const loginUrl = new URL('/login', nextUrl);
		loginUrl.searchParams.set('redirect', pathname);
		return NextResponse.redirect(loginUrl);
	}

	if (isAdminRoute && user.role !== 'ADMIN') {
		return NextResponse.redirect(new URL('/', nextUrl));
	}

	return;
});

export const config = {
	matcher: ['/admin', '/admin/:path*', '/dashboard', '/dashboard/:path*'],
};
