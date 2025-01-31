const handleGenerateFlashcards = async (text: string) => {
  try {
    const generatedCards = await generateFlashcardsFromText(text);
    
    // Save to Firestore
    const docRef = await addDoc(collection(db, 'flashcards'), {
      cards: generatedCards,
      createdAt: serverTimestamp(),
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