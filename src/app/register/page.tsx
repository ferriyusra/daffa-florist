'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { Footer, Navbar } from '@/components';
import { api } from '@/trpc/react';

export default function RegisterPage() {
	return (
		<>
			<Navbar />
			<Suspense fallback={null}>
				<RegisterForm />
			</Suspense>
			<Footer />
		</>
	);
}

function RegisterForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');

	const redirectTo = searchParams.get('redirect') ?? '/';

	const register = api.auth.register.useMutation({
		onSuccess: () => {
			const query = new URLSearchParams();
			query.set('registered', '1');
			if (redirectTo !== '/') query.set('redirect', redirectTo);
			router.push(`/login?${query.toString()}`);
		},
		onError: (err) => {
			setError(err.message);
		},
	});

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError('');

		if (password !== confirmPassword) {
			setError('Password dan konfirmasi password tidak cocok.');
			return;
		}

		register.mutate({ name, email, phone, password });
	};

	return (
		<main className='floral-bg flex items-center justify-center px-6 py-16 min-h-[70vh]'>
			<div className='w-full max-w-[480px]'>
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
							Daftar Akun
						</h1>
						<p
							className='text-sm'
							style={{ color: 'var(--text-secondary)' }}>
							Buat akun untuk mempermudah pemesanan papan bunga Anda.
						</p>
					</div>

					<form onSubmit={handleSubmit} className='p-8 space-y-5'>
						<div>
							<label
								htmlFor='name'
								className='block text-sm font-medium mb-2'>
								Nama Lengkap
							</label>
							<div className='relative'>
								<User
									size={16}
									className='absolute left-3 top-1/2 -translate-y-1/2'
									style={{ color: 'var(--text-muted)' }}
								/>
								<input
									id='name'
									type='text'
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder='Nama Anda'
									className='w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors'
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor='email'
								className='block text-sm font-medium mb-2'>
								Email
							</label>
							<div className='relative'>
								<Mail
									size={16}
									className='absolute left-3 top-1/2 -translate-y-1/2'
									style={{ color: 'var(--text-muted)' }}
								/>
								<input
									id='email'
									type='email'
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder='nama@email.com'
									className='w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors'
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor='phone'
								className='block text-sm font-medium mb-2'>
								Nomor WhatsApp
							</label>
							<div className='relative'>
								<Phone
									size={16}
									className='absolute left-3 top-1/2 -translate-y-1/2'
									style={{ color: 'var(--text-muted)' }}
								/>
								<input
									id='phone'
									type='tel'
									required
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									placeholder='08xxxxxxxxxx'
									className='w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors'
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor='password'
								className='block text-sm font-medium mb-2'>
								Password
							</label>
							<div className='relative'>
								<Lock
									size={16}
									className='absolute left-3 top-1/2 -translate-y-1/2'
									style={{ color: 'var(--text-muted)' }}
								/>
								<input
									id='password'
									type={showPassword ? 'text' : 'password'}
									required
									minLength={6}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder='Minimal 6 karakter'
									className='w-full pl-10 pr-10 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors'
								/>
								<button
									type='button'
									onClick={() => setShowPassword(!showPassword)}
									className='absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer'
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

						<div>
							<label
								htmlFor='confirmPassword'
								className='block text-sm font-medium mb-2'>
								Konfirmasi Password
							</label>
							<div className='relative'>
								<Lock
									size={16}
									className='absolute left-3 top-1/2 -translate-y-1/2'
									style={{ color: 'var(--text-muted)' }}
								/>
								<input
									id='confirmPassword'
									type={showPassword ? 'text' : 'password'}
									required
									minLength={6}
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									placeholder='Ulangi password'
									className='w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors'
								/>
							</div>
						</div>

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

						<button
							type='submit'
							disabled={register.isPending}
							className='w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-white transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed'
							style={{ background: 'var(--primary)' }}>
							{register.isPending ? 'Memproses...' : 'Daftar Sekarang'}
						</button>

						<p
							className='text-center text-sm'
							style={{ color: 'var(--text-secondary)' }}>
							Sudah punya akun?{' '}
							<Link
								href={{
									pathname: '/login',
									query: redirectTo !== '/' ? { redirect: redirectTo } : {},
								}}
								className='font-medium transition-colors'
								style={{ color: 'var(--primary)' }}>
								Masuk di sini
							</Link>
						</p>
					</form>
				</div>
			</div>
		</main>
	);
}
