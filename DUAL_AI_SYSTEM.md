# 🤖 Dual AI Agent System - UPI Guard

## Overview
UPI Guard now features a sophisticated dual AI agent system that allows users to choose between two powerful AI assistants for customer support:

- **Server-1: Bland AI** - Text-based AI support with advanced processing capabilities
- **Server-2: VoiceGenie** - Voice-based AI support with natural conversation abilities

## System Architecture

### AI Agent Selection Flow
1. **Agent Selection** - User chooses between Bland AI or VoiceGenie
2. **Information Collection** - User provides name and phone number
3. **Smart Routing** - System routes to the appropriate AI service
4. **Call Initiation** - Selected AI agent calls the user

### Component Structure
```
UnifiedAIAgent.tsx
├── Agent Selection Interface
├── User Information Form
├── Call Status Display
└── Smart Routing Logic

API Routes:
├── /api/bland-ai (Server-1)
└── /api/voicegenie (Server-2)
```

## AI Agents Comparison

### Server-1: Bland AI
**Type**: Text-based AI Support
**Strengths**:
- Advanced text processing capabilities
- Quick response times
- Detailed explanations
- 24/7 availability
- Cost-effective solution

**Best For**:
- Technical support queries
- Detailed explanations
- Quick information retrieval
- Users who prefer text-based interactions

### Server-2: VoiceGenie
**Type**: Voice-based AI Support
**Strengths**:
- Natural voice conversations
- Human-like interactions
- Multi-language support
- Emotional intelligence
- Personalized voice experience

**Best For**:
- Complex problem solving
- Emotional support
- Users who prefer voice interactions
- Multi-language support needs

## API Integration

### Bland AI API (`/api/bland-ai`)
```typescript
POST /api/bland-ai
{
  "customerNumber": "string",
  "customerName": "string",
  "campaignId": "string (optional)"
}
```

**Configuration**:
- API URL: `https://api.bland.ai/v1/calls`
- Authentication: Bearer token
- Features: Text processing, quick responses

### VoiceGenie API (`/api/voicegenie`)
```typescript
POST /api/voicegenie
{
  "customerNumber": "string",
  "campaignId": "string",
  "customerInformation": {
    "first_name": "string",
    "last_name": "string"
  }
}
```

**Configuration**:
- API URL: `https://core-saas.voicegenie.ai/api/v1/pushCallToCampaign`
- Token: `2af458a64a0ddf1837c9699f5bcbff72`
- Workspace ID: `68b2aafe725592f6d543b250`

## User Experience Flow

### Step 1: Agent Selection
- User sees two options: Bland AI (Server-1) and VoiceGenie (Server-2)
- Each option shows features and benefits
- User clicks on preferred agent

### Step 2: Information Collection
- User provides full name (for AI personalization)
- User provides phone number (for call routing)
- System validates input data

### Step 3: Call Initiation
- System routes to appropriate AI service
- Shows call status and progress
- Provides success/error feedback

## Technical Implementation

### Unified AI Agent Component
**Location**: `app/components/UnifiedAIAgent.tsx`

**Features**:
- Multi-step wizard interface
- Agent selection with visual comparison
- Form validation and error handling
- Real-time status updates
- Responsive design

**State Management**:
```typescript
interface AIAgentData {
  userInfo: {
    name: string;
    phoneNumber: string;
  };
  selectedAgent: 'bland' | 'voicegenie' | null;
}
```

### Smart Routing Logic
```typescript
if (formData.selectedAgent === 'bland') {
  // Route to Bland AI API
  response = await fetch('/api/bland-ai', {
    method: 'POST',
    body: JSON.stringify({
      customerNumber: formData.userInfo.phoneNumber,
      customerName: formData.userInfo.name,
      campaignId: 'bland-support-campaign'
    })
  });
} else {
  // Route to VoiceGenie API
  response = await fetch('/api/voicegenie', {
    method: 'POST',
    body: JSON.stringify({
      customerNumber: formData.userInfo.phoneNumber,
      campaignId: 'voicegenie-support-campaign',
      customerInformation: {
        first_name: formData.userInfo.name.split(' ')[0],
        last_name: formData.userInfo.name.split(' ').slice(1).join(' ')
      }
    })
  });
}
```

