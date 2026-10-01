import Link from 'next/link';

export const LEGAL_LABELS = {
  fr: { mentions: 'Mentions légales', privacy: 'Confidentialité' },
  en: { mentions: 'Legal notice', privacy: 'Privacy' },
};

/** Footer links to the legal pages, shown on every page. */
export default function LegalLinks({ lang = 'fr' }: { lang?: 'fr' | 'en' }) {
  return (
    <>
      <Link href="/mentions-legales/">{LEGAL_LABELS[lang].mentions}</Link>
      <Link href="/confidentialite/">{LEGAL_LABELS[lang].privacy}</Link>
    </>
  );
}
