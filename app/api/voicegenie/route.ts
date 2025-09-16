import { NextRequest, NextResponse } from 'next/server';

const VOICEGENIE_API_URL = process.env.VOICEGENIE_API_URL || 'https://core-saas.voicegenie.ai/api/v1/pushCallToCampaign';
const VOICEGENIE_TOKEN = process.env.VOICEGENIE_TOKEN || 'YOUR_ACTUAL_VOICEGENIE_TOKEN';
const WORKSPACE_ID = process.env.VOICEGENIE_WORKSPACE_ID || 'YOUR_ACTUAL_WORKSPACE_ID';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerNumber, customerInformation, campaignId } = body;

    // Log the incoming request for debugging
    console.log('VoiceGenie API Request:', { customerNumber, campaignId, customerInformation });

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
    if (VOICEGENIE_TOKEN === 'YOUR_ACTUAL_VOICEGENIE_TOKEN' || WORKSPACE_ID === 'YOUR_ACTUAL_WORKSPACE_ID' || 
        VOICEGENIE_TOKEN === 'your_actual_voicegenie_token_here' || WORKSPACE_ID === 'your_actual_workspace_id_here') {
      return NextResponse.json(
        { 
          error: 'VoiceGenie API not properly configured. Please check environment variables.',
          solution: 'Update your .env file with actual VoiceGenie credentials. Refer to VOICEGENIE_SETUP.md for detailed instructions.'
        },
        { status: 500 }
      );
    }

    // Prepare the request payload in the exact format VoiceGenie expects
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

    console.log('Sending payload to VoiceGenie:', JSON.stringify(payload, null, 2));

    // Make the API call to VoiceGenie
    const response = await fetch(VOICEGENIE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    console.log('VoiceGenie API Response:', response.status, data);

    if (!response.ok) {
      console.error('VoiceGenie API Error:', data);
      return NextResponse.json(
        { 
          error: 'Failed to initiate call', 
          details: data,
          // Add helpful information for debugging
          debug_info: {
            campaign_id: campaignId,
            workspace_id: WORKSPACE_ID,
            api_url: VOICEGENIE_API_URL,
            status_code: response.status
          }
        },
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
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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
    setup_instructions: 'Set VOICEGENIE_TOKEN and VOICEGENIE_WORKSPACE_ID environment variables. Refer to VOICEGENIE_SETUP.md for detailed instructions.',
    note: 'The campaignId must be a valid campaign in your VoiceGenie account. Create a campaign in your VoiceGenie dashboard and use its actual ID.'
  });
}