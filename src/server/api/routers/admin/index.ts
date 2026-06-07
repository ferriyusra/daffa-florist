import { createTRPCRouter } from '@/server/api/trpc';
import { adminProductRouter } from './product';
import { adminCustomerRouter } from './customer';
import { adminOrderRouter } from './order';
import { adminGalleryRouter } from './gallery';
import { adminDeliveryAreaRouter } from './delivery-area';
import { adminPromoRouter } from './promo';

/** Namespace router admin (semua memakai `adminProcedure`). */
export const adminRouter = createTRPCRouter({
	product: adminProductRouter,
	customer: adminCustomerRouter,
	order: adminOrderRouter,
	gallery: adminGalleryRouter,
	deliveryArea: adminDeliveryAreaRouter,
	promo: adminPromoRouter,
});
