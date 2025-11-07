import { describe, it, expect } from 'vitest'
import { validateFile, formatBytes, getAllowedFileTypes, getFileCategory } from '@/lib/utils/file-validator'

describe('File Validator', () => {
  describe('validateFile', () => {
    it('should validate image/jpeg file correctly', () => {
      const result = validateFile({
        name: 'image.jpg',
        type: 'image/jpeg',
        size: 1024 * 1024, // 1MB
      })

      expect(result.valid).toBe(true)
    })

    it('should reject file that exceeds size limit', () => {
      const result = validateFile({
        name: 'image.jpg',
        type: 'image/jpeg',
        size: 10 * 1024 * 1024, // 10MB (exceeds 5MB limit)
      })

      expect(result.valid).toBe(false)
      expect(result.error).toContain('File size exceeds maximum')
    })

    it('should reject file with wrong extension', () => {
      const result = validateFile({
        name: 'image.txt',
        type: 'image/jpeg',
        size: 1024,
      })

      expect(result.valid).toBe(false)
      expect(result.error).toContain('File extension must be')
    })

    it('should reject file with disallowed type', () => {
      const result = validateFile({
        name: 'file.exe',
        type: 'application/x-executable',
        size: 1024,
      })

      expect(result.valid).toBe(false)
      expect(result.error).toContain('File type')
    })
  })

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(1024 * 1024)).toBe('1 MB')
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB')
    })

    it('should format decimal values correctly', () => {
      const result = formatBytes(1536) // 1.5 KB
      expect(result).toMatch(/^1\.5/)
    })
  })

  describe('getAllowedFileTypes', () => {
    it('should return array of allowed file types', () => {
      const types = getAllowedFileTypes()
      expect(Array.isArray(types)).toBe(true)
      expect(types.length).toBeGreaterThan(0)
      expect(types).toContain('image/jpeg')
      expect(types).toContain('application/pdf')
      expect(types).toContain('text/javascript')
    })
  })

  describe('getFileCategory', () => {
    it('should categorize image files correctly', () => {
      expect(getFileCategory('image/jpeg')).toBe('image')
      expect(getFileCategory('image/png')).toBe('image')
      expect(getFileCategory('image/gif')).toBe('image')
    })

    it('should categorize document files correctly', () => {
      expect(getFileCategory('application/pdf')).toBe('document')
      expect(getFileCategory('text/plain')).toBe('document')
      expect(getFileCategory('text/csv')).toBe('document')
    })

    it('should categorize code files correctly', () => {
      expect(getFileCategory('text/javascript')).toBe('code')
      expect(getFileCategory('text/typescript')).toBe('code')
      expect(getFileCategory('text/tsx')).toBe('code')
    })

    it('should categorize archive files correctly', () => {
      expect(getFileCategory('application/zip')).toBe('archive')
    })

    it('should return other for unknown types', () => {
      expect(getFileCategory('application/unknown')).toBe('other')
    })
  })
})
