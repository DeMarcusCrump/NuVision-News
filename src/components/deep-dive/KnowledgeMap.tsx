import { useState, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Article } from "@/lib/articles";

interface Node {
  id: string;
  label: string;
  type: "person" | "organization" | "location";
  x: number;
  y: number;
  connections: string[];
}

interface KnowledgeMapProps {
  article: Article;
}

export const KnowledgeMap = ({ article }: KnowledgeMapProps) => {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Extract entities from article content dynamically
  const extractEntities = (content: string): Node[] => {
    const entities: Node[] = [];
    const usedLabels = new Set<string>();

    // Common patterns for entity extraction
    // People: Names with capital letters (First Last pattern)
    const personPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
    // Organizations: Common org patterns
    const orgPatterns = [
      /\b((?:the\s+)?[A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*(?:\s+(?:Inc|Corp|Company|Team|Group|Association|League|Organization|Foundation|University|College|Hospital|Department|Agency|Commission|Board|Council|Committee|Institute|Center|Club|Network))\.?)\b/gi,
      /\b(NFL|NBA|MLB|NHL|NCAA|ESPN|CBS|NBC|ABC|Fox|CNN|BBC)\b/g,
    ];
    // Locations: Cities, states, countries
    const locationPattern = /\b(Indianapolis|New York|Los Angeles|Chicago|Houston|Phoenix|Philadelphia|San Antonio|San Diego|Dallas|Boston|Miami|Seattle|Denver|Atlanta|Washington|London|Paris|Berlin|Tokyo|Beijing)\b/gi;

    // Extract people
    let match;
    const personMatches = content.match(personPattern) || [];
    personMatches.slice(0, 3).forEach((name, idx) => {
      if (!usedLabels.has(name) && name.length > 4) {
        usedLabels.add(name);
        entities.push({
          id: `person-${idx}`,
          label: name,
          type: "person",
          x: 20 + (idx * 25),
          y: 30 + (idx * 15),
          connections: []
        });
      }
    });

    // Extract organizations from patterns
    orgPatterns.forEach((pattern) => {
      const matches = content.match(pattern) || [];
      matches.slice(0, 3).forEach((org, idx) => {
        const cleanOrg = org.replace(/^the\s+/i, '').trim();
        if (!usedLabels.has(cleanOrg) && cleanOrg.length > 2) {
          usedLabels.add(cleanOrg);
          entities.push({
            id: `org-${entities.length}`,
            label: cleanOrg,
            type: "organization",
            x: 50 + (idx * 15),
            y: 40 + (idx * 20),
            connections: []
          });
        }
      });
    });

    // Extract locations
    const locationMatches = content.match(locationPattern) || [];
    locationMatches.slice(0, 2).forEach((loc, idx) => {
      if (!usedLabels.has(loc)) {
        usedLabels.add(loc);
        entities.push({
          id: `loc-${idx}`,
          label: loc,
          type: "location",
          x: 35 + (idx * 30),
          y: 70,
          connections: []
        });
      }
    });

    // If we found entities, connect them
    if (entities.length > 1) {
      // Connect first entity to all others (like a main subject)
      entities[0].connections = entities.slice(1).map(e => e.id);
      // Connect second entity to first and some others
      if (entities.length > 2) {
        entities[1].connections = [entities[0].id, entities[2].id];
      }
    }

    // Fallback: If no entities found, extract key terms from headline
    if (entities.length < 2) {
      const headline = content.split('.')[0];
      const words = headline.split(/\s+/).filter(w => w.length > 4 && /^[A-Z]/.test(w));
      words.slice(0, 4).forEach((word, idx) => {
        if (!usedLabels.has(word)) {
          usedLabels.add(word);
          entities.push({
            id: `term-${idx}`,
            label: word,
            type: idx % 2 === 0 ? "organization" : "person",
            x: 25 + (idx * 20),
            y: 30 + (idx * 15),
            connections: idx > 0 ? [`term-${idx - 1}`] : []
          });
        }
      });
    }

    return entities;
  };

  const nodes: Node[] = extractEntities(article.content);

  const getNodeColor = (type: Node["type"]) => {
    switch (type) {
      case "person":
        return "hsl(var(--chart-2))";
      case "organization":
        return "hsl(var(--chart-1))";
      case "location":
        return "hsl(var(--chart-3))";
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row">
      {/* Main visualization */}
      <div className="flex-1 p-8 flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight">
              CONNECTING
              <br />
              THE DOTS
            </h1>
            <p className="text-xl text-muted-foreground">
              Explore the relationships between key entities in this story.
            </p>
          </div>

          <div className="bg-card border-2 border-border rounded-lg p-8 relative h-[600px] overflow-hidden">
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <Button size="icon" variant="outline" onClick={handleZoomIn} title="Zoom In">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={handleZoomOut} title="Zoom Out">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={handleReset} title="Reset View">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>

            <svg
              ref={svgRef}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {/* Draw connections */}
                {nodes.map((node) =>
                  node.connections.map((targetId) => {
                    const target = nodes.find((n) => n.id === targetId);
                    if (!target) return null;
                    return (
                      <line
                        key={`${node.id}-${targetId}`}
                        x1={`${node.x}%`}
                        y1={`${node.y}%`}
                        x2={`${target.x}%`}
                        y2={`${target.y}%`}
                        stroke="hsl(var(--border))"
                        strokeWidth="2"
                        className="animate-fade-in"
                      />
                    );
                  })
                )}

                {/* Draw nodes */}
                {nodes.map((node, index) => (
                  <g
                    key={node.id}
                    className="cursor-pointer transition-all duration-300 animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(node);
                    }}
                  >
                    <circle
                      cx={`${node.x}%`}
                      cy={`${node.y}%`}
                      r={selectedNode?.id === node.id ? "35" : "30"}
                      fill={getNodeColor(node.type)}
                      stroke="hsl(var(--background))"
                      strokeWidth="3"
                      className="transition-all duration-300"
                    />
                    <text
                      x={`${node.x}%`}
                      y={`${node.y}%`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs font-bold fill-primary-foreground pointer-events-none"
                    >
                      {node.label.split(" ")[0]}
                    </text>
                  </g>
                ))}
              </g>
            </svg>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-popover border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getNodeColor("person") }}></div>
                <span className="text-xs">Person</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getNodeColor("organization") }}></div>
                <span className="text-xs">Organization</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getNodeColor("location") }}></div>
                <span className="text-xs">Location</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar with details */}
      {selectedNode && (
        <div className="w-full lg:w-96 bg-card border-l border-border p-8 animate-slide-up overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-bold mb-2">{selectedNode.label}</h3>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                {selectedNode.type}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Mentions in Article</h4>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-background rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">
                      "{article.content.substring(i * 100, i * 100 + 150)}..."
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Connected To</h4>
              <div className="space-y-2">
                {selectedNode.connections.map((connId) => {
                  const connNode = nodes.find((n) => n.id === connId);
                  return (
                    <div
                      key={connId}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-background cursor-pointer transition-colors"
                      onClick={() => setSelectedNode(connNode || null)}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getNodeColor(connNode?.type || "organization") }}
                      ></div>
                      <span className="text-sm">{connNode?.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
