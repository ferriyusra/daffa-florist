import {
	createCallerFactory,
	createTRPCRouter,
} from '@/server/api/trpc';
import { authRouter } from '@/server/api/routers/auth';
import { productRouter } from '@/server/api/routers/product';
import { orderRouter } from '@/server/api/routers/order';
import { rentalRouter } from '@/server/api/routers/rental';
import { galleryRouter } from '@/server/api/routers/gallery';
import { addressRouter } from '@/server/api/routers/address';
import { deliveryAreaRouter } from '@/server/api/routers/delivery-area';
import { adminRouter } from '@/server/api/routers/admin';

export const appRouter = createTRPCRouter({
	auth: authRouter,
	product: productRouter,
	order: orderRouter,
	rental: rentalRouter,
	gallery: galleryRouter,
	address: addressRouter,
	deliveryArea: deliveryAreaRouter,
	admin: adminRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
