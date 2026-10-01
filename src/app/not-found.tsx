import { Metadata } from 'next';
import NotFoundView from '@/components/errors/NotFoundView';

export const metadata: Metadata = {
  title: 'Page introuvable',
  description: 'La page que vous recherchez n\'existe pas ou a été déplacée.',
  // Overrides the root layout's index/follow (Next also adds its own noindex)
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundView />;
}
