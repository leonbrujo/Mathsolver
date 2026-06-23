import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ADMIN_EMAIL = 'leonbrujo@gmail.com'
const FREE_LIMIT = 3

const SYSTEM_PROMPT = `You are an expert math tutor. Your job is to solve math problems step by step in a clear and educational way.

RULES:
1. Identify the type of problem at the start.
2. Break the solution into clear numbered steps.
3. Explain the reasoning of each step in simple English.
4. Use LaTeX notation for math expressions (wrapped in $...$ for inline or $$...$$ for block).
5. CRITICAL: In the "consejo" tip field, write plain English prose only. Do NOT wrap variable names or words in dollar signs.
6. Give the final answer at the end.
7. If the problem is not mathematical, say so politely in English.
8. Be concise but complete.

RESPONSE FORMAT (strict JSON, no extra text, no markdown fences):
{
  "tipo": "Problem type (e.g: Algebra, Calculus, Geometry...)",
  "pasos": [
    { "numero": 1, "titulo": "Short step title", "contenido": "Explanation with LaTeX for math" }
  ],
  "respuesta": "Final answer with LaTeX if applicable",
  "consejo": "A plain English tip. No dollar signs around plain words."
}`

// Simple in-memory usage store (resets on cold start — fine for MVP)
const usageStore = new Map<string, number>()
const subscribedUsers = new Set<string>()

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await currentUser()
    const email = user?.emailAddresses?.[0]?.emailAddress || ''

    // Admin always free
    const isAdmin = email === ADMIN_EMAIL

    // Check if subscribed
    const isSubscribed = subscribedUsers.has(userId)

    // Check usage limit
    if (!isAdmin && !isSubscribed) {
      const uses = usageStore.get(userId) || 0
      if (uses >= FREE_LIMIT) {
        return NextResponse.json({ error: 'FREE_LIMIT_REACHED' }, { status: 403 })
      }
    }

    const { texto, imagenBase64, mimeType } = await req.json()
    if (!texto && !imagenBase64) {
      return NextResponse.json({ error: 'Text or image required' }, { status: 400 })
    }

    const content: any[] = []
    if (imagenBase64) {
      content.push({ type: 'image', source: { type: 'base64', media_type: mimeType || 'image/jpeg', data: imagenBase64 } })
    }
    content.push({ type: 'text', text: texto || 'Solve the math problem shown in the image.' })

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content }],
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Error contacting AI' }, { status: 500 })
    }

    const data = await response.json()
    const rawText = data.content?.[0]?.text || ''
    const clean = rawText.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    // Increment usage
    if (!isAdmin && !isSubscribed) {
      const uses = usageStore.get(userId) || 0
      usageStore.set(userId, uses + 1)
    }

    const usesLeft = isAdmin || isSubscribed
      ? null
      : Math.max(0, FREE_LIMIT - (usageStore.get(userId) || 0))

    return NextResponse.json({ ...parsed, usesLeft, isAdmin, isSubscribed })
  } catch (err) {
    console.error('Server error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
