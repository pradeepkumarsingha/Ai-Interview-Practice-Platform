import InterviewSession from "../models/interviewSession.js";



export const getDashboardStats = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({
      userId: req.user._id
    }).sort({ createdAt: -1 });

    const totalInterviews = sessions.length;

    // Filter out sessions with null/undefined averageScore
    const sessionsWithScores = sessions.filter(s => s.averageScore != null);
    
    const avgScore =
      sessionsWithScores.length === 0
        ? 0
        : sessionsWithScores.reduce((sum, s) => sum + s.averageScore, 0) /
          sessionsWithScores.length;

    const totalDuration = sessions.reduce(
      (sum, s) => sum + (s.duration || 0),
      0
    );
    const scoreHistory = sessions
  .map(s => Number(s.averageScore))
  .filter(score => !isNaN(score) && score > 0);

    res.json({
      totalInterviews,
      averageScore: Number(avgScore.toFixed(1)),
      totalDuration,
      recentActivity: sessions.slice(0, 5),
      scoreHistory
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};
