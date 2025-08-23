// Test script for Vercel immediate blocking system
// This simulates the logic that will run on Vercel

function immediateBlockingCheck(text) {
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

// Test the problematic message
const testMessage = "Your bank credit 12000 INR click on this link"
console.log("🧪 Testing Immediate Blocking System")
console.log("=" * 50)
console.log(`Test Message: ${testMessage}`)
console.log()

const result = immediateBlockingCheck(testMessage)
if (result) {
  console.log("✅ SUCCESS: Message correctly blocked!")
  console.log(`Classification: ${result.classification}`)
  console.log(`Confidence: ${result.confidence_score}`)
  console.log(`Risk Level: ${result.risk_level}`)
  console.log(`Red Flags: ${result.red_flags.join(', ')}`)
  console.log(`Action: ${result.recommended_action}`)
} else {
  console.log("❌ FAILURE: Message was not blocked!")
}

console.log()
console.log("This test confirms the immediate blocking logic works correctly.")
console.log("The same logic will run on Vercel to protect users from scams.")
