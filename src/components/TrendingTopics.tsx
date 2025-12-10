import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Article } from "@/lib/articles";
import { getEmergingTopics, Topic } from "@/lib/topicDiscovery";
import * as Icons from "lucide-react";

interface TrendingTopicsProps {
    articles: Article[];
    onTopicClick?: (topic: Topic) => void;
    maxTopics?: number;
}

export const TrendingTopics = ({ articles, onTopicClick, maxTopics = 10 }: TrendingTopicsProps) => {
    const topics = useMemo(() => getEmergingTopics(articles).slice(0, maxTopics), [articles, maxTopics]);

    if (topics.length === 0) {
        return null;
    }

    const getTrendIcon = (trend: Topic['trend']) => {
        switch (trend) {
            case 'rising':
                return <Icons.TrendingUp className="h-4 w-4 text-green-500" />;
            case 'falling':
                return <Icons.TrendingDown className="h-4 w-4 text-red-500" />;
            default:
                return <Icons.Minus className="h-4 w-4 text-gray-500" />;
        }
    };

    const getTrendColor = (trend: Topic['trend']) => {
        switch (trend) {
            case 'rising':
                return 'bg-green-500/10 text-green-700 dark:text-green-400';
            case 'falling':
                return 'bg-red-500/10 text-red-700 dark:text-red-400';
            default:
                return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Icons.Flame className="h-5 w-5 text-orange-500" />
                    Trending Topics
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Emerging topics from {articles.length} articles
                </p>
            </CardHeader>
            <CardContent className="space-y-2">
                {topics.map((topic, index) => (
                    <div
                        key={topic.name}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                        onClick={() => onTopicClick?.(topic)}
                    >
                        <div className="flex items-center gap-3 flex-1">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold capitalize">{topic.name}</h4>
                                    {getTrendIcon(topic.trend)}
                                </div>
                                {topic.keywords.length > 0 && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Related: {topic.keywords.slice(0, 3).join(', ')}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                {topic.count} {topic.count === 1 ? 'article' : 'articles'}
                            </Badge>
                            {topic.velocity !== 0 && (
                                <Badge className={`text-xs ${getTrendColor(topic.trend)}`}>
                                    {topic.velocity > 0 ? '+' : ''}{Math.round(topic.velocity)}%
                                </Badge>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};
