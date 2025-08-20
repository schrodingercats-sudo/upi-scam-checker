import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// ML Model Analysis using Python
async function analyzeWithML(smsText: string) {
  try {
    // Create a temporary Python script to run the ML analysis
    const pythonScript = `
import sys
import json
import pickle
import numpy as np
import re
from pathlib import Path

# Feature extraction (same as training)
def extract_features(text):
    text_lower = text.lower()
    bank_keywords = ['sbi', 'icici', 'hdfc', 'axis', 'pnb', 'canara', 'union bank']
    gov_keywords = ['rbi', 'npci', 'upi', 'gov.in', 'nic.in', 'trai', 'dot']
    scam_keywords = ['urgent', 'immediate', 'suspended', 'blocked', 'expired', 'click here', 'verify now']
    
    features = [
        len(text),
        len(text.split()),
        any(bank in text_lower for bank in bank_keywords),
        any(gov in text_lower for gov in gov_keywords),
        any(scam in text_lower for scam in scam_keywords),
        sum(1 for word in ['urgent', 'immediate', 'now'] if word in text_lower),
        'http' in text_lower or 'www.' in text_lower,
        any(short in text_lower for short in ['bit.ly', 'tinyurl', 'goo.gl']),
        'otp' in text_lower,
        bool(re.search(r'₹\\d+|\\d+\\s*rupees?', text_lower)),
        bool(re.search(r'-[A-Z]{{2,4}}$|^[A-Z]{{2,4}}BNK$', text)),
        sum(1 for char in text if char.isupper()) / len(text) if text else 0,
    ]
    return features

# Load model and scaler
try:
    with open('sms_scam_model.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('sms_scam_scaler.pkl', 'rb') as f:
        scaler = pickle.load(f)
    
    # Analyze SMS
    features = extract_features("${smsText.replace(/"/g, '\\"')}")
    features_scaled = scaler.transform([features])
    prediction = model.predict(features_scaled)[0]
    probabilities = model.predict_proba(features_scaled)[0]
    
    # Generate result
    if prediction == 0:
        result = {
            'label': 'Safe',
            'confidence': float(probabilities[0]),
            'riskLevel': 'Low',
            'redFlags': [],
            'advice': 'This appears to be a legitimate message. Continue with normal caution.',
            'ml_prediction': True
        }
    else:
        red_flags = []
        if features[2]: red_flags.append('Contains bank name')
        if features[3]: red_flags.append('Contains government entity name')
        if features[4]: red_flags.append('Contains suspicious keywords')
        if features[5] > 0: red_flags.append('Uses urgency tactics')
        if features[6]: red_flags.append('Contains URL/link')
        if features[7]: red_flags.append('Uses URL shortener (potential redirection)')
        if features[8]: red_flags.append('Contains OTP')
        if features[9]: red_flags.append('Contains monetary amount')
        if features[10]: red_flags.append('Has official sender ID pattern')
        if features[11] > 0.5: red_flags.append('Uses excessive capitalization')
        
        result = {
            'label': 'Scam',
            'confidence': float(probabilities[1]),
            'riskLevel': 'High',
            'redFlags': red_flags,
            'advice': 'This is likely a scam. Do not respond, click, or share any information. Report immediately.',
            'ml_prediction': True
        }
    
    print(json.dumps(result))
    
except FileNotFoundError:
    # Fallback to rule-based analysis if ML model not available
    text_lower = "${smsText.toLowerCase().replace(/"/g, '\\"')}"
    
    # Rule-based analysis
    score = 0
    red_flags = []
    
    # Check for legitimate sources
    legitimate_entities = ['sbi', 'icici', 'hdfc', 'axis', 'pnb', 'canara', 'rbi', 'npci', 'upi']
    if any(entity in text_lower for entity in legitimate_entities):
        score -= 0.3
        red_flags.append('Message appears to be from legitimate source')
    
    # Check for suspicious patterns
    suspicious_keywords = ['kyc expired', 'prize', 'urgent', 'verify account', 'account blocked', 'otp', 'click here']
    for keyword in suspicious_keywords:
        if keyword in text_lower:
            score += 0.3
            red_flags.append(f'Contains suspicious keyword: "{keyword}"')
    
    # Check for urgency
    if any(word in text_lower for word in ['urgent', 'immediate', 'now', 'quick', 'hurry']):
        score += 0.2
        red_flags.append('Uses urgency tactics')
    
    # Check for URL shorteners
    if any(short in text_lower for short in ['bit.ly', 'tinyurl', 'goo.gl']):
        score += 0.4
        red_flags.append('Uses URL shortener (potential redirection)')
    
    # Determine result
    if score >= 0.7:
        label = 'Scam'
        risk_level = 'High'
        advice = 'This is likely a scam. Do not respond, click, or share any information. Report immediately.'
    elif score >= 0.2:
        label = 'Suspicious'
        risk_level = 'Medium'
        advice = 'Exercise caution. Do not share personal information or click suspicious links.'
    else:
        label = 'Safe'
        risk_level = 'Low'
        advice = 'This appears to be safe. Continue with normal caution.'
    
    confidence = min(0.95, max(0.6, abs(score) + 0.6))
    
    result = {
        'label': label,
        'confidence': confidence,
        'riskLevel': risk_level,
        'redFlags': red_flags,
        'advice': advice,
        'ml_prediction': False
    }
    
    print(json.dumps(result))
`

    // Write Python script to temporary file
    const fs = require('fs')
    const tempScriptPath = 'temp_ml_analysis.py'
    fs.writeFileSync(tempScriptPath, pythonScript)

    // Execute Python script
    const { stdout, stderr } = await execAsync(`python ${tempScriptPath}`)
    
    // Clean up temporary file
    fs.unlinkSync(tempScriptPath)
    
    if (stderr) {
      console.error('Python script stderr:', stderr)
    }
    
    // Parse the result
    const result = JSON.parse(stdout.trim())
    return result
    
  } catch (error) {
    console.error('ML analysis failed:', error)
    // Fallback to rule-based analysis
    return fallbackAnalysis(smsText)
  }
}

