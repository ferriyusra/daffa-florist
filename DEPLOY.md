# Deploy ke VPS (Docker + Caddy)

Panduan deploy Daffa Florist dari VPS kosong sampai live dengan HTTPS.
Stack jalan penuh di Docker: **app (Next.js) + db (Postgres) + caddy (HTTPS otomatis)**.

## Yang perlu dibeli

1. **VPS** — Ubuntu 22.04/24.04, **minimal 2GB RAM** (1GB bisa kehabisan memori saat build).
2. **Domain** — registrar mana pun.

Sisanya (Postgres, SSL, runtime) gratis di dalam Docker.

---

## 1. Arahkan domain ke VPS

Di panel DNS registrar, buat **A record**:

| Type | Name | Value          |
| ---- | ---- | -------------- |
| A    | @    | <IP-VPS-kamu>  |
| A    | www  | <IP-VPS-kamu>  |

Tunggu propagasi (cek: `ping domainmu.com` mengarah ke IP VPS).

## 2. Siapkan VPS

SSH ke VPS, lalu install Docker:

```bash
curl -fsSL https://get.docker.com | sh
```

(Opsional, disarankan) aktifkan firewall — hanya buka SSH + web:

```bash
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable
```

> Port database (5432) **tidak** dibuka ke internet — sudah dibatasi ke localhost di `docker-compose.yml`.

## 3. Ambil kode

```bash
git clone <URL-REPO> /var/www/daffa-florist
cd /var/www/daffa-florist
```

## 4. Buat file `.env`

```bash
cp .env.production.example .env
nano .env
```

Isi:

- `DOMAIN` → `domainmu.com`
- `NEXTAUTH_URL` → `https://domainmu.com`
- `NEXTAUTH_SECRET` → hasil dari `openssl rand -base64 32`
- `POSTGRES_PASSWORD` → password kuat

## 5. Jalankan

```bash
docker compose up -d --build
```

Yang terjadi otomatis:

- Image app di-build (Next.js standalone).
- Postgres nyala, app menunggu DB siap.
- `prisma migrate deploy` jalan → skema database terbentuk.
- Caddy ambil sertifikat HTTPS dari Let's Encrypt untuk domainmu.

Cek status: `docker compose ps` dan `docker compose logs -f app`.

Buka **https://domainmu.com** ✅

## 6. Isi data awal (sekali)

Migrasi hanya membuat **skema** — database masih kosong (belum ada produk/admin).
Jalankan seeder lewat Docker (tidak perlu Node di host):

```bash
docker compose --profile seed run --rm seed
```

Mengisi: produk katalog, akun admin (`admin@daffaflorist.test` / `password123`),
zona ongkir, dan promo contoh. **Segera ganti password admin** setelah login.

> ⚠️ **Destruktif** — seed menghapus order/user/product lalu mengisi ulang.
> Jalankan **hanya saat setup awal**, jangan pada database yang sudah berisi data asli.

---

## Update aplikasi (deploy ulang)

Cara cepat — pakai script (`git pull` → build → restart → bersihkan image lama):

```bash
cd ~/daffa-florist
./scripts/redeploy.sh
```

Atau sekali-jalan dari Mac (tanpa login manual):

```bash
ssh ubuntu@<IP-VPS> 'cd ~/daffa-florist && ./scripts/redeploy.sh'
```

Manual (kalau perlu langkah terpisah):

```bash
cd ~/daffa-florist
git pull
docker compose up -d --build
```

Migrasi baru jalan otomatis lewat service `migrate` (selesai dulu, baru `app` start).

## Update `.env` di VPS

`.env` ada **hanya di VPS** (tidak masuk git). Untuk mengubah nilai — mis. ganti
key Midtrans Sandbox → Production, ganti `NEXTAUTH_SECRET`, atau password DB:

```bash
cd ~/daffa-florist
nano .env          # ubah nilainya, simpan: Ctrl+O, Enter, Ctrl+X
docker compose up -d
```

**Penting:**

- **Wajib `docker compose up -d`** (bukan `restart`) — perintah ini me-recreate
  container yang env-nya berubah agar nilai baru terbaca. `docker compose restart`
  **tidak** membaca ulang `.env`.
- **Tidak perlu `--build`** kalau yang berubah hanya `.env` (kode tidak berubah) —
  lebih cepat.
- Ganti **`MIDTRANS_API_URL`** ke `https://api.midtrans.com` saat pindah ke key
  Production; biarkan `https://api.sandbox.midtrans.com` untuk Sandbox.
- Ubah **`POSTGRES_PASSWORD`** setelah DB pernah jalan = **tidak otomatis** mengganti
  password user di volume DB lama. Kalau benar-benar perlu, ganti lewat SQL atau
  reset volume (`docker compose down -v` — ⚠️ menghapus semua data).
- Setelah ganti **`DOMAIN`/`NEXTAUTH_URL`**, Caddy akan menerbitkan sertifikat HTTPS
  baru otomatis (pastikan DNS domain baru sudah mengarah ke VPS).

## Backup database otomatis

Jadwalkan backup harian. Edit cron: `crontab -e`, tambahkan:

```cron
0 2 * * * cd /var/www/daffa-florist && sh scripts/backup-db.sh >> /var/log/daffa-backup.log 2>&1
```

Backup tersimpan di `/var/backups/daffa-florist/`, otomatis hapus yang >7 hari.
Restore: `gunzip -c db-XXXX.sql.gz | docker compose exec -T db psql -U daffa daffa_florist`.

## Ringkasan perintah

| Tujuan                      | Perintah                                                              |
| --------------------------- | -------------------------------------------------------------------- |
| Konek ke VPS                | `ssh ubuntu@<IP-VPS>`                                                 |
| Deploy update (di VPS)      | `cd ~/daffa-florist && ./scripts/redeploy.sh`                        |
| Deploy update (dari Mac)    | `ssh ubuntu@<IP-VPS> 'cd ~/daffa-florist && ./scripts/redeploy.sh'`  |
| Update `.env` lalu terapkan | `nano .env` → `docker compose up -d`                                  |
| Cek status container        | `docker compose ps`                                                  |
| Lihat log app               | `docker compose logs app --tail=30`                                  |
| Lihat log migrasi           | `docker compose logs migrate`                                        |
| Seed data awal (sekali)     | `docker compose --profile seed run --rm seed`                       |
| Backup DB manual            | `sh scripts/backup-db.sh`                                            |
| Stop semua (data aman)      | `docker compose down`                                               |
| Stop + **hapus data DB**    | `docker compose down -v`  ⚠️                                          |

## Troubleshooting

| Masalah                          | Penyebab / solusi                                                              |
| -------------------------------- | ------------------------------------------------------------------------------ |
| Container `app` restart terus    | `NEXTAUTH_SECRET` kosong di `.env`. Isi lalu `docker compose up -d`.            |
| HTTPS gagal / sertifikat error   | DNS belum mengarah ke VPS, atau port 80/443 ketutup firewall.                  |
| Login admin error `UntrustedHost`| Pastikan pakai image hasil build terbaru (sudah ada `trustHost: true`).        |
| Build OOM / terbunuh             | RAM kurang. Pakai VPS ≥2GB atau tambah swap.                                    |
| Katalog kosong                   | Belum di-seed — jalankan langkah 6.                                             |
