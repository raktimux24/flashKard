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

const API_ENDPOINT = `${API_BASE_URL}/api/groq/openai/v1/chat/completions`;
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

export async function generateFlashcardsFromText(text: string): Promise<Flashcard[]> {
  const cleanedText = text
    .replace(/\s+/g, ' ') // Reduce whitespace
    .substring(0, 50000); // Hard limit for safety

  try {
    const response = await fetch(`${API_BASE_URL}/flashcards/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: cleanedText }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate flashcards');
    }

    const data = await response.json();
    console.log('Full API response:', JSON.stringify(data, null, 2));
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid API response format:', JSON.stringify(data, null, 2));
      throw new Error('Invalid response format from API');
    }

    const content = data.choices[0].message.content.trim();
    console.log('Raw API response content:', content);
    
    try {
      // Try to parse as JSON first
      const parsedContent = JSON.parse(content);
      if (Array.isArray(parsedContent)) {
        return parsedContent.map(card => ({
          question: card.question || card.front || '',
          answer: card.answer || card.back || ''
        }));
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
      return cards;
    }
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error;
  }
  
  return [];
}