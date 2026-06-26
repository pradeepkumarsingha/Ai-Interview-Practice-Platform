import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import InterviewSession from "../models/interviewSession.js";
import Question from "../models/Question.js";
import mockQuestions from "../data/mockQuestions.js";
import mockEvaluation from "../data/mockEvaluation.js";
import { aiService } from "../services/aiService.js";
import { logger } from "../utils/logger.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL|| "http://0.0.0.0:10000";
const INTERVIEW_QUESTION_LIMIT = 10;

const DOMAIN_ALIASES = {
  ml: ['machine learning', 'ai ml', 'ai/ml', 'artificial intelligence'],
  'machine learning': ['ml', 'ai ml', 'ai/ml', 'artificial intelligence'],
  ai: ['artificial intelligence', 'ai ml', 'ai/ml', 'machine learning', 'ml'],
  'ai/ml': ['ai ml', 'artificial intelligence', 'machine learning', 'ml'],
  frontend: ['front end', 'react', 'ui development'],
  'front end': ['frontend', 'react', 'ui development'],
  backend: ['back end', 'node', 'api development'],
  'back end': ['backend', 'node', 'api development'],
  'full stack': ['fullstack', 'full stack development', 'mern'],
  fullstack: ['full stack', 'full stack development', 'mern'],
};

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const domainRegexForTerm = (term) => {
  const escaped = escapeRegex(term);
  return term.length <= 3
    ? `(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`
    : escaped;
};

const normalizeDomain = (domain = '') =>
  domain.toLowerCase().trim().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ');

const getDomainSearchTerms = (domain) => {
  const normalized = normalizeDomain(domain);
  const terms = new Set([normalized, ...(DOMAIN_ALIASES[normalized] || [])]);
  normalized.split(/[\/,&]+/).map(normalizeDomain).filter(Boolean).forEach((term) => {
    terms.add(term);
    (DOMAIN_ALIASES[term] || []).forEach((alias) => terms.add(alias));
  });
  return [...terms].filter(Boolean);
};

const getDbInterviewQuestions = async (domain) => {
  const terms = getDomainSearchTerms(domain);
  const matchExpressions = terms.map((term) => ({
    domain: { $regex: domainRegexForTerm(term), $options: 'i' },
  }));

  const dbQuestions = await Question.aggregate([
    { $match: { $or: matchExpressions } },
    { $sample: { size: 50 } },
  ]);

  if (!dbQuestions.length) return null;

  const byType = {
    technical: shuffle(dbQuestions.filter((q) => q.type === 'technical')),
    coding: shuffle(dbQuestions.filter((q) => q.type === 'coding')),
    behavioral: shuffle(dbQuestions.filter((q) => q.type === 'behavioral')),
  };

  const selected = [
    ...byType.technical.slice(0, 4),
    ...byType.coding.slice(0, 2),
    ...byType.behavioral.slice(0, 2),
  ];

  const selectedIds = new Set(selected.map((q) => q._id?.toString()));
  const fillers = shuffle(dbQuestions.filter((q) => !selectedIds.has(q._id?.toString())));
  const dbQuestionTexts = shuffle([...selected, ...fillers]).map((q) => q.question);
  const mockData = getMockQuestionsForDomain(domain);
  const mockQuestionTexts = shuffle([
    ...(mockData.technical || []),
    ...(mockData.coding || []),
    ...(mockData.behavioral || []),
  ]);
  const questionTexts = [
    'Please introduce yourself briefly (education, skills, projects).',
    ...dbQuestionTexts,
    ...mockQuestionTexts,
  ];

  return Array.from(new Set(questionTexts)).slice(0, INTERVIEW_QUESTION_LIMIT);
};

const buildInterviewQuestions = (domain, primaryQuestions = []) => {
  const mockData = getMockQuestionsForDomain(domain);
  const mockQuestionTexts = shuffle([
    ...(mockData.technical || []),
    ...(mockData.coding || []),
    ...(mockData.behavioral || []),
  ]);
  const questionTexts = [
    'Please introduce yourself briefly (education, skills, projects).',
    ...primaryQuestions,
    ...mockQuestionTexts,
  ];

  return Array.from(new Set(questionTexts.filter(Boolean))).slice(0, INTERVIEW_QUESTION_LIMIT);
};

const countMatches = (answer, terms) =>
  terms.reduce((count, term) => count + (answer.includes(term) ? 1 : 0), 0);

