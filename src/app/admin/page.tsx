/**
 * Dashboard admin — sengaja dikosongkan dulu (blank page) sampai konten/ringkasan
 * yang akan ditampilkan ditentukan.
 */
export default function AdminDashboardPage() {
	return (
		<div
			className='flex items-center justify-center rounded-2xl border border-[var(--border)] min-h-[60vh]'
			style={{ background: 'var(--bg-card)' }}>
			<p className='text-sm' style={{ color: 'var(--text-muted)' }}>
				Halaman dashboard masih kosong.
			</p>
		</div>
	);
}
