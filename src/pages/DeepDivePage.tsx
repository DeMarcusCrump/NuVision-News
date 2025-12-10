import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useArticles } from "@/hooks/useArticles";
import { BiasRadar } from "@/components/deep-dive/BiasRadar";
import { EventTimeline } from "@/components/deep-dive/EventTimeline";
import { KnowledgeMap } from "@/components/deep-dive/KnowledgeMap";
import { DeepVisionMode } from "@/components/deep-dive/DeepVisionMode";

const DeepDivePage = () => {
  const { id } = useParams();
  const { articles, isLoading } = useArticles();

  // Find article by ID
  const article = articles.find(a => a.id === Number(id));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!article || !article.deep_dive_format) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Deep Dive Not Available</h1>
          <p className="text-muted-foreground mb-8">
            {!article
              ? "Article not found. It may have been removed or the ID is incorrect."
              : "This article doesn't have a Deep Dive experience."}
          </p>
          <Link to="/home">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed top-4 left-4 z-50">
        <Link to="/home">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Exit Deep Dive
          </Button>
        </Link>
      </div>

      {article.deep_dive_format === "Bias Radar" && <BiasRadar article={article} />}
      {article.deep_dive_format === "Event Timeline" && <EventTimeline article={article} />}
      {article.deep_dive_format === "Knowledge Map" && <KnowledgeMap article={article} />}
      {article.deep_dive_format === "Deep Vision" && <DeepVisionMode article={article} />}
    </div>
  );
};

export default DeepDivePage;
