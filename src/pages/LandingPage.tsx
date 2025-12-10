import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Radio, TrendingUp, Headphones, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const LandingPage = () => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setIsVisible(true);

        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20,
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleEnter = () => {
        navigate('/home');
    };

    return (
        <div className="relative min-h-screen bg-background overflow-hidden">
            {/* Animated Background Gradient Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Primary gold orb */}
                <div
                    className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-[120px]"
                    style={{
                        background: 'radial-gradient(circle, hsl(45 100% 70%) 0%, transparent 70%)',
                        top: '-20%',
                        right: '-10%',
                        transform: `translate(${mousePosition.x * -1}px, ${mousePosition.y * -1}px)`,
                        transition: 'transform 0.3s ease-out',
                    }}
                />
                {/* Secondary purple orb */}
                <div
                    className="absolute w-[600px] h-[600px] rounded-full opacity-15 blur-[100px]"
                    style={{
                        background: 'radial-gradient(circle, hsl(280 80% 65%) 0%, transparent 70%)',
                        bottom: '-10%',
                        left: '-5%',
                        transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
                        transition: 'transform 0.3s ease-out',
                    }}
                />
                {/* Accent cyan orb */}
                <div
                    className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-[80px]"
                    style={{
                        background: 'radial-gradient(circle, hsl(195 100% 60%) 0%, transparent 70%)',
                        top: '40%',
                        left: '30%',
                        transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
                        transition: 'transform 0.3s ease-out',
                    }}
                />
                {/* Grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
              linear-gradient(to right, hsl(45 100% 70%) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(45 100% 70%) 1px, transparent 1px)
            `,
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Hero Section */}
                <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
                    <div
                        className={`max-w-5xl mx-auto text-center space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                            }`}
                    >
                        {/* Badge */}
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm"
                            style={{ animationDelay: '0.2s' }}
                        >
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">AI-Powered News Intelligence</span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none">
                            <span className="text-primary">NuVision</span>
                            <br />
                            <span className="text-foreground">News</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            See beyond the headlines. Understand bias.
                            <span className="text-foreground"> Get the full picture.</span>
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Button
                                size="lg"
                                onClick={handleEnter}
                                className="group text-lg h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105"
                            >
                                Enter NuVision
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                className="text-lg h-14 px-8 rounded-full border-border hover:border-primary/50 hover:bg-primary/5"
                            >
                                Explore Features
                            </Button>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div
                        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <div className="flex flex-col items-center gap-2 text-muted-foreground animate-bounce">
                            <span className="text-xs uppercase tracking-widest">Scroll</span>
                            <ChevronDown className="w-5 h-5" />
                        </div>
                    </div>
                </main>

                {/* Features Section */}
                <section id="features" className="py-32 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">
                                Intelligence at Your <span className="text-primary">Fingertips</span>
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                                Powerful features that transform how you consume news
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    icon: Radio,
                                    title: "Bias Radar",
                                    description: "See where sources fall on the political spectrum",
                                    gradient: "from-primary/20 to-transparent",
                                    iconColor: "text-primary",
                                },
                                {
                                    icon: TrendingUp,
                                    title: "Deep Dive",
                                    description: "Explore stories with timelines, maps & analysis",
                                    gradient: "from-accent/20 to-transparent",
                                    iconColor: "text-accent",
                                },
                                {
                                    icon: Headphones,
                                    title: "Audio Briefings",
                                    description: "Listen to AI-generated news summaries",
                                    gradient: "from-secondary/20 to-transparent",
                                    iconColor: "text-secondary",
                                },
                                {
                                    icon: Sparkles,
                                    title: "AI Summaries",
                                    description: "Get instant clarity with smart summaries",
                                    gradient: "from-success/20 to-transparent",
                                    iconColor: "text-success",
                                },
                            ].map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="group relative p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:-translate-y-2"
                                >
                                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                    <div className="relative space-y-4">
                                        <div className={`w-14 h-14 rounded-xl bg-background flex items-center justify-center ${feature.iconColor}`}>
                                            <feature.icon className="w-7 h-7" />
                                        </div>
                                        <h3 className="text-xl font-bold">{feature.title}</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="py-32 px-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
                    <div className="relative max-w-3xl mx-auto text-center space-y-8">
                        <h2 className="text-4xl md:text-6xl font-black">
                            Ready to See <span className="text-primary">Clearly?</span>
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            Join thousands who understand the news better
                        </p>
                        <Button
                            size="lg"
                            onClick={handleEnter}
                            className="group text-lg h-16 px-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-bold shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105"
                        >
                            Start Exploring
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-8 px-6 border-t border-border">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-primary">NuVision</span>
                            <span className="text-xl font-bold text-foreground">News</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            AI-powered news intelligence platform
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;
