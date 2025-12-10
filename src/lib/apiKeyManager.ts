/**
 * API Key Manager - Handles storage and retrieval of API keys
 * Keys are stored in localStorage for persistence
 */

const NEWSAPI_KEY = 'nuvision_newsapi_key';
const HF_API_KEY = 'nuvision_hf_api_key';

export interface APIKeys {
    newsApiKey: string;
    huggingFaceKey: string;
}

/**
 * Save API keys to localStorage
 */
export const saveAPIKeys = (keys: APIKeys): void => {
    if (keys.newsApiKey) {
        localStorage.setItem(NEWSAPI_KEY, keys.newsApiKey);
    }
    if (keys.huggingFaceKey) {
        localStorage.setItem(HF_API_KEY, keys.huggingFaceKey);
    }
};

/**
 * Load API keys from localStorage
 */
export const loadAPIKeys = (): APIKeys => {
    const newsApiKey = localStorage.getItem(NEWSAPI_KEY) || '';
    const huggingFaceKey = localStorage.getItem(HF_API_KEY) || '';

    return {
        newsApiKey,
        huggingFaceKey
    };
};

/**
 * Clear all API keys
 */
export const clearAPIKeys = (): void => {
    localStorage.removeItem(NEWSAPI_KEY);
    localStorage.removeItem(HF_API_KEY);
};

/**
 * Check if NewsAPI key is configured
 */
export const hasNewsAPIKey = (): boolean => {
    return !!(import.meta.env.VITE_NEWSAPI_KEY || localStorage.getItem(NEWSAPI_KEY));
};

/**
 * Get current NewsAPI key
 */
export const getNewsAPIKey = (): string => {
    return import.meta.env.VITE_NEWSAPI_KEY || localStorage.getItem(NEWSAPI_KEY) || '';
};

/**
 * Validate NewsAPI key format
 */
export const validateNewsAPIKey = (key: string): boolean => {
    // NewsAPI keys are 32 character alphanumeric strings
    return /^[a-f0-9]{32}$/i.test(key);
};

/**
 * Test NewsAPI key by making a request
 */
export const testNewsAPIKey = async (key: string): Promise<boolean> => {
    try {
        const response = await fetch(
            `https://newsapi.org/v2/top-headlines?country=us&pageSize=1&apiKey=${key}`
        );
        return response.ok;
    } catch {
        return false;
    }
};
