'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, Play, Square, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useTimerStore } from '@/store/use-store';
import { toast } from 'sonner';

interface TimeEntry {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  description: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface TimeTrackerProps {
  taskId: string;
  slug: string;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatDurationShort(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatTotalTime(entries: TimeEntry[]): string {
  const totalMs = entries.reduce((acc, entry) => acc + (entry.duration || 0), 0);
  return formatDurationShort(totalMs);
}

export default function TimeTracker({ taskId, slug }: TimeTrackerProps) {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManual, setShowManual] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Manual entry form state
  const [manualDate, setManualDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [manualStart, setManualStart] = useState('09:00');
  const [manualEnd, setManualEnd] = useState('10:00');
  const [manualDescription, setManualDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    activeTaskId,
    startTime,
    description,
    activeEntryId,
    start,
    stop,
    setDescription,
  } = useTimerStore();

  const isActive = activeTaskId === taskId;

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/workspaces/${slug}/tasks/${taskId}/time-entries`
      );
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [slug, taskId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Live timer tick
  useEffect(() => {
    if (!isActive || !startTime) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const handleStart = async () => {
    try {
      const res = await fetch(
        `/api/workspaces/${slug}/tasks/${taskId}/time-entries`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startTime: new Date().toISOString() }),
        }
      );
      if (res.ok) {
        const entry = await res.json();
        start(taskId, entry.id);
        setElapsed(0);
        toast.success('Timer started');
      }
    } catch {
      toast.error('Failed to start timer');
    }
  };

  const handleStop = async () => {
    if (!activeEntryId) return;
    try {
      const res = await fetch(
        `/api/workspaces/${slug}/tasks/${taskId}/time-entries/${activeEntryId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endTime: new Date().toISOString(),
            description,
          }),
        }
      );
      if (res.ok) {
        stop();
        setElapsed(0);
        fetchEntries();
        toast.success('Time logged');
      }
    } catch {
      toast.error('Failed to stop timer');
    }
  };

  const handleManualSubmit = async () => {
    const startDateTime = new Date(`${manualDate}T${manualStart}:00`);
    const endDateTime = new Date(`${manualDate}T${manualEnd}:00`);
    const duration = endDateTime.getTime() - startDateTime.getTime();

    if (duration <= 0) {
      toast.error('End time must be after start time');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/workspaces/${slug}/tasks/${taskId}/time-entries`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            duration,
            description: manualDescription || null,
          }),
        }
      );
      if (res.ok) {
        setShowManual(false);
        setManualDescription('');
        fetchEntries();
        toast.success('Time entry added');
      }
    } catch {
      toast.error('Failed to add time entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    try {
      const res = await fetch(
        `/api/workspaces/${slug}/tasks/${taskId}/time-entries/${entryId}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== entryId));
        toast.success('Entry deleted');
      }
    } catch {
      toast.error('Failed to delete entry');
    }
  };

  return (
    <div className="space-y-4">
      {/* Total time summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock size={14} className="text-muted-foreground" />
          <span>Time Tracked</span>
        </div>
        <span className="text-sm font-mono text-muted-foreground">
          {formatTotalTime(entries)}
        </span>
      </div>

      <Separator />

      {/* Active Timer */}
      <div className="flex items-center gap-2">
        {isActive ? (
          <>
            <div className="flex-1 flex items-center gap-2">
              <span className="text-lg font-mono tabular-nums text-primary">
                {formatDuration(elapsed)}
              </span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you working on?"
              className="h-8 text-xs flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleStop}
              title="Stop timer"
            >
              <Square size={14} />
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={handleStart}
            >
              <Play size={12} />
              Start Timer
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => setShowManual(!showManual)}
            >
              <Plus size={12} />
              Log Time
            </Button>
          </>
        )}
      </div>

      {/* Manual Entry Form */}
      {showManual && (
        <div className="border border-border rounded-md p-3 space-y-3 bg-muted/20">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Date</label>
              <Input
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Start</label>
              <Input
                type="time"
                value={manualStart}
                onChange={(e) => setManualStart(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">End</label>
              <Input
                type="time"
                value={manualEnd}
                onChange={(e) => setManualEnd(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <Input
            value={manualDescription}
            onChange={(e) => setManualDescription(e.target.value)}
            placeholder="Description (optional)"
            className="h-8 text-xs"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={handleManualSubmit}
              disabled={submitting}
            >
              {submitting && <Loader2 size={12} className="animate-spin mr-1" />}
              Save Entry
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowManual(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Time Entries List */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={16} className="animate-spin text-muted-foreground" />
        </div>
      ) : entries.length > 0 ? (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarImage src={entry.user.image || undefined} />
                <AvatarFallback className="text-[8px]">
                  {entry.user.name?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate">
                  {entry.description || 'No description'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(entry.startTime).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <span className="text-xs font-mono text-muted-foreground tabular-nums">
                {entry.duration ? formatDurationShort(entry.duration) : '--'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(entry.id)}
              >
                <Trash2 size={12} />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-4">
          No time entries yet
        </p>
      )}
    </div>
  );
}
