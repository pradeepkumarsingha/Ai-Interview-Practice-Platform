import express from 'express';
import Question from '../models/Question.js';
import { protect } from '../middleware/authMiddleware.js';
import { getLiveInterviewRoomDetails } from '../controllers/interviewController.js';

const router = express.Router();

router.get('/room/:meetingId', protect, getLiveInterviewRoomDetails);

// GET - Fetch interview questions by domain
// Randomly select 5 questions from database based on domain
router.get('/questions', protect, async (req, res) => {
  try {
    const { domain } = req.query;

    if (!domain) {
      return res.status(400).json({ message: 'Domain query parameter is required' });
    }

    // Fetch 5 random questions from database filtered by domain
    const questions = await Question.aggregate([
      { $match: { domain: domain } },
      { $sample: { size: 5 } }
    ]);

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions available for this domain'
      });
    }

    res.status(200).json({
      success: true,
      domain,
      count: questions.length,
      data: questions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching interview questions', error: err.message });
  }
});

export default router;
