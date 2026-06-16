-- Akun pengguna bisa dinonaktifkan admin (blokir login). Default aktif.
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
