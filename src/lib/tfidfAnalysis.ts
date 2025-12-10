/**
 * TF-IDF (Term Frequency-Inverse Document Frequency) analysis
 */

import { tokenize, preprocessText } from './textPreprocessing';

export interface TFIDFResult {
  term: string;
  tfidf: number;
  tf: number;
  idf: number;
}

export interface DocumentTerms {
  documentId: string;
  terms: Map<string, number>;
  totalTerms: number;
}

/**
 * Calculate Term Frequency (TF) for a document
 */
export const calculateTF = (text: string): Map<string, number> => {
  const cleaned = preprocessText(text, {
    lowercase: true,
    removeUrls: true,
    removeHtmlTags: true,
    removeStopwords: true
  });
  
  const tokens = tokenize(cleaned);
  const termFrequency = new Map<string, number>();
  
  tokens.forEach(token => {
    termFrequency.set(token, (termFrequency.get(token) || 0) + 1);
  });
  
  // Normalize by total terms
  const total = tokens.length;
  termFrequency.forEach((count, term) => {
    termFrequency.set(term, count / total);
  });
  
  return termFrequency;
};

/**
 * Calculate Inverse Document Frequency (IDF) across all documents
 */
export const calculateIDF = (
  documents: string[]
): Map<string, number> => {
  const N = documents.length;
  const documentFrequency = new Map<string, number>();
  
  // Count how many documents contain each term
  documents.forEach(doc => {
    const cleaned = preprocessText(doc, {
      lowercase: true,
      removeUrls: true,
      removeHtmlTags: true,
      removeStopwords: true
    });
    const terms = new Set(tokenize(cleaned));
    
    terms.forEach(term => {
      documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1);
    });
  });
  
  // Calculate IDF
  const idf = new Map<string, number>();
  documentFrequency.forEach((df, term) => {
    idf.set(term, Math.log(N / df));
  });
  
  return idf;
};

/**
 * Calculate TF-IDF scores for a single document in a corpus
 */
export const calculateTFIDF = (
  document: string,
  allDocuments: string[]
): TFIDFResult[] => {
  const tf = calculateTF(document);
  const idf = calculateIDF(allDocuments);
  
  const tfidfScores: TFIDFResult[] = [];
  
  tf.forEach((tfScore, term) => {
    const idfScore = idf.get(term) || 0;
    tfidfScores.push({
      term,
      tfidf: tfScore * idfScore,
      tf: tfScore,
      idf: idfScore
    });
  });
  
  // Sort by TF-IDF score descending
  return tfidfScores.sort((a, b) => b.tfidf - a.tfidf);
};

/**
 * Extract top keywords from a document using TF-IDF
 */
export const extractKeywords = (
  document: string,
  allDocuments: string[],
  topN: number = 10
): string[] => {
  const tfidfResults = calculateTFIDF(document, allDocuments);
  return tfidfResults.slice(0, topN).map(result => result.term);
};

/**
 * Calculate document similarity using TF-IDF cosine similarity
 */
export const calculateDocumentSimilarity = (
  doc1: string,
  doc2: string,
  allDocuments: string[]
): number => {
  const tfidf1 = calculateTFIDF(doc1, allDocuments);
  const tfidf2 = calculateTFIDF(doc2, allDocuments);
  
  // Create term vectors
  const terms = new Set([
    ...tfidf1.map(t => t.term),
    ...tfidf2.map(t => t.term)
  ]);
  
  const vector1 = new Map(tfidf1.map(t => [t.term, t.tfidf]));
  const vector2 = new Map(tfidf2.map(t => [t.term, t.tfidf]));
  
  // Calculate cosine similarity
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  terms.forEach(term => {
    const v1 = vector1.get(term) || 0;
    const v2 = vector2.get(term) || 0;
    
    dotProduct += v1 * v2;
    magnitude1 += v1 * v1;
    magnitude2 += v2 * v2;
  });
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  
  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
};

/**
 * Analyze document collection and return insights
 */
export interface CorpusAnalysis {
  totalDocuments: number;
  uniqueTerms: number;
  averageDocumentLength: number;
  topTerms: TFIDFResult[];
  vocabulary: Set<string>;
}

export const analyzeCorpus = (
  documents: string[],
  topN: number = 20
): CorpusAnalysis => {
  const vocabulary = new Set<string>();
  let totalLength = 0;
  
  documents.forEach(doc => {
    const cleaned = preprocessText(doc, {
      lowercase: true,
      removeUrls: true,
      removeHtmlTags: true,
      removeStopwords: true
    });
    const tokens = tokenize(cleaned);
    totalLength += tokens.length;
    tokens.forEach(token => vocabulary.add(token));
  });
  
  // Calculate aggregate TF-IDF for corpus
  const allText = documents.join(' ');
  const topTerms = calculateTFIDF(allText, documents).slice(0, topN);
  
  return {
    totalDocuments: documents.length,
    uniqueTerms: vocabulary.size,
    averageDocumentLength: totalLength / documents.length,
    topTerms,
    vocabulary
  };
};
