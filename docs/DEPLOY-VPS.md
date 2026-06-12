# Panduan Deploy ke VPS (PM2 + Nginx + Postgres)

Panduan ini mengasumsikan VPS Ubuntu 22.04/24.04 dan domain sudah diarahkan ke IP VPS.
Aplikasi: Next.js 16 + Prisma + Postgres, dijalankan dengan PM2 di belakang Nginx.

---

## 0. Persiapan sebelum mulai

- Punya **VPS** (mis. DigitalOcean, Contabo, Hostinger) + IP publik.
- Punya **domain** (opsional tapi disarankan), arahkan A record → IP VPS.
- Akses **SSH** ke VPS.

```bash
ssh root@IP_VPS
```

---

## 1. Buat user non-root (keamanan)

Jangan jalankan app sebagai root.

```bash
adduser deploy
usermod -aG sudo deploy
# salin ssh key agar bisa login sebagai deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
su - deploy
```

Selanjutnya semua langkah dilakukan sebagai user `deploy`.

---

## 2. Update sistem & tools dasar

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ufw
```

---

## 3. Install Node.js 22 (via nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
node -v   # harus v22.x
```

---

## 4. Install & siapkan PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

Buat database + user aplikasi:

```bash
sudo -u postgres psql
```

Di dalam prompt psql:

```sql
CREATE DATABASE daffa_florist;
CREATE USER daffa WITH ENCRYPTED PASSWORD 'GANTI_PASSWORD_KUAT';
GRANT ALL PRIVILEGES ON DATABASE daffa_florist TO daffa;
\c daffa_florist
GRANT ALL ON SCHEMA public TO daffa;
\q
```

`DATABASE_URL` nanti:
`postgresql://daffa:GANTI_PASSWORD_KUAT@localhost:5432/daffa_florist`

---

## 5. Clone project

```bash
cd ~
git clone https://github.com/USER/daffa-florist.git
cd daffa-florist
```

---

## 6. Buat file `.env` (production)

```bash
nano .env
```

Isi:

```
DATABASE_URL=postgresql://daffa:GANTI_PASSWORD_KUAT@localhost:5432/daffa_florist
NEXTAUTH_SECRET=__GENERATE__
NEXTAUTH_URL=https://domainkamu.com
NODE_ENV=production
```

Generate secret:

```bash
openssl rand -base64 32
```

Tempel hasilnya ke `NEXTAUTH_SECRET`.

---

## 7. Install dependency, migrate, build

```bash
npm ci                      # install + prisma generate (postinstall)
npm run migrate:deploy      # apply migrations ke DB
npm run prisma:seed         # (opsional) isi data awal
npm run build               # build Next.js
```

---

## 8. Jalankan dengan PM2

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save                    # simpan daftar proses
pm2 startup                 # auto-start saat reboot — jalankan perintah yg dia print
```

Cek status:

```bash
pm2 status
pm2 logs daffa-florist
```

App sekarang jalan di `http://localhost:3000` (belum bisa diakses publik — lanjut Nginx).

---

## 9. Pasang Nginx sebagai reverse proxy

```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/daffa-florist
```

Isi:

```nginx
server {
    listen 80;
    server_name domainkamu.com www.domainkamu.com;

    client_max_body_size 10M;   # untuk upload gambar

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktifkan:

```bash
sudo ln -s /etc/nginx/sites-available/daffa-florist /etc/nginx/sites-enabled/
sudo nginx -t          # test config
sudo systemctl reload nginx
```

---

## 10. Pasang SSL (HTTPS) gratis via Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d domainkamu.com -d www.domainkamu.com
```

Certbot otomatis edit config Nginx + auto-renew. Pilih opsi redirect HTTP→HTTPS.

---

## 11. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

Port 3000 TIDAK perlu dibuka ke publik (hanya diakses Nginx via localhost).

---

## ✅ Selesai

Buka `https://domainkamu.com` — aplikasi sudah live.

---

## Update aplikasi (deploy versi baru)

Setiap ada perubahan kode:

```bash
cd ~/daffa-florist
git pull
npm run release   # migrate deploy + build + pm2 reload
```

---

## Troubleshooting cepat

| Masalah | Cek |
|---|---|
| App tidak jalan | `pm2 logs daffa-florist` |
| 502 Bad Gateway | App mati / port salah → `pm2 status`, cek port 3000 |
| Error DB | `DATABASE_URL` di `.env` benar? Postgres jalan? `sudo systemctl status postgresql` |
| Env validation gagal | `NEXTAUTH_SECRET` kosong saat `NODE_ENV=production` |
| Upload hilang | Folder `public/uploads` harus tetap ada & tidak terhapus saat deploy |
| Perubahan env tidak kebaca | `pm2 reload ecosystem.config.js --update-env` |

---

## Catatan

- **Backup DB** rutin: `pg_dump -U daffa daffa_florist > backup.sql`
- **Folder upload** (`public/uploads`) ada di disk VPS — jangan kehapus saat `git pull` (sudah di-gitignore, aman).
- Pakai PM2 **atau** Docker, tidak perlu dua-duanya. Panduan ini jalur PM2.
