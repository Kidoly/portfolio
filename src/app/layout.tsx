import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Alban Mary - Développeur Web & Étudiant | Portfolio',
  description: 'Portfolio d\'Alban Mary, étudiant en informatique à l\'EPSI Nantes spécialisé en développement web, réseaux et cybersécurité. Découvrez mes projets et expériences.',
  keywords: 'développeur web, étudiant informatique, python, rust, c#, portfolio, EPSI, cybersécurité, réseaux, développement',
  authors: [{ name: 'Alban Mary' }],
  creator: 'Alban Mary',
  publisher: 'Alban Mary',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://albanmary.com',
    title: 'Alban Mary - Développeur Web & Étudiant | Portfolio',
    description: 'Portfolio d\'Alban Mary, étudiant en informatique à l\'EPSI Nantes spécialisé en développement web, réseaux et cybersécurité.',
    siteName: 'Alban Mary Portfolio',
    images: [
      {
        url: 'https://albanmary.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Alban Mary - Développeur Web & Étudiant Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alban Mary - Développeur Web & Étudiant | Portfolio',
    description: 'Portfolio d\'Alban Mary, étudiant en informatique à l\'EPSI Nantes spécialisé en développement web, réseaux et cybersécurité.',
    images: ['https://albanmary.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://albanmary.com',
  },
  other: {
    'theme-color': '#1e40af',
    'msapplication-TileColor': '#1e40af',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Alban Mary',
  jobTitle: 'Étudiant en Informatique & Développeur Web',
  description: 'Étudiant en informatique à l\'EPSI Nantes spécialisé en développement web, réseaux et cybersécurité',
  url: 'https://albanmary.com',
  sameAs: [
    'https://www.linkedin.com/in/alban-mary/',
    'https://github.com/Kidoly'
  ],
  worksFor: {
    '@type': 'Organization',
    name: 'Epsight'
  },
  alumniOf: {
    '@type': 'EducationalOrganization',
    name: 'EPSI Nantes'
  },
  knowsAbout: [
    'Développement Web',
    'Python',
    'Rust',
    'C#',
    'Cybersécurité',
    'Réseaux',
    'JavaScript',
    'PHP'
  ]
}

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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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