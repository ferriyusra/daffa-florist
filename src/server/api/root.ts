import {
	createCallerFactory,
	createTRPCRouter,
} from '@/server/api/trpc';
import { authRouter } from '@/server/api/routers/auth';
import { productRouter } from '@/server/api/routers/product';
import { orderRouter } from '@/server/api/routers/order';
import { adminRouter } from '@/server/api/routers/admin';

export const appRouter = createTRPCRouter({
	auth: authRouter,
	product: productRouter,
	order: orderRouter,
	admin: adminRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
