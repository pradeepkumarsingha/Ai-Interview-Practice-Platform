import express from 'express';
import Question from '../../models/Question.js';
import { protect } from '../../middleware/authMiddleware.js';
import { adminAuth } from '../../middleware/adminAuth.js';

const router = express.Router();

// Validation helper
const validateQuestion = (data) => {
  if (!data.domain || !data.question || !data.type || !data.difficulty) {
    return 'Missing required fields: domain, question, type, difficulty';
  }
  if (!['technical', 'coding', 'behavioral'].includes(data.type)) {
    return 'Invalid type. Must be: technical, coding, or behavioral';
  }
  if (!['easy', 'medium', 'hard'].includes(data.difficulty)) {
    return 'Invalid difficulty. Must be: easy, medium, or hard';
  }
  return null;
};

// CREATE - Add new question
router.post('/', protect, adminAuth, async (req, res) => {
  try {
    const { domain, type, question, difficulty } = req.body;

    // Validate input
    const validationError = validateQuestion(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // Create new question
    const newQuestion = new Question({
      domain,
      type,
      question,
      difficulty
    });

    // Save to database
    const savedQuestion = await newQuestion.save();

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: savedQuestion
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating question', error: err.message });
  }
});

// READ - Get all questions
router.get('/', protect, adminAuth, async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching questions', error: err.message });
  }
});

// UPDATE - Update question by ID
router.put('/:id', protect, adminAuth, async (req, res) => {
  try {
    const { domain, type, question, difficulty } = req.body;

    // Validate input
    const validationError = validateQuestion(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // Find and update
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      { domain, type, question, difficulty },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: updatedQuestion
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating question', error: err.message });
  }
});

// DELETE - Delete question by ID
router.delete('/:id', protect, adminAuth, async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);

    if (!deletedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
      data: deletedQuestion
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting question', error: err.message });
  }
});

export default router;
