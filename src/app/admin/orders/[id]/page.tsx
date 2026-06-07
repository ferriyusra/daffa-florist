import { notFound } from 'next/navigation';
import { TRPCError } from '@trpc/server';
import { api } from '@/trpc/server';
import OrderDetail from './order-detail';

export default async function AdminOrderDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	try {
		const order = await api.admin.order.getById({ id });
		return <OrderDetail order={order} />;
	} catch (e) {
		if (e instanceof TRPCError && e.code === 'NOT_FOUND') notFound();
		throw e;
	}
}