const localEvaluateAnswers = (questions, answers, state = null) => {
  const technicalTerms = [
    'algorithm', 'complexity', 'database', 'api', 'model', 'training', 'testing',
    'feature', 'deployment', 'architecture', 'security', 'optimization', 'scalability',
    'react', 'node', 'python', 'java', 'sql', 'cloud', 'docker', 'validation',
  ];

  const scoredAnswers = questions.map((question, index) => {
    const rawAnswer = answers[index] || '';
    const answer = String(rawAnswer).trim();
    const lowerAnswer = answer.toLowerCase();
    const words = answer.split(/\s+/).filter(Boolean);
    const skipped =
      !answer ||
      lowerAnswer === 'no answer submitted.' ||
      lowerAnswer.includes('no answer submitted');

    if (skipped) {
      return {
        score: 0,
        technical: 0,
        communication: 0,
        confidence: 0,
        skipped: true,
      };
    }

    // Very short or low-effort answers should score low.
    if (words.length < 5) {
      return {
        score: 1,
        technical: 1,
        communication: 1,
        confidence: 1,
        skipped: false,
      };
    }

    const questionTerms = String(question)
      .toLowerCase()
      .split(/[^a-z0-9+#.]+/)
      .filter((term) => term.length > 3);
    const matchedQuestionTerms = countMatches(lowerAnswer, [...new Set(questionTerms)]);
    const matchedTechTerms = countMatches(lowerAnswer, technicalTerms);
    const lengthScore = Math.min(words.length / 18, 1) * 3;
    const detailScore = Math.min(words.length / 45, 1) * 2;
    const relevanceScore = Math.min(matchedQuestionTerms / 3, 1) * 2;
    const technicalScore = Math.min(matchedTechTerms / 3, 1) * 2;
    const structureScore = /because|therefore|first|second|for example|result|impact|learned/i.test(answer) ? 1 : 0;

    const score = Math.max(0, Math.min(10, lengthScore + detailScore + relevanceScore + technicalScore + structureScore));

    return {
      score,
      technical: Math.max(0, Math.min(10, relevanceScore + technicalScore + detailScore)),
      communication: Math.max(0, Math.min(10, lengthScore + structureScore + Math.min(words.length / 60, 1) * 2)),
      confidence: Math.max(0, Math.min(10, detailScore + structureScore + Math.min(words.length / 40, 1) * 2)),
      skipped: false,
    };
  });

  const average = (values) => values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
  const completedAnswers = scoredAnswers.filter((item) => !item.skipped).length;
  const completionRatio = completedAnswers / Math.max(questions.length, 1);
  let averageScore = average(scoredAnswers.map((item) => item.score));
  const technicalScore = average(scoredAnswers.map((item) => item.technical));
  const communicationScore = average(scoredAnswers.map((item) => item.communication));
  const confidenceScore = average(scoredAnswers.map((item) => item.confidence));

  if (completionRatio === 0) {
    averageScore = 0;
  } else if (completionRatio < 0.4) {
    averageScore = Math.min(averageScore, 2.5);
  } else if (completionRatio < 0.7) {
    averageScore = Math.min(averageScore, 4.5);
  }

  const strengths = [];
  const improvements = [];

  if (completionRatio >= 0.8) strengths.push('Answered most interview questions with consistent effort.');
  if (communicationScore >= 6.5) strengths.push('Communication is reasonably clear and structured.');
  if (technicalScore >= 6.5) strengths.push('Responses include relevant technical context.');
  if (!strengths.length && averageScore > 0) strengths.push('Good start. Continue practicing complete, specific answers.');
  if (averageScore === 0) strengths.push('No meaningful answers were submitted in this attempt.');

  if (completionRatio < 0.8) improvements.push('Avoid skipping questions; give at least a concise structured answer.');
  if (technicalScore < 6.5) improvements.push('Add more role-specific technical terms, examples, and trade-offs.');
  if (communicationScore < 6.5) improvements.push('Use a clearer structure: context, action, result, and learning.');
  if (confidenceScore < 6.5) improvements.push('Provide more detail and measurable outcomes to sound more confident.');

  const suggestions = improvements.length
    ? improvements
    : ['Keep practicing with deeper examples and quantified project impact.'];

  const domainLabel = state?.domain || state?.role || 'your target domain';
  const finalFeedback = averageScore >= 7
    ? `Strong attempt for ${domainLabel}. Your answers show good coverage; improve by adding sharper metrics and trade-offs.`
    : averageScore >= 5
      ? `Moderate attempt for ${domainLabel}. Build stronger answer structure and include more concrete technical examples.`
      : `Needs more practice for ${domainLabel}. Focus on answering every question with context, action, result, and learning.`;

  return {
    average_score: Number(averageScore.toFixed(1)),
    technical_score: Number(technicalScore.toFixed(1)),
    communication_score: Number(communicationScore.toFixed(1)),
    confidence_score: Number(confidenceScore.toFixed(1)),
    strengths,
    improvements,
    final_feedback: finalFeedback,
    suggestions,
  };
};

const persistUploadedResume = async (req) => {
  if (!req.file || !req.user) return;

  req.user.resumeUrl = `/uploads/${req.file.filename}`;
  req.user.resumeOriginalName = req.file.originalname;
  req.user.resumeUploadedAt = new Date();
  await req.user.save();
};

// =======================================
// 🎯 Helper: Get Mock Questions by Domain
// =======================================
const getMockQuestionsForDomain = (domain) => {
  const domain_lower = domain.toLowerCase();
  
  // Try exact match first
  if (domain_lower in mockQuestions) {
    return mockQuestions[domain_lower];
  }
  
  // Try to find partial match
  for (const key in mockQuestions) {
    if (key.includes(domain_lower) || domain_lower.includes(key)) {
      return mockQuestions[key];
    }
  }
  
  // Default to general
  return mockQuestions.general || mockQuestions.python;
};

// =======================================
// 🎯 1️⃣ Predict Role
// =======================================
export const predictRole = async (req, res) => {
  try {
    let requestBody = { ...req.body };

    // If a file is uploaded, read its content as text
    if (req.file) {
      try {
        await persistUploadedResume(req);
        requestBody.resume_text = fs.readFileSync(req.file.path, { encoding: "utf-8" });
      } catch (fileErr) {
        logger.error("Error reading uploaded resume:", fileErr.message);
        return res.status(500).json({ 
          success: false,
          message: "Failed to read uploaded resume" 
        });
      }
    }

    const hasResumeText = typeof requestBody.resume_text === "string" && requestBody.resume_text.trim().length > 0;
    const hasSkills = typeof requestBody.skills === "string" && requestBody.skills.trim().length > 0;

    if (!hasResumeText && !hasSkills) {
      return res.status(400).json({ 
        success: false,
        message: "resume_text or skills required" 
      });
    }

    try {
      const result = await aiService.predictRole(
        requestBody.resume_text,
        requestBody.skills,
        req.file?.path
      );
      res.json({ success: true, ...result });
    } catch (aiError) {
      logger.error("Role Prediction Error:", {
        status: aiError.response?.status,
        data: aiError.response?.data,
        message: aiError.message,
      });

      return res.status(aiError.response?.status || 500).json({
        success: false,
        message:
          aiError.response?.data?.detail ||
          aiError.response?.data?.message ||
          aiError.response?.data?.error ||
          "Role prediction failed.",
      });
    }

  } catch (err) {
    logger.error("predictRole error:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Role prediction failed",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// =======================================
// 🧬 2️⃣ Digital Twin (Resume Upload)
// =======================================
export const digitalTwin = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ 
        success: false,
        message: "No resume file uploaded" 
      });

    await persistUploadedResume(req);

    try {
      const result = await aiService.digitalTwin(
        req.file.path,
        req.user?._id?.toString()
      );
      res.json({ success: true, ...result });
    } catch (aiError) {
    logger.error("Digital Twin Error:", {
        status: aiError.response?.status,
        data: aiError.response?.data,
        message: aiError.message,
    });

    return res.status(aiError.response?.status || 500).json({
        success: false,
        message:
            aiError.response?.data?.detail ||
            aiError.response?.data?.message ||
            aiError.response?.data?.error ||
            "Failed to analyze resume.",
    });
}
  } catch (err) {
    logger.error("digitalTwin error:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Digital twin analysis failed",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// =======================================
// 📊 3️⃣ ATS Score
// =======================================
export const atsScore = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No resume file uploaded",
      });
    }

    await persistUploadedResume(req);

    try {
      const result = await aiService.calculateATSScore(
        req.file.path,
        req.body.job_description,
        req.user?._id?.toString()
      );

      return res.status(200).json({
        success: true,
        ...result,
      });

    } catch (aiError) {

      logger.error("ATS AI Service Error:", {
        status: aiError.response?.status,
        data: aiError.response?.data,
        message: aiError.message,
      });

      return res.status(aiError.response?.status || 500).json({
        success: false,
        message:
          aiError.response?.data?.detail ||
          aiError.response?.data?.message ||
          aiError.response?.data?.error ||
          "ATS analysis failed.",
      });
    }

  } catch (err) {

    logger.error("ATS Controller Error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : undefined,
    });
  }
};

