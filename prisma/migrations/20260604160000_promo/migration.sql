-- CRUD Promo/diskon (S0.7): kode promo + tipe diskon (%/nominal) + periode aktif.
CREATE TYPE "PromoType" AS ENUM ('PERCENT', 'AMOUNT');

CREATE TABLE "Promo" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" "PromoType" NOT NULL,
    "value" INTEGER NOT NULL,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Promo_code_key" ON "Promo"("code");
CREATE INDEX "Promo_isActive_idx" ON "Promo"("isActive");
