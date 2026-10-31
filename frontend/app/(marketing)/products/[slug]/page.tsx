import { products } from '@/lib/content';
import { notFound } from 'next/navigation';
import { FabricGuardPage, LineWatchPage, OrderRescuePage } from '@/components/product-pages';

export function generateStaticParams() {
  return products.map(p => ({ slug: p.slug }));
}

export default async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === 'fabricguard') return <FabricGuardPage />;
  if (slug === 'linewatch') return <LineWatchPage />;
  if (slug === 'orderrescue') return <OrderRescuePage />;
  notFound();
}
