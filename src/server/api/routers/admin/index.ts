import { createTRPCRouter } from '@/server/api/trpc';
import { adminProductRouter } from './product';
import { adminCustomerRouter } from './customer';
import { adminGalleryRouter } from './gallery';

/**
 * Namespace router admin (semua memakai `adminProcedure`). Sub-router lain
 * (promo, deliveryArea) menyusul di S0.7 & S0.9.
 */
export const adminRouter = createTRPCRouter({
	product: adminProductRouter,
	customer: adminCustomerRouter,
	gallery: adminGalleryRouter,
});
