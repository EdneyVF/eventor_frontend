// API URL from environment or default
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Other application constants
export const APP_NAME = 'Eventor';
export const DEFAULT_PAGINATION_LIMIT = 10;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Time constants
export const TOKEN_EXPIRY_WARNING = 5 * 60 * 1000; // 5 minutes in milliseconds 