import { Client, Notification } from 'pg';
import { eventBus } from './eventBus';
import type { BusEvent } from './eventBus';

let started: boolean = false;
let client: Client | null = null;
let connecting: Promise<void> | null = null;

async function connectAndListen(connectionString: string) {
  client = new Client({ connectionString });
  await client.connect();
  await client.query('LISTEN message_new');
  client.on('notification', (msg: Notification) => {
    if (!msg.payload) return;
    try {
      const evt = JSON.parse(msg.payload) as Partial<BusEvent> & Record<string, unknown>;
      if (
        evt && typeof evt.conversationId === 'number' &&
        (evt.type === 'message:new' || evt.type === 'message:deleted' || evt.type === 'reaction:update')
      ) {
        eventBus.publish(evt as BusEvent);
      }
    } catch {}
  });
  client.on('error', () => {
    reconnect(connectionString);
  });
  client.on('end', () => {
    reconnect(connectionString);
  });
}

function reconnect(connectionString: string) {
  if (connecting) return;
  connecting = (async () => {
    try {
      await new Promise(r => setTimeout(r, 500));
      await connectAndListen(connectionString);
    } catch {
      await new Promise(r => setTimeout(r, 2000));
      connecting = null;
      reconnect(connectionString);
    } finally {
      connecting = null;
    }
  })();
}

export async function ensurePgListener(): Promise<void> {
  if (started) return;
  const isBrowser = typeof window !== 'undefined';
  const isEdge = typeof process !== 'undefined' && process.env.NEXT_RUNTIME === 'edge';
  if (isBrowser || isEdge) return;
  const cs = process.env.DATABASE_URL;
  if (!cs) return;
  started = true;
  await connectAndListen(cs);
}
