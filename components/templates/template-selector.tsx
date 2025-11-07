'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TemplatesProvider, useTemplates } from './templates-provider'
import { Search, Template, Clock, Bot } from 'lucide-react'
import { useAtom } from 'jotai'
import { taskPromptAtom } from '@/lib/atoms/task'
import { lastSelectedAgentAtom, lastSelectedModelAtomFamily } from '@/lib/atoms/agent-selection'
import { setInstallDependencies, setMaxDuration, setKeepAlive } from '@/lib/utils/cookies'
import { toast } from 'sonner'

interface TemplateSelectorProps {
  onTemplateSelect?: (template: any) => void
  trigger?: React.ReactNode
}

function TemplateSelectorContent({ onTemplateSelect, trigger }: TemplateSelectorProps) {
  const { templates, loading } = useTemplates()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [open, setOpen] = useState(false)
  const [, setTaskPrompt] = useAtom(taskPromptAtom)
  const [, setLastSelectedAgent] = useAtom(lastSelectedAgentAtom)

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))]

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.prompt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleTemplateSelect = (template: any) => {
    // Set the template values
    setTaskPrompt(template.prompt)
    setLastSelectedAgent(template.agent)

    // Save configuration to cookies
    setInstallDependencies(template.installDependencies)
    setMaxDuration(template.maxDuration)
    setKeepAlive(template.keepAlive)

    // Call the callback
    onTemplateSelect?.(template)

    toast.success(`Template "${template.name}" applied!`)
    setOpen(false)
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="glass-button">
      <Template className="h-4 w-4 mr-2" />
      Templates
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-gradient">Task Templates</DialogTitle>
          <DialogDescription>
            Choose from pre-built templates or create your own for faster task creation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <ScrollArea className="h-96">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredTemplates.length > 0 ? (
              <div className="grid gap-4">
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="interactive-card cursor-pointer"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{template.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {template.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm line-clamp-2">{template.prompt}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Bot className="h-3 w-3" />
                            <span>{template.agent}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{template.maxDuration}min</span>
                          </div>
                          {template.installDependencies && (
                            <Badge variant="outline" className="text-xs">
                              Install deps
                            </Badge>
                          )}
                          {template.keepAlive && (
                            <Badge variant="outline" className="text-xs">
                              Keep alive
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Template className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No templates found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function TemplateSelector(props: TemplateSelectorProps) {
  return (
    <TemplatesProvider>
      <TemplateSelectorContent {...props} />
    </TemplatesProvider>
  )
}
