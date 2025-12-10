import { Search, User, Layers, Radio, FolderOpen, Headphones, TrendingUp, GraduationCap, Briefcase, Users, Baby } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ContextLens } from "@/lib/articles";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isConversational: boolean;
  onToggleMode: () => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  contextLens: ContextLens;
  onContextLensChange: (lens: ContextLens) => void;
}

const navItems = [
  { id: "brief", label: "My Daily Brief", icon: Layers, route: "/" },
  { id: "bias", label: "Bias Radar", icon: Radio, route: "/bias-radar" },
  { id: "topics", label: "Topics", icon: FolderOpen, route: "/topics" },
  { id: "audio", label: "Audio", icon: Headphones, route: "/audio" },
  { id: "trending", label: "Trending", icon: TrendingUp, route: "/" },
];

export const Header = ({ searchQuery, onSearchChange, isConversational, onToggleMode, activeFilter, onFilterChange, contextLens, onContextLensChange }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const lensConfig = {
    none: { icon: Users, label: "General", color: "bg-muted" },
    beginner: { icon: Baby, label: "Beginner", color: "bg-success/20 text-success" },
    analyst: { icon: Briefcase, label: "Analyst", color: "bg-accent/20 text-accent" },
    executive: { icon: Briefcase, label: "Executive", color: "bg-secondary/20 text-secondary" },
    student: { icon: GraduationCap, label: "Student", color: "bg-primary/20 text-primary" }
  };

  const currentLens = lensConfig[contextLens];
  const LensIcon = currentLens.icon;

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.route === "/") {
      onFilterChange(item.id);
      if (location.pathname !== "/") {
        navigate("/");
      }
    } else {
      navigate(item.route);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 md:px-8 py-3 space-y-3">
        {/* Core Header Row */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-black tracking-tight text-primary">NuVision</h1>
          </Link>

          <Button
            variant={isConversational ? "default" : "outline"}
            onClick={onToggleMode}
            className="whitespace-nowrap font-semibold text-xs sm:text-sm px-3 sm:px-4"
          >
            <span className="hidden sm:inline">{isConversational ? "Deep Dive" : "Quick Read"}</span>
            <span className="sm:hidden">{isConversational ? "Deep" : "Quick"}</span>
          </Button>

          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={isConversational ? "Ask a question..." : "Find a story..."}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-card border-border text-sm"
            />
          </div>

          {/* Context Lens Selector */}
          <div className="hidden md:flex items-center gap-2">
            <Badge
              className={`${currentLens.color} cursor-pointer hover:opacity-80 transition-opacity text-xs`}
              onClick={() => {
                const lenses: ContextLens[] = ["none", "beginner", "analyst", "executive", "student"];
                const currentIndex = lenses.indexOf(contextLens);
                const nextIndex = (currentIndex + 1) % lenses.length;
                onContextLensChange(lenses[nextIndex]);
              }}
              title="Click to cycle through context modes - changes article sorting"
            >
              <LensIcon className="h-3 w-3 mr-1" />
              {currentLens.label}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Context lens now actually filters articles! */}
            <Link to="/settings">
              <Button variant="ghost" size="icon" title="Profile & Settings">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation Ribbon */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.route === "/"
              ? location.pathname === "/" && activeFilter === item.id
              : location.pathname === item.route;

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => handleNavClick(item)}
                className="flex items-center gap-2 whitespace-nowrap font-medium text-xs sm:text-sm flex-shrink-0"
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.label.split(' ')[0]}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
