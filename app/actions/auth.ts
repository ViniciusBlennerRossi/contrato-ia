'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/session'

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
