'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  addMonths,
  subMonths,
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { PRIORITY_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useTaskDetail } from '@/store/use-store';
import type { BoardTask } from '@/lib/types';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface CalendarViewProps {
  tasks: BoardTask[];
  slug: string;
}

export default function CalendarView({ tasks, slug }: CalendarViewProps) {
  const { openTask } = useTaskDetail();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = useMemo(
    () => eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
    [calendarStart.getTime(), calendarEnd.getTime()],
  );

  const tasksByDate = useMemo(() => {
    const map = new Map<string, BoardTask[]>();
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const key = format(new Date(task.dueDate), 'yyyy-MM-dd');
      const arr = map.get(key) || [];
      arr.push(task);
      map.set(key, arr);
    }
    return map;
  }, [tasks]);

  const today = new Date();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1 border border-border rounded-lg overflow-hidden">
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayTasks = tasksByDate.get(dateKey) || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, today);

          return (
            <div
              key={dateKey}
              className={cn(
                'min-h-[100px] border-b border-r border-border p-1.5 transition-colors',
                !isCurrentMonth && 'opacity-40',
                isToday && 'bg-primary/10',
              )}
            >
              <span
                className={cn(
                  'text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full',
                  isToday && 'bg-primary text-primary-foreground',
                  !isToday && 'text-muted-foreground',
                )}
              >
                {format(day, 'd')}
              </span>

              <div className="mt-0.5 space-y-0.5">
                {dayTasks.slice(0, 3).map((task) => {
                  const priority =
                    PRIORITY_CONFIG[
                      task.priority as keyof typeof PRIORITY_CONFIG
                    ];
                  return (
                    <button
                      key={task.id}
                      className="w-full text-left flex items-center gap-1 rounded px-1 py-0.5 hover:bg-muted/80 transition-colors group cursor-pointer"
                      onClick={() => openTask(task.id)}
                    >
                      <span
                        className="w-0.5 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: priority?.color }}
                      />
                      <span className="text-[10px] leading-tight truncate text-foreground group-hover:text-primary transition-colors">
                        {task.title}
                      </span>
                    </button>
                  );
                })}
                {dayTasks.length > 3 && (
                  <span className="text-[9px] text-muted-foreground pl-2">
                    +{dayTasks.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
