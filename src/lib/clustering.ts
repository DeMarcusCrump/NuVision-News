import { Article } from "./articles";

export interface ClusteredArticle extends Article {
  clusterId: string;
  isClusterRepresentative: boolean;
  clusterSize: number;
  clusterArticles?: Article[];
}

/**
 * Fast keyword-based clustering (no AI required)
 * Groups articles by similar keywords/topics
 */
const fastCluster = (articles: Article[]): ClusteredArticle[] => {
  const clusters: Map<string, Article[]> = new Map();

  // Extract keywords from each article
  const getKeywords = (article: Article): string[] => {
    const text = `${article.category} ${article.content}`.toLowerCase();
    const words = text.split(/\W+/).filter(w => w.length > 4);
    const stopWords = new Set(['about', 'after', 'before', 'being', 'could', 'would', 'should', 'their', 'there', 'these', 'those', 'which', 'while', 'other']);
    return [...new Set(words.filter(w => !stopWords.has(w)))].slice(0, 20);
  };

  // Calculate keyword overlap
  const similarity = (a: string[], b: string[]): number => {
    const setA = new Set(a);
    const intersection = b.filter(w => setA.has(w)).length;
    return intersection / Math.max(a.length, b.length, 1);
  };

  const processed = new Set<number>();
  const articleKeywords = articles.map(a => ({ article: a, keywords: getKeywords(a) }));

  articleKeywords.forEach((item, index) => {
    if (processed.has(item.article.id)) return;

    const cluster: Article[] = [item.article];
    const clusterId = `cluster-${item.article.id}`;

    articleKeywords.forEach((other, otherIndex) => {
      if (index === otherIndex || processed.has(other.article.id)) return;

      // Also group by same category
      const sameCat = item.article.category === other.article.category;
      const sim = similarity(item.keywords, other.keywords);

      if (sim >= 0.3 || (sameCat && sim >= 0.15)) {
        cluster.push(other.article);
        processed.add(other.article.id);
      }
    });

    processed.add(item.article.id);
    clusters.set(clusterId, cluster);
  });

  // Convert to clustered articles
  const result: ClusteredArticle[] = [];
  clusters.forEach((members, clusterId) => {
    const sorted = [...members].sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;
    });

    result.push({
      ...sorted[0],
      clusterId,
      isClusterRepresentative: true,
      clusterSize: members.length,
      clusteredSources: members.length,
      clusterArticles: members,
    });
  });

  return result;
};

/**
 * Cluster articles - uses fast keyword matching
 * (AI embeddings removed for reliability)
 */
export const clusterArticles = async (
  articles: Article[]
): Promise<ClusteredArticle[]> => {
  console.log(`Clustering ${articles.length} articles...`);

  if (articles.length === 0) {
    return [];
  }

  // Use fast clustering (instant, no AI)
  const clustered = fastCluster(articles);

  const multiSource = clustered.filter(a => a.clusterSize > 1).length;
  console.log(`Clustered into ${clustered.length} groups (${multiSource} with multiple sources)`);

  return clustered;
};

export const getClusterById = (
  clusteredArticles: ClusteredArticle[],
  clusterId: string
): Article[] => {
  const cluster = clusteredArticles.find((a) => a.clusterId === clusterId);
  return cluster?.clusterArticles || [];
};
