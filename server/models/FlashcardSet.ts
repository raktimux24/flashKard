import mongoose from 'mongoose';

const flashcardSetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  cardCount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Add other fields as needed
});

export const FlashcardSet = mongoose.model('FlashcardSet', flashcardSetSchema);
