import { NextRequest, NextResponse } from 'next/server';

// Bland AI API configuration
const BLAND_AI_API_URL = 'https://api.bland.ai/v1/calls'; // Replace with actual Bland AI API URL
const BLAND_AI_API_KEY = 'your_bland_ai_api_key_here'; // Replace with your actual Bland AI API key

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

    // Prepare the request payload for Bland AI
    const payload = {
      phone_number: customerNumber,
      customer_name: customerName,
      campaign_id: campaignId || 'bland-support-campaign',
      // Add any other Bland AI specific parameters here
      voice_id: 'default', // You can customize this
      reduce_latency: true,
      // Add your Bland AI specific configuration
    };

    // Make the API call to Bland AI
    const response = await fetch(BLAND_AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BLAND_AI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Bland AI API Error:', data);
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
    agent_type: 'Server-1: Bland AI (Text-based)'
  });
}
