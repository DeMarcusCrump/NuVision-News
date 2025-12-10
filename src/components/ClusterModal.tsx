import { Article } from "@/lib/articles";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SentimentBadge } from "./SentimentBadge";
import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";
import { getHeadline } from "@/lib/articles";

interface ClusterModalProps {
  articles: Article[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onArticleSelect: (article: Article) => void;
}

export const ClusterModal = ({
  articles,
  open,
  onOpenChange,
  onArticleSelect,
}: ClusterModalProps) => {
  if (!articles.length) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {articles.length} Sources Covering This Story
          </DialogTitle>
          <DialogDescription>
            Compare coverage from different publishers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm text-primary">
                      {article.publisher}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {article.date}
                    </span>
                    <SentimentBadge compound={article.sentiment.compound} />
                  </div>
                  
                  <h4 className="font-semibold text-foreground mb-2">
                    {getHeadline(article.content)}
                  </h4>
                  
                  {article.author && (
                    <p className="text-sm text-muted-foreground mb-2">
                      By {article.author}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onArticleSelect(article);
                        onOpenChange(false);
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Read Full Article
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
