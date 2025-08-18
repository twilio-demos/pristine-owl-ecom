import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lawson Reinhardt - Premium Ecommerce',
  description: 'Discover premium shoes and apparel for the modern lifestyle',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"
          rel="stylesheet"
        />
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        {children}
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js" async />
        <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js" async />
        <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js" async />
        <script src="https://cdn.jsdelivr.net/npm/algoliasearch@4.20.0/dist/algoliasearch-lite.umd.js" async />
        <script src="https://cdn.jsdelivr.net/npm/instantsearch.js@4.56.8/dist/instantsearch.production.min.js" async />
        <script src="/static/analytics.js" async />
      </body>
    </html>
  )
}