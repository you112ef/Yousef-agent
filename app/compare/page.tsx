import { Suspense } from 'react'
import { ComparisonView } from '@/components/compare/comparison-view'
import { getServerSession } from '@/lib/session/get-server-session'
import { redirectToSignIn } from '@/lib/session/redirect-to-sign-in'
import { ComparisonSkeleton } from '@/components/compare/comparison-skeleton'

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { tasks?: string }
}) {
  const session = await getServerSession()

  if (!session) {
    redirectToSignIn()
    return null
  }

  const taskIds = searchParams.tasks?.split(',') || []

  return (
    <div className="container-modern section-padding">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">
          Compare Agent Results
        </h1>
        <p className="text-muted-foreground text-lg">
          Analyze and compare different AI agent outputs side-by-side
        </p>
      </div>

      <Suspense fallback={<ComparisonSkeleton />}>
        <ComparisonView taskIds={taskIds} userId={session.user?.id} />
      </Suspense>
    </div>
  )
}
