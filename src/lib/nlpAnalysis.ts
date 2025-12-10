/**
 * Advanced NLP analysis including POS tagging and syntax parsing
 * Uses pattern matching and rule-based approaches for in-browser analysis
 */

import { tokenize, tokenizeSentences } from './textPreprocessing';

export type POSTag = 
  | 'NOUN' | 'VERB' | 'ADJ' | 'ADV' | 'PRON' 
  | 'DET' | 'PREP' | 'CONJ' | 'NUM' | 'PUNCT' | 'OTHER';

export interface POSToken {
  word: string;
  tag: POSTag;
  position: number;
}

export interface SyntaxTree {
  type: 'sentence' | 'phrase' | 'word';
  value: string;
  children?: SyntaxTree[];
  posTag?: POSTag;
}

// Simple POS tagging rules based on patterns
const NOUN_SUFFIXES = ['tion', 'ness', 'ment', 'ship', 'ity', 'er', 'or', 'ist', 'ism'];
const VERB_SUFFIXES = ['ate', 'ify', 'ize', 'ed', 'ing'];
const ADJ_SUFFIXES = ['able', 'ible', 'al', 'ful', 'ic', 'ive', 'less', 'ous', 'ish'];
const ADV_SUFFIXES = ['ly'];

const DETERMINERS = new Set(['the', 'a', 'an', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);
const PREPOSITIONS = new Set(['in', 'on', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'of', 'over', 'under']);
const CONJUNCTIONS = new Set(['and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'because', 'although', 'while', 'if']);
const PRONOUNS = new Set(['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'who', 'what', 'which', 'whom']);

/**
 * Simple rule-based POS tagger
 */
export const tagPOS = (text: string): POSToken[] => {
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 0);
  
  return tokens.map((word, position) => ({
    word,
    tag: inferPOSTag(word),
    position
  }));
};

/**
 * Infer POS tag based on word patterns and rules
 */
const inferPOSTag = (word: string): POSTag => {
  const lower = word.toLowerCase();
  
  // Check determiner
  if (DETERMINERS.has(lower)) return 'DET';
  
  // Check preposition
  if (PREPOSITIONS.has(lower)) return 'PREP';
  
  // Check conjunction
  if (CONJUNCTIONS.has(lower)) return 'CONJ';
  
  // Check pronoun
  if (PRONOUNS.has(lower)) return 'PRON';
  
  // Check number
  if (/^\d+$/.test(word)) return 'NUM';
  
  // Check punctuation
  if (/^[.,!?;:]$/.test(word)) return 'PUNCT';
  
  // Check suffixes for word class
  if (ADV_SUFFIXES.some(suffix => lower.endsWith(suffix))) return 'ADV';
  if (ADJ_SUFFIXES.some(suffix => lower.endsWith(suffix))) return 'ADJ';
  if (VERB_SUFFIXES.some(suffix => lower.endsWith(suffix))) return 'VERB';
  if (NOUN_SUFFIXES.some(suffix => lower.endsWith(suffix))) return 'NOUN';
  
  // Default to noun for unknown words
  return 'NOUN';
};

/**
 * Extract noun phrases from text
 */
export const extractNounPhrases = (text: string): string[] => {
  const posTokens = tagPOS(text);
  const nounPhrases: string[] = [];
  let currentPhrase: string[] = [];
  
  posTokens.forEach(token => {
    // Build noun phrases (DET? ADJ* NOUN+)
    if (token.tag === 'DET' || token.tag === 'ADJ' || token.tag === 'NOUN') {
      currentPhrase.push(token.word);
    } else {
      if (currentPhrase.length > 0) {
        nounPhrases.push(currentPhrase.join(' '));
        currentPhrase = [];
      }
    }
  });
  
  if (currentPhrase.length > 0) {
    nounPhrases.push(currentPhrase.join(' '));
  }
  
  return nounPhrases;
};

/**
 * Extract verb phrases from text
 */
export const extractVerbPhrases = (text: string): string[] => {
  const posTokens = tagPOS(text);
  const verbPhrases: string[] = [];
  let currentPhrase: string[] = [];
  
  posTokens.forEach(token => {
    // Build verb phrases (VERB ADV* VERB*)
    if (token.tag === 'VERB' || token.tag === 'ADV') {
      currentPhrase.push(token.word);
    } else {
      if (currentPhrase.length > 0 && currentPhrase.some(w => {
        const tag = inferPOSTag(w);
        return tag === 'VERB';
      })) {
        verbPhrases.push(currentPhrase.join(' '));
      }
      currentPhrase = [];
    }
  });
  
  if (currentPhrase.length > 0) {
    verbPhrases.push(currentPhrase.join(' '));
  }
  
  return verbPhrases;
};

/**
 * Parse text into a simple syntax tree
 */
export const parseSyntax = (text: string): SyntaxTree => {
  const sentences = tokenizeSentences(text);
  
  const tree: SyntaxTree = {
    type: 'sentence',
    value: text,
    children: sentences.map(sentence => ({
      type: 'sentence',
      value: sentence,
      children: parsePhrase(sentence)
    }))
  };
  
  return tree;
};

/**
 * Parse a sentence into phrase structure
 */
const parsePhrase = (sentence: string): SyntaxTree[] => {
  const posTokens = tagPOS(sentence);
  const phrases: SyntaxTree[] = [];
  let currentPhrase: POSToken[] = [];
  let phraseType: 'phrase' | 'word' = 'word';
  
  posTokens.forEach(token => {
    if (token.tag === 'NOUN' || token.tag === 'VERB') {
      currentPhrase.push(token);
      phraseType = 'phrase';
    } else {
      if (currentPhrase.length > 0) {
        phrases.push({
          type: phraseType,
          value: currentPhrase.map(t => t.word).join(' '),
          children: currentPhrase.map(t => ({
            type: 'word',
            value: t.word,
            posTag: t.tag
          }))
        });
        currentPhrase = [];
      }
      
      phrases.push({
        type: 'word',
        value: token.word,
        posTag: token.tag
      });
    }
  });
  
  if (currentPhrase.length > 0) {
    phrases.push({
      type: phraseType,
      value: currentPhrase.map(t => t.word).join(' '),
      children: currentPhrase.map(t => ({
        type: 'word',
        value: t.word,
        posTag: t.tag
      }))
    });
  }
  
  return phrases;
};

/**
 * Analyze linguistic patterns in text
 */
export interface LinguisticAnalysis {
  sentenceCount: number;
  averageWordsPerSentence: number;
  nounPhrases: string[];
  verbPhrases: string[];
  posDistribution: Record<POSTag, number>;
  complexity: 'simple' | 'moderate' | 'complex';
}

export const analyzeLinguisticPatterns = (text: string): LinguisticAnalysis => {
  const sentences = tokenizeSentences(text);
  const posTokens = tagPOS(text);
  const nounPhrases = extractNounPhrases(text);
  const verbPhrases = extractVerbPhrases(text);
  
  // Calculate POS distribution
  const posDistribution: Record<string, number> = {};
  posTokens.forEach(token => {
    posDistribution[token.tag] = (posDistribution[token.tag] || 0) + 1;
  });
  
  // Calculate complexity based on average sentence length and POS variety
  const avgWordsPerSentence = posTokens.length / sentences.length;
  const posVariety = Object.keys(posDistribution).length;
  
  let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
  if (avgWordsPerSentence > 20 || posVariety > 6) {
    complexity = 'complex';
  } else if (avgWordsPerSentence > 12 || posVariety > 4) {
    complexity = 'moderate';
  }
  
  return {
    sentenceCount: sentences.length,
    averageWordsPerSentence: avgWordsPerSentence,
    nounPhrases,
    verbPhrases,
    posDistribution: posDistribution as Record<POSTag, number>,
    complexity
  };
};
