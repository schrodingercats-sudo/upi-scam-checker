import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'UPI Scam Checker - Protect Yourself from Digital Fraud',
  description: 'AI-powered UPI scam detection tool. Analyze SMS, URLs, and calls to identify potential scams and get actionable advice.',
  keywords: 'UPI scam, fraud detection, phishing, digital security, India',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
