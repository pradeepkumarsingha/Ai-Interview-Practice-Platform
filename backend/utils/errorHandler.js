// utils/errorHandler.js
// Centralized error handling utilities

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

export const errorHandler = (err, req, res, next) => {
  const { statusCode = 500, message } = err;

  // Log error
  console.error(`[ERROR] ${message}`, err.stack);

  // Don't expose sensitive error details in production
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'An error occurred' 
    : message;

  return res.status(statusCode).json({
    success: false,
    error: {
      message: errorMessage,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
