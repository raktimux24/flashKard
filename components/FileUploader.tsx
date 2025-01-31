const handleGenerateFlashcards = async (text: string) => {
  try {
    const generatedCards = await generateFlashcardsFromText(text);
    
    // Update field name to 'flashcards' to match interface
    const docRef = await addDoc(collection(db, 'flashcardsets'), {
      title: 'Generated Set',
      flashcards: generatedCards,
      numberOfCards: generatedCards.length,
      userId: "currentUserId",
      createdAt: serverTimestamp(),
      sourceFiles: []
    });

    // If you need to store files in Firebase Storage:
    // const storageRef = ref(storage, `files/${file.name}`);
    // await uploadBytes(storageRef, file);
    
    setFlashcards(generatedCards);
  } catch (error) {
    console.error('Error generating flashcards:', error);
    setError('Failed to generate flashcards. Please try again.');
  }
}; 