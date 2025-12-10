import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, Sparkles, Filter, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Article } from "@/lib/articles";
import { parseQuery, applyFilters, generateResponse, detectAmbiguity, AmbiguityResult } from "@/lib/queryParser";
import { answerQuestion } from "@/lib/aiService";
import { AmbiguityDialog, useAmbiguityResolution } from "./AmbiguityDialog";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: number[];
  clarityScore?: number;
  suggestions?: string[];
  filters?: {
    sentiment?: string;
    categories?: string[];
    dateRange?: string;
    resultCount?: number;
  };
}

interface ConversationalQueryProps {
  query: string;
  onCitationClick: (articleId: number) => void;
  articles: Article[];
}

export const ConversationalQuery = ({ query, onCitationClick, articles }: ConversationalQueryProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(query);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showAmbiguityDialog, AmbiguityDialogComponent } = useAmbiguityResolution();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages([...messages, userMessage]);
    setIsProcessing(true);

    try {
      // Parse the query
      const parsedQuery = parseQuery(input);

      // Detect ambiguity and calculate confidence
      const ambiguity = detectAmbiguity(input, articles);

      // If highly ambiguous, show disambiguation dialog
      if (ambiguity.isAmbiguous && ambiguity.options.length > 0) {
        showAmbiguityDialog(
          'Clarify Your Search',
          `Your query could mean different things. Please select:`,
          ambiguity.options.map(opt => ({
            label: opt.label,
            value: opt.value,
            description: opt.description
          })),
          (selected) => {
            // Re-run with clarified term
            setInput(input + ` (${selected})`);
          }
        );
      }

      // Apply filters to get relevant articles
      const filteredArticles = applyFilters(articles, parsedQuery.filters);

      // Generate natural language response
      const responseText = generateResponse(parsedQuery, filteredArticles);

      // Prepare filter summary for display
      const filterSummary: Message['filters'] = {
        sentiment: parsedQuery.filters.sentiment,
        categories: parsedQuery.filters.categories,
        dateRange: parsedQuery.filters.dateRange
          ? `${parsedQuery.filters.dateRange.start.toLocaleDateString()} - ${parsedQuery.filters.dateRange.end.toLocaleDateString()}`
          : undefined,
        resultCount: filteredArticles.length
      };

      // If user wants analysis or summary, use AI
      if (parsedQuery.intent === 'analyze' || parsedQuery.intent === 'summarize') {
        if (filteredArticles.length > 0) {
          const context = filteredArticles
            .slice(0, 5)
            .map(a => a.content.slice(0, 300))
            .join('\n\n');

          const aiResponse = await answerQuestion(input, context);

          const response: Message = {
            role: "assistant",
            content: `${responseText}\n\n${aiResponse}`,
            citations: filteredArticles.slice(0, 5).map(a => a.id),
            clarityScore: ambiguity.clarityScore,
            suggestions: ambiguity.suggestions,
            filters: filterSummary
          };
          setMessages((prev) => [...prev, response]);
        } else {
          const response: Message = {
            role: "assistant",
            content: responseText,
            clarityScore: ambiguity.clarityScore,
            suggestions: ambiguity.suggestions,
            filters: filterSummary
          };
          setMessages((prev) => [...prev, response]);
        }
      } else {
        // For search/filter queries, just show the filtered results
        const response: Message = {
          role: "assistant",
          content: responseText,
          citations: filteredArticles.slice(0, 10).map(a => a.id),
          clarityScore: ambiguity.clarityScore,
          suggestions: ambiguity.suggestions,
          filters: filterSummary
        };
        setMessages((prev) => [...prev, response]);
      }
    } catch (error) {
      console.error("Query processing error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error processing your question. Please try rephrasing your query.",
        citations: [],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }

    setInput("");
  };

  const renderMessageContent = (message: Message) => {
    return (
      <div className="space-y-3">
        {/* Clarity Score Badge */}
        {message.clarityScore !== undefined && (
          <div className="flex items-center gap-2 mb-2">
            {message.clarityScore >= 7 ? (
              <Badge variant="outline" className="bg-green-500/20 text-green-600 dark:text-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                Clarity: {message.clarityScore}/10
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                <AlertCircle className="h-3 w-3 mr-1" />
                Clarity: {message.clarityScore}/10
              </Badge>
            )}
          </div>
        )}

        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        {/* Suggestions for low-clarity queries */}
        {message.clarityScore !== undefined && message.clarityScore < 7 && message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <p className="text-xs text-muted-foreground mb-2">💡 Did you mean:</p>
            <div className="flex flex-wrap gap-2">
              {message.suggestions.map((suggestion, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setInput(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {message.filters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            {message.filters.sentiment && (
              <Badge variant="secondary" className="text-xs">
                <Filter className="h-3 w-3 mr-1" />
                {message.filters.sentiment} sentiment
              </Badge>
            )}
            {message.filters.categories && message.filters.categories.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Filter className="h-3 w-3 mr-1" />
                {message.filters.categories.join(', ')}
              </Badge>
            )}
            {message.filters.dateRange && (
              <Badge variant="secondary" className="text-xs">
                <Filter className="h-3 w-3 mr-1" />
                {message.filters.dateRange}
              </Badge>
            )}
            {message.filters.resultCount !== undefined && (
              <Badge variant="outline" className="text-xs">
                {message.filters.resultCount} results
              </Badge>
            )}
          </div>
        )}

        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-xs text-muted-foreground">Sources:</span>
            {message.citations.map((articleId) => (
              <Button
                key={articleId}
                variant="outline"
                size="sm"
                onClick={() => onCitationClick(articleId)}
                className="text-xs h-7"
              >
                <FileText className="h-3 w-3 mr-1" />
                Article #{articleId}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="max-w-4xl mx-auto bg-card border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Conversational Query
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Try: "Show me positive tech news from this week" or "Find negative political articles from yesterday"
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 min-h-[200px] max-h-[500px] overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">
                Ask me anything about the news stories...
              </p>
              <div className="flex flex-wrap gap-2 justify-center text-xs">
                <Badge variant="outline">Sentiment filters</Badge>
                <Badge variant="outline">Date ranges</Badge>
                <Badge variant="outline">Category search</Badge>
                <Badge variant="outline">AI analysis</Badge>
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-lg px-4 py-3 max-w-[85%] ${message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
                  }`}
              >
                {renderMessageContent(message)}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the news..."
            className="flex-1 bg-background border-border"
            disabled={isProcessing}
          />
          <Button type="submit" size="icon" disabled={isProcessing}>
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>

        {/* Ambiguity Dialog */}
        {AmbiguityDialogComponent}
      </CardContent>
    </Card>
  );
};

