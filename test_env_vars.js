// Test script to verify environment variables
require('dotenv').config({ path: '.env.local' });

console.log('NEXT_PUBLIC_VOICEGENIE_CAMPAIGN_ID:', process.env.NEXT_PUBLIC_VOICEGENIE_CAMPAIGN_ID);
console.log('VOICEGENIE_TOKEN:', process.env.VOICEGENIE_TOKEN);
console.log('VOICEGENIE_WORKSPACE_ID:', process.env.VOICEGENIE_WORKSPACE_ID);