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
  const [isHovered, setIsHovered] = useState(false);

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative overflow-hidden
        px-6 py-3 rounded-2xl font-semibold text-white
        bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600
        hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700
        shadow-2xl hover:shadow-3xl
        transform hover:scale-105 hover:-translate-y-1
        transition-all duration-500 ease-out
        disabled:opacity-60 disabled:cursor-not-allowed
        disabled:transform-none disabled:shadow-lg
        border border-white/20
        backdrop-blur-sm
        ${className}
      `}
    >
      {/* Animated shine effect */}
      <div 
        className={`
          absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
          transform -skew-x-12 transition-transform duration-1000
          ${isHovered && !isGenerating ? 'translate-x-full' : '-translate-x-full'}
        `}
      />
      
      {/* Decorative particles */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-2 left-4 w-1 h-1 bg-white rounded-full animate-pulse" />
        <div className="absolute top-4 right-6 w-1 h-1 bg-white rounded-full animate-pulse delay-75" />
        <div className="absolute bottom-3 left-8 w-1 h-1 bg-white rounded-full animate-pulse delay-150" />
        <div className="absolute bottom-2 right-4 w-1 h-1 bg-white rounded-full animate-pulse delay-300" />
      </div>

      <div className="relative flex items-center justify-center gap-3">
        {isGenerating ? (
          <>
            {/* Modern spinner */}
            <div className="relative">
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              <div className="absolute inset-0 w-6 h-6 border-3 border-transparent border-r-white/50 rounded-full animate-pulse" />
            </div>
            <span className="text-lg font-bold tracking-wide">
              Generating...
            </span>
            
            {/* Stylish progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-2xl overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse" />
            </div>
          </>
        ) : (
          <>
            {/* Modern PDF icon */}
            <div className="relative">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/30">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              </div>
              
              {/* "PDF" badge */}
              <div className="absolute -top-2 -left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-1 py-0.2 rounded-full shadow-lg">
                PDF
              </div>
            </div>
            
            <div className="flex flex-col items-start">
              <span className="text-lg font-bold tracking-wide">
                Generate Pitch Deck
              </span>
              <span className="text-sm text-white/80 font-medium">
                ✨ Powered by AI
              </span>
            </div>
            
            {/* Animated arrow */}
            <div className={`
              transform transition-transform duration-300 
              ${isHovered ? 'translate-x-1' : ''}
            `}>
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
          </>
        )}
      </div>

      {/* Gradient effect on hover */}
      <div className={`
        absolute inset-0 rounded-2xl
        bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20
        opacity-0 group-hover:opacity-100
        transition-opacity duration-500
      `} />
      
      {/* Shiny border */}
      <div className={`
        absolute inset-0 rounded-2xl
        bg-gradient-to-r from-transparent via-white/30 to-transparent
        opacity-0 group-hover:opacity-100
        transition-opacity duration-300
        pointer-events-none
      `} style={{
        background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`,
      }} />
    </button>
  );
}
