import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { PatternCard, PatternCardBody } from '../ui/card-with-ellipsis-pattern';
import { cn } from '../../lib/utils';
import { generateFlashcardsFromText } from '../../lib/groq';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useStatistics } from '../../hooks/useStatistics';
import { statisticsService } from '../../services/statisticsService';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'error' | 'complete';
  error?: string;
}

interface Flashcard {
  question: string;
  answer: string;
}

export function FileUploader() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfJsLoaded, setPdfJsLoaded] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<Flashcard[] | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const user = useAuthStore(state => state.user);
  const { incrementStatistic } = useStatistics();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.onload = () => setPdfJsLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Simulate file upload for each file
    newFiles.forEach(uploadedFile => {
      simulateFileUpload(uploadedFile.id);
    });
  }, []);

  const simulateFileUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { 
                ...f, 
                progress,
                status: progress === 100 ? 'complete' : 'uploading'
              }
            : f
        )
      );

      if (progress === 100) {
        clearInterval(interval);
      }
    }, 500);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const processFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          if (file.type === 'application/pdf') {
            if (!pdfJsLoaded) {
              throw new Error('PDF.js library not loaded yet');
            }

            const arrayBuffer = e.target?.result as ArrayBuffer;
            const uint8Array = new Uint8Array(arrayBuffer);
            
            try {
              // @ts-ignore
              const pdfjsLib = window.pdfjsLib;
              if (!pdfjsLib) {
                throw new Error('PDF.js library not loaded');
              }
              
              // Set worker path
              pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
              
              const loadingTask = pdfjsLib.getDocument({
                data: uint8Array
              });
              
              const pdf = await loadingTask.promise;
              let fullText = '';
              
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                  .map((item: any) => item.str)
                  .join(' ');
                fullText += pageText + '\n';
              }
              
              // Clean and normalize the text
              const cleanedText = fullText
                .replace(/\r\n/g, '\n')
                .replace(/\t/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
              
              resolve(cleanedText);
            } catch (pdfError) {
              console.error('PDF processing error:', pdfError);
              if (pdfError instanceof Error) {
                reject(new Error(`Failed to process PDF: ${pdfError.message}`));
              } else {
                reject(new Error('Unknown error occurred during PDF processing'));
              }
            }
          } else {
            const text = e.target?.result as string;
            // Clean and normalize the text
            const cleanedText = text
              .replace(/\r\n/g, '\n')
              .replace(/\t/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            resolve(cleanedText);
          }
        } catch (error) {
          console.error('Error processing file:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        console.error('FileReader error');
        reject(new Error('Failed to read file'));
      };
      
      if (file.type === 'application/pdf') {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const handleGenerateFlashcards = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    setError(null);
    setGeneratedCards(null);

    try {
      const processedFiles = await Promise.all(
        files.map(async (file) => {
          try {
            return await processFile(file.file);
          } catch (error) {
            console.error(`Error processing file ${file.file.name}:`, error);
            throw new Error(`Failed to process file ${file.file.name}`);
          }
        })
      );

      const combinedContent = processedFiles.join('\n\n');
      
      if (combinedContent.length === 0) {
        throw new Error('No content found in the uploaded files');
      }

      const cards = await generateFlashcardsFromText(combinedContent);

      if (!cards || cards.length === 0) {
        setError('No valid flashcards could be generated from the text. Please try again with different content.');
        return;
      }

      setGeneratedCards(cards);
    } catch (error: any) {
      console.error('Error generating flashcards:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'Failed to generate flashcards. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveFlashcards = async () => {
    if (!user || !generatedCards) return;
    
    setIsSaving(true);
    setError(null);

    try {
      const fileNames = files.map(f => f.file.name);
      
      const docRef = await addDoc(collection(db, 'flashcardsets'), {
        title: `Generated Flashcards ${new Date().toLocaleDateString()}`,
        description: `Generated from: ${fileNames.join(', ')}`,
        flashcards: generatedCards,
        numberOfCards: generatedCards.length,
        userId: user.uid,
        createdAt: serverTimestamp(),
        sourceFiles: fileNames,
      });

      // Update statistics
      await statisticsService.batchUpdateStatistics(user.uid, [
        { key: 'totalFlashcardSets', value: (prev) => prev + 1 },
        { key: 'totalFlashcards', value: (prev) => prev + generatedCards.length },
        { key: 'filesUploaded', value: (prev) => prev + files.length }
      ]);

      navigate(`/dashboard/flashcards/${docRef.id}`);
    } catch (error) {
      console.error('Error saving flashcards:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'Failed to save flashcards. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PatternCard 
      className="bg-[#2A2A2A]/80 border-[#404040] hover:border-[#00A6B2]/50 transition-colors duration-300 backdrop-blur-sm"
      gradientClassName="from-[#2A2A2A]/90 via-[#2A2A2A]/40 to-[#2A2A2A]/10"
    >
      <PatternCardBody>
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive 
              ? "border-[#00A6B2] bg-[#00A6B2]/5" 
              : "border-[#404040] hover:border-[#00A6B2] hover:bg-[#00A6B2]/5"
          )}
        >
          <input {...getInputProps()} />
          <div className="rounded-full bg-[#00A6B2]/10 p-4 w-fit mx-auto mb-4">
            <Upload className="h-8 w-8 text-[#00A6B2]" />
          </div>
          <p className="text-lg font-medium text-[#EAEAEA] mb-2">
            {isDragActive
              ? "Drop your files here"
              : "Drag and drop your files here"}
          </p>
          <p className="text-sm text-[#C0C0C0] mb-4">
            Or click to browse
          </p>
          <p className="text-xs text-[#C0C0C0]">
            Supported formats: PDF, DOC, DOCX, MP3, WAV (max 50MB)
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6 space-y-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-4 p-4 bg-[#1A1A1A] rounded-lg"
              >
                <div className="rounded-full bg-[#00A6B2]/10 p-2">
                  <File className="h-5 w-5 text-[#00A6B2]" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-[#EAEAEA] truncate">
                      {file.file.name}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="text-[#C0C0C0] hover:text-[#EAEAEA] transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="w-full h-1 bg-[#404040] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#00A6B2] transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-[#C0C0C0]">
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className="flex items-center gap-1">
                      {file.status === 'uploading' && (
                        <Loader2 className="h-3 w-3 text-[#C0C0C0] animate-spin" />
                      )}
                      <p className="text-xs text-[#C0C0C0]">
                        {file.status === 'complete' 
                          ? 'Ready for processing'
                          : `${file.progress}%`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-6 flex justify-end gap-4">
            <Button 
              className="gap-2"
              onClick={handleGenerateFlashcards}
              disabled={files.some(f => f.status !== 'complete') || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <File className="h-4 w-4" />
                  Generate Flashcards
                </>
              )}
            </Button>

            {generatedCards && (
              <Button 
                className="gap-2"
                onClick={handleSaveFlashcards}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Save Flashcards
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {generatedCards && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-[#EAEAEA]">Generated Flashcards</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[#00A6B2] hover:text-[#00A6B2]/80"
              >
                {isExpanded ? 'Show Less' : 'Show All'}
              </Button>
            </div>
            <div className="space-y-4">
              {generatedCards
                .slice(0, isExpanded ? undefined : 3)
                .map((card, index) => (
                  <div 
                    key={index} 
                    className="p-4 bg-[#1A1A1A] rounded-lg transition-all duration-300 hover:bg-[#1A1A1A]/80"
                  >
                    <p className="text-sm font-medium text-[#EAEAEA] mb-2">
                      Q: {card.question}
                    </p>
                    <p className="text-sm text-[#C0C0C0]">
                      A: {card.answer}
                    </p>
                  </div>
              ))}
              {!isExpanded && generatedCards.length > 3 && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="w-full p-4 bg-[#1A1A1A]/50 rounded-lg text-center hover:bg-[#1A1A1A] transition-colors duration-300"
                >
                  <p className="text-sm text-[#00A6B2]">
                    +{generatedCards.length - 3} more flashcards
                  </p>
                </button>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}
      </PatternCardBody>
    </PatternCard>
  );
}