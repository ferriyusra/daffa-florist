import {
	Body,
	Button,
	Container,
	Font,
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
 * Template email reset password (Bahasa Indonesia). Warna mengikuti brand Daffa
 * Florist: blush `#9D174D`, sage `#3D6B4F`, gold `#8B6914`, latar hangat. Bahasa
 * desain "Organic Biophilic" — sudut membulat, bayangan lembut, aksen botani via
 * warna & struktur (bukan gambar). Wordmark/judul memakai serif elegan
 * `Cormorant Infant` (web font, fallback `Georgia`) agar tetap anggun walau klien
 * memblokir font; teks isi pakai stack web-safe. Semua gaya inline (tahan klien
 * email). Di-render via `sendEmail` ([@/lib/email](../lib/email.ts)).
 */
type ResetPasswordEmailProps = {
	resetUrl: string;
	name?: string;
};

// Serif anggun untuk wordmark/judul; Georgia sbg fallback (Outlook/klien yg blokir web font).
const SERIF = "'Cormorant Infant', Georgia, 'Times New Roman', serif";
const SANS =
	"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const main = {
	backgroundColor: '#faf7f5',
	margin: '0',
	padding: '40px 0',
	fontFamily: SANS,
};

const container = {
	margin: '0 auto',
	padding: '0 16px',
	maxWidth: '480px',
	width: '100%',
};

// ── Header (di atas kartu) ──
const header = {
	textAlign: 'center' as const,
	padding: '4px 0 28px',
};

const wordmark = {
	margin: '0',
	fontFamily: SERIF,
	fontSize: '36px',
	fontWeight: '600',
	letterSpacing: '0.5px',
	lineHeight: '1.1',
	color: '#9D174D',
};

const tagline = {
	margin: '10px 0 0',
	fontSize: '10px',
	letterSpacing: '3px',
	textTransform: 'uppercase' as const,
	color: '#8B6914',
	fontWeight: '600',
};

// Aksen botani organik: titik–garis–titik bergaya emas (struktur, bukan glyph).
const ruleWrap = {
	textAlign: 'center' as const,
	padding: '18px 0 0',
	lineHeight: '1',
};

const ruleDot = {
	display: 'inline-block',
	width: '5px',
	height: '5px',
	borderRadius: '50%',
	backgroundColor: '#D4B86A',
	verticalAlign: 'middle',
};

const ruleLine = {
	display: 'inline-block',
	width: '40px',
	height: '2px',
	borderRadius: '2px',
	backgroundColor: '#D4B86A',
	verticalAlign: 'middle',
	margin: '0 10px',
};

// ── Kartu ──
const card = {
	backgroundColor: '#ffffff',
	borderRadius: '22px',
	border: '1px solid #f2e8ec',
	padding: '44px 36px 40px',
	boxShadow: '0 10px 34px rgba(157, 23, 77, 0.07), 0 2px 8px rgba(28, 25, 23, 0.04)',
};

const heading = {
	margin: '0 0 18px',
	fontFamily: SERIF,
	fontSize: '30px',
	fontWeight: '600',
	letterSpacing: '0.2px',
	lineHeight: '1.2',
	color: '#9D174D',
};

const paragraph = {
	margin: '0 0 18px',
	color: '#4a4340',
	fontSize: '15px',
	lineHeight: '1.7',
};

const buttonWrap = {
	textAlign: 'center' as const,
	padding: '26px 0 22px',
};

const button = {
	backgroundColor: '#9D174D',
	borderRadius: '9999px',
	color: '#ffffff',
	fontSize: '15px',
	fontWeight: '600',
	letterSpacing: '0.3px',
	textDecoration: 'none',
	padding: '15px 42px',
	display: 'inline-block',
	boxShadow: '0 4px 14px rgba(157, 23, 77, 0.28)',
};

const linkHelp = {
	margin: '0 0 10px',
	fontSize: '13px',
	color: '#6b635f',
	lineHeight: '1.55',
};

