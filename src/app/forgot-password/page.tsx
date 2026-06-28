'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { Footer, Navbar } from '@/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/trpc/react';

export default function ForgotPasswordPage() {
	return (
		<>
			<Navbar />
			<ForgotPasswordForm />
			<Footer />
		</>
	);
}

function ForgotPasswordForm() {
	const [email, setEmail] = useState('');
	const [fieldError, setFieldError] = useState('');

	const request = api.auth.requestPasswordReset.useMutation();

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setFieldError('');

		const trimmed = email.trim();
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
			setFieldError('Format email tidak valid.');
			return;
		}
		request.mutate({ email: trimmed });
	};

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
					<div
						className='px-8 py-8 text-center border-b border-[var(--border)]'
						style={{ background: 'rgba(157, 23, 77, 0.05)' }}>
						<h1 className='font-serif text-2xl sm:text-3xl font-bold mb-2'>
							Lupa Password
						</h1>
						<p className='text-sm' style={{ color: 'var(--text-secondary)' }}>
							Masukkan email akun Anda. Kami akan mengirim tautan untuk
							mengatur ulang password.
						</p>
					</div>

					{request.isSuccess ? (
						<div className='p-8 text-center'>
							<div
								className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full'
								style={{
									background: 'rgba(61, 107, 79, 0.1)',
									color: 'var(--secondary)',
								}}>
								<CheckCircle2 size={24} />
							</div>
							<p
								className='text-sm mb-6'
								style={{ color: 'var(--text-secondary)' }}>
								{request.data?.message} Jangan lupa periksa folder spam jika
								email tidak muncul dalam beberapa menit.
							</p>
							<Link href='/login'>
								<Button className='w-full h-11 rounded-full'>
									Kembali ke Masuk
								</Button>
							</Link>
						</div>
					) : (
						<form onSubmit={handleSubmit} noValidate className='p-8 space-y-5'>
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
										onChange={(e) => {
											setEmail(e.target.value);
											setFieldError('');
										}}
										placeholder='nama@email.com'
										aria-invalid={!!fieldError}
										className='h-11 pl-10 pr-4'
									/>
								</div>
								{fieldError && (
									<p
										className='mt-1.5 text-xs'
										style={{ color: 'var(--destructive)' }}>
										{fieldError}
									</p>
								)}
							</div>

							{request.isError && (
								<div
									role='alert'
									className='flex items-center gap-2 text-sm rounded-xl px-4 py-3'
									style={{
										background:
											'color-mix(in srgb, var(--destructive) 8%, transparent)',
										color: 'var(--destructive)',
									}}>
									<AlertCircle size={16} className='shrink-0' />
									{request.error.message}
								</div>
							)}

							<Button
								type='submit'
								disabled={request.isPending}
								className='w-full h-11 rounded-full'>
								{request.isPending ? 'Mengirim...' : 'Kirim Tautan Reset'}
							</Button>

							<p
								className='text-center text-sm'
								style={{ color: 'var(--text-secondary)' }}>
								Ingat password Anda?{' '}
								<Link
									href='/login'
									className='font-medium transition-colors'
									style={{ color: 'var(--primary)' }}>
									Masuk di sini
								</Link>
							</p>
						</form>
					)}
				</div>
			</div>
		</main>
	);
}
