import { createTRPCRouter } from '@/server/api/trpc';
import { adminProductRouter } from './product';
import { adminCustomerRouter } from './customer';
import { adminOrderRouter } from './order';
import { adminGalleryRouter } from './gallery';
import { adminDeliveryAreaRouter } from './delivery-area';
import { adminPromoRouter } from './promo';
import { adminDashboardRouter } from './dashboard';
import { adminCalendarRouter } from './calendar';

/** Namespace router admin (semua memakai `adminProcedure`). */
export const adminRouter = createTRPCRouter({
	dashboard: adminDashboardRouter,
	product: adminProductRouter,
	customer: adminCustomerRouter,
	order: adminOrderRouter,
	calendar: adminCalendarRouter,
	gallery: adminGalleryRouter,
	deliveryArea: adminDeliveryAreaRouter,
	promo: adminPromoRouter,
});