const linkBox = {
	margin: '0',
	padding: '14px 16px',
	border: '1px solid #ece3e7',
	borderRadius: '12px',
	backgroundColor: '#faf7f5',
};

const linkText = {
	color: '#3D6B4F',
	fontSize: '12px',
	fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
	wordBreak: 'break-all' as const,
	lineHeight: '1.55',
};

const hr = {
	borderColor: '#f2e8ec',
	margin: '30px 0',
};

// Catatan keamanan dgn aksen gold di kiri (warna + ikon-rule + teks, bukan warna saja).
const noteBox = {
	margin: '0',
	padding: '14px 18px',
	borderLeft: '3px solid #8B6914',
	borderRadius: '8px',
	backgroundColor: '#fbf7ef',
};

const noteText = {
	margin: '0',
	color: '#6f5f3f',
	fontSize: '12.5px',
	lineHeight: '1.65',
};

// ── Footer (di bawah kartu) ──
const footer = {
	textAlign: 'center' as const,
	padding: '28px 12px 4px',
};

const footerText = {
	margin: '0 0 6px',
	color: '#6f6660',
	fontSize: '12px',
	lineHeight: '1.6',
};

const footerBrand = {
	margin: '0',
	fontFamily: SERIF,
	color: '#8B6914',
	fontSize: '16px',
	fontWeight: '600',
	letterSpacing: '0.3px',
};

export function ResetPasswordEmail({ resetUrl, name }: ResetPasswordEmailProps) {
	return (
		<Html lang='id'>
			<Head>
				{/* Cormorant Infant utk wordmark/judul; fallback Georgia bila klien blokir web font. */}
				<Font
					fontFamily='Cormorant Infant'
					fallbackFontFamily='Georgia'
					webFont={{
						url: 'https://fonts.gstatic.com/s/cormorantinfant/v22/HhyCU44g9vKiM1sORYSiWeAsLN99xfs9KOOc_agJPrjxZ9WUjjhhlHSzYzs.woff2',
						format: 'woff2',
					}}
					fontWeight={600}
					fontStyle='normal'
				/>
			</Head>
			<Preview>Atur ulang password akun Daffa Florist Anda</Preview>
			<Body style={main}>
				<Container style={container}>
					<Section style={header}>
						<Text style={wordmark}>Daffa Florist</Text>
						<Text style={tagline}>Papan Bunga &amp; Karangan Bunga</Text>
						<div style={ruleWrap}>
							<span style={ruleDot} />
							<span style={ruleLine} />
							<span style={ruleDot} />
							<span style={ruleLine} />
							<span style={ruleDot} />
						</div>
					</Section>

					<Section style={card}>
						<Heading style={heading}>Atur ulang password</Heading>
						<Text style={paragraph}>
							Halo{name ? ` ${name}` : ''}, kami menerima permintaan untuk
							mengatur ulang password akun Daffa Florist Anda. Tekan tombol di
							bawah untuk membuat password baru.
						</Text>

						<Section style={buttonWrap}>
							<Button href={resetUrl} style={button}>
								Buat Password Baru
							</Button>
						</Section>

						<Text style={linkHelp}>
							Tombol tidak berfungsi? Salin &amp; tempel tautan ini ke peramban
							Anda:
						</Text>
						<Section style={linkBox}>
							<Link href={resetUrl} style={linkText}>
								{resetUrl}
							</Link>
						</Section>

						<Hr style={hr} />

						<Section style={noteBox}>
							<Text style={noteText}>
								Tautan ini hanya berlaku <strong>1 jam</strong> dan hanya bisa
								dipakai sekali. Jika Anda tidak meminta reset password, abaikan
								email ini — password Anda tetap aman dan tidak berubah.
							</Text>
						</Section>
					</Section>

					<Section style={footer}>
						<Text style={footerText}>
							Email ini dikirim otomatis — mohon jangan membalas pesan ini.
						</Text>
						<Text style={footerBrand}>
							Daffa Florist · Pasaman Barat, Sumatera Barat
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

export default ResetPasswordEmail;
