'use client';

import { useMemo, useRef, useCallback } from 'react';
import {
  eachDayOfInterval,
  differenceInDays,
  format,
  isWeekend,
  startOfDay,
  startOfMonth,
  endOfMonth,
  min,
  max,
  parseISO,
  isToday,
} from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PRIORITY_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useTaskDetail } from '@/store/use-store';
import type { BoardTask } from '@/lib/types';

const DAY_WIDTH = 36;
const LEFT_PANEL_WIDTH = 240;

interface GanttViewProps {
  tasks: BoardTask[];
  slug: string;
}

export default function GanttView({ tasks, slug }: GanttViewProps) {
  const { openTask } = useTaskDetail();
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);

  const handleBodyScroll = useCallback(() => {
    if (headerScrollRef.current && bodyScrollRef.current) {
      headerScrollRef.current.scrollLeft = bodyScrollRef.current.scrollLeft;
    }
  }, []);

  const scheduledTasks = useMemo(
    () => tasks.filter((t) => t.startDate && t.dueDate),
    [tasks],
  );

  const unscheduledTasks = useMemo(
    () => tasks.filter((t) => !t.startDate || !t.dueDate),
    [tasks],
  );

  const { dateRange, days } = useMemo(() => {
    if (scheduledTasks.length === 0) {
      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date());
      return {
        dateRange: { start, end },
        days: eachDayOfInterval({ start, end }),
      };
    }

    const allStarts = scheduledTasks.map((t) => parseISO(t.startDate!));
    const allEnds = scheduledTasks.map((t) => parseISO(t.dueDate!));

    const rangeStart = startOfDay(
      new Date(min(allStarts).getTime() - 3 * 24 * 60 * 60 * 1000),
    );
    const rangeEnd = startOfDay(
      new Date(max(allEnds).getTime() + 3 * 24 * 60 * 60 * 1000),
    );

    return {
      dateRange: { start: rangeStart, end: rangeEnd },
      days: eachDayOfInterval({ start: rangeStart, end: rangeEnd }),
    };
  }, [scheduledTasks]);

  const totalWidth = days.length * DAY_WIDTH;

  const getBarStyle = (task: BoardTask) => {
    if (!task.startDate || !task.dueDate) return null;

    const taskStart = startOfDay(parseISO(task.startDate));
    const taskEnd = startOfDay(parseISO(task.dueDate));
    const offsetDays = differenceInDays(taskStart, dateRange.start);
    const spanDays = differenceInDays(taskEnd, taskStart) + 1;

    return {
      left: offsetDays * DAY_WIDTH,
      width: Math.max(spanDays * DAY_WIDTH - 4, DAY_WIDTH - 4),
    };
  };

  const todayOffset = useMemo(() => {
    const todayStart = startOfDay(new Date());
    const offset = differenceInDays(todayStart, dateRange.start);
    if (offset >= 0 && offset < days.length) {
      return offset * DAY_WIDTH + DAY_WIDTH / 2;
    }
    return null;
  }, [dateRange.start, days.length]);

  const renderTaskRow = (task: BoardTask, isScheduled: boolean) => {
    const priority =
      PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG];
    const initials =
      task.assignee?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() || '';

    const barStyle = isScheduled ? getBarStyle(task) : null;

    return (
      <div key={task.id} className="flex h-10 border-b border-border">
        {/* Left panel row */}
        <div
          className="shrink-0 flex items-center gap-2 px-3 border-r border-border bg-card"
          style={{ width: LEFT_PANEL_WIDTH }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: priority?.color }}
          />
          <span
            className="text-xs truncate flex-1 cursor-pointer hover:text-primary transition-colors"
            onClick={() => openTask(task.id)}
          >
            {task.title}
          </span>
          {task.assignee && (
            <Avatar size="sm" className="h-5 w-5">
              <AvatarImage src={task.assignee.image || undefined} />
              <AvatarFallback className="text-[7px] font-bold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Right panel row */}
        <div className="relative flex-1 min-w-0">
          <div className="relative h-full" style={{ width: totalWidth }}>
            {/* Day column backgrounds */}
            {days.map((day, i) => (
              <div
                key={i}
                className={cn(
                  'absolute top-0 h-full border-r border-border/30',
                  isWeekend(day) && 'bg-muted/30',
                )}
                style={{ left: i * DAY_WIDTH, width: DAY_WIDTH }}
              />
            ))}

            {/* Today indicator */}
            {todayOffset !== null && (
              <div
                className="absolute top-0 h-full w-0.5 bg-primary z-10"
                style={{ left: todayOffset }}
              />
            )}

            {/* Task bar */}
            {isScheduled && barStyle ? (
              <div
                className="absolute top-1.5 h-7 rounded cursor-pointer hover:brightness-110 transition-all flex items-center px-2"
                style={{
                  left: barStyle.left + 2,
                  width: barStyle.width,
                  backgroundColor: priority?.color || '#6b7280',
                }}
                onClick={() => openTask(task.id)}
                title={task.title}
              >
                <span className="text-[10px] text-white font-medium truncate">
                  {task.title}
                </span>
              </div>
            ) : (
              <div
                className="absolute top-1.5 h-7 rounded bg-muted-foreground/20 cursor-pointer hover:bg-muted-foreground/30 transition-all flex items-center px-2"
                style={{ left: 4, width: DAY_WIDTH * 3 }}
                onClick={() => openTask(task.id)}
                title={`${task.title} (Unscheduled)`}
              >
                <span className="text-[10px] text-muted-foreground font-medium truncate">
                  {task.title}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col border border-border rounded-lg overflow-hidden bg-card h-full">
      {/* Timeline header */}
      <div className="flex border-b border-border shrink-0">
        <div
          className="shrink-0 flex items-center px-3 border-r border-border bg-muted/30"
          style={{ width: LEFT_PANEL_WIDTH }}
        >
          <span className="text-xs font-medium text-muted-foreground">
            Task
          </span>
        </div>
        <div
          ref={headerScrollRef}
          className="flex-1 overflow-hidden min-w-0"
        >
          <div className="flex" style={{ width: totalWidth }}>
            {days.map((day, i) => (
              <div
                key={i}
                className={cn(
                  'shrink-0 text-center py-2 border-r border-border/30',
                  isWeekend(day) && 'bg-muted/30',
                  isToday(day) && 'bg-primary/10',
                )}
                style={{ width: DAY_WIDTH }}
              >
                <div className="text-[9px] text-muted-foreground leading-none">
                  {format(day, 'EEE')}
                </div>
                <div className="text-[11px] font-medium mt-0.5">
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-auto" ref={bodyScrollRef} onScroll={handleBodyScroll}>
          {/* Scheduled tasks */}
          {scheduledTasks.length > 0 && (
            <div>
              {scheduledTasks.map((task) => renderTaskRow(task, true))}
            </div>
          )}

          {/* Unscheduled section */}
          {unscheduledTasks.length > 0 && (
            <div>
              <div className="flex h-8 border-b border-border bg-muted/20">
                <div
                  className="shrink-0 flex items-center px-3 border-r border-border"
                  style={{ width: LEFT_PANEL_WIDTH }}
                >
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Unscheduled
                  </span>
                </div>
                <div className="flex-1" />
              </div>
              {unscheduledTasks.map((task) => renderTaskRow(task, false))}
            </div>
          )}

          {/* Empty state */}
          {tasks.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-muted-foreground">No tasks found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
