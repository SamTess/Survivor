"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FounderOnboardingPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/onboarding/visitor');
  }, [router]);
  return React.createElement('div', { className: 'p-6 text-center text-gray-600' }, 'Redirecting to Visitor onboarding...');
}
