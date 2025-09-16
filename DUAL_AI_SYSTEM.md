# Dual AI Agent System

## Overview

The UPI Guard platform features a dual AI agent system for customer support, providing users with two distinct AI assistants:

1. **Server-1: Bland AI** - Text-based AI with fast, intelligent responses in English and Hindi
2. **Server-2: VoiceGenie** - Voice-based AI with natural conversations

## System Architecture

### Components

- **Unified AI Agent Component**: `app/components/UnifiedAIAgent.tsx`
- **Bland AI API**: `/api/bland-ai` (Server-1)
- **VoiceGenie API**: `/api/voicegenie` (Server-2)

### Features Comparison

| Feature | Bland AI (Server-1) | VoiceGenie (Server-2) |
|---------|---------------------|-----------------------|
| Communication Mode | Text-based | Voice-based |
| Languages | English & Hindi | Multi-language |
| Response Speed | Very Fast | Natural Pace |
| Expertise | Scam Detection | General Knowledge |
| Personalization | High | Very High |

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
- Authentication: Bearer token or raw API key
- Features: Bilingual support (English/Hindi), fast responses, scam detection expertise

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
- Token: Configured via `VOICEGENIE_TOKEN` environment variable
- Workspace ID: Configured via `VOICEGENIE_WORKSPACE_ID` environment variable
- Campaign ID: Configured via `NEXT_PUBLIC_VOICEGENIE_CAMPAIGN_ID` environment variable

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
      campaignId: process.env.NEXT_PUBLIC_VOICEGENIE_CAMPAIGN_ID || 'voicegenie-support-campaign',
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
BLAND_API_URL=https://api.bland.ai/v1/calls
BLAND_API_KEY=your_actual_bland_key

# VoiceGenie Configuration
VOICEGENIE_API_URL=https://core-saas.voicegenie.ai/api/v1/pushCallToCampaign
VOICEGENIE_TOKEN=your_actual_voicegenie_token
VOICEGENIE_WORKSPACE_ID=your_actual_workspace_id
NEXT_PUBLIC_VOICEGENIE_CAMPAIGN_ID=your_actual_campaign_id
```

### Campaign IDs
- **Bland AI**: `bland-support-campaign` (hardcoded)
- **VoiceGenie**: Configured via `NEXT_PUBLIC_VOICEGENIE_CAMPAIGN_ID` environment variable

**Important**: The VoiceGenie campaign ID must be a valid campaign that you create in your VoiceGenie dashboard. It cannot be a placeholder value.

## Bland AI Features

### Bilingual Support
The Bland AI agent supports both English and Hindi languages with seamless switching capabilities.

### Intelligent Task Description
The agent is configured with a comprehensive task description that includes:
- Immediate bilingual greeting
- Expertise in UPI Guard services and scam detection
- General knowledge on various topics
- Natural conversation flow
- Website information without asking for details

### Voice Configuration
- **Voice**: June (friendly and professional)
- **Language**: en-IN (supports both English and Hindi)
- **Max Duration**: 600 seconds (10 minutes)
- **Recording**: Enabled for quality assurance

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

3. **Language Issues**
   - Ensure bilingual configuration is properly set
   - Check task description includes language instructions
   - Verify API language parameter

4. **"Invalid campaignId or workspaceId" Error**
   - This is the most common VoiceGenie error
   - Ensure you've created an actual campaign in your VoiceGenie dashboard
   - Use the real campaign ID, not the placeholder `voicegenie-support-campaign`
   - Verify your campaign ID in the VoiceGenie dashboard

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