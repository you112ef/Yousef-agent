'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function ComparisonSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="skeleton-title w-48"></div>
        <div className="skeleton w-24 h-8"></div>
      </div>

      {/* Metrics skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="modern-card">
            <CardHeader className="pb-2">
              <div className="skeleton-text w-20"></div>
            </CardHeader>
            <CardContent>
              <div className="skeleton-title w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison cards skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="modern-card">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="skeleton-title w-32"></div>
                  <div className="skeleton-text w-24"></div>
                </div>
                <div className="skeleton w-8 h-8 rounded-full"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-3/4"></div>
                <div className="skeleton h-32 w-full rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
