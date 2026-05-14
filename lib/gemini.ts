import 'server-only'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
})

export async function generateContract(prompt: string): Promise<string> {
  const result = await model.generateContent(prompt)
  const text = result.response.text()
  if (!text) throw new Error('Resposta vazia do Gemini')
  return text
}
