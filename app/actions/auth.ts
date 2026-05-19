'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/session'
import { Resend } from 'resend'

const CadastroSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }).trim(),
  email: z.email({ message: 'Email inválido' }).trim(),
  password: z
    .string()
    .min(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
    .trim(),
})

const LoginSchema = z.object({
  email: z.email({ message: 'Email inválido' }).trim(),
  password: z.string().min(1, { message: 'Senha é obrigatória' }).trim(),
})

export type AuthState = {
  errors?: Record<string, string[]>
  message?: string
} | undefined

export async function cadastrar(state: AuthState, formData: FormData): Promise<AuthState> {
  const validated = CadastroSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { name, email, password } = validated.data

  const existingUser = await db.user.findUnique({ where: { email } })
  if (existingUser) {
    return { errors: { email: ['Este email já está cadastrado'] } }
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await db.user.create({
    data: { name, email, password: hashedPassword },
  })

  await createSession(user.id, user.plan)
  redirect('/dashboard')
}

export async function login(state: AuthState, formData: FormData): Promise<AuthState> {
  const validated = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { email, password } = validated.data

  const user = await db.user.findUnique({ where: { email } })
  if (!user || !user.password) {
    return { message: 'Email ou senha incorretos' }
  }

  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) {
    return { message: 'Email ou senha incorretos' }
  }

  await createSession(user.id, user.plan)
  redirect('/dashboard')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}

const EsqueciSenhaSchema = z.object({
  email: z.email({ message: 'Email inválido' }).trim(),
})

export async function solicitarRedefinicao(state: AuthState, formData: FormData): Promise<AuthState> {
  const validated = EsqueciSenhaSchema.safeParse({ email: formData.get('email') })
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { email } = validated.data
  const user = await db.user.findUnique({ where: { email } })

  // Não revelar se email existe ou não
  if (!user || !user.password) {
    return { message: 'Se este email estiver cadastrado, você receberá um link em breve.' }
  }

  // Deletar token anterior se existir
  await db.verificationToken.deleteMany({ where: { identifier: email } })

  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

  await db.verificationToken.create({ data: { identifier: email, token, expires } })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://contratoia.v3app.com.br'
  const link = `${appUrl}/redefinir-senha?token=${token}`

  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'ContratoIA <noreply@contratoia.v3app.com.br>',
    to: email,
    subject: 'Redefinição de senha — ContratoIA',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0e0e0e;color:#f8f4ef">
        <h2 style="color:#c8a84b;margin-bottom:8px">ContratoIA</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <p>Clique no botão abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.</p>
        <a href="${link}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#c8a84b;color:#000;font-weight:bold;text-decoration:none;border-radius:6px">
          Redefinir minha senha
        </a>
        <p style="color:#888;font-size:13px">Se você não solicitou, ignore este email. Sua senha não será alterada.</p>
        <p style="color:#555;font-size:12px">Ou copie e cole este link: ${link}</p>
      </div>
    `,
  })

  return { message: 'Se este email estiver cadastrado, você receberá um link em breve.' }
}

const RedefinirSenhaSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, { message: 'Senha deve ter pelo menos 8 caracteres' }),
})

export async function redefinirSenha(state: AuthState, formData: FormData): Promise<AuthState> {
  const validated = RedefinirSenhaSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { token, password } = validated.data

  const record = await db.verificationToken.findUnique({ where: { token } })
  if (!record) {
    return { message: 'Link inválido ou expirado. Solicite um novo link.' }
  }
  if (record.expires < new Date()) {
    await db.verificationToken.delete({ where: { token } })
    return { message: 'Este link expirou. Solicite um novo link de redefinição.' }
  }

  const user = await db.user.findUnique({ where: { email: record.identifier } })
  if (!user) {
    return { message: 'Usuário não encontrado.' }
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  await db.user.update({ where: { id: user.id }, data: { password: hashedPassword } })
  await db.verificationToken.delete({ where: { token } })

  redirect('/login?redefinido=1')
}
