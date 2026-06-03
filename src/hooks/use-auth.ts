'use client';

import { useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react';

export type AuthUser = {
	id: string;
	name: string;
	email: string;
	role: 'CUSTOMER' | 'ADMIN';
};

export function useAuth() {
	const { data: session, status } = useSession();

	const user: AuthUser | null = session?.user
		? {
				id: session.user.id,
				name: session.user.name ?? '',
				email: session.user.email ?? '',
				role: session.user.role,
			}
		: null;

	const logout = useCallback(async () => {
		await signOut({ redirect: false });
	}, []);

	return {
		user,
		isLoading: status === 'loading',
		logout,
	};
}
