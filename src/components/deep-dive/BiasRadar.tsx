import { useState, useEffect } from "react";
import { Article } from "@/lib/articles";
import { useArticles } from "@/hooks/useArticles";
import { CleanReaderModal } from "@/components/CleanReaderModal";
import { analyzeBias, getBiasColor, getBiasLabel, BiasRadarData } from "@/lib/biasAnalysis";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface BiasRadarProps {
  article: Article;
}

export const BiasRadar = ({ article }: BiasRadarProps) => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [readerOpen, setReaderOpen] = useState(false);
  const [biasData, setBiasData] = useState<BiasRadarData | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const { articles: allArticles, isLoading: articlesLoading } = useArticles();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (articlesLoading) return;

    const loadBiasData = async () => {
      setIsLoading(true);
      try {
        // Get related articles from same category
        const related = allArticles
          .filter(a => a.category === article.category || a.id === article.id)
          .slice(0, 30);

        setRelatedArticles(related.length > 0 ? related : [article]);
        const analysis = analyzeBias(related.length > 0 ? related : [article]);
        setBiasData(analysis);
      } catch (error) {
        console.error("Failed to analyze bias:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBiasData();
  }, [article, allArticles, articlesLoading]);

  const handleSourceClick = (sourceArticle: Article) => {
    setSelectedArticle(sourceArticle);
    setReaderOpen(true);
  };

  if (isLoading || !biasData) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate position for each source based on leaning and sentiment
  const getSourcePosition = (leaning: string, sentiment: number, index: number): { x: number; y: number } => {
    const leaningMap: Record<string, number> = {
      "left": 15,
      "center-left": 32.5,
      "center": 50,
      "center-right": 67.5,
      "right": 85,
    };

    const baseY = 50;
    const sentimentOffset = sentiment * 30; // -30 to +30
    const jitter = (Math.sin(index * 2.3) * 5); // Add small random offset to avoid overlap

    return {
      x: leaningMap[leaning] + jitter,
      y: baseY - sentimentOffset + (Math.cos(index * 1.7) * 5),
    };
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-8 animate-fade-in">
      <div className="max-w-6xl w-full space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight">
            WHO IS TELLING
            <br />
            THIS STORY?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore how {biasData.totalSources} sources with varying political perspectives cover {article.category} stories.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="outline" className="text-lg">
              Diversity Score: {biasData.diversityScore}/100
            </Badge>
            <Badge variant="outline" className="text-lg">
              {biasData.totalSources} Sources
            </Badge>
          </div>
        </div>

        <div className="bg-card border-2 border-border rounded-lg p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-y-0 left-[15%] w-px bg-muted"></div>
            <div className="absolute inset-y-0 left-[32.5%] w-px bg-muted"></div>
            <div className="absolute inset-y-0 left-1/2 w-px bg-foreground"></div>
            <div className="absolute inset-y-0 left-[67.5%] w-px bg-muted"></div>
            <div className="absolute inset-y-0 left-[85%] w-px bg-muted"></div>
          </div>

          <div className="relative">
            <div className="flex justify-between text-sm font-semibold mb-8 px-4">
              <span style={{ color: getBiasColor("left") }}>LEFT</span>
              <span className="text-muted-foreground">CENTER</span>
              <span style={{ color: getBiasColor("right") }}>RIGHT</span>
            </div>

            <div className="relative h-[400px] w-full">
              {biasData.sources.map((source, index) => {
                const relatedArticle = relatedArticles.find(a => a.publisher === source.publisher);
                const position = getSourcePosition(source.leaning, relatedArticle?.sentiment.compound || 0, index);

                return (
                  <div
                    key={`${source.publisher}-${index}`}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer animate-scale-in"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      animationDelay: `${index * 0.05}s`,
                    }}
                    onClick={() => relatedArticle && handleSourceClick(relatedArticle)}
                  >
                    <div
                      className="w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold transition-all duration-300 group-hover:scale-125 group-hover:z-10"
                      style={{
                        borderColor: getBiasColor(source.leaning),
                        backgroundColor: "hsl(var(--card))",
                      }}
                    >
                      <span className="text-xs text-center leading-tight">
                        {source.publisher.split(" ")[0].slice(0, 6)}
                      </span>
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-popover border border-border rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      <p className="font-semibold text-sm">{source.publisher}</p>
                      <p className="text-xs text-muted-foreground">
                        Leaning: {getBiasLabel(source.leaning)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Factuality: {source.factualityScore}/100
                      </p>
                      {relatedArticle && (
                        <p className="text-xs text-muted-foreground">
                          Sentiment: {relatedArticle.sentiment.compound > 0 ? "+" : ""}
                          {(relatedArticle.sentiment.compound * 100).toFixed(0)}%
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Coverage Distribution</h3>
            <div className="space-y-2">
              {[
                { label: "Left", count: biasData.leftCount, leaning: "left" as const },
                { label: "Center-Left", count: biasData.centerLeftCount, leaning: "center-left" as const },
                { label: "Center", count: biasData.centerCount, leaning: "center" as const },
                { label: "Center-Right", count: biasData.centerRightCount, leaning: "center-right" as const },
                { label: "Right", count: biasData.rightCount, leaning: "right" as const },
              ].map(({ label, count, leaning }) => (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getBiasColor(leaning) }}
                  />
                  <span className="flex-1">{label}</span>
                  <Badge variant="secondary">{count} {count === 1 ? "source" : "sources"}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Top Sources by Factuality</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {biasData.sources.slice(0, 10).map((source, index) => {
                const relatedArticle = relatedArticles.find(a => a.publisher === source.publisher);
                return (
                  <div
                    key={`${source.publisher}-${index}`}
                    className="bg-card border border-border rounded-lg p-3 hover:border-primary transition-colors cursor-pointer"
                    onClick={() => relatedArticle && handleSourceClick(relatedArticle)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getBiasColor(source.leaning) }}
                        />
                        <p className="font-semibold text-sm">{source.publisher}</p>
                      </div>
                      <Badge variant="secondary">{source.factualityScore}/100</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <CleanReaderModal
          article={selectedArticle}
          open={readerOpen}
          onOpenChange={setReaderOpen}
        />
      </div>
    </div>
  );
};
