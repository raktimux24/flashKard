import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Edit2, Trash2 } from 'lucide-react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { CardCarousel } from '../components/flashcards/CardCarousel';
import { ProgressIndicator } from '../components/flashcards/ProgressIndicator';
import { ExportMenu } from '../components/flashcards/ExportMenu';
import { Button } from '../components/ui/button';
import { PatternCard, PatternCardBody } from '../components/ui/card-with-ellipsis-pattern';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useStatistics } from '../hooks/useStatistics';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Flashcard {
  question: string;
  answer: string;
  id?: string;
}

interface FlashcardSet {
  title: string;
  flashcards: Flashcard[];
  createdAt: string;
  userId: string;
  sourceFiles: string[];
}

interface FlashcardDisplayProps {
  flashcards: Array<{ question: string; answer: string }>;
  title: string;
}

export function FlashcardDisplay({ flashcards, title }: FlashcardDisplayProps) {
  const { id } = useParams<{ id: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { incrementStatistic, addStudyTime } = useStatistics();

  useEffect(() => {
    async function fetchFlashcards() {
      if (!id) return;

      try {
        console.log('Fetching flashcard set with ID:', id);
        const docRef = doc(db, 'flashcardsets', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as FlashcardSet;
          console.log('Found flashcard set:', data);
          setFlashcardSet(data);
        } else {
          console.log('No flashcard set found with ID:', id);
          setError('Flashcard set not found');
        }
      } catch (err) {
        console.error('Error fetching flashcards:', err);
        setError('Failed to load flashcards');
      } finally {
        setIsLoading(false);
      }
    }

    fetchFlashcards();
  }, [id]);

  // Track study time
  useEffect(() => {
    let isActive = true;
    const startTime = Date.now();

    return () => {
      if (isActive) {
        isActive = false;
        const studyTime = Math.floor((Date.now() - startTime) / 1000);
        if (studyTime > 0) {
          addStudyTime(studyTime).catch(console.error);
        }
      }
    };
  }, []);

  const handleNext = () => {
    if (flashcardSet && currentIndex < flashcardSet.flashcards.length - 1) {
      incrementStatistic('flashcardsReviewedToday');
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleExport = async (format: 'pdf') => {
    if (format === 'pdf' && flashcardSet) {
      try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        let yOffset = 20;

        // Add title
        pdf.setFontSize(20);
        pdf.text(flashcardSet.title, 20, yOffset);
        yOffset += 20;

        // Add each flashcard
        pdf.setFontSize(12);
        for (let i = 0; i < flashcardSet.flashcards.length; i++) {
          const card = flashcardSet.flashcards[i];
          
          // Add card number
          pdf.setFont('helvetica', 'bold');
          pdf.text(`Card ${i + 1}`, 20, yOffset);
          yOffset += 10;

          // Add question
          pdf.setFont('helvetica', 'bold');
          pdf.text('Question:', 20, yOffset);
          yOffset += 7;
          pdf.setFont('helvetica', 'normal');
          const questionLines = pdf.splitTextToSize(card.question, 170);
          pdf.text(questionLines, 20, yOffset);
          yOffset += (questionLines.length * 7);

          // Add answer
          pdf.setFont('helvetica', 'bold');
          pdf.text('Answer:', 20, yOffset);
          yOffset += 7;
          pdf.setFont('helvetica', 'normal');
          const answerLines = pdf.splitTextToSize(card.answer, 170);
          pdf.text(answerLines, 20, yOffset);
          yOffset += (answerLines.length * 7) + 10;

          // Add a line separator
          pdf.line(20, yOffset, 190, yOffset);
          yOffset += 15;

          // Check if we need a new page
          if (yOffset > 250) {
            pdf.addPage();
            yOffset = 20;
          }
        }

        // Save the PDF
        pdf.save(`${flashcardSet.title.replace(/\s+/g, '_')}_flashcards.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    }
  };

  const handleDeleteCard = async () => {
    if (!flashcardSet || !id) return;

    setIsDeleting(true);
    try {
      const updatedFlashcards = [...flashcardSet.flashcards];
      updatedFlashcards.splice(currentIndex, 1);

      const docRef = doc(db, 'flashcardsets', id);
      await updateDoc(docRef, {
        flashcards: updatedFlashcards
      });

      setFlashcardSet({
        ...flashcardSet,
        flashcards: updatedFlashcards
      });

      // Adjust current index if necessary
      if (currentIndex >= updatedFlashcards.length) {
        setCurrentIndex(Math.max(0, updatedFlashcards.length - 1));
      }

      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting flashcard:', err);
      setError('Failed to delete flashcard');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#00A6B2]" />
            <p className="text-[#EAEAEA]">Loading flashcards...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !flashcardSet) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'Failed to load flashcards'}</p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Add IDs to flashcards if they don't have them
  const flashcardsWithIds = flashcardSet.flashcards.map((card, index) => ({
    ...card,
    id: card.id || `card-${index + 1}`
  }));

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-[#EAEAEA]">{flashcardSet.title}</h1>
          <ExportMenu onExport={handleExport} />
        </div>

        <PatternCard 
          className="bg-[#2A2A2A]/80 border-[#404040] transition-colors duration-300 backdrop-blur-sm"
          gradientClassName="from-[#2A2A2A]/90 via-[#2A2A2A]/40 to-[#2A2A2A]/10"
        >
          <PatternCardBody>
            <div className="space-y-6">
              <ProgressIndicator
                current={currentIndex + 1}
                total={flashcardsWithIds.length}
              />

              {flashcardsWithIds.length > 0 ? (
                <CardCarousel
                  cards={flashcardsWithIds}
                  currentIndex={currentIndex}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                />
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No flashcards available
                </div>
              )}

              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  className="gap-2 text-destructive hover:text-destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={flashcardsWithIds.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </PatternCardBody>
        </PatternCard>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#2A2A2A] border-[#404040] text-[#EAEAEA] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-[#EAEAEA]">Delete Flashcard</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this flashcard? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="text-[#EAEAEA] hover:text-[#EAEAEA] hover:bg-[#404040]"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCard}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}