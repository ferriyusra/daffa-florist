-- Hapus kolom Product.features — konsep "fitur" tidak relevan untuk sewa papan
-- bunga (lihat ERD; daftar inklusi/"yang termasuk" dibuang dari model produk).
ALTER TABLE "Product" DROP COLUMN "features";
