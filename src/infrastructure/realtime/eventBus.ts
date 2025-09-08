type MessageNewEvent = {
  type: 'message:new';
  conversationId: number;
  messageId: number;
  at: number;
};

type MessageDeletedEvent = {
  type: 'message:deleted';
  conversationId: number;
  messageId: number;
  at: number;
};

type ReactionUpdateEvent = {
  type: 'reaction:update';
  conversationId: number;
  messageId: number;
  emoji?: string;
  removed?: boolean;
  at: number;
};

export type BusEvent = MessageNewEvent | MessageDeletedEvent | ReactionUpdateEvent;

type Listener = (e: BusEvent) => void;

class EventBus {
  private listeners: Set<Listener> = new Set();

  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  publish(event: BusEvent) {
    for (const l of Array.from(this.listeners)) {
      try { l(event); } catch {}
    }
  }
}

export const eventBus = new EventBus();
