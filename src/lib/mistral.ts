interface Flashcard {
  question: string;
  answer: string;
  source?: string;
}

interface MistralResponse {
  choices: Array<{ message: { content: string } }>;
}

const API_BASE_URL = 'https://api.mistral.ai/v1';
const API_ENDPOINT = `${API_BASE_URL}/chat/completions`;

const SYSTEM_PROMPT = `You are a flashcard generator. Create flashcards from the given text. Your response must be ONLY a valid JSON array of objects. Each object must have 'question' and 'answer' fields. Maximum 400 characters per field. Example format:
[{"question":"What is X?","answer":"X is Y"}]`;

function isValidResponseFormat(data: MistralResponse) {
  return data && typeof data === 'object' && 'choices' in data && Array.isArray(data.choices) && data.choices.length > 0 &&
         typeof data.choices[0].message.content === 'string';
}

export async function callMistralAPI(chunk: string): Promise<any> {
  console.log('Calling Mistral API with chunk:', chunk);
  try {
    const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
    if (!apiKey) {
      throw new Error('Mistral API key not found. Please set VITE_MISTRAL_API_KEY in your environment.');
    }

    console.log('API Key:', apiKey);
    const payload = JSON.stringify({
      model: 'mistral-medium',  
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Create flashcards from this text. Respond ONLY with the JSON array, no markdown or other text:\n\n${chunk}` }
      ],
      temperature: 0.3,  
      max_tokens: 1000,
      response_format: { type: "json_object" }  
    });
    console.log('Payload being sent:', payload);
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: payload
    });
    console.log('Request headers:', response.headers);
    console.log('Request payload:', payload);
    console.log('Request headers:', response.headers);
    const responseText = await response.text();
    console.log('Response from Mistral API:', responseText);
    const data = JSON.parse(responseText);
    if (!response.ok || !isValidResponseFormat(data)) {
      throw new Error('Invalid response format from Mistral API');
    }
    return data;
  } catch (error) {
    console.error('Error calling Mistral API:', error);
    throw error; // Ensure the error is thrown to be handled upstream
  }
}

export async function generateFlashcardsFromText(text: string): Promise<Flashcard[]> {
  try {
    const response = await callMistralAPI(text);
    const content = response.choices[0].message.content;
    
    try {
      const jsonContent = typeof content === 'string' ? JSON.parse(content) : content;
      const cards = Array.isArray(jsonContent) ? jsonContent : jsonContent.flashcards || [];
      
      if (!Array.isArray(cards)) {
        throw new Error('Response is not an array of flashcards');
      }

      return cards.map((card: Flashcard) => ({
        ...card,
        question: card.question?.trim() || '',
        answer: card.answer?.trim() || '',
        source: 'Mistral'
      }));
    } catch (e) {
      console.error('Failed to parse Mistral API response:', e);
      console.error('Raw content:', content);
      // Fallback to Groq API
      try {
        const groqCards = await generateGroqFlashcards(text);
        return groqCards.map(card => ({ ...card, source: 'Groq (fallback)' }));
      } catch (groqError) {
        console.error('Both Mistral and Groq APIs failed:', groqError);
        throw new Error('Failed to generate flashcards');
      }
    }
  } catch (error) {
    console.error('Error calling Mistral API:', error);
    // Fallback to Groq API
    try {
      const groqCards = await generateGroqFlashcards(text);
      return groqCards.map(card => ({ ...card, source: 'Groq (fallback)' }));
    } catch (groqError) {
      console.error('Both Mistral and Groq APIs failed:', groqError);
      throw new Error('Failed to generate flashcards');
    }
  }
}
