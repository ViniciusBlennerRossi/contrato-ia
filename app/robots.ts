import type { MetadataRoute } from 'next'
import { URL_DO_SITE } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Nada dentro do painel deve ser indexado: são telas de sessão.
      disallow: ['/dashboard', '/gerar', '/assinatura', '/contrato/', '/admin', '/api/'],
    },
    sitemap: `${URL_DO_SITE}/sitemap.xml`,
  }
}
