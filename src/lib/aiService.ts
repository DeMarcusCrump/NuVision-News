// We dynamically import @huggingface/transformers only when the in-browser fallback is used.
// This avoids bundling the heavy transformers library into the main client bundle when
// server-side inference endpoints are available.
let sentimentPipeline: any = null;
let summarizationPipeline: any = null;
let nerPipeline: any = null;
let embeddingPipeline: any = null;
let qaModel: any = null;

export interface SentimentResult {
  label: string;
  score: number;
  compound: number;
}

export interface NEREntity {
  entity: string;
  word: string;
  start: number;
  end: number;
  score: number;
}

export const initializeSentimentAnalysis = async () => {
  if (!sentimentPipeline) {
    const transformers = await import("@huggingface/transformers");
    sentimentPipeline = await transformers.pipeline(
      "sentiment-analysis",
      "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
    );
  }
  return sentimentPipeline;
};

export const initializeSummarization = async () => {
  if (!summarizationPipeline) {
    const transformers = await import("@huggingface/transformers");
    summarizationPipeline = await transformers.pipeline(
      "summarization",
      "Xenova/distilbart-cnn-6-6"
    );
  }
  return summarizationPipeline;
};

export const initializeNER = async () => {
  if (!nerPipeline) {
    const transformers = await import("@huggingface/transformers");
    nerPipeline = await transformers.pipeline(
      "token-classification",
      "Xenova/bert-base-NER"
    );
  }
  return nerPipeline;
};

export const initializeEmbeddings = async () => {
  if (!embeddingPipeline) {
    const transformers = await import("@huggingface/transformers");
    embeddingPipeline = await transformers.pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return embeddingPipeline;
};

export const initializeQA = async () => {
  if (!qaModel) {
    const transformers = await import("@huggingface/transformers");
    qaModel = await transformers.pipeline(
      "question-answering",
      "Xenova/distilbert-base-cased-distilled-squad"
    );
  }
  return qaModel;
};

export const analyzeSentiment = async (text: string): Promise<SentimentResult> => {
  // Try server-side inference first
  try {
    const res = await fetch('/api/sentiment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: text.slice(0, 1000) }) });
    if (res.ok) {
      const data = await res.json();
      // HF returns [{label, score}, ...]
      const top = Array.isArray(data) ? data[0] : data;
      const compound = top.label === 'POSITIVE' ? top.score * 0.8 : -top.score * 0.8;
      return { label: top.label, score: top.score, compound };
    }
  } catch (e) {
    // ignore and fallback
  }

  // Fallback to in-browser pipeline
  const model = await initializeSentimentAnalysis();
  const result = await model(text.slice(0, 512)) as any;
  const compound = result[0].label === "POSITIVE" ? result[0].score * 0.8 : -result[0].score * 0.8;
  return { label: result[0].label, score: result[0].score, compound };
};

export const summarizeText = async (text: string, maxLength = 300): Promise<string> => {
  try {
    const res = await fetch('/api/summarize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, max_length: maxLength }) });
    if (res.ok) {
      const data = await res.json();
      // HF summarization returns [{summary_text}]
      if (Array.isArray(data) && data[0]?.summary_text) return data[0].summary_text;
      if (data?.summary_text) return data.summary_text;
    }
  } catch (e) {
    // fallback
  }

  const model = await initializeSummarization();
  const result = await model(text, { max_length: maxLength, min_length: 80 }) as any;
  return result[0].summary_text;
};

export const extractEntities = async (text: string): Promise<NEREntity[]> => {
  try {
    const res = await fetch('/api/ner', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: text.slice(0, 1000) }) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.filter((e: any) => (e.score ?? 1) > 0.6).map((entity: any) => ({
          entity: entity.entity || entity.label || entity.entity_group || '',
          word: entity.word || entity.entity || '',
          start: entity.start || 0,
          end: entity.end || 0,
          score: entity.score || 1,
        }));
      }
    }
  } catch (e) {
    // fallback
  }

  const model = await initializeNER();
  const result = await model(text.slice(0, 512)) as any;
  return result.filter((entity: any) => entity.score > 0.7).map((entity: any) => ({
    entity: entity.entity,
    word: entity.word,
    start: entity.start,
    end: entity.end,
    score: entity.score
  }));
};

