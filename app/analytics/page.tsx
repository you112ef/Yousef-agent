import { Suspense } from 'react'
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'
import { getServerSession } from '@/lib/session/get-server-session'
import { redirectToSignIn } from '@/lib/session/redirect-to-sign-in'

export default async function AnalyticsPage() {
  const session = await getServerSession()

  if (!session) {
    redirectToSignIn()
    return null
  }

  return (
    <div className="container-modern section-padding">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">
          Task Analytics
        </h1>
        <p className="text-muted-foreground text-lg">
          Track your coding agent performance and insights
        </p>
      </div>

      <Suspense fallback={<AnalyticsDashboardSkeleton />}>
        <AnalyticsDashboard userId={session.user?.id} />
      </Suspense>
    </div>
  )
}

function AnalyticsDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stats-card">
            <div className="skeleton-title mb-2"></div>
            <div className="skeleton-text w-16 mx-auto"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="modern-card">
          <div className="skeleton-title mb-4"></div>
          <div className="skeleton h-64 w-full"></div>
        </div>
        <div className="modern-card">
          <div className="skeleton-title mb-4"></div>
          <div className="skeleton h-64 w-full"></div>
        </div>
      </div>
    </div>
  )
}
