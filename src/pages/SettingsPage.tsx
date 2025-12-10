import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Key, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { saveAPIKeys, loadAPIKeys, testNewsAPIKey, validateNewsAPIKey } from "@/lib/apiKeyManager";

const SettingsPage = () => {
  const [newsApiKey, setNewsApiKey] = useState("");
  const [huggingFaceKey, setHuggingFaceKey] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [newsApiStatus, setNewsApiStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  // Load saved keys on mount
  useEffect(() => {
    const keys = loadAPIKeys();
    setNewsApiKey(keys.newsApiKey);
    setHuggingFaceKey(keys.huggingFaceKey);
    if (keys.newsApiKey) {
      setNewsApiStatus('valid');
    }
  }, []);

  const handleSave = () => {
    saveAPIKeys({
      newsApiKey,
      huggingFaceKey
    });

    toast({
      title: "Settings saved",
      description: "Your API keys have been saved successfully. Refresh the page to load live news.",
    });
  };

  const handleTestNewsAPI = async () => {
    if (!newsApiKey) {
      toast({
        title: "No API key",
        description: "Please enter a NewsAPI key first",
        variant: "destructive"
      });
      return;
    }

    if (!validateNewsAPIKey(newsApiKey)) {
      setNewsApiStatus('invalid');
      toast({
        title: "Invalid format",
        description: "NewsAPI keys should be 32 character hex strings",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    const isValid = await testNewsAPIKey(newsApiKey);
    setIsTesting(false);

    if (isValid) {
      setNewsApiStatus('valid');
      toast({
        title: "Connection successful!",
        description: "Your NewsAPI key is working correctly",
      });
    } else {
      setNewsApiStatus('invalid');
      toast({
        title: "Connection failed",
        description: "Unable to connect with this API key. Please check it's correct.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-4xl px-4 md:px-8 py-8">
        <Link to="/home">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="space-y-8 animate-fade-in">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">Settings</h1>
            <p className="text-xl text-muted-foreground">
              Configure your API keys for live news intelligence
            </p>
          </div>

          {/* NewsAPI Configuration */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <CardTitle>NewsAPI Configuration</CardTitle>
              </div>
              <CardDescription>
                Required for live news headlines. Get your free API key at{" "}
                <a
                  href="https://newsapi.org/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  newsapi.org
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newsapi-key">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="newsapi-key"
                    type="password"
                    placeholder="Enter your NewsAPI key"
                    value={newsApiKey}
                    onChange={(e) => {
                      setNewsApiKey(e.target.value);
                      setNewsApiStatus('idle');
                    }}
                    className="font-mono"
                  />
                  <Button
                    onClick={handleTestNewsAPI}
                    disabled={isTesting || !newsApiKey}
                    variant="outline"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      'Test'
                    )}
                  </Button>
                </div>
                {newsApiStatus === 'valid' && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Connected successfully
                  </div>
                )}
                {newsApiStatus === 'invalid' && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <XCircle className="h-4 w-4" />
                    Invalid or expired key
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Hugging Face Configuration */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <CardTitle>Hugging Face API (Optional)</CardTitle>
              </div>
              <CardDescription>
                Optional: For advanced AI features like summaries and clustering. Get your key at{" "}
                <a
                  href="https://huggingface.co/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  huggingface.co
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hf-key">API Key</Label>
                <Input
                  id="hf-key"
                  type="password"
                  placeholder="Enter your Hugging Face API key (optional)"
                  value={huggingFaceKey}
                  onChange={(e) => setHuggingFaceKey(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Note: Server must be running for AI features to work
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Save Settings
            </Button>
          </div>

          {/* About */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>About NuVision News</CardTitle>
              <CardDescription>
                Live news intelligence platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                NuVision News is a real-time news intelligence platform that provides clarity,
                context, and credibility. We use sentiment analysis, topic discovery, and
                interactive visualizations to help you understand the news from multiple perspectives.
              </p>
              <p className="font-semibold text-foreground">
                Version 2.0 • Built with React, TypeScript, and Tailwind CSS
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
