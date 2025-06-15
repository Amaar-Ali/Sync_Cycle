/**
 * Utility functions for controlling console logging
 */

// Set to false to disable all console logs
const ENABLE_LOGS = false;

// Original console methods
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
};

// Silent logger functions that do nothing
const silentLogger = {
  log: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};

/**
 * Initialize the logger by overriding console methods if logs are disabled
 */
export const initializeLogger = () => {
  if (!ENABLE_LOGS) {
    // Override console methods with silent versions
    console.log = silentLogger.log;
    console.info = silentLogger.info;
    console.warn = silentLogger.warn;
    console.error = silentLogger.error;
    console.debug = silentLogger.debug;
  }
};

/**
 * Restore the original console methods
 */
export const restoreConsole = () => {
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.debug = originalConsole.debug;
};

/**
 * Safe logger that respects the ENABLE_LOGS setting
 */
export const logger = {
  log: (...args: any[]) => {
    if (ENABLE_LOGS) originalConsole.log(...args);
  },
  info: (...args: any[]) => {
    if (ENABLE_LOGS) originalConsole.info(...args);
  },
  warn: (...args: any[]) => {
    if (ENABLE_LOGS) originalConsole.warn(...args);
  },
  error: (...args: any[]) => {
    if (ENABLE_LOGS) originalConsole.error(...args);
  },
  debug: (...args: any[]) => {
    if (ENABLE_LOGS) originalConsole.debug(...args);
  },
};

// Initialize the logger immediately
initializeLogger();

// Export a default object for convenience
export default {
  initializeLogger,
  restoreConsole,
  logger,
}; 