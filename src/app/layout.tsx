import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from "@/context/providers";

import './globals.css'
import { cn } from "@/lib/utils";

const geist = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'nomail',
  description: 'Create unique email addresses for each of your accounts. No more spam.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body suppressHydrationWarning={true}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
