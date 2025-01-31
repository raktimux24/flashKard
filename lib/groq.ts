import { client } from '../config/groq';

export const generateFlashcardsFromText = async (text: string) => {
  try {
    const response = await client.chat.completions.create({
      // ... existing config
    });

    console.log('Full API response:', response);
    const content = response.choices[0]?.message?.content?.trim() || '';
    console.log('Raw API response content:', content);

    // Parse the JSON content
    let flashcards;
    try {
      flashcards = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      throw new Error('Failed to parse JSON content');
    }
    
    if (!Array.isArray(flashcards)) {
      console.error('Parsed content is not an array:', flashcards);
      throw new Error('Generated content is not an array of flashcards');
    }

    const validFlashcards = flashcards.filter(card => {
      try {
        const isValid = (
          typeof card === 'object' &&
          card !== null &&
          typeof card.question === 'string' &&
          typeof card.answer === 'string' &&
          card.question.trim() !== '' &&
          card.answer.trim() !== ''
        );
        if (!isValid) {
          console.log('Invalid card:', card);
        }
        return isValid;
      } catch (error) {
        console.log('Error validating card:', error);
        return false;
      }
    });

    if (validFlashcards.length === 0) {
      console.error('No valid flashcards found in parsed content:', flashcards);
      throw new Error('No valid flashcards generated');
    }

    console.log('Successfully parsed flashcards:', validFlashcards);
    return validFlashcards;

  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error instanceof Error ? error : new Error('Failed to parse generated flashcards');
  }
};