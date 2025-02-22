import React from 'react';
import { BackgroundCircles } from './ui/background-circles';

export function Hero() {
  return (
    <BackgroundCircles
      title="Transform Your Learning with AI-Generated Flashcards"
      description="Easily create, manage, and export flashcards from your documents and audio files"
      variant="primary"
      className="bg-transparent px-4 sm:px-6 md:px-8"
    >
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 mx-auto max-w-md sm:max-w-none">
        <button className="px-6 sm:px-8 py-3 sm:py-4 bg-[#00A6B2] hover:bg-[#008C96] rounded-lg transition-colors text-base sm:text-lg font-semibold text-white w-full sm:w-auto">
          Get Started
        </button>
        <button className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-[#C5A900] text-[#C5A900] hover:bg-[#C5A900] hover:text-[#121212] rounded-lg transition-colors text-base sm:text-lg font-semibold w-full sm:w-auto">
          Learn More
        </button>
      </div>
    </BackgroundCircles>
  );
}