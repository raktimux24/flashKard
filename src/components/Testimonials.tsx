import React from 'react';
import { TestimonialsSection } from './ui/testimonials-with-marquee';

const testimonials = [
  {
    author: {
      name: "Emma Thompson",
      handle: "@emmaai",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
    },
    text: "FlashAI has transformed how I study for my medical exams. The AI-generated flashcards are incredibly accurate and save me hours of manual work.",
    href: "https://twitter.com/emmaai"
  },
  {
    author: {
      name: "David Park",
      handle: "@davidtech",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    text: "The ability to generate flashcards from lecture recordings is a game-changer. It's like having a personal study assistant.",
    href: "https://twitter.com/davidtech"
  },
  {
    author: {
      name: "Sofia Rodriguez",
      handle: "@sofiaml",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
    },
    text: "I love how the app organizes complex topics into digestible flashcards. Perfect for my language learning journey!"
  },
  {
    author: {
      name: "Alex Chen",
      handle: "@alexc",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face"
    },
    text: "The export feature is brilliant! I can study offline and share my flashcard sets with classmates easily."
  }
];

export function Testimonials() {
  return (
    <TestimonialsSection
      title="Loved by students and educators"
      description="Join thousands of learners who are already transforming their study experience with FlashAI"
      testimonials={testimonials}
      className="relative z-10 bg-transparent"
    />
  );
}