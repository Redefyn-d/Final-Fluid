import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'River ai Dashboard',
  description: 'River ai Dashboard',
  generator: 'River ai',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
