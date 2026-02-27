'use client';

import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

interface WidgetOption {
  id: string;
  name: string;
  description: string;
}

const AVAILABLE_WIDGETS: WidgetOption[] = [
  { id: 'kpi', name: 'KPI Cards', description: 'Key performance metrics overview' },
  { id: 'quickActions', name: 'Quick Actions', description: 'Shortcuts to common pages' },
  { id: 'activity', name: 'Recent Activity', description: 'Latest workspace activity feed' },
  { id: 'taskChart', name: 'Task Chart', description: 'Donut chart of tasks by status' },
  { id: 'myTasks', name: 'My Tasks', description: 'Tasks assigned to you' },
  { id: 'sprintProgress', name: 'Sprint Progress', description: 'Active sprint completion status' },
];

interface WidgetSettingsProps {
  widgets: string[];
  onChange: (widgets: string[]) => void;
}

export default function WidgetSettings({ widgets, onChange }: WidgetSettingsProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(widgets);

  const handleToggle = (widgetId: string) => {
    setSelected((prev) =>
      prev.includes(widgetId)
        ? prev.filter((id) => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const handleSave = () => {
    onChange(selected);
    setOpen(false);
  };

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setSelected(widgets);
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Settings2 size={13} />
          Customize
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customize Dashboard</DialogTitle>
          <DialogDescription>
            Toggle widgets to show or hide them on your dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {AVAILABLE_WIDGETS.map((widget) => (
            <label
              key={widget.id}
              className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={selected.includes(widget.id)}
                onCheckedChange={() => handleToggle(widget.id)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium">{widget.name}</p>
                <p className="text-xs text-muted-foreground">{widget.description}</p>
              </div>
            </label>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
