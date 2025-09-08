"use client";
import React from 'react';
import { Trash2, Reply, MoreHorizontal, Mail, X, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type Msg = { id: number; sender_id: number; content: string; sent_at: string; reactions?: Record<string, number> };
type Participant = { id: number; label: string };

export default function ConversationClient({ cid, embedded }: { cid: number; embedded?: boolean }): React.ReactElement {
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [text, setText] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [collapsed, setCollapsed] = React.useState(false);
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement | null>(null);
  const seenMsgIdsRef = React.useRef<Set<number>>(new Set());
  const [openReactionFor, setOpenReactionFor] = React.useState<number | null>(null);
  const [openEmojiFor, setOpenEmojiFor] = React.useState<number | null>(null);
  const [hoveredActionFor, setHoveredActionFor] = React.useState<number | null>(null);
  const [barBelow, setBarBelow] = React.useState(false);
  const [barOffsetX, setBarOffsetX] = React.useState(0);
  const actionBarRef = React.useRef<HTMLDivElement | null>(null);
  const hideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [myReactions, setMyReactions] = React.useState<Record<number, Set<string>>>({});

  const hasReacted = React.useCallback((mid: number, emoji: string): boolean => {
    const s = myReactions[mid];
    return !!s && s.has(emoji);
  }, [myReactions]);

  const toggleReaction = React.useCallback(async (mid: number, emoji: string) => {
    const removing = hasReacted(mid, emoji);
    try {
      if (removing) {
        let ok = false;
        try {
          const r = await fetch(`/api/messages/conversations/${cid}/messages/${mid}/reactions?emoji=${encodeURIComponent(emoji)}`, { method: 'DELETE' });
          ok = r.ok;
        } catch { /* noop */ }
        if (!ok) {
          // Optionally handle the error, e.g., setError('Failed to remove reaction');
        }
        setMyReactions(prev => {
          const next: Record<number, Set<string>> = { ...prev };
          const existing = next[mid] ? new Set<string>(next[mid]) : new Set<string>();
          existing.delete(emoji);
          next[mid] = existing;
          return next;
        });
      } else {
        await fetch(`/api/messages/conversations/${cid}/messages/${mid}/reactions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ emoji }) });
        setMyReactions(prev => {
          const next: Record<number, Set<string>> = { ...prev };
          const existing = next[mid] ? new Set<string>(next[mid]) : new Set<string>();
          existing.add(emoji);
          next[mid] = existing;
          return next;
        });
      }
    } catch { /* noop */ }
  }, [cid, hasReacted]);
  const [replyTo, setReplyTo] = React.useState<Msg | null>(null);
  const { user } = useAuth();
  const currentUserId = React.useMemo(() => {
    if (!user) return null;
    const v = user.id as unknown;
    const n = typeof v === 'string' ? Number(v) : (typeof v === 'number' ? v : NaN);
    return Number.isFinite(n) ? (n as number) : null;
  }, [user]);
  const [selfId, setSelfId] = React.useState<number | null>(null);
  const labelForId = (uid: number): string => {
    const p = participants.find(pp => pp.id === uid);
    return p?.label ?? `#${uid}`;
  };
  React.useEffect(() => {
    if (currentUserId != null) { setSelfId(currentUserId); return; }
    let mounted = true;
    (async () => {
      try {
        const r = await fetch('/api/auth/me', { credentials: 'include' });
        if (!r.ok) return;
        const j = await r.json();
        const id = typeof j?.id === 'number' ? j.id : (typeof j?.id === 'string' ? Number(j.id) : null);
        if (mounted && Number.isFinite(id as number)) setSelfId(id as number);
      } catch { /* noop */ }
    })();
    return () => { mounted = false; };
  }, [currentUserId]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch(`/api/messages/conversations/${cid}/messages`);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const j = await r.json();
        if (mounted) setMessages(Array.isArray(j.messages) ? j.messages : []);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Error');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [cid]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  React.useEffect(() => {
    const onDocClick = () => { setOpenReactionFor(null); setOpenEmojiFor(null); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpenReactionFor(null); setOpenEmojiFor(null); } };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onDocClick); document.removeEventListener('keydown', onKey); };
    }, []);

  React.useEffect(() => {
    const es = new EventSource('/api/messages/stream');
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if ((data?.type === 'message:new' || data?.type === 'message:deleted' || data?.type === 'reaction:update') && data.conversationId === cid) {
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
          fetch(`/api/messages/conversations/${cid}/messages`).then(r => r.json()).then(j => setMessages(Array.isArray(j.messages) ? j.messages : []));
        }
      } catch {}
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [cid]);

  React.useEffect(() => () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); }, []);

  const updateActionBarPlacement = React.useCallback((mid: number, bubbleEl: HTMLElement | null) => {
    try {
      if (!bubbleEl) return;
      const cont = messagesContainerRef.current;
      if (!cont) return;
      const br = bubbleEl.getBoundingClientRect();
      const cr = cont.getBoundingClientRect();
      const barH = 44;
  const barW = actionBarRef.current?.getBoundingClientRect().width ?? 260;
      const spaceAbove = br.top - cr.top;
      const spaceBelow = cr.bottom - br.bottom;
      const placeBelow = spaceBelow >= barH || spaceBelow > spaceAbove;
      const desiredCenter = br.left + br.width / 2;
      const margin = 8;
      const halfW = barW / 2;
      const minCenter = cr.left + margin + halfW;
      const maxCenter = cr.right - margin - halfW;
      const clampedCenter = Math.max(minCenter, Math.min(maxCenter, desiredCenter));
      const offsetX = clampedCenter - desiredCenter;
      setHoveredActionFor(mid);
      setBarBelow(placeBelow);
      setBarOffsetX(offsetX);
    } catch { /* noop */ }
  }, []);

  const extractReplyBody = React.useCallback((raw: string): string => {
    const lines = (raw || '').split(/\r?\n/);
    let i = 0;
    let sawQuote = false;
    while (i < lines.length && /^>\s?/.test(lines[i] ?? '')) {
      sawQuote = true; i++;
    }
    if (sawQuote && i < lines.length && (lines[i] ?? '').trim() === '') i++;
    return lines.slice(i).join('\n');
  }, []);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await fetch('/api/messages/conversations');
        if (!r.ok) return;
        const j: unknown = await r.json();
        const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
        const isArr = (v: unknown): v is unknown[] => Array.isArray(v);
        const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
        const isStr = (v: unknown): v is string => typeof v === 'string';

        const list = isObj(j) && isArr(j.conversations) ? j.conversations : [];
        let convo: Record<string, unknown> | undefined;
        for (const c of list) {
          if (isObj(c) && isNum(c.id) && c.id === cid) {
            convo = c; break;
          }
        }
        if (!convo) return;
        const users = isArr(convo.users) ? convo.users : [];
        const mapped: Participant[] = users.map((u) => {
          const uo = isObj(u) ? u : {};
          const inner = isObj(uo.user) ? (uo.user as Record<string, unknown>) : {};
          const uid = isNum(inner.id) ? (inner.id as number) : -1;
          const uname = isStr(inner.name || '') ? String(inner.name) : undefined;
          const label = (uname && uname.trim()) ? uname : `#${uid}`;
          return { id: uid, label };
        }).filter((p) => p.id !== -1);
        if (active) setParticipants(mapped as Participant[]);
      } catch { /* ignore */ }
    })();
    return () => {
      active = false;
    };
  }, [cid, embedded]);

  const send = React.useCallback(async () => {
    const base = text.trim();
    if (!base) return;
    const finalContent = replyTo ? (() => {
      const author = labelForId(replyTo.sender_id);
      const d = new Date(replyTo.sent_at);
      const when = d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
      const source = extractReplyBody(replyTo.content || '');
      const cleaned = source
        .split(/\r?\n/)
        .map((ln) => ln.replace(/^> ?/, ''))
        .join('\n')
        .trim();
      const limited = cleaned.length > 180 ? cleaned.slice(0, 177).trimEnd() + '…' : cleaned;
      const snippetLines = limited.split(/\r?\n/).slice(0, 6);
      const header = `> ${author} • ${when}`;
      const quotedSnippet = snippetLines.filter(Boolean).map((ln) => `> ${ln}`).join('\n');
      return `${header}${quotedSnippet ? `\n${quotedSnippet}` : ''}\n\n${base}`;
    })() : base;
    setText('');
    setReplyTo(null);
    const tempId = -Date.now();
    const temp: Msg = { id: tempId, sender_id: (typeof currentUserId === 'number' ? currentUserId : -1), content: finalContent, sent_at: new Date().toISOString() };
    setMessages(prev => [...prev, temp]);
    try {
      const r = await fetch(`/api/messages/conversations/${cid}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: finalContent }),
      });
      if (!r.ok) {
        const j: unknown = await r.json().catch(() => ({}));
        const err = (j && typeof j === 'object' && 'error' in j) ? (j as { error?: string }).error : undefined;
        setError(err || 'Erreur envoi');
        setMessages(prev => prev.filter(m => m.id !== tempId));
        return;
      }
      const res: unknown = await r.json().catch(() => ({}));
      if (res && typeof res === 'object' && 'id' in res) {
        const { id, sent_at, sender_id } = res as { id: number; sent_at: string; sender_id: number };
        setMessages(prev => prev.map(m => m.id === tempId ? { id, sent_at, sender_id, content: finalContent } : m));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur envoi');
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  }, [text, cid, replyTo, participants]);

  if (loading) return embedded
    ? <div className="p-3 text-sm text-muted-foreground">Loading...</div>
    : <div className="fixed bottom-4 right-4 z-50 bg-card border border-border rounded-lg shadow-xl p-4 w-96 max-w-[95vw] text-foreground">Loading...</div>;
  if (error) return embedded
    ? <div className="p-3 text-sm text-destructive">{error}</div>
    : <div className="fixed bottom-4 right-4 z-50 bg-card border border-border rounded-lg shadow-xl p-4 w-96 max-w-[95vw] text-destructive">{error}</div>;

  const avatarEl = (p: Participant, idx: number) => {
    const initials = p.label?.trim()?.slice(0, 2).toUpperCase();
    const hue = (p.id * 47) % 360;
    const bg = `hsl(${hue} 70% 45%)`;
    const style: React.CSSProperties = { backgroundColor: bg };
    return (
      <div
        key={`av-${p.id}-${idx}`}
        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[10px] font-semibold ring-2 ring-white"
        style={style}
        title={p.label}
      >
        {initials || 'U'}
      </div>
    );
  };

  const avatarForId = (uid: number): React.ReactElement => {
    const p = participants.find(pp => pp.id === uid);
    const label = p?.label ?? `#${uid}`;
    const initials = label.trim().slice(0, 2).toUpperCase();
    const hue = (uid * 47) % 360;
    const bg = `hsl(${hue} 70% 45%)`;
    return (
      <div
        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-semibold"
        style={{ backgroundColor: bg }}
        title={label}
      >
        {initials || 'U'}
      </div>
    );
  };

  const header = embedded ? null : (
    <div className="flex items-center justify-between px-3 py-2 border-b cursor-pointer select-none" onClick={() => setCollapsed(v => !v)}>
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex -space-x-2">{participants.slice(0, 4).map(avatarEl)}</div>
        <div className="truncate text-sm font-medium text-foreground">{`Conversation #${cid}`}</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="text-muted-foreground hover:text-foreground text-xs px-2 py-1 border border-border rounded"
          onClick={(e) => { e.stopPropagation(); setCollapsed(v => !v); }}
          aria-label={collapsed ? 'Expand' : 'Collapse'}
          type="button"
        >
          {collapsed ? 'Expand' : 'Collapse'}
        </button>
        <button
          className="text-destructive hover:text-destructive-foreground hover:bg-destructive text-xs px-2 py-1 border border-destructive rounded"
          onClick={async (e) => {
            e.stopPropagation();
            if (!confirm('Delete this conversation?')) return;
            try {
              const r = await fetch(`/api/messages/conversations/${cid}`, { method: 'DELETE' });
              if (!r.ok) throw new Error('HTTP ' + r.status);
              window.dispatchEvent(new CustomEvent('chat:conversationDeleted', { detail: { id: cid } }));
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Deletion failed');
            }
          }}
          type="button"
          title="Delete conversation"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );

  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const formatDateHeader = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatTimeHeader = (d: Date) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  const Separator = ({ children, variant = 'time' as 'time' | 'date' }: { children: React.ReactNode; variant?: 'time' | 'date' }) => (
    <div className="w-full flex items-center justify-center my-2">
      <span className={`text-[11px] ${variant === 'date' ? 'text-foreground/80' : 'text-muted-foreground'} bg-muted px-3 py-1 rounded-full border border-border`}>{children}</span>
    </div>
  );

  const splitQuote = (content: string): { quoteLines: string[]; body: string } => {
    const lines = content.split(/\r?\n/);
    const quoteLines: string[] = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i] ?? '';
      if (/^>\s?/.test(line)) {
        quoteLines.push(line.replace(/^>\s?/, ''));
        i++;
        continue;
      }
      if (quoteLines.length > 0 && line.trim() === '') { i++; break; }
      break;
    }
    const body = lines.slice(i).join('\n');
    return { quoteLines, body };
  };

  const renderMessageContent = (content: string): React.ReactNode => {
    const { quoteLines, body } = splitQuote(content);
    if (quoteLines.length === 0) {
      return <div className="whitespace-pre-wrap break-words">{content}</div>;
    }
    let headerAuthor: string | null = null;
    let headerWhen: string | null = null;
    let snippetLines = quoteLines;
    const first = quoteLines[0] ?? '';
    const m = first.match(/^(.*?)\s*•\s*(.+)$/);
    if (m) {
      headerAuthor = m[1]?.trim() || null;
      headerWhen = m[2]?.trim() || null;
      snippetLines = quoteLines.slice(1);
    }
    const snippetText = snippetLines.join('\n');
    return (
      <div className="space-y-1">
        <div className="bg-card border border-border rounded-md p-2">
          {headerAuthor && (
            <div className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
              <Reply size={12} />
              <span className="font-medium">{headerAuthor}</span>
              {headerWhen && (<><span className="opacity-60">•</span><span>{headerWhen}</span></>)}
            </div>
          )}
          {snippetText && (
            <div className={`mt-${headerAuthor ? '1' : '0'} border-l-2 border-accent/50 pl-2 text-[12px] text-foreground whitespace-pre-wrap break-words leading-snug line-clamp-3`}>
              {snippetText}
            </div>
          )}
        </div>
        {body && (
          <div className="whitespace-pre-wrap break-words">{body}</div>
        )}
      </div>
    );
  };

  const items = (() => {
    const out: React.ReactNode[] = [];
    let lastDate: Date | null = null;
    let lastTs: number | null = null;
    const uid = selfId ?? currentUserId;
    for (const m of messages) {
      const d = new Date(m.sent_at);
      const ts = d.getTime();
      if (!lastDate || !isSameDay(d, lastDate)) {
        out.push(<Separator key={`date-${ts}`} variant="date">{formatDateHeader(d)}</Separator>);
      } else if (lastTs && (ts - lastTs) >= 10 * 60 * 1000) {
        out.push(<Separator key={`time-${ts}`}>{formatTimeHeader(d)}</Separator>);
      }
      lastDate = d;
      lastTs = ts;

      const mine = uid != null && Number(m.sender_id) === Number(uid);
      out.push(
        <div key={m.id} className={`relative flex items-start gap-2 w-full ${mine ? 'justify-end' : 'justify-start'}`} onClick={(e) => e.stopPropagation()}>
          {!mine && <div className="shrink-0">{avatarForId(m.sender_id)}</div>}
          <div className={`max-w-[82%] flex flex-col gap-1 ${mine ? 'items-end text-right ml-auto' : 'items-start text-left mr-auto'}`}>
            <div
              className="relative w-fit"
              onMouseEnter={(e) => {
                if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
                updateActionBarPlacement(m.id, e.currentTarget as unknown as HTMLElement);
              }}
              onMouseLeave={() => {
                if (openReactionFor === m.id || openEmojiFor === m.id) return;
                if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
                hideTimerRef.current = setTimeout(() => {
                  setHoveredActionFor((v) => (v === m.id ? null : v));
                  hideTimerRef.current = null;
                }, 160);
              }}
            >
              {/* Bulle */}
              <div className={`px-3 py-2 rounded-2xl shadow-sm ${mine ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md'}`}>
                {renderMessageContent(m.content)}
              </div>
              {/* Barre d'actions flottante */}
              <div
                className={`absolute -translate-x-1/2 ${hoveredActionFor === m.id && barBelow ? 'top-full translate-y-3' : '-top-1 -translate-y-full'} ${openReactionFor === m.id || hoveredActionFor === m.id ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} transition-opacity duration-150 z-20`}
                style={{ left: `calc(50% + ${barOffsetX}px)` }}
              >
                <div
                  ref={actionBarRef}
                  className="flex items-center gap-2 rounded-full border border-border bg-card/95 shadow-md px-2 py-1 backdrop-blur-sm"
                  onMouseEnter={() => {
                    if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
                    setHoveredActionFor(m.id);
                  }}
                  onMouseLeave={() => {
                    if (openReactionFor === m.id || openEmojiFor === m.id) return;
                    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
                    hideTimerRef.current = setTimeout(() => {
                      setHoveredActionFor((v) => (v === m.id ? null : v));
                      hideTimerRef.current = null;
                    }, 160);
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
          {['👍','❤️','😂','🎉'].map((emoji) => (
                    <button
                      key={`${m.id}-bar-${emoji}`}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-lg"
                      title={emoji}
            onClick={async () => { await toggleReaction(m.id, emoji); }}
                    >
                      {emoji}
                    </button>
                  ))}
                  {/* Bouton + pour la grille complète d’émojis */}
                  <div className="relative">
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-foreground"
                      title="Plus d’émojis"
                      onClick={(e) => { e.stopPropagation(); setHoveredActionFor(m.id); setOpenEmojiFor((v) => v === m.id ? null : m.id); setOpenReactionFor(null); }}
                      type="button"
                    >
                      <Plus size={16} />
                    </button>
                    {openEmojiFor === m.id && (
                      <div
                        className="absolute z-20 mt-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-2xl shadow-2xl p-4 min-w-[380px] max-w-[90vw]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="max-h-72 overflow-y-auto pr-1">
                          <div className="grid grid-cols-8 gap-4">
                {['👍','❤️','😂','🎉','🙌','😮','😢','🔥','👏','🤝','✅','❌','✨','🫶','🤔','😎','😇','🥳','💯','🧠','🫡'].map((emoji) => (
                              <button
                                key={`${m.id}-grid-${emoji}`}
                                className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-muted text-2xl"
                                title={emoji}
                                aria-label={`Réagir ${emoji}`}
                  onClick={async () => { try { await toggleReaction(m.id, emoji); } finally { setOpenEmojiFor(null); } }}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-foreground"
                    title="Répondre"
                    onClick={(e) => { e.stopPropagation(); setReplyTo(m); setOpenReactionFor(null); setTimeout(() => inputRef.current?.focus(), 0); }}
                    type="button"
                  >
                    <Reply size={16} />
                  </button>
                  <div className="relative">
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-foreground"
                      title="Plus d’options"
                      onClick={(e) => { e.stopPropagation(); setHoveredActionFor(m.id); setOpenReactionFor((v) => v === m.id ? null : m.id); setOpenEmojiFor(null); }}
                      type="button"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {openReactionFor === m.id && (
                      <div
                        className={`absolute z-20 mt-2 ${mine ? 'right-0' : 'left-0'} bg-card border border-border rounded-2xl shadow-2xl p-4`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-col gap-3 min-w-[340px]">
                          <div className="flex flex-col gap-2">
                            <button
                              className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted inline-flex items-center gap-2 justify-start"
                              onClick={() => { setReplyTo(m); setOpenReactionFor(null); setTimeout(() => inputRef.current?.focus(), 0); }}
                              type="button"
                            >
                              <Reply size={14} /> Citer pour répondre
                            </button>
                            <button
                              className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted inline-flex items-center gap-2 justify-start"
                              onClick={() => {
                                const author = labelForId(m.sender_id);
                                const d = new Date(m.sent_at);
                                const when = d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
                                const subject = encodeURIComponent(`Message de ${author} • Conv #${cid}`);
                                const body = encodeURIComponent(`De: ${author} • ${when}\n\n${m.content}\n\n— Conversation #${cid}`);
                                window.location.href = `mailto:?subject=${subject}&body=${body}`;
                                setOpenReactionFor(null);
                              }}
                              type="button"
                            >
                              <Mail size={14} /> Partager par email
                            </button>
                          </div>
                          {mine && (
                            <button
                              className="w-full text-sm text-destructive hover:text-destructive-foreground hover:bg-destructive px-3 py-2 rounded-lg border border-destructive"
                              onClick={async () => {
                                if (!confirm('Supprimer ce message ?')) return;
                                try { await fetch(`/api/messages/conversations/${cid}/messages/${m.id}`, { method: 'DELETE' }); } finally { setOpenReactionFor(null); }
                              }}
                            >
                              <span className="inline-flex items-center gap-1"><Trash2 size={12} /> Supprimer</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Fin du wrapper relatif de la bulle */}
              </div>
            {m.reactions && Object.keys(m.reactions).length > 0 && (
              <div className={`mt-1 flex flex-wrap gap-1 ${mine ? 'justify-end' : 'justify-start'}`}>
                {Object.entries(m.reactions).map(([emoji, count]) => {
                  const mine = hasReacted(m.id, emoji);
                  return (
                    <button
                      key={`${m.id}-${emoji}`}
                      className={`text-xs px-2 py-0.5 rounded-full border ${mine ? 'border-accent bg-accent/10' : 'border-border bg-card hover:bg-muted'}`}
                      title={`Réactions ${emoji}`}
                      aria-pressed={mine}
                      onClick={async () => { await toggleReaction(m.id, emoji); }}
                    >
                      <span className="mr-1">{emoji}</span>
                      <span className="text-muted-foreground">{String(count)}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {/* Affichage des réactions existantes (inchangé) */}
          </div>
          {mine && <div className="shrink-0">{avatarForId(m.sender_id)}</div>}
        </div>
      );
    }
    return out;
  })();
  items.push(<div key={0} className="h-0" ref={bottomRef} />);

  const messagesBox = <div ref={messagesContainerRef} className="p-3 h-full overflow-y-auto flex flex-col gap-3">{items}</div>;

  const input = (
    <input
      className="flex-1 border border-border rounded px-3 py-2 bg-input text-foreground"
      placeholder="Your Message..."
      aria-label="Your Message..."
      value={text}
      ref={inputRef}
      onChange={(e) => setText(e.target.value)}
    />
  );
  const button = <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded" aria-label="Send message" onClick={send}>Send</button>;
  const form = (
    <form className="p-2 border-t flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); void send(); }}>
  {replyTo && (
        <div className="flex items-start gap-2 text-xs bg-muted border border-border rounded p-2">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground truncate">Réponse à {labelForId(replyTo.sender_id)}</div>
            <div className="text-muted-foreground whitespace-pre-wrap break-words line-clamp-2">{extractReplyBody(replyTo.content)}</div>
          </div>
          <button type="button" aria-label="Annuler la réponse" className="text-muted-foreground hover:text-foreground p-1" onClick={() => setReplyTo(null)}>
            <X size={14} />
          </button>
        </div>
      )}
      <div className="flex gap-2">
        {input}
        {button}
      </div>
    </form>
  );

  const body = collapsed ? null : <>{messagesBox}{form}</>;

  if (embedded) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-0">{messagesBox}</div>
        {form}
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[480px] max-w-[95vw]">
      <div className="bg-card border border-border rounded-lg shadow-xl overflow-hidden">
        {header}
        {body}
      </div>
    </div>
  );
}
