import { Article } from "./articles";
import { extractEntities } from "./aiService";

export interface TimelineEvent {
  date: Date;
  dateString: string;
  headline: string;
  summary: string;
  articleId: number;
  publisher?: string;
  entities: string[];
  sentiment: number;
}

export const extractTimeline = async (articles: Article[]): Promise<TimelineEvent[]> => {
  const events: TimelineEvent[] = [];
  
  for (const article of articles) {
    try {
      // Extract entities from the article
      const entities = await extractEntities(article.content.slice(0, 1000));
      
      // Extract date from article or use publication date
      const dateMatch = article.content.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/i);
      const extractedDate = dateMatch ? new Date(dateMatch[0]) : null;
      
      // Use extracted date or article date or current date
      const eventDate = extractedDate || (article.date ? new Date(article.date) : new Date());
      
      // Extract headline and summary
      const sentences = article.content.split(". ");
      const headline = sentences[0];
      const summary = sentences.slice(1, 3).join(". ");
      
      // Get key entities (persons, organizations, locations)
      const keyEntities = entities
        .filter(e => ["PERSON", "ORG", "GPE", "LOC"].includes(e.entity))
        .map(e => e.word)
        .slice(0, 5);
      
      events.push({
        date: eventDate,
        dateString: eventDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        headline,
        summary: summary || headline,
        articleId: article.id,
        publisher: article.publisher,
        entities: keyEntities,
        sentiment: article.sentiment.compound,
      });
    } catch (error) {
      console.error(`Failed to extract timeline for article ${article.id}:`, error);
    }
  }
  
  // Sort by date (most recent first)
  return events.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const groupEventsByMonth = (events: TimelineEvent[]): Record<string, TimelineEvent[]> => {
  const grouped: Record<string, TimelineEvent[]> = {};
  
  events.forEach(event => {
    const monthYear = event.date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
    
    if (!grouped[monthYear]) {
      grouped[monthYear] = [];
    }
    
    grouped[monthYear].push(event);
  });
  
  return grouped;
};
