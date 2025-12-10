import { Article } from "./articles";

const STORAGE_KEY = 'nv_uploaded_articles';

/**
 * Save uploaded articles to localStorage
 */
export const saveUploadedArticles = (articles: Article[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
    } catch (error) {
        console.error('Failed to save uploaded articles:', error);
    }
};

/**
 * Load uploaded articles from localStorage
 */
export const loadUploadedArticles = (): Article[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to load uploaded articles:', error);
        return [];
    }
};

/**
 * Add a single uploaded article
 */
export const addUploadedArticle = (article: Article): void => {
    const existing = loadUploadedArticles();
    saveUploadedArticles([...existing, article]);
};

/**
 * Add multiple uploaded articles
 */
export const addUploadedArticles = (articles: Article[]): void => {
    const existing = loadUploadedArticles();
    saveUploadedArticles([...existing, ...articles]);
};

/**
 * Delete an uploaded article by ID
 */
export const deleteUploadedArticle = (id: number): void => {
    const existing = loadUploadedArticles();
    saveUploadedArticles(existing.filter(a => a.id !== id));
};

/**
 * Clear all uploaded articles
 */
export const clearUploadedArticles = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};

/**
 * Check if an article is user-uploaded
 */
export const isUploadedArticle = (articleId: number): boolean => {
    const uploaded = loadUploadedArticles();
    return uploaded.some(a => a.id === articleId);
};
