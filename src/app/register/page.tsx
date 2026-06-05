'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
	AlertCircle,
	ArrowLeft,
	Eye,
	EyeOff,
	Mail,
	Lock,
	User,
	Phone,
} from 'lucide-react';
import { Footer, Navbar } from '@/components';
import { api } from '@/trpc/react';
import { registerFields } from '@/lib/auth-schema';

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

function Asterisk() {
	return <span style={{ color: 'var(--destructive)' }}> *</span>;
}

function FieldError({ msg }: { msg?: string }) {
	if (!msg) return null;
	return (
		<p className='mt-1.5 text-xs' style={{ color: 'var(--destructive)' }}>
			{msg}
		</p>
	);
}

const inputBase =
	'w-full pl-10 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors';

function RegisterForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [formError, setFormError] = useState('');

	const redirectTo = searchParams.get('redirect') ?? '/';

	const register = api.auth.register.useMutation({
		onSuccess: () => {
			const query = new URLSearchParams();
			query.set('registered', '1');
			if (redirectTo !== '/') query.set('redirect', redirectTo);
			router.push(`/login?${query.toString()}`);
		},
		onError: (err) => {
			// Email bentrok dari server → tampilkan di field email.
			if (err.data?.code === 'CONFLICT') {
				setFieldErrors((p) => ({ ...p, email: err.message }));
			} else {
				setFormError(err.message);
			}
		},
	});

	const clearErr = (field: string) =>
		setFieldErrors((p) => {
			if (!p[field]) return p;
			const next = { ...p };
			delete next[field];
			return next;
		});

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setFormError('');

		// Validasi client dengan schema zod yang sama seperti server.
		const parsed = registerFields.safeParse({ name, email, phone, password });
		const errs: Record<string, string> = {};
		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				const key = String(issue.path[0]);
				if (key && !errs[key]) errs[key] = issue.message;
			}
		}
		if (password !== confirmPassword) {
			errs.confirmPassword = 'Konfirmasi password tidak cocok.';
		}
		if (!parsed.success || Object.keys(errs).length) {
			setFieldErrors(errs);
			return;
		}

		setFieldErrors({});
		register.mutate(parsed.data);
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
						<p className='text-sm' style={{ color: 'var(--text-secondary)' }}>
							Buat akun untuk mempermudah pemesanan papan bunga Anda.
						</p>
					</div>

					<form onSubmit={handleSubmit} className='p-8 space-y-5' noValidate>
						<div>
							<label htmlFor='name' className='block text-sm font-medium mb-2'>
								Nama Lengkap
								<Asterisk />
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
									value={name}
									onChange={(e) => {
										setName(e.target.value);
										clearErr('name');
									}}
									placeholder='Nama Anda'
									className={`${inputBase} pr-4`}
									style={{
										borderColor: fieldErrors.name
											? 'var(--destructive)'
											: undefined,
									}}
								/>
							</div>
							<FieldError msg={fieldErrors.name} />
						</div>

						<div>
							<label
								htmlFor='email'
								className='block text-sm font-medium mb-2'>
								Email
								<Asterisk />
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
									value={email}
									onChange={(e) => {
										setEmail(e.target.value);
										clearErr('email');
									}}
									placeholder='nama@email.com'
									className={`${inputBase} pr-4`}
									style={{
										borderColor: fieldErrors.email
											? 'var(--destructive)'
											: undefined,
									}}
								/>
							</div>
							<FieldError msg={fieldErrors.email} />
						</div>

						<div>
							<label
								htmlFor='phone'
								className='block text-sm font-medium mb-2'>
								Nomor WhatsApp
								<Asterisk />
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
									value={phone}
									onChange={(e) => {
										setPhone(e.target.value);
										clearErr('phone');
									}}
									placeholder='08xxxxxxxxxx'
									className={`${inputBase} pr-4`}
									style={{
										borderColor: fieldErrors.phone
											? 'var(--destructive)'
											: undefined,
									}}
								/>
							</div>
							<FieldError msg={fieldErrors.phone} />
						</div>

						<div>
							<label
								htmlFor='password'
								className='block text-sm font-medium mb-2'>
								Password
								<Asterisk />
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
									value={password}
									onChange={(e) => {
										setPassword(e.target.value);
										clearErr('password');
										clearErr('confirmPassword');
									}}
									placeholder='Minimal 6 karakter'
									className={`${inputBase} pr-10`}
									style={{
										borderColor: fieldErrors.password
											? 'var(--destructive)'
											: undefined,
									}}
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
							<FieldError msg={fieldErrors.password} />
						</div>

						<div>
							<label
								htmlFor='confirmPassword'
								className='block text-sm font-medium mb-2'>
								Konfirmasi Password
								<Asterisk />
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
									value={confirmPassword}
									onChange={(e) => {
										setConfirmPassword(e.target.value);
										clearErr('confirmPassword');
									}}
									placeholder='Ulangi password'
									className={`${inputBase} pr-4`}
									style={{
										borderColor: fieldErrors.confirmPassword
											? 'var(--destructive)'
											: undefined,
									}}
								/>
							</div>
							<FieldError msg={fieldErrors.confirmPassword} />
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
