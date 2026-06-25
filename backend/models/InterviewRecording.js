import mongoose from "mongoose";

const interviewRecordingSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InterviewRequest",
    required: true
  },
  recordingUrl: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // duration in seconds
    default: 0
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("InterviewRecording", interviewRecordingSchema);
