import { Article } from './articles';

/**
 * Apply context lens filtering to articles
 * Adjusts content complexity and presentation based on user expertise level
 */
export const applyContextLens = (
    articles: Article[],
    lens: 'none' | 'beginner' | 'student' | 'analyst' | 'executive'
): Article[] => {
    if (lens === 'none') return articles;

    // For now, return articles sorted by relevance to lens type
    // In the future, this could modify article presentation, summaries, etc.

    switch (lens) {
        case 'beginner':
            // Prioritize simpler, more explanatory articles
            // Favor articles with lower complexity (shorter, clearer)
            return [...articles].sort((a, b) => {
                const aLength = a.content.length;
                const bLength = b.content.length;
                return aLength - bLength; // Shorter first
            });

        case 'student':
            // Prioritize educational content
            // Favor Science, Technology, Health categories
            return [...articles].sort((a, b) => {
                const educationalCategories = ['Science', 'Technology', 'Health', 'Environment'];
                const aScore = educationalCategories.includes(a.category) ? 1 : 0;
                const bScore = educationalCategories.includes(b.category) ? 1 : 0;
                return bScore - aScore;
            });

        case 'analyst':
            // Prioritize data-rich, analytical content
            // Favor Business, Politics, Technology
            return [...articles].sort((a, b) => {
                const analyticalCategories = ['Business', 'Politics', 'Technology', 'World News'];
                const aScore = analyticalCategories.includes(a.category) ? 1 : 0;
                const bScore = analyticalCategories.includes(b.category) ? 1 : 0;
                return bScore - aScore;
            });

        case 'executive':
            // Prioritize high-level summaries and key insights
            // Favor recent, high-impact news
            return [...articles].sort((a, b) => {
                const executiveCategories = ['Business', 'Politics', 'World News'];
                const aScore = executiveCategories.includes(a.category) ? 1 : 0;
                const bScore = executiveCategories.includes(b.category) ? 1 : 0;

                // Also factor in recency
                const aDate = a.date ? new Date(a.date).getTime() : 0;
                const bDate = b.date ? new Date(b.date).getTime() : 0;

                if (aScore !== bScore) return bScore - aScore;
                return bDate - aDate; // More recent first
            });

        default:
            return articles;
    }
};

/**
 * Get description of what context lens does
 */
export const getContextLensDescription = (
    lens: 'none' | 'beginner' | 'student' | 'analyst' | 'executive'
): string => {
    switch (lens) {
        case 'beginner':
            return 'Prioritizes simpler, more explanatory articles';
        case 'student':
            return 'Focuses on educational content (Science, Technology, Health)';
        case 'analyst':
            return 'Emphasizes data-rich, analytical content (Business, Politics)';
        case 'executive':
            return 'Highlights high-level summaries and key insights';
        case 'none':
        default:
            return 'No filtering applied';
    }
};
