import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { NotificationPreferences, DigestFrequency } from "@/lib/notificationDigest";
import { toast } from "sonner";

const NotificationSettingsPage = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    frequency: "daily",
    categories: ["Politics", "Technology"],
    breakingOnly: false,
    minImportanceScore: 30,
  });

  const categories = [
    "Politics", "Technology", "Business", "Science", "Health",
    "Entertainment", "Sports", "World", "Climate", "Opinion"
  ];

  const frequencies: { value: DigestFrequency; label: string; description: string }[] = [
    { value: "hourly", label: "Hourly", description: "Get updates every hour" },
    { value: "daily", label: "Daily", description: "One digest per day" },
    { value: "weekly", label: "Weekly", description: "Weekly summary" },
  ];

  const toggleCategory = (category: string) => {
    setPreferences(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSave = () => {
    localStorage.setItem("notificationPreferences", JSON.stringify(preferences));
    toast.success("Notification preferences saved!");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/home">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Notification Settings</h1>
              <p className="text-muted-foreground">Customize your news digest preferences</p>
            </div>
          </div>

          {/* Digest Frequency */}
          <Card className="p-6 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Digest Frequency</h2>
              <p className="text-sm text-muted-foreground">How often do you want to receive news digests?</p>
            </div>
            
            <div className="grid gap-3">
              {frequencies.map(freq => (
                <div
                  key={freq.value}
                  onClick={() => setPreferences(prev => ({ ...prev, frequency: freq.value }))}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    preferences.frequency === freq.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{freq.label}</div>
                      <div className="text-sm text-muted-foreground">{freq.description}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      preferences.frequency === freq.value
                        ? "bg-primary border-primary"
                        : "border-border"
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Category Preferences */}
          <Card className="p-6 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Topic Preferences</h2>
              <p className="text-sm text-muted-foreground">Select topics you want to follow</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map(category => (
                <div
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all text-center ${
                    preferences.categories.includes(category)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-medium">{category}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Breaking News Toggle */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="breaking-news" className="text-lg font-semibold">
                  Breaking News Only
                </Label>
                <p className="text-sm text-muted-foreground">
                  Only receive digests for breaking news stories
                </p>
              </div>
              <Switch
                id="breaking-news"
                checked={preferences.breakingOnly}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, breakingOnly: checked }))
                }
              />
            </div>
          </Card>

          {/* Importance Threshold */}
          <Card className="p-6 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Importance Threshold</h2>
              <p className="text-sm text-muted-foreground">
                Minimum importance score: {preferences.minImportanceScore}
              </p>
            </div>
            
            <Slider
              value={[preferences.minImportanceScore]}
              onValueChange={([value]) =>
                setPreferences(prev => ({ ...prev, minImportanceScore: value }))
              }
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Less selective</span>
              <span>More selective</span>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg">
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
