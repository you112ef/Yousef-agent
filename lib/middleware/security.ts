import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100 // requests per window

export function rateLimit(request: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
  const ip = getClientIP(request)
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW

  // Get or create rate limit entry
  let entry = rateLimitStore.get(ip)

  if (!entry || entry.resetTime < windowStart) {
    // New window
    entry = { count: 1, resetTime: now + RATE_LIMIT_WINDOW }
    rateLimitStore.set(ip, entry)
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetTime: entry.resetTime }
  }

  // Increment counter
  entry.count++

  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime }
  }

  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count, resetTime: entry.resetTime }
}

function getClientIP(request: NextRequest): string {
  // Try various headers to get the real IP
  const xff = request.headers.get('x-forwarded-for')
  if (xff) {
    return xff.split(',')[0].trim()
  }

  const xri = request.headers.get('x-real-ip')
  if (xri) {
    return xri
  }

  return 'unknown'
}

// Input sanitization
export function sanitizeInput(input: string): string {
  // Remove potential XSS characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
}

// SQL injection prevention (in addition to parameterized queries)
export function detectSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/gi,
    /(\%3B)|(;)/gi,
    /(\%27)|(\')/gi,
    /\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/gi,
  ]

  return sqlPatterns.some(pattern => pattern.test(input))
}

// CSRF token validation
export function validateCsrfToken(request: NextRequest): boolean {
  const token = request.headers.get('x-csrf-token')
  const cookie = request.cookies.get('csrf-token')?.value

  if (!token || !cookie) {
    return false
  }

  return token === cookie
}

// Content Security Policy headers
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://api.openrouter.ai https://ws://localhost:* wss://localhost:*",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  }
}

// API validation schemas
export const validationSchemas = {
  createTask: z.object({
    prompt: z.string().min(1).max(10000),
    title: z.string().max(200).optional(),
    repoUrl: z.string().url().optional(),
    selectedAgent: z.enum(['claude', 'codex', 'copilot', 'cursor', 'gemini', 'cline', 'kilo', 'opencode']).optional(),
    selectedModel: z.string().optional(),
    installDependencies: z.boolean().optional(),
    maxDuration: z.number().min(1).max(300).optional(),
    keepAlive: z.boolean().optional(),
  }),

  updateTask: z.object({
    action: z.enum(['stop']),
  }),

  createFile: z.object({
    name: z.string().min(1).max(255),
    type: z.string(),
    size: z.number().min(0).max(50 * 1024 * 1024), // 50MB
  }),
}

// Request size validation
export function validateRequestSize(request: NextRequest, maxSize: number = 10 * 1024 * 1024): boolean {
  const contentLength = request.headers.get('content-length')
  if (!contentLength) {
    return true // No content-length header, can't validate
  }

  const size = parseInt(contentLength, 10)
  return size <= maxSize
}
