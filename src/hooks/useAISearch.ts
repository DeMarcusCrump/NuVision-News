import { useState, useCallback } from "react";
import { Article } from "@/lib/articles";
import { computeEmbedding, cosineSimilarity } from "@/lib/aiService";

export const useAISearch = (articles: Article[]) => {
  const [isSearching, setIsSearching] = useState(false);
  const [embeddings, setEmbeddings] = useState<Map<number, number[]>>(new Map());

  const semanticSearch = useCallback(async (query: string): Promise<Article[]> => {
    if (!query.trim()) return articles;
    
    setIsSearching(true);
    try {
      // Compute query embedding
      const queryEmbedding = await computeEmbedding(query);
      
      // Compute embeddings for articles that don't have them yet
      const articlesWithScores = await Promise.all(
        articles.map(async (article) => {
          let articleEmbedding = embeddings.get(article.id);
          
          if (!articleEmbedding) {
            articleEmbedding = await computeEmbedding(article.content.slice(0, 512));
            setEmbeddings(prev => new Map(prev).set(article.id, articleEmbedding!));
          }
          
          const similarity = cosineSimilarity(queryEmbedding, articleEmbedding);
          return { article, similarity };
        })
      );
      
      // Sort by similarity and return top results
      return articlesWithScores
        .sort((a, b) => b.similarity - a.similarity)
        .filter(item => item.similarity > 0.3) // Threshold for relevance
        .map(item => item.article);
    } catch (error) {
      console.error("Semantic search error:", error);
      return articles;
    } finally {
      setIsSearching(false);
    }
  }, [articles, embeddings]);

  return { semanticSearch, isSearching };
};
