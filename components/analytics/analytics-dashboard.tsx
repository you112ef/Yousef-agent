'use client'

import { useState, useEffect } from 'react'
import { StatsCards } from './stats-cards'
import { TasksOverTimeChart } from './tasks-over-time-chart'
import { AgentPerformanceChart } from './agent-performance-chart'
import { SuccessRateChart } from './success-rate-chart'
import { TaskStatusDistribution } from './task-status-distribution'
import { RecentTasksTable } from './recent-tasks-table'
import { TopRepositories } from './top-repositories'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Activity, Users, Clock } from 'lucide-react'

interface AnalyticsDashboardProps {
  userId: string
}

export function AnalyticsDashboard({ userId }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [userId])

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/analytics?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      } else {
        // Mock data for demonstration
        setAnalyticsData(getMockAnalyticsData())
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setAnalyticsData(getMockAnalyticsData())
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stats-card animate-pulse">
              <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Key Metrics */}
      <StatsCards data={analyticsData.stats} />

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 glass-button">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TasksOverTimeChart data={analyticsData.tasksOverTime} />
            <SuccessRateChart data={analyticsData.successRate} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TaskStatusDistribution data={analyticsData.statusDistribution} />
            <TopRepositories data={analyticsData.topRepositories} />
            <Card className="modern-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="cursor-pointer hover:gradient-accent">
                    View All Tasks
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:gradient-success">
                    Create New Task
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:gradient-warning">
                    Export Report
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AgentPerformanceChart data={analyticsData.agentPerformance} />
            <Card className="modern-card">
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 glass rounded-lg">
                    <span className="text-sm font-medium">Average Task Duration</span>
                    <Badge variant="secondary">2.4 minutes</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 glass rounded-lg">
                    <span className="text-sm font-medium">Success Rate</span>
                    <Badge variant="secondary" className="gradient-success">87.3%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 glass rounded-lg">
                    <span className="text-sm font-medium">Tasks This Week</span>
                    <Badge variant="secondary">24</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <AgentPerformanceChart data={analyticsData.agentPerformance} detailed />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analyticsData.agentComparison?.map((agent: any) => (
                <Card key={agent.name} className="interactive-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Success Rate</span>
                        <span className="font-medium">{agent.successRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Avg Duration</span>
                        <span className="font-medium">{agent.avgDuration}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Tasks</span>
                        <span className="font-medium">{agent.totalTasks}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <RecentTasksTable tasks={analyticsData.recentTasks} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function getMockAnalyticsData() {
  return {
    stats: {
      totalTasks: 156,
      completedTasks: 136,
      successRate: 87.3,
      avgDuration: '2.4 min',
      activeTasks: 8,
      thisWeek: 24
    },
    tasksOverTime: [
      { date: '2024-01-01', tasks: 12 },
      { date: '2024-01-02', tasks: 19 },
      { date: '2024-01-03', tasks: 15 },
      { date: '2024-01-04', tasks: 22 },
      { date: '2024-01-05', tasks: 18 },
      { date: '2024-01-06', tasks: 25 },
      { date: '2024-01-07', tasks: 31 }
    ],
    successRate: [
      { month: 'Jan', rate: 85 },
      { month: 'Feb', rate: 88 },
      { month: 'Mar', rate: 82 },
      { month: 'Apr', rate: 90 },
      { month: 'May', rate: 87 },
      { month: 'Jun', rate: 91 }
    ],
    statusDistribution: [
      { status: 'Completed', count: 136, color: '#10b981' },
      { status: 'Failed', count: 12, color: '#ef4444' },
      { status: 'Running', count: 8, color: '#f59e0b' }
    ],
    topRepositories: [
      { name: 'my-awesome-project', tasks: 23, success: 91 },
      { name: 'web-app-frontend', tasks: 18, success: 89 },
      { name: 'api-server', tasks: 15, success: 93 },
      { name: 'mobile-app', tasks: 12, success: 85 }
    ],
    agentPerformance: [
      { name: 'Claude', tasks: 45, successRate: 92, avgDuration: '2.1 min' },
      { name: 'Codex', tasks: 38, successRate: 85, avgDuration: '2.8 min' },
      { name: 'Copilot', tasks: 32, successRate: 88, avgDuration: '2.3 min' },
      { name: 'Gemini', tasks: 25, successRate: 84, avgDuration: '2.6 min' }
    ],
    agentComparison: [
      { name: 'Claude Code', successRate: 92, avgDuration: '2.1 min', totalTasks: 45 },
      { name: 'OpenAI Codex', successRate: 85, avgDuration: '2.8 min', totalTasks: 38 },
      { name: 'GitHub Copilot', successRate: 88, avgDuration: '2.3 min', totalTasks: 32 },
      { name: 'Google Gemini', successRate: 84, avgDuration: '2.6 min', totalTasks: 25 }
    ],
    recentTasks: [
      {
        id: '1',
        prompt: 'Add user authentication',
        agent: 'Claude',
        status: 'completed',
        duration: '2.1 min',
        createdAt: '2024-01-07T10:30:00Z'
      },
      {
        id: '2',
        prompt: 'Fix memory leak',
        agent: 'Codex',
        status: 'running',
        duration: '1.5 min',
        createdAt: '2024-01-07T10:25:00Z'
      }
    ]
  }
}
