import type { Metadata } from 'next';
import { FeatureAuthEntry } from '@/components/liekan/features/AuthEntry';
import { liekanProduct } from '@/lib/liekan/contracts/product';
import { LoginPage } from './LoginPage';

export const dynamic = 'force-dynamic';

export default async function ({ searchParams }: { searchParams: Promise<{ legacy?: string }> }) {
  if (process.env.DISABLE_LOGIN || process.env.CLOUD_MODE) {
    return null;
  }

  return (await searchParams).legacy === '1' ? <LoginPage /> : <FeatureAuthEntry page="login" />;
}

export const metadata: Metadata = {
  title: 'Login',
  alternates: { canonical: '/login' },
  openGraph: { url: '/login', siteName: liekanProduct.name, type: 'website' },
};
