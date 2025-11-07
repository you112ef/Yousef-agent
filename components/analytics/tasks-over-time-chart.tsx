'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TasksOverTimeChartProps {
  data: Array<{ date: string; tasks: number }>
}

export function TasksOverTimeChart({ data }: TasksOverTimeChartProps) {
  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="text-gradient">Tasks Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0)" />
            <XAxis
              dataKey="date"
              stroke="oklch(0.556 0 0)"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="oklch(0.556 0 0)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(0.205 0 0)',
                border: '1px solid oklch(1 0 0 / 0.18)',
                borderRadius: '8px',
                backdropFilter: 'blur(12px)'
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Line
              type="monotone"
              dataKey="tasks"
              stroke="oklch(0.705 0.213 265.324)"
              strokeWidth={3}
              dot={{ fill: 'oklch(0.705 0.213 265.324)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'oklch(0.705 0.213 265.324)', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
