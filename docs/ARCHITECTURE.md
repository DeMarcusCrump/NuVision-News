# Architecture Overview

This document describes the high-level architecture of NuVision News.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         NuVision News                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │   Landing   │───▶│    Feed     │───▶│    Article View     │ │
│  │    Page     │    │   (Home)    │    │   + Deep Dive       │ │
│  └─────────────┘    └─────────────┘    └─────────────────────┘ │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Core Services                            ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   ││
│  │  │NewsAPI   │ │Sentiment │ │Clustering│ │ Query Parser │   ││
│  │  │Service   │ │Analysis  │ │ Engine   │ │ (NLP)        │   ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      External Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   NewsAPI    │  │ Hugging Face │  │ Local Sample Data    │  │
│  │  (Optional)  │  │  (Optional)  │  │  (Default)           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Components

### Frontend (React + Vite)

| Component | Purpose |
|-----------|---------|
| `LandingPage` | Entry point, marketing/onboarding |
| `HomePage` | Main news feed with filtering |
| `ArticlePage` | Individual article view |
| `DeepDivePage` | Immersive article exploration |
| `BiasRadarPage` | Political spectrum visualization |
| `Header` | Navigation and search |

### Core Libraries (`src/lib/`)

| Library | Purpose |
|---------|---------|
| `newsApi.ts` | NewsAPI integration with caching |
| `articles.ts` | Article data types and enrichment |
| `clustering.ts` | Group similar articles |
| `queryParser.ts` | Natural language query processing |
| `sentimentAnalysis.ts` | Sentiment scoring |
| `biasDetection.ts` | Source bias detection |
| `smartDeepDive.ts` | Intelligent deep dive format selection |

### Data Flow

```
User Query
    │
    ▼
┌─────────────────┐
│  Query Parser   │──▶ Filters, Keywords, Intent
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Article Store  │◀── NewsAPI / Local JSON
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Filter + Sort   │──▶ Sentiment, Category, Date
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   Clustering    │──▶ Group Related Stories
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   Render Feed   │──▶ ArticleCards with badges
└─────────────────┘
```

---

## State Management

- **React Query**: Server state (news fetching, caching)
- **useState/useReducer**: Local component state
- **localStorage**: User preferences, API keys, cached articles

---

## API Integration

### NewsAPI (Optional)

- Endpoint: `https://newsapi.org/v2/top-headlines`
- Cached for 30 minutes to minimize requests
- Falls back to local sample data when unavailable

### Hugging Face (Optional)

- Used for AI summaries and advanced NLP
- Accessed via optional inference proxy (`server/`)

---

## Directory Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui primitives
│   ├── deep-dive/       # Deep dive mode components
│   └── *.tsx            # Feature components
├── pages/               # Route pages
├── lib/                 # Business logic & services
├── hooks/               # Custom React hooks
├── data/                # Sample article corpus
└── main.tsx             # App entry point
```

---

## Design Principles

1. **Works Offline**: Full functionality with sample data
2. **Progressive Enhancement**: AI features are optional
3. **Performance First**: Aggressive caching, lazy loading
4. **Honest UI**: No fake personalization or deceptive patterns
5. **Accessibility**: Keyboard navigation, semantic HTML

---

## Future Considerations

- [ ] Server-side rendering for SEO
- [ ] PWA support for offline access
- [ ] Real-time news updates via WebSocket
- [ ] User accounts and saved preferences
