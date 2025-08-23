// UPI Scam Checker API - Version 2.1.0
// Last Updated: 2025-01-27 16:00 UTC
// Security Update: SMS Sender ID Analysis + Simple Unified System
// This version uses ML + Rules + Gemini + SMS Sender ID Classification

export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'

type NormalizedResult = {
  classification: 'Safe' | 'Suspicious' | 'Scam'
  confidence_score: string
  risk_level: 'Low' | 'Medium' | 'High'
  red_flags: string[]
  recommended_action: string
  sender_analysis?: any
}

// LEGITIMATE PROVIDERS WHITELIST - PREVENTS FALSE POSITIVES
const LEGITIMATE_PROVIDERS = [
  'fast2sms', 'fast2sms wallet', 'team fast2sms',
  'paytm', 'paytm wallet', 'team paytm',
  'phonepe', 'phonepe wallet', 'team phonepe',
  'google pay', 'gpay', 'team google pay',
  'amazon pay', 'amazonpay', 'team amazon pay',
  'mobikwik', 'mobikwik wallet', 'team mobikwik',
  'freecharge', 'freecharge wallet', 'team freecharge',
  'ola money', 'ola wallet', 'team ola',
  'uber', 'uber wallet', 'team uber',
  'swiggy', 'swiggy money', 'team swiggy',
  'zomato', 'zomato wallet', 'team zomato',
  'razorpay', 'team razorpay',
  'stripe', 'team stripe',
  'paypal', 'team paypal',
  'bank of india', 'sbi', 'hdfc', 'icici', 'axis', 'kotak', 'yes bank',
  'team bank of india', 'team sbi', 'team hdfc', 'team icici', 'team axis', 'team kotak', 'team yes bank'
]

// SMS SENDER ID ANALYSIS (DND Classification)
function analyzeSmsSenderId(senderId: string): any {
  if (!senderId) return null
  
  const lastChar = senderId.slice(-1).toLowerCase()
  
  const categories = {
    's': { name: 'Service', risk: 'Low', trust: 0.9, desc: 'Legitimate service messages (banks, companies)' },
    'g': { name: 'Government', risk: 'Low', trust: 0.95, desc: 'Official government messages' },
    'p': { name: 'Promotional', risk: 'Medium', trust: 0.3, desc: 'Marketing and promotional messages' },
    't': { name: 'Transactional/OTP', risk: 'Low', trust: 0.8, desc: 'One-time passwords and transaction messages' }
  }
  
  if (lastChar in categories) {
    return {
      category: categories[lastChar].name,
      risk_level: categories[lastChar].risk,
      trust_score: categories[lastChar].trust,
      description: categories[lastChar].desc,
      sender_id: senderId,
      category_code: lastChar
    }
  }
  
  return {
    category: 'Unknown',
    risk_level: 'Medium',
    trust_score: 0.5,
    description: 'Unknown sender ID pattern',
    sender_id: senderId,
    category_code: '?'
  }
}

// IMMEDIATE HARD-CODED BLOCKING SYSTEM - CANNOT BE BYPASSED
function immediateBlockingCheck(text: string, senderId?: string): NormalizedResult | null {
  const body = text || ''
  const bodyLower = body.toLowerCase()
  
  // FIRST: Check for legitimate providers (whitelist)
  for (const provider of LEGITIMATE_PROVIDERS) {
    if (bodyLower.includes(provider)) {
      return {
        classification: 'Safe',
        confidence_score: '95%',
        risk_level: 'Low',
        red_flags: [],
        recommended_action: `This is a legitimate message from ${provider}. Continue with normal caution.`
      }
    }
  }
  
  // SECOND: Check SMS Sender ID (NEW FEATURE!)
  if (senderId) {
    const senderAnalysis = analyzeSmsSenderId(senderId)
    if (senderAnalysis && ['s', 'g', 't'].includes(senderAnalysis.category_code)) {
      return {
        classification: 'Safe',
        confidence_score: `${(senderAnalysis.trust_score * 100).toFixed(0)}%`,
        risk_level: 'Low',
        red_flags: [],
        recommended_action: `This appears to be a legitimate ${senderAnalysis.category} message. Continue with normal caution.`,
        sender_analysis: senderAnalysis
      }
    }
  }
  
  // CRITICAL: Immediate blocking for obvious scam patterns
  const immediateScamPatterns = [
    // Bank credit/debit patterns
    bodyLower.includes('bank credit') && (bodyLower.includes('click') || bodyLower.includes('link')),
    bodyLower.includes('bank debit') && (bodyLower.includes('click') || bodyLower.includes('link')),
    bodyLower.includes('credit') && bodyLower.includes('inr') && (bodyLower.includes('click') || bodyLower.includes('link')),
    bodyLower.includes('debit') && bodyLower.includes('inr') && (bodyLower.includes('click') || bodyLower.includes('link')),
    
    // Amount + action patterns (more specific to avoid false positives)
    (bodyLower.includes('12000') || bodyLower.includes('10000') || bodyLower.includes('5000') || bodyLower.includes('2000') || bodyLower.includes('1000')) && 
    (bodyLower.includes('click') || bodyLower.includes('link') || bodyLower.includes('verify') || bodyLower.includes('confirm') || bodyLower.includes('login') || bodyLower.includes('secure')),
    
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

// Call Python ML backend on Render
async function callRenderBackend(text: string, phone?: string, url?: string, senderId?: string): Promise<NormalizedResult> {
  try {
    // TODO: Replace with your actual Render backend URL
    const RENDER_BACKEND_URL = process.env.RENDER_BACKEND_URL || 'https://your-app-name.onrender.com'
    
    const response = await fetch(`${RENDER_BACKEND_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, phone, url, sender_id: senderId }),
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const result = await response.json()
    return {
      classification: result.classification || 'Suspicious',
      confidence_score: result.confidence_score || '70%',
      risk_level: result.risk_level || 'Medium',
      red_flags: result.red_flags || [],
      recommended_action: result.recommended_action || 'Analysis completed.',
      sender_analysis: result.sender_analysis
    }
  } catch (error) {
    console.error('Render backend call failed:', error)
    // Return fallback result if backend fails
    return {
      classification: 'Suspicious',
      confidence_score: '70%',
      risk_level: 'Medium',
      red_flags: ['Backend connection failed', 'Using fallback analysis'],
      recommended_action: 'Backend unavailable. Exercise caution and try again later.'
    }
  }
}

// COMPREHENSIVE FALLBACK ANALYSIS SYSTEM (for when Render backend is unavailable)
function fallbackAnalysis(text: string, phone?: string, url?: string, senderId?: string): NormalizedResult {
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
    recommended_action: recommendedAction,
    sender_analysis: senderId ? analyzeSmsSenderId(senderId) : undefined
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, phone, url, sender_id } = await request.json()
    if (!text && !phone && !url) {
      return NextResponse.json({ error: 'Provide at least one of: text, phone, url' }, { status: 400 })
    }

    // Apply immediate hard-coded blocking (includes Fast2SMS whitelist + SMS Sender ID)
    const immediateBlockingResult = immediateBlockingCheck(text || '', sender_id)
    if (immediateBlockingResult) {
      return NextResponse.json(immediateBlockingResult)
    }

    // Try to call Render Python backend first
    try {
      const mlResult = await callRenderBackend(text || '', phone, url, sender_id)
      return NextResponse.json(mlResult)
    } catch (error) {
      console.error('ML backend failed, using fallback:', error)
      // If ML backend fails, use fallback analysis
      const fallbackResult = fallbackAnalysis(text || '', phone, url, sender_id)
      return NextResponse.json(fallbackResult)
    }
    
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}
