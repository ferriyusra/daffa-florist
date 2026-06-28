import 'server-only';

import { render } from '@react-email/components';
import type { ReactElement } from 'react';
import { Resend } from 'resend';

import { env } from '@/env';

/**
 * Pengirim email transaksional via Resend. Server-only (mengakses `@/env`),
 * jadi JANGAN di-barrel di `@/lib/index.ts`. Resend diinisialisasi lazy supaya
 * app tetap boot di dev tanpa `RESEND_API_KEY` — kegagalan baru muncul saat
 * benar-benar mengirim, dan pemanggil (mis. reset password) menanganinya
 * secara senyap demi anti-enumeration.
 */
function getResend(): Resend {
	if (!env.RESEND_API_KEY) {
		throw new Error('RESEND_API_KEY belum diset; email tidak dapat dikirim.');
	}
	return new Resend(env.RESEND_API_KEY);
}

type SendEmailParams = {
	to: string;
	subject: string;
	react: ReactElement;
};

export async function sendEmail({ to, subject, react }: SendEmailParams) {
	const html = await render(react);

	const { data, error } = await getResend().emails.send({
		from: env.EMAIL_FROM,
		to,
		subject,
		html,
	});

	if (error) {
		throw new Error(`Gagal mengirim email: ${error.message}`);
	}

	return data;
}
