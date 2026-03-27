import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'
const inter = Inter({ subsets: ['latin'], display: 'swap' })

const SITE_URL = 'https://albanmary.com';

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Alban Mary — Développeur Web & Administrateur Systèmes | Portfolio',
    template: '%s | Alban Mary',
  },
  description: 'Portfolio d\'Alban Mary, étudiant en informatique à l\'EPSI Nantes. Développeur web, administrateur systèmes & réseaux, passionné de cybersécurité. Découvrez mes projets, certifications et articles.',
  keywords: [
    'Alban Mary', 'développeur web', 'administrateur systèmes', 'portfolio',
    'EPSI Nantes', 'cybersécurité', 'réseaux', 'DevOps', 'Python', 'Rust',
    'Next.js', 'Docker', 'Linux', 'infrastructure',
  ],
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
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    alternateLocale: 'en_US',
    url: SITE_URL,
    title: 'Alban Mary — Développeur Web & Administrateur Systèmes',
    description: 'Portfolio d\'Alban Mary, étudiant en informatique à l\'EPSI Nantes. Développeur web, administrateur systèmes & réseaux, passionné de cybersécurité.',
    siteName: 'Alban Mary',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Alban Mary — Développeur Web & Administrateur Systèmes',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alban Mary — Développeur Web & Administrateur Systèmes',
    description: 'Portfolio d\'Alban Mary : développement web, systèmes, réseaux et cybersécurité.',
    images: ['/og-image.png'],
    creator: '@kidoly',
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      'application/rss+xml': [
        { url: '/blog/feed.xml', title: 'Blog Alban Mary — RSS Feed' },
      ],
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  other: {
    'theme-color': '#1e40af',
    'msapplication-TileColor': '#1e40af',
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
  jobTitle: 'Développeur Web & Administrateur Systèmes',
  description: 'Étudiant en informatique à l\'EPSI Nantes spécialisé en développement web, systèmes, réseaux et cybersécurité',
  url: SITE_URL,
  image: `${SITE_URL}/og-image.png`,
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
    'Développement Web', 'Python', 'Rust', 'C#', 'TypeScript', 'Next.js',
    'Cybersécurité', 'Réseaux', 'Linux', 'Docker', 'Infrastructure',
    'Administration Systèmes', 'DevOps',
  ],
  knowsLanguage: ['fr', 'en'],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'Alban Mary',
  url: SITE_URL,
  description: 'Portfolio et blog d\'Alban Mary — développement web, systèmes, réseaux et cybersécurité',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}