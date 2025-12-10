import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Article } from "@/lib/articles";
import { generateInsights, Insight } from "@/lib/insightGeneration";
import * as Icons from "lucide-react";

interface InsightPanelProps {
    articles: Article[];
    onArticleClick?: (articleId: number) => void;
}

export const InsightPanel = ({ articles, onArticleClick }: InsightPanelProps) => {
    const insights = useMemo(() => generateInsights(articles), [articles]);

    if (insights.length === 0) {
        return null;
    }

    const getInsightIcon = (type: Insight['type']) => {
        switch (type) {
            case 'trend':
                return Icons.TrendingUp;
            case 'anomaly':
                return Icons.AlertCircle;
            case 'comparison':
                return Icons.BarChart3;
            case 'sentiment':
                return Icons.Heart;
            default:
                return Icons.Lightbulb;
        }
    };

    const getInsightColor = (type: Insight['type']) => {
        switch (type) {
            case 'trend':
                return 'border-blue-500';
            case 'anomaly':
                return 'border-yellow-500';
            case 'sentiment':
                return 'border-purple-500';
            case 'comparison':
                return 'border-green-500';
            default:
                return 'border-gray-500';
        }
    };

    const getIconComponent = (iconName?: string) => {
        if (!iconName) return null;
        const IconComponent = (Icons as any)[iconName];
        return IconComponent ? <IconComponent className="h-6 w-6" /> : null;
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Icons.Lightbulb className="h-6 w-6 text-primary" />
                    Key Insights
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    AI-generated insights from {articles.length} articles
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {insights.slice(0, 5).map((insight, i) => {
                    const TypeIcon = getInsightIcon(insight.type);

                    return (
                        <div
                            key={i}
                            className={`border-l-4 ${getInsightColor(insight.type)} pl-4 py-2 space-y-2`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 flex-1">
                                    {insight.iconName && getIconComponent(insight.iconName)}
                                    <div className="flex-1">
                                        <h4 className="font-semibold flex items-center gap-2">
                                            {insight.title}
                                            <TypeIcon className="h-4 w-4" />
                                        </h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {insight.description}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-xs whitespace-nowrap">
                                    {Math.round(insight.confidence * 100)}% confident
                                </Badge>
                            </div>

                            {insight.relatedArticles.length > 0 && onArticleClick && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <span className="text-xs text-muted-foreground">Related:</span>
                                    {insight.relatedArticles.slice(0, 3).map((articleId) => (
                                        <Button
                                            key={articleId}
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onArticleClick(articleId)}
                                            className="text-xs h-6 px-2"
                                        >
                                            <Icons.FileText className="h-3 w-3 mr-1" />
                                            Article #{articleId}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
};
