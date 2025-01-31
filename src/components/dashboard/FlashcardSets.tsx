import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Eye, Edit2, Trash2, FileDown, CheckSquare, Square } from 'lucide-react';
import { PatternCard, PatternCardBody } from '../ui/card-with-ellipsis-pattern';
import { cn } from '../../lib/utils';
import { addDoc, collection, serverTimestamp, onSnapshot, query, orderBy, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { Timestamp } from 'firebase/firestore';

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  flashcards: any[];
  numberOfCards: number;
  userId: string;
  createdAt: Timestamp;
  lastModified?: Timestamp;
  sourceFiles?: string[];
}

export function FlashcardSets() {
  const navigate = useNavigate();
  const [selectedSets, setSelectedSets] = useState<Set<string>>(new Set());
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'flashcardsets'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const sets = querySnapshot.docs.map(doc => {
        // Add debug logging for received data
        console.log('Firestore document:', {
          id: doc.id,
          data: doc.data(),
          cardsCount: doc.data().flashcards?.length || 0,
          storedCount: doc.data().numberOfCards || 0
        });
        
        return {
          id: doc.id,
          ...doc.data()
        } as FlashcardSet;
      });
      setFlashcardSets(sets);
    });
    return () => unsubscribe();
  }, []);

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
    if (selectedSets.size === flashcardSets.length) {
      setSelectedSets(new Set());
    } else {
      setSelectedSets(new Set(flashcardSets.map(set => set.id)));
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

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.toDate()).toLocaleDateString();
  };

  const handleSaveFlashcardSet = async (setData: Partial<FlashcardSet>) => {
    try {
      // Validate input structure
      if (!setData || typeof setData !== 'object') {
        throw new Error('Invalid set data structure');
      }

      // Process flashcards array with proper JSON parsing
      const rawFlashcards = Array.isArray(setData.flashcards) ? setData.flashcards : [];

      // Function to clean and parse JSON string
      const parseJsonSafely = (jsonString: string) => {
        try {
          // First, try to parse the entire array if it looks like one
          if (typeof jsonString === 'string' && jsonString.trim().startsWith('[') && jsonString.trim().endsWith(']')) {
            // Clean the array string
            const cleanedArrayString = jsonString
              .replace(/\\"/g, '"') // Replace escaped quotes
              .replace(/\\/g, '') // Remove other escapes
              .replace(/\n/g, '') // Remove newlines
              .replace(/\r/g, '') // Remove carriage returns
              .trim();

            // Parse the cleaned array
            const parsedArray = JSON.parse(cleanedArrayString);
            if (Array.isArray(parsedArray)) {
              return parsedArray.map(item => ({
                question: String(item?.question || '').trim(),
                answer: String(item?.answer || '').trim()
              }));
            }
          }

          // If not an array or array parsing failed, try as single object
          const cleaned = jsonString
            .replace(/\\"/g, '"')
            .replace(/\\/g, '')
            .replace(/^"|"$/g, '')
            .replace(/\\n/g, ' ')
            .trim();

          const parsed = JSON.parse(cleaned);
          return parsed;
        } catch (err) {
          console.warn('Failed to parse JSON:', err);
          return null;
        }
      };

      const validFlashcards = rawFlashcards
        .map(card => {
          try {
            if (typeof card === 'string') {
              const parsed = parseJsonSafely(card);
              if (Array.isArray(parsed)) {
                return parsed;
              }
              if (parsed?.question && parsed?.answer) {
                return {
                  question: String(parsed.question).trim(),
                  answer: String(parsed.answer).trim()
                };
              }
            } else if (typeof card === 'object' && card !== null) {
              return {
                question: String(card.question || '').trim(),
                answer: String(card.answer || '').trim()
              };
            }
            return null;
          } catch (err) {
            console.warn('Failed to process flashcard:', err, 'Card data:', card);
            return null;
          }
        })
        .filter((card): card is { question: string; answer: string } | Array<{ question: string; answer: string }> => 
          card !== null
        )
        .flat()
        .filter((card): card is { question: string; answer: string } =>
          typeof card === 'object' &&
          card !== null &&
          typeof card.question === 'string' &&
          typeof card.answer === 'string' &&
          card.question.length > 0 &&
          card.answer.length > 0
        );

      if (validFlashcards.length === 0) {
        throw new Error('No valid flashcards could be parsed from the input');
      }

      console.log('Validated flashcards:', validFlashcards);
      console.log('Calculated count:', validFlashcards.length);

      // Force include numberOfCards with explicit type
      const docData = {
        title: String(setData.title || 'Untitled Set').substring(0, 100),
        description: String(setData.description || '').substring(0, 500),
        flashcards: validFlashcards,
        numberOfCards: validFlashcards.length,
        userId: "currentUserId",
        sourceFiles: Array.isArray(setData.sourceFiles) ? setData.sourceFiles : [],
        createdAt: serverTimestamp(),
        lastModified: serverTimestamp()
      };

      // Sanitize the data before saving
      const sanitizedData = JSON.parse(JSON.stringify(docData));
      
      // Debug output
      console.log('Final document data:', sanitizedData);
      
      const docRef = await addDoc(collection(db, 'flashcardsets'), sanitizedData);
      console.log('Saved document:', await getDoc(docRef));
      
      return docRef.id;
    } catch (error) {
      console.error('Save error:', error);
      throw new Error(`Failed to save flashcard set: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
            {selectedSets.size === flashcardSets.length ? (
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
        {flashcardSets.map((set) => {
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
                    <p>{set.numberOfCards} Cards</p>
                    <p>Created: {formatDate(set.createdAt)}</p>
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
                        handleSaveFlashcardSet(set);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                      Save
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

      <Button 
        variant="outline"
        onClick={() => handleSaveFlashcardSet(flashcardSets[0])}
      >
        Test Save
      </Button>
    </div>
  );
}