## Configuration

### Environment Variables
For production deployment, set these environment variables:

```env
# Bland AI Configuration
BLAND_AI_API_URL=https://api.bland.ai/v1/calls
BLAND_AI_API_KEY=your_bland_ai_api_key_here

# VoiceGenie Configuration
VOICEGENIE_API_URL=https://core-saas.voicegenie.ai/api/v1/pushCallToCampaign
VOICEGENIE_TOKEN=2af458a64a0ddf1837c9699f5bcbff72
VOICEGENIE_WORKSPACE_ID=68b2aafe725592f6d543b250
```

### Campaign IDs
- **Bland AI**: `bland-support-campaign`
- **VoiceGenie**: `voicegenie-support-campaign`

## Security & Privacy

### Data Protection
- User names are used for AI personalization only
- Phone numbers are transmitted securely to AI services
- No personal data is stored locally
- API responses are logged for debugging only

### API Security
- All API keys are stored securely
- HTTPS encryption for all communications
- Input validation and sanitization
- Rate limiting for API calls

## Monitoring & Analytics

### Call Metrics
- Success rate for each AI agent
- Response times and performance
- User preference analytics
- Error tracking and resolution

### Performance Monitoring
- API response times
- Call initiation success rates
- User satisfaction metrics
- System availability tracking

## Troubleshooting

### Common Issues

1. **Agent Selection Issues**
   - Verify both AI services are properly configured
   - Check API keys and endpoints
   - Ensure proper error handling

2. **Call Initiation Failures**
   - Validate phone number format
   - Check API service availability
   - Review error logs for specific issues

3. **User Experience Problems**
   - Test the complete flow
   - Verify form validation
   - Check responsive design on different devices

### Error Handling
```typescript
// Example error handling
try {
  const response = await fetch(apiEndpoint, options);
  const data = await response.json();
  
  if (!response.ok) {
    setStatus('error');
    setMessage(data.error || 'Failed to initiate call');
  } else {
    setStatus('success');
    setMessage('Call initiated successfully!');
  }
} catch (error) {
  setStatus('error');
  setMessage('Network error. Please try again.');
}
```

## Future Enhancements

### Planned Features
1. **AI Agent Recommendations** - Suggest best agent based on query type
2. **Call History** - Track and display previous interactions
3. **Agent Performance Analytics** - Compare success rates and user satisfaction
4. **Multi-language Support** - Enhanced language capabilities
5. **Integration with CRM** - Sync customer data and interaction history

### Technical Improvements
1. **Webhook Integration** - Real-time call status updates
2. **Call Recording** - Conversation analytics and quality monitoring
3. **Sentiment Analysis** - Track user satisfaction and emotional state
4. **Automated Follow-up** - Scheduled callback reminders
5. **AI Agent Learning** - Improve responses based on interaction history

## Support & Documentation

### API Documentation
- Bland AI: `/api/bland-ai` (GET request)
- VoiceGenie: `/api/voicegenie` (GET request)

### Component Documentation
- Unified AI Agent: `app/components/UnifiedAIAgent.tsx`
- Support Page: `app/support/page.tsx`

### Testing
- Test both AI agents individually
- Verify complete user flow
- Check error handling scenarios
- Validate responsive design

### Contact
For technical support or questions about the dual AI system:
- Email: support@upiguard.com
- Documentation: This file and component files
- Test Interface: `/support` page

---

**Last Updated**: January 2025
**Version**: 2.0.0
**Status**: ✅ Active and Integrated
**AI Agents**: Bland AI (Server-1) + VoiceGenie (Server-2)
