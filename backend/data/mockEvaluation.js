/**
 * Mock evaluation data used when AI service is unavailable
 * Provides fallback feedback for interview evaluations
 */

const mockEvaluation = {
  average_score: 7.5,
  strengths: "Good understanding of core concepts, clear communication, and problem-solving approach",
  improvements: "Could provide more detailed explanations, practice coding problems regularly, and improve time management",
  final_feedback: "You demonstrated solid technical knowledge and good communication skills. Work on deeper understanding of advanced topics and practice coding problems under time pressure.",
  suggestions: [
    "Study system design patterns",
    "Practice coding problems daily",
    "Build real-world projects",
    "Participate in code reviews"
  ]
};

export default mockEvaluation;
