import { Article } from './articles';

/**
 * Analyze article content to determine best deep dive format
 * Returns appropriate format based on content analysis
 */
export const assignSmartDeepDive = (article: Article): Article["deep_dive_format"] => {
    const content = article.content.toLowerCase();
    const headline = content.substring(0, 200).toLowerCase(); // First 200 chars as "headline"
    const category = article.category.toLowerCase();

    // Bias Radar: Political content, opinion pieces, controversial topics
    const biasKeywords = ['democrat', 'republican', 'liberal', 'conservative', 'left', 'right', 'bias', 'partisan', 'opinion', 'editorial', 'controversy', 'trump', 'biden', 'election', 'vote', 'congress', 'senate'];
    const hasBiasContent = biasKeywords.some(keyword => content.includes(keyword) || headline.includes(keyword));
    const isPolitical = category.includes('politic') || category.includes('world');

    if (hasBiasContent || isPolitical) {
        return "Bias Radar";
    }

    // Event Timeline: Crime, incidents, historical events, sequences
    const timelineKeywords = ['timeline', 'sequence', 'happened', 'incident', 'event', 'occurred', 'began', 'started', 'ended', 'crime', 'investigation', 'arrest', 'police', 'court', 'trial'];
    const hasTimelineContent = timelineKeywords.some(keyword => content.includes(keyword) || headline.includes(keyword));
    const isCrimeOrEvent = category.includes('crime') || headline.includes('timeline');

    if (hasTimelineContent || isCrimeOrEvent) {
        return "Event Timeline";
    }

    // Knowledge Map: Complex topics, technology, business, interconnected concepts
    const knowledgeKeywords = ['technology', 'system', 'network', 'platform', 'infrastructure', 'ecosystem', 'framework', 'architecture', 'business', 'market', 'industry', 'sector', 'company', 'startup', 'tech', 'ai', 'software'];
    const hasKnowledgeContent = knowledgeKeywords.some(keyword => content.includes(keyword) || headline.includes(keyword));
    const isTechOrBusiness = category.includes('tech') || category.includes('business') || category.includes('science');

    if (hasKnowledgeContent || isTechOrBusiness) {
        return "Knowledge Map";
    }

    // Deep Vision: Science, environment, health, visual/spatial topics
    const visionKeywords = ['environment', 'climate', 'health', 'medical', 'research', 'study', 'science', 'discovery', 'nature', 'ecosystem', 'species', 'wellness', 'disease', 'treatment', 'patient'];
    const hasVisionContent = visionKeywords.some(keyword => content.includes(keyword) || headline.includes(keyword));
    const isScienceOrHealth = category.includes('science') || category.includes('health') || category.includes('environment') || category.includes('wellness');

    if (hasVisionContent || isScienceOrHealth) {
        return "Deep Vision";
    }

    // Sports and Entertainment: Event Timeline (games, seasons, performances)
    const isSportsOrEntertainment = category.includes('sport') || category.includes('entertainment');
    if (isSportsOrEntertainment) {
        return "Event Timeline";
    }

    // More aggressive fallback - assign based on category even without keywords
    if (isPolitical) return "Bias Radar";
    if (isTechOrBusiness) return "Knowledge Map";
    if (isScienceOrHealth) return "Deep Vision";

    // Default for other substantial content
    if (content.length > 300) {
        return "Deep Vision"; // Default immersive experience for long content
    }

    return "Deep Vision"; // Always show something
};

/**
 * Get explanation for why a deep dive format was assigned
 */
export const getDeepDiveReason = (format: Article["deep_dive_format"]): string => {
    switch (format) {
        case "Bias Radar":
            return "Political/opinion content detected - analyze different perspectives";
        case "Event Timeline":
            return "Sequential events detected - explore chronological progression";
        case "Knowledge Map":
            return "Complex interconnected concepts - visualize relationships";
        case "Deep Vision":
            return "Scientific/environmental content - immersive exploration";
        default:
            return "No deep dive available";
    }
};
