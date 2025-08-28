import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const result = {
      label: 'Suspicious',
      confidence: 0.6,
      redFlags: ['Unverified caller intent', 'Potential social engineering'],
      advice: 'Do not share OTP or PIN over calls. Verify via official support.',
      riskLevel: 'Medium',
    } as const
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Unable to analyze audio' }, { status: 500 })
  }
}


