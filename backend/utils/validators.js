// utils/validators.js
// Input validation utilities for all routes

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  // Minimum 8 characters, at least one uppercase, one lowercase, one number
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

export const validateDomain = (domain) => {
  if (!domain || typeof domain !== 'string') return false;
  return domain.trim().length > 0 && domain.trim().length <= 100;
};

export const validateExperienceLevel = (level) => {
  const valid = ['entry', 'mid', 'senior', 'lead', 'beginner', 'intermediate', 'advanced'];
  return valid.includes(level?.toLowerCase());
};

export const validateInterviewRequest = (data) => {
  const errors = [];
  
  if (!data.domain || !validateDomain(data.domain)) {
    errors.push('Valid domain is required');
  }
  
  if (!data.experienceLevel || !validateExperienceLevel(data.experienceLevel)) {
    errors.push('Valid experience level is required');
  }
  
  return errors;
};

export const validateQuestion = (data) => {
  const errors = [];
  
  if (!data.domain || typeof data.domain !== 'string') {
    errors.push('Domain is required');
  }
  
  if (!data.question || typeof data.question !== 'string') {
    errors.push('Question text is required');
  }
  
  if (!['technical', 'coding', 'behavioral'].includes(data.type)) {
    errors.push('Invalid question type');
  }
  
  if (!['easy', 'medium', 'hard'].includes(data.difficulty)) {
    errors.push('Invalid difficulty level');
  }
  
  return errors;
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};
