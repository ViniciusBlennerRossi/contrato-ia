import type { Metadata } from "next"
import { Cormorant_Garamond, Outfit } from "next/font/google"
import { URL_DO_SITE } from "@/lib/site"
import "./globals.css"

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
})

const TITULO = "ContratoIA — Contratos Jurídicos com IA em segundos"
const DESCRICAO =
  "Gere contratos jurídicos profissionais com inteligência artificial. Para MEIs, freelancers e pequenas empresas. A partir de R$29."

export const metadata: Metadata = {
  // metadataBase resolve os caminhos relativos da imagem de compartilhamento.
  metadataBase: new URL(URL_DO_SITE),
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: URL_DO_SITE,
    siteName: 'ContratoIA',
    title: TITULO,
    description: DESCRICAO,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITULO,
    description: DESCRICAO,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${outfit.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
