-- Hapus status PICKED_UP & RETURNED dari siklus sewa (disederhanakan).
-- Petakan data lama (bila ada) → COMPLETED, lalu buat ulang enum tanpa keduanya.
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SCHEDULED', 'INSTALLED', 'COMPLETED', 'CANCELLED');
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus" USING (
	CASE "status"::text
		WHEN 'PICKED_UP' THEN 'COMPLETED'
		WHEN 'RETURNED' THEN 'COMPLETED'
		ELSE "status"::text
	END::"OrderStatus"
);
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';
DROP TYPE "OrderStatus_old";
