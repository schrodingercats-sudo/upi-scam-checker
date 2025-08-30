# 🎙️ VoiceGenie AI Agent Integration

## Overview
VoiceGenie AI agent has been successfully integrated into the UPI Guard application to provide AI-powered customer support through voice calls. This integration allows customers to receive automated support calls with natural conversation capabilities.

## Features
- 🤖 **AI-Powered Voice Support**: Automated customer support calls
- 📞 **24/7 Availability**: Round-the-clock support availability
- 🎯 **Personalized Conversations**: Customer information integration
- 🔒 **Secure & Private**: Protected customer conversations
- 🌐 **Easy Integration**: Simple API-based integration

## API Configuration

### VoiceGenie API Details
- **API URL**: `https://core-saas.voicegenie.ai/api/v1/pushCallToCampaign`
- **Token**: `2af458a64a0ddf1837c9699f5bcbff72`
- **Workspace ID**: `68b2aafe725592f6d543b250`

### API Endpoint
```
POST /api/voicegenie
```

### Request Body
```json
{
  "customerNumber": "string (required)",
  "campaignId": "string (required)",
  "customerInformation": {
    "first_name": "string (optional)",
    "last_name": "string (optional)"
  }
}
```

### Response
```json
{
  "success": true,
  "message": "Call initiated successfully",
  "data": {
    // VoiceGenie API response data
  }
}
```

## Components

### 1. VoiceGenieSupport Component
**Location**: `app/components/VoiceGenieSupport.tsx`

A React component that provides a user-friendly interface for initiating VoiceGenie support calls.

**Features**:
- Phone number input validation
- Campaign ID management
- Customer information collection
- Real-time status updates
- Error handling

### 2. VoiceGenie API Route
**Location**: `app/api/voicegenie/route.ts`

Next.js API route that handles VoiceGenie API integration.

**Features**:
- Input validation
- Error handling
- Secure API communication
- Response formatting

### 3. Support Page
**Location**: `app/support/page.tsx`

Dedicated support page with VoiceGenie integration and additional support options.

## Usage

### For Customers
1. Navigate to the Support page (`/support`)
2. Fill in the customer's phone number
3. Provide the VoiceGenie campaign ID
4. Optionally add customer information
5. Click "Initiate Support Call"
6. VoiceGenie AI will automatically call the customer

### For Developers
```typescript
// Example API call
const response = await fetch('/api/voicegenie', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    customerNumber: '+1234567890',
    campaignId: 'your-campaign-id',
    customerInformation: {
      first_name: 'John',
      last_name: 'Doe'
    }
  }),
});

const result = await response.json();
```

## Testing

### Test Component
A test component is available at `/support` to verify the VoiceGenie API integration.

**Features**:
- API connectivity testing
- Response validation
- Error simulation
- Real-time feedback

### Manual Testing
1. Visit `/support`
2. Use the "Test VoiceGenie API" button
3. Check the response for successful integration
4. Verify error handling with invalid data

## Security Considerations

### API Token Security
- The VoiceGenie token is stored in the API route
- Consider moving to environment variables for production
- Implement rate limiting for API calls

### Data Privacy
- Customer phone numbers are transmitted securely
- Personal information is optional and encrypted
- API responses are logged for debugging only

## Error Handling

### Common Errors
1. **Invalid Phone Number**: Phone number format validation
2. **Missing Campaign ID**: Required field validation
3. **API Connection Issues**: Network error handling
4. **VoiceGenie API Errors**: External API error responses

### Error Responses
```json
{
  "error": "Error description",
  "details": "Additional error information"
}
```

## Deployment

### Environment Variables
For production deployment, consider setting these environment variables:

```env
VOICEGENIE_API_URL=https://core-saas.voicegenie.ai/api/v1/pushCallToCampaign
VOICEGENIE_TOKEN=your_token_here
VOICEGENIE_WORKSPACE_ID=your_workspace_id_here
```

### API Route Updates
Update the API route to use environment variables:

```typescript
const VOICEGENIE_API_URL = process.env.VOICEGENIE_API_URL || 'https://core-saas.voicegenie.ai/api/v1/pushCallToCampaign';
const VOICEGENIE_TOKEN = process.env.VOICEGENIE_TOKEN || '2af458a64a0ddf1837c9699f5bcbff72';
const WORKSPACE_ID = process.env.VOICEGENIE_WORKSPACE_ID || '68b2aafe725592f6d543b250';
```

## Monitoring

### Logging
- API calls are logged for debugging
- Error responses are captured
- Success metrics are tracked

### Analytics
- Call initiation success rate
- API response times
- Error frequency and types

## Future Enhancements

### Planned Features
1. **Call History**: Track initiated calls
2. **Analytics Dashboard**: Call performance metrics
3. **Campaign Management**: Multiple campaign support
4. **Integration with CRM**: Customer data synchronization
5. **Multi-language Support**: International call support

### Technical Improvements
1. **Webhook Integration**: Real-time call status updates
2. **Call Recording**: Conversation analytics
3. **Sentiment Analysis**: Customer satisfaction tracking
4. **Automated Follow-up**: Scheduled callback reminders

## Support

### Documentation
- API documentation: `/api/voicegenie` (GET request)
- Component documentation: See component files
- Integration guide: This document

### Troubleshooting
1. Check API connectivity
2. Verify token and workspace ID
3. Validate phone number format
4. Review error logs
5. Test with VoiceGenie test component

### Contact
For technical support or questions about the VoiceGenie integration:
- Email: support@upiguard.com
- Documentation: This file
- Test Component: `/support` page

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: ✅ Active and Integrated
