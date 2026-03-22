import './globals.css'
import type { Metadata } from 'next'
import { Bebas_Neue, DM_Sans } from 'next/font/google'
// Note: using actual fonts via next/font
const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' })
const dmsans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'] })

export const metadata: Metadata = {
  title: 'CineMine',
  description: 'Movie discovery and tracking app'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bebas.className} ${dmsans.className} bg-dark text-white`}>
        {children}
      </body>
    </html>
  )
}
