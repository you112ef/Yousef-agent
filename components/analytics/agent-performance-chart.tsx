'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface AgentPerformanceChartProps {
  data: Array<{ name: string; tasks: number; successRate: number; avgDuration: string }>
  detailed?: boolean
}

export function AgentPerformanceChart({ data, detailed = false }: AgentPerformanceChartProps) {
  const colors = [
    'oklch(0.705 0.213 265.324)',
    'oklch(0.705 0.213 46.324)',
    'oklch(0.705 0.213 312.324)',
    'oklch(0.705 0.143 145.324)'
  ]

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="text-gradient">
          {detailed ? 'Detailed Agent Performance' : 'Agent Performance Comparison'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={detailed ? 400 : 300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0)" />
            <XAxis
              dataKey="name"
              stroke="oklch(0.556 0 0)"
              fontSize={12}
              angle={detailed ? -45 : 0}
              textAnchor={detailed ? 'end' : 'middle'}
              height={detailed ? 80 : 50}
            />
            <YAxis stroke="oklch(0.556 0 0)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(0.205 0 0)',
                border: '1px solid oklch(1 0 0 / 0.18)',
                borderRadius: '8px',
                backdropFilter: 'blur(12px)'
              }}
              formatter={(value, name) => {
                if (name === 'successRate') return [`${value}%`, 'Success Rate']
                return [value, 'Tasks']
              }}
            />
            <Bar dataKey="tasks" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {detailed && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {data.map((agent, index) => (
              <div key={agent.name} className="p-3 glass rounded-lg">
                <h4 className="font-medium text-sm mb-2">{agent.name}</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className="font-medium">{agent.successRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Duration:</span>
                    <span className="font-medium">{agent.avgDuration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
