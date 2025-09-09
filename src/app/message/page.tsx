"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type UserLite = { id: number; name?: string };
type ConvLite = { id: number; users: UserLite[]; last?: { sent_at?: string } };

export default function MobileMessagesPage(): React.ReactElement {
	const [convs, setConvs] = React.useState<ConvLite[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [unread, setUnread] = React.useState<Record<number, number>>({});
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

	React.useEffect(() => { void loadConvs(); }, [loadConvs]);

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
						const cur = prev[cid] ?? 0;
						if (data?.type !== 'message:new') return { ...prev };
						return { ...prev, [cid]: cur + 1 };
					});
					void loadConvs();
				}
			} catch { void loadConvs(); }
		};
		es.onerror = () => es.close();
		return () => es.close();
	}, [loadConvs]);

	const avatar = (u: UserLite, i: number) => {
			const label = u.name && u.name.trim() ? u.name : `#${u.id}`;
			const initials = label.slice(0, 2).toUpperCase();
			return (
				<div key={`avu-${u.id}-${i}`} className="relative inline-flex items-center justify-center w-6 h-6 rounded-full ring-2 ring-white overflow-hidden bg-muted text-white text-[10px] font-semibold" title={label}>
					{u.id ? (
						<Image
							src={`/users/${u.id}/image`}
							alt={label}
							width={24}
							height={24}
							className="w-full h-full object-cover"
							onError={(e) => { const t = e.currentTarget as unknown as HTMLImageElement; if (t) t.style.display = 'none'; }}
						/>
					) : null}
					<span className="absolute">{initials}</span>
				</div>
			);
	};

	const list = (
		<div className="p-3 space-y-2" role="list">
			{error && <div className="text-sm text-destructive">{error}</div>}
			{loading && <div className="text-sm text-muted-foreground">Loading...</div>}
			{!loading && convs.length === 0 && <div className="text-sm text-muted-foreground">No conversations</div>}
			{convs.map((c) => {
				const others = c.users.filter((u) => currentUserId == null || u.id !== currentUserId);
				const labels = others.map((u) => (u.name && u.name.trim()) ? u.name : `#${u.id}`);
				const title = labels.join(", ") || `Conversation #${c.id}`;
				const last = c.last?.sent_at ? new Date(c.last.sent_at).toLocaleString("en-GB") : "";
				const unreadCount = unread[c.id] ?? 0;
				return (
					<Link
						href={`/message/${c.id}`}
						key={c.id}
						className={`w-full px-3 py-3 rounded-lg border transition flex items-center justify-between gap-3 hover:bg-muted border-border`}
						role="listitem"
						onClick={() => setUnread((prev) => ({ ...prev, [c.id]: 0 }))}
					>
						<span className="flex items-center gap-3 min-w-0 flex-1 text-left">
							<span className="flex -space-x-2">{c.users.slice(0, 4).map(avatar)}</span>
							<span className="min-w-0">
								<span className="block truncate text-sm font-semibold text-foreground">{title}</span>
								<span className="block truncate text-xs text-muted-foreground">{last}</span>
							</span>
						</span>
						{unreadCount > 0 && (
							<span className="shrink-0 text-xs px-2 py-1 rounded-full bg-destructive text-destructive-foreground">{String(unreadCount)}</span>
						)}
						<button
							className="shrink-0 text-destructive hover:text-destructive-foreground hover:bg-destructive text-xs px-2 py-1 border border-destructive rounded"
							onClick={async (e) => {
								e.preventDefault();
								e.stopPropagation();
								if (!confirm('Delete this conversation?')) return;
								try {
									const r = await fetch(`/api/messages/conversations/${c.id}`, { method: 'DELETE' });
									if (!r.ok) throw new Error('HTTP ' + r.status);
									const after = await loadConvs();
									setConvs(after);
									setUnread((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => Number(k) !== c.id)) as Record<number, number>);
								} catch (e) {
									setError(e instanceof Error ? e.message : 'Deletion failed');
								}
							}}
							title="Delete"
							type="button"
						>
							<Trash2 size={16} />
						</button>
					</Link>
				);
			})}
		</div>
	);

	return (
		<div className="min-h-screen pt-16">{/* leave space for fixed Navbar */}
			<div className="max-w-5xl mx-auto px-4 py-4">
				<div className="flex items-center justify-between mb-2">
					<h1 className="text-xl font-semibold">Messages</h1>
				</div>
				<div className="bg-card border rounded-xl overflow-hidden">
					{list}
				</div>
			</div>
		</div>
	);
}

