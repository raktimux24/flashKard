import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Eye, Edit2, Trash2, FileDown, CheckSquare, Square, File } from 'lucide-react';
import { PatternCard, PatternCardBody } from '../ui/card-with-ellipsis-pattern';
import { cn } from '../../lib/utils';
import { addDoc, collection, serverTimestamp, onSnapshot, query, orderBy, where, getDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db, logAnalyticsEvent, AnalyticsEvents } from '../../lib/firebase';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { useStatistics } from '../../hooks/useStatistics';
import { statisticsService } from '../../services/statisticsService';

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  flashcards: Array<{
    question: string;
    answer: string;
    source?: string;
  }>;
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
  const { user, loading: authLoading } = useAuth();
  const { incrementStatistic } = useStatistics();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setFlashcardSets([]);
      setIsLoading(false);
      return;
    }

    // Using query that matches our composite index
    const q = query(
      collection(db, 'flashcardsets'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(q,
      (querySnapshot) => {
        const sets = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FlashcardSet));
        
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
  }, [user, authLoading]);

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
    logAnalyticsEvent(AnalyticsEvents.FILE_EXPORT, {
      setIds: Array.from(selectedSets),
      format: 'json',
      success: true
    });
  };

  const handleViewSet = (setId: string) => {
    logAnalyticsEvent(AnalyticsEvents.VIEW_FLASHCARD_SET, {
      setId,
      numberOfCards: flashcardSets.find(set => set.id === setId)?.numberOfCards
    });
    navigate(`/dashboard/flashcards/${setId}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this flashcard set?')) return;

    try {
      // Get the flashcard set data before deleting
      const setToDelete = flashcardSets.find(set => set.id === id);
      if (!setToDelete || !user) return;

      // Delete the document
      await deleteDoc(doc(db, 'flashcardsets', id));

      // Update statistics
      await statisticsService.updateStatistic(user.uid, 'totalFlashcardSets', prev => Math.max(0, prev - 1));
      await statisticsService.updateStatistic(user.uid, 'totalFlashcards', prev => Math.max(0, prev - setToDelete.numberOfCards));
      await statisticsService.updateStatistic(user.uid, 'filesUploaded', prev => Math.max(0, prev - (setToDelete.sourceFiles?.length || 0)));

      // Update selected sets
      setSelectedSets(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(id);
        return newSelected;
      });

      logAnalyticsEvent(AnalyticsEvents.DELETE_FLASHCARD_SET, {
        setId: id,
        success: true
      });
    } catch (err: unknown) {
      console.error('Error deleting flashcard set:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      alert('Failed to delete flashcard set. Please try again.');
      logAnalyticsEvent(AnalyticsEvents.DELETE_FLASHCARD_SET, {
        setId: id,
        success: false,
        error: errorMessage
      });
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-2">
        <h2 className="text-xl sm:text-2xl font-semibold text-[#EAEAEA]">Your Flashcard Sets</h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {flashcardSets.length > 0 && (
            <>
              <Button 
                variant="outline" 
                className="gap-2 flex-1 sm:flex-initial justify-center"
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
                className="gap-2 flex-1 sm:flex-initial justify-center"
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
                <PatternCardBody className="p-4 space-y-4">
                  <div className="flex items-center justify-between space-x-4">
                    <h3 className="text-lg font-semibold text-[#EAEAEA]">{set.title}</h3>
                    {set.flashcards[0]?.source && (
                      <Badge 
                        variant={set.flashcards[0].source.toLowerCase() as 'groq' | 'mistral'} 
                        className="px-3 py-1 text-xs"
                      >
                        Generated by {set.flashcards[0].source}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-[#C0C0C0]">{set.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-[#C0C0C0]">
                    <div className="flex items-center">
                      <File className="h-4 w-4 mr-1.5" />
                      {set.numberOfCards} Cards
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1.5">•</span>
                      Created: {formatDate(set.createdAt)}
                    </div>
                    {set.sourceFiles && set.sourceFiles.length > 0 && (
                      <div className="flex items-center max-w-[200px]">
                        <span className="mr-1.5">•</span>
                        <span className="text-xs text-[#808080] truncate">
                          Source: {set.sourceFiles.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1 hover:text-[#00A6B2]"
                      onClick={(e) => handleViewSet(set.id)}
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
                </PatternCardBody>
              </PatternCard>
            );
          })}
        </div>
      )}
    </div>
  );
}