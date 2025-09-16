import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerNumber, customerName, campaignId } = body;

    // Validate required fields
    if (!customerNumber) {
      return NextResponse.json(
        { error: 'Customer number is required' },
        { status: 400 }
      );
    }

    if (!customerName) {
      return NextResponse.json(
        { error: 'Customer name is required' },
        { status: 400 }
      );
    }

    // Get API configuration from environment variables
    const apiKey = process.env.BLAND_API_KEY || 'org_c8a22ff3298e118a5c52593ad141a16c3989eb699914ed4820197d6b52e77b240ab8e7382e19a5c280a969';
    const apiUrl = process.env.BLAND_API_URL || 'https://api.bland.ai/v1/calls';

    if (!apiKey || apiKey === 'your_bland_ai_api_key_here') {
      return NextResponse.json(
        { error: 'Server not configured', details: 'Set BLAND_API_KEY in environment variables' },
        { status: 500 }
      );
    }

    // Prepare the enhanced request payload for Bland AI with better task description
    const payload = {
      phone_number: customerNumber,
      task: `You are a highly intelligent and versatile AI assistant from UPI Guard (https://upiguard.netlify.app). You can speak both English and Hindi fluently and are knowledgeable about virtually any topic.

When the call connects:
1. Start speaking immediately when the call connects: "Hello! Namaste! Main UPI Guard se call kar raha hun, aapka AI assistant. Main aapki kisi bhi sawal mein madad kar sakta hun. How can I help you today?"

2. You are capable of answering ANY question on ANY topic including but not limited to:
   - UPI Guard services and scam detection features
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

3. About UPI Guard (https://upiguard.netlify.app):
   - It's an AI-powered digital scam detection tool for Indian users
   - Detects UPI fraud, suspicious online activities, and other digital scams
   - Analyzes SMS messages, URLs, and call audio files
   - Features real-time results with instant risk assessment
   - Has a real-time feedback system that improves over time
   - Privacy-first approach with client-side analysis
   - You are part of this system as the customer support AI agent

4. Be conversational, friendly, and extremely helpful in both languages
5. If they speak Hindi, respond in Hindi. If they speak English, respond in English
6. Provide detailed, accurate, and helpful answers to whatever they ask
7. If you don't know something specific, say so honestly but try to help them find information
8. Keep the conversation going naturally - ask follow-up questions, engage them
9. Don't hang up unless they specifically say goodbye, bye, or want to end the call
10. If they don't respond initially, wait 3-5 seconds then ask: "Hello? Are you there? / Kya aap yahan hain?"
11. Be ready for completely random questions - you can handle anything!
12. Make the conversation engaging - ask them questions, show interest in their topics

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
      voicemail_action: "hangup",
      customer_name: customerName,
      campaign_id: campaignId || 'bland-support-campaign'
    };

    // Make the API call to Bland AI
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey, // Use raw API key as shown in working implementation
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Bland AI API Error:', data);
      
      // If unauthorized, try with Bearer format
      if (response.status === 401 || response.status === 403) {
        const retryResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        });
        
        const retryData = await retryResponse.json();
        
        if (!retryResponse.ok) {
          return NextResponse.json(
            { error: 'Failed to initiate Bland AI call', details: retryData },
            { status: retryResponse.status }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Bland AI call initiated successfully',
          data: retryData,
          agent: 'bland-ai'
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to initiate Bland AI call', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bland AI call initiated successfully',
      data: data,
      agent: 'bland-ai'
    });

  } catch (error) {
    console.error('Bland AI API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Bland AI API endpoint',
    endpoints: {
      POST: '/api/bland-ai - Initiate Bland AI support call'
    },
    required_fields: {
      customerNumber: 'string - Customer phone number',
      customerName: 'string - Customer name',
      campaignId: 'string - Optional campaign ID'
    },
    agent_type: 'Server-1: Bland AI (Text-based)',
    configuration: {
      language_support: 'English and Hindi',
      voice: 'June',
      max_duration: '600 seconds',
      features: 'Bilingual support, scam detection expertise, general knowledge'
    }
  });
}