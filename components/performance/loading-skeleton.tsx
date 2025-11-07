import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  className?: string
}

export function TaskListSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="modern-card">
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-muted animate-pulse" />
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-5 bg-muted rounded w-16 animate-pulse" />
              <div className="h-5 bg-muted rounded w-20 animate-pulse" />
            </div>
            <div className="flex justify-between">
              <div className="h-3 bg-muted rounded w-24 animate-pulse" />
              <div className="h-3 bg-muted rounded w-20 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function StatsCardSkeleton() {
  return (
    <Card className="modern-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-24 animate-pulse" />
            <div className="h-8 bg-muted rounded w-16 animate-pulse" />
          </div>
          <div className="h-10 w-10 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ChartSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <Card className={cn('modern-card', className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="h-6 bg-muted rounded w-48 animate-pulse" />
          <div className="h-[300px] bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}
