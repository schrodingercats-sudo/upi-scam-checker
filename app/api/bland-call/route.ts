import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("=== Bland Call API Debug ===");
    const body = await request.json();
    console.log("Request body:", body);

    // Accept both phone_number and phone
    const phoneNumber = body?.phone_number || body?.phone;
    console.log("Phone number:", phoneNumber);
    if (!phoneNumber || typeof phoneNumber !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'phone_number'" },
        { status: 400 }
      );
    }

    const apiKey = process.env.BLAND_API_KEY || "";
    const apiUrl = process.env.BLAND_API_URL || "https://api.bland.ai/v1/calls";

    console.log("API URL:", apiUrl);
    console.log("API Key exists:", !!apiKey);

    if (!apiKey) {
      return NextResponse.json(
        { error: "Server not configured", details: "Set BLAND_API_KEY" },
        { status: 500 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

         // Use exact payload structure from curl command + add required task parameter
     const payload = {
       phone_number: phoneNumber,
       task: `You are a highly intelligent and versatile AI assistant from UPI Guard. You can speak both English and Hindi fluently and are knowledgeable about virtually any topic.

When the call connects:
1. Start speaking immediately when the call connects: "Hello! Namaste! Main UPI Guard se call kar raha hun, aapka AI assistant. Main aapki kisi bhi sawal mein madad kar sakta hun. How can I help you today?"

2. You are capable of answering ANY question on ANY topic including but not limited to:
   - General knowledge and current events
   - Technology and gadgets
   - Health and fitness
   - Education and learning
   - Entertainment and movies
   - Sports and games
   - Travel and tourism
   - Food and cooking
   - Business and finance
   - Science and nature
   - History and culture
   - Personal advice and relationships
   - Scam detection and cybersecurity (your specialty)
   - Random questions and curiosities
   - ANYTHING the person asks

3. Be conversational, friendly, and extremely helpful in both languages
4. If they speak Hindi, respond in Hindi. If they speak English, respond in English
5. Provide detailed, accurate, and helpful answers to whatever they ask
6. If you don't know something specific, say so honestly but try to help them find information
7. Keep the conversation going naturally - ask follow-up questions, engage them
8. Don't hang up unless they specifically say goodbye, bye, or want to end the call
9. If they don't respond initially, wait 3-5 seconds then ask: "Hello? Are you there? / Kya aap yahan hain?"
10. Be ready for completely random questions - you can handle anything!
11. Make the conversation engaging - ask them questions, show interest in their topics

Remember: You're a versatile AI assistant who can help with ANY topic. Be patient, informative, supportive, and comprehensive in both English and Hindi. Answer every question they ask to the best of your ability, no matter how random or unexpected it might be. Keep the conversation flowing naturally.`,
               voice: "June",
        wait_for_greeting: false,
        record: true,
        answered_by_enabled: true,
        noise_cancellation: false,
        interruption_threshold: 300,
        block_interruptions: false,
        max_duration: 600,
       model: "base",
       language: "en-IN",
       background_track: "none",
       endpoint: "https://api.bland.ai",
       voicemail_action: "hangup",
     } as Record<string, unknown>;

    console.log("Final payload:", payload);

    let upstreamResponse: Response;
    try {
      // First attempt: raw API key (per user snippet)
      console.log("Attempting with raw API key...");
      upstreamResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apiKey,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

             // If unauthorized/forbidden, retry with Bearer format (though curl shows raw API_KEY)
       if (upstreamResponse.status === 401 || upstreamResponse.status === 403) {
         console.log("Got 401/403, retrying with Bearer...");
         try { upstreamResponse.body?.cancel(); } catch {}
         upstreamResponse = await fetch(apiUrl, {
           method: "POST",
           headers: {
             "Content-Type": "application/json",
             Authorization: `Bearer ${apiKey}`,
           },
           body: JSON.stringify(payload),
           signal: controller.signal,
         });
       }
    } finally {
      clearTimeout(timeout);
    }

    const text = await upstreamResponse.text();
    // Log upstream status and body for debugging (server-side only)
    console.log("Bland API status:", upstreamResponse.status);
    try { console.log("Bland API body:", JSON.parse(text)); } catch { console.log("Bland API body:", text); }
    console.log("=== End Debug ===");
    const maybeJson = safeJson(text);

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        {
          error: "Bland API error",
          status: upstreamResponse.status,
          body: maybeJson ?? text,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, data: maybeJson ?? text });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const aborted = (error as any)?.name === "AbortError";
    return NextResponse.json(
      { error: aborted ? "Upstream timeout" : "Internal error", detail: message },
      { status: aborted ? 504 : 500 }
    );
  }
}

function safeJson(input: string): unknown | null {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}


