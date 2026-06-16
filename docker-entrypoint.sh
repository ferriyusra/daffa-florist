#!/bin/sh
set -e

# Migrasi DB dijalankan oleh service `migrate` terpisah (punya node_modules
# penuh) yang harus selesai sebelum app start — lihat docker-compose.yml.
# Image runner ramping ini hanya menjalankan server Next.js.
exec "$@"
