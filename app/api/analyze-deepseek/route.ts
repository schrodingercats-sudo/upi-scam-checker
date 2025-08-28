import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, mlResult } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    // Retry logic for rate limiting
    const maxRetries = 3;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`DeepSeek API retry attempt ${attempt}/${maxRetries}`);
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }

    // Prepare the prompt for DeepSeek reasoning
    const prompt = `You are an expert cybersecurity analyst specializing in fraud detection and scam analysis.

TASK: Analyze the following SMS message for potential scams, fraud, or security threats.

SMS MESSAGE: "${text}"

ML MODEL ANALYSIS: ${JSON.stringify(mlResult, null, 2)}

Please provide a detailed reasoning analysis including:

1. **Threat Assessment**: What type of scam or fraud is this likely to be?
2. **Red Flags**: List specific suspicious elements and why they're concerning
3. **Social Engineering Techniques**: Identify any psychological manipulation tactics
4. **Technical Analysis**: Any technical indicators of fraud (fake URLs, spoofed numbers, etc.)
5. **Risk Level**: Low/Medium/High/Critical with confidence percentage
6. **Recommendations**: What should the user do?

Focus on:
- UPI payment scams
- Banking fraud
- Phishing attempts
- Social engineering
- Impersonation attacks
- Urgency tactics
- Suspicious links or numbers

Provide a structured, professional analysis that can be used for final verification.`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://your-website.com',
            'X-Title': 'UPI Guard - Scam Detection'
          },
                      body: JSON.stringify({
              // Try free model first, fallback to other models if rate limited
              model: attempt === 1 ? 'deepseek/deepseek-r1-0528:free' : 'deepseek/deepseek-coder-33b-instruct',
            messages: [
              {
                role: 'system',
                content: 'You are a cybersecurity expert analyzing SMS messages for fraud and scams. Provide detailed, professional analysis.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 1000,
            temperature: 0.3
          })
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error(`DeepSeek API error (attempt ${attempt}):`, errorData);
          
          // Check if it's a rate limit error
          if (response.status === 429) {
            const errorText = await response.text();
            try {
              const errorData = JSON.parse(errorText);
              if (errorData.error?.message?.includes('free-models-per-day')) {
                lastError = { 
                  status: 429, 
                  message: 'Free tier daily limit reached. Please upgrade your OpenRouter plan or wait until tomorrow.',
                  details: errorData.error.message
                };
                break; // Don't retry for daily limits
              }
            } catch (e) {
              // If we can't parse the error, treat it as a regular rate limit
              lastError = { status: 429, message: 'Rate limited, will retry' };
              continue; // Try again
            }
          }
          
          // For other errors, break and return error
          lastError = { status: response.status, message: errorData };
          break;
        }

        // Success - parse and return
        const data = await response.json();
        const deepseekAnalysis = data.choices[0]?.message?.content || 'Analysis failed';

        return NextResponse.json({
          success: true,
          deepseekAnalysis,
          reasoning: deepseekAnalysis,
          model: 'deepseek/deepseek-r1-0528:free'
        });
        
      } catch (error) {
        console.error(`DeepSeek API attempt ${attempt} failed:`, error);
        lastError = { status: 500, message: error.message };
        
        if (attempt === maxRetries) {
          break; // Don't retry on network errors
        }
      }
    }
    
    // If we get here, all retries failed
    console.error('DeepSeek API failed after all retries');
    return NextResponse.json({ 
      error: 'DeepSeek analysis failed after retries',
      details: lastError 
    }, { status: 500 });

  } catch (error) {
    console.error('DeepSeek analysis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
