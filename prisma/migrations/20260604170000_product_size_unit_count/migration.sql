-- Ketersediaan pendekatan (a) S1.3: jumlah unit fisik per ukuran (default 1).
ALTER TABLE "ProductSize" ADD COLUMN "unitCount" INTEGER NOT NULL DEFAULT 1;
