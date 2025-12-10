import { Link } from "react-router-dom";
import { ArrowLeft, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useArticles } from "@/hooks/useArticles";
import { analyzeBias, getBiasColor, getBiasLabel, BiasRadarData } from "@/lib/biasAnalysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

const BiasRadarPage = () => {
  const { articles, isLoading, hasApiKey } = useArticles();

  // Filter for articles that have Bias Radar or are political
  const biasArticles = articles.filter(a =>
    a.deep_dive_format === "Bias Radar" ||
    a.category.toLowerCase().includes('politic') ||
    a.category.toLowerCase().includes('world')
  ).slice(0, 50);

  const biasData: BiasRadarData = useMemo(() => analyzeBias(biasArticles), [biasArticles]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!hasApiKey && articles.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Radio className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-bold mb-2">No API Key Configured</h1>
            <p className="text-muted-foreground mb-4">
              Add your NewsAPI key in Settings to analyze live news sources
            </p>
            <Link to="/settings">
              <Button>Go to Settings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-6xl px-4 md:px-8 py-8">
        <Link to="/home">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="space-y-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <Radio className="h-12 w-12 text-primary" />
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight">Bias Radar</h1>
              <p className="text-xl text-muted-foreground mt-2">
                Explore source diversity and ideological spread
              </p>
            </div>
          </div>

          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Source Diversity Analysis</span>
                <Badge variant="outline" className="text-lg font-bold">
                  {biasData.diversityScore}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 text-sm">Political Spectrum Distribution</h3>
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {[
                    { label: "Left", count: biasData.leftCount, color: getBiasColor("left") },
                    { label: "Center-Left", count: biasData.centerLeftCount, color: getBiasColor("center-left") },
                    { label: "Center", count: biasData.centerCount, color: getBiasColor("center") },
                    { label: "Center-Right", count: biasData.centerRightCount, color: getBiasColor("center-right") },
                    { label: "Right", count: biasData.rightCount, color: getBiasColor("right") },
                  ].map(({ label, count, color }) => (
                    <div key={label} className="text-center">
                      <div
                        className="h-24 rounded-lg flex items-end justify-center p-2 border-2 border-background"
                        style={{
                          backgroundColor: color,
                          opacity: count > 0 ? 1 : 0.2,
                        }}
                      >
                        <span className="text-2xl font-bold text-background">{count}</span>
                      </div>
                      <p className="text-xs mt-2 font-medium">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-muted-foreground">Total Sources</p>
                  <p className="text-2xl font-bold">{biasData.totalSources}</p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-muted-foreground">Avg Sentiment</p>
                  <p className="text-2xl font-bold">
                    {biasData.averageSentiment > 0 ? "+" : ""}{(biasData.averageSentiment * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-sm">Source Factuality Ratings</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {biasData.sources.slice(0, 10).map((source) => (
                    <div key={source.publisher} className="flex items-center justify-between p-2 bg-background/50 rounded">
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getBiasColor(source.leaning) }}
                        />
                        <span className="text-sm font-medium truncate">{source.publisher}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{getBiasLabel(source.leaning)}</span>
                        <Badge variant="secondary" className="text-xs">
                          {source.factualityScore}/100
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {biasArticles.map((article) => (
              <Link key={article.id} to={`/deep-dive/${article.id}`}>
                <Card className="bg-card border-border hover:border-primary transition-all hover:scale-[1.02] h-full cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-bold text-primary">#{article.id}</span>
                      <span className="text-xs text-muted-foreground">{article.category}</span>
                    </div>
                    <p className="text-sm line-clamp-4">{article.content}</p>
                    <Button variant="outline" size="sm" className="mt-4 w-full">
                      View Bias Radar
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiasRadarPage;