import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Link,
	Preview,
	Section,
	Text,
} from '@react-email/components';

/**
 * Template email reset password (Bahasa Indonesia). Warna mengikuti brand
 * Daffa Florist: blush `#9D174D`, sage `#3D6B4F`, gold `#8B6914`. Semua gaya
 * inline agar tahan terhadap klien email. Di-render via `sendEmail`
 * ([@/lib/email](../lib/email.ts)).
 */
type ResetPasswordEmailProps = {
	resetUrl: string;
	name?: string;
};

const main = {
	backgroundColor: '#faf7f5',
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

const container = {
	margin: '0 auto',
	padding: '32px 24px',
	maxWidth: '480px',
};

const card = {
	backgroundColor: '#ffffff',
	borderRadius: '16px',
	border: '1px solid #f0e6ea',
	padding: '32px',
};

const heading = {
	color: '#9D174D',
	fontSize: '22px',
	fontWeight: '700',
	margin: '0 0 16px',
};

const paragraph = {
	color: '#4a4a4a',
	fontSize: '15px',
	lineHeight: '24px',
	margin: '0 0 16px',
};

const buttonWrap = {
	textAlign: 'center' as const,
	margin: '28px 0',
};

const button = {
	backgroundColor: '#9D174D',
	borderRadius: '9999px',
	color: '#ffffff',
	fontSize: '15px',
	fontWeight: '600',
	textDecoration: 'none',
	padding: '12px 32px',
	display: 'inline-block',
};

const link = {
	color: '#3D6B4F',
	fontSize: '13px',
	wordBreak: 'break-all' as const,
};

const muted = {
	color: '#8a8a8a',
	fontSize: '13px',
	lineHeight: '20px',
	margin: '0',
};

const hr = {
	borderColor: '#f0e6ea',
	margin: '24px 0',
};

const brand = {
	color: '#8B6914',
	fontSize: '13px',
	fontWeight: '600',
	textAlign: 'center' as const,
	margin: '16px 0 0',
};

export function ResetPasswordEmail({ resetUrl, name }: ResetPasswordEmailProps) {
	return (
		<Html lang='id'>
			<Head />
			<Preview>Atur ulang password akun Daffa Florist Anda</Preview>
			<Body style={main}>
				<Container style={container}>
					<Section style={card}>
						<Heading style={heading}>Atur ulang password</Heading>
						<Text style={paragraph}>
							Halo{name ? ` ${name}` : ''}, kami menerima permintaan untuk
							mengatur ulang password akun Daffa Florist Anda. Klik tombol di
							bawah untuk membuat password baru.
						</Text>

						<Section style={buttonWrap}>
							<Link href={resetUrl} style={button}>
								Buat Password Baru
							</Link>
						</Section>

						<Text style={paragraph}>
							Atau salin tautan ini ke browser Anda:
						</Text>
						<Link href={resetUrl} style={link}>
							{resetUrl}
						</Link>

						<Hr style={hr} />

						<Text style={muted}>
							Tautan ini hanya berlaku 1 jam dan hanya bisa dipakai sekali. Jika
							Anda tidak meminta reset password, abaikan email ini — password
							Anda tidak akan berubah.
						</Text>

						<Text style={brand}>Daffa Florist</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

export default ResetPasswordEmail;
