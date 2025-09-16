import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from "@/lib/rateLimiter";

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = rateLimit(request);
  if (rateLimitResult.exceeded) {
    return rateLimitResult.response;
  }

  try {
    const { text, deepseekAnalysis } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Prepare the analysis prompt for Gemini - Primary analysis only
    const isDeepSeekAvailable = deepseekAnalysis && !deepseekAnalysis.includes('unavailable') && !deepseekAnalysis.includes('failed');
    
    const prompt = `You are a senior cybersecurity expert performing comprehensive scam analysis.

TASK: Analyze this SMS message for fraud/scam detection and provide a final assessment.

SMS MESSAGE: "${text}"

${isDeepSeekAvailable ? `DEEPSEEK ANALYSIS: ${deepseekAnalysis}` : 'DEEPSEEK ANALYSIS: Unavailable'}

Please provide a COMPREHENSIVE ANALYSIS in this EXACT format:

**Final Classification**: [Safe/Suspicious/Scam]
**Risk Level**: [Low/Medium/High/Critical]
**Key Evidence**: [Summarize the most important red flags or safe indicators in 2-3 clear sentences]
**Immediate Action**: [Provide 2-3 specific, actionable steps the user should take right now]
**Confidence**: [X]% - [Brief explanation of confidence level]

IMPORTANT: Use the exact format above with bold headers and clear, concise responses. 

${isDeepSeekAvailable ? 
  'If DeepSeek analysis is available, consider it in your assessment and cross-validate findings.' :
  'Provide a comprehensive primary analysis focusing on all potential threats and red flags.'
}

Focus on:
- UPI payment scams and banking fraud
- Phishing attempts and social engineering
- Impersonation attacks and urgency tactics
- Suspicious links, numbers, or requests
- Grammar and spelling inconsistencies
- Unusual financial requests or OTP demands

Provide a thorough, professional analysis that users can trust for their security decisions.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800,
          topP: 0.8,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return NextResponse.json({ error: 'Gemini finalization failed' }, { status: 500 });
    }

    const data = await response.json();
    const geminiAnalysis = data.candidates[0]?.content?.parts[0]?.text || 'Finalization failed';

    // Parse the final analysis - Gemini only
    const finalAnalysis = {
      label: 'Analyzing...',
      confidence: 0.5,
      riskLevel: 'Medium',
      redFlags: [],
      advice: geminiAnalysis,
      finalVerification: geminiAnalysis,
      analysisSteps: {
        mlModel: null,
        deepseekReasoning: null,
        geminiFinalization: geminiAnalysis
      }
    };

    // Extract structured data from Gemini response
    try {
      // Try to parse the structured response
      const lines = geminiAnalysis.split('\n');
      for (const line of lines) {
        if (line.includes('**Final Classification**:')) {
          const classification = line.split('**Final Classification**:')[1]?.trim();
          if (classification) finalAnalysis.label = classification;
        }
        if (line.includes('**Risk Level**:')) {
          const risk = line.split('**Risk Level**:')[1]?.trim();
          if (risk) finalAnalysis.riskLevel = risk;
        }
        if (line.includes('**Confidence**:')) {
          const confidenceMatch = line.match(/(\d+)%/);
          if (confidenceMatch) {
            finalAnalysis.confidence = parseInt(confidenceMatch[1]) / 100;
          }
        }
      }
    } catch (error) {
      console.log('Error parsing Gemini response:', error);
    }

    return NextResponse.json({
      success: true,
      analysis: geminiAnalysis,
      finalAnalysis,
      model: 'gemini-1.5-flash'
    });

  } catch (error) {
    console.error('Gemini finalization error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}