import { z } from 'zod'

// File type validation schema
export const fileSchema = z.object({
  name: z.string(),
  type: z.string(),
  size: z.number(),
})

// Allowed file types and their max sizes
const ALLOWED_FILE_TYPES = {
  // Images
  'image/jpeg': { maxSize: 5 * 1024 * 1024, extension: '.jpg' },
  'image/png': { maxSize: 5 * 1024 * 1024, extension: '.png' },
  'image/gif': { maxSize: 5 * 1024 * 1024, extension: '.gif' },
  'image/webp': { maxSize: 5 * 1024 * 1024, extension: '.webp' },
  'image/svg+xml': { maxSize: 2 * 1024 * 1024, extension: '.svg' },

  // Documents
  'text/plain': { maxSize: 10 * 1024 * 1024, extension: '.txt' },
  'text/markdown': { maxSize: 10 * 1024 * 1024, extension: '.md' },
  'application/pdf': { maxSize: 10 * 1024 * 1024, extension: '.pdf' },
  'application/json': { maxSize: 10 * 1024 * 1024, extension: '.json' },
  'text/csv': { maxSize: 20 * 1024 * 1024, extension: '.csv' },
  'application/zip': { maxSize: 50 * 1024 * 1024, extension: '.zip' },

  // Code files
  'text/javascript': { maxSize: 5 * 1024 * 1024, extension: '.js' },
  'text/typescript': { maxSize: 5 * 1024 * 1024, extension: '.ts' },
  'text/jsx': { maxSize: 5 * 1024 * 1024, extension: '.jsx' },
  'text/tsx': { maxSize: 5 * 1024 * 1024, extension: '.tsx' },
  'text/css': { maxSize: 5 * 1024 * 1024, extension: '.css' },
  'text/html': { maxSize: 5 * 1024 * 1024, extension: '.html' },
  'text/python': { maxSize: 5 * 1024 * 1024, extension: '.py' },
  'text/java': { maxSize: 5 * 1024 * 1024, extension: '.java' },
  'text/cpp': { maxSize: 5 * 1024 * 1024, extension: '.cpp' },
} as const

export function validateFile(file: {
  name: string
  type: string
  size: number
}): { valid: boolean; error?: string } {
  // Check if file type is allowed
  if (!(file.type in ALLOWED_FILE_TYPES)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    }
  }

  const config = ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES]

  // Check file size
  if (file.size > config.maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${formatBytes(config.maxSize)}`,
    }
  }

  // Check file extension
  if (!file.name.toLowerCase().endsWith(config.extension)) {
    return {
      valid: false,
      error: `File extension must be ${config.extension}`,
    }
  }

  return { valid: true }
}

export function isFileTypeAllowed(type: string): boolean {
  return type in ALLOWED_FILE_TYPES
}

export function getMaxFileSize(type: string): number | null {
  return ALLOWED_FILE_TYPES[type as keyof typeof ALLOWED_FILE_TYPES]?.maxSize || null
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export function getAllowedFileTypes(): string[] {
  return Object.keys(ALLOWED_FILE_TYPES)
}

export function getFileCategory(type: string): 'image' | 'document' | 'code' | 'archive' | 'other' {
  if (type.startsWith('image/')) return 'image'
  if (type === 'application/zip' || type === 'application/x-zip-compressed') return 'archive'
  if (type.startsWith('text/') || type.includes('json') || type.includes('csv')) {
    if (type.includes('javascript') || type.includes('typescript') || type.includes('jsx') || type.includes('tsx')) {
      return 'code'
    }
    return 'document'
  }
  if (type === 'application/pdf' || type.includes('document') || type.includes('word')) return 'document'
  return 'other'
}
