-- CRUD Delivery-areas (S0.9): zona layanan + ongkir per zona.
CREATE TABLE "DeliveryArea" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "district" TEXT,
    "shippingCost" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryArea_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DeliveryArea_name_key" ON "DeliveryArea"("name");
CREATE INDEX "DeliveryArea_isActive_idx" ON "DeliveryArea"("isActive");
