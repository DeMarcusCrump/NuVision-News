import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Building2, User, Calendar, MapPin, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getArticleById } from "@/lib/articles";
import { CategoryTag } from "@/components/CategoryTag";
import { SentimentBadge } from "@/components/SentimentBadge";

const ArticlePage = () => {
  const { id } = useParams();
  const article = getArticleById(Number(id));

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <Link to="/home">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-4xl px-4 md:px-8 py-8">
        <Link to="/home">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Button>
        </Link>

        <article className="animate-fade-in space-y-6">
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <CategoryTag category={article.category} />
            <SentimentBadge compound={article.sentiment.compound} />
            {article.clusteredSources && (
              <Badge variant="secondary" className="gap-1">
                <Layers className="h-3 w-3" />
                {article.clusteredSources} Sources
              </Badge>
            )}
          </div>

          {/* Source Metadata */}
          <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground pb-6 border-b border-border">
            {article.publisher && (
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {article.publisher}
              </span>
            )}
            {article.author && (
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {article.author}
              </span>
            )}
            {article.date && (
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(article.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            )}
            {article.region && (
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {article.region}
              </span>
            )}
          </div>

          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-foreground leading-relaxed text-base sm:text-lg whitespace-pre-wrap">
              {article.content}
            </p>
          </div>

          {article.deep_dive_format && (
            <div className="mt-12 p-6 sm:p-8 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Want to explore deeper?</h3>
              <p className="text-muted-foreground mb-6">
                This article has an interactive {article.deep_dive_format} experience available.
              </p>
              <Link to={`/deep-dive/${article.id}`}>
                <Button size="lg" className="bg-primary text-primary-foreground w-full sm:w-auto">
                  Enter Deep Dive
                </Button>
              </Link>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};

export default ArticlePage;
