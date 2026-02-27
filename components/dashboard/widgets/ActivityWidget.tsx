'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Activity {
  id: string;
  action: string;
  entity: string;
  user: { name: string | null; image: string | null };
  task?: { title: string; taskId: string } | null;
  createdAt: string;
}

interface ActivityWidgetProps {
  activities: Activity[];
  slug: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ActivityWidget({ activities, slug }: ActivityWidgetProps) {
  const displayed = activities.slice(0, 6);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Recent Activity</CardTitle>
        <Link href={`/w/${slug}/activity`}>
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            View All <ArrowRight size={12} />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {displayed.length > 0 ? (
          <div className="space-y-3">
            {displayed.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarImage src={item.user.image || undefined} />
                  <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                    {item.user.name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <p className="text-muted-foreground flex-1 truncate">
                  <span className="font-medium text-foreground">{item.user.name}</span>{' '}
                  {item.action} {item.entity}
                  {item.task?.taskId && (
                    <Badge variant="outline" className="ml-1 text-[10px] font-mono">
                      {item.task.taskId}
                    </Badge>
                  )}
                </p>
                <span className="text-xs text-muted-foreground shrink-0">
                  {timeAgo(item.createdAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>
        )}
      </CardContent>
    </Card>
  );
}
