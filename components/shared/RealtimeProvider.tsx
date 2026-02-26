'use client';

import { createContext, useContext, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useNotificationStore } from '@/store/use-store';

// ─── Real-time Event Types ──────────────────────────
type EventType = 'task:created' | 'task:updated' | 'task:deleted' | 'comment:created' | 'member:joined' | 'notification:new';

interface RealtimeEvent {
  type: EventType;
  data: Record<string, unknown>;
  userId: string;
  timestamp: number;
}

type EventHandler = (event: RealtimeEvent) => void;

interface RealtimeContextType {
  subscribe: (event: EventType, handler: EventHandler) => () => void;
  publish: (event: RealtimeEvent) => void;
  isConnected: boolean;
}

const RealtimeContext = createContext<RealtimeContextType>({
  subscribe: () => () => {},
  publish: () => {},
  isConnected: false,
});

export function useRealtime() {
  return useContext(RealtimeContext);
}

// ─── BroadcastChannel-based real-time for same-browser tabs ──
// In production, this would be Pusher/Ably/WebSocket
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { slug } = useParams();
  const { unreadCount, setUnreadCount } = useNotificationStore();
  const handlersRef = useRef<Map<EventType, Set<EventHandler>>>(new Map());
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const channel = new BroadcastChannel(`nexusflow:${slug}`);
      channelRef.current = channel;

      channel.onmessage = (e: MessageEvent<RealtimeEvent>) => {
        const event = e.data;
        const handlers = handlersRef.current.get(event.type);
        if (handlers) {
          handlers.forEach((handler) => handler(event));
        }

        // Show toast for certain events from other users
        if (event.type === 'task:created') {
          toast.info(`New task created: ${(event.data as { title?: string }).title}`);
        }
        if (event.type === 'notification:new') {
          setUnreadCount(unreadCount + 1);
        }
      };

      return () => {
        channel.close();
        channelRef.current = null;
      };
    } catch {
      // BroadcastChannel not supported
    }
  }, [slug, setUnreadCount]);

  const subscribe = useCallback((event: EventType, handler: EventHandler) => {
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set());
    }
    handlersRef.current.get(event)!.add(handler);

    return () => {
      handlersRef.current.get(event)?.delete(handler);
    };
  }, []);

  const publish = useCallback((event: RealtimeEvent) => {
    // Broadcast to other tabs
    channelRef.current?.postMessage(event);

    // Also trigger local handlers
    const handlers = handlersRef.current.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => handler(event));
    }
  }, []);

  return (
    <RealtimeContext.Provider value={{ subscribe, publish, isConnected: true }}>
      {children}
    </RealtimeContext.Provider>
  );
}
