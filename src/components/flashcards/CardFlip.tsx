import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardFlipProps {
  question: string;
  answer: string;
  className?: string;
}

const CARD_VARIANTS = [
  {
    gradient: "from-[#FF6B6B]/20 to-[#4ECDC4]/20",
    border: "border-[#4ECDC4]/30",
    glow: "shadow-[#4ECDC4]/20",
  },
  {
    gradient: "from-[#A8E6CF]/20 to-[#DCEDC1]/20",
    border: "border-[#A8E6CF]/30",
    glow: "shadow-[#A8E6CF]/20",
  },
  {
    gradient: "from-[#FFD93D]/20 to-[#FF6B6B]/20",
    border: "border-[#FFD93D]/30",
    glow: "shadow-[#FFD93D]/20",
  },
  {
    gradient: "from-[#6C5CE7]/20 to-[#A8E6CF]/20",
    border: "border-[#6C5CE7]/30",
    glow: "shadow-[#6C5CE7]/20",
  },
];

export function CardFlip({ question, answer, className }: CardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [variant] = useState(() => 
    CARD_VARIANTS[Math.floor(Math.random() * CARD_VARIANTS.length)]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div 
      className={cn(
        "relative w-full max-w-2xl aspect-[4/3] cursor-pointer perspective-1000",
        className
      )}
      onClick={() => setIsFlipped(!isFlipped)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={isFlipped ? "Click to see question" : "Click to see answer"}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={isFlipped ? "back" : "front"}
          initial={{ rotateY: isFlipped ? -180 : 0, opacity: 0 }}
          animate={{ rotateY: isFlipped ? 0 : 0, opacity: 1 }}
          exit={{ rotateY: isFlipped ? 0 : -180, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className={cn(
            "absolute inset-0 w-full h-full p-8",
            "bg-gradient-to-br from-[#2A2A2A]/90 to-[#2A2A2A]/70",
            "backdrop-blur-sm border",
            "rounded-xl",
            "flex flex-col items-center justify-center text-center",
            "shadow-[0_0_30px_rgba(0,0,0,0.2)]",
            variant.border,
            variant.glow,
            "overflow-hidden"
          )}
        >
          {/* Background gradient */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-50",
            variant.gradient
          )} />

          {/* Animated background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0%,_transparent_50%)] animate-[pulse_4s_ease-in-out_infinite]" />

          {/* Labels */}
          <div className="absolute top-4 left-4 font-mono text-xs tracking-wider uppercase">
            <div className="px-2 py-1 rounded bg-[#EAEAEA]/10 text-[#EAEAEA]">
              {isFlipped ? 'Answer' : 'Question'}
            </div>
          </div>

          <div className="absolute top-4 right-4 font-mono text-xs tracking-wider uppercase">
            <div className="px-2 py-1 rounded bg-[#EAEAEA]/10 text-[#EAEAEA]">
              Space / Click to flip
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 p-10 px-16">
            <p className={cn(
              "text-lg sm:text-xl md:text-2xl font-medium text-[#EAEAEA]",
            )}>
              {isFlipped ? answer : question}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}