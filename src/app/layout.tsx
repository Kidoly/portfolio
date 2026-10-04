import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import './globals.css'
import Providers from './providers'
import { fontVariables } from './fonts'
import fr from '@/locales/fr.json'
import { umamiConfig } from '@/lib/umami'
import StatsListener from '@/components/analytics/StatsListener'
import { ogImage } from '@/lib/og'
import { jsonLd, PERSON, SITE_URL, WEBSITE } from '@/lib/structured-data'

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
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    alternateLocale: 'en_US',
    url: '/',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: 'Alban Mary',
    images: [ogImage('/og.png', 'Alban Mary - Ingénieur systèmes & réseaux')],
  },
  // Pages leave out `twitter`: Next fills its title, description and image
  // from their own openGraph, never from the home page's
  twitter: {
    card: 'summary_large_image',
    creator: '@kidoly',
  },
  // ?v= busts the long browser cache of the previous blue icon
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: '16x16 32x32 48x48' },
      { url: '/icon.svg?v=2', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png?v=2',
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const requestHeaders = await headers()
  const nonce = requestHeaders.get('x-nonce') ?? undefined
  // Audience stats (Umami, no cookie): public pages only, counted on the site's own domain
  const umami = requestHeaders.get('x-pathname')?.startsWith('/admin') ? null : umamiConfig()
  let statsDomain: string | undefined
  try {
    statsDomain = process.env.SITE_URL ? new URL(process.env.SITE_URL).hostname : undefined
  } catch {}
  return (
    <html lang="fr">
      <head>
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd({ '@context': 'https://schema.org', ...PERSON }) }}
        />
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd({ '@context': 'https://schema.org', ...WEBSITE }) }}
        />
      </head>
      <body className={`${fontVariables} font-sans`}>
        <Providers>
          {children}
        </Providers>
        {umami && <StatsListener />}
        {umami && (
          <script
            defer
            src="/stats/script.js"
            nonce={nonce}
            data-website-id={umami.websiteId}
            data-host-url="/stats"
            data-domains={statsDomain}
            data-do-not-track="true"
          />
        )}
      </body>
    </html>
  )
}