import { Article } from "./articles";

export interface ParsedQuery {
    intent: 'search' | 'filter' | 'analyze' | 'compare' | 'summarize';
    filters: {
        sentiment?: 'positive' | 'negative' | 'neutral';
        categories?: string[];
        dateRange?: { start: Date; end: Date };
        sources?: string[];
        keywords?: string[];
    };
    action?: string;
    originalQuery: string;
}

// Sentiment keywords
const SENTIMENT_PATTERNS = {
    positive: ['positive', 'good', 'uplifting', 'optimistic', 'favorable', 'encouraging'],
    negative: ['negative', 'bad', 'concerning', 'pessimistic', 'unfavorable', 'worrying'],
    neutral: ['neutral', 'balanced', 'objective', 'unbiased']
};

// Category mappings
const CATEGORY_PATTERNS: Record<string, string[]> = {
    'Technology': ['tech', 'technology', 'software', 'ai', 'artificial intelligence', 'computer', 'digital'],
    'Politics': ['politics', 'political', 'election', 'government', 'policy', 'congress', 'president'],
    'Business': ['business', 'market', 'stock', 'economy', 'company', 'trade', 'finance', 'economic'],
    'Science': ['science', 'scientific', 'research', 'study', 'discovery'],
    'Health': ['health', 'medical', 'medicine', 'healthcare', 'disease', 'wellness'],
    'Sports': ['sports', 'game', 'team', 'player', 'championship', 'league'],
    'Entertainment': ['entertainment', 'movie', 'film', 'music', 'celebrity', 'show'],
    'World News': ['world', 'international', 'global', 'foreign'],
    'Environment': ['environment', 'climate', 'green', 'sustainability', 'pollution']
};

// Time patterns
const TIME_PATTERNS = {
    today: () => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return { start, end };
    },
    yesterday: () => {
        const start = new Date();
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        return { start, end };
    },
    'this week': () => {
        const start = new Date();
        start.setDate(start.getDate() - start.getDay());
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        return { start, end };
    },
    'last week': () => {
        const start = new Date();
        start.setDate(start.getDate() - start.getDay() - 7);
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setDate(end.getDate() - end.getDay() - 1);
        end.setHours(23, 59, 59, 999);
        return { start, end };
    },
    'this month': () => {
        const start = new Date();
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        return { start, end };
    },
    'last month': () => {
        const start = new Date();
        start.setMonth(start.getMonth() - 1);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
    }
};

/**
 * Parse a natural language query into structured filters
 */
export const parseQuery = (query: string): ParsedQuery => {
    const lowerQuery = query.toLowerCase();

    const parsed: ParsedQuery = {
        intent: detectIntent(lowerQuery),
        filters: {},
        originalQuery: query
    };

    // Extract sentiment
    parsed.filters.sentiment = extractSentiment(lowerQuery);

    // Extract categories
    parsed.filters.categories = extractCategories(lowerQuery);

    // Extract date range
    parsed.filters.dateRange = extractDateRange(lowerQuery);

    // Extract keywords (words not matching other patterns)
    parsed.filters.keywords = extractKeywords(lowerQuery);

    return parsed;
};

/**
 * Detect the user's intent
 */
const detectIntent = (query: string): ParsedQuery['intent'] => {
    if (query.includes('compare') || query.includes('versus') || query.includes('vs')) {
        return 'compare';
    }
    if (query.includes('analyze') || query.includes('analysis')) {
        return 'analyze';
    }
    if (query.includes('summarize') || query.includes('summary')) {
        return 'summarize';
    }
    if (query.includes('show') || query.includes('find') || query.includes('get')) {
        return 'filter';
    }
    return 'search';
};

/**
 * Extract sentiment from query
 */
const extractSentiment = (query: string): 'positive' | 'negative' | 'neutral' | undefined => {
    for (const [sentiment, keywords] of Object.entries(SENTIMENT_PATTERNS)) {
        if (keywords.some(keyword => query.includes(keyword))) {
            return sentiment as 'positive' | 'negative' | 'neutral';
        }
    }
    return undefined;
};

/**
 * Extract categories from query
 */
const extractCategories = (query: string): string[] => {
    const categories: string[] = [];

    for (const [category, keywords] of Object.entries(CATEGORY_PATTERNS)) {
        if (keywords.some(keyword => query.includes(keyword))) {
            categories.push(category);
        }
    }

    return categories;
};

/**
 * Extract date range from query
 */
const extractDateRange = (query: string): { start: Date; end: Date } | undefined => {
    for (const [pattern, getRange] of Object.entries(TIME_PATTERNS)) {
        if (query.includes(pattern)) {
            return getRange();
        }
    }

    // Check for "recent" or "latest"
    if (query.includes('recent') || query.includes('latest')) {
        const start = new Date();
        start.setDate(start.getDate() - 7); // Last 7 days
        return { start, end: new Date() };
    }

    return undefined;
};

