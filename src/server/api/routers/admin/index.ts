import { createTRPCRouter } from '@/server/api/trpc';
import { adminProductRouter } from './product';

/**
 * Namespace router admin (semua memakai `adminProcedure`). Sub-router lain
 * (gallery, promo, customer, deliveryArea) menyusul di S0.6–S0.9.
 */
export const adminRouter = createTRPCRouter({
	product: adminProductRouter,
});
