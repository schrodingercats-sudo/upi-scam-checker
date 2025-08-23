// UPI Scam Checker API - Version 2.0.0
// Last Updated: 2025-01-27 15:30 UTC
// Security Update: Immediate Hard-coded Blocking System
// This version cannot be bypassed by ML manipulation
// FORCE VERCELL REBUILD - Python backend replaced with TypeScript fallback

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

// IMMEDIATE HARD-CODED BLOCKING SYSTEM - CANNOT BE BYPASSED
function immediateBlockingCheck(text: string): NormalizedResult | null {
  const body = text || ''
  const bodyLower = body.toLowerCase()
  
  // CRITICAL: Immediate blocking for obvious scam patterns
  const immediateScamPatterns = [
    // Bank credit/debit patterns
    bodyLower.includes('bank credit') && (bodyLower.includes('click') || bodyLower.includes('link')),
    bodyLower.includes('bank debit') && (bodyLower.includes('click') || bodyLower.includes('link')),
    bodyLower.includes('credit') && bodyLower.includes('inr') && (bodyLower.includes('click') || bodyLower.includes('link')),
    bodyLower.includes('debit') && bodyLower.includes('inr') && (bodyLower.includes('click') || bodyLower.includes('link')),
    
    // Amount + action patterns
    (bodyLower.includes('12000') || bodyLower.includes('10000') || bodyLower.includes('5000') || bodyLower.includes('2000') || bodyLower.includes('1000')) && 
    (bodyLower.includes('click') || bodyLower.includes('link') || bodyLower.includes('verify') || bodyLower.includes('confirm')),
    
    // Urgency + financial patterns
    (bodyLower.includes('urgent') || bodyLower.includes('immediate') || bodyLower.includes('quick') || bodyLower.includes('fast')) &&
    (bodyLower.includes('bank') || bodyLower.includes('credit') || bodyLower.includes('debit') || bodyLower.includes('inr') || bodyLower.includes('rs') || bodyLower.includes('₹')),
    
    // Government + action patterns
    (bodyLower.includes('government') || bodyLower.includes('govt') || bodyLower.includes('official') || bodyLower.includes('authority')) &&
    (bodyLower.includes('click') || bodyLower.includes('link') || bodyLower.includes('verify') || bodyLower.includes('confirm')),
    
    // OTP + action patterns
    (bodyLower.includes('otp') || bodyLower.includes('verification') || bodyLower.includes('code')) &&
    (bodyLower.includes('click') || bodyLower.includes('link') || bodyLower.includes('verify') || bodyLower.includes('confirm')),
    
    // Suspicious URL patterns
    bodyLower.includes('bit.ly') || bodyLower.includes('tinyurl') || bodyLower.includes('goo.gl') || bodyLower.includes('t.co') || bodyLower.includes('is.gd'),
    
    // Character substitution attempts
    bodyLower.includes('b@nk') || bodyLower.includes('cr3dit') || bodyLower.includes('d3bit') || bodyLower.includes('0tp') || bodyLower.includes('v3rify') || bodyLower.includes('c0nfirm'),
    
    // Multiple exclamation marks (urgency indicator)
    (body.split('!').length - 1) >= 3 && (bodyLower.includes('bank') || bodyLower.includes('credit') || bodyLower.includes('debit') || bodyLower.includes('inr') || bodyLower.includes('rs') || bodyLower.includes('₹')),
    
    // ALL CAPS financial messages
    (body.split('').filter(c => c === c.toUpperCase() && c !== c.toLowerCase()).length > body.length * 0.6) &&
    (bodyLower.includes('bank') || bodyLower.includes('credit') || bodyLower.includes('debit') || bodyLower.includes('inr') || bodyLower.includes('rs') || bodyLower.includes('₹'))
  ]
  
  // If ANY pattern matches, immediately block as SCAM
  if (immediateScamPatterns.some(pattern => pattern)) {
    return {
      classification: 'Scam',
      confidence_score: '99%',
      risk_level: 'High',
      red_flags: [
        'IMMEDIATE BLOCK: Obvious scam pattern detected',
        'Hard-coded security rule triggered',
        'Cannot be bypassed by ML manipulation'
      ],
      recommended_action: 'BLOCKED: This is a confirmed scam message. Do not interact.'
    }
  }
  
  return null // No immediate blocking needed
}

