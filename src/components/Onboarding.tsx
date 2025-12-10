import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Newspaper, Radio, FolderOpen, Headphones, Sparkles, ArrowRight, Key, CheckCircle, ExternalLink } from 'lucide-react';

interface OnboardingProps {
    onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
    apiKey?: string;
    interests: string[];
}

const ONBOARDING_KEY = 'nuvision_onboarding_complete';
const INTERESTS_KEY = 'nuvision_user_interests';

const AVAILABLE_INTERESTS = [
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'politics', label: 'Politics', icon: '🏛️' },
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'health', label: 'Health', icon: '🏥' },
    { id: 'science', label: 'Science', icon: '🔬' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { id: 'world', label: 'World News', icon: '🌍' },
];

export const Onboarding = ({ onComplete }: OnboardingProps) => {
    const [step, setStep] = useState(0);
    const [apiKey, setApiKey] = useState('');
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const [isTestingKey, setIsTestingKey] = useState(false);
    const [keyValid, setKeyValid] = useState<boolean | null>(null);

    useEffect(() => {
        // Check if onboarding was completed before
        const completed = localStorage.getItem(ONBOARDING_KEY);
        if (!completed) {
            setIsVisible(true);
        }
    }, []);

    const handleComplete = () => {
        // Save completion status and interests
        localStorage.setItem(ONBOARDING_KEY, 'true');
        if (selectedInterests.length > 0) {
            localStorage.setItem(INTERESTS_KEY, JSON.stringify(selectedInterests));
        }

        setIsVisible(false);
        onComplete({ apiKey, interests: selectedInterests });
    };

    const handleSkip = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        setIsVisible(false);
        onComplete({ interests: [] });
    };

    const toggleInterest = (id: string) => {
        setSelectedInterests(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const testApiKey = async () => {
        if (!apiKey) return;
        setIsTestingKey(true);
        try {
            const response = await fetch(
                `https://newsapi.org/v2/top-headlines?country=us&pageSize=1&apiKey=${apiKey}`
            );
            setKeyValid(response.ok);
        } catch {
            setKeyValid(false);
        }
        setIsTestingKey(false);
    };

    if (!isVisible) return null;

    const steps = [
        // Step 0: Welcome
        {
            content: (
                <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8">
                    <div className="max-w-lg text-center space-y-8">
                        <div className="w-32 h-32 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                            <Newspaper className="w-16 h-16 text-primary" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tight">
                            Welcome to <span className="text-primary">NuVision</span>
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Your AI-powered news intelligence platform. Get clarity on the stories that matter.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button variant="outline" onClick={handleSkip}>
                                Skip Setup
                            </Button>
                            <Button size="lg" onClick={() => setStep(1)}>
                                Get Started <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            )
        },
        // Step 1: Features
        {
            content: (
                <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8">
                    <div className="max-w-2xl space-y-8">
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl font-bold">What You Can Do</h2>
                            <p className="text-muted-foreground">Powerful features to understand the news better</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 rounded-xl border border-border bg-card space-y-3 hover:border-primary/50 transition-colors">
                                <Radio className="w-10 h-10 text-primary" />
                                <h3 className="text-xl font-bold">Bias Radar</h3>
                                <p className="text-sm text-muted-foreground">See how different sources cover the same story across the political spectrum</p>
                            </div>
                            <div className="p-6 rounded-xl border border-border bg-card space-y-3 hover:border-primary/50 transition-colors">
                                <FolderOpen className="w-10 h-10 text-primary" />
                                <h3 className="text-xl font-bold">Smart Topics</h3>
                                <p className="text-sm text-muted-foreground">Browse news organized by category with AI-powered categorization</p>
                            </div>
                            <div className="p-6 rounded-xl border border-border bg-card space-y-3 hover:border-primary/50 transition-colors">
                                <Headphones className="w-10 h-10 text-primary" />
                                <h3 className="text-xl font-bold">Audio Briefings</h3>
                                <p className="text-sm text-muted-foreground">Listen to AI-generated summaries of top stories</p>
                            </div>
                            <div className="p-6 rounded-xl border border-border bg-card space-y-3 hover:border-primary/50 transition-colors">
                                <Sparkles className="w-10 h-10 text-primary" />
                                <h3 className="text-xl font-bold">Deep Dive</h3>
                                <p className="text-sm text-muted-foreground">Explore stories with timelines, entity maps, and bias analysis</p>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                            <Button onClick={() => setStep(2)}>
                                Continue <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )
        },
        // Step 2: Interests
        {
            content: (
                <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8">
                    <div className="max-w-2xl space-y-8">
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl font-bold">What Interests You?</h2>
                            <p className="text-muted-foreground">Select topics to personalize your feed (optional)</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {AVAILABLE_INTERESTS.map(interest => (
                                <button
                                    key={interest.id}
                                    onClick={() => toggleInterest(interest.id)}
                                    className={`p-4 rounded-xl border-2 transition-all ${selectedInterests.includes(interest.id)
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    <div className="text-3xl mb-2">{interest.icon}</div>
                                    <div className="font-medium text-sm">{interest.label}</div>
                                    {selectedInterests.includes(interest.id) && (
                                        <CheckCircle className="w-4 h-4 text-primary mx-auto mt-2" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <p className="text-center text-sm text-muted-foreground">
                            {selectedInterests.length === 0
                                ? "Skip to see all news, or select topics for a personalized experience"
                                : `${selectedInterests.length} topic${selectedInterests.length === 1 ? '' : 's'} selected`
                            }
                        </p>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                            <Button onClick={() => setStep(3)}>
                                Continue <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )
        },
        // Step 3: API Key
        {
            content: (
                <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8">
                    <div className="max-w-lg space-y-8">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500/10 flex items-center justify-center">
                                <Key className="w-10 h-10 text-yellow-500" />
                            </div>
                            <h2 className="text-4xl font-bold">Connect to Live News</h2>
                            <p className="text-muted-foreground">Add your free NewsAPI key to get real-time headlines</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Paste your NewsAPI key here"
                                    value={apiKey}
                                    onChange={(e) => {
                                        setApiKey(e.target.value);
                                        setKeyValid(null);
                                    }}
                                    className="flex-1"
                                />
                                <Button
                                    variant="outline"
                                    onClick={testApiKey}
                                    disabled={!apiKey || isTestingKey}
                                >
                                    {isTestingKey ? 'Testing...' : 'Test'}
                                </Button>
                            </div>

                            {keyValid === true && (
                                <div className="flex items-center gap-2 text-green-500 text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    API key is valid!
                                </div>
                            )}
                            {keyValid === false && (
                                <div className="text-red-500 text-sm">
                                    Invalid API key. Please check and try again.
                                </div>
                            )}

                            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                                <p className="text-sm font-medium">How to get your free key:</p>
                                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                                    <li>Visit newsapi.org/register</li>
                                    <li>Create a free account</li>
                                    <li>Copy your API key</li>
                                    <li>Paste it above</li>
                                </ol>
                                <a
                                    href="https://newsapi.org/register"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-primary text-sm hover:underline"
                                >
                                    Get your free key <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline">✓ 100 requests/day free</Badge>
                                <Badge variant="outline">✓ No credit card needed</Badge>
                                <Badge variant="outline">✓ 30 min cache (saves requests)</Badge>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={handleComplete}>
                                    Skip for now
                                </Button>
                                <Button onClick={handleComplete} disabled={apiKey.length > 0 && keyValid !== true}>
                                    {apiKey ? 'Finish Setup' : 'Continue without API Key'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-background">
            {steps[step].content}

            {/* Step indicators */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {steps.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setStep(idx)}
                        className={`w-3 h-3 rounded-full transition-colors ${idx === step ? 'bg-primary' : 'bg-muted hover:bg-muted-foreground/30'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

/**
 * Get user's saved interests
 */
export const getUserInterests = (): string[] => {
    try {
        const raw = localStorage.getItem(INTERESTS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

/**
 * Hook to check if onboarding is needed
 */
export const useOnboarding = () => {
    const [needsOnboarding, setNeedsOnboarding] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem(ONBOARDING_KEY);
        setNeedsOnboarding(!completed);
    }, []);

    const resetOnboarding = () => {
        localStorage.removeItem(ONBOARDING_KEY);
        localStorage.removeItem(INTERESTS_KEY);
        setNeedsOnboarding(true);
    };

    return { needsOnboarding, resetOnboarding };
};
