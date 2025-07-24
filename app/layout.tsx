import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PrviPosao - Pokrenite Svoju Karijeru | Prvi posao, praksa, junior pozicije, posao bez iskustva",
  description: "PrviPosao je vodeća platforma za pronalazak prvog posla, prakse i junior pozicija u Bosni i Hercegovini. Pronađite posao bez iskustva, internship ili praksu u najboljim kompanijama.",
  openGraph: {
    title: "PrviPosao - Prvi posao, praksa, junior pozicije, posao bez iskustva",
    description: "PrviPosao je vodeća platforma za pronalazak prvog posla, prakse i junior pozicija u Bosni i Hercegovini.",
    url: "https://prviposao.ba/",
    siteName: "PrviPosao",
    images: [
      {
        url: "/placeholder-logo.png",
        width: 1200,
        height: 630,
        alt: "PrviPosao - Logo platforme za prvi posao i praksu u BiH"
      }
    ],
    locale: "bs_BA",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "PrviPosao - Prvi posao, praksa, junior pozicije, posao bez iskustva",
    description: "PrviPosao je vodeća platforma za pronalazak prvog posla, prakse i junior pozicija u Bosni i Hercegovini.",
    images: ["/placeholder-logo.png"]
  },
  metadataBase: new URL("https://prviposao.ba/"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <PageLoader animationType="rocket" duration={2000}>
              <div className="min-h-screen">
                <Navigation />
                <main>{children}</main>
              </div>
            </PageLoader>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
