// Test script to directly test VoiceGenie API with the same format as their curl command
require('dotenv').config();

// Simple phone number formatter for Indian numbers
function formatPhoneNumber(phoneNumber) {
  // Remove all non-digit characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // If it already starts with +91, return as is
  if (cleaned.startsWith('+91') && cleaned.length === 12) {
    return cleaned;
  }
  
  // If it starts with 91 and has 12 digits, add +
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return '+' + cleaned;
  }
  
  // If it's 10 digits and starts with 6,7,8,9 (Indian mobile format), add +91
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    return '+91' + cleaned;
  }
  
  // If it's 11 digits and starts with 0, remove 0 and add +91
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return '+91' + cleaned.substring(1);
  }
  
  // Return as is if we can't format it
  return cleaned;
}

async function testVoiceGenieDirect() {
  console.log('Testing VoiceGenie API directly...');
  
  // Get environment variables
  const token = process.env.VOICEGENIE_TOKEN;
  const workspaceId = process.env.VOICEGENIE_WORKSPACE_ID;
  const campaignId = process.env.NEXT_PUBLIC_VOICEGENIE_CAMPAIGN_ID || 'voicegenie-support-campaign';
  
  console.log('Environment variables:');
  console.log('  Token:', token ? 'SET' : 'NOT SET');
  console.log('  Workspace ID:', workspaceId ? 'SET' : 'NOT SET');
  console.log('  Campaign ID:', campaignId);
  
  if (!token || !workspaceId) {
    console.log('❌ Missing required environment variables');
    return;
  }
  
  // Test payload (same as their curl example)
  const payload = {
    token: token,
    workspaceId: workspaceId,
    campaignId: campaignId,
    customerNumber: formatPhoneNumber("+91 6354315878"), // Using your actual number from the registry
    customerInformation: {
      first_name: "John",
      last_name: "Wick"
    }
  };
  
  console.log('\nSending payload:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch('https://core-saas.voicegenie.ai/api/v1/pushCallToCampaign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    
    console.log('\nResponse Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ VoiceGenie API call successful');
    } else {
      console.log('❌ VoiceGenie API call failed');
      if (data.message) {
        console.log('Error message:', data.message);
      }
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testVoiceGenieDirect();