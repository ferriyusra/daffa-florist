'use client';

import { SessionProvider } from 'next-auth/react';

import { TRPCReactProvider } from '@/trpc/react';
import { ToastProvider } from '@/hooks';

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider>
			<TRPCReactProvider>
				<ToastProvider>{children}</ToastProvider>
			</TRPCReactProvider>
		</SessionProvider>
	);
}
