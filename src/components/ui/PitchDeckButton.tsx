'use client';

import React, { useState } from 'react';
import { generatePitchDeck } from '@/utils/pitchDeckGenerator';

interface ProjectData {
  id: number;
  name: string;
  sector: string;
  maturity: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  legal_status: string;
  created_at: Date;
  likesCount: number;
  bookmarksCount: number;
  followersCount: number;
  details: Array<{
    description?: string;
    website_url?: string;
    social_media_url?: string;
    project_status?: string;
    needs?: string;
  }>;
  founders: Array<{
    user: {
      name: string;
      email: string;
      phone?: string;
    };
  }>;
}

interface PitchDeckButtonProps {
  project: ProjectData;
  className?: string;
}

export default function PitchDeckButton({ project, className = '' }: PitchDeckButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePitchDeck = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      generatePitchDeck(project);
    } catch (error) {
      console.error('Error generating pitch deck:', error);
      alert('Failed to generate pitch deck. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleGeneratePitchDeck}
      disabled={isGenerating}
      className={`
        inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600
        text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        disabled:transform-none ${className}
      `}
    >
      {isGenerating ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>Generate Pitch Deck</span>
        </>
      )}
    </button>
  );
}
