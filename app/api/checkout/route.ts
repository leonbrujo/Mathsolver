import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await currentUser()
    const email = user?.emailAddresses?.[0]?.emailAddress || ''
    const origin = req.headers.get('origin') || 'http://localhost:3000'

    const params = new URLSearchParams({
      'payment_method_types[]': 'card',
      'line_items[0][price]': process.env.STRIPE_PRICE_ID!,
      'line_items[0][quantity]': '1',
      'mode': 'subscription',
      'customer_email': email,
      'client_reference_id': userId,
      'success_url': `${origin}/?subscribed=true`,
      'cancel_url': `${origin}/?cancelled=true`,
    })

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })

    const session = await response.json()
    if (!response.ok) return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
