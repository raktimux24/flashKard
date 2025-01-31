import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Eye, Edit2, Trash2, FileDown, CheckSquare, Square } from 'lucide-react';
import { PatternCard, PatternCardBody } from '../ui/card-with-ellipsis-pattern';
import { cn } from '../../lib/utils';

interface FlashcardSet {
  id: string;
  title: string;
  cardCount: number;
  createdAt: string;
  userId: string;
}

const mockSets: FlashcardSet[] = [
  { id: '1', title: 'Biology Chapter 1', cardCount: 20, createdAt: 'Yesterday', userId: 'user1' },
  { id: '2', title: 'Chemistry Basics', cardCount: 15, createdAt: 'Last Week', userId: 'user2' },
  { id: '3', title: 'History Notes', cardCount: 30, createdAt: 'Today', userId: 'user3' },
  { id: '4', title: 'Math Formulas', cardCount: 10, createdAt: 'Two Days Ago', userId: 'user4' },
];

interface PatternCardProps {
  children: React.ReactNode;
  className?: string;
  gradientClassName?: string;
  onClick?: () => void;
}

export function FlashcardSets() {
  const navigate = useNavigate();
  const [selectedSets, setSelectedSets] = useState<Set<string>>(new Set());

  const toggleSet = (id: string) => {
    const newSelected = new Set(selectedSets);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSets(newSelected);
  };

  const toggleAll = () => {
    if (selectedSets.size === mockSets.length) {
      setSelectedSets(new Set());
    } else {
      setSelectedSets(new Set(mockSets.map(set => set.id)));
    }
  };

  const handleExportSelected = () => {
    // Handle export logic here
    console.log('Exporting sets:', Array.from(selectedSets));
  };

  const handleView = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigate(`/flashcards/${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-[#EAEAEA]">Your Flashcard Sets</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={toggleAll}
          >
            {selectedSets.size === mockSets.length ? (
              <CheckSquare className="h-4 w-4 text-[#00A6B2]" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            Select All
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleExportSelected}
            disabled={selectedSets.size === 0}
          >
            <FileDown className="h-4 w-4" />
            Export Selected
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockSets.map((set) => {
          const isSelected = selectedSets.has(set.id);
          return (
            <PatternCard 
              key={set.id} 
              className={cn(
                "bg-[#2A2A2A]/80 border-[#404040] transition-colors duration-300 backdrop-blur-sm cursor-pointer",
                isSelected ? "border-[#00A6B2]" : "hover:border-[#00A6B2]/50"
              )}
              gradientClassName="from-[#2A2A2A]/90 via-[#2A2A2A]/40 to-[#2A2A2A]/10"
              onClick={() => toggleSet(set.id)}
            >
              <PatternCardBody>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-[#EAEAEA]">{set.title}</h3>
                    {isSelected ? (
                      <CheckSquare className="h-5 w-5 text-[#00A6B2]" />
                    ) : (
                      <Square className="h-5 w-5 text-[#C0C0C0]" />
                    )}
                  </div>
                  <div className="space-y-2 text-sm text-[#C0C0C0]">
                    <p>{set.cardCount} Cards</p>
                    <p>Created At: {set.createdAt}</p>
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1 hover:text-[#00A6B2]"
                      onClick={(e) => handleView(e, set.id)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1 hover:text-[#00A6B2]"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle edit logic
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle delete logic
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </PatternCardBody>
            </PatternCard>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8">
        <nav className="flex gap-2">
          <Button variant="outline" disabled>Previous</Button>
          <Button variant="outline">1</Button>
          <Button variant="outline">2</Button>
          <Button variant="outline">3</Button>
          <Button variant="outline">Next</Button>
        </nav>
      </div>
    </div>
  );
}