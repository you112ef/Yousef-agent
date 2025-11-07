import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getSecurityHeaders, validateRequestSize, detectSqlInjection, sanitizeInput } from '@/lib/middleware/security'
import { logger } from '@/lib/utils/error-handler'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    const rateLimitResult = rateLimit(request)

    // Add rate limit headers
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', '100')
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimitResult.resetTime / 1000).toString())

    if (!rateLimitResult.allowed) {
      logger.warn('Rate limit exceeded', {
        ip: request.headers.get('x-forwarded-for'),
        path: pathname,
      })

      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    // Validate request size for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      if (!validateRequestSize(request)) {
        logger.warn('Request size exceeded', {
          path: pathname,
          method: request.method,
        })

        return new NextResponse(
          JSON.stringify({
            error: 'Request too large',
            message: 'Request payload is too large. Maximum size is 10MB.',
          }),
          { status: 413, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // Check for SQL injection in query parameters
    const searchParams = request.nextUrl.searchParams
    for (const [key, value] of searchParams) {
      if (detectSqlInjection(value)) {
        logger.warn('Potential SQL injection detected', {
          ip: request.headers.get('x-forwarded-for'),
          path: pathname,
          param: key,
          value,
        })

        return new NextResponse(
          JSON.stringify({
            error: 'Invalid parameter',
            message: 'Request contains suspicious characters.',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }
  }

  // Apply security headers to all responses
  const securityHeaders = getSecurityHeaders()
  const response = NextResponse.next()

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Remove server information
  response.headers.delete('x-powered-by')

  return response
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
