-- Rental foundation (S1.1 + S1.2)
-- Sumber: docs/PRD-papan-bunga-sewa.md §7, docs/ERD-papan-bunga-sewa.md
--
-- S1.1 — siklus status sewa (PENDING→CONFIRMED→SCHEDULED→INSTALLED→PICKED_UP→RETURNED→COMPLETED).
-- S1.2 — field sewa pada Order, periode sewa pada OrderItem, index untuk query jadwal/ketersediaan.
--
-- Migrasi ini ditulis tahan-data: aman dijalankan pada DB yang sudah berisi pesanan
-- model jual-putus lama. Pada DB dev yang kosong, statement UPDATE/mapping menjadi no-op.

-- AlterEnum: ganti OrderStatus jual-putus → siklus sewa, petakan nilai lama yang dihapus.
--   PROCESSING → CONFIRMED, SHIPPED → INSTALLED, DELIVERED → COMPLETED
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'SCHEDULED', 'INSTALLED', 'PICKED_UP', 'RETURNED', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING (
  CASE "status"::text
    WHEN 'PROCESSING' THEN 'CONFIRMED'
    WHEN 'SHIPPED'    THEN 'INSTALLED'
    WHEN 'DELIVERED'  THEN 'COMPLETED'
    ELSE "status"::text
  END::"OrderStatus_new"
);
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropIndex: index productId tunggal digantikan index komposit (productId, installDate, pickupDate).
DROP INDEX "OrderItem_productId_idx";

-- AlterTable: field sewa pada Order. Semua kolom punya default / nullable → aman pada baris lama.
ALTER TABLE "Order" ADD COLUMN     "depositRefunded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "discount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "eventDate" TIMESTAMP(3),
ADD COLUMN     "rentalDeposit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shippingProvider" TEXT,
ADD COLUMN     "shippingService" TEXT,
ADD COLUMN     "trackingNumber" TEXT;

-- AlterTable: periode sewa pada OrderItem.
-- installDate/rentalDays/pickupDate bersifat wajib (NOT NULL). Untuk baris lama yang belum
-- punya periode, tambahkan nullable → backfill placeholder → baru jadikan NOT NULL.
ALTER TABLE "OrderItem" ADD COLUMN "installDate" TIMESTAMP(3);
ALTER TABLE "OrderItem" ADD COLUMN "rentalDays" INTEGER;
ALTER TABLE "OrderItem" ADD COLUMN "pickupDate" TIMESTAMP(3);
ALTER TABLE "OrderItem" ADD COLUMN "unitId" TEXT;

UPDATE "OrderItem" SET "installDate" = CURRENT_TIMESTAMP WHERE "installDate" IS NULL;
UPDATE "OrderItem" SET "rentalDays" = 1 WHERE "rentalDays" IS NULL;
UPDATE "OrderItem" SET "pickupDate" = "installDate" + INTERVAL '1 day' WHERE "pickupDate" IS NULL;

ALTER TABLE "OrderItem" ALTER COLUMN "installDate" SET NOT NULL;
ALTER TABLE "OrderItem" ALTER COLUMN "rentalDays" SET NOT NULL;
ALTER TABLE "OrderItem" ALTER COLUMN "pickupDate" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Order_eventDate_idx" ON "Order"("eventDate");

-- CreateIndex
CREATE INDEX "OrderItem_productId_installDate_pickupDate_idx" ON "OrderItem"("productId", "installDate", "pickupDate");

-- CreateIndex
CREATE INDEX "OrderItem_installDate_idx" ON "OrderItem"("installDate");

-- CreateIndex
CREATE INDEX "OrderItem_pickupDate_idx" ON "OrderItem"("pickupDate");

-- CreateIndex
CREATE INDEX "OrderItem_unitId_idx" ON "OrderItem"("unitId");
