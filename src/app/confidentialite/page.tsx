import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';
import { LEGAL } from '@/content/legal';

const doc = LEGAL.fr.privacy;
const url = 'https://albanmary.com/confidentialite';

export const metadata: Metadata = {
  title: doc.title,
  description: doc.description,
  alternates: { canonical: url },
  openGraph: {
    title: `${doc.title} — Alban Mary`,
    description: doc.description,
    url,
    type: 'website',
    siteName: 'Alban Mary',
    locale: 'fr_FR',
  },
};

export default function ConfidentialitePage() {
  return <LegalPage doc="privacy" />;
}
