// Test script to verify VoiceGenie configuration
console.log('Testing VoiceGenie configuration...');

// Check if environment variables are set
const voicegenieToken = process.env.VOICEGENIE_TOKEN;
const voicegenieWorkspaceId = process.env.VOICEGENIE_WORKSPACE_ID;

console.log('VOICEGENIE_TOKEN:', voicegenieToken ? 'SET' : 'NOT SET');
console.log('VOICEGENIE_WORKSPACE_ID:', voicegenieWorkspaceId ? 'SET' : 'NOT SET');

if (voicegenieToken && voicegenieWorkspaceId) {
  if (voicegenieToken !== 'YOUR_ACTUAL_VOICEGENIE_TOKEN' && voicegenieWorkspaceId !== 'YOUR_ACTUAL_WORKSPACE_ID' && voicegenieToken !== 'your_actual_voicegenie_token_here' && voicegenieWorkspaceId !== 'your_actual_workspace_id_here') {
    console.log('✅ VoiceGenie configuration appears to be properly set');
    console.log('   You should now be able to use the VoiceGenie integration');
  } else {
    console.log('⚠️  VoiceGenie configuration is set but using placeholder values');
    console.log('   Please update your .env file with actual VoiceGenie credentials');
    console.log('   Refer to VOICEGENIE_SETUP.md for detailed instructions');
  }
} else {
  console.log('❌ VoiceGenie configuration is missing');
  console.log('   Please add VOICEGENIE_TOKEN and VOICEGENIE_WORKSPACE_ID to your .env file');
  console.log('   Refer to VOICEGENIE_SETUP.md for detailed instructions');
}

console.log('\nFor more information, please check the VOICEGENIE_SETUP.md file in your project directory.');