#!/bin/sh
set -e

# Jalankan migration database sebelum aplikasi start.
echo "→ Menjalankan prisma migrate deploy..."
node_modules/.bin/prisma migrate deploy

# Jalankan command utama (default: node server.js).
exec "$@"
