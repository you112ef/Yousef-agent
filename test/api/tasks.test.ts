import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { GET, POST, DELETE } from '@/app/api/tasks/route'
import { NextRequest } from 'next/server'

// Mock database
vi.mock('@/lib/db/client', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/lib/session/get-server-session', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/utils/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 99, total: 100 }),
}))

describe('/api/tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should return 401 if user is not authenticated', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return tasks for authenticated user', async () => {
      vi.mocked(require('@/lib/session/get-server-session').getServerSession).mockResolvedValue({
        user: { id: 'user123' },
      })

      vi.mocked(require('@/lib/db/client').db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([
              { id: 'task1', status: 'completed' },
              { id: 'task2', status: 'pending' },
            ]),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/tasks')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.tasks).toHaveLength(2)
    })
  })

  describe('POST', () => {
    it('should return 401 if user is not authenticated', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Test task' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should create a new task with valid data', async () => {
      vi.mocked(require('@/lib/session/get-server-session').getServerSession).mockResolvedValue({
        user: { id: 'user123' },
      })

      vi.mocked(require('@/lib/db/client').db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'new-task-123' }]),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Create a new feature',
          title: 'New Feature',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.task).toBeDefined()
      expect(data.task.id).toBe('new-task-123')
    })
  })

  describe('DELETE', () => {
    it('should return 401 if user is not authenticated', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks?action=completed')

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should delete completed tasks', async () => {
      vi.mocked(require('@/lib/session/get-server-session').getServerSession).mockResolvedValue({
        user: { id: 'user123' },
      })

      vi.mocked(require('@/lib/db/client').db.delete).mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            { id: 'task1', status: 'completed' },
            { id: 'task2', status: 'completed' },
          ]),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/tasks?action=completed')
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.deletedCount).toBe(2)
      expect(data.message).toContain('completed')
    })
  })
})
