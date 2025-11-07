import { z } from 'zod'

// Common validation patterns
const emailSchema = z.string().email('Invalid email address')
const urlSchema = z.string().url('Invalid URL')
const uuidSchema = z.string().uuid('Invalid UUID')
const isoDateSchema = z.string().datetime('Invalid date format')

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export const dateRangeSchema = z.object({
  from: isoDateSchema.optional(),
  to: isoDateSchema.optional(),
})

// User schemas
export const userIdSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
})

export const createUserSchema = z.object({
  provider: z.enum(['github', 'vercel']),
  externalId: z.string().min(1, 'External ID is required'),
  accessToken: z.string().min(1, 'Access token is required'),
  refreshToken: z.string().optional(),
  scope: z.string().optional(),
  username: z.string().min(1, 'Username is required'),
  email: emailSchema.optional(),
  name: z.string().optional(),
  avatarUrl: urlSchema.optional(),
})

// Task schemas
export const createTaskSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(10000, 'Prompt is too long'),
  title: z.string().max(200, 'Title is too long').optional(),
  repoUrl: urlSchema.optional(),
  selectedAgent: z.enum(['claude', 'codex', 'copilot', 'cursor', 'gemini', 'cline', 'kilo', 'opencode']).default('claude'),
  selectedModel: z.string().max(200, 'Model name is too long').optional(),
  installDependencies: z.boolean().default(false),
  maxDuration: z.number().min(1, 'Minimum duration is 1 minute').max(300, 'Maximum duration is 300 minutes').default(300),
  keepAlive: z.boolean().default(false),
})

export const updateTaskSchema = z.object({
  action: z.enum(['stop']),
})

export const taskIdSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
})

export const queryTasksSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'error', 'stopped']).optional(),
  agent: z.string().optional(),
  ...paginationSchema.shape,
  ...dateRangeSchema.shape,
})

// File schemas
export const createFileSchema = z.object({
  name: z.string().min(1, 'File name is required').max(255, 'File name is too long'),
  type: z.string().min(1, 'File type is required'),
  size: z.number().min(0, 'File size must be positive').max(50 * 1024 * 1024, 'File size exceeds 50MB limit'),
})

export const deleteFilesSchema = z.object({
  fileIds: z.array(uuidSchema).min(1, 'At least one file ID is required').max(100, 'Maximum 100 files per request'),
})

export const queryFilesSchema = z.object({
  path: z.string().optional(),
  type: z.string().optional(),
  ...paginationSchema.shape,
})

// Connector schemas
export const createConnectorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  type: z.enum(['local', 'remote']).default('remote'),
  baseUrl: urlSchema.optional(),
  oauthClientId: z.string().optional(),
  oauthClientSecret: z.string().optional(),
  command: z.string().optional(),
  env: z.record(z.string()).optional(),
})

export const updateConnectorSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['connected', 'disconnected']).optional(),
  env: z.record(z.string()).optional(),
})

export const connectorIdSchema = z.object({
  connectorId: z.string().min(1, 'Connector ID is required'),
})

// API Key schemas
export const createApiKeySchema = z.object({
  provider: z.enum(['anthropic', 'openai', 'cursor', 'gemini', 'aigateway', 'openrouter']),
  value: z.string().min(1, 'API key value is required'),
})

export const updateApiKeySchema = z.object({
  value: z.string().min(1, 'API key value is required'),
})

export const checkApiKeySchema = z.object({
  provider: z.enum(['anthropic', 'openai', 'cursor', 'gemini', 'aigateway', 'openrouter']),
})

// Analytics schemas
export const analyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  agent: z.string().optional(),
  status: z.string().optional(),
})

// GitHub schemas
export const githubUserSchema = z.object({
  // No parameters needed for user info
})

export const githubReposSchema = z.object({
  org: z.string().optional(),
  type: z.enum(['all', 'owner', 'member']).default('owner'),
  sort: z.enum(['created', 'updated', 'pushed', 'full_name']).default('updated'),
  direction: z.enum(['asc', 'desc']).default('desc'),
  per_page: z.coerce.number().min(1).max(100).default(30),
  page: z.coerce.number().min(1).default(1),
})

export const githubOrgSchema = z.object({
  org: z.string().min(1, 'Organization name is required'),
})

export const githubRepoSchema = z.object({
  owner: z.string().min(1, 'Owner is required'),
  repo: z.string().min(1, 'Repository name is required'),
})

export const githubCreateRepoSchema = z.object({
  name: z.string().min(1, 'Repository name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  private: z.boolean().default(false),
  has_issues: z.boolean().default(true),
  has_projects: z.boolean().default(true),
  has_wiki: z.boolean().default(true),
})

export const githubPullRequestsSchema = z.object({
  owner: z.string().min(1, 'Owner is required'),
  repo: z.string().min(1, 'Repository name is required'),
  state: z.enum(['open', 'closed', 'all']).default('open'),
  head: z.string().optional(),
  base: z.string().optional(),
  sort: z.enum(['created', 'updated', 'popularity']).default('created'),
  direction: z.enum(['asc', 'desc']).default('desc'),
  per_page: z.coerce.number().min(1).max(100).default(30),
  page: z.coerce.number().min(1).default(1),
})

export const githubIssuesSchema = z.object({
  owner: z.string().min(1, 'Owner is required'),
  repo: z.string().min(1, 'Repository name is required'),
  state: z.enum(['open', 'closed', 'all']).default('open'),
  labels: z.string().optional(),
  sort: z.enum(['created', 'updated', 'comments']).default('created'),
  direction: z.enum(['asc', 'desc']).default('desc'),
  since: isoDateSchema.optional(),
  per_page: z.coerce.number().min(1).max(100).default(30),
  page: z.coerce.number().min(1).default(1),
})

export const githubCommitsSchema = z.object({
  owner: z.string().min(1, 'Owner is required'),
  repo: z.string().min(1, 'Repository name is required'),
  sha: z.string().optional(),
  path: z.string().optional(),
  author: z.string().optional(),
  since: isoDateSchema.optional(),
  until: isoDateSchema.optional(),
  per_page: z.coerce.number().min(1).max(100).default(30),
  page: z.coerce.number().min(1).default(1),
})

// Settings schemas
export const createSettingSchema = z.object({
  key: z.string().min(1, 'Setting key is required').max(100, 'Key is too long'),
  value: z.string().min(1, 'Setting value is required'),
})

export const updateSettingSchema = z.object({
  value: z.string().min(1, 'Setting value is required'),
})

export const settingKeySchema = z.object({
  key: z.string().min(1, 'Setting key is required'),
})

// Health check schema
export const healthCheckSchema = z.object({
  check: z.enum(['database', 'redis', 'external-api']).optional(),
})

// Metrics schema
export const metricsQuerySchema = z.object({
  type: z.enum(['all', 'performance', 'api', 'summary']).default('all'),
  since: z.coerce.number().optional(),
})

// Search schema
export const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(200, 'Query is too long'),
  type: z.enum(['tasks', 'files', 'repos', 'all']).default('all'),
  ...paginationSchema.shape,
})
