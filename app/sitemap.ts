import type { MetadataRoute } from 'next'
import { URL_DO_SITE } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date()

  // Só as páginas públicas: o painel exige sessão e não deve ser indexado.
  return [
    { url: URL_DO_SITE, lastModified: agora, changeFrequency: 'weekly', priority: 1 },
    { url: `${URL_DO_SITE}/login`, lastModified: agora, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${URL_DO_SITE}/cadastro`, lastModified: agora, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${URL_DO_SITE}/termos`, lastModified: agora, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${URL_DO_SITE}/privacidade`, lastModified: agora, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${URL_DO_SITE}/aviso-legal`, lastModified: agora, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
