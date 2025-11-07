'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SuccessRateChartProps {
  data: Array<{ month: string; rate: number }>
}

export function SuccessRateChart({ data }: SuccessRateChartProps) {
  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="text-gradient">Success Rate Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0)" />
            <XAxis dataKey="month" stroke="oklch(0.556 0 0)" fontSize={12} />
            <YAxis
              stroke="oklch(0.556 0 0)"
              fontSize={12}
              domain={[70, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(0.205 0 0)',
                border: '1px solid oklch(1 0 0 / 0.18)',
                borderRadius: '8px',
                backdropFilter: 'blur(12px)'
              }}
              formatter={(value) => [`${value}%`, 'Success Rate']}
            />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="oklch(0.705 0.143 145.324)"
              strokeWidth={3}
              fill="url(#gradientSuccess)"
            />
            <defs>
              <linearGradient id="gradientSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.705 0.143 145.324)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(0.705 0.143 145.324)" stopOpacity={0} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
