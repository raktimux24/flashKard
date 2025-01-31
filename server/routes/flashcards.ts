import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-r1-distill-llama-70b',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates flashcards from text. Each flashcard should have a question and answer format.'
          },
          {
            role: 'user',
            content: `Generate flashcards from this text: ${text}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate flashcards');
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error generating flashcards:', error);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});

export default router;