// =======================================
// 🤖 4️⃣ AI Interview Flow - Start Interview
// =======================================
export const startInterview = async (req, res) => {
  try {
    const { domain } = req.body;

    if (!domain || typeof domain !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Valid domain is required"
      });
    }

    try {
      const dbQuestions = await getDbInterviewQuestions(domain);
      if (dbQuestions?.length) {
        logger.info(`Interview questions loaded from DB for domain: ${domain}`);
        return res.json({
          success: true,
          questions: dbQuestions,
          state: {
            domain,
            total_questions: dbQuestions.length,
            source: 'database',
            using_db_questions: true,
          },
        });
      }
    } catch (dbError) {
      logger.warn(`DB question fetch failed for ${domain}: ${dbError.message}`);
    }

    try {
      const aiResult = await aiService.startInterview(domain);
      logger.info(`Interview questions loaded from AI service for domain: ${domain}`);
      const questions = buildInterviewQuestions(domain, aiResult.questions || []);
      
      return res.json({
        success: true,
        ...aiResult,
        questions,
        state: {
          ...(aiResult.state || {}),
          domain,
          total_questions: questions.length,
          source: 'api',
          using_api_questions: true,
        },
      });

    } catch (aiError) {
      logger.warn(`No DB questions found and AI service unavailable for ${domain}; using local mock questions`);

      const questions = buildInterviewQuestions(domain);

      return res.json({
        success: true,
        questions,
        state: {
          domain,
          total_questions: questions.length,
          source: 'mock',
          using_mock_data: true
        }
      });
    }

  } catch (err) {
    logger.error("startInterview error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to start interview",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// =======================================
// 🤖 5️⃣ AI Interview Flow - Final Evaluation
// =======================================
export const finalEvaluate = async (req, res) => {
  try {
    const { answers, questions, state, duration } = req.body;

    if (!answers || !questions) {
      return res.status(400).json({
        success: false,
        message: "answers and questions are required"
      });
    }

    if (!Array.isArray(answers) || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: "answers and questions must be arrays"
      });
    }

    const evaluation = localEvaluateAnswers(questions, answers, state);

    // Ensure evaluation has all required fields
    if (!evaluation) {
      throw new Error("Invalid evaluation response");
    }

    // Format suggestions as array
    let suggestionsArray = [];
    if (Array.isArray(evaluation.suggestions)) {
      suggestionsArray = evaluation.suggestions;
    } else if (typeof evaluation.suggestions === 'string') {
      suggestionsArray = evaluation.suggestions
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }

    // Save interview session
    try {
      await InterviewSession.create({
        userId: req.user._id,
        domain: state?.domain || 'unknown',
        questions,
        answers,
        averageScore: evaluation.average_score || 0,
        evaluation: {
          technicalScore: evaluation.technical_score,
          communicationScore: evaluation.communication_score,
          confidenceScore: evaluation.confidence_score,
          strengths: evaluation.strengths || [],
          weaknesses: evaluation.improvements || [],
          recommendations: suggestionsArray
        },
        finalFeedback: String(evaluation.final_feedback || "Great effort! Keep improving."),
        suggestions: suggestionsArray,
        duration: duration || 0,
        status: 'completed',
        usedMockData: false,
        usedLocalEvaluation: true,
        completedAt: new Date()
      });

      logger.info(`Interview session saved for user ${req.user._id}`);
    } catch (dbError) {
      logger.error(`Failed to save interview session: ${dbError.message}`);
      // Don't fail the request if we can't save, just warn
    }

    res.status(200).json({
      success: true,
      average_score: Number((evaluation.average_score || 0).toFixed(1)),
      technical_score: evaluation.technical_score,
      communication_score: evaluation.communication_score,
      confidence_score: evaluation.confidence_score,
      strengths: (evaluation.strengths || []).map(s => String(s)),
      improvements: (evaluation.improvements || []).map(s => String(s)),
      final_feedback: String(evaluation.final_feedback || "Great effort! Keep improving."),
      suggestions: suggestionsArray,
      using_mock_data: false,
      using_local_evaluation: true
    });

  } catch (err) {
    logger.error("finalEvaluate error:", err.message, err);
    res.status(500).json({
      success: false,
      message: "Evaluation failed",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
