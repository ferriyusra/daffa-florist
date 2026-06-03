import {
	createCallerFactory,
	createTRPCRouter,
} from '@/server/api/trpc';
import { authRouter } from '@/server/api/routers/auth';
import { productRouter } from '@/server/api/routers/product';
import { orderRouter } from '@/server/api/routers/order';

export const appRouter = createTRPCRouter({
	auth: authRouter,
	product: productRouter,
	order: orderRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
