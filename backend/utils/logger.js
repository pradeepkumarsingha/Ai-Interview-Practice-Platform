// utils/logger.js
// Centralized logging utility for production debugging

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || 'info'];

const colorize = (level, message) => {
  const colors = {
    error: '\x1b[31m', // Red
    warn: '\x1b[33m',  // Yellow
    info: '\x1b[36m',  // Cyan
    debug: '\x1b[35m', // Magenta
  };
  const reset = '\x1b[0m';
  return `${colors[level] || ''}[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}${reset}`;
};

export const logger = {
  error: (message, error = null) => {
    if (LOG_LEVELS.error <= currentLevel) {
      console.error(colorize('error', message), error);
    }
  },
  warn: (message) => {
    if (LOG_LEVELS.warn <= currentLevel) {
      console.warn(colorize('warn', message));
    }
  },
  info: (message) => {
    if (LOG_LEVELS.info <= currentLevel) {
      console.log(colorize('info', message));
    }
  },
  debug: (message, data = null) => {
    if (LOG_LEVELS.debug <= currentLevel) {
      console.log(colorize('debug', message), data || '');
    }
  },
};

export default logger;
