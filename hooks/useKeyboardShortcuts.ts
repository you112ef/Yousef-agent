'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface ShortcutAction {
  key: string
  modifiers?: ('cmd' | 'ctrl' | 'shift' | 'alt')[]
  action: () => void
  description: string
}

export function useKeyboardShortcuts(actions: ShortcutAction[]) {
  const router = useRouter()

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return
      }

      // Check if this key combination matches any shortcut
      for (const shortcut of actions) {
        const key = event.key.toLowerCase()
        const hasShift = event.shiftKey
        const hasAlt = event.altKey
        const hasCtrl = event.ctrlKey || event.metaKey

        // Check if the key matches
        if (key !== shortcut.key.toLowerCase()) continue

        // Check if modifiers match
        const hasRequiredShift = shortcut.modifiers?.includes('shift') || false
        const hasRequiredAlt = shortcut.modifiers?.includes('alt') || false
        const hasRequiredCtrl = shortcut.modifiers?.includes('cmd') || shortcut.modifiers?.includes('ctrl') || false

        if (
          hasShift === hasRequiredShift &&
          hasAlt === hasRequiredAlt &&
          hasCtrl === hasRequiredCtrl
        ) {
          event.preventDefault()
          event.stopPropagation()
          shortcut.action()
          break
        }
      }
    },
    [actions]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  // Return a list of shortcuts for display
  return actions.map((action) => ({
    key: action.key,
    modifiers: action.modifiers,
    description: action.description,
  }))
}

// Common shortcuts configuration
export const getDefaultShortcuts = (router: any) => [
  {
    key: 'k',
    modifiers: ['cmd'] as const,
    action: () => {
      // This would open a command palette
      console.log('Open command palette')
    },
    description: 'Open command palette',
  },
  {
    key: 'n',
    modifiers: ['cmd'] as const,
    action: () => router.push('/'),
    description: 'New task',
  },
  {
    key: 't',
    modifiers: ['cmd'] as const,
    action: () => router.push('/tasks'),
    description: 'View tasks',
  },
  {
    key: 'a',
    modifiers: ['cmd'] as const,
    action: () => router.push('/analytics'),
    description: 'View analytics',
  },
  {
    key: 'c',
    modifiers: ['cmd'] as const,
    action: () => router.push('/compare'),
    description: 'Compare tasks',
  },
  {
    key: '/',
    modifiers: [] as const,
    action: () => {
      // Focus search input
      const searchInput = document.querySelector('input[placeholder*="search" i]') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      }
    },
    description: 'Focus search',
  },
  {
    key: '?',
    modifiers: ['shift'] as const,
    action: () => {
      // Show shortcuts help
      console.log('Show shortcuts help')
    },
    description: 'Show keyboard shortcuts',
  },
]
