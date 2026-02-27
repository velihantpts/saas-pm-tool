'use client';

import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TaskChartData {
  name: string;
  value: number;
  color: string;
}

interface TaskChartWidgetProps {
  data: TaskChartData[];
}

const STATUS_COLORS: Record<string, string> = {
  BACKLOG: '#6b7280',
  TODO: '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  IN_REVIEW: '#8b5cf6',
  DONE: '#10b981',
  CANCELLED: '#ef4444',
};

function renderCustomLabel({
  cx,
  cy,
  viewBox,
  total,
}: {
  cx: number;
  cy: number;
  viewBox: { cx: number; cy: number };
  total: number;
}) {
  return (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      dominantBaseline="central"
      className="fill-foreground"
    >
      <tspan x={viewBox.cx} y={viewBox.cy - 6} fontSize="20" fontWeight="bold">
        {total}
      </tspan>
      <tspan x={viewBox.cx} y={viewBox.cy + 14} fontSize="10" className="fill-muted-foreground">
        Total
      </tspan>
    </text>
  );
}

export default function TaskChartWidget({ data }: TaskChartWidgetProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">Tasks by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-10">No tasks yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm">Tasks by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ maxHeight: 280 }}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || STATUS_COLORS[entry.name] || '#6b7280'}
                  />
                ))}
                {/* Center label */}
                <Cell fill="transparent" />
              </Pie>
              <text
                x="50%"
                y="40%"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-foreground"
                fontSize="20"
                fontWeight="bold"
              >
                {total}
              </text>
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-muted-foreground"
                fontSize="10"
              >
                Total
              </text>
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span className="text-xs text-muted-foreground">
                    {value.replace('_', ' ')}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
