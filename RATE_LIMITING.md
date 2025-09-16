# Rate Limiting Implementation

## Overview

This document explains the rate limiting implementation for the UPI Scam Checker API to prevent abuse and protect API quotas for external services like Gemini and DeepSeek.

## Implementation Details

### Rate Limiting Configuration

The rate limiting is implemented with the following configuration:
- **Window**: 1 minute
- **Max Requests**: 10 requests per IP per window
- **Storage**: In-memory Map (for development)

### Applied Routes

Rate limiting has been applied to the following API routes:
1. `/api/analyze-sms` - Main analysis pipeline
2. `/api/analyze-ml` - ML analysis
3. `/api/analyze-gemini` - Gemini AI analysis
4. `/api/analyze-deepseek` - DeepSeek AI analysis

### How It Works

1. Each API request is checked against the rate limit
2. The client's IP address is identified using headers
3. Request count is tracked per IP address
4. If limit is exceeded, a 429 (Too Many Requests) response is returned
5. The response includes a `Retry-After` header indicating when to retry

## Response Format

When rate limit is exceeded, the API returns:

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again in X seconds.",
  "retryAfter": X
}
```

With HTTP status code 429 and `Retry-After` header.

## Production Considerations

### For Production Deployment

In production, you should consider:

1. **External Storage**: Replace in-memory storage with Redis or similar
2. **Distributed Systems**: Use a shared storage solution for multi-instance deployments
3. **Rate Limit Adjustment**: Adjust limits based on your API quotas
4. **User Authentication**: Implement user-based rate limiting for authenticated users

### Environment Variables

You can customize the rate limiting behavior with environment variables:

```env
# Rate limiting configuration
RATE_LIMIT_WINDOW=60000    # Window in milliseconds (default: 60000)
RATE_LIMIT_MAX=10          # Max requests per window (default: 10)
```

## Testing Rate Limiting

To test the rate limiting:

1. Make 11 requests to any of the protected endpoints within 1 minute
2. The 11th request should return a 429 status code
3. Wait for the specified retry time and try again

## Security Considerations

1. **IP Spoofing**: The implementation uses standard headers to identify client IP
2. **Memory Usage**: The in-memory store is periodically cleaned to prevent memory leaks
3. **DDoS Protection**: Rate limiting provides basic protection against simple spam attacks

## Future Improvements

Planned improvements:
1. User-based rate limiting for authenticated users
2. Tiered rate limiting (different limits for different user types)
3. Integration with external rate limiting services
4. More sophisticated detection of abusive patterns