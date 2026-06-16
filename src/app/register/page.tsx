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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
							<Label htmlFor='name' className='mb-2'>
								Nama Lengkap
								<Asterisk />
							</Label>
							<div className='relative'>
								<User
									size={16}
									className='absolute left-3 top-1/2 -translate-y-1/2 z-10'
									style={{ color: 'var(--text-muted)' }}
								/>
								<Input
									id='name'
									type='text'
									value={name}
									onChange={(e) => {
										setName(e.target.value);
										clearErr('name');
									}}
									placeholder='Nama Anda'
									aria-invalid={!!fieldErrors.name}
									className='h-11 pl-10 pr-4'
								/>
							</div>
							<FieldError msg={fieldErrors.name} />
						</div>

						<div>
							<Label htmlFor='email' className='mb-2'>
								Email
								<Asterisk />
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
									onChange={(e) => {
										setEmail(e.target.value);
										clearErr('email');
									}}
									placeholder='nama@email.com'
									aria-invalid={!!fieldErrors.email}
									className='h-11 pl-10 pr-4'
								/>
							</div>
							<FieldError msg={fieldErrors.email} />
						</div>

						<div>
							<Label htmlFor='phone' className='mb-2'>
								Nomor WhatsApp
								<Asterisk />
							</Label>
							<div className='relative'>
								<Phone
									size={16}
									className='absolute left-3 top-1/2 -translate-y-1/2 z-10'
									style={{ color: 'var(--text-muted)' }}
								/>
								<Input
									id='phone'
									type='tel'
									value={phone}
									onChange={(e) => {
										setPhone(e.target.value);
										clearErr('phone');
									}}
									placeholder='08xxxxxxxxxx'
									aria-invalid={!!fieldErrors.phone}
									className='h-11 pl-10 pr-4'
								/>
							</div>
							<FieldError msg={fieldErrors.phone} />
						</div>

						<div>
							<Label htmlFor='password' className='mb-2'>
								Password
								<Asterisk />
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
										clearErr('password');
										clearErr('confirmPassword');
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
							<Label htmlFor='confirmPassword' className='mb-2'>
								Konfirmasi Password
								<Asterisk />
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
										clearErr('confirmPassword');
									}}
									placeholder='Ulangi password'
									aria-invalid={!!fieldErrors.confirmPassword}
									className='h-11 pl-10 pr-4'
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

						<Button
							type='submit'
							disabled={register.isPending}
							className='w-full h-11 rounded-full'>
							{register.isPending ? 'Memproses...' : 'Daftar Sekarang'}
						</Button>

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
