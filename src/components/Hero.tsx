import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackgroundCircles } from './ui/background-circles';
import { logAnalyticsEvent, AnalyticsEvents } from '../lib/firebase';

export function Hero() {
  const navigate = useNavigate();

  useEffect(() => {
    logAnalyticsEvent(AnalyticsEvents.LANDING_PAGE_VIEW, {
      section: 'hero',
      timestamp: new Date().toISOString()
    });
  }, []);

  const handleGetStarted = () => {
    logAnalyticsEvent(AnalyticsEvents.GET_STARTED_CLICK, {
      location: 'hero_section',
      button_text: 'Get Started'
    });
    navigate('/signup');
  };

  const handleLearnMore = () => {
    logAnalyticsEvent(AnalyticsEvents.LEARN_MORE_CLICK, {
      location: 'hero_section',
      button_text: 'Learn More'
    });
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <BackgroundCircles
      title="Transform Your Learning with AI-Generated Flashcards"
      description="Easily create, manage, and export flashcards from your documents and audio files"
      variant="primary"
      className="bg-transparent px-4 sm:px-6 md:px-8"
    >
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 mx-auto max-w-md sm:max-w-none">
        <button 
          onClick={handleGetStarted}
          className="px-6 sm:px-8 py-3 sm:py-4 bg-[#00A6B2] hover:bg-[#008C96] rounded-lg transition-colors text-base sm:text-lg font-semibold text-white w-full sm:w-auto"
        >
          Get Started
        </button>
        <button 
          onClick={handleLearnMore}
          className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-[#C5A900] text-[#C5A900] hover:bg-[#C5A900] hover:text-[#121212] rounded-lg transition-colors text-base sm:text-lg font-semibold w-full sm:w-auto"
        >
          Learn More
        </button>
      </div>
    </BackgroundCircles>
  );
}