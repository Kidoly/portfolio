import Link from 'next/link';

const LABELS = {
  fr: { mentions: 'Mentions légales', privacy: 'Confidentialité' },
  en: { mentions: 'Legal notice', privacy: 'Privacy' },
};

/** Footer links to the legal pages, shown on every page. */
export default function LegalLinks({ lang = 'fr' }: { lang?: 'fr' | 'en' }) {
  return (
    <>
      <Link href="/mentions-legales/">{LABELS[lang].mentions}</Link>
      <Link href="/confidentialite/">{LABELS[lang].privacy}</Link>
    </>
  );
}
