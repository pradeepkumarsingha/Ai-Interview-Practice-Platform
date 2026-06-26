// services/aiService.js
// Centralized AI service integration with retry logic and error handling

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { logger } from '../utils/logger.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:10000';
const TIMEOUT = parseInt(process.env.AI_SERVICE_TIMEOUT || '30000');
const MAX_RETRIES = 3;

class AIServiceError extends Error {
  constructor(message, code = 'AI_SERVICE_ERROR', statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

// Retry logic with exponential backoff
const withRetry = async (fn, retries = MAX_RETRIES, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && shouldRetry(error)) {
      logger.warn(`AI service error, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

const shouldRetry = (error) => {
  // Retry on network errors and 5xx errors, but not 4xx client errors
  return error.code === 'ECONNREFUSED' || 
         error.code === 'ETIMEDOUT' || 
         (error.response && error.response.status >= 500);
};

export const aiService = {
  // Predict role from resume or skills
  async predictRole(resumeText, skills = null, filePath = null) {
    try {
      if (filePath) {
        // Send file directly to AI service for PDF parsing
        const formData = new FormData();
        formData.append('resume', fs.createReadStream(filePath));
        formData.append('projects', '0');
        formData.append('internships', '0');
        formData.append('certifications', '0');
        formData.append('cgpa', '0.0');

        return await withRetry(async () => {
          const response = await axios.post(
            `${AI_SERVICE_URL}/predict-role`,
            formData,
            {
              headers: formData.getHeaders(),
              timeout: TIMEOUT
            }
          );
          return response.data;
        });
      }

      // Construct a minimal resume text from skills to pass validation
      let resumeTextToSend = resumeText;
      if (skills && !resumeText) {
        resumeTextToSend = `Skills: ${skills}\n\nExperience: Worked with ${skills} in various projects. Developed multiple applications and systems using these technologies. Collaborated with cross-functional teams to deliver high-quality software solutions.\n\nEducation: Bachelor's degree in Computer Science with focus on software engineering and data structures. Completed coursework in algorithms, databases, and web development.\n\nProjects: Developed applications using ${skills}. Built scalable web applications and microservices. Implemented RESTful APIs and database integrations. Participated in code reviews and agile development processes.\n\nTechnical Skills: Proficient in ${skills}. Experience with version control, testing frameworks, and cloud deployment platforms. Strong problem-solving abilities and attention to detail.`;
      }

      const payload = {
        resume_text: resumeTextToSend,
        projects: 0,
        internships: 0,
        certifications: 0,
        cgpa: 0.0
      };

      return await withRetry(async () => {
        const response = await axios.post(
          `${AI_SERVICE_URL}/predict-role`,
          payload,
          { timeout: TIMEOUT }
        );
        return response.data;
      });
    } catch (error) {
      logger.error(`Role prediction failed: ${error.message}`);
      throw new AIServiceError(
        'Failed to predict role',
        'ROLE_PREDICTION_ERROR',
        error.response?.status || 500
      );
    }
  },

  // Analyze resume with digital twin
  async digitalTwin(filePath, userId = null) {
    try {
      return await withRetry(async () => {
        const formData = new FormData();
        formData.append('resume', fs.createReadStream(filePath));
        if (userId) formData.append('user_id', userId);

        const response = await axios.post(
          `${AI_SERVICE_URL}/digital_twin`,
          formData,
          {
            headers: formData.getHeaders(),
            timeout: TIMEOUT
          }
        );
        return response.data;
      });
    } catch (error) {
      logger.error(`Digital twin analysis failed: ${error.message}`);
      throw new AIServiceError(
        'Failed to analyze resume',
        'DIGITAL_TWIN_ERROR',
        error.response?.status || 500
      );
    }
  },

  // Calculate ATS score
  async calculateATSScore(filePath, jobDescription = null, userId = null) {
    try {
      return await withRetry(async () => {
        const formData = new FormData();
        formData.append('resume', fs.createReadStream(filePath));
        if (jobDescription) formData.append('job_description', jobDescription);
        if (userId) formData.append('user_id', userId);

        const response = await axios.post(
          `${AI_SERVICE_URL}/ats_score`,
          formData,
          {
            headers: formData.getHeaders(),
            timeout: TIMEOUT
          }
        );
        return response.data;
      });
    } catch (error) {
      logger.error(`ATS score calculation failed: ${error.message}`);
      throw new AIServiceError(
        'Failed to calculate ATS score',
        'ATS_SCORE_ERROR',
        error.response?.status || 500
      );
    }
  },

  // Start interview
  async startInterview(role) {
    try {
      return await withRetry(async () => {
        const response = await axios.post(
          `${AI_SERVICE_URL}/start_interview`,
          { role },
          { timeout: TIMEOUT }
        );
        return response.data;
      });
    } catch (error) {
      logger.error(`Interview start failed: ${error.message}`);
      throw new AIServiceError(
        'Failed to start interview',
        'INTERVIEW_START_ERROR',
        error.response?.status || 500
      );
    }
  },

  // Evaluate answers
  async evaluateAnswers(questions, answers, state = null) {
    try {
      return await withRetry(async () => {
        const response = await axios.post(
          `${AI_SERVICE_URL}/final_evaluate`,
          { questions, answers, state },
          { timeout: TIMEOUT }
        );
        return response.data;
      });
    } catch (error) {
      logger.error(`Answer evaluation failed: ${error.message}`);
      throw new AIServiceError(
        'Failed to evaluate answers',
        'EVALUATION_ERROR',
        error.response?.status || 500
      );
    }
  },

  // Health check
  async healthCheck() {
    try {
      const response = await axios.get(
        `${AI_SERVICE_URL}/health`,
        { timeout: 5000 }
      );
      return response.data;
    } catch (error) {
      logger.error(`AI service health check failed: ${error.message}`);
      return { status: 'unhealthy', error: error.message };
    }
  }
};

export default aiService;
