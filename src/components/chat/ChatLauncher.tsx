"use client";
import React from "react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import UserAvatar from "@/components/ui/UserAvatar";

const ConversationClient = dynamic<{
  cid: number;
  embedded?: boolean;
}>(() => import("@/app/message/[id]/ConversationClient"), { ssr: false });

type UserLite = { id: number; name?: string };
type ConvLite = { id: number; users: UserLite[]; last?: { sent_at?: string } };

export function ChatLauncher(): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [activeId, setActiveId] = React.useState<number | null>(null);
  const [convs, setConvs] = React.useState<ConvLite[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [titleOverride, setTitleOverride] = React.useState<string | null>(null);
  const [unread, setUnread] = React.useState<Record<number, number>>({});
  // De-duplicate events (by messageId) to avoid double increments
  const seenMsgIdsRef = React.useRef<Set<number>>(new Set());

  const { user } = useAuth();
  const currentUserId = typeof user?.id === "number" ? user.id : null;
  const storageKey = React.useMemo(() => (currentUserId ? `chat:unread:${currentUserId}` : null), [currentUserId]);

  React.useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') setUnread(parsed as Record<number, number>);
      }
    } catch { /* ignore */ }
  }, [storageKey]);

  React.useEffect(() => {
    if (!storageKey) return;
    try { localStorage.setItem(storageKey, JSON.stringify(unread)); } catch { /* ignore */ }
  }, [unread, storageKey]);

  const loadConvs = React.useCallback(async (): Promise<ConvLite[]> => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/messages/conversations");
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j: unknown = await r.json();
      const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
      const isArr = (v: unknown): v is unknown[] => Array.isArray(v);
      const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

      const convsUnknown: unknown[] = isObj(j) && isArr((j as Record<string, unknown>).conversations)
        ? ((j as Record<string, unknown>).conversations as unknown[])
        : [];

      const mapped: ConvLite[] = (convsUnknown.map((c): ConvLite | null => {
        if (!isObj(c)) return null;
        const cid = (c as Record<string, unknown>).id;
        if (!isNum(cid)) return null;

        const usersRaw = (c as Record<string, unknown>).users;
        const usersArray: unknown[] = Array.isArray(usersRaw) ? usersRaw : [];
        const users: UserLite[] = usersArray
          .map((u) => {
            const uo = (typeof u === "object" && u) ? (u as Record<string, unknown>) : {};
            const inner = (typeof uo.user === "object" && uo.user) ? (uo.user as Record<string, unknown>) : {};
            const id = typeof inner.id === "number" && Number.isFinite(inner.id) ? inner.id : -1;
            const name = typeof inner.name === "string" ? inner.name : undefined;
            return id === -1 ? null : ({ id, name } as UserLite);
          })
          .filter(Boolean) as UserLite[];

        let last: { sent_at?: string } | undefined = undefined;
        const msgsRaw = (c as Record<string, unknown>).messages as unknown;
        if (Array.isArray(msgsRaw) && msgsRaw.length > 0) {
          const first = msgsRaw[0] as unknown;
          if (typeof first === "object" && first !== null && "sent_at" in (first as Record<string, unknown>)) {
            const s = (first as Record<string, unknown>).sent_at;
            if (typeof s === "string") last = { sent_at: s };
          }
        }
        return { id: cid as number, users, last };
      }).filter(Boolean)) as ConvLite[];

      mapped.sort((a, b) => {
        const ta = a.last?.sent_at ? new Date(a.last.sent_at).getTime() : 0;
        const tb = b.last?.sent_at ? new Date(b.last.sent_at).getTime() : 0;
        return tb - ta;
      });

      setConvs(mapped);
      return mapped;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!open) return;
    void loadConvs();
  }, [open, loadConvs]);

  React.useEffect(() => {
    const es = new EventSource("/api/messages/stream");
  es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if ((data?.type === 'message:new' || data?.type === 'message:deleted' || data?.type === 'reaction:update') && typeof data.conversationId === 'number') {
          const mid = typeof data.messageId === 'number' ? data.messageId : null;
          if (data?.type === 'message:new') {
            if (mid && seenMsgIdsRef.current.has(mid)) return;
            if (mid) {
              seenMsgIdsRef.current.add(mid);
              if (seenMsgIdsRef.current.size > 1000) {
                seenMsgIdsRef.current.clear();
                seenMsgIdsRef.current.add(mid);
              }
            }
          }
          const cid: number = data.conversationId;
          setUnread((prev) => {
            if (activeId === cid && open) return { ...prev, [cid]: 0 };
          const cur = prev[cid] ?? 0;
          if (data?.type !== 'message:new') return { ...prev };
          return { ...prev, [cid]: cur + 1 };
              });
          if (open) void loadConvs();
        }
      } catch {
        if (open) void loadConvs();
      }
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [open, loadConvs, activeId]);

  React.useEffect(() => {
    const onDeleted = (e: Event) => {
      const ce = e as CustomEvent<{ id?: number }>;
      const id = typeof ce.detail?.id === 'number' ? ce.detail.id : undefined;
  if (id) setUnread((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => Number(k) !== id)) as Record<number, number>);
      void loadConvs(); setActiveId(null);
    };
    window.addEventListener('chat:conversationDeleted', onDeleted);
    return () => window.removeEventListener('chat:conversationDeleted', onDeleted);
  }, [loadConvs]);

  React.useEffect(() => {
    if (activeId == null) return;
    setUnread((prev) => (prev[activeId] ? { ...prev, [activeId]: 0 } : prev));
  }, [activeId]);

  React.useEffect(() => {
    const handler = async (ev: Event) => {
      const ce = ev as CustomEvent<{ participantIds: number[]; title?: string | null }>;
      const ids = Array.isArray(ce.detail?.participantIds)
        ? ce.detail!.participantIds.filter((n) => Number.isFinite(n))
        : [];
      const title = (typeof ce.detail?.title === "string" && ce.detail!.title.trim()) ? ce.detail!.title : null;
      if (ids.length === 0) return;
      setOpen(true);
      setTitleOverride(title);
      try {
        const current = await loadConvs();
        const wantIds = [...(currentUserId ? [currentUserId] : []), ...ids].sort((a, b) => a - b);
        const found = current.find((c) => {
          const convIds = c.users.map((u) => u.id).sort((a, b) => a - b);
          return convIds.length === wantIds.length && convIds.every((v, i) => v === wantIds[i]);
        });
        if (found) { setActiveId(found.id); return; }
        const r = await fetch("/api/messages/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participantIds: ids, name: title ?? undefined }),
        });
        if (!r.ok) throw new Error("HTTP " + r.status);
        const after = await loadConvs();
        const created = after.find((c) => {
          const convIds = c.users.map((u) => u.id).sort((a, b) => a - b);
          return convIds.length === wantIds.length && convIds.every((v, i) => v === wantIds[i]);
        });
        if (created) setActiveId(created.id);
      } catch { /* ignore */ }
    };
    window.addEventListener("chat:startConversation", handler as EventListener);
    return () => window.removeEventListener("chat:startConversation", handler as EventListener);
  }, [loadConvs, currentUserId]);

  // Use shared client avatar to avoid <img> lint warning and unify fallbacks
  const AvatarBubble: React.FC<{ user: UserLite }> = ({ user: u }) => (
    <UserAvatar uid={u.id} name={u.name} size={24} className="ring-2 ring-white" />
  );

  const totalUnread = Object.values(unread).reduce((a, b) => a + (b || 0), 0);
  const convItems = convs.map((c) => {
    const others = c.users.filter((u) => currentUserId == null || u.id !== currentUserId);
    const labels = others.map((u) => (u.name && u.name.trim()) ? u.name : `#${u.id}`);
    const title = (activeId === c.id && titleOverride) ? titleOverride : (labels.join(", ") || `Conversation #${c.id}`);
  const last = c.last?.sent_at ? new Date(c.last.sent_at).toLocaleString("en-GB") : "";
    const unreadCount = unread[c.id] ?? 0;
    const isActive = activeId === c.id;
    return (
      <div
        key={c.id}
        className={`w-full px-3 py-3 rounded-lg border transition flex items-center justify-between gap-3 ${isActive ? 'bg-accent/10 border-accent ring-1 ring-accent/50' : 'hover:bg-muted border-border'}`}
        role="listitem"
        aria-current={isActive ? 'true' : undefined}
      >
        <button
          className="flex items-center gap-3 min-w-0 flex-1 text-left"
          onClick={(e) => { e.preventDefault(); setActiveId(c.id); setTitleOverride(null); setUnread((prev) => ({ ...prev, [c.id]: 0 })); }}
        >
          <div className="flex -space-x-2">{c.users.slice(0, 4).map((u, i) => (
            <div key={`avu-${u.id}-${i}`} className="inline-block">
              <AvatarBubble user={u} />
            </div>
          ))}</div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">{title}</div>
            <div className="truncate text-xs text-muted-foreground">{last}</div>
          </div>
        </button>
        {unreadCount > 0 && (
          <div className="shrink-0 text-xs px-2 py-1 rounded-full bg-destructive text-destructive-foreground">{String(unreadCount)}</div>
        )}
  <button
          className="shrink-0 text-destructive hover:text-destructive-foreground hover:bg-destructive text-xs px-2 py-1 border border-destructive rounded"
          onClick={async (e) => {
            e.stopPropagation();
            if (!confirm('Delete this conversation?')) return;
            try {
              const r = await fetch(`/api/messages/conversations/${c.id}`, { method: 'DELETE' });
              if (!r.ok) throw new Error('HTTP ' + r.status);
              const after = await loadConvs();
              if (activeId === c.id) setActiveId(null);
              setConvs(after);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Deletion failed');
            }
          }}
          title="Delete"
          type="button"
        >
          <Trash2 size={16} />
        </button>
      </div>
    );
  });

  const list = (
    <div className="p-3 space-y-2" role="list">
  {error && <div className="text-sm text-destructive">{error}</div>}
  {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
  {!loading && convs.length === 0 && <div className="text-sm text-muted-foreground">No conversations</div>}
      {convItems}
    </div>
  );


  const panel = !open ? null : (
    <div
      className="hidden md:block fixed !bottom-20 !right-4 !left-auto z-50 max-w-[95vw]"
      style={{ position: 'fixed', right: 16, bottom: 80, left: 'auto', width: activeId === null ? 'fit-content' : 'min(95vw, 1200px)' }}
    >
  <div className="border rounded-xl shadow-2xl overflow-hidden bg-transparent" style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
  <div className="flex items-center justify-between px-3 py-2 bg-primary text-primary-foreground select-none">
          <div className="flex items-center gap-2 min-w-0">
            <div className="text-sm font-medium">Messages</div>
      {activeId !== null && (
              <button
    className="ml-2 text-xs px-2 py-1 border border-primary-foreground/30 rounded hover:bg-primary-foreground/10 text-primary-foreground"
                onClick={(e) => { e.preventDefault(); setActiveId(null); setTitleOverride(null); }}
                type="button"
              >
        All conversations
              </button>
            )}
          </div>
          <button
      className="text-primary-foreground/90 hover:text-primary-foreground text-xs px-2 py-1 border border-primary-foreground/30 rounded"
            onClick={(e) => { e.preventDefault(); setOpen(false); }}
          >
      Close
          </button>
        </div>
        {activeId === null ? (
          <div className="flex-1 min-h-0 flex bg-transparent">
      <div className="ml-auto w-[380px] min-h-0 overflow-y-auto bg-card">
              {list}
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 grid" style={{ gridTemplateColumns: '1fr 380px' }}>
            {/* Left: conversation */}
    <div className="h-full min-h-0 overflow-hidden backdrop-blur-md bg-card/60 supports-[backdrop-filter]:bg-card/60 border-r border-border">
              <ConversationClient cid={activeId} embedded />
            </div>
            {/* Right: list */}
    <div className="border-l bg-card min-h-0 overflow-y-auto">
              {list}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const btn = (
    <button
      aria-label={open ? "Close messages" : "Open messages"}
      className="hidden md:flex fixed !bottom-4 !right-4 !left-auto z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg items-center justify-center text-xl hover:bg-primary/90 border border-primary/30 relative"
      style={{ position: 'fixed', right: 16, bottom: 16, left: 'auto' }}
      onClick={() => setOpen((v) => !v)}
      type="button"
    >
      <>
        💬
        {totalUnread > 0 && (
      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[11px] leading-[18px] text-center font-semibold border border-primary-foreground">
            {String(Math.min(totalUnread, 99))}
          </span>
        )}
      </>
    </button>
  );

  if (typeof window !== 'undefined' && document?.body) {
    return createPortal(<>{btn}{panel}</>, document.body);
  }
  return <>{btn}{panel}</>;
}
