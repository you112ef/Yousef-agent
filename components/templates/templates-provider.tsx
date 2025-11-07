'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Template {
  id: string
  name: string
  description: string
  prompt: string
  agent: string
  model: string
  installDependencies: boolean
  maxDuration: number
  keepAlive: boolean
  category: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

interface TemplatesContextType {
  templates: Template[]
  loading: boolean
  createTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  getTemplate: (id: string) => Template | undefined
  refreshTemplates: () => Promise<void>
}

const TemplatesContext = createContext<TemplatesContextType | undefined>(undefined)

export function TemplatesProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const createTemplate = async (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      })
      if (response.ok) {
        const data = await response.json()
        setTemplates(prev => [...prev, data.template])
      }
    } catch (error) {
      console.error('Error creating template:', error)
      throw error
    }
  }

  const updateTemplate = async (id: string, updates: Partial<Template>) => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (response.ok) {
        setTemplates(prev =>
          prev.map(template =>
            template.id === id ? { ...template, ...updates, updatedAt: new Date().toISOString() } : template
          )
        )
      }
    } catch (error) {
      console.error('Error updating template:', error)
      throw error
    }
  }

  const deleteTemplate = async (id: string) => {
    try {
      const response = await fetch(`/api/templates/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setTemplates(prev => prev.filter(template => template.id !== id))
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      throw error
    }
  }

  const getTemplate = (id: string) => {
    return templates.find(template => template.id === id)
  }

  const refreshTemplates = async () => {
    setLoading(true)
    await fetchTemplates()
  }

  return (
    <TemplatesContext.Provider
      value={{
        templates,
        loading,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        getTemplate,
        refreshTemplates
      }}
    >
      {children}
    </TemplatesContext.Provider>
  )
}

export function useTemplates() {
  const context = useContext(TemplatesContext)
  if (!context) {
    throw new Error('useTemplates must be used within a TemplatesProvider')
  }
  return context
}
