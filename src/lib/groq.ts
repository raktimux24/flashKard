import { generateFlashcardsFromText as generateMistralFlashcards } from './mistral';

interface Flashcard {
  question: string;
  answer: string;
  source?: string;  // Which API generated this card
}

interface RateLimitState {
  remaining: number;
  reset: number;
}

const API_BASE_URL = 'https://api.groq.com/openai/v1';

const API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'; // Verify this endpoint

const SYSTEM_PROMPT = `You create concise flashcards. Follow these rules:
1. Use ONLY valid JSON array format
2. Each object has 'question' and 'answer'
3. Max 400 characters per field
4. Be clear and specific
Example: [{"question":"What is X?","answer":"X is Y"}]`;

const MAX_CHUNK_LENGTH = 15000; // ~15k characters

const MAX_RETRIES = 1;
const BASE_DELAY = 2000; // 2 seconds
const JITTER_FACTOR = 0.3;

let rateLimit: RateLimitState = {
  remaining: Infinity,
  reset: Date.now()
};
let retryCount = 0;

// Enhanced token estimation using GPT-4 encoding (conservative estimate)
function estimateTokens(text: string): number {
  return Math.ceil(text.length * 0.27);
}

// Precision error parsing
function parseRateLimitError(error: any): RateLimitState | null {
  try {
    if (error?.response?.headers) {
      return {
        remaining: parseInt(error.response.headers['x-ratelimit-remaining'] || '0'),
        reset: parseInt(error.response.headers['x-ratelimit-reset'] || '0')
      };
    }
  } catch (e) {
    console.error('Error parsing rate limit headers:', e);
  }
  return null;
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Check if we're rate limited
      if (rateLimit.remaining <= 0) {
        const waitTime = (rateLimit.reset * 1000) - Date.now();
        if (waitTime > 0) {
          console.log(`Rate limited, waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
      
      return await fn();
    } catch (error: any) {
      lastError = error;
      const rateLimitInfo = parseRateLimitError(error);
      
      if (rateLimitInfo) {
        rateLimit = rateLimitInfo;
        if (rateLimitInfo.remaining <= 0) {
          const waitTime = (rateLimitInfo.reset * 1000) - Date.now();
          if (waitTime > 0) {
            console.log(`Rate limited, waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }
      }
      
      // If it's a 429, immediately try Mistral
      if (error?.response?.status === 429) {
        throw error;
      }
      
      const delay = Math.min(BASE_DELAY * Math.pow(2, attempt - 1), 30000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

async function callGroqAPI(chunk: string): Promise<Response> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ API key not found. Please set VITE_GROQ_API_KEY in your environment.');
  }

  const payload = JSON.stringify({
    model: 'llama-3.3-70b-chat',  // Using chat model for better JSON responses
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Create flashcards from this text. Respond ONLY with the JSON array, no markdown or other text:\n\n${chunk}` }
    ],
    temperature: 0.3,  // Lower temperature for more consistent output
    max_tokens: 1000,
    response_format: { type: "json_object" }  // Force JSON response
  });

  console.log('Calling Groq API with payload:', payload);

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: payload
  });

  if (!response.ok) {
    console.error('Groq API failed with status:', response.status);
    const error = new Error(`API request failed: ${response.status}`);
    (error as any).response = response;
    throw error;
  }

  return response;
}

// Add this helper function to chunk the text
function chunkText(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  
  // Split by sentences to avoid cutting in the middle of one
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

export async function generateFlashcardsFromText(text: string): Promise<Flashcard[]> {
  try {
    const chunks = chunkText(text, MAX_CHUNK_LENGTH);
    let allCards: Flashcard[] = [];

    for (const chunk of chunks) {
      try {
        const response = await withRetry(() => callGroqAPI(chunk));
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        try {
          // Handle both direct JSON array and nested JSON object formats
          const jsonContent = typeof content === 'string' ? JSON.parse(content) : content;
          const cards = Array.isArray(jsonContent) ? jsonContent : jsonContent.flashcards || [];
          
          if (!Array.isArray(cards)) {
            throw new Error('Response is not an array of flashcards');
          }

          allCards = [...allCards, ...cards.map((card: Flashcard) => ({
            ...card,
            question: card.question?.trim() || '',
            answer: card.answer?.trim() || '',
            source: 'Groq'
          }))];
        } catch (e) {
          console.error('Failed to parse Groq API response:', e);
          console.error('Raw content:', content);
          throw new Error('Invalid response format from Groq API');
        }
      } catch (error) {
        console.error('Groq API failed:', error);
        // Fall back to Mistral for this chunk
        try {
          const mistralCards = await generateMistralFlashcards(chunk);
          allCards = [...allCards, ...mistralCards];
        } catch (mistralError) {
          console.error('Mistral API failed:', mistralError);
          // Handle the error gracefully, possibly return a fallback response
          throw new Error('Both Groq and Mistral APIs failed');
        }
      }
    }
    
    return allCards;
  } catch (error) {
    console.error('Error in Groq flashcard generation:', error);
    try {
      return generateMistralFlashcards(text);
    } catch (mistralError) {
      console.error('Mistral API failed:', mistralError);
      // Handle the error gracefully, possibly return a fallback response
      throw new Error('Both Groq and Mistral APIs failed');
    }
  }
}