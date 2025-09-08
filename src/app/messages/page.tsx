"use client";
import React from 'react';
import Link from 'next/link';

type Participant = { user: { id: number; name: string } };
type Conversation = { id: number; name: string | null; users: Participant[] };

export default function MessagesPage(): React.ReactElement {
  const [convos, setConvos] = React.useState<Conversation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [csv, setCsv] = React.useState('');
  const [name, setName] = React.useState('');
  const participants = React.useMemo(() => csv.split(',').map(s => parseInt(s.trim(), 10)).filter(n => Number.isFinite(n) && n > 0), [csv]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch('/api/messages/conversations');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const j = await r.json();
        if (mounted) setConvos(Array.isArray(j.conversations) ? j.conversations : []);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Load error');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const createConversation = React.useCallback(async () => {
    setError(null);
    if (participants.length < 1) {
  setError('Add at least one participant (IDs)');
      return;
    }
    const r = await fetch('/api/messages/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantIds: participants, name: name.trim() || undefined }),
    });
    if (!r.ok) {
      const j: unknown = await r.json().catch(() => ({}));
      const err = (j && typeof j === 'object' && 'error' in j) ? (j as { error?: string }).error : undefined;
      setError(err || 'Creation error');
      return;
    }
    setCsv('');
    setName('');
    const j: unknown = await r.json();
    const created: Conversation | undefined = (j && typeof j === 'object' && 'conversation' in j)
      ? (j as { conversation?: Conversation }).conversation
      : undefined;
    setConvos(prev => created ? [created, ...prev] : prev);
  }, [participants, name]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  const errorNode = error ? <div className="text-red-600">{error}</div> : null;

  const header = <h1 className="text-2xl font-semibold">Messaging</h1>;

  const nameInput = (
    <input
      className="border rounded px-3 py-2 w-full"
  placeholder="Name (optional)"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  );

  const csvInput = (
    <input
      className="border rounded px-3 py-2 w-full"
  placeholder="Participant IDs separated by commas (e.g., 2,3)"
      value={csv}
      onChange={(e) => setCsv(e.target.value)}
    />
  );

  const createBtn = (
  <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={createConversation}>Create</button>
  );

  const newConvBox = (
    <div className="border rounded p-4 space-y-2">
  <div className="font-medium">New conversation</div>
      {nameInput}
      {csvInput}
      {createBtn}
    </div>
  );

  const listItems = convos.map((c) => (
    <li key={c.id} className="border rounded p-3 hover:bg-gray-50">
      <Link href={`/messages/${c.id}`} className="font-medium">{c.name || c.users.map(u => u.user.name).join(', ')}</Link>
    </li>
  ));

  if (convos.length === 0) listItems.push(<li key={0} className="text-gray-500">No conversations</li>);

  const list = <ul className="space-y-2">{listItems}</ul>;
  const listWrap = (
    <div className="space-y-2">
  <h2 className="text-xl font-semibold">Your conversations</h2>
      {list}
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      {header}
      {errorNode}
      {newConvBox}
      {listWrap}
    </div>
  );
}
