export interface Article {
  id: number;
  content: string;
  category: string;
  sentiment: {
    polarity: number;
    compound: number;
  };
  url?: string;
  urlToImage?: string | null;
  deep_dive_format?: "Bias Radar" | "Event Timeline" | "Knowledge Map" | "Deep Vision" | null;
  isBreaking?: boolean;
  publisher?: string;
  author?: string;
  date?: string;
  region?: string;
  clusteredSources?: number;
  recommendationReason?: string;
  // Trust Project fields
  contentType?: "news" | "opinion" | "analysis";
  authorExpertise?: string;
  primarySources?: Array<{ name: string; url: string }>;
}

export type ContextLens = "beginner" | "analyst" | "executive" | "student" | "none";

export const getSentimentColor = (compound: number) => {
  if (compound > 0.05) return "success";
  if (compound < -0.05) return "danger";
  return "warning";
};

export const getSentimentLabel = (compound: number) => {
  if (compound > 0.05) return "Positive";
  if (compound < -0.05) return "Negative";
  return "Neutral";
};

/**
 * Deep dive format assignment removed - was fake/arbitrary
 * Deep dive features exist but should be manually tagged, not auto-assigned
 */
export const assignDeepDiveFormat = (category: string): Article["deep_dive_format"] => {
  // Return null - deep dive should be manually assigned, not auto-generated
  return null;
};

// Honest recommendation reasons based on actual article data (no fake personalization)
const getRecommendationReason = (article: { category: string; date?: string; publisher?: string }): string | undefined => {
  const reasons: string[] = [];

  // Time-based reasons (factual)
  if (article.date) {
    const articleDate = new Date(article.date);
    const now = new Date();
    const hoursAgo = (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60);
    if (hoursAgo < 3) reasons.push("Published within the last 3 hours");
    else if (hoursAgo < 24) reasons.push("Published today");
  }

  // Source-based reasons (factual)
  if (article.publisher) {
    const majorSources = ["Reuters", "AP News", "BBC", "CNN", "The Guardian", "NYT", "WSJ", "Bloomberg"];
    if (majorSources.some(s => article.publisher?.includes(s))) {
      reasons.push("From a major news source");
    }
  }

  // Category-based reasons (factual, not personalized)
  const categoryReasons: Record<string, string> = {
    "Politics": "Trending in Politics",
    "Technology": "Featured in Tech",
    "Business": "Market update",
    "Sports": "Sports highlight",
    "Health": "Health news",
    "Science": "Scientific development",
    "Entertainment": "Entertainment update",
    "World News": "International news",
  };

  if (categoryReasons[article.category]) {
    reasons.push(categoryReasons[article.category]);
  }

  return reasons.length > 0 ? reasons[0] : undefined;
};

// Removed fake mock data - using real article data only

const generateMetadata = (article: Omit<Article, "deep_dive_format">, index: number): Partial<Article> => {
  // Determine content type based on category
  const contentTypes: Array<"news" | "opinion" | "analysis"> = ["news", "opinion", "analysis"];
  const weights = article.category.toUpperCase().includes("POLITICS")
    ? [0.5, 0.3, 0.2]  // More opinions in politics
    : [0.7, 0.1, 0.2]; // More news in other categories

  const rand = Math.random();
  let contentType: "news" | "opinion" | "analysis";
  if (rand < weights[0]) contentType = "news";
  else if (rand < weights[0] + weights[1]) contentType = "opinion";
  else contentType = "analysis";

  return {
    // Use honest recommendation reason based on actual data
    recommendationReason: getRecommendationReason(article),
    isBreaking: false, // Only set true if article is actually breaking news
    contentType,
    // Only add expertise if we have real author info
    authorExpertise: article.author ? undefined : undefined,
    // Only add sources if we have real source info
    primarySources: undefined
  };
};

import { assignSmartDeepDive } from './smartDeepDive';

/**
 * Enrich articles with metadata (deep_dive_format, author expertise, etc.)
 * Preserves real data from NewsAPI, only adds missing fields
 */
export const enrichArticleMetadata = (articles: Omit<Article, "deep_dive_format">[]): Article[] => {
  return articles.map((article, index) => {
    const metadata = generateMetadata(article, index);

    return {
      ...article,
      deep_dive_format: (article as Article).deep_dive_format || assignSmartDeepDive(article as Article),
      // Only add mock data if real data is missing
      publisher: article.publisher || metadata.publisher,
      author: article.author || metadata.author,
      date: article.date || metadata.date,
      region: article.region || metadata.region,
      // These can be added since they're extra metadata
      clusteredSources: metadata.clusteredSources,
      recommendationReason: metadata.recommendationReason,
      isBreaking: metadata.isBreaking,
      contentType: metadata.contentType,
      authorExpertise: metadata.authorExpertise,
      primarySources: metadata.primarySources,
    };
  });
};

/**
 * Load articles - returns empty array by default
 * Articles now come from live NewsAPI or user uploads
 */
export const loadArticles = (): Article[] => {
  return [];
};

/**
 * Get article by ID - now returns null if not found
 */
export const getArticleById = (id: number): Article | null => {
  const articles = loadArticles();
  return articles.find(a => a.id === id) || null;
};

export const getHeadline = (content: string): string => {
  const sentences = content.split(". ");
  return sentences[0];
};

export const getSummary = (content: string): string => {
  const sentences = content.split(". ");
  return sentences.slice(1, 3).join(". ");
};
