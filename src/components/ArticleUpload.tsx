import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Plus, FileJson, FileText } from "lucide-react";
import { Article } from "@/lib/articles";
import { analyzeSentiment } from "@/lib/aiService";
import { toast } from "@/hooks/use-toast";

interface ArticleUploadProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onArticlesUploaded: (articles: Article[]) => void;
}

const categories = [
    "Politics", "Business", "Technology", "Science", "Health",
    "Entertainment", "Sports", "World News", "Environment", "Crime"
];

export const ArticleUpload = ({ open, onOpenChange, onArticlesUploaded }: ArticleUploadProps) => {
    const [manualForm, setManualForm] = useState({
        content: "",
        category: "",
        publisher: "",
        author: "",
        url: ""
    });
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        try {
            const text = await file.text();
            let articles: Partial<Article>[] = [];

            if (file.name.endsWith('.json')) {
                articles = JSON.parse(text);
            } else if (file.name.endsWith('.csv')) {
                // Simple CSV parser (assumes header row)
                const lines = text.split('\n');
                const headers = lines[0].split(',').map(h => h.trim());

                for (let i = 1; i < lines.length; i++) {
                    if (!lines[i].trim()) continue;
                    const values = lines[i].split(',').map(v => v.trim());
                    const article: any = {};
                    headers.forEach((header, index) => {
                        article[header] = values[index];
                    });
                    articles.push(article);
                }
            }

            // Validate and enrich articles
            const validArticles: Article[] = [];
            for (const article of articles) {
                if (!article.content || !article.category) {
                    console.warn('Skipping invalid article:', article);
                    continue;
                }

                // Analyze sentiment if not provided
                let sentiment = article.sentiment;
                if (!sentiment) {
                    try {
                        const result = await analyzeSentiment(article.content);
                        sentiment = {
                            polarity: result.label === 'POSITIVE' ? 1 : result.label === 'NEGATIVE' ? -1 : 0,
                            compound: result.compound
                        };
                    } catch (error) {
                        sentiment = { polarity: 0, compound: 0 };
                    }
                }

                validArticles.push({
                    id: article.id || Date.now() + validArticles.length,
                    content: article.content,
                    category: article.category,
                    sentiment,
                    url: article.url,
                    urlToImage: article.urlToImage,
                    publisher: article.publisher || "User Upload",
                    author: article.author || "Unknown",
                    date: article.date || new Date().toISOString().split('T')[0],
                    region: article.region || "User",
                    isBreaking: false
                });
            }

            if (validArticles.length > 0) {
                onArticlesUploaded(validArticles);
                toast({
                    title: "Articles uploaded",
                    description: `Successfully uploaded ${validArticles.length} article(s)`,
                });
                onOpenChange(false);
            } else {
                toast({
                    title: "Upload failed",
                    description: "No valid articles found in file",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: "Upload failed",
                description: "Failed to parse file. Please check the format.",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
            e.target.value = ''; // Reset file input
        }
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualForm.content || !manualForm.category) {
            toast({
                title: "Missing fields",
                description: "Content and category are required",
                variant: "destructive"
            });
            return;
        }

        setIsProcessing(true);
        try {
            // Analyze sentiment
            const sentimentResult = await analyzeSentiment(manualForm.content);

            const article: Article = {
                id: Date.now(),
                content: manualForm.content,
                category: manualForm.category,
                sentiment: {
                    polarity: sentimentResult.label === 'POSITIVE' ? 1 : sentimentResult.label === 'NEGATIVE' ? -1 : 0,
                    compound: sentimentResult.compound
                },
                url: manualForm.url || undefined,
                publisher: manualForm.publisher || "User Upload",
                author: manualForm.author || "Unknown",
                date: new Date().toISOString().split('T')[0],
                region: "User",
                isBreaking: false
            };

            onArticlesUploaded([article]);

            toast({
                title: "Article added",
                description: "Your article has been added successfully",
            });

            // Reset form
            setManualForm({
                content: "",
                category: "",
                publisher: "",
                author: "",
                url: ""
            });

            onOpenChange(false);
        } catch (error) {
            console.error('Error adding article:', error);
            toast({
                title: "Error",
                description: "Failed to add article. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Upload Articles</DialogTitle>
                    <DialogDescription>
                        Add articles manually or upload from a file (JSON or CSV)
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="manual" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">
                            <Plus className="h-4 w-4 mr-2" />
                            Manual Entry
                        </TabsTrigger>
                        <TabsTrigger value="file">
                            <Upload className="h-4 w-4 mr-2" />
                            File Upload
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual" className="space-y-4 mt-4">
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="content">Article Content *</Label>
                                <Textarea
                                    id="content"
                                    placeholder="Enter the full article text..."
                                    value={manualForm.content}
                                    onChange={(e) => setManualForm({ ...manualForm, content: e.target.value })}
                                    rows={8}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select
                                        value={manualForm.category}
                                        onValueChange={(value) => setManualForm({ ...manualForm, category: value })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="publisher">Publisher</Label>
                                    <Input
                                        id="publisher"
                                        placeholder="e.g., The New York Times"
                                        value={manualForm.publisher}
                                        onChange={(e) => setManualForm({ ...manualForm, publisher: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="author">Author</Label>
                                    <Input
                                        id="author"
                                        placeholder="e.g., John Smith"
                                        value={manualForm.author}
                                        onChange={(e) => setManualForm({ ...manualForm, author: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="url">URL</Label>
                                    <Input
                                        id="url"
                                        type="url"
                                        placeholder="https://example.com/article"
                                        value={manualForm.url}
                                        onChange={(e) => setManualForm({ ...manualForm, url: e.target.value })}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={isProcessing}>
                                {isProcessing ? "Adding..." : "Add Article"}
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="file" className="space-y-4 mt-4">
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4">
                            <div className="flex justify-center gap-4">
                                <FileJson className="h-12 w-12 text-muted-foreground" />
                                <FileText className="h-12 w-12 text-muted-foreground" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold">Upload JSON or CSV File</h3>
                                <p className="text-sm text-muted-foreground">
                                    JSON: Array of article objects<br />
                                    CSV: Headers in first row (content, category required)
                                </p>
                            </div>

                            <Input
                                type="file"
                                accept=".json,.csv"
                                onChange={handleFileUpload}
                                disabled={isProcessing}
                                className="max-w-xs mx-auto"
                            />

                            {isProcessing && (
                                <p className="text-sm text-muted-foreground">Processing file...</p>
                            )}
                        </div>

                        <div className="text-xs text-muted-foreground space-y-1">
                            <p><strong>Required fields:</strong> content, category</p>
                            <p><strong>Optional fields:</strong> id, url, publisher, author, date, sentiment</p>
                            <p><strong>Note:</strong> Sentiment will be auto-analyzed if not provided</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};
