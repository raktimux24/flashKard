import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import type { ErrorRequestHandler } from 'express';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import flashcardsRouter from './routes/flashcards';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.development';
config({ path: join(__dirname, '..', envFile) });

const app = express();
const port = process.env.PORT || 3001;

// Firebase initialization
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Development: Allow any localhost port
    if (process.env.NODE_ENV === 'development') {
      if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, origin);
      }
      return callback(new Error('Development CORS policy restricts access to localhost'));
    }

    // Production: Strict origin check
    if (origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight

// Increase JSON payload limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.header('Cache-Control', 'no-store, max-age=0');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    cors: {
      mode: process.env.NODE_ENV,
      allowedOrigins: process.env.NODE_ENV === 'development' 
        ? 'Dynamic localhost origins' 
        : process.env.FRONTEND_URL
    }
  });
});

// Direct Groq API handling
app.post('/api/groq/*', async (req, res) => {
  const groqPath = req.path.replace('/api/groq', '');
  const groqUrl = `https://api.groq.com${groqPath}`;
  
  console.log('Making request to Groq API:', {
    url: groqUrl,
    method: 'POST',
    bodyLength: JSON.stringify(req.body).length
  });

  try {
    const response = await fetch(groqUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_GROQ_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    console.log('Groq API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    const text = await response.text();
    console.log('Raw response text:', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse Groq API response:', parseError);
      return res.status(500).json({
        error: 'Invalid JSON response from Groq API',
        message: parseError.message,
        rawResponse: text.substring(0, 1000)
      });
    }

    if (!response.ok) {
      console.error('Groq API Error:', data);
      return res.status(response.status).json({
        error: 'Groq API Error',
        status: response.status,
        message: data.error?.message || 'Unknown error',
        details: data
      });
    }

    res.setHeader('Content-Type', 'application/json');
    res.json(data);
  } catch (error) {
    console.error('Error forwarding request to Groq:', error);
    res.status(500).json({
      error: 'Failed to forward request to Groq API',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Routes
app.use('/api/flashcards', flashcardsRouter);

// Flashcard Set Routes
app.post('/api/flashcard-sets', async (req, res) => {
  try {
    const { title, cardCount, userId } = req.body;
    
    // Implementation of saving flashcard set using Firebase
    // This is a placeholder and should be replaced with actual Firebase implementation
    res.status(201).json({ message: 'Flashcard set saved successfully' });
  } catch (error) {
    console.error('Error saving flashcard set:', error);
    res.status(500).json({ error: 'Failed to save flashcard set' });
  }
});

// Global error handler
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
};

app.use(errorHandler);

// Add debug logging
console.log('Loaded environment:', process.env.NODE_ENV);
console.log('Using .env file:', envFile);
console.log('CORS configuration:', corsOptions);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('CORS: Dynamic origin handling enabled');
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
}); 