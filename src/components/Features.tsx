import React from 'react';
import { PatternCard, PatternCardBody } from './ui/card-with-ellipsis-pattern';
import { Upload, Brain, Edit3, FileDown } from 'lucide-react';

const features = [
  {
    icon: <Upload className="w-12 h-12 text-[#00A6B2]" />,
    title: "File Upload",
    description: "Upload documents (PDF, DOCX) and audio files easily. Supports multiple formats for maximum flexibility."
  },
  {
    icon: <Brain className="w-12 h-12 text-[#00A6B2]" />,
    title: "AI-Generated Flashcards",
    description: "Utilize advanced AI to automatically create comprehensive Q&A pairs from your uploaded content."
  },
  {
    icon: <Edit3 className="w-12 h-12 text-[#00A6B2]" />,
    title: "Edit & Organize",
    description: "Customize, tag, and organize your flashcards with our intuitive interface for optimal learning."
  },
  {
    icon: <FileDown className="w-12 h-12 text-[#00A6B2]" />,
    title: "Export to PDF",
    description: "Export your flashcards into beautifully formatted PDFs for offline study and sharing."
  }
];

export function Features() {
  return (
    <section id="features" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#00A6B2]">
          Powerful Features
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <PatternCard 
              key={index}
              className="bg-[#2A2A2A]/80 border-[#404040] hover:border-[#00A6B2]/50 transition-colors duration-300 backdrop-blur-sm"
              gradientClassName="from-[#2A2A2A]/90 via-[#2A2A2A]/40 to-[#2A2A2A]/10"
            >
              <PatternCardBody>
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-[#C0C0C0]">
                  {feature.description}
                </p>
              </PatternCardBody>
            </PatternCard>
          ))}
        </div>
      </div>
    </section>
  );
}