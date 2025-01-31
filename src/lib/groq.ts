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

  const chunks = [];
  for (let i = 0; i < cleanedText.length; i += MAX_CHUNK_LENGTH) {
    chunks.push(cleanedText.substring(i, i + MAX_CHUNK_LENGTH));
  }

  const chunkPromises = chunks.map(async (chunk, index) => {
    const response = await withRetry(async () => await callGroqAPI(chunk));

    const data = await response.json();
    console.log('Full API response:', JSON.stringify(data, null, 2));
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid API response format:', JSON.stringify(data, null, 2));
      throw new Error('Invalid response format from API');
    }

    const content = data.choices[0].message.content.trim();
    console.log('Raw API response content:', content);
    
    try {
      // Preprocess the content to fix common JSON formatting issues
      const preprocessed = content
        // Convert ["key":"value"] to {"key":"value"}
        .replace(/\[(\s*"[^"]+"\s*:\s*"[^"]+"\s*,?\s*)+\]/g, (match: string) => 
          match.replace(/^\[/, '{').replace(/\]$/, '}')
        )
        // Fix missing quotes around property names
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":')
        // Fix missing quotes after colons
        .replace(/:([^",\s\d][^,}\]]*[,}\]])/g, ':"$1')
        // Remove any trailing commas
        .replace(/,(\s*[}\]])/g, '$1');

      console.log('Preprocessed content:', preprocessed);

      // Parse the JSON content
      const flashcards = JSON.parse(preprocessed);
      
      if (!Array.isArray(flashcards)) {
        throw new Error('Generated content is not an array of flashcards');
      }

      // Validate and clean each flashcard
      const validFlashcards = flashcards
        .filter((card): card is Flashcard => {
          const isValid = (
            typeof card === 'object' &&
            card !== null &&
            typeof card.question === 'string' &&
            typeof card.answer === 'string' &&
            card.question.trim() !== '' &&
            card.answer.trim() !== ''
          );
          if (!isValid) {
            console.log('Invalid flashcard:', card);
          }
          return isValid;
        })
        .map(card => ({
          question: card.question.trim(),
          answer: card.answer.trim()
        }));

      if (validFlashcards.length === 0) {
        throw new Error('No valid flashcards generated');
      }

      return validFlashcards;
    } catch (parseError) {
      console.error('Error parsing flashcards:', parseError, content);
      throw parseError;
    }
  });

  const results = await Promise.all(chunkPromises);
  return results.flat();
}