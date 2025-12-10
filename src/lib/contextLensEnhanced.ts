import { Article, ContextLens } from './articles';
import { getContextLensDescription } from './contextLensFilter';

/**
 * Enhanced context lens filtering with visual feedback
 * Returns filtered articles and a description of what changed
 */
export const applyContextLensEnhanced = (
    articles: Article[],
    lens: ContextLens
): { articles: Article[]; description: string; changeCount: number } => {
    if (lens === 'none') {
        return {
            articles,
            description: 'Showing all articles in default order',
            changeCount: 0
        };
    }

    let sortedArticles: Article[] = [];
    let description = '';

    switch (lens) {
        case 'beginner':
            // Prioritize simpler, shorter articles
            sortedArticles = [...articles].sort((a, b) => {
                const aLength = a.content.length;
                const bLength = b.content.length;
                return aLength - bLength; // Shorter first
            });
            description = '📚 Showing simpler articles first (shorter content)';
            break;

        case 'student':
            // Prioritize educational content
            sortedArticles = [...articles].sort((a, b) => {
                const educationalCategories = ['Science', 'Technology', 'Health', 'Environment'];
                const aScore = educationalCategories.includes(a.category) ? 1 : 0;
                const bScore = educationalCategories.includes(b.category) ? 1 : 0;
                return bScore - aScore;
            });
            description = '🎓 Prioritizing Science, Technology, and Health articles';
            break;

        case 'analyst':
            // Prioritize data-rich, analytical content
            sortedArticles = [...articles].sort((a, b) => {
                const analyticalCategories = ['Business', 'Politics', 'Technology', 'World News'];
                const aScore = analyticalCategories.includes(a.category) ? 1 : 0;
                const bScore = analyticalCategories.includes(b.category) ? 1 : 0;
                return bScore - aScore;
            });
            description = '📊 Prioritizing Business, Politics, and analytical content';
            break;

        case 'executive':
            // Prioritize high-level summaries and key insights
            sortedArticles = [...articles].sort((a, b) => {
                const executiveCategories = ['Business', 'Politics', 'World News'];
                const aScore = executiveCategories.includes(a.category) ? 1 : 0;
                const bScore = executiveCategories.includes(b.category) ? 1 : 0;

                // Also factor in recency
                const aDate = a.date ? new Date(a.date).getTime() : 0;
                const bDate = b.date ? new Date(b.date).getTime() : 0;

                if (aScore !== bScore) return bScore - aScore;
                return bDate - aDate; // More recent first
            });
            description = '💼 Showing recent high-impact Business and Politics news';
            break;

        default:
            sortedArticles = articles;
            description = 'Showing all articles';
    }

    // Count how many articles changed position
    let changeCount = 0;
    for (let i = 0; i < Math.min(articles.length, sortedArticles.length); i++) {
        if (articles[i].id !== sortedArticles[i].id) {
            changeCount++;
        }
    }

    return {
        articles: sortedArticles,
        description,
        changeCount
    };
};
