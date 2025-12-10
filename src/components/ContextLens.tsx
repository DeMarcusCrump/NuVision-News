import { Article } from "@/lib/articles";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, CheckCircle2, TrendingUp, Users, Calendar } from "lucide-react";
import { getBiasLabel } from "@/lib/biasAnalysis";

interface ContextLensProps {
  article: Article;
  clusterSize?: number;
}

export const ContextLens = ({ article, clusterSize }: ContextLensProps) => {
  // Determine why factors
  const factors = [];

  // Breaking news detection
  const publishDate = article.date ? new Date(article.date) : new Date();
  const hoursOld = (Date.now() - publishDate.getTime()) / (1000 * 60 * 60);
  if (hoursOld < 24) {
    factors.push({
      icon: TrendingUp,
      label: "Breaking News",
      description: `Published ${Math.floor(hoursOld)}h ago - fresh coverage`,
      color: "text-red-500"
    });
  }

  // Source diversity
  if (clusterSize && clusterSize > 1) {
    factors.push({
      icon: Users,
      label: "Multiple Perspectives",
      description: `${clusterSize} sources covering this story`,
      color: "text-blue-500"
    });
  }

  // Category info (factual, not personalized)
  factors.push({
    icon: CheckCircle2,
    label: "Category",
    description: `${article.category} news article`,
    color: "text-green-500"
  });

  // Factuality score (if publisher is known)
  const hasKnownPublisher = article.publisher && article.publisher !== "Unknown";
  if (hasKnownPublisher) {
    factors.push({
      icon: CheckCircle2,
      label: "Verified Source",
      description: `${article.publisher} - established publisher`,
      color: "text-purple-500"
    });
  }

  // Recency factor
  const daysOld = Math.floor(hoursOld / 24);
  factors.push({
    icon: Calendar,
    label: daysOld === 0 ? "Today's News" : "Recent Coverage",
    description: daysOld === 0
      ? "Part of today's briefing"
      : `Published ${daysOld} day${daysOld === 1 ? '' : 's'} ago`,
    color: "text-orange-500"
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-accent/50"
          onClick={(e) => e.stopPropagation()}
        >
          <Info className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Why This Story?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We selected this story for your feed based on these factors:
          </p>

          <div className="space-y-3">
            {factors.map((factor, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-accent/20 rounded-lg">
                <factor.icon className={`h-5 w-5 mt-0.5 ${factor.color}`} />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{factor.label}</p>
                  <p className="text-xs text-muted-foreground">{factor.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Story Metadata</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Publisher:</span>
                <span className="font-medium">{article.publisher || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <Badge variant="secondary" className="text-xs">{article.category}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sentiment:</span>
                <Badge
                  variant="outline"
                  className="text-xs"
                >
                  {article.sentiment.compound > 0.1 ? "Positive" :
                    article.sentiment.compound < -0.1 ? "Negative" : "Neutral"}
                </Badge>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground pt-2 border-t border-border">
            Our feed algorithm prioritizes fresh news, source diversity, and balanced coverage to help you stay informed without information overload.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
