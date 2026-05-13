import type { Metadata } from "next"
import { Cormorant_Garamond, Outfit } from "next/font/google"
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

export const metadata: Metadata = {
  title: "ContratoIA — Contratos Jurídicos com IA em 30 segundos",
  description:
    "Gere contratos jurídicos profissionais com inteligência artificial. Para MEIs, freelancers e pequenas empresas. A partir de R$29.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${outfit.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
