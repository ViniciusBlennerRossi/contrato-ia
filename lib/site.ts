/**
 * Endereço público do site, em um lugar só.
 *
 * Vale para metadata, sitemap, robots e links de e-mail. O fallback existe
 * porque o sitemap e o robots são gerados no build, quando NEXT_PUBLIC_APP_URL
 * pode não estar definida dentro do container.
 */
export const URL_DO_SITE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://contrato.v3app.com.br'

export const EMAIL_SUPORTE = 'empresa.v3app@gmail.com'
