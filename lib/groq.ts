export const generateFlashcardsFromText = async (text: string) => {
  try {
    const response = await client.chat.completions.create({
      // ... existing config
    });

    const content = response.choices[0]?.message?.content?.trim() || '';
    
    // Handle multiple JSON arrays in response
    const flashcards = content
      .split('\n')
      .filter(line => line.trim().startsWith('['))
      .flatMap(line => {
        try {
          const parsed = JSON.parse(line);
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          console.error('Error parsing line:', line);
          return [];
        }
      })
      .filter((card: any) => card.question && card.answer);

    if (flashcards.length === 0) {
      throw new Error('No valid flashcards generated');
    }

    return flashcards;
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw new Error('Failed to generate flashcards');
  }
}; 