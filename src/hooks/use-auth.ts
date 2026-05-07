'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'daffa_user';
const AUTH_EVENT = 'daffa-auth-change';

export type AuthUser = {
	name: string;
	email: string;
};

function readUser(): AuthUser | null {
	if (typeof window === 'undefined') return null;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as AuthUser) : null;
	} catch {
		return null;
	}
}

export function useAuth() {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setUser(readUser());
		setIsLoading(false);

		const sync = () => setUser(readUser());
		const onStorage = (e: StorageEvent) => {
			if (e.key === STORAGE_KEY) sync();
		};

		window.addEventListener('storage', onStorage);
		window.addEventListener(AUTH_EVENT, sync);
		return () => {
			window.removeEventListener('storage', onStorage);
			window.removeEventListener(AUTH_EVENT, sync);
		};
	}, []);

	const login = useCallback((next: AuthUser) => {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
		setUser(next);
		window.dispatchEvent(new Event(AUTH_EVENT));
	}, []);

	const logout = useCallback(() => {
		window.localStorage.removeItem(STORAGE_KEY);
		setUser(null);
		window.dispatchEvent(new Event(AUTH_EVENT));
	}, []);

	return { user, isLoading, login, logout };
}
