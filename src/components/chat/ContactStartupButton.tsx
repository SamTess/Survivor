"use client";
import React from 'react';

type Props = {
  startupId: number;
  startupName: string;
  founderUserIds: number[];
  className?: string;
};

export default function ContactStartupButton({ startupId, startupName, founderUserIds, className }: Props): React.ReactElement {
  const disabled = !Array.isArray(founderUserIds) || founderUserIds.length === 0;
  const onClick = React.useCallback(() => {
    if (disabled) return;
    const detail = { participantIds: founderUserIds, title: startupName, source: 'startup', startupId } as const;
    window.dispatchEvent(new CustomEvent('chat:startConversation', { detail }));
  }, [disabled, founderUserIds, startupName, startupId]);
  return React.createElement('button', {
    className: className || 'inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700',
    onClick,
    disabled,
    title: disabled ? 'No founder available' : `Contact ${startupName}`,
  }, '💬 Contact the startup');
}