// COMPREHENSIVE FALLBACK ANALYSIS SYSTEM (since Python won't work on Vercel)
function fallbackAnalysis(text: string, phone?: string, url?: string): NormalizedResult {
  const input = text || ''
  const inputLower = input.toLowerCase()
  let score = 0
  const redFlags: string[] = []
  
  // Enhanced scam detection patterns
  const scamKeywords = [
    'urgent', 'immediate', 'suspended', 'blocked', 'expired', 'verification',
    'click', 'click here', 'verify now', 'kyc pending', 'kyc expiring', 'lottery', 'prize',
    'won', 'inheritance', 'free money', 'processing fee', 'refund', 'penalty', 'fir',
    'under verification', 'share otp', 'provide otp', 'account blocked', 'security alert'
  ]
  
  const suspiciousKeywords = [
    'bank', 'credit', 'debit', 'inr', 'rs', '₹', 'otp', 'verification', 'kyc',
    'update', 'confirm', 'verify', 'reactivate', 'suspended', 'blocked'
  ]
  
  // Check for scam keywords
  scamKeywords.forEach(keyword => {
    if (inputLower.includes(keyword)) {
      score += 0.4
      redFlags.push(`Contains scam keyword: "${keyword}"`)
    }
  })
  
  // Check for suspicious patterns
  suspiciousKeywords.forEach(keyword => {
    if (inputLower.includes(keyword)) {
      score += 0.2
      redFlags.push(`Contains suspicious keyword: "${keyword}"`)
    }
  })
  
  // Check for urgency indicators
  if (/\b(urgent|immediate|now|quick|hurry|fast)\b/i.test(input)) {
    score += 0.3
    redFlags.push('Uses urgency tactics')
  }
  
  // Check for suspicious URLs
  if (/(bit\.ly|tinyurl|goo\.gl|t\.co|is\.gd)/i.test(input)) {
    score += 0.5
    redFlags.push('Uses URL shortener (potential redirection)')
  }
  
  // Check for amount patterns
  if (/\d+[\d,]*(?:\.\d+)?\s*(?:inr|rs\.?|₹)/i.test(input) || /(?:inr|rs\.?|₹)\s?\d+[\d,]*(?:\.\d+)?/i.test(input)) {
    score += 0.3
    redFlags.push('Contains financial amount')
  }
  
  // Check for action words
  if (/\b(click|verify|confirm|update|reactivate)\b/i.test(input)) {
    score += 0.3
    redFlags.push('Requests action')
  }
  
  // Check for multiple exclamation marks
  const exclamationCount = (input.match(/!/g) || []).length
  if (exclamationCount >= 2) {
    score += 0.2 * exclamationCount
    redFlags.push(`Uses ${exclamationCount} exclamation marks (urgency indicator)`)
  }
  
  // Check for ALL CAPS
  const upperCaseCount = input.split('').filter(c => c === c.toUpperCase() && c !== c.toLowerCase()).length
  if (upperCaseCount > input.length * 0.5) {
    score += 0.3
    redFlags.push('Uses excessive capitalization')
  }
  
  // Determine classification
  let classification: 'Safe' | 'Suspicious' | 'Scam'
  let riskLevel: 'Low' | 'Medium' | 'High'
  let confidence: string
  
  if (score >= 0.8) {
    classification = 'Scam'
    riskLevel = 'High'
    confidence = '90%'
  } else if (score >= 0.4) {
    classification = 'Suspicious'
    riskLevel = 'Medium'
    confidence = '75%'
  } else {
    classification = 'Safe'
    riskLevel = 'Low'
    confidence = '85%'
  }
  
  // Safety guard: any red flag → at least Suspicious
  if (redFlags.length > 0 && classification === 'Safe') {
    classification = 'Suspicious'
    riskLevel = 'Medium'
    confidence = '70%'
  }
  
  // Generate advice
  let recommendedAction = ''
  if (classification === 'Safe') {
    recommendedAction = 'This appears to be safe. Continue with normal caution.'
  } else if (classification === 'Suspicious') {
    recommendedAction = 'Exercise caution. Do not share personal information or click suspicious links.'
  } else {
    recommendedAction = 'This is likely a scam. Do not respond, click, or share any information. Report immediately.'
  }
  
  return {
    classification,
    confidence_score: confidence,
    risk_level: riskLevel,
    red_flags: redFlags.slice(0, 6),
    recommended_action: recommendedAction
  }
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

    // Apply immediate hard-coded blocking
    const immediateBlockingResult = immediateBlockingCheck(text || '')
    if (immediateBlockingResult) {
      return NextResponse.json(immediateBlockingResult)
    }

    // Use fallback analysis since Python won't work on Vercel
    const primary = fallbackAnalysis(text || '', phone, url)

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
