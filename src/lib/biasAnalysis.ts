import { Article } from "./articles";

export type BiasLeaning = "left" | "center-left" | "center" | "center-right" | "right";

export interface SourceBias {
  publisher: string;
  leaning: BiasLeaning;
  factualityScore: number; // 0-100
}

export interface BiasRadarData {
  leftCount: number;
  centerLeftCount: number;
  centerCount: number;
  centerRightCount: number;
  rightCount: number;
  totalSources: number;
  diversityScore: number; // 0-100, higher is more diverse
  averageSentiment: number;
  sources: SourceBias[];
}

// Real-world source bias mappings based on Media Bias Chart
const SOURCE_BIAS_MAP: Record<string, { leaning: BiasLeaning; factuality: number }> = {
  "Reuters": { leaning: "center", factuality: 95 },
  "AP News": { leaning: "center", factuality: 95 },
  "BBC": { leaning: "center-left", factuality: 90 },
  "CNN": { leaning: "center-left", factuality: 75 },
  "The Guardian": { leaning: "left", factuality: 80 },
  "NYT": { leaning: "center-left", factuality: 85 },
  "New York Times": { leaning: "center-left", factuality: 85 },
  "WSJ": { leaning: "center-right", factuality: 90 },
  "Wall Street Journal": { leaning: "center-right", factuality: 90 },
  "Bloomberg": { leaning: "center", factuality: 90 },
  "Fox News": { leaning: "right", factuality: 60 },
  "MSNBC": { leaning: "left", factuality: 65 },
  "Washington Post": { leaning: "center-left", factuality: 85 },
  "USA Today": { leaning: "center", factuality: 80 },
  "NPR": { leaning: "center-left", factuality: 90 },
  "Politico": { leaning: "center", factuality: 85 },
};

const getSourceBias = (publisher: string): { leaning: BiasLeaning; factuality: number } => {
  // Try exact match first
  if (SOURCE_BIAS_MAP[publisher]) {
    return SOURCE_BIAS_MAP[publisher];
  }
  
  // Try partial match
  const lowerPublisher = publisher.toLowerCase();
  for (const [key, value] of Object.entries(SOURCE_BIAS_MAP)) {
    if (lowerPublisher.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerPublisher)) {
      return value;
    }
  }
  
  // Default to center if unknown
  return { leaning: "center", factuality: 70 };
};

export const analyzeBias = (articles: Article[]): BiasRadarData => {
  const sources: SourceBias[] = [];
  const leaningCounts = {
    left: 0,
    "center-left": 0,
    center: 0,
    "center-right": 0,
    right: 0,
  };
  
  let totalSentiment = 0;
  const uniquePublishers = new Set<string>();
  
  articles.forEach((article) => {
    if (!article.publisher) return;
    
    const publisher = article.publisher;
    if (uniquePublishers.has(publisher)) return;
    
    uniquePublishers.add(publisher);
    const bias = getSourceBias(publisher);
    
    sources.push({
      publisher,
      leaning: bias.leaning,
      factualityScore: bias.factuality,
    });
    
    leaningCounts[bias.leaning]++;
    totalSentiment += article.sentiment.compound;
  });
  
  const totalSources = sources.length;
  const averageSentiment = totalSources > 0 ? totalSentiment / totalSources : 0;
  
  // Calculate diversity score (0-100)
  // Higher score = more balanced distribution across political spectrum
  const distribution = Object.values(leaningCounts).filter(count => count > 0);
  const diversityScore = totalSources > 0
    ? Math.min(100, (distribution.length / 5) * 100 * (1 - calculateGiniCoefficient(Object.values(leaningCounts))))
    : 0;
  
  return {
    leftCount: leaningCounts.left,
    centerLeftCount: leaningCounts["center-left"],
    centerCount: leaningCounts.center,
    centerRightCount: leaningCounts["center-right"],
    rightCount: leaningCounts.right,
    totalSources,
    diversityScore: Math.round(diversityScore),
    averageSentiment,
    sources: sources.sort((a, b) => b.factualityScore - a.factualityScore),
  };
};

// Gini coefficient to measure inequality in distribution
const calculateGiniCoefficient = (values: number[]): number => {
  if (values.length === 0) return 0;
  
  const sorted = values.sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  
  if (sum === 0) return 0;
  
  let numerator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (i + 1) * sorted[i];
  }
  
  return (2 * numerator) / (n * sum) - (n + 1) / n;
};

export const getBiasColor = (leaning: BiasLeaning): string => {
  const colors = {
    left: "hsl(210, 100%, 50%)", // Blue
    "center-left": "hsl(200, 70%, 60%)", // Light Blue
    center: "hsl(270, 30%, 60%)", // Purple
    "center-right": "hsl(15, 70%, 60%)", // Light Red
    right: "hsl(0, 100%, 50%)", // Red
  };
  return colors[leaning];
};

export const getBiasLabel = (leaning: BiasLeaning): string => {
  const labels = {
    left: "Left",
    "center-left": "Center-Left",
    center: "Center",
    "center-right": "Center-Right",
    right: "Right",
  };
  return labels[leaning];
};
