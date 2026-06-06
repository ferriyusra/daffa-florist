'use client';

import { useState } from 'react';

type Issue = { path: PropertyKey[]; message: string };
type ParseResult<S> =
	| { success: true; data: S }
	| { success: false; error: { issues: ReadonlyArray<Issue> } };
/** Apa pun yang punya `safeParse` zod (ZodObject maupun hasil `superRefine`). */
type Parsable<S> = { safeParse: (value: unknown) => ParseResult<S> };

/**
 * State form admin reusable: nilai form + error per-field + helper. Memusatkan
 * pola yang sebelumnya diduplikasi di tiap halaman CRUD admin.
 *
 * - `set(key, value)` — perbarui satu field & hapus error field tsb.
 * - `reset(next)` — ganti seluruh form & bersihkan error (saat buka modal).
 * - `setError(key, msg)` — set error field manual (mis. CONFLICT dari server).
 * - `validate(schema, payload)` — safeParse: gagal → isi error per-field (path[0])
 *   lalu kembalikan `null`; sukses → kembalikan data ter-parse.
 */
export function useAdminForm<T extends Record<string, unknown>>(initial: T) {
	const [form, setForm] = useState<T>(initial);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

	const set = <K extends keyof T>(key: K, value: T[K]) => {
		setForm((prev) => ({ ...prev, [key]: value }));
		setFieldErrors((prev) => {
			if (!prev[key as string]) return prev;
			const next = { ...prev };
			delete next[key as string];
			return next;
		});
	};

	const reset = (next: T) => {
		setForm(next);
		setFieldErrors({});
	};

	const setError = (key: string, message: string) =>
		setFieldErrors((prev) => ({ ...prev, [key]: message }));

	const validate = <S>(schema: Parsable<S>, payload: unknown): S | null => {
		const parsed = schema.safeParse(payload);
		if (parsed.success) {
			setFieldErrors({});
			return parsed.data;
		}
		const errs: Record<string, string> = {};
		for (const issue of parsed.error.issues) {
			const k = String(issue.path[0]);
			if (k && !errs[k]) errs[k] = issue.message;
		}
		setFieldErrors(errs);
		return null;
	};

	return { form, setForm, set, reset, fieldErrors, setError, validate };
}