/**
 * Extract keywords (words not matching other patterns)
 */
const extractKeywords = (query: string): string[] => {
    // Remove common words and pattern matches
    const stopWords = ['show', 'me', 'find', 'get', 'the', 'a', 'an', 'from', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'about'];
    const allPatternWords = [
        ...Object.values(SENTIMENT_PATTERNS).flat(),
        ...Object.values(CATEGORY_PATTERNS).flat(),
        ...Object.keys(TIME_PATTERNS).flatMap(p => p.split(' '))
    ];

    const words = query
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2)
        .filter(word => !stopWords.includes(word))
        .filter(word => !allPatternWords.includes(word));

    return [...new Set(words)]; // Remove duplicates
};

/**
 * Apply parsed filters to articles
 */
export const applyFilters = (articles: Article[], filters: ParsedQuery['filters']): Article[] => {
    let filtered = articles;

    // Sentiment filter
    if (filters.sentiment) {
        filtered = filtered.filter(article => {
            const compound = article.sentiment.compound;
            if (filters.sentiment === 'positive') return compound > 0.05;
            if (filters.sentiment === 'negative') return compound < -0.05;
            return Math.abs(compound) <= 0.05; // neutral
        });
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
        filtered = filtered.filter(article =>
            filters.categories!.some(cat =>
                article.category.toLowerCase().includes(cat.toLowerCase()) ||
                cat.toLowerCase().includes(article.category.toLowerCase())
            )
        );
    }

    // Date range filter
    if (filters.dateRange) {
        filtered = filtered.filter(article => {
            if (!article.date) return false;
            const articleDate = new Date(article.date);
            return articleDate >= filters.dateRange!.start && articleDate <= filters.dateRange!.end;
        });
    }

    // Keyword filter
    if (filters.keywords && filters.keywords.length > 0) {
        filtered = filtered.filter(article =>
            filters.keywords!.some(keyword =>
                article.content.toLowerCase().includes(keyword)
            )
        );
    }

    return filtered;
};

/**
 * Generate a natural language response based on query and results
 */
export const generateResponse = (query: ParsedQuery, results: Article[]): string => {
    const { filters, intent } = query;

    let response = `Found ${results.length} article${results.length !== 1 ? 's' : ''}`;

    // Add filter descriptions
    const descriptions: string[] = [];

    if (filters.sentiment) {
        descriptions.push(`with ${filters.sentiment} sentiment`);
    }

    if (filters.categories && filters.categories.length > 0) {
        descriptions.push(`in ${filters.categories.join(', ')}`);
    }

    if (filters.dateRange) {
        const { start, end } = filters.dateRange;
        const isToday = start.toDateString() === new Date().toDateString();
        const isThisWeek = end.getTime() - start.getTime() <= 7 * 24 * 60 * 60 * 1000;

        if (isToday) {
            descriptions.push('from today');
        } else if (isThisWeek) {
            descriptions.push('from this week');
        } else {
            descriptions.push(`from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`);
        }
    }

    if (filters.keywords && filters.keywords.length > 0) {
        descriptions.push(`matching "${filters.keywords.join(', ')}"`);
    }

    if (descriptions.length > 0) {
        response += ' ' + descriptions.join(' ');
    }

    response += '.';

    // Add intent-specific information
    if (intent === 'summarize' && results.length > 0) {
        response += ' I can provide a summary of these articles.';
    } else if (intent === 'analyze' && results.length > 0) {
        response += ' I can analyze these articles for patterns and insights.';
    } else if (intent === 'compare' && results.length > 1) {
        response += ' I can compare how different sources cover this topic.';
    }

    if (results.length === 0) {
        response = `I couldn't find any articles matching your query. Try adjusting your search criteria or using different keywords.`;
    }

    return response;
};

// --- AMBIGUITY HANDLING ---

export interface AmbiguityOption {
    label: string;
    value: string;
    description?: string;
    confidence: number;
}

export interface AmbiguityResult {
    isAmbiguous: boolean;
    confidence: number; // 0-1, lower = more ambiguous
    clarityScore: number; // 1-10 for display
    options: AmbiguityOption[];
    suggestions: string[];
    ambiguousTerms: string[];
}

