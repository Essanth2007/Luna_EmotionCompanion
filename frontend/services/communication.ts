// Real-time communication client — connects to the Luna Communication Service
// (WebSocket at ws://<host>:8002/ws/{userId}?token=<jwt>).
//
// Exposes a small pub/sub API used by the live-emotion and presence features.

import { getStoredToken } from '@/store/auth';

export type CommEventHandler = (payload: any) => void;

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8002';

interface InternalEvent {
  type: string;
  [key: string]: any;
}

class CommunicationClient {
  private ws: WebSocket | null = null;
  private userId: string | null = null;
  private handlers = new Map<string, Set<CommEventHandler>>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = false;
  private ready: Promise<void> | null = null;

  /** Connect as the given user using the stored JWT. */
  connect(userId: string): void {
    if (typeof window === 'undefined') return;
    if (this.ws && this.userId === userId && this.ws.readyState === WebSocket.OPEN) {
      return;
    }
    this.userId = userId;
    this.shouldReconnect = true;
    this.open();
  }

  private open(): void {
    if (!this.userId) return;
    const token = getStoredToken() || '';
    const url = `${WS_BASE}/ws/${encodeURIComponent(this.userId)}?token=${encodeURIComponent(token)}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.emitLocal('__open__', {});
    };
    this.ws.onmessage = (ev) => {
      let msg: InternalEvent;
      try {
        msg = JSON.parse(ev.data);
      } catch {
        return;
      }
      if (msg && msg.type) {
        this.dispatch(msg.type, msg);
      }
    };
    this.ws.onclose = () => {
      this.emitLocal('__close__', {});
      if (this.shouldReconnect) {
        this.reconnectTimer = setTimeout(() => this.open(), 2000);
      }
    };
    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private dispatch(type: string, payload: any): void {
    const set = this.handlers.get(type);
    if (set) set.forEach((h) => h(payload));
  }

  private emitLocal(type: string, payload: any): void {
    this.dispatch(type, payload);
  }

  /** Subscribe to a communication event (e.g. 'live_emotion_update', 'presence_update'). */
  on(event: string, handler: CommEventHandler): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off(event: string, handler: CommEventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  /** Send an event over the socket. */
  send(event: string, payload: Record<string, any> = {}): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: event, ...payload }));
    }
  }

  isOpen(): boolean {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }
}

export const communication = new CommunicationClient();
