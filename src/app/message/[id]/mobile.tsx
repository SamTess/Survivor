"use client";
import ConversationClient from '@/app/message/[id]/ConversationClient';
import React from 'react';

export default function MobileConversation({ id }: { id: string }) {
  const cid = Number.parseInt(id, 10);
  if (!Number.isFinite(cid)) return <div className="p-6">Invalid conversation</div>;
  return (
    <div className="p-0 md:p-6">
      <div className="md:hidden">
        <ConversationClient cid={cid} embedded />
      </div>
      <div className="hidden md:block">
        <ConversationClient cid={cid} />
      </div>
    </div>
  );
}
