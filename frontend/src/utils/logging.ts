// logging.ts - Centralized logging utility with tracking IDs
import { v4 as uuidv4 } from 'uuid';

// Interface for log entries
interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  correlationId: string;
  context?: Record<string, any> | undefined;
  error?: any;
}

// Global correlation ID for tracking requests across the app
let globalCorrelationId: string | null = null;

// Get or create a correlation ID
export const getOrCreateCorrelationId = (): string => {
  if (!globalCorrelationId) {
    globalCorrelationId = `corr-${Date.now()}-${uuidv4().slice(0, 8)}`;
  }
  return globalCorrelationId;
};

// Reset the global correlation ID (e.g., when starting a new session)
export const resetCorrelationId = (): void => {
  globalCorrelationId = null;
};

// Generate a new correlation ID for a specific operation
export const generateCorrelationId = (): string => {
  return `corr-${Date.now()}-${uuidv4().slice(0, 8)}`;
};

// Format log entry for console output
const formatLogEntry = (entry: LogEntry): string => {
  const { timestamp, level, message, correlationId, context, error } = entry;
  
  let formattedMessage = `[${timestamp}] [${level.toUpperCase()}] [${correlationId}] ${message}`;
  
  if (context) {
    formattedMessage += ` | Context: ${JSON.stringify(context)}`;
  }
  
  if (error) {
    formattedMessage += ` | Error: ${error instanceof Error ? error.message : String(error)}`;
  }
  
  return formattedMessage;
};

// Console logger implementation
const consoleLogger = {
  log(entry: LogEntry): void {
    const formattedMessage = formatLogEntry(entry);
    
    switch (entry.level) {
      case 'error':
        console.error(formattedMessage);
        if (entry.error) {
          console.error('Full error:', entry.error);
        }
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'debug':
        console.debug(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
  }
};

// Main logging function
export const log = (
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  context?: Record<string, any>,
  error?: any
): void => {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    correlationId: getOrCreateCorrelationId(),
    context,
    error
  };

  // Send to console logger
  consoleLogger.log(logEntry);
  
  // In a real app, you might also want to send logs to a remote service
  // sendToRemoteLoggingService(logEntry);
};

// Specific log level functions
export const debug = (message: string, context?: Record<string, any>): void => {
  log('debug', message, context);
};

export const info = (message: string, context?: Record<string, any>): void => {
  log('info', message, context);
};

export const warn = (message: string, context?: Record<string, any>): void => {
  log('warn', message, context);
};

export const error = (message: string, context?: Record<string, any>, errorObj?: any): void => {
  log('error', message, context, errorObj);
};

// Enhanced error logging with stack trace
export const logError = (error: Error | string, context?: Record<string, any>): void => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorObject = typeof error === 'string' ? new Error(error) : error;
  
  log('error', errorMessage, context, errorObject);
};

// Log an API call with timing
export const logApiCall = (
  method: string,
  url: string,
  startTime: number,
  status?: number,
  error?: any
): void => {
  const duration = Date.now() - startTime;
  const level = error ? 'error' : status && status >= 400 ? 'warn' : 'info';
  
  const message = error 
    ? `API Call Failed: ${method} ${url}`
    : status 
    ? `API Call Completed: ${method} ${url} (${status})`
    : `API Call Started: ${method} ${url}`;
  
  log(level, message, {
    method,
    url,
    duration: `${duration}ms`,
    status,
    correlationId: getOrCreateCorrelationId()
  }, error);
};

// Log a user action
export const logUserAction = (action: string, context?: Record<string, any>): void => {
  log('info', `User Action: ${action}`, {
    action,
    ...context,
    correlationId: getOrCreateCorrelationId()
  });
};

// Log a system event
export const logSystemEvent = (event: string, context?: Record<string, any>): void => {
  log('info', `System Event: ${event}`, {
    event,
    ...context,
    correlationId: getOrCreateCorrelationId()
  });
};

export default {
  log,
  debug,
  info,
  warn,
  error,
  logError,
  logApiCall,
  logUserAction,
  logSystemEvent,
  getOrCreateCorrelationId,
  resetCorrelationId,
  generateCorrelationId
};