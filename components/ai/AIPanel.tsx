'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Wand2, FileText, Zap, ClipboardList, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PRIORITY_CONFIG } from '@/lib/constants';

interface AITask {
  title: string;
  description: string;
  priority: string;
  estimate: number;
}

interface AIPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertTasks?: (tasks: AITask[]) => void;
}

const quickActions = [
  { icon: Zap, label: 'Generate Tasks', action: 'generate-tasks', prompt: 'Generate tasks for: ' },
  { icon: FileText, label: 'Summarize Project', action: 'summarize', prompt: 'Summarize the current project status' },
  { icon: Wand2, label: 'Write Description', action: 'write', prompt: 'Write a task description for: ' },
  { icon: ClipboardList, label: 'Daily Standup', action: 'standup', prompt: 'Generate daily standup report' },
];

export default function AIPanel({ open, onOpenChange, onInsertTasks }: AIPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [action, setAction] = useState('generate-tasks');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | AITask[] | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, prompt }),
      });

      if (!res.ok) throw new Error('AI request failed');

      const data = await res.json();

      if (action === 'generate-tasks' && Array.isArray(data.result)) {
        setResult(data.result as AITask[]);
      } else {
        setResult(typeof data.result === 'string' ? data.result : JSON.stringify(data.result, null, 2));
      }
    } catch {
      setError('Failed to get AI response. Please try again.');
    }
    setLoading(false);
  };

  const handleQuickAction = (qa: typeof quickActions[0]) => {
    setAction(qa.action);
    setPrompt(qa.prompt);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles size={18} className="text-purple-400" />
            AI Assistant
            <Badge variant="secondary" className="text-[10px]">Beta</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((qa) => (
              <Button
                key={qa.action}
                variant={action === qa.action ? 'default' : 'outline'}
                size="sm"
                className="h-9 text-xs gap-1.5 justify-start"
                onClick={() => handleQuickAction(qa)}
              >
                <qa.icon size={13} />
                {qa.label}
              </Button>
            ))}
          </div>

          {/* Prompt Input */}
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you need..."
              rows={3}
              className="pr-12 text-sm"
              onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleSubmit(); }}
            />
            <Button
              size="icon"
              className="absolute bottom-2 right-2 h-7 w-7"
              onClick={handleSubmit}
              disabled={loading || !prompt.trim()}
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            </Button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {/* Generated Tasks */}
                {Array.isArray(result) ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Generated Tasks ({result.length})</h4>
                      {onInsertTasks && (
                        <Button size="sm" className="h-7 text-xs gap-1" onClick={() => onInsertTasks(result)}>
                          <Zap size={12} /> Add All Tasks
                        </Button>
                      )}
                    </div>
                    {result.map((task, i) => {
                      const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG];
                      return (
                        <Card key={i}>
                          <CardContent className="pt-4 pb-3 space-y-1">
                            <div className="flex items-start justify-between">
                              <h5 className="text-sm font-medium">{task.title}</h5>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {priority && (
                                  <Badge variant="outline" className="text-[10px]" style={{ borderColor: priority.color, color: priority.color }}>
                                    {priority.label}
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-[10px]">{task.estimate}pts</Badge>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{task.description}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  /* Text Result */
                  <Card>
                    <CardContent className="pt-4">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="text-sm whitespace-pre-wrap">{result}</div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
