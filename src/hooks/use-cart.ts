'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'daffa_cart';
const CART_EVENT = 'daffa-cart-change';

export type CartItem = {
	id: string;
	title: string;
	price: number;
	priceLabel: string;
	image: string;
	quantity: number;
};

export type AddCartInput = Omit<CartItem, 'quantity'>;

function readCart(): CartItem[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as CartItem[]) : [];
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

	const addItem = useCallback((item: AddCartInput, quantity = 1) => {
		const current = readCart();
		const idx = current.findIndex((i) => i.id === item.id);
		const next =
			idx >= 0
				? current.map((i, n) =>
						n === idx ? { ...i, quantity: i.quantity + quantity } : i,
					)
				: [...current, { ...item, quantity }];
		writeCart(next);
		setItems(next);
	}, []);

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
