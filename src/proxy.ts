import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';

import { authConfigEdge } from '@/server/auth/config.edge';

const { auth } = NextAuth(authConfigEdge);

/**
 * Proteksi route server-side (S0.4) — berjalan sebelum halaman dirender:
 * - `/dashboard/*` butuh sesi (login) & khusus CUSTOMER (admin diarahkan ke panel).
 * - `/admin/*` butuh sesi DAN role `ADMIN`.
 * - `/login` & `/register`: user yang sudah login dialihkan keluar.
 * Non-admin yang sudah login diarahkan ke beranda; yang belum login ke `/login`.
 */
export default auth((req) => {
	const { nextUrl } = req;
	const { pathname } = nextUrl;
	const user = req.auth?.user;

	const isAuthPage = pathname === '/login' || pathname === '/register';
	const isAdminRoute = pathname.startsWith('/admin');
	const isDashboardRoute = pathname.startsWith('/dashboard');

	// Sudah login → tak perlu lihat halaman login/daftar, alihkan keluar.
	if (isAuthPage) {
		if (!user) return;
		const param = nextUrl.searchParams.get('redirect');
		// Hanya path internal (cegah open-redirect ke domain luar).
		const target =
			param && param.startsWith('/') && !param.startsWith('//') ? param : '/';
		return NextResponse.redirect(new URL(target, nextUrl));
	}

	if (!isAdminRoute && !isDashboardRoute) return;

	if (!user) {
		const loginUrl = new URL('/login', nextUrl);
		loginUrl.searchParams.set('redirect', pathname);
		return NextResponse.redirect(loginUrl);
	}

	if (isAdminRoute && user.role !== 'ADMIN') {
		return NextResponse.redirect(new URL('/', nextUrl));
	}

	// Dashboard khusus CUSTOMER — admin diarahkan ke panel admin.
	if (isDashboardRoute && user.role === 'ADMIN') {
		return NextResponse.redirect(new URL('/admin', nextUrl));
	}

	return;
});

export const config = {
	matcher: [
		'/admin',
		'/admin/:path*',
		'/dashboard',
		'/dashboard/:path*',
		'/login',
		'/register',
	],
};
