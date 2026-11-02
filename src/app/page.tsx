import type { Metadata } from 'next';
import { liekanProduct } from '@/lib/liekan/contracts/product';
import RootPage from './RootPage';

export default RootPage;

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { url: '/', siteName: liekanProduct.name, type: 'website' },
};
