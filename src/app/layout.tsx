import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { RootLayoutClient } from "@/components/root-layout-client"
import "./globals.css"

export const metadata: Metadata = {
  title: "Tyrent - Find Your Perfect Home in Nairobi",
  description:
    "Discover verified rental properties in Nairobi. Transparent pricing, real-time availability, and trusted landlords.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="light" storageKey="tyrent-theme">
          <RootLayoutClient>{children}</RootLayoutClient>
        </ThemeProvider>
      </body>
    </html>
  )
}
