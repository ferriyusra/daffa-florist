'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
	AlertCircle,
	ArrowLeft,
	Eye,
	EyeOff,
	Loader2,
	Lock,
} from 'lucide-react';
import { Footer, Navbar } from '@/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/trpc/react';
import { registerFields } from '@/lib/auth-schema';

export default function ResetPasswordPage() {
	return (
		<>
			<Navbar />
			<Suspense fallback={null}>
				<ResetPasswordForm />
			</Suspense>
			<Footer />
		</>
	);
}

function Shell({ children }: { children: React.ReactNode }) {
	return (
		<main className='floral-bg flex items-center justify-center px-6 py-16 min-h-[70vh]'>
			<div className='w-full max-w-[440px]'>
				<Link
					href='/login'
					className='inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors'
					style={{ color: 'var(--primary)' }}>
					<ArrowLeft size={16} />
					Kembali ke Masuk
				</Link>
				<div
					className='bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden'
					style={{ boxShadow: 'var(--shadow-sm)' }}>
					{children}
				</div>
			</div>
		</main>
	);
}

function InvalidState() {
	return (
		<Shell>
			<div className='p-8 text-center'>
				<div
					className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full'
					style={{
						background: 'color-mix(in srgb, var(--destructive) 8%, transparent)',
						color: 'var(--destructive)',
					}}>
					<AlertCircle size={24} />
				</div>
				<h1 className='font-serif text-2xl font-bold mb-2'>Tautan tidak valid</h1>
				<p
					className='text-sm mb-6'
					style={{ color: 'var(--text-secondary)' }}>
					Tautan reset password tidak valid atau sudah kedaluwarsa. Silakan
					minta tautan baru.
				</p>
				<Link href='/forgot-password'>
					<Button className='w-full h-11 rounded-full'>
						Minta Tautan Baru
					</Button>
				</Link>
			</div>
		</Shell>
	);
}

function ResetPasswordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get('token') ?? '';

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [formError, setFormError] = useState('');

	const verify = api.auth.verifyResetToken.useQuery(
		{ token },
		{ enabled: token.length > 0, retry: false },
	);

	const reset = api.auth.resetPassword.useMutation({
		onSuccess: () => {
			router.push('/login?reset=1');
		},
		onError: (err) => setFormError(err.message),
	});

	// Token kosong atau terbukti tidak valid → state invalid.
	if (!token || verify.data?.valid === false || verify.isError) {
		return <InvalidState />;
	}

	// Masih memeriksa token.
	if (verify.isLoading) {
		return (
			<Shell>
				<div
					className='p-12 flex flex-col items-center justify-center gap-3'
					style={{ color: 'var(--text-secondary)' }}>
					<Loader2 size={28} className='animate-spin' />
					<p className='text-sm'>Memeriksa tautan...</p>
				</div>
			</Shell>
		);
	}

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setFormError('');

		const errs: Record<string, string> = {};
		const parsed = registerFields.shape.password.safeParse(password);
		if (!parsed.success) {
			errs.password = parsed.error.issues[0]?.message ?? 'Password tidak valid.';
		}
		if (password !== confirmPassword) {
			errs.confirmPassword = 'Konfirmasi password tidak cocok.';
		}
		if (Object.keys(errs).length) {
			setFieldErrors(errs);
			return;
		}

		setFieldErrors({});
		reset.mutate({ token, password });
	};

	return (
		<Shell>
			<div
				className='px-8 py-8 text-center border-b border-[var(--border)]'
				style={{ background: 'rgba(157, 23, 77, 0.05)' }}>
				<h1 className='font-serif text-2xl sm:text-3xl font-bold mb-2'>
					Buat Password Baru
				</h1>
				<p className='text-sm' style={{ color: 'var(--text-secondary)' }}>
					Masukkan password baru untuk akun Anda.
				</p>
			</div>

			<form onSubmit={handleSubmit} noValidate className='p-8 space-y-5'>
				<div>
					<Label htmlFor='password' className='mb-2'>
						Password Baru
					</Label>
					<div className='relative'>
						<Lock
							size={16}
							className='absolute left-3 top-1/2 -translate-y-1/2 z-10'
							style={{ color: 'var(--text-muted)' }}
						/>
						<Input
							id='password'
							type={showPassword ? 'text' : 'password'}
							value={password}
							onChange={(e) => {
								setPassword(e.target.value);
								setFieldErrors({});
							}}
							placeholder='Minimal 6 karakter'
							aria-invalid={!!fieldErrors.password}
							className='h-11 pl-10 pr-10'
						/>
						<button
							type='button'
							onClick={() => setShowPassword(!showPassword)}
							className='absolute right-3 top-1/2 -translate-y-1/2 z-10 cursor-pointer'
							style={{ color: 'var(--text-muted)' }}
							aria-label={
								showPassword ? 'Sembunyikan password' : 'Tampilkan password'
							}>
							{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
						</button>
					</div>
					{fieldErrors.password && (
						<p
							className='mt-1.5 text-xs'
							style={{ color: 'var(--destructive)' }}>
							{fieldErrors.password}
						</p>
					)}
				</div>

				<div>
					<Label htmlFor='confirmPassword' className='mb-2'>
						Konfirmasi Password
					</Label>
					<div className='relative'>
						<Lock
							size={16}
							className='absolute left-3 top-1/2 -translate-y-1/2 z-10'
							style={{ color: 'var(--text-muted)' }}
						/>
						<Input
							id='confirmPassword'
							type={showPassword ? 'text' : 'password'}
							value={confirmPassword}
							onChange={(e) => {
								setConfirmPassword(e.target.value);
								setFieldErrors((p) => {
									if (!p.confirmPassword) return p;
									const next = { ...p };
									delete next.confirmPassword;
									return next;
								});
							}}
							placeholder='Ulangi password baru'
							aria-invalid={!!fieldErrors.confirmPassword}
							className='h-11 pl-10 pr-4'
						/>
					</div>
					{fieldErrors.confirmPassword && (
						<p
							className='mt-1.5 text-xs'
							style={{ color: 'var(--destructive)' }}>
							{fieldErrors.confirmPassword}
						</p>
					)}
				</div>

				{formError && (
					<div
						role='alert'
						className='flex items-center gap-2 text-sm rounded-xl px-4 py-3'
						style={{
							background:
								'color-mix(in srgb, var(--destructive) 8%, transparent)',
							color: 'var(--destructive)',
						}}>
						<AlertCircle size={16} className='shrink-0' />
						{formError}
					</div>
				)}

				<Button
					type='submit'
					disabled={reset.isPending}
					className='w-full h-11 rounded-full'>
					{reset.isPending ? 'Menyimpan...' : 'Simpan Password Baru'}
				</Button>
			</form>
		</Shell>
	);
}
