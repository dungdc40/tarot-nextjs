import { NextRequest, NextResponse } from 'next/server';

// Simple rate limiting store (in-memory)
// For production, use Redis or another distributed cache
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW_MS = 30000; // 30 seconds
const RATE_LIMIT_MAX_REQUESTS = 1; // 1 request per window

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(clientId);

  if (!record || now > record.resetAt) {
    // Create new window
    rateLimitMap.set(clientId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false; // Rate limit exceeded
  }

  // Increment count
  record.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[Voice Token] OpenAI API key not configured');
      return NextResponse.json(
        { error: 'Voice mode is not properly configured' },
        { status: 500 }
      );
    }

    // Get client identifier (IP address or session ID)
    const clientIp = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown';

    // Rate limiting check
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait before requesting a new token.',
          retryAfter: 30
        },
        { status: 429 }
      );
    }

    // Get TTL from environment or use default (60 seconds)
    const ttl = parseInt(process.env.VOICE_TOKEN_TTL || '60', 10);

    // Get OpenAI base URL from environment or use default
    const openaiBaseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    const realtimeUrl = `${openaiBaseUrl}/realtime/client_secrets`;

    console.log('[Voice Token] Generating ephemeral token for Realtime API...');

    // Call OpenAI's Realtime API client secrets endpoint
    const response = await fetch(realtimeUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "session": {
            "type": "realtime",
            "model": "gpt-realtime-mini-2025-12-15"
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('[Voice Token] OpenAI Realtime API error:', response.status, errorData);

        // Handle specific error codes
        if (response.status === 401) {
          throw new Error('Invalid OpenAI API key or insufficient permissions for Realtime API');
        } else if (response.status === 403) {
          throw new Error('Access to Realtime API is forbidden. Your API key may not have Realtime API access enabled.');
        } else if (response.status === 429) {
          throw new Error('OpenAI API rate limit exceeded. Please try again later.');
        } else if (response.status >= 500) {
          throw new Error('OpenAI Realtime API service error. Please try again later.');
        } else {
          throw new Error(`OpenAI Realtime API error: ${response.status} ${errorData}`);
        }
      }

      const data = await response.json();
      console.log('[Voice Token] Ephemeral token generated successfully');
      console.log('[Voice Token] Response structure:', {
        responseKeys: Object.keys(data),
        hasValue: !!data.value,
        hasExpiresAt: !!data.expires_at,
        expiresAt: data.expires_at
      });

      if (!data.value) {
        throw new Error('Invalid response from OpenAI Realtime API: missing value field');
      }

      const ephemeralToken = data.value;
      const expiresAt = data.expires_at;

      // Convert expires_at to ISO string if it's a Unix timestamp
      const expiresAtISO = typeof expiresAt === 'number'
        ? new Date(expiresAt * 1000).toISOString()
        : expiresAt || new Date(Date.now() + ttl * 1000).toISOString();

      // Build session token response with all relevant fields
      const sessionToken = {
        token: ephemeralToken,
        expiresAt: expiresAtISO,
        ttl: ttl,
        model: 'gpt-realtime-mini-2025-12-15',
        // Include additional fields from the API response if available
        ...(data.created_at && { createdAt: data.created_at }),
        ...(data.updated_at && { updatedAt: data.updated_at }),
        ...(data.id && { id: data.id }),
      };

      console.log('[Voice Token] Token generated successfully', {
        clientIp,
        expiresAt: sessionToken.expiresAt,
        ttl,
      });

      return NextResponse.json(sessionToken);

    } catch (error) {
      console.error('[Voice Token] Error generating token:', error);

      // Enhanced error handling for specific error types
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('Invalid OpenAI API key')) {
          return NextResponse.json(
            { error: 'Invalid OpenAI API key or insufficient permissions for Realtime API' },
            { status: 401 }
          );
        }

        if (error.message.includes('403') || error.message.includes('forbidden')) {
          return NextResponse.json(
            { error: 'Access to Realtime API is forbidden. Your API key may not have Realtime API access enabled. Please check your OpenAI account settings.' },
            { status: 403 }
          );
        }

        if (error.message.includes('429') || error.message.includes('rate limit')) {
          return NextResponse.json(
            { error: 'OpenAI API rate limit exceeded. Please try again later.', retryAfter: 60 },
            { status: 429 }
          );
        }

        if (error.message.includes('503') || error.message.includes('unavailable')) {
          return NextResponse.json(
            { error: 'OpenAI service temporarily unavailable', retryAfter: 30 },
            { status: 503 }
          );
        }

        if (error.message.includes('fetch')) {
          return NextResponse.json(
            { error: 'Network error connecting to OpenAI Realtime API. Please check your internet connection.' },
            { status: 503 }
          );
        }

        if (error.message.includes('client_secret') || error.message.includes('Invalid response')) {
          return NextResponse.json(
            { error: 'Invalid response from OpenAI Realtime API. The service may be temporarily unavailable.' },
            { status: 502 }
          );
        }
      }

      // Generic error response
      return NextResponse.json(
        { error: 'Failed to generate voice session token' },
        { status: 500 }
      );
    }
}

// Cleanup old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Cleanup every minute
