import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const number = (searchParams.get('number') ?? '').toString()
  if (!number) return NextResponse.json({ error: 'Missing number' }, { status: 400 })

  // Placeholder track response
  return NextResponse.json({
    number,
    carrier: 'Unknown',
    spamScore: 0.35,
    reports: 0,
    notes: 'Basic lookup placeholder. Integrate Truecaller/PhoneInfoga later.'
  })
}


