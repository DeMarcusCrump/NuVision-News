import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SentimentBadge } from "./SentimentBadge";
import { CategoryTag } from "./CategoryTag";
import { ContextLens } from "./ContextLens";
import { Article, getHeadline, getSummary } from "@/lib/articles";
import { getCardColor } from "@/lib/cardColors";
import { ArrowRight, Building2, User, Calendar, MapPin, Layers, Lightbulb, Radio, Clock, Network, Eye, FileText, MessageSquare, BarChart3, Award } from "lucide-react";

interface ArticleCardProps {
  article: Article;
  index: number;
  onReadMore: (article: Article) => void;
  onDeepDive: (articleId: number) => void;
  onViewCluster?: () => void;
}

export const ArticleCard = ({ article, index, onReadMore, onDeepDive, onViewCluster }: ArticleCardProps) => {
  const headline = getHeadline(article.content);
  const summary = getSummary(article.content);
  const bgColor = getCardColor(index);

  const getDeepDiveConfig = (format: Article["deep_dive_format"]) => {
    switch (format) {
      case "Bias Radar":
        return { icon: Radio, label: "Bias Radar", color: "bg-chart-1/20 text-chart-1 border-chart-1/30" };
      case "Event Timeline":
        return { icon: Clock, label: "Timeline", color: "bg-chart-2/20 text-chart-2 border-chart-2/30" };
      case "Knowledge Map":
        return { icon: Network, label: "Knowledge Map", color: "bg-chart-3/20 text-chart-3 border-chart-3/30" };
      case "Deep Vision":
        return { icon: Eye, label: "Deep Vision", color: "bg-chart-4/20 text-chart-4 border-chart-4/30" };
      default:
        return null;
    }
  };

  const deepDiveConfig = article.deep_dive_format ? getDeepDiveConfig(article.deep_dive_format) : null;

  const getContentTypeConfig = (type: Article["contentType"]) => {
    switch (type) {
      case "opinion":
        return { icon: MessageSquare, label: "Opinion", color: "bg-orange-500/20 text-orange-700 dark:text-orange-300" };
      case "analysis":
        return { icon: BarChart3, label: "Analysis", color: "bg-blue-500/20 text-blue-700 dark:text-blue-300" };
      case "news":
        return { icon: FileText, label: "News Report", color: "bg-green-500/20 text-green-700 dark:text-green-300" };
      default:
        return null;
    }
  };

  const contentTypeConfig = article.contentType ? getContentTypeConfig(article.contentType) : null;

  return (
    <Card className="article-card flex flex-col h-full border-2 border-background hover:border-foreground transition-all duration-300 animate-fade-in overflow-hidden touch-manipulation">
      {/* Story number badge & Deep Dive indicator */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        <Badge variant="outline" className="bg-background/90 backdrop-blur font-bold border-2 border-foreground text-xs sm:text-sm">
          #{article.id}
        </Badge>
        {deepDiveConfig && (() => {
          const IconComponent = deepDiveConfig.icon;
          return (
            <Badge
              variant="outline"
              className={`backdrop-blur font-semibold border-2 text-xs flex items-center gap-1 ${deepDiveConfig.color}`}
              title={`${deepDiveConfig.label} available`}
            >
              <IconComponent className="h-3 w-3" />
              <span className="hidden sm:inline">{deepDiveConfig.label}</span>
            </Badge>
          );
        })()}
      </div>
      <div className="absolute top-3 right-3 z-10">
        <ContextLens article={article} clusterSize={article.clusteredSources} />
      </div>

      {/* Colored header section */}
      <div className={`${bgColor} p-4 sm:p-6 pt-10 sm:pt-12 min-h-[140px] sm:min-h-[180px] flex items-center justify-center relative`}>
        <h3 className="text-xl sm:text-2xl font-black text-background leading-tight text-center line-clamp-3">
          {headline}
        </h3>
        {article.urlToImage && (
          <img src={article.urlToImage} alt={headline} className="absolute right-3 bottom-3 w-20 h-12 object-cover rounded shadow-lg hidden sm:block" />
        )}
      </div>

      {/* Content section */}
      <CardHeader className="bg-card space-y-3 pt-4 px-4 sm:px-6">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryTag category={article.category} />
          <SentimentBadge compound={article.sentiment.compound} />
          {contentTypeConfig && (() => {
            const TypeIcon = contentTypeConfig.icon;
            return (
              <Badge variant="outline" className={`gap-1 text-xs font-semibold ${contentTypeConfig.color} border-0`}>
                <TypeIcon className="h-3 w-3" />
                {contentTypeConfig.label}
              </Badge>
            );
          })()}
          {article.clusteredSources && article.clusteredSources > 1 && (
            <Badge
              variant="secondary"
              className="gap-1 text-xs cursor-pointer hover:bg-secondary/80"
              onClick={onViewCluster}
            >
              <Layers className="h-3 w-3" />
              {article.clusteredSources} Sources
            </Badge>
          )}
        </div>

        {/* Source Metadata */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs text-muted-foreground">
          {article.publisher && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              <span className="hidden sm:inline">{article.publisher}</span>
              <span className="sm:hidden">{article.publisher.split(' ')[0]}</span>
            </span>
          )}
          {article.author && (
            <span className="flex items-center gap-1 hidden sm:flex">
              <User className="h-3 w-3" />
              {article.author}
            </span>
          )}
          {article.date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {article.region && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {article.region}
            </span>
          )}
        </div>

        {/* Author Expertise Badge */}
        {article.authorExpertise && (
          <div className="flex items-start gap-2 p-2 rounded bg-accent/10 border border-accent/20">
            <Award className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
            <span className="text-xs text-accent font-medium">{article.authorExpertise}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 bg-card space-y-3 px-4 sm:px-6 pb-4">
        <p className="text-sm sm:text-base text-muted-foreground line-clamp-3">{summary}</p>

        {/* Primary Sources */}
        {article.primarySources && article.primarySources.length > 0 && (
          <div className="p-2 rounded bg-secondary/10 border border-secondary/20">
            <div className="text-xs font-semibold text-secondary mb-1">Primary Sources:</div>
            <div className="flex flex-wrap gap-2">
              {article.primarySources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-secondary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {source.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Why Recommended */}
        {article.recommendationReason && (
          <div className="flex items-start gap-2 p-2 rounded bg-primary/10 border border-primary/20">
            <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-xs text-primary font-medium">{article.recommendationReason}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 bg-card px-4 sm:px-6 pb-4">
        <Button
          variant="outline"
          className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
          onClick={() => onReadMore(article)}
        >
          <span className="hidden sm:inline">Read More</span>
          <span className="sm:hidden">Read</span>
          <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        {article.url && (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1"
          >
            <Button variant="ghost" className="w-full text-xs sm:text-sm h-9 sm:h-10">
              Open original
            </Button>
          </a>
        )}
        {article.deep_dive_format ? (
          <Button
            className="flex-1 bg-primary text-primary-foreground text-xs sm:text-sm h-9 sm:h-10"
            onClick={() => onDeepDive(article.id)}
          >
            {deepDiveConfig && (() => {
              const IconComponent = deepDiveConfig.icon;
              return (
                <>
                  <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Deep Dive</span>
                  <span className="sm:hidden">Dive</span>
                </>
              );
            })()}
          </Button>
        ) : (
          <Button disabled variant="ghost" className="flex-1 text-xs sm:text-sm h-9 sm:h-10 opacity-50">
            No Deep Dive
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
