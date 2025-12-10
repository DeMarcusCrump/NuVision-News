import { Article } from "./articles";

// Read the NewsAPI key from Vite environment variables.
// Create a file named `.env` with `VITE_NEWSAPI_KEY=your_key_here` in the project root.
// Use a cast to `any` to avoid TypeScript errors when `vite/client` types are not present.
const NEWS_API_KEY = (import.meta as any).env?.VITE_NEWSAPI_KEY as string | undefined;
const NEWS_API_BASE_URL = "https://newsapi.org/v2";

export interface NewsAPIArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

export const fetchLiveNews = async (
  category?: string,
  query?: string,
  pageSize: number = 20
): Promise<Article[]> => {
  try {
    if (!NEWS_API_KEY) {
      throw new Error("Missing NewsAPI key. Set VITE_NEWSAPI_KEY in your .env file.");
    }

    // Build URL using URL and URLSearchParams to avoid manual string concat issues.
    let endpoint = "top-headlines";
    const params = new URLSearchParams({
      apiKey: NEWS_API_KEY,
      pageSize: String(pageSize),
      country: "us",
    });

    if (category && category !== "all") {
      params.set("category", category.toLowerCase());
    }

    if (query) {
      // If a query is provided, use the `everything` endpoint for broader search
      endpoint = "everything";
      params.delete("country");
      params.set("q", query);
      params.set("sortBy", "publishedAt");
    }

    const url = `${NEWS_API_BASE_URL}/${endpoint}?${params.toString()}`;

    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`NewsAPI error: ${response.status} ${response.statusText} ${text}`);
    }

    const data: NewsAPIResponse = await response.json();

    // Generate stable hash from URL for consistent IDs across fetches
    const hashCode = (str: string): number => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash);
    };

    // Helper to detect category from content/source
    const detectCategory = (article: NewsAPIArticle): string => {
      if (category && category !== "all") return category.charAt(0).toUpperCase() + category.slice(1);

      const text = `${article.title} ${article.description || ""} ${article.source.name}`.toLowerCase();

      if (/politic|congress|senate|election|vote|democrat|republican|biden|trump/.test(text)) return "Politics";
      if (/business|market|stock|economy|company|ceo|earnings/.test(text)) return "Business";
      if (/tech|software|ai|google|apple|microsoft|startup/.test(text)) return "Technology";
      if (/health|medical|doctor|hospital|disease|wellness/.test(text)) return "Health";
      if (/science|research|study|discover|nasa|space/.test(text)) return "Science";
      if (/sport|game|team|nfl|nba|mlb|football|basketball/.test(text)) return "Sports";
      if (/movie|film|music|celebrity|entertainment|show/.test(text)) return "Entertainment";
      if (/world|international|foreign|global|country/.test(text)) return "World News";
      if (/climate|environment|green|pollution|carbon/.test(text)) return "Environment";

      return "General";
    };

    // Helper to assign deep dive format based on content
    const assignDeepDive = (article: NewsAPIArticle, cat: string): Article["deep_dive_format"] => {
      const text = `${article.title} ${article.description || ""}`.toLowerCase();

      if (cat === "Politics" || cat === "World News" || /bias|opinion|partisan/.test(text)) return "Bias Radar";
      if (/timeline|event|incident|arrest|crime|investigation/.test(text)) return "Event Timeline";
      if (cat === "Technology" || cat === "Business" || /company|system|network/.test(text)) return "Knowledge Map";
      if (cat === "Science" || cat === "Health" || cat === "Environment") return "Deep Vision";

      // Default assignment for substantial content
      if ((article.content?.length || 0) > 200) return "Knowledge Map";
      return "Knowledge Map"; // Always assign a format for live articles
    };

    return data.articles.map((article, index) => {
      const detectedCategory = detectCategory(article);
      // Use URL hash for stable ID that persists across fetches
      const stableId = article.url ? hashCode(article.url) : Date.now() + index;

      return {
        id: stableId,
        content: `${article.title}. ${article.description || ""} ${article.content || ""}`,
        category: detectedCategory,
        sentiment: {
          polarity: 0,
          compound: Math.random() * 0.4 - 0.2,
        },
        url: article.url,
        urlToImage: article.urlToImage,
        publisher: article.source.name,
        author: article.author || "Unknown",
        date: new Date(article.publishedAt).toISOString().split('T')[0],
        region: "US",
        deep_dive_format: assignDeepDive(article, detectedCategory),
      };
    });
  } catch (error) {
    console.error("Failed to fetch live news:", error);
    throw error;
  }
};

// --- Caching & helpers ---
const CACHE_KEY = "nv_live_news_cache";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes - reduced API calls!

type CacheEntry = {
  key: string;
  timestamp: number;
  data: Article[];
};

const makeCacheKey = (category?: string, query?: string, pageSize?: number) => {
  return `endpoint=${query ? "everything" : "top-headlines"}|category=${category || "all"}|q=${query || ""}|pageSize=${pageSize || 20}`;
};

const readCache = (cacheKey: string): Article[] | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry[];
    const entry = parsed.find((e) => e.key === cacheKey);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null;
    return entry.data;
  } catch (error) {
    console.warn("Failed to read news cache:", error);
    return null;
  }
};

const writeCache = (cacheKey: string, data: Article[]) => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const parsed = raw ? (JSON.parse(raw) as CacheEntry[]) : [];
    const remaining = parsed.filter((e) => e.key !== cacheKey);
    remaining.push({ key: cacheKey, timestamp: Date.now(), data });
    // Keep cache small
    const maxEntries = 10;
    const sliced = remaining.slice(-maxEntries);
    localStorage.setItem(CACHE_KEY, JSON.stringify(sliced));
  } catch (error) {
    console.warn("Failed to write news cache:", error);
  }
};

/**
 * Fetch live news with an in-browser cache (localStorage) and optional force refresh.
 */
export const fetchLiveNewsCached = async (
  category?: string,
  query?: string,
  pageSize: number = 20,
  forceRefresh = false
): Promise<Article[]> => {
  const cacheKey = makeCacheKey(category, query, pageSize);

  if (!forceRefresh) {
    const cached = readCache(cacheKey);
    if (cached && cached.length > 0) {
      return cached;
    }
  }

  const fresh = await fetchLiveNews(category, query, pageSize);
  try {
    writeCache(cacheKey, fresh);
  } catch (e) {
    // ignore cache write failures
  }
  return fresh;
};

/**
 * Validate the NewsAPI key by requesting a minimal top-headlines response.
 * Returns true if key looks valid (status 200 and returned articles field), false otherwise.
 */
export const validateNewsApiKey = async (): Promise<boolean> => {
  if (!NEWS_API_KEY) return false;

  try {
    const params = new URLSearchParams({ apiKey: NEWS_API_KEY, pageSize: "1", country: "us" });
    const url = `${NEWS_API_BASE_URL}/top-headlines?${params.toString()}`;
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      return false;
    }
    const json = await res.json().catch(() => null);
    return !!json && Array.isArray(json.articles);
  } catch (error) {
    console.warn("NewsAPI key validation failed:", error);
    return false;
  }
};

export const newsCategories = [
  "all",
  "business",
  "entertainment",
  "general",
  "health",
  "science",
  "sports",
  "technology",
];
