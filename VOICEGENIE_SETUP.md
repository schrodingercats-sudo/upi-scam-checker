# 🎙️ VoiceGenie Setup Guide

## Overview
This guide explains how to properly configure VoiceGenie for the UPI Guard application. VoiceGenie provides AI-powered customer support through voice calls.

## Prerequisites
1. A VoiceGenie account
2. A configured campaign in your VoiceGenie dashboard
3. Your VoiceGenie API credentials

## Setup Instructions

### 1. Sign Up for VoiceGenie
1. Visit the VoiceGenie website and create an account
2. Complete the registration process
3. Navigate to your dashboard

### 2. Obtain Your Credentials
In your VoiceGenie dashboard, locate:
- **API Token**: Found in the API settings section
- **Workspace ID**: Found in the workspace settings section

### 3. Create a Campaign
1. In your VoiceGenie dashboard, navigate to the Campaigns section
2. Create a new campaign for UPI Guard support
3. Note the **Campaign ID** for use in the application

### 4. Configure Environment Variables
Update your [.env](file:///c:/Users/prath/OneDrive/Desktop/projects/upi checker/.env) file with your actual VoiceGenie credentials:

```env
# VoiceGenie Configuration for AI Customer Support
VOICEGENIE_API_URL=https://core-saas.voicegenie.ai/api/v1/pushCallToCampaign
VOICEGENIE_TOKEN=your_actual_voicegenie_token_here
VOICEGENIE_WORKSPACE_ID=your_actual_workspace_id_here
```

Replace the placeholder values with your actual credentials.

### 5. Verify Configuration
Run the test script to verify your configuration:

```bash
node -r dotenv/config test-voicegenie-config.js
```

You should see a message indicating that the VoiceGenie configuration is properly set.

## Common Issues and Troubleshooting

### "Invalid campaignId or workspaceId" Error
This error occurs when:
1. The campaign ID doesn't exist in your VoiceGenie account
2. The workspace ID is incorrect
3. Your API token doesn't have access to the specified workspace

**Solution**: 
- Double-check your campaign ID in the VoiceGenie dashboard
- Verify your workspace ID is correct
- Ensure your API token has the necessary permissions

### "VoiceGenie API not properly configured" Error
This error occurs when the environment variables are not set or are using placeholder values.

**Solution**:
- Check that your [.env](file:///c:/Users/prath/OneDrive/Desktop/projects/upi checker/.env) file contains the VOICEGENIE_TOKEN and VOICEGENIE_WORKSPACE_ID variables
- Ensure the values are your actual credentials, not the placeholder values

## Testing the Integration
After configuring your credentials:

1. Start the development server: `npm run dev`
2. Navigate to a page with VoiceGenie integration (e.g., /support)
3. Fill in the form with:
   - A valid phone number
   - A valid campaign ID from your VoiceGenie dashboard
   - Optional customer information
4. Submit the form and verify that the call is initiated

## Security Considerations
- Never commit your actual API credentials to version control
- Use environment variables to store sensitive information
- Rotate your API tokens periodically for security
- Restrict API token permissions to only what is necessary

## Support
For issues with the VoiceGenie integration:
- Check the VoiceGenie documentation
- Contact VoiceGenie support for API-related issues
- Review the application logs for detailed error messages