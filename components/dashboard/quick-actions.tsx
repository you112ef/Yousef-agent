'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Settings,
  FileText,
  Download,
  GitBranch,
  Zap,
  BarChart3,
  Search,
  Filter
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      title: 'New Task',
      description: 'Start a new coding task',
      icon: <Plus className="h-4 w-4" />,
      action: () => router.push('/'),
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'View Tasks',
      description: 'Browse all tasks',
      icon: <FileText className="h-4 w-4" />,
      action: () => router.push('/tasks'),
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Analytics',
      description: 'View detailed insights',
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => router.push('/analytics'),
      color: 'bg-green-500/10 text-green-600 dark:text-green-400',
    },
    {
      title: 'Compare',
      description: 'Compare task results',
      icon: <GitBranch className="h-4 w-4" />,
      action: () => router.push('/compare'),
      color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Settings',
      description: 'Configure preferences',
      icon: <Settings className="h-4 w-4" />,
      action: () => router.push('/settings'),
      color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
    },
    {
      title: 'Export Data',
      description: 'Download your data',
      icon: <Download className="h-4 w-4" />,
      action: () => {},
      color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    },
  ]

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2 hover-lift"
              onClick={action.action}
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                {action.icon}
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
