import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: [true, 'Please provide a domain'],
    trim: true
  },
  type: {
    type: String,
    enum: ['technical', 'coding', 'behavioral'],
    required: [true, 'Please specify question type']
  },
  question: {
    type: String,
    required: [true, 'Please provide the question text'],
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: [true, 'Please specify difficulty level']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Question = mongoose.model('Question', questionSchema);
export default Question;
