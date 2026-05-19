import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=google_cancelado`
    )
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenRes.json()
    if (!tokens.access_token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=google_falhou`
      )
    }

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const googleUser = await userRes.json()

    if (!googleUser.email) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=google_sem_email`
      )
    }

    let user = await db.user.findUnique({ where: { email: googleUser.email } })

    if (!user) {
      user = await db.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name ?? googleUser.email,
          image: googleUser.picture ?? null,
          emailVerified: new Date(),
        },
      })
    } else if (!user.emailVerified) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date(), image: googleUser.picture ?? undefined },
      })
    }

    await createSession(user.id, user.plan)

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)
  } catch (err) {
    console.error('Erro no callback Google:', err)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=google_erro`
    )
  }
}
