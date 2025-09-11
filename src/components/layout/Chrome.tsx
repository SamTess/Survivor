"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/navigation/Navbar';
import { Toaster } from '@/components/ui/sonner';
import { ChatLauncher } from '@/components/chat/ChatLauncher';

/**
 * Chrome wraps global UI (navbar, chat, toasts). Hidden on presentation pages.
 */
export function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = pathname === '/presentation';
  return (
    <>
      {!hideChrome && <Navbar />}
      {children}
      {!hideChrome && (
        <>
          <Toaster />
          <ChatLauncher />
        </>
      )}
    </>
  );
}