// Fallback rule-based analysis
function fallbackAnalysis(smsText: string) {
  const textLower = smsText.toLowerCase()
  let score = 0
  const redFlags: string[] = []
  
  // Check for legitimate sources
  const legitimateEntities = ['sbi', 'icici', 'hdfc', 'axis', 'pnb', 'canara', 'rbi', 'npci', 'upi']
  if (legitimateEntities.some(entity => textLower.includes(entity))) {
    score -= 0.3
    redFlags.push('Message appears to be from legitimate source')
  }
  
  // Check for suspicious patterns
  const suspiciousKeywords = ['kyc expired', 'prize', 'urgent', 'verify account', 'account blocked', 'otp', 'click here']
  suspiciousKeywords.forEach(keyword => {
    if (textLower.includes(keyword)) {
      score += 0.3
      redFlags.push(`Contains suspicious keyword: "${keyword}"`)
    }
  })
  
  // Check for urgency
  if (/\b(urgent|immediate|now|quick|hurry)\b/i.test(smsText)) {
    score += 0.2
    redFlags.push('Uses urgency tactics')
  }
  
  // Check for URL shorteners
  if (/(bit\.ly|tinyurl|goo\.gl)/i.test(smsText)) {
    score += 0.4
    redFlags.push('Uses URL shortener (potential redirection)')
  }
  
  // Determine result
  let label: 'Safe' | 'Suspicious' | 'Scam'
  let riskLevel: 'Low' | 'Medium' | 'High'
  
  if (score >= 0.7) {
    label = 'Scam'
    riskLevel = 'High'
  } else if (score >= 0.2) {
    label = 'Suspicious'
    riskLevel = 'Medium'
  } else {
    label = 'Safe'
    riskLevel = 'Low'
  }
  
  const confidence = Math.min(0.95, Math.max(0.6, Math.abs(score) + 0.6))
  
  let advice = ''
  if (label === 'Safe') {
    advice = 'This appears to be safe. Continue with normal caution.'
  } else if (label === 'Suspicious') {
    advice = 'Exercise caution. Do not share personal information or click suspicious links.'
  } else {
    advice = 'This is likely a scam. Do not respond, click, or share any information. Report immediately.'
  }
  
  return {
    label,
    confidence,
    redFlags,
    advice,
    riskLevel,
    ml_prediction: false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sms_text, type } = await request.json()
    
    if (!sms_text) {
      return NextResponse.json(
        { error: 'SMS text is required' },
        { status: 400 }
      )
    }
    
    // Try ML analysis first, fallback to rule-based if ML fails
    let result
    try {
      result = await analyzeWithML(sms_text)
    } catch (error) {
      console.error('ML analysis failed, using fallback:', error)
      result = fallbackAnalysis(sms_text)
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
