import { NextRequest, NextResponse } from 'next/server';

// Version 3.0.0 - 100K SMS Trained Model
const VERSION = '3.0.0';
const RENDER_BACKEND_URL = process.env.RENDER_BACKEND_URL || 'https://your-render-backend.onrender.com';

interface NormalizedResult {
  classification: string;
  confidence_score: string;
  risk_level: string;
  red_flags: string[];
  recommended_action: string;
  sender_analysis?: {
    category: string;
    category_code: string;
    trust_score: number;
    description: string;
  } | null;
  analysis_details?: {
    ml_result: any;
    rule_result: any;
    gemini_result: any;
    sender_analysis: any;
    false_positive_detected: boolean;
    confidence_adjustment: string;
  };
}

// SMS Sender ID Categories (DND Classification)
const SMS_CATEGORIES = {
  's': { name: 'Service', trust_score: 0.9, description: 'Legitimate service messages (banks, companies)' },
  'g': { name: 'Government', trust_score: 0.95, description: 'Official government messages' },
  'p': { name: 'Promotional', trust_score: 0.3, description: 'Marketing and promotional messages' },
  't': { name: 'Transactional/OTP', trust_score: 0.8, description: 'One-time passwords and transaction messages' }
};

function analyzeSmsSenderId(senderId: string) {
  if (!senderId) return null;
  
  const lastChar = senderId.toUpperCase().slice(-1);
  const category = SMS_CATEGORIES[lastChar as keyof typeof SMS_CATEGORIES];
  
  if (category) {
    return {
      category: category.name,
      category_code: lastChar.toLowerCase(),
      trust_score: category.trust_score,
      description: category.description
    };
  }
  
  return {
    category: 'Unknown',
    category_code: 'unknown',
    trust_score: 0.5,
    description: 'Unknown sender ID pattern'
  };
}

function immediateBlockingCheck(text: string, senderId: string = ''): NormalizedResult | null {
  const textLower = text.toLowerCase();
  
  // STEP 0: SMS Sender ID Analysis (NEW FEATURE!)
  const senderAnalysis = analyzeSmsSenderId(senderId);
  if (senderAnalysis && senderAnalysis.category_code in ['s', 'g', 't'] && senderAnalysis.trust_score >= 0.8) {
    return {
      classification: 'Safe',
      confidence_score: `${(senderAnalysis.trust_score * 100).toFixed(1)}%`,
      risk_level: 'Low',
      red_flags: [],
      recommended_action: `This appears to be a legitimate ${senderAnalysis.category} message. Continue with normal caution.`,
      sender_analysis: senderAnalysis
    };
  }
  
  // STEP 1: Legitimate providers whitelist
  const legitimateProviders = [
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
  ];
  
  for (const provider of legitimateProviders) {
    if (textLower.includes(provider)) {
      return {
        classification: 'Safe',
        confidence_score: '95%',
        risk_level: 'Low',
        red_flags: [],
        recommended_action: `This is a legitimate message from ${provider}. Continue with normal caution.`,
        sender_analysis: senderAnalysis
      };
    }
  }
  
  // STEP 2: Immediate hard-coded blocking patterns
  const immediateBlockPatterns = [
    {
      pattern: /bank\s+credit.*click/i,
      reason: 'Bank credit + click pattern (IMMEDIATE BLOCK)'
    },
    {
      pattern: /bank\s+debit.*click/i,
      reason: 'Bank debit + click pattern (IMMEDIATE BLOCK)'
    },
    {
      pattern: /credit.*inr.*click/i,
      reason: 'Credit + INR + click pattern (IMMEDIATE BLOCK)'
    },
    {
      pattern: /debit.*inr.*click/i,
      reason: 'Debit + INR + click pattern (IMMEDIATE BLOCK)'
    },
    {
      pattern: /urgent.*bank.*suspended/i,
      reason: 'Urgent bank suspension threat (IMMEDIATE BLOCK)'
    },
    {
      pattern: /lottery.*won.*click/i,
      reason: 'Lottery scam pattern (IMMEDIATE BLOCK)'
    },
    {
      pattern: /inheritance.*claim.*click/i,
      reason: 'Inheritance scam pattern (IMMEDIATE BLOCK)'
    },
    {
      pattern: /share.*otp/i,
      reason: 'OTP sharing request (IMMEDIATE BLOCK)'
    },
    {
      pattern: /provide.*otp/i,
      reason: 'OTP provision request (IMMEDIATE BLOCK)'
    }
  ];
  
  for (const { pattern, reason } of immediateBlockPatterns) {
    if (pattern.test(text)) {
      return {
        classification: 'Scam',
        confidence_score: '95%',
        risk_level: 'High',
        red_flags: [reason],
        recommended_action: 'BLOCKED: This is a confirmed scam. Do not interact.',
        sender_analysis: senderAnalysis
      };
    }
  }
  
  // STEP 3: Amount + action patterns (more specific)
  const amountActionPatterns = [
    /\d{4,}.*(?:inr|rs|₹).*(?:click|link|verify|confirm)/i,
    /(?:inr|rs|₹).*\d{4,}.*(?:click|link|verify|confirm)/i
  ];
  
  for (const pattern of amountActionPatterns) {
    if (pattern.test(text)) {
      return {
        classification: 'Suspicious',
        confidence_score: '80%',
        risk_level: 'Medium',
        red_flags: ['Large amount + action request'],
        recommended_action: 'This appears suspicious. Exercise extreme caution.',
        sender_analysis: senderAnalysis
      };
    }
  }
  
  // STEP 4: Promotional sender ID with suspicious content
  if (senderAnalysis && senderAnalysis.category_code === 'p') {
    const promotionalScamPatterns = [
      /won.*prize/i,
      /free.*money/i,
      /congratulations.*click/i,
      /claim.*reward/i
    ];
    
    for (const pattern of promotionalScamPatterns) {
      if (pattern.test(text)) {
        return {
          classification: 'Scam',
          confidence_score: '90%',
          risk_level: 'High',
          red_flags: ['Promotional sender with scam content'],
          recommended_action: 'BLOCKED: Promotional scam detected. Do not interact.',
          sender_analysis: senderAnalysis
        };
      }
    }
  }
  
  return null; // No immediate blocking, proceed to backend analysis
}

