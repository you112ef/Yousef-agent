'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import { Search, FileText, Plus, BarChart3, GitBranch, Settings, User, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  title: string
  description?: string
  icon: React.ReactNode
  action: () => void
  category: 'navigation' | 'actions' | 'pages' | 'recent'
  shortcut?: string
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const commands: CommandItem[] = [
    {
      id: 'new-task',
      title: 'New Task',
      description: 'Create a new coding task',
      icon: <Plus className="h-4 w-4" />,
      action: () => {
        router.push('/')
        onOpenChange(false)
      },
      category: 'actions',
      shortcut: '⌘N',
    },
    {
      id: 'view-tasks',
      title: 'View Tasks',
      description: 'Browse all your tasks',
      icon: <FileText className="h-4 w-4" />,
      action: () => {
        router.push('/tasks')
        onOpenChange(false)
      },
      category: 'navigation',
      shortcut: '⌘T',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View detailed analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => {
        router.push('/analytics')
        onOpenChange(false)
      },
      category: 'navigation',
      shortcut: '⌘A',
    },
    {
      id: 'compare',
      title: 'Compare Tasks',
      description: 'Compare task results',
      icon: <GitBranch className="h-4 w-4" />,
      action: () => {
        router.push('/compare')
        onOpenChange(false)
      },
      category: 'navigation',
      shortcut: '⌘C',
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure preferences',
      icon: <Settings className="h-4 w-4" />,
      action: () => {
        router.push('/settings')
        onOpenChange(false)
      },
      category: 'pages',
    },
    {
      id: 'profile',
      title: 'Profile',
      description: 'View and edit your profile',
      icon: <User className="h-4 w-4" />,
      action: () => {
        router.push('/profile')
        onOpenChange(false)
      },
      category: 'pages',
    },
  ]

  const filteredCommands = useMemo(() => {
    if (!search) return commands

    const query = search.toLowerCase()
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(query) ||
        (cmd.description && cmd.description.toLowerCase().includes(query))
    )
  }, [search, commands])

  const handleSelect = (command: CommandItem) => {
    command.action()
  }

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {}
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = []
      }
      groups[cmd.category].push(cmd)
    })
    return groups
  }, [filteredCommands])

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    actions: 'Actions',
    pages: 'Pages',
    recent: 'Recent',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <Command className="rounded-lg border-0 shadow-none">
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 mr-2 text-muted-foreground" />
            <CommandInput
              placeholder="Type a command or search..."
              value={search}
              onValueChange={setSearch}
            />
          </div>
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {Object.entries(groupedCommands).map(([category, cmds]) => (
              <CommandGroup key={category} heading={categoryLabels[category] || category}>
                {cmds.map((cmd) => (
                  <CommandItem
                    key={cmd.id}
                    onSelect={() => handleSelect(cmd)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {cmd.icon}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span>{cmd.title}</span>
                        {cmd.shortcut && (
                          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                            {cmd.shortcut}
                          </kbd>
                        )}
                      </div>
                      {cmd.description && (
                        <p className="text-xs text-muted-foreground">{cmd.description}</p>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
