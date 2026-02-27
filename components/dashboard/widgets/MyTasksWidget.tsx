'use client';

import Link from 'next/link';
import { ArrowRight, CheckSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTaskDetail } from '@/store/use-store';
import { PRIORITY_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface MyTask {
  id: string;
  taskId: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  project: { key: string; color: string };
}

interface MyTasksWidgetProps {
  tasks: MyTask[];
  slug: string;
}

const statusColors: Record<string, string> = {
  BACKLOG: '#6b7280',
  TODO: '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  IN_REVIEW: '#8b5cf6',
  DONE: '#10b981',
  CANCELLED: '#ef4444',
};

export default function MyTasksWidget({ tasks, slug }: MyTasksWidgetProps) {
  const { openTask } = useTaskDetail();
  const displayed = tasks.slice(0, 5);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">My Tasks</CardTitle>
        <Link href={`/w/${slug}/my-tasks`}>
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            View All <ArrowRight size={12} />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {displayed.length > 0 ? (
          <div className="space-y-2">
            {displayed.map((task) => {
              const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG];
              const isOverdue =
                task.dueDate &&
                new Date(task.dueDate) < new Date() &&
                task.status !== 'DONE';

              return (
                <div
                  key={task.id}
                  className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => openTask(task.id)}
                >
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] shrink-0"
                    style={{ borderColor: task.project.color, color: task.project.color }}
                  >
                    {task.taskId}
                  </Badge>
                  <span className="text-sm truncate flex-1">{task.title}</span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] shrink-0"
                    style={{ color: statusColors[task.status] }}
                  >
                    {task.status.replace('_', ' ')}
                  </Badge>
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: priority?.color }}
                    title={priority?.label}
                  />
                  {task.dueDate && (
                    <span
                      className={cn(
                        'text-[10px] text-muted-foreground shrink-0',
                        isOverdue && 'text-destructive font-medium'
                      )}
                    >
                      {new Date(task.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8">
            <CheckSquare size={32} className="text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No tasks assigned</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
