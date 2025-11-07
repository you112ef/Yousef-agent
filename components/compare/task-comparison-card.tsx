'use client'

import { useState, useMemo } from 'react'

// Generate stable random values for mock data to avoid React purity violations
const generateStableRandom = (seed: string) => {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash) / 2147483647 // Normalize to 0-1
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Clock, GitBranch, X, Download, ExternalLink } from 'lucide-react'

interface Task {
  id: string
  prompt: string
  agent: string
  model: string
  status: string
  createdAt: string
  duration?: number
  logs?: string
  filesChanged?: number
  branchName?: string
}

interface TaskComparisonCardProps {
  task: Task
  index: number
  comparisonMode: 'side-by-side' | 'unified'
  onRemove: () => void
  agentColor: string
  statusIcon: React.ReactNode
}

export function TaskComparisonCard({
  task,
  index,
  comparisonMode,
  onRemove,
  agentColor,
  statusIcon
}: TaskComparisonCardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A'
    if (seconds < 60) return `${Math.round(seconds)}s`
    return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`
  }

  // Mock data for demonstration with stable random values
  const stableFilesChanged = useMemo(() => {
    if (task.filesChanged) return task.filesChanged
    const randomValue = generateStableRandom(task.id + 'files')
    return Math.floor(randomValue * 10) + 5
  }, [task.id, task.filesChanged])

  const stableDuration = useMemo(() => {
    if (task.duration) return task.duration
    const randomValue = generateStableRandom(task.id + 'duration')
    return Math.floor(randomValue * 300) + 60
  }, [task.id, task.duration])

  const mockLogs = `[${task.agent}] Starting task execution...
[${task.agent}] Analyzing repository structure...
[${task.agent}] Identified ${stableFilesChanged} files to modify
[${task.agent}] Implementing changes...
[${task.agent}] Creating pull request...
[${task.agent}] Task completed successfully`

  const mockFilesChanged = [
    { path: 'src/components/Auth.tsx', type: 'modified', additions: 45, deletions: 12 },
    { path: 'src/hooks/useAuth.ts', type: 'modified', additions: 23, deletions: 8 },
    { path: 'src/utils/validation.ts', type: 'new', additions: 67, deletions: 0 },
    { path: 'README.md', type: 'modified', additions: 15, deletions: 3 }
  ]

  return (
    <Card className="modern-card h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {statusIcon}
              <CardTitle className="text-lg truncate">{task.prompt}</CardTitle>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge className={agentColor}>
                {task.agent}
              </Badge>
              <span>•</span>
              <span className="text-xs">{task.model}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 p-0 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="changes" className="text-xs">Changes</TabsTrigger>
            <TabsTrigger value="logs" className="text-xs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant={task.status === 'completed' ? 'default' : task.status === 'failed' ? 'destructive' : 'secondary'}
                    className="ml-2 capitalize"
                  >
                    {task.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDuration(stableDuration)}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-muted-foreground">Files:</span>
                  <div className="font-medium">{mockFilesChanged.length} changed</div>
                </div>
                {task.branchName && (
                  <div>
                    <span className="text-muted-foreground">Branch:</span>
                    <div className="flex items-center gap-1 mt-1">
                      <GitBranch className="h-3 w-3" />
                      <span className="font-mono text-xs">{task.branchName}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {task.status === 'completed' && (
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View PR
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="changes" className="mt-4">
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {mockFilesChanged.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-2 glass rounded text-sm">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="h-3 w-3 shrink-0" />
                      <span className="truncate font-mono">{file.path}</span>
                      <Badge variant="outline" className="text-xs">
                        {file.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-green-600">+{file.additions}</span>
                      <span className="text-red-600">-{file.deletions}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <ScrollArea className="h-48">
              <pre className="text-xs font-mono whitespace-pre-wrap p-2 glass rounded">
                {mockLogs}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
