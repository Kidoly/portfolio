import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import './globals.css'
import Providers from './providers'
import { fontVariables } from './fonts'
import fr from '@/locales/fr.json'

const SITE_URL = 'https://albanmary.com';
// FR by default; the EN version is applied client-side when the visitor switches language
const SITE_TITLE = fr.portfolio.meta.title;
const SITE_DESCRIPTION = fr.portfolio.meta.description;

export const viewport: Viewport = {
  themeColor: '#0e100f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s | Alban Mary',
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: 'Alban Mary', url: SITE_URL }],
  creator: 'Alban Mary',
  publisher: 'Alban Mary',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // og:image and twitter:image both come from app/opengraph-image.tsx
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    alternateLocale: 'en_US',
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: 'Alban Mary',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    creator: '@kidoly',
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      'application/rss+xml': [
        { url: '/blog/feed.xml', title: 'Blog Alban Mary - RSS Feed' },
      ],
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  other: {
    'msapplication-TileColor': '#0e100f',
  },
  // Uncomment and fill these when you register with search consoles:
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  // },
}

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: 'Alban Mary',
  givenName: 'Alban',
  familyName: 'Mary',
  jobTitle: 'Administrateur systèmes & réseaux',
  description: 'Administrateur systèmes & réseaux orienté cybersécurité, en alternance chez Epsight, étudiant à l\'EPSI Nantes',
  url: SITE_URL,
  sameAs: [
    'https://www.linkedin.com/in/alban-mary/',
    'https://github.com/Kidoly',
  ],
  worksFor: {
    '@type': 'Organization',
    name: 'Epsight',
  },
  alumniOf: {
    '@type': 'EducationalOrganization',
    name: 'EPSI Nantes',
    url: 'https://www.epsi.fr/',
  },
  knowsAbout: [
    'Administration systèmes', 'Réseaux', 'Cybersécurité', 'Linux', 'Windows Server',
    'Active Directory', 'Proxmox', 'Docker', 'Ansible', 'Terraform', 'DevOps',
    'Python', 'Rust', 'Bash', 'PowerShell',
  ],
  knowsLanguage: ['fr', 'en'],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'Alban Mary',
  url: SITE_URL,
  description: 'Portfolio et blog d\'Alban Mary : administration systèmes & réseaux, homelab et cybersécurité',
  author: { '@id': `${SITE_URL}/#person` },
  inLanguage: ['fr', 'en'],
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const nonce = (await headers()).get('x-nonce') ?? undefined
  return (
    <html lang="fr">
      <head>
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className={`${fontVariables} font-sans`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}