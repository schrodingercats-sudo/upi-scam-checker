import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MessageAnalysisRequestSchema } from "../shared/types";

const app = new Hono<{ Bindings: Env }>();

app.use("/*", cors());

// Analyze message endpoint
app.post("/api/analyze", zValidator("json", MessageAnalysisRequestSchema), async (c) => {
  try {
    const { message_content, message_type } = c.req.valid("json");
    
    // Initialize Google Gemini AI client
    const genAI = new GoogleGenerativeAI(c.env.GOOGLE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create detailed prompt for UPI scam detection
    const prompt = `You are a highly specialized UPI (Unified Payments Interface) scam detection AI designed for deployment in fintech applications. Your role is to analyze SMS messages, WhatsApp messages, and emails to identify potential fraud and scams related to digital banking and UPI transactions.

Key capabilities:
- Detect phishing attempts, fake payment confirmations, and social engineering
- Identify suspicious URLs, phone numbers, and sender information
- Recognize common scam patterns in Indian digital payment systems
- Analyze language patterns, urgency tactics, and legitimacy indicators
- Provide actionable security recommendations

You must respond with ONLY a valid JSON object in this exact format (no additional text before or after):
{
  "summary": "Brief 2-3 sentence summary of the analysis",
  "risk_factors": ["Array of specific red flags found"],
  "legitimacy_indicators": ["Array of signs that suggest legitimacy"],
  "recommendations": ["Array of specific actions the user should take"],
  "technical_analysis": "Detailed technical explanation of findings",
  "risk_score": 1-10,
  "is_scam": true/false
}

CRITICAL: Respond with ONLY the JSON object above. No markdown, no explanations, no extra text.

Analyze this ${message_type} message for UPI/digital banking scam indicators:

Message Content:
"""
${message_content}
"""

JSON response:`;

    // Call Google Gemini API
    const geminiResult = await model.generateContent(prompt);
    const geminiResponse = await geminiResult.response;
    let analysisText = geminiResponse.text();
    if (!analysisText) {
      throw new Error("No analysis received from Google Gemini");
    }

    // Extract JSON from the response (handle cases where AI includes extra text)
    let analysis;
    try {
      // First try direct parsing
      analysis = JSON.parse(analysisText);
    } catch (error) {
      try {
        // Try to extract JSON from within the response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (secondError) {
        // If all else fails, create a fallback analysis
        analysis = {
          summary: "Unable to parse AI response. Message requires manual review.",
          risk_factors: ["AI analysis failed"],
          legitimacy_indicators: [],
          recommendations: ["Manually review this message for potential scam indicators"],
          technical_analysis: "AI analysis parsing failed. Response was: " + analysisText.substring(0, 200),
          risk_score: 5,
          is_scam: false
        };
      }
    }

    // Validate risk score
    const riskScore = Math.max(1, Math.min(10, analysis.risk_score || 5));
    const isScam = analysis.is_scam || riskScore >= 7;

    // Store analysis in database
    const dbResult = await c.env.DB.prepare(`
      INSERT INTO message_analyses (message_content, message_type, analysis_result, risk_score, is_scam, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      message_content,
      message_type,
      JSON.stringify(analysis),
      riskScore,
      isScam ? 1 : 0
    ).run();

    const analysisId = dbResult.meta.last_row_id;

    // Return formatted response
    const analysisResponse = {
      id: analysisId,
      message_content,
      message_type,
      analysis_result: analysis,
      risk_score: riskScore,
      is_scam: isScam,
      created_at: new Date().toISOString(),
    };

    return c.json(analysisResponse);

  } catch (error) {
    // Log error (console not available in worker environment)
    return c.json(
      { 
        error: "Failed to analyze message",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      500
    );
  }
});

// Get analysis history
app.get("/api/history", async (c) => {
  try {
    const results = await c.env.DB.prepare(`
      SELECT id, message_content, message_type, analysis_result, risk_score, is_scam, created_at
      FROM message_analyses
      ORDER BY created_at DESC
      LIMIT 50
    `).all();

    const history = results.results.map((row: any) => ({
      id: row.id,
      message_content: row.message_content,
      message_type: row.message_type,
      analysis_result: JSON.parse(row.analysis_result),
      risk_score: row.risk_score,
      is_scam: row.is_scam === 1,
      created_at: row.created_at,
    }));

    return c.json(history);
  } catch (error) {
    // Log error (console not available in worker environment)
    return c.json({ error: "Failed to fetch analysis history" }, 500);
  }
});

export default app;
