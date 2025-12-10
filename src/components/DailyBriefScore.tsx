import { Trophy, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DailyBriefScoreProps {
  noveltyScore: number;
  diversityScore: number;
  totalArticles: number;
}

export const DailyBriefScore = ({ noveltyScore, diversityScore, totalArticles }: DailyBriefScoreProps) => {
  const overallScore = Math.round((noveltyScore + diversityScore) / 2);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 40) return "text-warning";
    return "text-danger";
  };

  const getMessage = (score: number) => {
    if (score >= 80) return "Excellent diversity! You're exploring many perspectives.";
    if (score >= 60) return "Good balance! Consider adding more counter-perspectives.";
    if (score >= 40) return "Moderate variety. Try exploring different viewpoints.";
    return "Limited diversity. Branch out to get a fuller picture.";
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 mb-8 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Today's Brief Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Novelty Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(noveltyScore)}`}>
                {noveltyScore}
              </span>
            </div>
            <Progress value={noveltyScore} className="h-2" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Diversity Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(diversityScore)}`}>
                {diversityScore}
              </span>
            </div>
            <Progress value={diversityScore} className="h-2" />
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold">Overall Score</span>
            <span className={`text-4xl font-black ${getScoreColor(overallScore)}`}>
              {overallScore}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{getMessage(overallScore)}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{totalArticles} articles from diverse sources today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};