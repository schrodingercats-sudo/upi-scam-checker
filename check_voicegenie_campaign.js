// Script to check VoiceGenie campaign status
require('dotenv').config();

async function checkVoiceGenieCampaign() {
  console.log('Checking VoiceGenie Campaign Status...\n');
  
  const token = process.env.VOICEGENIE_TOKEN;
  const workspaceId = process.env.VOICEGENIE_WORKSPACE_ID;
  const campaignId = process.env.NEXT_PUBLIC_VOICEGENIE_CAMPAIGN_ID;
  
  console.log('Campaign ID:', campaignId);
  console.log('Workspace ID:', workspaceId);
  
  // Try to get campaign details (if API supports it)
  try {
    console.log('\nAttempting to retrieve campaign details...');
    
    // This might not work as VoiceGenie may not have this endpoint
    // But it's worth trying
    const response = await fetch(`https://core-saas.voicegenie.ai/api/v1/campaigns/${campaignId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Campaign Details:', JSON.stringify(data, null, 2));
    } else {
      console.log('Unable to retrieve campaign details directly.');
      console.log('This is normal as VoiceGenie may not expose this endpoint.');
    }
  } catch (error) {
    console.log('API does not support campaign retrieval, which is normal.');
  }
  
  console.log('\n=== ACTION ITEMS ===');
  console.log('1. Log in to your VoiceGenie dashboard');
  console.log('2. Navigate to the Campaigns section');
  console.log('3. Find your campaign:', campaignId);
  console.log('4. Check that the campaign is ACTIVE');
  console.log('5. Verify that a phone number is assigned to the campaign');
  console.log('6. Ensure there is a voice bot configured for the campaign');
  console.log('7. Check if there are any time restrictions on the campaign');
  console.log('8. Look for any error messages in the campaign logs');
}

checkVoiceGenieCampaign();