interface Flashcard {
  question: string;
  answer: string;
  source?: string;
}

const API_BASE_URL = 'https://api.mistral.ai/v1';
const API_ENDPOINT = `${API_BASE_URL}/chat/completions`;

const SYSTEM_PROMPT = `You create concise flashcards. Follow these rules:
1. Use ONLY valid JSON array format
2. Each object has 'question' and 'answer'
3. Max 400 characters per field
4. Be clear and specific
Example: [{"question":"What is X?","answer":"X is Y"}]`;

export async function callMistralAPI(chunk: string): Promise<Response> {
  const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error('Mistral API key not found. Please set VITE_MISTRAL_API_KEY in your environment.');
  }

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Create flashcards from this text:\n\n${chunk}` }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const error = new Error(`Mistral API request failed: ${response.status}`);
    (error as any).response = response;
    throw error;
  }

  return response;
}

export async function generateFlashcardsFromText(text: string): Promise<Flashcard[]> {
  try {
    const response = await callMistralAPI(text);
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const cards = JSON.parse(content);
      return cards.map((card: Flashcard) => ({
        ...card,
        source: 'Mistral'
      }));
    } catch (e) {
      console.error('Failed to parse Mistral API response:', e);
      throw new Error('Invalid response format from Mistral API');
    }
  } catch (error) {
    console.error('Error calling Mistral API:', error);
    throw error;
  }
}
