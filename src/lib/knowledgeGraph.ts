import { Article } from "./articles";
import { extractEntities, NEREntity } from "./aiService";

export interface GraphNode {
  id: string;
  label: string;
  type: "PERSON" | "ORG" | "LOC" | "EVENT" | "MISC";
  mentions: number;
  articleIds: number[];
}

export interface GraphLink {
  source: string;
  target: string;
  strength: number;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  links: GraphLink[];
}

export const extractKnowledgeGraph = async (articles: Article[]): Promise<KnowledgeGraph> => {
  console.log("Extracting knowledge graph from articles...");
  
  const entityMap = new Map<string, GraphNode>();
  const coOccurrences = new Map<string, Map<string, number>>();

  // Extract entities from each article
  for (const article of articles.slice(0, 20)) {
    try {
      const entities = await extractEntities(article.content);
      const articleEntities: string[] = [];

      entities.forEach((entity: NEREntity) => {
        const key = `${entity.word}-${entity.entity}`;
        articleEntities.push(key);

        if (!entityMap.has(key)) {
          entityMap.set(key, {
            id: key,
            label: entity.word,
            type: entity.entity.replace(/^[BI]-/, "") as GraphNode["type"],
            mentions: 0,
            articleIds: [],
          });
        }

        const node = entityMap.get(key)!;
        node.mentions++;
        if (!node.articleIds.includes(article.id)) {
          node.articleIds.push(article.id);
        }
      });

      // Track co-occurrences
      for (let i = 0; i < articleEntities.length; i++) {
        for (let j = i + 1; j < articleEntities.length; j++) {
          const pair = [articleEntities[i], articleEntities[j]].sort().join("||");
          
          if (!coOccurrences.has(pair)) {
            coOccurrences.set(pair, new Map());
          }
          
          const source = articleEntities[i];
          const target = articleEntities[j];
          const pairMap = coOccurrences.get(pair)!;
          pairMap.set(`${source}->${target}`, (pairMap.get(`${source}->${target}`) || 0) + 1);
        }
      }
    } catch (error) {
      console.error(`Failed to extract entities from article ${article.id}:`, error);
    }
  }

  // Build links from co-occurrences
  const links: GraphLink[] = [];
  coOccurrences.forEach((pairMap, pair) => {
    const [source, target] = pair.split("||");
    let strength = 0;
    pairMap.forEach((count) => {
      strength += count;
    });

    if (strength > 0) {
      links.push({ source, target, strength });
    }
  });

  const nodes = Array.from(entityMap.values()).filter(node => node.mentions >= 2);

  console.log(`Knowledge graph: ${nodes.length} nodes, ${links.length} links`);
  return { nodes, links };
};

export const getRelatedArticles = (node: GraphNode, allArticles: Article[]): Article[] => {
  return allArticles.filter(article => node.articleIds.includes(article.id));
};
