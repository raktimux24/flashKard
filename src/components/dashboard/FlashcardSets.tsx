import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Eye, Edit2, Trash2, FileDown, CheckSquare, Square } from 'lucide-react';
import { PatternCard, PatternCardBody } from '../ui/card-with-ellipsis-pattern';
import { cn } from '../../lib/utils';
import { addDoc, collection, serverTimestamp, onSnapshot, query, orderBy, where, getDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Timestamp } from 'firebase/firestore';
import { useAuthStore } from '../../store/authStore';
import { Loader2, File } from 'lucide-react';
import { useStatistics } from '../../hooks/useStatistics';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore(state => state.user);
  const { incrementStatistic } = useStatistics();

  useEffect(() => {
    console.log('FlashcardSets component state:', {
      flashcardSets,
      isLoading,
      error,
      selectedSets: Array.from(selectedSets),
      user: user?.uid
    });
  }, [flashcardSets, isLoading, error, selectedSets, user]);

  // Debug function to check Firestore data
  const checkFirestoreData = async () => {
    if (!user) return;
    
    try {
      console.log('Checking Firestore data directly...');
      const querySnapshot = await getDocs(collection(db, 'flashcardsets'));
      console.log('All documents in collection:', querySnapshot.size);
      querySnapshot.forEach(doc => {
        console.log('Document:', doc.id, doc.data());
      });
    } catch (err) {
      console.error('Error checking Firestore:', err);
    }
  };

  useEffect(() => {
    checkFirestoreData();
    if (!user) {
      console.log('No user found, clearing flashcard sets');
      setFlashcardSets([]);
      setIsLoading(false);
      return;
    }

    console.log('Current user:', user.uid);

    // Using query that matches our composite index
    const q = query(
      collection(db, 'flashcardsets'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      orderBy('__name__', 'desc')
    );

    console.log('Query created:', q);
    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(q,
      (querySnapshot) => {
        console.log('Snapshot received, number of docs:', querySnapshot.size);
        console.log('Docs:', querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        const sets = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FlashcardSet));
        
        console.log('Processed sets:', sets);
        setFlashcardSets(sets);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching flashcard sets:', err);
        setError('Failed to load flashcard sets. Please try again later.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

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

  const handleExportSelected = async () => {
    if (selectedSets.size === 0) return;

    const exportData = flashcardSets
      .filter(set => selectedSets.has(set.id))
      .map(set => ({
        title: set.title,
        flashcards: set.flashcards
      }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcard-sets.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Update export statistics
    incrementStatistic('totalExports');
  };

  const handleView = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigate(`/dashboard/flashcards/${id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this flashcard set?')) return;

    try {
      await deleteDoc(doc(db, 'flashcardsets', id));
      setSelectedSets(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(id);
        return newSelected;
      });
    } catch (err) {
      console.error('Error deleting flashcard set:', err);
      alert('Failed to delete flashcard set. Please try again.');
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.toDate()).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#00A6B2]" />
          <p className="text-[#EAEAEA]">Loading flashcard sets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 bg-[#2A2A2A]/80 border border-[#404040] rounded-lg">
        <p className="text-[#EAEAEA]">Please sign in to view your flashcard sets.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-[#EAEAEA]">Your Flashcard Sets</h2>
        <div className="flex gap-2">
          {flashcardSets.length > 0 && (
            <>
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
            </>
          )}
        </div>
      </div>

      {flashcardSets.length === 0 ? (
        <div className="p-8 bg-[#2A2A2A]/80 border border-[#404040] rounded-lg text-center">
          <div className="rounded-full bg-[#00A6B2]/10 p-4 w-fit mx-auto mb-4">
            <File className="h-8 w-8 text-[#00A6B2]" />
          </div>
          <h3 className="text-lg font-medium text-[#EAEAEA] mb-2">No Flashcard Sets Yet</h3>
          <p className="text-[#C0C0C0] mb-6">Upload files to generate your first flashcard set!</p>
        </div>
      ) : (
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
                      <div>
                        <h3 className="text-lg font-semibold text-[#EAEAEA] mb-1">{set.title}</h3>
                        {set.description && (
                          <p className="text-sm text-[#C0C0C0] line-clamp-2">{set.description}</p>
                        )}
                      </div>
                      {isSelected ? (
                        <CheckSquare className="h-5 w-5 text-[#00A6B2]" />
                      ) : (
                        <Square className="h-5 w-5 text-[#C0C0C0]" />
                      )}
                    </div>
                    <div className="space-y-2 text-sm text-[#C0C0C0]">
                      <p>{set.numberOfCards} Cards</p>
                      <p>Created: {formatDate(set.createdAt)}</p>
                      {set.sourceFiles && set.sourceFiles.length > 0 && (
                        <p className="truncate">Source: {set.sourceFiles.join(', ')}</p>
                      )}
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
                        className="gap-1 text-destructive hover:text-destructive"
                        onClick={(e) => handleDelete(e, set.id)}
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
      )}
    </div>
  );
}