// Terms that commonly cause ambiguity
const AMBIGUOUS_ENTITIES: Record<string, AmbiguityOption[]> = {
    'apple': [
        { label: 'Apple Inc. (Technology)', value: 'apple_tech', description: 'Tech company, iPhone, Mac', confidence: 0.8 },
        { label: 'Apple (Fruit)', value: 'apple_fruit', description: 'The fruit', confidence: 0.2 }
    ],
    'bank': [
        { label: 'Banking & Finance', value: 'bank_finance', description: 'Financial institutions', confidence: 0.85 },
        { label: 'River Bank', value: 'bank_nature', description: 'Geographic feature', confidence: 0.15 }
    ],
    'amazon': [
        { label: 'Amazon.com', value: 'amazon_company', description: 'E-commerce company', confidence: 0.9 },
        { label: 'Amazon Rainforest', value: 'amazon_nature', description: 'South American forest', confidence: 0.1 }
    ],
    'python': [
        { label: 'Python (Programming)', value: 'python_tech', description: 'Programming language', confidence: 0.7 },
        { label: 'Python (Snake)', value: 'python_animal', description: 'The reptile', confidence: 0.3 }
    ],
    'tesla': [
        { label: 'Tesla Inc.', value: 'tesla_company', description: 'Electric car company', confidence: 0.85 },
        { label: 'Nikola Tesla', value: 'tesla_person', description: 'Historical inventor', confidence: 0.15 }
    ],
    'china': [
        { label: 'China (Country)', value: 'china_country', description: 'People\'s Republic of China', confidence: 0.8 },
        { label: 'China (Economy)', value: 'china_economy', description: 'Chinese business/trade', confidence: 0.2 }
    ],
    'virus': [
        { label: 'Computer Virus', value: 'virus_tech', description: 'Malware, cybersecurity', confidence: 0.4 },
        { label: 'Biological Virus', value: 'virus_health', description: 'Disease, pandemic', confidence: 0.6 }
    ]
};

// Vague terms that need clarification
const VAGUE_TERMS = ['stuff', 'things', 'news', 'latest', 'recent', 'something', 'anything', 'everything'];

/**
 * Detect ambiguity in user query and calculate confidence score
 */
export const detectAmbiguity = (query: string, articles: Article[]): AmbiguityResult => {
    const lowerQuery = query.toLowerCase();
    const words = lowerQuery.split(/\s+/);

    const ambiguousTerms: string[] = [];
    const options: AmbiguityOption[] = [];
    const suggestions: string[] = [];
    let confidencePenalty = 0;

    // Check for ambiguous entities
    for (const [term, termOptions] of Object.entries(AMBIGUOUS_ENTITIES)) {
        if (lowerQuery.includes(term)) {
            ambiguousTerms.push(term);
            options.push(...termOptions);
            confidencePenalty += 0.2;

            // Generate suggestions
            termOptions.forEach(opt => {
                suggestions.push(query.replace(new RegExp(term, 'gi'), opt.label.split(' ')[0]));
            });
        }
    }

    // Check for vague terms
    for (const term of VAGUE_TERMS) {
        if (words.includes(term)) {
            ambiguousTerms.push(term);
            confidencePenalty += 0.1;
        }
    }

    // Check query length (very short queries are often vague)
    if (words.length <= 2) {
        confidencePenalty += 0.15;
    }

    // Check if multiple categories detected (could mean unclear intent)
    const categories = extractCategories(lowerQuery);
    if (categories.length > 2) {
        confidencePenalty += 0.1;
        suggestions.push(`Show me ${categories[0]} news specifically`);
    }

    // Calculate final confidence
    const confidence = Math.max(0.1, 1 - confidencePenalty);
    const clarityScore = Math.round(confidence * 10);

    return {
        isAmbiguous: confidence < 0.7,
        confidence,
        clarityScore,
        options,
        suggestions: [...new Set(suggestions)].slice(0, 3), // Max 3 suggestions
        ambiguousTerms
    };
};

/**
 * Get disambiguation prompt for user
 */
export const getAmbiguityPrompt = (result: AmbiguityResult): string => {
    if (!result.isAmbiguous) return '';

    if (result.ambiguousTerms.length > 0) {
        return `Your query contains "${result.ambiguousTerms.join('", "')}" which could mean different things. Please clarify:`;
    }

    return 'Your query is a bit vague. Here are some suggestions:';
};

/**
 * Generate enhanced response with confidence information
 */
export const generateEnhancedResponse = (
    query: ParsedQuery,
    results: Article[],
    ambiguity: AmbiguityResult
): { text: string; confidence: number; clarityScore: number } => {
    const baseResponse = generateResponse(query, results);

    let enhancedText = baseResponse;

    // Add confidence indicator for low-confidence queries
    if (ambiguity.clarityScore < 7) {
        enhancedText += ` (Clarity: ${ambiguity.clarityScore}/10)`;

        if (ambiguity.suggestions.length > 0) {
            enhancedText += ` Try: "${ambiguity.suggestions[0]}"`;
        }
    }

    return {
        text: enhancedText,
        confidence: ambiguity.confidence,
        clarityScore: ambiguity.clarityScore
    };
};
