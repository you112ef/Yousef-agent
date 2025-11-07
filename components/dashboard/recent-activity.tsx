'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import {
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
  GitBranch,
  ExternalLink
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface Activity {
  id: string
  type: 'task_completed' | 'task_failed' | 'task_started' | 'pr_created' | 'repo_connected'
  title: string
  description: string
  timestamp: Date
  status?: 'success' | 'error' | 'warning' | 'info'
  agent?: string
  href?: string
}

interface RecentActivityProps {
  activities: Activity[]
  className?: string
}

export function RecentActivity({ activities, className }: RecentActivityProps) {
  const getActivityIcon = (type: Activity['type'], status?: Activity['status']) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'task_failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'task_started':
        return <PlayCircle className="h-4 w-4 text-blue-500" />
      case 'pr_created':
        return <GitBranch className="h-4 w-4 text-purple-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status?: Activity['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 text-green-600 dark:text-green-400'
      case 'error':
        return 'bg-red-500/10 text-red-600 dark:text-red-400'
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
      default:
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/tasks">
            View all
            <ExternalLink className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Start a task to see activity here</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 group">
                  <div className="mt-1">{getActivityIcon(activity.type, activity.status)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">
                        {activity.href ? (
                          <Link href={activity.href} className="hover:underline">
                            {activity.title}
                          </Link>
                        ) : (
                          activity.title
                        )}
                      </p>
                      {activity.status && (
                        <Badge variant="secondary" className={getStatusColor(activity.status)}>
                          {activity.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {activity.agent && (
                        <Badge variant="outline" className="text-xs">
                          {activity.agent}
                        </Badge>
                      )}
                      <span>{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
