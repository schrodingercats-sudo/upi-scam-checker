// Test script to verify VoiceGenie campaign configuration
require('dotenv').config();

async function testVoiceGenieCampaign() {
  console.log('Testing VoiceGenie Campaign Configuration...');
  
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
  
  // Test campaign details retrieval
  console.log('\nChecking campaign details...');
  try {
    const campaignResponse = await fetch(`https://core-saas.voicegenie.ai/api/v1/campaigns/${campaignId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Campaign API Response Status:', campaignResponse.status);
    
    if (campaignResponse.status === 404) {
      console.log('❌ Campaign not found. Please verify your campaign ID in the VoiceGenie dashboard.');
      console.log('   Make sure you have created an actual campaign and are using its real ID.');
      return;
    }
    
    if (campaignResponse.status === 401) {
      console.log('❌ Unauthorized. Please check your VoiceGenie token.');
      return;
    }
    
    const campaignData = await campaignResponse.json();
    console.log('Campaign Details:', JSON.stringify(campaignData, null, 2));
    
    if (campaignResponse.ok) {
      console.log('✅ Campaign found and accessible');
      
      // Check if campaign is active
      if (campaignData.data && campaignData.data.status === 'active') {
        console.log('✅ Campaign is active');
      } else {
        console.log('⚠️  Campaign is not active. Please activate it in the VoiceGenie dashboard.');
      }
    } else {
      console.log('❌ Failed to retrieve campaign details');
      if (campaignData.message) {
        console.log('Error message:', campaignData.message);
      }
    }
  } catch (error) {
    console.log('❌ Error checking campaign details:', error.message);
    console.log('This might be because the VoiceGenie API doesn\'t support campaign retrieval.');
  }
}

testVoiceGenieCampaign();