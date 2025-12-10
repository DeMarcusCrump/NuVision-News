import { Article } from "./articles";
import { extractKeywords } from "./tfidfAnalysis";

export interface Topic {
    name: string;
    count: number;
    articles: Article[];
    trend: 'rising' | 'stable' | 'falling';
    velocity: number; // Rate of change
    keywords: string[];
}

export interface TopicTrend {
    topic: string;
    currentCount: number;
    previousCount: number;
    percentageChange: number;
    trend: 'rising' | 'stable' | 'falling';
}

/**
 * Discover topics from articles using keyword extraction and clustering
 */
export const discoverTopics = (articles: Article[], minArticles: number = 3): Topic[] => {
    if (articles.length === 0) return [];

    // Extract keywords from all articles
    const articleKeywords: Map<Article, string[]> = new Map();

    articles.forEach(article => {
        const keywords = extractKeywords(
            article.content,
            articles.map(a => a.content),
            10
        ).map(k => k.toLowerCase());
        articleKeywords.set(article, keywords);
    });

    // Count keyword frequencies across all articles
    const keywordFrequency: Map<string, Set<Article>> = new Map();

    articleKeywords.forEach((keywords, article) => {
        keywords.forEach(keyword => {
            if (!keywordFrequency.has(keyword)) {
                keywordFrequency.set(keyword, new Set());
            }
            keywordFrequency.get(keyword)!.add(article);
        });
    });

    // Filter keywords that appear in multiple articles
    const significantKeywords = Array.from(keywordFrequency.entries())
        .filter(([, articles]) => articles.size >= minArticles)
        .sort((a, b) => b[1].size - a[1].size);

    // Create topics from significant keywords
    const topics: Topic[] = significantKeywords.slice(0, 20).map(([keyword, relatedArticles]) => {
        const articlesArray = Array.from(relatedArticles);

        // Get related keywords (keywords that frequently appear with this one)
        const relatedKeywords = new Set<string>();
        articlesArray.forEach(article => {
            const keywords = articleKeywords.get(article) || [];
            keywords.forEach(k => {
                if (k !== keyword) relatedKeywords.add(k);
            });
        });

        return {
            name: keyword,
            count: articlesArray.length,
            articles: articlesArray,
            trend: 'stable' as const,
            velocity: 0,
            keywords: Array.from(relatedKeywords).slice(0, 5)
        };
    });

    return topics;
};

/**
 * Analyze topic trends by comparing current vs previous time periods
 */
export const analyzeTopicTrends = (
    currentArticles: Article[],
    previousArticles: Article[]
): TopicTrend[] => {
    const currentTopics = discoverTopics(currentArticles);
    const previousTopics = discoverTopics(previousArticles);

    const trends: TopicTrend[] = [];

    currentTopics.forEach(currentTopic => {
        const previousTopic = previousTopics.find(t => t.name === currentTopic.name);
        const previousCount = previousTopic?.count || 0;
        const currentCount = currentTopic.count;

        const percentageChange = previousCount > 0
            ? ((currentCount - previousCount) / previousCount) * 100
            : 100; // If new topic, 100% increase

        let trend: 'rising' | 'stable' | 'falling';
        if (percentageChange > 20) trend = 'rising';
        else if (percentageChange < -20) trend = 'falling';
        else trend = 'stable';

        trends.push({
            topic: currentTopic.name,
            currentCount,
            previousCount,
            percentageChange,
            trend
        });
    });

    return trends.sort((a, b) => Math.abs(b.percentageChange) - Math.abs(a.percentageChange));
};

/**
 * Get emerging topics (topics with high velocity)
 */
export const getEmergingTopics = (articles: Article[]): Topic[] => {
    // Split articles by date to compare recent vs older
    const sortedArticles = [...articles].sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return dateB - dateA;
    });

    const midpoint = Math.floor(sortedArticles.length / 2);
    const recentArticles = sortedArticles.slice(0, midpoint);
    const olderArticles = sortedArticles.slice(midpoint);

    const trends = analyzeTopicTrends(recentArticles, olderArticles);
    const topics = discoverTopics(articles);

    // Enrich topics with trend data
    return topics.map(topic => {
        const trendData = trends.find(t => t.topic === topic.name);
        return {
            ...topic,
            trend: trendData?.trend || 'stable',
            velocity: trendData?.percentageChange || 0
        };
    }).sort((a, b) => Math.abs(b.velocity) - Math.abs(a.velocity));
};

/**
 * Get topics by category
 */
export const getTopicsByCategory = (articles: Article[]): Map<string, Topic[]> => {
    const categoryMap = new Map<string, Topic[]>();

    // Group articles by category
    const articlesByCategory = new Map<string, Article[]>();
    articles.forEach(article => {
        if (!articlesByCategory.has(article.category)) {
            articlesByCategory.set(article.category, []);
        }
        articlesByCategory.get(article.category)!.push(article);
    });

    // Discover topics for each category
    articlesByCategory.forEach((categoryArticles, category) => {
        const topics = discoverTopics(categoryArticles, 2); // Lower threshold for categories
        categoryMap.set(category, topics);
    });

    return categoryMap;
};

/**
 * Find related topics based on article overlap
 */
export const findRelatedTopics = (topic: Topic, allTopics: Topic[]): Topic[] => {
    const topicArticleIds = new Set(topic.articles.map(a => a.id));

    return allTopics
        .filter(t => t.name !== topic.name)
        .map(t => {
            const overlap = t.articles.filter(a => topicArticleIds.has(a.id)).length;
            return { topic: t, overlap };
        })
        .filter(({ overlap }) => overlap > 0)
        .sort((a, b) => b.overlap - a.overlap)
        .slice(0, 5)
        .map(({ topic }) => topic);
};
