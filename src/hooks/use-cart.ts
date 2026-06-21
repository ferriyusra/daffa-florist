'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'daffa_cart';
const CART_EVENT = 'daffa-cart-change';

/** Batas total unit (jumlah seluruh qty) yang boleh ada di keranjang. */
export const MAX_CART_UNITS = 10;

export type AddItemResult =
	| { ok: true }
	| { ok: false; reason: 'limit'; remaining: number };

export type CartItem = {
	id: string; // cartId — kini ikut menyandi periode (lihat product-detail-client)
	productId: string;
	slug: string;
	title: string;
	image: string;
	sizeLabel: string;
	price: number; // harga satuan (ukuran + addon), sudah dihitung
	priceLabel: string;
	quantity: number;
	// CATATAN serialisasi: localStorage hanya menyimpan string → `Date` tidak bisa
	// dipertahankan (JSON.parse tak menghidupkan Date). installDate DISIMPAN sebagai
	// ISO string dari Date tengah-malam UTC (basis date-only). Pemakai mem-`new Date(installDate)`.
	installDate: string;
	rentalDays: number;
	designTemplateName?: string;
	themeColorName?: string;
	addonNames: string[];
};

export type AddCartInput = Omit<CartItem, 'quantity'>;

/**
 * Item dianggap VALID hanya bila punya semua field sewa yang dibutuhkan
 * `createRental`. Cart lama (shape pra-S2.5, tanpa productId/installDate/
 * rentalDays) dibuang saat read agar tak ikut ter-submit & memicu error server
 * yang membingungkan.
 */
function isValidItem(i: unknown): i is CartItem {
	if (!i || typeof i !== 'object') return false;
	const o = i as Record<string, unknown>;
	return (
		typeof o.id === 'string' &&
		typeof o.productId === 'string' &&
		o.productId !== '' &&
		typeof o.sizeLabel === 'string' &&
		typeof o.installDate === 'string' &&
		o.installDate !== '' &&
		typeof o.rentalDays === 'number' &&
		typeof o.price === 'number' &&
		typeof o.quantity === 'number' &&
		Array.isArray(o.addonNames)
	);
}

function readCart(): CartItem[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.filter(isValidItem) : [];
	} catch {
		return [];
	}
}

function writeCart(next: CartItem[]) {
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	window.dispatchEvent(new Event(CART_EVENT));
}

export function useCart() {
	const [items, setItems] = useState<CartItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setItems(readCart());
		setIsLoading(false);

		const sync = () => setItems(readCart());
		const onStorage = (e: StorageEvent) => {
			if (e.key === STORAGE_KEY) sync();
		};
		window.addEventListener('storage', onStorage);
		window.addEventListener(CART_EVENT, sync);
		return () => {
			window.removeEventListener('storage', onStorage);
			window.removeEventListener(CART_EVENT, sync);
		};
	}, []);

	const addItem = useCallback(
		(item: AddCartInput, quantity = 1): AddItemResult => {
			const current = readCart();
			// Batas berdasarkan TOTAL unit (jumlah semua qty), bukan jumlah jenis.
			const currentUnits = current.reduce((sum, i) => sum + i.quantity, 0);
			if (currentUnits + quantity > MAX_CART_UNITS) {
				return {
					ok: false,
					reason: 'limit',
					remaining: Math.max(0, MAX_CART_UNITS - currentUnits),
				};
			}
			const idx = current.findIndex((i) => i.id === item.id);
			const next =
				idx >= 0
					? current.map((i, n) =>
							n === idx ? { ...i, quantity: i.quantity + quantity } : i,
						)
					: [...current, { ...item, quantity }];
			writeCart(next);
			setItems(next);
			return { ok: true };
		},
		[],
	);

	const removeItem = useCallback((id: string) => {
		const next = readCart().filter((i) => i.id !== id);
		writeCart(next);
		setItems(next);
	}, []);

	const updateQuantity = useCallback((id: string, quantity: number) => {
		const next =
			quantity <= 0
				? readCart().filter((i) => i.id !== id)
				: readCart().map((i) => (i.id === id ? { ...i, quantity } : i));
		writeCart(next);
		setItems(next);
	}, []);

	const clear = useCallback(() => {
		writeCart([]);
		setItems([]);
	}, []);

	const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
	const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

	return {
		items,
		isLoading,
		addItem,
		removeItem,
		updateQuantity,
		clear,
		totalItems,
		subtotal,
	};
}

export function parsePriceFromLabel(label: string): number {
	const digits = label.replace(/[^\d]/g, '');
	return digits ? Number.parseInt(digits, 10) : 0;
}

export function formatRupiah(amount: number): string {
	return `Rp ${amount.toLocaleString('id-ID')}`;
}
