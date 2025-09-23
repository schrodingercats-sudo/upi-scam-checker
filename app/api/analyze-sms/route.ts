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
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        const basicResponse = await fetch(`${backendUrl}/analyze-basic`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
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
            console.log('Basic analysis fallback failed, providing generic error.');
            finalAdvice = 'Could not analyze message. All analysis systems are currently unavailable.';
        }
      } catch (error) {
        console.error('Error calling basic analysis fallback:', error);
        finalAdvice = 'Could not analyze message. An error occurred while contacting analysis systems.';
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
