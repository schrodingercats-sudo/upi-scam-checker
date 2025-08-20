export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'

const execAsync = promisify(exec)

type NormalizedResult = {
  classification: 'Safe' | 'Suspicious' | 'Scam'
  confidence_score: string
  risk_level: 'Low' | 'Medium' | 'High'
  red_flags: string[]
  recommended_action: string
}

async function analyzeInPython(text: string, phone?: string, url?: string) {
  const py = `
import json
from engine.analyzer import analyze_message

res = analyze_message(${JSON.stringify(text)}, ${JSON.stringify(phone || '')}, ${JSON.stringify(url || '')})
print(json.dumps(res, ensure_ascii=False))
`
  const tmp = 'tmp_analyze.py'
  fs.writeFileSync(tmp, py)
  const { stdout } = await execAsync(`python ${tmp}`)
  fs.unlinkSync(tmp)
  return JSON.parse(stdout.trim())
}

async function verifyWithGemini(promptText: string): Promise<NormalizedResult | null> {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return null

    const system = `You are a strict UPI scam detection validator. Classify the message into one of: Safe, Suspicious, Scam.\nRules:\n- Any red flag => at least Suspicious.\n- Official whitelist domains (rbi.org.in, icicibank.com, hdfcbank.com, axisbank.com, sbi.co.in, pnb.co.in, canarabank.com, unionbankofindia.co.in) may be Safe.\n- Brand-spoof or lookalike domains (e.g., icici-bank-verify.net) => Suspicious/Scam.\n- Output JSON ONLY with keys: classification, confidence_score (0-100%), risk_level (Low/Medium/High), red_flags (array), recommended_action.`
    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${system}\n\nMessage:\n${promptText}` }],
        },
      ],
    }

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )
    if (!resp.ok) return null
    const data: any = await resp.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    if (!text) return null
    // Try to extract JSON
    const jsonText = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '')
    const parsed = JSON.parse(jsonText)
    const classification = (parsed.classification || 'Suspicious') as 'Safe' | 'Suspicious' | 'Scam'
    const confidenceSource: string = String(parsed.confidence_score || parsed.confidence || '0%')
    const confidence_score = /%$/.test(confidenceSource)
      ? confidenceSource
      : `${Math.round(Number(confidenceSource) * 100)}%`
    const risk_level = (parsed.risk_level || parsed.riskLevel || 'Medium') as 'Low' | 'Medium' | 'High'
    const red_flags = (parsed.red_flags || parsed.redFlags || []) as string[]
    const recommended_action = (parsed.recommended_action || parsed.advice || 'Be cautious. Verify via official site.') as string
    return { classification, confidence_score, risk_level, red_flags, recommended_action }
  } catch {
    return null
  }
}

function fuseResults(primary: any, secondary: NormalizedResult | null): NormalizedResult {
  // Normalize primary
  const p: NormalizedResult = {
    classification: (primary.classification || primary.label || 'Suspicious'),
    confidence_score: String(primary.confidence_score || primary.confidence || '70%'),
    risk_level: (primary.risk_level || primary.riskLevel || 'Medium'),
    red_flags: (primary.red_flags || primary.redFlags || []),
    recommended_action: (primary.recommended_action || primary.advice || 'Be cautious. Verify via official site.'),
  } as NormalizedResult

  if (!secondary) return p

  // Determine most severe classification
  const order = { 'Safe': 0, 'Suspicious': 1, 'Scam': 2 } as const
  const moreSevere = order[secondary.classification] > order[p.classification] ? secondary : p

  // Combine red flags and pick higher risk
  const mergedFlags = Array.from(new Set([...p.red_flags, ...secondary.red_flags]))
  const riskRank = { Low: 0, Medium: 1, High: 2 } as const
  const risk_level = (riskRank[secondary.risk_level] > riskRank[p.risk_level] ? secondary.risk_level : p.risk_level) as 'Low' | 'Medium' | 'High'

  // Confidence: take the max of the two, but cap Safe at 80% if any flags
  const toNum = (s: string) => Math.max(0, Math.min(100, parseInt(String(s).replace('%', '') || '0', 10)))
  let conf = Math.max(toNum(p.confidence_score), toNum(secondary.confidence_score))
  const classification = moreSevere.classification
  if (classification === 'Safe' && mergedFlags.length > 0) conf = Math.min(conf, 80)

  return {
    classification,
    confidence_score: `${conf}%`,
    risk_level,
    red_flags: mergedFlags.slice(0, 6),
    recommended_action: moreSevere.recommended_action,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, phone, url } = await request.json()
    if (!text && !phone && !url) {
      return NextResponse.json({ error: 'Provide at least one of: text, phone, url' }, { status: 400 })
    }
    const primary = await analyzeInPython(text || '', phone, url)

    // Optional second-step verification with Gemini
    let combined: NormalizedResult = primary
    const material = [text || '', phone || '', url || ''].filter(Boolean).join('\n')
    const secondary = await verifyWithGemini(material)
    combined = fuseResults(primary, secondary)

    return NextResponse.json(combined)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}
