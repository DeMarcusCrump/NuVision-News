import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ArticleCard } from "@/components/ArticleCard";
import { ConversationalQuery } from "@/components/ConversationalQuery";
import { CleanReaderModal } from "@/components/CleanReaderModal";
import { ClusterModal } from "@/components/ClusterModal";
import { DailyBriefScore } from "@/components/DailyBriefScore";
import { Article, ContextLens, enrichArticleMetadata } from "@/lib/articles";
import { calculateBriefScore } from "@/lib/briefScoring";
import { applyContextLensEnhanced } from "@/lib/contextLensEnhanced";
import { fetchLiveNewsCached, validateNewsApiKey } from "@/lib/newsApi";
import { clusterArticles, ClusteredArticle } from "@/lib/clustering";
import { loadUploadedArticles, addUploadedArticles, deleteUploadedArticle } from "@/lib/uploadedArticles";
import { ArticleUpload } from "@/components/ArticleUpload";
import { InsightPanel } from "@/components/InsightPanel";
import { TrendingTopics } from "@/components/TrendingTopics";
import { ExportMenu, exportArticles } from "@/components/ExportMenu";
import { ArticleGridSkeleton } from "@/components/ArticleCardSkeleton";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader2, Rss, RefreshCw, Layers, MoreHorizontal, Upload, Download, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isConversational, setIsConversational] = useState(false);
  const [activeFilter, setActiveFilter] = useState("brief");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [readerOpen, setReaderOpen] = useState(false);
  const [contextLens, setContextLens] = useState<ContextLens>("none");
  const [isLiveNews, setIsLiveNews] = useState(false);
  const [liveArticles, setLiveArticles] = useState<Article[]>([]);
  const [newsApiKeyValid, setNewsApiKeyValid] = useState<boolean | null>(null);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [enableClustering, setEnableClustering] = useState(false);
  const [clusteredArticles, setClusteredArticles] = useState<ClusteredArticle[]>([]);
  const [isClusteringInProgress, setIsClusteringInProgress] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<Article[]>([]);
  const [clusterModalOpen, setClusterModalOpen] = useState(false);
  // AI availability check removed - clustering feature removed
  const [uploadedArticles, setUploadedArticles] = useState<Article[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [contextLensMessage, setContextLensMessage] = useState<string>("");

  const navigate = useNavigate();
  // Read NewsAPI key presence for UI disabling
  const hasNewsApiKey = (import.meta as any).env?.VITE_NEWSAPI_KEY;

  // Merge live news and uploaded articles
  const allArticles = useMemo(() => {
    const enriched = enrichArticleMetadata(liveArticles);
    return [...enriched, ...uploadedArticles];
  }, [liveArticles, uploadedArticles]);

  const articles = enableClustering && clusteredArticles.length > 0
    ? clusteredArticles
    : allArticles;

  // Load uploaded articles from localStorage on mount
  useEffect(() => {
    const uploaded = loadUploadedArticles();
    setUploadedArticles(uploaded);
  }, []);

  // Auto-load live news on mount if API key exists
  useEffect(() => {
    const loadLiveNews = async () => {
      if (hasNewsApiKey && liveArticles.length === 0) {
        setIsLoadingNews(true);
        try {
          const news = await fetchLiveNewsCached(undefined, undefined, 50);
          setLiveArticles(news);
          toast({
            title: "Live news loaded",
            description: `Fetched ${news.length} articles from NewsAPI`,
          });
        } catch (error) {
          console.error('Failed to load live news:', error);
          toast({
            title: "Failed to load live news",
            description: "Check your NewsAPI key or upload articles manually",
            variant: "destructive",
          });
        } finally {
          setIsLoadingNews(false);
        }
      }
    };

    loadLiveNews();
  }, [hasNewsApiKey]);

  useEffect(() => {
    // Validate API key on mount if possible
    const checkKey = async () => {
      const valid = await validateNewsApiKey();
      setNewsApiKeyValid(valid);
    };
    checkKey();
  }, []);

  useEffect(() => {
    const performClustering = async () => {
      if (enableClustering && !isClusteringInProgress) {
        setIsClusteringInProgress(true);
        toast({
          title: "Clustering stories...",
          description: "Analyzing articles to find similar coverage",
        });

        try {
          const sourceArticles = allArticles;
          const clustered = await clusterArticles(sourceArticles.slice(0, 100)); // Limit to 100 for performance
          setClusteredArticles(clustered);

          const totalClusters = clustered.length;
          const multiSourceClusters = clustered.filter(a => a.clusterSize > 1).length;

          toast({
            title: "Clustering complete",
            description: `Found ${multiSourceClusters} stories with multiple sources from ${totalClusters} total clusters`,
          });
        } catch (error) {
          toast({
            title: "Clustering failed",
            description: "Could not cluster articles",
            variant: "destructive",
          });
          setEnableClustering(false);
        } finally {
          setIsClusteringInProgress(false);
        }
      }
    };

    performClustering();
  }, [enableClustering, allArticles, isClusteringInProgress]);

  const filteredArticles = useMemo(() => {
    let result = articles;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (article) =>
          article.content.toLowerCase().includes(query) ||
          article.category.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (activeFilter === "brief") {
      result = result.slice(0, 100); // Daily brief - top 100
    } else if (activeFilter === "trending") {
      // Trending: Most recent articles, sorted by date
      result = [...result]
        .sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 30);
    } else if (activeFilter === "bias") {
      // Show only articles with Bias Radar
      result = result.filter(a => a.deep_dive_format === "Bias Radar");
    } else if (activeFilter !== "all" && activeFilter !== "topics" && activeFilter !== "audio") {
      // Filter by specific category
      result = result.filter(a => a.category.toLowerCase() === activeFilter.toLowerCase());
    }

    // Apply context lens filtering with feedback
    const lensResult = applyContextLensEnhanced(result, contextLens);
    setContextLensMessage(lensResult.description);
    result = lensResult.articles;

    return result;
  }, [articles, searchQuery, activeFilter, contextLens]);

  const handleReadMore = (article: Article) => {
    setSelectedArticle(article);
    setReaderOpen(true);
  };

  const handleCitationClick = (articleId: number) => {
    const article = articles.find(a => a.id === articleId);
    if (article) {
      setSelectedArticle(article);
      setReaderOpen(true);
    }
  };

  const handleDeepDive = (articleId: number) => {
    navigate(`/deep-dive/${articleId}`);
  };

  const handleViewCluster = (article: ClusteredArticle) => {
    if (article.clusterArticles && article.clusterArticles.length > 0) {
      setSelectedCluster(article.clusterArticles);
      setClusterModalOpen(true);
    }
  };

  const handleToggleClustering = () => {
    if (!enableClustering) {
      setEnableClustering(true);
    } else {
      setEnableClustering(false);
      setClusteredArticles([]);
    }
  };

  const handleArticlesUploaded = (newArticles: Article[]) => {
    addUploadedArticles(newArticles);
    const updated = loadUploadedArticles();
    setUploadedArticles(updated);
  };

  const handleDeleteUploadedArticle = (articleId: number) => {
    deleteUploadedArticle(articleId);
    const updated = loadUploadedArticles();
    setUploadedArticles(updated);
    toast({
      title: "Article deleted",
      description: "Uploaded article has been removed",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isConversational={isConversational}
        onToggleMode={() => setIsConversational(!isConversational)}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        contextLens={contextLens}
        onContextLensChange={setContextLens}
      />

      <main className="container px-4 md:px-8 py-8">
        {isConversational && searchQuery ? (
          <ConversationalQuery
            query={searchQuery}
            onCitationClick={handleCitationClick}
            articles={articles}
          />
        ) : (
          <>
            <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-4">
                  {enableClustering && "Clustered Stories"}
                  {!enableClustering && "News Intelligence"}
                </h2>
                <p className="text-xl text-muted-foreground">
                  {filteredArticles.length} {filteredArticles.length === 1 ? "story" : "stories"}
                  {uploadedArticles.length > 0 && (
                    <span className="ml-2 text-sm">({uploadedArticles.length} uploaded)</span>
                  )}
                  {enableClustering && clusteredArticles.length > 0 && (
                    <span className="ml-2 text-sm">
                      ({clusteredArticles.filter(a => (a as ClusteredArticle).clusterSize > 1).length} with multiple sources)
                    </span>
                  )}
                  {/* Deep dive count */}
                  {(() => {
                    const deepDiveCount = filteredArticles.filter(a => a.deep_dive_format).length;
                    if (deepDiveCount > 0) {
                      return (
                        <span className="ml-2 text-sm text-primary font-semibold">
                          ({deepDiveCount} with Deep Dive)
                        </span>
                      );
                    }
                    return null;
                  })()}
                </p>
                {/* Context lens feedback */}
                {contextLensMessage && contextLens !== "none" && (
                  <p className="text-sm text-primary mt-2 font-medium">
                    {contextLensMessage}
                  </p>
                )}
              </div>
              <div className="flex gap-2 items-center">
                {/* Primary action: Refresh */}
                <Button
                  variant="default"
                  size="lg"
                  onClick={async () => {
                    setIsLoadingNews(true);
                    try {
                      const news = await fetchLiveNewsCached(undefined, undefined, 50, true);
                      setLiveArticles(news);
                      toast({ title: "News refreshed", description: `Fetched ${news.length} articles` });
                    } catch (e) {
                      toast({ title: "Refresh failed", description: "Could not refresh news", variant: "destructive" });
                    } finally {
                      setIsLoadingNews(false);
                    }
                  }}
                  disabled={isLoadingNews || !hasNewsApiKey}
                  className="gap-2"
                >
                  {isLoadingNews ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-5 w-5" />
                  )}
                  Refresh
                </Button>

                {/* Cluster toggle */}
                <Button
                  variant={enableClustering ? "default" : "outline"}
                  size="lg"
                  onClick={handleToggleClustering}
                  disabled={isClusteringInProgress || allArticles.length === 0}
                  className="gap-2"
                >
                  {isClusteringInProgress ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Layers className="h-5 w-5" />
                  )}
                  {enableClustering ? "Clustered" : "Cluster"}
                </Button>

                {/* More options dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="lg" className="gap-2">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsLiveNews(!isLiveNews)} disabled={!hasNewsApiKey}>
                      <Rss className="h-4 w-4 mr-2" />
                      {isLiveNews ? "Switch to Archive" : "Switch to Live News"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setUploadModalOpen(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Articles
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => exportArticles(filteredArticles, 'json')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export as JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportArticles(filteredArticles, 'csv')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export as CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {!hasNewsApiKey && (
                  <span className="text-sm text-muted-foreground">
                    Add API key in Settings for live news
                  </span>
                )}
              </div>
            </div>

            {/* DailyBriefScore removed - was hardcoded */}

            {activeFilter === "brief" && filteredArticles.length > 0 && (() => {
              const { noveltyScore, diversityScore } = calculateBriefScore(filteredArticles);
              return (
                <DailyBriefScore
                  noveltyScore={noveltyScore}
                  diversityScore={diversityScore}
                  totalArticles={filteredArticles.length}
                />
              );
            })()}

            {filteredArticles.length > 0 && (
              <>
                <InsightPanel
                  articles={filteredArticles}
                  onArticleClick={handleCitationClick}
                />

                {filteredArticles.length > 5 && (
                  <TrendingTopics
                    articles={filteredArticles}
                    maxTopics={10}
                  />
                )}
              </>
            )}

            {isLoadingNews ? (
              <ArticleGridSkeleton count={6} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article, index) => (
                  <div key={article.id} className="stagger-item">
                    <ArticleCard
                      article={article}
                      index={index}
                      onReadMore={handleReadMore}
                      onDeepDive={handleDeepDive}
                      onViewCluster={
                        enableClustering &&
                          (article as ClusteredArticle).clusterSize > 1
                          ? () => handleViewCluster(article as ClusteredArticle)
                          : undefined
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {filteredArticles.length === 0 && (
              <div className="text-center py-16 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold">No Articles Available</h3>
                  <p className="text-xl text-muted-foreground">
                    {!hasNewsApiKey && uploadedArticles.length === 0
                      ? "Add a NewsAPI key or upload articles to get started"
                      : searchQuery
                        ? "No articles found matching your search"
                        : "Upload articles to analyze"}
                  </p>
                </div>
                {!hasNewsApiKey && uploadedArticles.length === 0 && (
                  <div className="flex flex-col items-center gap-4">
                    <Button
                      size="lg"
                      onClick={() => setUploadModalOpen(true)}
                      className="gap-2"
                    >
                      <Upload className="h-5 w-5" />
                      Upload Your First Article
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Or add <code className="bg-muted px-2 py-1 rounded">VITE_NEWSAPI_KEY</code> to <code className="bg-muted px-2 py-1 rounded">.env</code> for live news
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <CleanReaderModal
        article={selectedArticle}
        open={readerOpen}
        onOpenChange={setReaderOpen}
      />

      <ClusterModal
        articles={selectedCluster}
        open={clusterModalOpen}
        onOpenChange={setClusterModalOpen}
        onArticleSelect={(article) => {
          setSelectedArticle(article);
          setReaderOpen(true);
        }}
      />

      <ArticleUpload
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onArticlesUploaded={handleArticlesUploaded}
      />
    </div >
  );
};

export default HomePage;