export const computeEmbedding = async (text: string): Promise<number[]> => {
  try {
    const res = await fetch('/api/embedding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
    if (res.ok) {
      const data = await res.json();
      // Some HF embedding endpoints return array of floats or nested arrays
      if (Array.isArray(data)) return Array.isArray(data[0]) ? data[0] : data;
      if (data?.embedding) return data.embedding;
    }
  } catch (e) {
    // fallback
  }

  const model = await initializeEmbeddings();
  const result = await model(text, { pooling: "mean", normalize: true }) as any;
  return Array.from(result.data);
};

export const cosineSimilarity = (a: number[], b: number[]): number => {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};

export const answerQuestion = async (question: string, context: string): Promise<string> => {
  try {
    const res = await fetch('/api/qa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, context: context.slice(0, 3000) }) });
    if (res.ok) {
      const data = await res.json();
      if (data?.answer) return data.answer;
      if (Array.isArray(data) && data[0]?.answer) return data[0].answer;
    }
  } catch (e) {
    // fallback
  }

  const model = await initializeQA();
  const result = await model(question, context.slice(0, 2048)) as any;
  return result.answer;
};

export interface ClassificationResult {
  category: string;
  confidence: number;
  alternativeCategories: Array<{ category: string; confidence: number }>;
}

const CATEGORIES = [
  'Politics', 'Business', 'Technology', 'Science', 'Health',
  'Entertainment', 'Sports', 'World News', 'Environment', 'Crime'
];

/**
 * Classify article with confidence scoring
 * Uses server-side zero-shot classification if available, falls back to keyword-based
 */
export const classifyArticle = async (text: string): Promise<ClassificationResult> => {
  try {
    // Try server-side zero-shot classification
    const res = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text.slice(0, 512),
        categories: CATEGORIES
      })
    });

    if (res.ok) {
      const data = await res.json();
      // HF zero-shot returns {labels: [...], scores: [...]}
      return {
        category: data.labels[0],
        confidence: data.scores[0],
        alternativeCategories: data.labels.slice(1, 4).map((label: string, i: number) => ({
          category: label,
          confidence: data.scores[i + 1]
        }))
      };
    }
  } catch (error) {
    console.log('Server classification unavailable, using keyword-based fallback');
  }

  // Fallback: keyword-based classification with lower confidence
  return keywordBasedClassification(text);
};

/**
 * Keyword-based classification fallback
 */
const keywordBasedClassification = (text: string): ClassificationResult => {
  const lowerText = text.toLowerCase();

  const keywords: Record<string, string[]> = {
    'Technology': ['tech', 'software', 'ai', 'artificial intelligence', 'computer', 'digital', 'app', 'internet', 'data'],
    'Politics': ['election', 'government', 'policy', 'congress', 'president', 'senator', 'vote', 'political', 'democrat', 'republican'],
    'Business': ['market', 'stock', 'economy', 'company', 'trade', 'finance', 'revenue', 'profit', 'investment', 'business'],
    'Science': ['research', 'study', 'scientist', 'discovery', 'experiment', 'scientific', 'laboratory', 'theory'],
    'Health': ['health', 'medical', 'medicine', 'disease', 'doctor', 'hospital', 'patient', 'treatment', 'wellness'],
    'Sports': ['game', 'team', 'player', 'championship', 'league', 'score', 'match', 'tournament', 'athlete'],
    'Entertainment': ['movie', 'film', 'music', 'celebrity', 'show', 'actor', 'entertainment', 'concert', 'album'],
    'World News': ['international', 'global', 'foreign', 'country', 'nation', 'world', 'diplomatic'],
    'Environment': ['climate', 'environment', 'green', 'sustainability', 'pollution', 'carbon', 'renewable', 'ecology'],
    'Crime': ['crime', 'arrest', 'police', 'investigation', 'suspect', 'criminal', 'law enforcement', 'court']
  };

  const scores: Record<string, number> = {};

  // Count keyword matches for each category
  for (const [category, categoryKeywords] of Object.entries(keywords)) {
    let score = 0;
    for (const keyword of categoryKeywords) {
      if (lowerText.includes(keyword)) {
        score += 1;
      }
    }
    scores[category] = score;
  }

  // Sort categories by score
  const sorted = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .filter(([, score]) => score > 0);

  if (sorted.length === 0) {
    // No matches, default to World News with low confidence
    return {
      category: 'World News',
      confidence: 0.3,
      alternativeCategories: []
    };
  }

  const totalScore = sorted.reduce((sum, [, score]) => sum + score, 0);
  const topCategory = sorted[0][0];
  const topScore = sorted[0][1];

  // Calculate confidence (normalized, capped at 0.85 for keyword-based)
  const confidence = Math.min(0.85, topScore / totalScore);

  return {
    category: topCategory,
    confidence,
    alternativeCategories: sorted.slice(1, 4).map(([cat, score]) => ({
      category: cat,
      confidence: Math.min(0.85, score / totalScore)
    }))
  };
};

