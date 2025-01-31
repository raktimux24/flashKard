import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CardFlip } from './CardFlip';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface CardCarouselProps {
  cards: Flashcard[];
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
}

export function CardCarousel({ cards, currentIndex, onNext, onPrevious }: CardCarouselProps) {
  const currentCard = cards[currentIndex];

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        onPrevious();
      } else if (e.key === 'ArrowRight') {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrevious]);

  return (
    <div className="relative w-full flex items-center justify-center py-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full flex justify-center"
        >
          <div className="relative w-full max-w-2xl">
            <CardFlip
              question={currentCard.question}
              answer={currentCard.answer}
            />
            
            {/* Navigation buttons */}
            <div className="absolute inset-y-0 left-4 right-4 flex items-center justify-between pointer-events-none">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPrevious();
                }}
                disabled={currentIndex === 0}
                className={cn(
                  "pointer-events-auto",
                  "font-mono text-xs tracking-wider uppercase",
                  "px-3 py-2 rounded",
                  "bg-[#EAEAEA]/10 text-[#EAEAEA]",
                  "hover:bg-[#EAEAEA]/20 transition-colors",
                  "flex items-center gap-1",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "focus:outline-none focus:ring-2 focus:ring-[#EAEAEA]/20"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                disabled={currentIndex === cards.length - 1}
                className={cn(
                  "pointer-events-auto",
                  "font-mono text-xs tracking-wider uppercase",
                  "px-3 py-2 rounded",
                  "bg-[#EAEAEA]/10 text-[#EAEAEA]",
                  "hover:bg-[#EAEAEA]/20 transition-colors",
                  "flex items-center gap-1",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "focus:outline-none focus:ring-2 focus:ring-[#EAEAEA]/20"
                )}
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}