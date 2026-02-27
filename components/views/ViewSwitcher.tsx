'use client';

import { LayoutGrid, List, CalendarDays, GanttChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ViewType = 'kanban' | 'list' | 'calendar' | 'gantt';

interface ViewSwitcherProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const views: { value: ViewType; icon: React.ElementType; label: string }[] = [
  { value: 'kanban', icon: LayoutGrid, label: 'Kanban' },
  { value: 'list', icon: List, label: 'List' },
  { value: 'calendar', icon: CalendarDays, label: 'Calendar' },
  { value: 'gantt', icon: GanttChart, label: 'Gantt' },
];

export default function ViewSwitcher({ activeView, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
      {views.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant={activeView === value ? 'secondary' : 'ghost'}
          size="icon-xs"
          className={cn(
            'h-7 w-7',
            activeView === value && 'shadow-sm',
          )}
          onClick={() => onViewChange(value)}
          title={label}
        >
          <Icon size={14} />
        </Button>
      ))}
    </div>
  );
}
