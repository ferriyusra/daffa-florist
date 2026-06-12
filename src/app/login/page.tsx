'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Footer, Navbar } from '@/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
	return (
		<>
			<Navbar />
			<Suspense fallback={null}>
				<LoginForm />
			</Suspense>
			<Footer />
		</>
	);
}

function LoginForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');

	const redirectTo = searchParams.get('redirect') ?? '/dashboard';
	const justRegistered = searchParams.get('registered') === '1';

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError('');
		setSubmitting(true);

		const res = await signIn('credentials', {
			email,
			password,
			redirect: false,
		});

		setSubmitting(false);

		if (!res || res.error) {
			setError('Email atau password salah.');
			return;
		}

		router.push(redirectTo);
		router.refresh();
	};

	return (
		<main className='floral-bg flex items-center justify-center px-6 py-16 min-h-[70vh]'>
			<div className='w-full max-w-[440px]'>
				<Link
					href='/'
					className='inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors'
					style={{ color: 'var(--primary)' }}>
					<ArrowLeft size={16} />
					Kembali ke Beranda
				</Link>

				<div
					className='bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden'
					style={{ boxShadow: 'var(--shadow-sm)' }}>
					<div
						className='px-8 py-8 text-center border-b border-[var(--border)]'
						style={{ background: 'rgba(157, 23, 77, 0.05)' }}>
						<h1 className='font-serif text-2xl sm:text-3xl font-bold mb-2'>
							Masuk
						</h1>
						<p
							className='text-sm'
							style={{ color: 'var(--text-secondary)' }}>
							Masuk untuk melanjutkan pemesanan Anda.
						</p>
					</div>

					<form
						onSubmit={handleSubmit}
						noValidate
						className='p-8 space-y-5'>
						<div>
							<Label htmlFor='email' className='mb-2'>
								Email
							</Label>
							<div className='relative'>
								<Mail
									size={16}
									className='absolute left-3 top-1/2 -translate-y-1/2 z-10'
									style={{ color: 'var(--text-muted)' }}
								/>
								<Input
									id='email'
									type='email'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder='nama@email.com'
									aria-invalid={!!error}
									className='h-11 pl-10 pr-4'
								/>
							</div>
						</div>

						<div>
							<Label htmlFor='password' className='mb-2'>
								Password
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
									onChange={(e) => setPassword(e.target.value)}
									placeholder='Minimal 6 karakter'
									aria-invalid={!!error}
									className='h-11 pl-10 pr-10'
								/>
								<button
									type='button'
									onClick={() => setShowPassword(!showPassword)}
									className='absolute right-3 top-1/2 -translate-y-1/2 z-10 cursor-pointer'
									style={{ color: 'var(--text-muted)' }}
									aria-label={
										showPassword
											? 'Sembunyikan password'
											: 'Tampilkan password'
									}>
									{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
								</button>
							</div>
						</div>

						<div className='flex items-center justify-between text-sm'>
							<label className='flex items-center gap-2 cursor-pointer'>
								<input
									type='checkbox'
									className='w-4 h-4 rounded border-[var(--border)]'
								/>
								<span style={{ color: 'var(--text-secondary)' }}>
									Ingat saya
								</span>
							</label>
							<a
								href='#'
								className='font-medium transition-colors'
								style={{ color: 'var(--primary)' }}>
								Lupa password?
							</a>
						</div>

						{justRegistered && !error && (
							<p
								className='text-sm rounded-xl px-4 py-3'
								style={{
									background: 'rgba(61, 107, 79, 0.1)',
									color: 'var(--secondary)',
								}}>
								Akun berhasil dibuat. Silakan masuk dengan email & password
								Anda.
							</p>
						)}

						{error && (
							<p
								className='text-sm rounded-xl px-4 py-3'
								style={{
									background: 'rgba(220, 38, 38, 0.08)',
									color: '#dc2626',
								}}>
								{error}
							</p>
						)}

						<Button
							type='submit'
							disabled={submitting}
							className='w-full h-11 rounded-full'>
							{submitting ? 'Memproses...' : 'Masuk'}
						</Button>

						<p
							className='text-center text-sm'
							style={{ color: 'var(--text-secondary)' }}>
							Belum punya akun?{' '}
							<Link
								href={{
									pathname: '/register',
									query: redirectTo !== '/' ? { redirect: redirectTo } : {},
								}}
								className='font-medium transition-colors'
								style={{ color: 'var(--primary)' }}>
								Daftar di sini
							</Link>
						</p>
					</form>
				</div>
			</div>
		</main>
	);
}
