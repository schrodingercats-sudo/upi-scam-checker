import { NextRequest, NextResponse } from 'next/server';

// In-memory store for rate limiting
// In production, you should use Redis or a similar external store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration from environment variables
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '60000'); // 1 minute default
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX || '10'); // Max 10 requests per window per IP

export function rateLimit(request: NextRequest) {
  // Get client IP
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  // Get current time
  const now = Date.now();
  
  // Get or create rate limit info for this IP
  const rateLimitInfo = rateLimitStore.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  // Check if we need to reset the counter
  if (now > rateLimitInfo.resetTime) {
    rateLimitInfo.count = 0;
    rateLimitInfo.resetTime = now + RATE_LIMIT_WINDOW;
  }
  
  // Increment request count
  rateLimitInfo.count += 1;
  rateLimitStore.set(ip, rateLimitInfo);
  
  // Check if limit exceeded
  if (rateLimitInfo.count > RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((rateLimitInfo.resetTime - now) / 1000);
    return {
      exceeded: true,
      retryAfter,
      response: NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: `Too many requests. Please try again in ${retryAfter} seconds.`,
          retryAfter
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString()
          }
        }
      )
    };
  }
  
  // Return rate limit info
  return {
    exceeded: false,
    remaining: RATE_LIMIT_MAX_REQUESTS - rateLimitInfo.count,
    resetTime: rateLimitInfo.resetTime,
    response: null
  };
}

// Cleanup function to remove old entries (to prevent memory leaks)
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [ip, info] of rateLimitStore.entries()) {
    if (now > info.resetTime + RATE_LIMIT_WINDOW) {
      rateLimitStore.delete(ip);
    }
  }
}

// Periodically clean up old entries
setInterval(cleanupRateLimitStore, 60 * 1000); // Every minute