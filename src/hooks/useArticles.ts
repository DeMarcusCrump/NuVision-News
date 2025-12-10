import { useState, useEffect } from 'react';
import { Article, enrichArticleMetadata } from '@/lib/articles';
import { loadUploadedArticles } from '@/lib/uploadedArticles';
import { fetchLiveNewsCached } from '@/lib/newsApi';
import { loadAPIKeys } from '@/lib/apiKeyManager';

export interface UseArticlesResult {
    articles: Article[];
    isLoading: boolean;
    error: string | null;
    hasApiKey: boolean;
    refresh: () => Promise<void>;
}

/**
 * Shared hook for loading articles across all pages
 * Automatically loads from NewsAPI if key is configured
 * Falls back to uploaded articles
 */
export const useArticles = (): UseArticlesResult => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasApiKey, setHasApiKey] = useState(false);

    const loadArticles = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Check for API key in both env and localStorage
            const keys = loadAPIKeys();
            const envKey = import.meta.env.VITE_NEWSAPI_KEY;
            const hasKey = !!(envKey || keys.newsApiKey);
            setHasApiKey(hasKey);

            let allArticles: Article[] = [];

            // Load uploaded articles first
            const uploaded = loadUploadedArticles();
            allArticles = [...uploaded];

            // Try to load live news if API key exists
            if (hasKey) {
                try {
                    const liveNews = await fetchLiveNewsCached(undefined, undefined, 100);
                    allArticles = [...allArticles, ...liveNews];
                } catch (err) {
                    console.error('Failed to load live news:', err);
                    setError('Failed to load live news. Check your API key in Settings.');
                }
            }

            // Enrich all articles with metadata
            const enriched = enrichArticleMetadata(allArticles);
            setArticles(enriched);
        } catch (err) {
            console.error('Failed to load articles:', err);
            setError('Failed to load articles');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadArticles();
    }, []);

    return {
        articles,
        isLoading,
        error,
        hasApiKey,
        refresh: loadArticles
    };
};
