'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface TaskStatusDistributionProps {
  data: Array<{ status: string; count: number; color: string }>
}

export function TaskStatusDistribution({ data }: TaskStatusDistributionProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="text-gradient">Task Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="count"
              label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(0.205 0 0)',
                border: '1px solid oklch(1 0 0 / 0.18)',
                borderRadius: '8px',
                backdropFilter: 'blur(12px)'
              }}
              formatter={(value) => [value, 'Tasks']}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {data.map((item) => (
            <div key={item.status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">{item.status}</span>
              </div>
              <div className="text-sm font-medium">
                {item.count} ({((item.count / total) * 100).toFixed(1)}%)
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
