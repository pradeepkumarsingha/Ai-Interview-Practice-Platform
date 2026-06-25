import mongoose from "mongoose";

const interviewRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"]
  },

  // User Information (at time of request - optional, resolved via userId ref)
  name: {
    type: String
  },
  email: {
    type: String
  },
  
  // Interview Details
  domain: {
    type: String,
    required: [true, "Domain is required"]
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  skills: {
    type: [String],
    default: []
  },
  
  // Scheduling
  preferredDate: {
    type: Date
  },
  preferredTime: String, // e.g., "10:00 AM", "2:30 PM"
  
  // Status Management
  status: {
    type: String,
    enum: ["pending", "approved", "scheduled", "rejected", "completed", "cancelled"],
    default: "pending",
    index: true
  },

  // Meeting Information
  meetingId: {
    type: String,
    unique: true,
    sparse: true
  },
  meetingLink: String,
  
  // Scheduling Details
  scheduledAt: Date,
  scheduledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  // Admin Notes
  adminRemarks: String,
  rejectionReason: String,
  
  // Interview Outcome
  completedAt: Date,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String,
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indices for common queries
interviewRequestSchema.index({ userId: 1, createdAt: -1 });
interviewRequestSchema.index({ status: 1, createdAt: -1 });
interviewRequestSchema.index({ domain: 1, status: 1 });

// Auto-update updatedAt on save
interviewRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model(
  "InterviewRequest",
  interviewRequestSchema
);
