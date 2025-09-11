import ConversationClient from '@/app/message/[id]/ConversationClient';
import React from 'react';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cid = Number.parseInt(id, 10);
  if (!Number.isFinite(cid)) return React.createElement('div', { className: 'p-6' }, 'Invalid conversation');
  return React.createElement(ConversationClient, { cid, embedded: true });
}
