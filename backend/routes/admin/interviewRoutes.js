import express from "express";
import InterviewRequest from "../../models/InterviewRequest.js";
import { protect } from "../../middleware/authMiddleware.js";
import { adminAuth } from "../../middleware/adminAuth.js";
import { 
  approveLiveInterviewRequest,
  rejectLiveInterviewRequest,
  rescheduleLiveInterview,
  completeInterview
} from "../../controllers/interviewController.js";

const router = express.Router();

// 📋 READ - Get all interview requests (with filtering)
router.get("/", protect, adminAuth, async (req, res) => {
  try {
    const { status = "pending", domain, limit = 20, page = 1 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (domain) filter.domain = { $regex: domain, $options: 'i' };

    const interviews = await InterviewRequest.find(filter)
      .populate("userId", "name email skills experienceLevel")
      .populate("scheduledBy", "name email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await InterviewRequest.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: interviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: interviews,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching scheduled interviews",
      error: err.message,
    });
  }
});

// ✅ APPROVE - Approve interview request
router.put("/:requestId/approve", protect, adminAuth, approveLiveInterviewRequest);

// ❌ REJECT - Reject interview request
router.put("/:requestId/reject", protect, adminAuth, rejectLiveInterviewRequest);

// 🔄 RESCHEDULE - Reschedule interview
router.put("/:requestId/reschedule", protect, adminAuth, rescheduleLiveInterview);

// ✔️ COMPLETE - Mark interview as completed
router.put("/:requestId/complete", protect, adminAuth, completeInterview);

// 📊 STATS - Get interview statistics
router.get("/stats", protect, adminAuth, async (req, res) => {
  try {
    const stats = await InterviewRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const byDomain = await InterviewRequest.aggregate([
      {
        $group: {
          _id: "$domain",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        byStatus: Object.fromEntries(stats.map(s => [s._id, s.count])),
        byDomain: byDomain,
        totalRequests: stats.reduce((sum, s) => sum + s.count, 0)
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching statistics"
    });
  }
});

export default router;
