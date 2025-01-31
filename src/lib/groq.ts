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

const fetchOptions = {
  mode: 'cors' as const,
  credentials: 'include' as const,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

const chunkText = (text: string): string[] => {
  // Very small chunk size
  const maxChunkSize = 200;
  const chunks: string[] = [];
  
  // Split by sections and sentences
  const sections = text.split(/\n\n+/);
  
  for (const section of sections) {
    if (!section.trim()) continue;
    
    // Split into sentences
    const sentences = section.split(/[.!?]+\s+/);
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;
      
      if ((currentChunk + trimmedSentence).length > maxChunkSize) {
        if (currentChunk) chunks.push(currentChunk.trim());
        // If a single sentence is too long, split it into phrases
        if (trimmedSentence.length > maxChunkSize) {
          const phrases = trimmedSentence.split(/[,;]\s+/);
          let phraseChunk = '';
          for (const phrase of phrases) {
            if ((phraseChunk + phrase).length > maxChunkSize) {
              if (phraseChunk) chunks.push(phraseChunk.trim());
              phraseChunk = phrase;
            } else {
              phraseChunk += (phraseChunk ? ', ' : '') + phrase;
            }
          }
          if (phraseChunk) chunks.push(phraseChunk.trim());
        } else {
          currentChunk = trimmedSentence;
        }
      } else {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      }
    }
    
    if (currentChunk) chunks.push(currentChunk.trim());
  }
  
  return chunks.filter(chunk => chunk.length > 0);
};

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
const estimateTokens = (text: string) => Math.ceil(text.length * 0.27);

// Precision error parsing
const parseRateLimitError = (error: any) => {
  const errorMessage = error.details?.error?.message || '';
  const tokenMatch = errorMessage.match(/Used (\d+), Requested (\d+)/);
  const timeMatch = errorMessage.match(/try again in (\d+\.?\d*)s/);

  if (tokenMatch && timeMatch) {
    const used = parseInt(tokenMatch[1]);
    const requested = parseInt(tokenMatch[2]);
    const waitSeconds = parseFloat(timeMatch[1]);

    rateLimit = {
      remaining: Math.max(0, 5000 - used - requested),
      reset: Date.now() + waitSeconds * 1000
    };
    return waitSeconds * 1000;
  }
  return null;
};

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let attempt = 1;
  while (attempt <= MAX_RETRIES) {
    try {
      return await fn();
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error) {
        const statusError = error as { status: number };
        if (statusError.status !== 429 || attempt >= MAX_RETRIES) throw error;
      }
      
      const waitTime = parseRateLimitError(error) || 
        Math.pow(2, attempt) * 1000 + Math.random() * 2000;

      rateLimit.remaining = 0;
      rateLimit.reset = Date.now() + waitTime;
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
      attempt++;
    }
  }
  throw new Error('Max retries exceeded');
}

async function callGroqAPI(chunk: string) {
  const estimatedTokens = estimateTokens(chunk);
  
  if (rateLimit.remaining < estimatedTokens) {
    const delay = Math.max(
      rateLimit.reset - Date.now(),
      Math.pow(2, retryCount) * 1000 + Math.random() * 2000
    );
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
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

  // Update rate limit state
  rateLimit = {
    remaining: parseInt(response.headers.get('x-ratelimit-remaining') || '1'),
    reset: parseInt(response.headers.get('x-ratelimit-reset') || `${Date.now() + 1000}`) * 1000
  };

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

    const flashcardsText = data.choices[0].message.content.trim();
    console.log('Raw API response content:', flashcardsText);
    
    try {
      // Remove any potential markdown code block markers
      const cleanJson = flashcardsText
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .trim();
      
      console.log('Cleaned JSON:', cleanJson);
      const flashcards = JSON.parse(cleanJson);
      
      if (!Array.isArray(flashcards) || !flashcards.every(card => 
        typeof card === 'object' && 
        'question' in card && 
        'answer' in card
      )) {
        throw new Error('Invalid flashcard format');
      }
      
      return flashcards;
    } catch (parseError) {
      console.error('Error parsing flashcards:', parseError, flashcardsText);
      throw new Error('Failed to parse generated flashcards');
    }
  });

  const chunkResults = await Promise.all(chunkPromises);
  return chunkResults.flat();
}