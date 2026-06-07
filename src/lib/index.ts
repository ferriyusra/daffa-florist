export * from './products';
export * from './rental';

// CATATAN: `./constant` SENGAJA tidak di-barrel di sini. Ia mengakses `@/env`
// (var server-only) di top-level, jadi me-barrel-nya membuat SEMUA import value
// dari `@/lib` di client menarik `@/env` → "Attempted to access a server-side
// environment variable on the client". Konsumen server impor langsung dari
// `@/lib/constant`; konstanta sewa client-safe ada di `@/lib/rental-config`.
