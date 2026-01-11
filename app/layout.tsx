import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MT5 Moving Average Indicator',
  description: 'MetaTrader 5 Moving Average Indicator with live chart visualization',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
