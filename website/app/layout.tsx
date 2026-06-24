import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Gospel Grounded',
    template: '%s | Gospel Grounded',
  },
  description:
    "Deep, biblical teaching that helps you understand God's Word with clarity and conviction — videos, articles, and podcasts grounded in Scripture.",
  metadataBase: new URL('https://gospelgrounded.com.au'),
  openGraph: {
    siteName: 'Gospel Grounded',
    locale: 'en_AU',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="bg-[#0A0A0A] font-sans">
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
