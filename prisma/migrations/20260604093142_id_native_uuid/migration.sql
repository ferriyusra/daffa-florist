-- Ubah kolom id & foreign key dari text → uuid native (@db.Uuid).
-- Non-destruktif: nilai sudah ber-format UUID, jadi di-cast di tempat (USING ::uuid)
-- alih-alih drop/add kolom (yang akan menghapus data & gagal pada NOT NULL).

-- 1) Lepas semua foreign key (tipe kolom referensi & FK harus dialter dulu).
ALTER TABLE "Address" DROP CONSTRAINT "Address_userId_fkey";
ALTER TABLE "Order" DROP CONSTRAINT "Order_addressId_fkey";
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";
ALTER TABLE "ProductAddon" DROP CONSTRAINT "ProductAddon_productId_fkey";
ALTER TABLE "ProductSize" DROP CONSTRAINT "ProductSize_productId_fkey";
ALTER TABLE "ProductTemplate" DROP CONSTRAINT "ProductTemplate_productId_fkey";
ALTER TABLE "ProductThemeColor" DROP CONSTRAINT "ProductThemeColor_productId_fkey";

-- 2) Alter tipe kolom (cast di tempat — data dipertahankan, index/PK ikut ter-rebuild).
ALTER TABLE "User" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "Address" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "Address" ALTER COLUMN "userId" TYPE UUID USING "userId"::uuid;
ALTER TABLE "Product" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "ProductSize" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "ProductSize" ALTER COLUMN "productId" TYPE UUID USING "productId"::uuid;
ALTER TABLE "ProductTemplate" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "ProductTemplate" ALTER COLUMN "productId" TYPE UUID USING "productId"::uuid;
ALTER TABLE "ProductThemeColor" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "ProductThemeColor" ALTER COLUMN "productId" TYPE UUID USING "productId"::uuid;
ALTER TABLE "ProductAddon" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "ProductAddon" ALTER COLUMN "productId" TYPE UUID USING "productId"::uuid;
ALTER TABLE "Order" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "Order" ALTER COLUMN "userId" TYPE UUID USING "userId"::uuid;
ALTER TABLE "Order" ALTER COLUMN "addressId" TYPE UUID USING "addressId"::uuid;
ALTER TABLE "OrderItem" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "OrderItem" ALTER COLUMN "orderId" TYPE UUID USING "orderId"::uuid;
ALTER TABLE "OrderItem" ALTER COLUMN "productId" TYPE UUID USING "productId"::uuid;
ALTER TABLE "OrderItem" ALTER COLUMN "unitId" TYPE UUID USING "unitId"::uuid;

-- 3) Pasang kembali foreign key.
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductSize" ADD CONSTRAINT "ProductSize_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductTemplate" ADD CONSTRAINT "ProductTemplate_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductThemeColor" ADD CONSTRAINT "ProductThemeColor_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductAddon" ADD CONSTRAINT "ProductAddon_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
