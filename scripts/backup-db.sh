#!/bin/sh
# Backup database Postgres (container Docker) → file .sql.gz, simpan N hari terakhir.
# Jalankan dari root project (tempat docker-compose.yml berada).
#
# Pakai manual:   sh scripts/backup-db.sh
# Pakai via cron (harian 02:00), tambahkan di `crontab -e`:
#   0 2 * * * cd /var/www/daffa-florist && sh scripts/backup-db.sh >> /var/log/daffa-backup.log 2>&1
set -e

BACKUP_DIR="${BACKUP_DIR:-/var/backups/daffa-florist}"
KEEP_DAYS="${KEEP_DAYS:-7}"
DB_USER="${POSTGRES_USER:-daffa}"
DB_NAME="${POSTGRES_DB:-daffa_florist}"
STAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"

# -T: tanpa TTY (penting saat dijalankan via cron).
docker compose exec -T db pg_dump -U "$DB_USER" "$DB_NAME" \
	| gzip > "$BACKUP_DIR/db-$STAMP.sql.gz"

# Hapus backup lebih tua dari KEEP_DAYS hari.
find "$BACKUP_DIR" -name 'db-*.sql.gz' -mtime "+$KEEP_DAYS" -delete

echo "✓ Backup tersimpan: $BACKUP_DIR/db-$STAMP.sql.gz"
