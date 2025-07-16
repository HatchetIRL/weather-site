/**
 * @fileoverview Error handling utilities for the Top Riders feature
 * Provides centralized error handling and user feedback mechanisms
 */

import { ERROR_MESSAGES } from './constants.js';

/**
 * Centralized error handler for the Top Riders feature
 */
class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 50;
    }

    /**
     * Handle and log an error
     * @param {Error} error - The error that occurred
     * @param {string} context - Context where the error occurred
     * @param {Object} [metadata] - Additional metadata about the error
     * @returns {string} User-friendly error message
     */
    handleError(error, context, metadata = {}) {
        // Log the error
        const errorEntry = {
            timestamp: new Date(),
            error: error,
            context: context,
            metadata: metadata,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.logError(errorEntry);

        // Determine user-friendly message
        const userMessage = this.getUserMessage(error, context);

        // Dispatch error event for other components to handle
        this.dispatchErrorEvent(error, userMessage, context);

        return userMessage;
    }

    /**
     * Log error to internal log
     * @param {Object} errorEntry - Error entry to log
     */
    logError(errorEntry) {
        this.errorLog.unshift(errorEntry);
        
        // Keep log size manageable
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(0, this.maxLogSize);
        }

        // Also log to console for debugging
        console.error(`[TopRiders:${errorEntry.context}]`, errorEntry.error, errorEntry.metadata);
    }

    /**
     * Get user-friendly error message
     * @param {Error} error - The error
     * @param {string} context - Error context
     * @returns {string} User-friendly message
     */
    getUserMessage(error, context) {
        // Network-related errors
        if (this.isNetworkError(error)) {
            return ERROR_MESSAGES.NETWORK_ERROR;
        }

        // Data parsing errors
        if (this.isParsingError(error, context)) {
            return ERROR_MESSAGES.PARSE_ERROR;
        }

        // No data errors
        if (this.isNoDataError(error, context)) {
            return ERROR_MESSAGES.NO_DATA;
        }

        // Default generic error
        return ERROR_MESSAGES.GENERIC_ERROR;
    }

    /**
     * Check if error is network-related
     * @param {Error} error - Error to check
     * @returns {boolean} True if network error
     */
    isNetworkError(error) {
        const networkKeywords = ['network', 'fetch', 'timeout', 'cors', 'connection', 'offline'];
        const errorMessage = error.message.toLowerCase();
        
        return networkKeywords.some(keyword => errorMessage.includes(keyword)) ||
               error.name === 'TypeError' && errorMessage.includes('failed to fetch') ||
               error.name === 'AbortError';
    }

    /**
     * Check if error is parsing-related
     * @param {Error} error - Error to check
     * @param {string} context - Error context
     * @returns {boolean} True if parsing error
     */
    isParsingError(error, context) {
        const parsingKeywords = ['parse', 'json', 'csv', 'invalid', 'malformed'];
        const errorMessage = error.message.toLowerCase();
        
        return parsingKeywords.some(keyword => errorMessage.includes(keyword)) ||
               context.includes('parse') ||
               context.includes('extract');
    }

    /**
     * Check if error indicates no data available
     * @param {Error} error - Error to check
     * @param {string} context - Error context
     * @returns {boolean} True if no data error
     */
    isNoDataError(error, context) {
        const noDataKeywords = ['no data', 'empty', 'not found', '404'];
        const errorMessage = error.message.toLowerCase();
        
        return noDataKeywords.some(keyword => errorMessage.includes(keyword)) ||
               context.includes('empty') ||
               context.includes('no data');
    }

    /**
     * Dispatch custom error event
     * @param {Error} error - Original error
     * @param {string} userMessage - User-friendly message
     * @param {string} context - Error context
     */
    dispatchErrorEvent(error, userMessage, context) {
        const errorEvent = new CustomEvent('topRidersError', {
            detail: {
                error: error,
                userMessage: userMessage,
                context: context,
                timestamp: new Date(),
                canRetry: this.canRetry(error, context)
            }
        });

        document.dispatchEvent(errorEvent);
    }

    /**
     * Determine if error is retryable
     * @param {Error} error - Error to check
     * @param {string} context - Error context
     * @returns {boolean} True if retryable
     */
    canRetry(error, context) {
        // Network errors are usually retryable
        if (this.isNetworkError(error)) {
            return true;
        }

        // Temporary server errors are retryable
        if (error.message.includes('5') && error.message.includes('server')) {
            return true;
        }

        // Timeout errors are retryable
        if (error.message.includes('timeout')) {
            return true;
        }

        // Parsing errors are usually not retryable without data changes
        if (this.isParsingError(error, context)) {
            return false;
        }

        // Default to retryable for unknown errors
        return true;
    }

    /**
     * Get recent error log
     * @param {number} [count=10] - Number of recent errors to return
     * @returns {Object[]} Recent error entries
     */
    getRecentErrors(count = 10) {
        return this.errorLog.slice(0, count);
    }

    /**
     * Clear error log
     */
    clearErrorLog() {
        this.errorLog = [];
    }

    /**
     * Get error statistics
     * @returns {Object} Error statistics
     */
    getErrorStats() {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const recentErrors = this.errorLog.filter(entry => entry.timestamp > oneHourAgo);
        const dailyErrors = this.errorLog.filter(entry => entry.timestamp > oneDayAgo);

        const errorTypes = {};
        this.errorLog.forEach(entry => {
            const type = entry.context || 'unknown';
            errorTypes[type] = (errorTypes[type] || 0) + 1;
        });

        return {
            totalErrors: this.errorLog.length,
            recentErrors: recentErrors.length,
            dailyErrors: dailyErrors.length,
            errorTypes: errorTypes,
            lastError: this.errorLog[0] || null
        };
    }

    /**
     * Check if system is experiencing issues
     * @returns {boolean} True if system appears to be having issues
     */
    isSystemUnhealthy() {
        const stats = this.getErrorStats();
        
        // Consider unhealthy if more than 5 errors in the last hour
        return stats.recentErrors > 5;
    }

    /**
     * Get health status message
     * @returns {string} Health status message
     */
    getHealthStatus() {
        if (this.isSystemUnhealthy()) {
            return 'The system is experiencing issues. Some features may not work properly.';
        }
        
        const stats = this.getErrorStats();
        if (stats.totalErrors === 0) {
            return 'System is running normally.';
        }
        
        return `System is mostly stable. ${stats.dailyErrors} errors in the last 24 hours.`;
    }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

export { ErrorHandler, errorHandler };