async function callRenderBackend(text: string, phone: string, url: string, senderId: string): Promise<NormalizedResult> {
  try {
    const response = await fetch(`${RENDER_BACKEND_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        phone,
        url,
        sender_id: senderId
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const result = await response.json();
    return result as NormalizedResult;
  } catch (error) {
    console.error('Render backend error:', error);
    throw error;
  }
}

function fallbackAnalysis(text: string, phone: string, url: string, senderId: string): NormalizedResult {
  const textLower = text.toLowerCase();
  let score = 0;
  const redFlags: string[] = [];
  
  // SMS Sender ID Analysis
  const senderAnalysis = analyzeSmsSenderId(senderId);
  
  // Rule-based scoring
  const scamPatterns = [
    { pattern: /bank.*credit.*click/i, weight: 0.9, reason: 'Bank credit + click pattern' },
    { pattern: /bank.*debit.*click/i, weight: 0.9, reason: 'Bank debit + click pattern' },
    { pattern: /urgent.*bank/i, weight: 0.8, reason: 'Urgent + bank pattern' },
    { pattern: /suspended.*account/i, weight: 0.8, reason: 'Account suspension threat' },
    { pattern: /lottery.*won/i, weight: 0.9, reason: 'Lottery scam' },
    { pattern: /inheritance.*claim/i, weight: 0.9, reason: 'Inheritance scam' },
    { pattern: /free.*money/i, weight: 0.8, reason: 'Free money scam' },
    { pattern: /share.*otp/i, weight: 0.9, reason: 'OTP sharing request' },
    { pattern: /provide.*otp/i, weight: 0.9, reason: 'OTP provision request' }
  ];
  
  for (const { pattern, weight, reason } of scamPatterns) {
    if (pattern.test(text)) {
      score += weight;
      redFlags.push(reason);
    }
  }
  
  // Amount + action patterns
  if (/\d{4,}/.test(textLower) && /(click|link|verify|confirm)/.test(textLower)) {
    score += 0.8;
    redFlags.push('Large amount + action request');
  }
  
  // URL shorteners
  if (/(bit\.ly|tinyurl|goo\.gl|t\.co)/.test(textLower)) {
    score += 0.7;
    redFlags.push('URL shortener detected');
  }
  
  // Urgency indicators
  const urgencyWords = ['urgent', 'immediate', 'now', 'quick', 'hurry', 'fast'];
  if (urgencyWords.some(word => textLower.includes(word))) {
    score += 0.3;
    redFlags.push('Uses urgency tactics');
  }
  
  // Multiple exclamation marks
  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount >= 2) {
    score += 0.2 * exclamationCount;
    redFlags.push(`Uses ${exclamationCount} exclamation marks`);
  }
  
  // ALL CAPS
  const upperRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (upperRatio > 0.6) {
    score += 0.3;
    redFlags.push('Excessive capitalization');
  }
  
  // Adjust score based on SMS Sender ID
  if (senderAnalysis) {
    if (senderAnalysis.category_code === 'p') { // Promotional
      score += 0.2;
      redFlags.push('Promotional sender ID');
    } else if (senderAnalysis.category_code in ['s', 'g', 't']) { // Service, Government, Transactional
      score -= 0.1;
    }
  }
  
  const confidence = Math.min(score, 0.95);
  const isScam = score >= 0.6;
  
  if (isScam) {
    if (confidence >= 0.8) {
      return {
        classification: 'Scam',
        confidence_score: `${(confidence * 100).toFixed(1)}%`,
        risk_level: 'High',
        red_flags: redFlags.slice(0, 5),
        recommended_action: 'BLOCKED: This is a confirmed scam. Do not interact.',
        sender_analysis: senderAnalysis
      };
    } else {
      return {
        classification: 'Suspicious',
        confidence_score: `${(confidence * 100).toFixed(1)}%`,
        risk_level: 'Medium',
        red_flags: redFlags.slice(0, 5),
        recommended_action: 'This appears suspicious. Exercise extreme caution.',
        sender_analysis: senderAnalysis
      };
    }
  } else {
    if (confidence >= 0.7) {
      return {
        classification: 'Safe',
        confidence_score: `${(confidence * 100).toFixed(1)}%`,
        risk_level: 'Low',
        red_flags: [],
        recommended_action: 'This appears to be safe. Continue with normal caution.',
        sender_analysis: senderAnalysis
      };
    } else {
      return {
        classification: 'Suspicious',
        confidence_score: `${(confidence * 100).toFixed(1)}%`,
        risk_level: 'Medium',
        red_flags: redFlags.slice(0, 5),
        recommended_action: 'Exercise caution. Do not share personal information.',
        sender_analysis: senderAnalysis
      };
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, phone, url, sender_id } = body;

    if (!text && !phone && !url) {
      return NextResponse.json(
        { error: 'Provide at least one of: text, phone, url' },
        { status: 400 }
      );
    }

    // STEP 1: Immediate blocking check (including SMS Sender ID analysis)
    const immediateResult = immediateBlockingCheck(text || '', sender_id || '');
    if (immediateResult) {
      return NextResponse.json({
        ...immediateResult,
        version: VERSION,
        method: 'Frontend Immediate Blocking'
      });
    }

    // STEP 2: Try Render backend (100K trained model)
    try {
      const backendResult = await callRenderBackend(text || '', phone || '', url || '', sender_id || '');
      return NextResponse.json({
        ...backendResult,
        version: VERSION,
        method: '100K Trained Model + Gemini API'
      });
    } catch (backendError) {
      console.error('Backend failed, using fallback:', backendError);
      
      // STEP 3: Fallback to frontend analysis
      const fallbackResult = fallbackAnalysis(text || '', phone || '', url || '', sender_id || '');
      return NextResponse.json({
        ...fallbackResult,
        version: VERSION,
        method: 'Frontend Fallback Analysis'
      });
    }

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      {
        error: 'Analysis failed',
        classification: 'Error',
        confidence_score: '0%',
        risk_level: 'Unknown',
        recommended_action: 'System error occurred',
        version: VERSION
      },
      { status: 500 }
    );
  }
}
