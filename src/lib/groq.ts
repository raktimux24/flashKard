interface Flashcard {
  question: string;
  answer: string;
}

interface RateLimitState {
  remaining: number;
  reset: number;
}

const API_BASE_URL = import.meta.env.DEV 
  ? import.meta.env.VITE_API_URL
  : '/api';

const API_ENDPOINT = `${API_BASE_URL}/groq/openai/v1/chat/completions`;
const SYSTEM_PROMPT = `You create concise flashcards. Follow these rules:
1. Use ONLY valid JSON array format
2. Each object has 'question' and 'answer'
3. Max 400 characters per field
4. Be clear and specific
Example: [{"question":"What is X?","answer":"X is Y"}]`;

const MAX_CHUNK_LENGTH = 15000; // ~15k characters

const MAX_RETRIES = 5;
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
      return await fn();
    } catch (error: any) {
      lastError = error;
      const rateLimitInfo = parseRateLimitError(error);
      
      if (rateLimitInfo) {
        const waitTime = (rateLimitInfo.reset * 1000) - Date.now();
        if (waitTime > 0) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      
      const delay = Math.min(BASE_DELAY * Math.pow(2, attempt - 1), 30000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

async function callGroqAPI(chunk: string): Promise<Response> {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Create flashcards from this text:\n\n${chunk}` }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
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
  const cleanedText = text
    .replace(/\s+/g, ' ') // Reduce whitespace
    .substring(0, 50000); // Hard limit for safety

  // Split text into smaller chunks
  const chunks = chunkText(cleanedText, MAX_CHUNK_LENGTH);
  let allFlashcards: Flashcard[] = [];

  try {
    // Process each chunk
    for (const chunk of chunks) {
      const response = await withRetry(() => callGroqAPI(chunk));
      const data = await response.json();
      
      if (!data.choices?.[0]?.message?.content) {
        console.error('Invalid API response format:', JSON.stringify(data, null, 2));
        continue; // Skip this chunk if invalid
      }

      const content = data.choices[0].message.content.trim();
      
      try {
        // Try to parse as JSON first
        const parsedContent = JSON.parse(content);
        if (Array.isArray(parsedContent)) {
          const chunkCards = parsedContent.map(card => ({
            question: card.question || card.front || '',
            answer: card.answer || card.back || ''
          }));
          allFlashcards = [...allFlashcards, ...chunkCards];
        }
      } catch (e) {
        // If JSON parsing fails, try to parse the text format
        const cards = content
          .split(/\n\s*\n/)
          .filter((block: string) => block.trim())
          .map((block: string) => {
            const [question, ...answerParts] = block.split(/\n/);
            return {
              question: question.replace(/^Q:|Question:|^\d+\.|^-/, '').trim(),
              answer: answerParts.join('\n').replace(/^A:|Answer:|^\d+\.|^-/, '').trim()
            };
          });
        allFlashcards = [...allFlashcards, ...cards];
      }
    }

    return allFlashcards;
    
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error;
  }
}