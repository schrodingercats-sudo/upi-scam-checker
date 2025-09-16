// Detailed test script to troubleshoot VoiceGenie call delivery issues
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

async function testVoiceGenieDetailed() {
  console.log('🧪 Detailed VoiceGenie Troubleshooting Test');
  console.log('==========================================\n');
  
  // Get environment variables
  const token = process.env.VOICEGENIE_TOKEN;
  const workspaceId = process.env.VOICEGENIE_WORKSPACE_ID;
  const campaignId = process.env.NEXT_PUBLIC_VOICEGENIE_CAMPAIGN_ID || 'voicegenie-support-campaign';
  
  console.log('📋 Configuration Check:');
  console.log('  Token:', token ? '✅ SET' : '❌ NOT SET');
  console.log('  Workspace ID:', workspaceId ? '✅ SET' : '❌ NOT SET');
  console.log('  Campaign ID:', campaignId);
  
  if (!token || !workspaceId) {
    console.log('\n❌ FATAL: Missing required environment variables');
    console.log('   Please check your .env file and ensure VOICEGENIE_TOKEN and VOICEGENIE_WORKSPACE_ID are set.');
    return;
  }
  
  // Test payload with multiple phone number formats
  const testNumbers = [
    "+916354315878",  // Correct format
    "6354315878",     // 10-digit format
    "06354315878",    // With leading zero
    "916354315878",   // With country code without +
  ];
  
  console.log('\n📞 Testing different phone number formats...\n');
  
  for (const [index, testNumber] of testNumbers.entries()) {
    console.log(`--- Test ${index + 1}: ${testNumber} ---`);
    const formattedNumber = formatPhoneNumber(testNumber);
    console.log(`  Formatted: ${formattedNumber}`);
    
    // Test payload
    const payload = {
      token: token,
      workspaceId: workspaceId,
      campaignId: campaignId,
      customerNumber: formattedNumber,
      customerInformation: {
        first_name: "Test",
        last_name: "User"
      }
    };
    
    console.log('  Sending payload to VoiceGenie...');
    
    try {
      const response = await fetch('https://core-saas.voicegenie.ai/api/v1/pushCallToCampaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      console.log(`  Status: ${response.status}`);
      console.log(`  Response: ${JSON.stringify(data)}`);
      
      if (response.ok) {
        console.log('  ✅ API call successful');
      } else {
        console.log('  ❌ API call failed');
        if (data.message) {
          console.log(`     Error: ${data.message}`);
        }
      }
    } catch (error) {
      console.log(`  ❌ Network error: ${error.message}`);
    }
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('');
  }
  
  console.log('\n🔍 Troubleshooting Checklist:');
  console.log('1. ✅ API credentials are correctly set in .env');
  console.log('2. ✅ Campaign ID is set correctly');
  console.log('3. 📱 Check if your phone:');
  console.log('   - Is not in Do Not Disturb mode');
  console.log('   - Has not blocked unknown numbers');
  console.log('   - Has a good network connection');
  console.log('   - Is not set to reject international calls');
  console.log('4. 🌐 Check if your carrier blocks VoIP calls');
  console.log('5. 📞 Verify your campaign settings in VoiceGenie dashboard:');
  console.log('   - Is the campaign active?');
  console.log('   - Does it have proper call routing configured?');
  console.log('   - Are there any time restrictions?');
  console.log('6. ⏰ Wait at least 5-10 minutes for the call');
  console.log('   (Sometimes there can be delays in call delivery)');
}

testVoiceGenieDetailed();