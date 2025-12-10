import { Article } from "./articles";
import { getSentimentLabel } from "./articles";

export interface Insight {
    type: 'trend' | 'anomaly' | 'comparison' | 'summary' | 'sentiment';
    title: string;
    description: string;
    confidence: number;
    relatedArticles: number[];
    iconName?: string; // Lucide icon name instead of emoji
}

/**
 * Generate insights from a collection of articles
 */
export const generateInsights = (articles: Article[]): Insight[] => {
    if (articles.length === 0) return [];

    const insights: Insight[] = [];

    // Trend detection
    insights.push(...detectCategoryTrends(articles));

    // Sentiment analysis
    insights.push(...analyzeSentimentPatterns(articles));

    // Source diversity
    insights.push(...analyzeSourceDiversity(articles));

    // Breaking news detection
    insights.push(...detectBreakingNews(articles));

    // Sort by confidence
    return insights.sort((a, b) => b.confidence - a.confidence);
};

/**
 * Detect category trends
 */
const detectCategoryTrends = (articles: Article[]): Insight[] => {
    const insights: Insight[] = [];

    // Count articles by category
    const categoryCounts: Record<string, number> = {};
    articles.forEach(article => {
        categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
    });

    const total = articles.length;
    const sorted = Object.entries(categoryCounts)
        .sort(([, a], [, b]) => b - a);

    if (sorted.length > 0) {
        const [topCategory, count] = sorted[0];
        const percentage = Math.round((count / total) * 100);

        if (percentage > 25) {
            insights.push({
                type: 'trend',
                title: `${topCategory} Dominates Coverage`,
                description: `${percentage}% of articles (${count}/${total}) are about ${topCategory}`,
                confidence: 0.9,
                relatedArticles: articles
                    .filter(a => a.category === topCategory)
                    .map(a => a.id)
                    .slice(0, 5),
                iconName: 'TrendingUp'
            });
        }
    }

    return insights;
};

/**
 * Analyze sentiment patterns
 */
const analyzeSentimentPatterns = (articles: Article[]): Insight[] => {
    const insights: Insight[] = [];

    // Calculate average sentiment
    const avgSentiment = articles.reduce((sum, a) => sum + a.sentiment.compound, 0) / articles.length;

    // Count sentiment distribution
    const positive = articles.filter(a => a.sentiment.compound > 0.05).length;
    const negative = articles.filter(a => a.sentiment.compound < -0.05).length;
    const neutral = articles.length - positive - negative;

    const posPercent = Math.round((positive / articles.length) * 100);
    const negPercent = Math.round((negative / articles.length) * 100);

    // Detect sentiment skew
    if (posPercent > 60) {
        insights.push({
            type: 'sentiment',
            title: 'Predominantly Positive Coverage',
            description: `${posPercent}% of articles have positive sentiment`,
            confidence: 0.85,
            relatedArticles: articles
                .filter(a => a.sentiment.compound > 0.05)
                .sort((a, b) => b.sentiment.compound - a.sentiment.compound)
                .map(a => a.id)
                .slice(0, 5),
            iconName: 'Smile'
        });
    } else if (negPercent > 60) {
        insights.push({
            type: 'sentiment',
            title: 'Predominantly Negative Coverage',
            description: `${negPercent}% of articles have negative sentiment`,
            confidence: 0.85,
            relatedArticles: articles
                .filter(a => a.sentiment.compound < -0.05)
                .sort((a, b) => a.sentiment.compound - b.sentiment.compound)
                .map(a => a.id)
                .slice(0, 5),
            iconName: 'Frown'
        });
    } else if (Math.abs(avgSentiment) < 0.05) {
        insights.push({
            type: 'sentiment',
            title: 'Balanced Sentiment Coverage',
            description: `Sentiment is evenly distributed: ${posPercent}% positive, ${negPercent}% negative, ${Math.round((neutral / articles.length) * 100)}% neutral`,
            confidence: 0.75,
            relatedArticles: articles.map(a => a.id).slice(0, 5),
            iconName: 'Scale'
        });
    }

    return insights;
};

/**
 * Analyze source diversity
 */
const analyzeSourceDiversity = (articles: Article[]): Insight[] => {
    const insights: Insight[] = [];

    // Count unique publishers
    const publishers = new Set(articles.map(a => a.publisher).filter(Boolean));
    const uniqueCount = publishers.size;

    if (uniqueCount > 10) {
        insights.push({
            type: 'comparison',
            title: 'High Source Diversity',
            description: `Coverage from ${uniqueCount} different publishers`,
            confidence: 0.8,
            relatedArticles: articles.map(a => a.id).slice(0, 5),
            iconName: 'Globe'
        });
    } else if (uniqueCount < 3) {
        insights.push({
            type: 'anomaly',
            title: 'Limited Source Diversity',
            description: `Only ${uniqueCount} publisher${uniqueCount !== 1 ? 's' : ''} represented`,
            confidence: 0.7,
            relatedArticles: articles.map(a => a.id).slice(0, 5),
            iconName: 'AlertTriangle'
        });
    }

    return insights;
};

/**
 * Detect breaking news patterns
 */
const detectBreakingNews = (articles: Article[]): Insight[] => {
    const insights: Insight[] = [];

    const breakingCount = articles.filter(a => a.isBreaking).length;

    if (breakingCount > 0) {
        insights.push({
            type: 'anomaly',
            title: 'Breaking News Alert',
            description: `${breakingCount} breaking news ${breakingCount !== 1 ? 'stories' : 'story'} detected`,
            confidence: 0.95,
            relatedArticles: articles
                .filter(a => a.isBreaking)
                .map(a => a.id),
            iconName: 'AlertCircle'
        });
    }

    // Detect clustering (multiple sources covering same story)
    const clustered = articles.filter(a => (a.clusteredSources || 0) > 3);
    if (clustered.length > 0) {
        const topStory = clustered.sort((a, b) => (b.clusteredSources || 0) - (a.clusteredSources || 0))[0];
        insights.push({
            type: 'trend',
            title: 'Major Story Developing',
            description: `${topStory.clusteredSources} sources covering the same story`,
            confidence: 0.9,
            relatedArticles: [topStory.id],
            iconName: 'Newspaper'
        });
    }

    return insights;
};

/**
 * Detect emerging topics (keywords appearing frequently)
 */
export const detectEmergingTopics = (articles: Article[]): Array<{ topic: string; count: number; trend: 'rising' | 'stable' }> => {
    // Extract common words from article content
    const wordCounts: Record<string, number> = {};
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their']);

    articles.forEach(article => {
        const words = article.content
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 4 && !stopWords.has(word));

        words.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });
    });

    // Get top topics
    const topics = Object.entries(wordCounts)
        .filter(([, count]) => count > 3)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([topic, count]) => ({
            topic,
            count,
            trend: 'rising' as const // Would need historical data to determine actual trend
        }));

    return topics;
};
