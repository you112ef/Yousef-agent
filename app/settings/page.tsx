import { getServerSession } from '@/lib/session/get-server-session'
import { redirect } from 'next/navigation'
import { SettingsClient } from '@/components/settings/settings-client'

export default async function SettingsPage() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect('/')
  }

  return <SettingsClient user={session.user} />
}
