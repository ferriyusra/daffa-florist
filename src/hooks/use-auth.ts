'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export type AuthUser = {
	id: string;
	name: string;
	email: string;
	role: 'CUSTOMER' | 'ADMIN';
};

export function useAuth() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const user: AuthUser | null = session?.user
		? {
				id: session.user.id,
				name: session.user.name ?? '',
				email: session.user.email ?? '',
				role: session.user.role,
			}
		: null;

	/**
	 * Keluar: bersihkan sesi lalu arahkan (default beranda). `redirect: false`
	 * agar navigasi ditangani router (tanpa reload penuh); `refresh()` me-revalidate
	 * server components & middleware dengan sesi yang sudah kosong.
	 *
	 * Tak pernah melempar — mengembalikan `true` bila sukses, `false` bila gagal,
	 * agar pemanggil bisa menangani kegagalan tanpa unhandled rejection.
	 */
	const logout = useCallback(
		async (redirectTo: string = '/'): Promise<boolean> => {
			try {
				await signOut({ redirect: false });
				router.push(redirectTo);
				router.refresh();
				return true;
			} catch {
				return false;
			}
		},
		[router],
	);

	return {
		user,
		isLoading: status === 'loading',
		logout,
	};
}
