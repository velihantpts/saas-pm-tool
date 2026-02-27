'use client';

import { CheckCircle2, FolderKanban, Users, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface KpiData {
  totalTasks: number;
  projects: number;
  members: number;
  overdueTasks: number;
  completedThisWeek: number;
  createdThisWeek: number;
}

interface KpiWidgetProps {
  data: KpiData;
}

const kpiConfig = [
  { key: 'totalTasks' as const, label: 'Total Tasks', icon: CheckCircle2, color: '#22d3ee' },
  { key: 'projects' as const, label: 'Active Projects', icon: FolderKanban, color: '#6366f1' },
  { key: 'members' as const, label: 'Team Members', icon: Users, color: '#10b981' },
  { key: 'overdueTasks' as const, label: 'Overdue', icon: AlertTriangle, color: '#ef4444' },
];

export default function KpiWidget({ data }: KpiWidgetProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {kpiConfig.map((kpi) => {
        const Icon = kpi.icon;
        const value = data[kpi.key] ?? 0;
        return (
          <Card key={kpi.key} className="hover:-translate-y-0.5 transition-all duration-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2">
                    {kpi.label}
                  </p>
                  <p className="text-3xl font-bold text-foreground">{value}</p>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${kpi.color}15`, color: kpi.color }}
                >
                  <Icon size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
