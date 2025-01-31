import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
            role: 'user',
            content: `
              Generate flashcards from the following text. Return the response as a JSON array of objects, 
              where each object has a "question" and "answer" property. Make the questions challenging but clear, 
              and ensure the answers are comprehensive but concise.
              
              Text: ${text}
              
              Format the response as: [{"question": "...", "answer": "..."}, ...]
            `,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate flashcards');
    }

    const data = await response.json();
    const flashcardsText = data.choices[0].message.content;
    const flashcards = JSON.parse(flashcardsText);

    res.status(200).json(flashcards);
  } catch (error) {
    console.error('Error generating flashcards:', error);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
} 