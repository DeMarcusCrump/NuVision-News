/**
 * Advanced text preprocessing and cleaning utilities
 */

export interface PreprocessingOptions {
  lowercase?: boolean;
  removeUrls?: boolean;
  removeEmails?: boolean;
  removeHtmlTags?: boolean;
  removeSpecialChars?: boolean;
  removeExtraWhitespace?: boolean;
  removeStopwords?: boolean;
  stemming?: boolean;
}

// Common English stopwords
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they', 'have',
  'had', 'what', 'when', 'where', 'who', 'which', 'why', 'how'
]);

/**
 * Clean and preprocess text content
 */
export const preprocessText = (
  text: string,
  options: PreprocessingOptions = {}
): string => {
  let processed = text;

  // Remove HTML tags
  if (options.removeHtmlTags !== false) {
    processed = processed.replace(/<[^>]*>/g, '');
  }

  // Remove URLs
  if (options.removeUrls !== false) {
    processed = processed.replace(/https?:\/\/[^\s]+/g, '');
  }

  // Remove email addresses
  if (options.removeEmails !== false) {
    processed = processed.replace(/[\w.-]+@[\w.-]+\.\w+/g, '');
  }

  // Convert to lowercase
  if (options.lowercase !== false) {
    processed = processed.toLowerCase();
  }

  // Remove special characters (keep alphanumeric and basic punctuation)
  if (options.removeSpecialChars) {
    processed = processed.replace(/[^a-z0-9\s.,!?-]/gi, '');
  }

  // Remove extra whitespace
  if (options.removeExtraWhitespace !== false) {
    processed = processed.replace(/\s+/g, ' ').trim();
  }

  // Remove stopwords
  if (options.removeStopwords) {
    const words = processed.split(/\s+/);
    processed = words.filter(word => !STOPWORDS.has(word.toLowerCase())).join(' ');
  }

  // Simple stemming (Porter stemmer simplified)
  if (options.stemming) {
    const words = processed.split(/\s+/);
    processed = words.map(word => simpleStem(word)).join(' ');
  }

  return processed;
};

/**
 * Simplified stemming algorithm
 */
const simpleStem = (word: string): string => {
  // Remove common suffixes
  word = word.replace(/ing$/, '');
  word = word.replace(/ed$/, '');
  word = word.replace(/es$/, '');
  word = word.replace(/s$/, '');
  return word;
};

/**
 * Tokenize text into words
 */
export const tokenize = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(token => token.length > 0);
};

/**
 * Tokenize text into sentences
 */
export const tokenizeSentences = (text: string): string[] => {
  // Split on sentence boundaries (., !, ?)
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
};

/**
 * Calculate word frequency in text
 */
export const getWordFrequency = (text: string): Map<string, number> => {
  const tokens = tokenize(text);
  const frequency = new Map<string, number>();
  
  tokens.forEach(token => {
    frequency.set(token, (frequency.get(token) || 0) + 1);
  });
  
  return frequency;
};

/**
 * Extract n-grams from text
 */
export const extractNGrams = (
  text: string,
  n: number = 2
): string[] => {
  const tokens = tokenize(text);
  const ngrams: string[] = [];
  
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(' '));
  }
  
  return ngrams;
};

/**
 * Clean text for analysis (default preset)
 */
export const cleanTextForAnalysis = (text: string): string => {
  return preprocessText(text, {
    lowercase: true,
    removeUrls: true,
    removeEmails: true,
    removeHtmlTags: true,
    removeExtraWhitespace: true,
    removeSpecialChars: false,
    removeStopwords: false,
    stemming: false
  });
};
