import { Archivo, IBM_Plex_Mono, JetBrains_Mono } from 'next/font/google'

const archivo = Archivo({ subsets: ['latin'], display: 'swap', variable: '--font-archivo' })
// Only Archivo (body text, LCP) is preloaded; the mono fonts dress small labels,
// in their regular weight only (the design never uses another one)
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-ibm-plex' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-jetbrains' })

/** Classes defining the font CSS variables, set on <body> (layout and global-error). */
export const fontVariables = `${archivo.variable} ${plexMono.variable} ${jetbrains.variable}`
