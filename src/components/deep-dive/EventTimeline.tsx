import { useEffect, useRef, useState } from "react";
import { Article } from "@/lib/articles";
import { useArticles } from "@/hooks/useArticles";
import { CleanReaderModal } from "@/components/CleanReaderModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { extractTimeline, TimelineEvent, groupEventsByMonth } from "@/lib/timelineExtraction";
import { Loader2 } from "lucide-react";

interface EventTimelineProps {
  article: Article;
}

export const EventTimeline = ({ article }: EventTimelineProps) => {
  const [visibleEvents, setVisibleEvents] = useState<number[]>([]);
  const [readerOpen, setReaderOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const { articles: allArticles, isLoading: articlesLoading } = useArticles();
  const [isLoading, setIsLoading] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (articlesLoading) return;

    const loadTimeline = async () => {
      setIsLoading(true);
      try {
        // Get related articles from same category
        const relatedArticles = allArticles
          .filter(a => a.category === article.category || a.id === article.id)
          .slice(0, 15);

        const events = await extractTimeline(relatedArticles.length > 0 ? relatedArticles : [article]);
        setTimelineEvents(events);
      } catch (error) {
        console.error("Failed to extract timeline:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTimeline();
  }, [article, allArticles, articlesLoading]);

  const handleViewSource = (event: TimelineEvent) => {
    const sourceArticle = allArticles.find(a => a.id === event.articleId);
    if (sourceArticle) {
      setSelectedArticle(sourceArticle);
      setReaderOpen(true);
    }
  };

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setVisibleEvents((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.5 }
    );

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="w-full min-h-screen py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight">
            THE STORY
            <br />
            SO FAR
          </h1>
          <p className="text-xl text-muted-foreground">
            A chronological breakdown of events in {article.category}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-accent to-secondary transform -translate-x-1/2"></div>

            {/* Timeline events */}
            <div className="space-y-24">
              {timelineEvents.map((event, index) => {
                const isLeft = index % 2 === 0;
                const isVisible = visibleEvents.includes(index);

                return (
                  <div
                    key={`${event.articleId}-${index}`}
                    data-index={index}
                    ref={(el) => el && observerRef.current?.observe(el)}
                    className={`relative ${isLeft ? "pr-[52%]" : "pl-[52%]"}`}
                  >
                    {/* Timeline node */}
                    <div
                      className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 border-primary bg-background transition-all duration-500 ${isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
                        }`}
                    ></div>

                    {/* Event card */}
                    <div
                      className={`bg-card border-2 border-border rounded-lg p-6 transition-all duration-700 ${isVisible
                          ? "opacity-100 translate-x-0"
                          : `opacity-0 ${isLeft ? "-translate-x-8" : "translate-x-8"}`
                        }`}
                      style={{ transitionDelay: `${index * 0.1}s` }}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-sm font-bold text-primary uppercase tracking-wider">
                            {event.dateString}
                          </div>
                          {event.publisher && (
                            <Badge variant="outline" className="text-xs">
                              {event.publisher}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold">{event.headline}</h3>
                        <p className="text-muted-foreground">{event.summary}</p>

                        {event.entities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {event.entities.map((entity, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {entity}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewSource(event)}
                          className="mt-2"
                        >
                          View Source
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <CleanReaderModal
          article={selectedArticle}
          open={readerOpen}
          onOpenChange={setReaderOpen}
        />
      </div>
    </div>
  );
};
