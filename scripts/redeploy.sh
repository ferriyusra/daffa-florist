#!/bin/sh
# Redeploy di VPS: tarik kode terbaru, build ulang, restart container.
# Jalankan DARI DALAM VPS, di folder project:
#   cd ~/daffa-florist && ./scripts/redeploy.sh
#
# Atau sekali jalan dari Mac (tanpa login manual):
#   ssh ubuntu@43.129.35.36 'cd ~/daffa-florist && ./scripts/redeploy.sh'
set -e

cd "$(dirname "$0")/.."

echo "→ [1/3] Menarik kode terbaru (git pull)..."
git pull

echo "→ [2/3] Build ulang + restart container..."
docker compose up -d --build

echo "→ [3/3] Membersihkan image lama (dangling)..."
docker image prune -f >/dev/null 2>&1 || true

echo
echo "✓ Selesai. Status container:"
docker compose ps
