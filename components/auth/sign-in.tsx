'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { redirectToSignIn } from '@/lib/session/redirect-to-sign-in'
import { GitHubIcon } from '@/components/icons/github-icon'
import { useState } from 'react'
import { getEnabledAuthProviders } from '@/lib/auth/providers'
import { isOnVercel, isVercelAuthConfigured } from '@/lib/constants'

export function SignIn() {
  const [showDialog, setShowDialog] = useState(false)
  const [loadingVercel, setLoadingVercel] = useState(false)
  const [loadingGitHub, setLoadingGitHub] = useState(false)

  // Check which auth providers are enabled
  const { github: hasGitHub, vercel: hasVercel } = getEnabledAuthProviders()

  const handleVercelSignIn = async () => {
    try {
      setLoadingVercel(true)

      // Check if we're on Vercel
      if (!isOnVercel()) {
        throw new Error('Vercel sign-in is only available when deployed on Vercel.')
      }

      // Check if Vercel auth is configured (but allow user to try anyway)
      if (!isVercelAuthConfigured()) {
        const shouldContinue = confirm(
          'Vercel sign-in may not be fully configured. Would you like to try anyway? If it fails, please use GitHub sign-in.'
        )
        if (!shouldContinue) {
          setLoadingVercel(false)
          return
        }
      }

      await redirectToSignIn()
    } catch (error) {
      console.error('Failed to redirect to Vercel sign in:', error)
      setLoadingVercel(false)
      // Show a more helpful error message with alternative
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Vercel Sign-in Issue: ${errorMessage}\n\nPlease try using GitHub sign-in instead, or contact the administrator to configure Vercel OAuth.`)
    }
  }

  const handleGitHubSignIn = () => {
    try {
      setLoadingGitHub(true)
      window.location.href = '/api/auth/signin/github'
    } catch (error) {
      console.error('Failed to redirect to GitHub sign in:', error)
      setLoadingGitHub(false)
      // Show a user-friendly error message
      alert('Failed to initiate GitHub sign in. Please try again.')
    }
  }

  return (
    <>
      <Button onClick={() => setShowDialog(true)} variant="outline" size="sm">
        Sign in
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in</DialogTitle>
            <DialogDescription>
              {(() => {
                const messages = []
                if (hasGitHub) {
                  messages.push('✅ GitHub authentication: Ready to use')
                }
                if (hasVercel) {
                  if (isOnVercel()) {
                    messages.push('⚠️ Vercel authentication: Try now (may need configuration)')
                  } else {
                    messages.push('⚠️ Vercel sign-in requires deployment on Vercel')
                  }
                }
                return messages.length > 0 ? messages.join(' • ') : 'No authentication providers are configured.'
              })()}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-4">
            {/* Show GitHub first as it's the recommended option */}
            {hasGitHub && (
              <Button
                onClick={handleGitHubSignIn}
                disabled={loadingVercel || loadingGitHub}
                variant="default"
                size="lg"
                className="w-full"
              >
                {loadingGitHub ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    <GitHubIcon className="h-4 w-4 mr-2" />
                    Sign in with GitHub ✅
                  </>
                )}
              </Button>
            )}

            <div className="text-center text-xs text-muted-foreground">or</div>

            {hasVercel && (
              <Button
                onClick={handleVercelSignIn}
                disabled={loadingVercel || loadingGitHub}
                variant="outline"
                size="lg"
                className="w-full"
              >
                {loadingVercel ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 76 65" className="h-3 w-3 mr-2" fill="currentColor">
                      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                    </svg>
                    Sign in with Vercel ⚠️
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground mt-2">
            💡 <strong>Tip:</strong> GitHub sign-in is fully configured and ready to use.
            {hasVercel && !isVercelAuthConfigured() && ' Vercel sign-in may require additional configuration.'}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
