import { createTRPCRouter } from '@/server/api/trpc';
import { adminProductRouter } from './product';
import { adminCustomerRouter } from './customer';
import { adminGalleryRouter } from './gallery';
import { adminDeliveryAreaRouter } from './delivery-area';

/**
 * Namespace router admin (semua memakai `adminProcedure`). Sub-router `promo`
 * menyusul di S0.7.
 */
export const adminRouter = createTRPCRouter({
	product: adminProductRouter,
	customer: adminCustomerRouter,
	gallery: adminGalleryRouter,
	deliveryArea: adminDeliveryAreaRouter,
});
