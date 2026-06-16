import Image from 'next/image';
import { ImageOff } from 'lucide-react';

/**
 * Gambar produk tahan-banting. `next/image` hanya menerima src valid (path
 * diawali `/` atau URL absolut). Bila src tidak valid (mis. data lama seperti
 * "testqqq"), tampilkan placeholder alih-alih crash ("URL constructor ... is
 * not a valid URL"). Selalu `fill` — parent harus `relative` + punya ukuran.
 */
export default function ProductImage({
	src,
	alt,
	sizes,
	priority = false,
	className = 'object-cover',
}: {
	src?: string | null;
	alt: string;
	sizes?: string;
	priority?: boolean;
	className?: string;
	/** Diterima untuk kompatibilitas pemanggil; komponen selalu `fill`. */
	fill?: boolean;
}) {
	const valid = typeof src === 'string' && src.startsWith('/');

	if (!valid) {
		return (
			<div
				className='absolute inset-0 flex items-center justify-center'
				style={{ background: 'var(--bg-surface)' }}>
				<ImageOff size={22} style={{ color: 'var(--text-muted)' }} />
			</div>
		);
	}

	return (
		<Image
			src={src}
			alt={alt}
			fill
			priority={priority}
			sizes={sizes}
			className={className}
		/>
	);
}
