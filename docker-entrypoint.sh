#!/bin/sh
set -e

# Jalankan migration database sebelum aplikasi start.
# Panggil entry asli Prisma CLI (build/index.js), BUKAN lewat .bin/prisma:
# Docker men-dereference symlink .bin/prisma jadi file biasa di .bin/, sehingga
# CLI mencari *.wasm di .bin/ (salah). Dari build/, wasm di sampingnya ketemu.
echo "→ Menjalankan prisma migrate deploy..."
node node_modules/prisma/build/index.js migrate deploy

# Jalankan command utama (default: node server.js).
exec "$@"
