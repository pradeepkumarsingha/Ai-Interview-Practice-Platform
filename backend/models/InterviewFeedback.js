import mongoose from "mongoose";

const interviewFeedbackSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  interviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InterviewRequest",
    required: true
  },
  communicationScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  technicalScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  problemSolvingScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  remarks: {
    type: String,
    default: ""
  },
  aiFeedback: {
    type: String,
    default: ""
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("InterviewFeedback", interviewFeedbackSchema);
