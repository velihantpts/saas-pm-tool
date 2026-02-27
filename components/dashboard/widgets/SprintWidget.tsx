'use client';

import { Zap, Calendar, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SprintData {
  id: string;
  name: string;
  endDate: string;
  totalTasks: number;
  completedTasks: number;
  totalPoints: number;
  completedPoints: number;
}

interface SprintWidgetProps {
  sprint: SprintData | null;
}

export default function SprintWidget({ sprint }: SprintWidgetProps) {
  if (!sprint) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">Sprint Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-8">
            <Zap size={32} className="text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No active sprint</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const taskPercent =
    sprint.totalTasks > 0
      ? Math.round((sprint.completedTasks / sprint.totalTasks) * 100)
      : 0;

  const pointPercent =
    sprint.totalPoints > 0
      ? Math.round((sprint.completedPoints / sprint.totalPoints) * 100)
      : 0;

  const endDate = new Date(sprint.endDate);
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap size={14} className="text-amber-400" />
          {sprint.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Task progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Task Completion</span>
            <span className="text-xs font-medium">{taskPercent}%</span>
          </div>
          <Progress value={taskPercent} />
          <p className="text-[10px] text-muted-foreground mt-1">
            {sprint.completedTasks} / {sprint.totalTasks} tasks
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={13} className="text-muted-foreground" />
            <div>
              <p className="text-xs font-medium">
                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
              </p>
              <p className="text-[10px] text-muted-foreground">remaining</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Target size={13} className="text-muted-foreground" />
            <div>
              <p className="text-xs font-medium">
                {sprint.completedPoints} / {sprint.totalPoints}
              </p>
              <p className="text-[10px] text-muted-foreground">story points</p>
            </div>
          </div>
        </div>

        {/* Points progress */}
        {sprint.totalPoints > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">Points Progress</span>
              <span className="text-xs font-medium">{pointPercent}%</span>
            </div>
            <Progress value={pointPercent} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
