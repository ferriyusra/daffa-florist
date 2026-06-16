-- Hapus konsep deposit dari Order (di luar lingkup produk).
-- Kolom belum dipakai logika apa pun & belum ada data order, jadi aman di-drop.
ALTER TABLE "Order" DROP COLUMN "rentalDeposit";
ALTER TABLE "Order" DROP COLUMN "depositRefunded";
