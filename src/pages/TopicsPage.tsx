import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useArticles } from "@/hooks/useArticles";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TopicsPage = () => {
  const { articles, isLoading, hasApiKey } = useArticles();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(articles.map(a => a.category)));

  const categoryArticles = selectedCategory
    ? articles.filter(a => a.category === selectedCategory).slice(0, 20)
    : [];

  const getCategoryCount = (category: string) => {
    return articles.filter(a => a.category === category).length;
  };

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
            <FolderOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-bold mb-2">No API Key Configured</h1>
            <p className="text-muted-foreground mb-4">
              Add your NewsAPI key in Settings to browse live news by topic
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
            <FolderOpen className="h-12 w-12 text-primary" />
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight">Topics</h1>
              <p className="text-xl text-muted-foreground mt-2">
                Browse news by category
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-sm hover:bg-primary/20 transition-colors"
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              >
                {category} ({getCategoryCount(category)})
              </Badge>
            ))}
          </div>

          {selectedCategory && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-2xl font-bold">{selectedCategory}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryArticles.map((article) => (
                  <Link key={article.id} to={`/article/${article.id}`}>
                    <Card className="bg-card border-border hover:border-primary transition-all hover:scale-[1.02] h-full cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-bold text-primary">#{article.id}</span>
                          {article.clusteredSources && (
                            <Badge variant="secondary" className="text-xs">
                              {article.clusteredSources} sources
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm line-clamp-4">{article.content}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {!selectedCategory && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Select a category to view articles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicsPage;