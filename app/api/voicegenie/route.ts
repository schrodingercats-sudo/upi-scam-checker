import { NextRequest, NextResponse } from 'next/server';

const VOICEGENIE_API_URL = process.env.VOICEGENIE_API_URL || 'https://core-saas.voicegenie.ai/api/v1/pushCallToCampaign';
const VOICEGENIE_TOKEN = process.env.VOICEGENIE_TOKEN || 'YOUR_ACTUAL_VOICEGENIE_TOKEN';
const WORKSPACE_ID = process.env.VOICEGENIE_WORKSPACE_ID || 'YOUR_ACTUAL_WORKSPACE_ID';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerNumber, customerInformation, campaignId } = body;

    // Validate required fields
    if (!customerNumber) {
      return NextResponse.json(
        { error: 'Customer number is required' },
        { status: 400 }
      );
    }

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Check if VoiceGenie credentials are configured
    if (VOICEGENIE_TOKEN === 'YOUR_ACTUAL_VOICEGENIE_TOKEN' || WORKSPACE_ID === 'YOUR_ACTUAL_WORKSPACE_ID') {
      return NextResponse.json(
        { 
          error: 'VoiceGenie API not properly configured. Please check environment variables.',
          solution: 'Update your .env file with actual VoiceGenie credentials. Refer to VOICEGENIE_SETUP.md for detailed instructions.'
        },
        { status: 500 }
      );
    }

    // Prepare the request payload
    const payload = {
      token: VOICEGENIE_TOKEN,
      workspaceId: WORKSPACE_ID,
      campaignId: campaignId,
      customerNumber: customerNumber,
      customerInformation: customerInformation || {
        first_name: 'Customer',
        last_name: 'Support'
      }
    };

    // Make the API call to VoiceGenie
    const response = await fetch(VOICEGENIE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('VoiceGenie API Error:', data);
      return NextResponse.json(
        { error: 'Failed to initiate call', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Call initiated successfully',
      data: data
    });

  } catch (error) {
    console.error('VoiceGenie API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'VoiceGenie API endpoint',
    endpoints: {
      POST: '/api/voicegenie - Initiate customer support call'
    },
    required_fields: {
      customerNumber: 'string - Customer phone number',
      campaignId: 'string - VoiceGenie campaign ID',
      customerInformation: 'object - Optional customer details'
    },
    setup_instructions: 'Set VOICEGENIE_TOKEN and VOICEGENIE_WORKSPACE_ID environment variables. Refer to VOICEGENIE_SETUP.md for detailed instructions.'
  });
}