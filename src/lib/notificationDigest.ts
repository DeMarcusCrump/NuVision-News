import { Article } from "./articles";

export type DigestFrequency = "hourly" | "daily" | "weekly";

export interface NotificationPreferences {
  frequency: DigestFrequency;
  categories: string[];
  breakingOnly: boolean;
  minImportanceScore: number;
}

export interface DigestArticle extends Article {
  relevanceScore: number;
  reason: string;
}

export const generateDigest = (
  articles: Article[],
  preferences: NotificationPreferences
): DigestArticle[] => {
  const now = new Date();
  
  // Filter by timeframe based on frequency
  const cutoffTime = new Date();
  switch (preferences.frequency) {
    case "hourly":
      cutoffTime.setHours(cutoffTime.getHours() - 1);
      break;
    case "daily":
      cutoffTime.setDate(cutoffTime.getDate() - 1);
      break;
    case "weekly":
      cutoffTime.setDate(cutoffTime.getDate() - 7);
      break;
  }

  // Filter articles
  let filteredArticles = articles.filter(article => {
    const articleDate = new Date(article.date || 0);
    
    // Time filter
    if (articleDate < cutoffTime) return false;
    
    // Breaking news filter
    if (preferences.breakingOnly && !article.isBreaking) return false;
    
    // Category filter (if any categories selected)
    if (preferences.categories.length > 0 && !preferences.categories.includes(article.category)) {
      return false;
    }
    
    return true;
  });

  // Score and rank articles
  const scoredArticles: DigestArticle[] = filteredArticles.map(article => {
    let score = 0;
    let reasons: string[] = [];

    // Breaking news boost
    if (article.isBreaking) {
      score += 30;
      reasons.push("Breaking news");
    }

    // Clustered sources boost
    if (article.clusteredSources && article.clusteredSources > 1) {
      score += article.clusteredSources * 5;
      reasons.push(`${article.clusteredSources} sources covering`);
    }

    // Sentiment extremity (controversial topics)
    if (article.sentiment) {
      const sentimentScore = Math.abs(article.sentiment.compound);
      score += sentimentScore * 10;
      if (sentimentScore > 0.5) {
        reasons.push("High impact story");
      }
    }

    // Recency boost
    const hoursOld = (now.getTime() - new Date(article.date || 0).getTime()) / (1000 * 60 * 60);
    if (hoursOld < 6) {
      score += 15;
      reasons.push("Recent update");
    }

    // Category preference (selected categories get boost)
    if (preferences.categories.includes(article.category)) {
      score += 10;
    }

    return {
      ...article,
      relevanceScore: score,
      reason: reasons.join(" • ") || "Relevant to your interests"
    };
  });

  // Filter by minimum importance and sort
  return scoredArticles
    .filter(article => article.relevanceScore >= preferences.minImportanceScore)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 10); // Top 10 for digest
};

export const getDigestTitle = (frequency: DigestFrequency): string => {
  const now = new Date();
  const hour = now.getHours();
  
  switch (frequency) {
    case "hourly":
      return `Your ${hour}:00 News Digest`;
    case "daily":
      return `Your Daily News Digest - ${now.toLocaleDateString()}`;
    case "weekly":
      return `Your Weekly News Digest - Week of ${now.toLocaleDateString()}`;
  }
};
