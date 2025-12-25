import type React from "react"
import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "93/94 Batch of University of Moratuwa",
  description: "Manage and connect with engineering alumni across 9 fields",
  generator: 'v0.app',
  icons: {
    icon: '/Logo.jpeg',
    shortcut: '/Logo.jpeg',
    apple: '/Logo.jpeg',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="icon" href="/Logo.jpeg" type="image/jpeg" />
      </head>
      <body className={`font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
