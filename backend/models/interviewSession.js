// models/InterviewSession.js
import mongoose from "mongoose";

const evaluationSchema = new mongoose.Schema({
  technicalScore: {
    type: Number,
    min: 0,
    max: 10
  },
  communicationScore: {
    type: Number,
    min: 0,
    max: 10
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 10
  },
  strengths: [String],
  weaknesses: [String],
  recommendations: [String]
}, { _id: false });

const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  domain: {
    type: String,
    required: true,
    index: true
  },
  
  // Questions and Answers
  questions: {
    type: [String],
    default: []
  },
  answers: {
    type: [String],
    default: []
  },
  
  // Scoring
  averageScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  evaluation: evaluationSchema,
  
  // Feedback
  finalFeedback: String,
  suggestions: [String],
  
  // Metadata
  duration: {
    type: Number, // in seconds
    default: 0
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'failed'],
    default: 'completed'
  },
  usedMockData: {
    type: Boolean,
    default: false
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  completedAt: Date
});

// Index for user interview history
interviewSessionSchema.index({ userId: 1, createdAt: -1 });
interviewSessionSchema.index({ domain: 1, createdAt: -1 });

export default mongoose.model("InterviewSession", interviewSessionSchema);