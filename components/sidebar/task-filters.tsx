'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search,
  Filter,
  X,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
  Archive,
  Command
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskFiltersProps {
  onSearchChange: (query: string) => void
  onStatusFilter: (status: string | null) => void
  onAgentFilter: (agent: string | null) => void
  onSortChange: (sort: 'recent' | 'oldest' | 'name') => void
  selectedStatus: string | null
  selectedAgent: string | null
  searchQuery: string
  sortBy: 'recent' | 'oldest' | 'name'
  className?: string
}

export function TaskFilters({
  onSearchChange,
  onStatusFilter,
  onAgentFilter,
  onSortChange,
  selectedStatus,
  selectedAgent,
  searchQuery,
  sortBy,
  className
}: TaskFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const statuses = [
    { value: 'completed', label: 'Completed', icon: <CheckCircle className="h-3 w-3" />, color: 'text-green-600' },
    { value: 'processing', label: 'Processing', icon: <PlayCircle className="h-3 w-3" />, color: 'text-blue-600' },
    { value: 'error', label: 'Failed', icon: <XCircle className="h-3 w-3" />, color: 'text-red-600' },
    { value: 'pending', label: 'Pending', icon: <Clock className="h-3 w-3" />, color: 'text-yellow-600' },
    { value: 'stopped', label: 'Stopped', icon: <Archive className="h-3 w-3" />, color: 'text-gray-600' },
  ]

  const agents = [
    { value: 'claude', label: 'Claude' },
    { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
    { value: 'cline', label: 'Cline' },
    { value: 'kilo', label: 'Kilo' },
    { value: 'gemini', label: 'Gemini' },
    { value: 'codex', label: 'Codex' },
    { value: 'copilot', label: 'Copilot' },
    { value: 'cursor', label: 'Cursor' },
  ]

  const hasActiveFilters = selectedStatus || selectedAgent

  const clearAllFilters = () => {
    onStatusFilter(null)
    onAgentFilter(null)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks... (⌘K)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => onSearchChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={cn('flex-1', hasActiveFilters && 'border-primary')}
        >
          <Filter className="h-3 w-3 mr-1" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {(selectedStatus ? 1 : 0) + (selectedAgent ? 1 : 0)}
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="border-primary/20">
          <CardContent className="p-3 space-y-3">
            {/* Status Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Status
              </label>
              <div className="flex flex-wrap gap-1">
                {statuses.map((status) => (
                  <Button
                    key={status.value}
                    variant={selectedStatus === status.value ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      'h-7 text-xs',
                      selectedStatus === status.value && 'border-primary'
                    )}
                    onClick={() => onStatusFilter(
                      selectedStatus === status.value ? null : status.value
                    )}
                  >
                    {status.icon}
                    <span className="ml-1">{status.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Agent Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Agent
              </label>
              <div className="flex flex-wrap gap-1">
                {agents.map((agent) => (
                  <Button
                    key={agent.value}
                    variant={selectedAgent === agent.value ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      'h-7 text-xs',
                      selectedAgent === agent.value && 'border-primary'
                    )}
                    onClick={() => onAgentFilter(
                      selectedAgent === agent.value ? null : agent.value
                    )}
                  >
                    {agent.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Sort by
              </label>
              <div className="flex gap-1">
                {[
                  { value: 'recent', label: 'Recent' },
                  { value: 'oldest', label: 'Oldest' },
                  { value: 'name', label: 'Name' },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onSortChange(option.value as any)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
