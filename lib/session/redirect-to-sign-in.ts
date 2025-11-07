export async function redirectToSignIn(): Promise<void> {
  try {
    const currentPath = window.location.pathname + window.location.search
    const response = await fetch(
      `/api/auth/signin/vercel?${new URLSearchParams({
        next: currentPath,
      }).toString()}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      },
    )

    if (!response.ok) {
      throw new Error(`Sign-in request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data.url) {
      // Store current location for post-signin redirect
      sessionStorage.setItem('post_signin_redirect', currentPath)
      window.location.href = data.url
    } else {
      throw new Error('No URL returned from sign-in endpoint')
    }
  } catch (error) {
    console.error('Vercel sign-in error:', error)
    throw new Error('Failed to initiate Vercel sign-in. Please check your internet connection and try again.')
  }
}
