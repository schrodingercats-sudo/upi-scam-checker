// Test script to verify VoiceGenie configuration with the exact format from the curl command

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const VOICEGENIE_API_URL = process.env.VOICEGENIE_API_URL || 'https://core-saas.voicegenie.ai/api/v1/pushCallToCampaign';
const VOICEGENIE_TOKEN = process.env.VOICEGENIE_TOKEN || 'YOUR_ACTUAL_VOICEGENIE_TOKEN';
const WORKSPACE_ID = process.env.VOICEGENIE_WORKSPACE_ID || 'YOUR_ACTUAL_WORKSPACE_ID';
const CAMPAIGN_ID = process.env.NEXT_PUBLIC_VOICEGENIE_CAMPAIGN_ID || 'voicegenie-support-campaign';

console.log('Testing VoiceGenie with curl format...');
console.log('VOICEGENIE_API_URL:', VOICEGENIE_API_URL);
console.log('VOICEGENIE_TOKEN:', VOICEGENIE_TOKEN ? 'SET' : 'NOT SET');
console.log('WORKSPACE_ID:', WORKSPACE_ID);
console.log('CAMPAIGN_ID:', CAMPAIGN_ID);

// Prepare the request payload in the exact format from the curl command
const payload = {
  token: VOICEGENIE_TOKEN,
  workspaceId: WORKSPACE_ID,
  campaignId: CAMPAIGN_ID,
  customerNumber: "10909090909",
  customerInformation: {
    first_name: "john",
    last_name: "wick"
  }
};

console.log('\nSending payload:', JSON.stringify(payload, null, 2));

fetch(VOICEGENIE_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})
.then(response => {
  console.log('\nResponse status:', response.status);
  return response.json();
})
.then(data => {
  console.log('\nResponse data:', JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('\nError:', error);
});