import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimiter";

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = rateLimit(request);
  if (rateLimitResult.exceeded) {
    return rateLimitResult.response;
  }

  try {
    const { text } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    console.log('Starting advanced 5-step analysis pipeline for:', text.substring(0, 50) + '...');

    // Step 1: Advanced ML Model Analysis (New HEFDS System)
    let mlAnalysis = null;
    try {
      console.log('Step 1 - Starting Advanced ML analysis...');
      const mlResponse = await fetch(`${request.nextUrl.origin}/api/analyze-ml`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (mlResponse.ok) {
        const mlData = await mlResponse.json();
        mlAnalysis = mlData;
        console.log('Step 1 - Advanced ML analysis completed successfully');
      } else {
        console.log('Step 1 - Advanced ML analysis failed, proceeding to DeepSeek');
      }
    } catch (error) {
      console.log('Step 1 - Advanced ML analysis error:', error);
    }

    // Step 2: DeepSeek Analysis (Optional - may fail due to rate limits)
    let deepseekAnalysis = null;
    try {
      console.log('Step 2 - Starting DeepSeek analysis...');
      const deepseekResponse = await fetch(`${request.nextUrl.origin}/api/analyze-deepseek`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mlResult: mlAnalysis })
      });
      
      if (deepseekResponse.ok) {
        const deepseekData = await deepseekResponse.json();
        deepseekAnalysis = deepseekData.deepseekAnalysis;
        console.log('Step 2 - DeepSeek analysis completed successfully');
      } else {
        console.log('Step 2 - DeepSeek analysis failed (rate limited), proceeding to Gemini');
      }
    } catch (error) {
      console.log('Step 2 - DeepSeek analysis error:', error);
    }

    // Step 3: Gemini Primary Analysis
    let geminiAnalysis = null;
    let finalAnalysis = null;
    
    try {
      console.log('Step 3 - Starting Gemini analysis...');
      const geminiResponse = await fetch(`${request.nextUrl.origin}/api/analyze-gemini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          mlResult: mlAnalysis,
          deepseekAnalysis: deepseekAnalysis || 'DeepSeek analysis unavailable due to rate limits'
        })
      });
      
      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json();
        geminiAnalysis = geminiData.analysis;
        finalAnalysis = geminiData.finalAnalysis;
        console.log('Step 3 - Gemini analysis completed successfully');
      } else {
        console.log('Step 3 - Gemini analysis failed');
      }
    } catch (error) {
      console.log('Step 3 - Gemini analysis error:', error);
    }

    // Smart fallback system - prioritize working APIs
    let finalLabel = 'Analyzing...';
    let finalConfidence = 0.5;
    let finalRiskLevel = 'Medium';
    let finalRedFlags = [];
    let finalAdvice = 'Analysis in progress...';

    // Priority 1: Use Advanced ML model if available (highest accuracy)
    if (mlAnalysis && mlAnalysis.risk_score) {
      finalLabel = mlAnalysis.risk_score.risk_level;
      finalConfidence = mlAnalysis.risk_score.confidence;
      finalRiskLevel = mlAnalysis.risk_score.risk_level;
      finalRedFlags = mlAnalysis.risk_score.red_flags || [];
      finalAdvice = mlAnalysis.risk_score.recommended_action || mlAnalysis.risk_score.explanation;
      console.log('Using Advanced ML model analysis (HEFDS)');
    }
    // Priority 2: Use Gemini final analysis if available
    else if (finalAnalysis && finalAnalysis.label !== 'Analyzing...') {
      finalLabel = finalAnalysis.label;
      finalConfidence = finalAnalysis.confidence || 0.5;
      finalRiskLevel = finalAnalysis.riskLevel || 'Medium';
      finalRedFlags = finalAnalysis.redFlags || [];
      finalAdvice = finalAnalysis.advice || geminiAnalysis;
      console.log('Using Gemini final analysis');
    }
    // Priority 3: Use Gemini raw analysis if final analysis not available
    else if (geminiAnalysis && geminiAnalysis !== 'Finalization failed') {
      finalAdvice = geminiAnalysis;
      console.log('Using Gemini raw analysis');
    }
    // Priority 4: Use DeepSeek analysis if Gemini fails
    else if (deepseekAnalysis && deepseekAnalysis !== 'Analysis failed') {
      finalAdvice = deepseekAnalysis;
      console.log('Using DeepSeek analysis as fallback');
    }
    // Priority 5: Use basic analysis from backend if all AI models fail
    else {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (backendUrl) {
          const basicResponse = await fetch(`${backendUrl}/analyze-basic`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text }),
              signal: AbortSignal.timeout(5000) // 5 second timeout
          });
          if (basicResponse.ok) {
              const basicData = await basicResponse.json();
              finalLabel = basicData.label;
              finalConfidence = basicData.confidence;
              finalRiskLevel = basicData.riskLevel;
              finalRedFlags = basicData.redFlags;
              finalAdvice = basicData.advice;
              console.log('Using basic analysis from backend as final fallback');
          } else {
              console.log('Backend basic analysis failed, using local fallback');
              const basicAnalysis = await performBasicAnalysis(text);
              finalLabel = basicAnalysis.label;
              finalConfidence = basicAnalysis.confidence;
              finalRiskLevel = basicAnalysis.riskLevel;
              finalRedFlags = basicAnalysis.redFlags;
              finalAdvice = basicAnalysis.advice;
          }
        } else {
          console.log('Backend URL not configured, using local basic analysis');
          const basicAnalysis = await performBasicAnalysis(text);
          finalLabel = basicAnalysis.label;
          finalConfidence = basicAnalysis.confidence;
          finalRiskLevel = basicAnalysis.riskLevel;
          finalRedFlags = basicAnalysis.redFlags;
          finalAdvice = basicAnalysis.advice;
        }
      } catch (error) {
        console.error('Error calling backend basic analysis, using local fallback:', error);
        const basicAnalysis = await performBasicAnalysis(text);
        finalLabel = basicAnalysis.label;
        finalConfidence = basicAnalysis.confidence;
        finalRiskLevel = basicAnalysis.riskLevel;
        finalRedFlags = basicAnalysis.redFlags;
        finalAdvice = basicAnalysis.advice;
      }
    }

    // Prepare final result with smart fallback
    const result = {
      success: true,
      label: finalLabel,
      confidence: finalConfidence,
      redFlags: finalRedFlags,
      advice: finalAdvice,
      riskLevel: finalRiskLevel,
      mlAnalysis,           // New: Advanced ML model results
      deepseekAnalysis,
      geminiAnalysis,
      finalAnalysis,
      analysisSteps: {
        advancedML: mlAnalysis ? 'Completed' : 'Failed',
        deepseekReasoning: deepseekAnalysis,
        geminiFinalization: geminiAnalysis
      }
    };
    
    console.log('Advanced analysis pipeline completed successfully');
    console.log('Final result:', {
      label: result.label,
      confidence: result.confidence,
      riskLevel: result.riskLevel,
      hasML: !!result.mlAnalysis,
      hasDeepSeek: !!result.deepseekAnalysis,
      hasGemini: !!result.geminiAnalysis,
      adviceLength: result.advice?.length || 0
    });
    return NextResponse.json(result);

  } catch (error) {
    console.error('Advanced analysis pipeline error:', error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}

// Basic ML analysis function for fallback
async function performBasicAnalysis(text: string) {
  const lower = text.toLowerCase();

  // Enhanced security pattern detection with better weights
  const securityPatterns = {
    urgency: { regex: /kyc|verify|deadline|expiry|block|suspend|immediate|urgent|quick|before|soon/i, weight: 0.3 },
    phishing: { regex: /link|otp|pin|password|login|account|bank|upi|payment|click|update/i, weight: 0.25 },
    socialEngineering: { regex: /free|offer|reward|winner|claim|limited|exclusive/i, weight: 0.2 },
    impersonation: { regex: /sbi|hdfc|icici|axis|kotak|pnb|bank|gov|official|rbi|npci/i, weight: 0.3 },
    suspiciousLinks: { regex: /http|www|\.com|\.in|\.co|bit\.ly|tinyurl|\.tk|\.ml/i, weight: 0.25 }
  };

  let riskScore = 0;
  const redFlags: string[] = [];

  // Calculate risk based on patterns with better weighting
  Object.entries(securityPatterns).forEach(([pattern, config]) => {
    if (config.regex.test(text)) {
      riskScore += config.weight;
      redFlags.push(`${pattern.charAt(0).toUpperCase() + pattern.slice(1)} indicators detected`);
    }
  });

  // High-risk KYC scam detection
  if (lower.includes('kyc') && (lower.includes('expiry') || lower.includes('deadline') || lower.includes('verify'))) {
    riskScore += 0.4; // High weight for KYC scams
    redFlags.push('KYC expiry scam detected - High-risk pattern');
  }

  // Urgency pressure detection
  if (lower.includes('deadline') || lower.includes('urgent') || lower.includes('immediate') || lower.includes('soon')) {
    riskScore += 0.25;
    redFlags.push('Urgency pressure detected - Common scam tactic');
  }

  // Financial transaction indicators
  if (text.includes('₹') || text.includes('Rs') || text.includes('rupee') || text.includes('rs.')) {
    riskScore += 0.2;
    redFlags.push('Financial transaction mentioned');
  }

  // OTP/PIN requests
  if (lower.includes('otp') || lower.includes('pin') || lower.includes('verification code')) {
    riskScore += 0.3;
    redFlags.push('OTP/PIN request detected - Never share these');
  }

  // Suspicious formatting (all caps, excessive punctuation)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.3) {
    riskScore += 0.15;
    redFlags.push('Excessive capitalization detected - Scam indicator');
  }

  if (text.includes('!!!') || text.includes('??') || text.includes('...')) {
    riskScore += 0.1;
    redFlags.push('Suspicious punctuation patterns detected');
  }

  // Normalize risk score
  riskScore = Math.min(riskScore, 1.0);

  // Better risk classification
  let label, riskLevel, confidence;

  if (riskScore >= 0.8) {
    label = 'Scam';
    riskLevel = 'Critical';
    confidence = 0.9;
  } else if (riskScore >= 0.6) {
    label = 'Scam';
    riskLevel = 'High';
    confidence = 0.8;
  } else if (riskScore >= 0.4) {
    label = 'Suspicious';
    riskLevel = 'Medium';
    confidence = 0.7;
  } else if (riskScore >= 0.2) {
    label = 'Suspicious';
    riskLevel = 'Low';
    confidence = 0.6;
  } else {
    label = 'Safe';
    riskLevel = 'Low';
    confidence = 0.5;
  }

  // Better explanations based on risk level
  let advice;

  if (riskScore >= 0.8) {
    advice = "🚨 CRITICAL RISK: This message contains multiple scam indicators. Do NOT click any links, share personal information, or make payments. This appears to be a fraudulent attempt.";
  } else if (riskScore >= 0.6) {
    advice = "⚠️ HIGH RISK: Multiple suspicious indicators detected. Do not click links, share OTP, or make payments. Verify with official sources before proceeding.";
  } else if (riskScore >= 0.4) {
    advice = "⚠️ MEDIUM RISK: Several suspicious patterns detected. Exercise caution and verify with official sources before taking any action.";
  } else if (riskScore >= 0.2) {
    advice = "⚠️ LOW RISK: Minor suspicious indicators detected. Verify with official sources before proceeding.";
  } else {
    advice = "✅ Appears safe, but always verify with official sources before taking any action.";
  }

  return {
    label,
    confidence: parseFloat(confidence.toFixed(2)),
    redFlags,
    advice,
    riskLevel
  };
}
