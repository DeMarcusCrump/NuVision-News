import { Article } from './articles';

/**
 * Calculate novelty score based on article recency
 * Score represents % of articles from last 24 hours
 */
export const calculateNoveltyScore = (articles: Article[]): number => {
    if (articles.length === 0) return 0;

    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    const recentArticles = articles.filter(article => {
        if (!article.date) return false;
        const articleDate = new Date(article.date).getTime();
        return articleDate >= oneDayAgo;
    });

    return Math.round((recentArticles.length / articles.length) * 100);
};

/**
 * Calculate diversity score based on unique publishers and categories
 * Combines publisher diversity (70%) and category diversity (30%)
 */
export const calculateDiversityScore = (articles: Article[]): number => {
    if (articles.length === 0) return 0;

    // Publisher diversity (0-100)
    const publishers = new Set(articles.map(a => a.publisher).filter(Boolean));
    const publisherScore = Math.min(100, publishers.size * 6.67); // 15 publishers = 100

    // Category diversity (0-100)
    const categories = new Set(articles.map(a => a.category));
    const categoryScore = Math.min(100, categories.size * 10); // 10 categories = 100

    // Weighted combination
    return Math.round(publisherScore * 0.7 + categoryScore * 0.3);
};

/**
 * Calculate overall brief quality score
 * Combines novelty and diversity with equal weight
 */
export const calculateBriefScore = (articles: Article[]): {
    noveltyScore: number;
    diversityScore: number;
    overallScore: number;
} => {
    const noveltyScore = calculateNoveltyScore(articles);
    const diversityScore = calculateDiversityScore(articles);
    const overallScore = Math.round((noveltyScore + diversityScore) / 2);

    return {
        noveltyScore,
        diversityScore,
        overallScore
    };
};
