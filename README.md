<div align="center">

# NuVision News

### AI-Powered News Intelligence Platform

[![MIT License](https://img.shields.io/badge/License-MIT-gold.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

**See beyond the headlines. Understand bias. Get the full picture.**

[Live Demo](#-quick-start) · [Features](#-features) · [Documentation](#-documentation)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎯 **Bias Radar** | Visualize where news sources fall on the political spectrum |
| 🔍 **Deep Dive Mode** | Explore stories with timelines, entity maps, and multi-source analysis |
| 🎧 **Audio Briefings** | Listen to AI-generated news summaries |
| 📊 **Sentiment Analysis** | See the emotional tone of coverage at a glance |
| 🔗 **Article Clustering** | Group related stories from multiple sources |
| 💬 **Conversational Search** | Natural language queries with clarity scoring |

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/dcthedeveloper/NuVision-News.git
cd NuVision-News

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — the app works immediately with sample data.

### Optional: Enable Live News

```bash
# Copy environment template
cp .env.example .env

# Add your free NewsAPI key (get one at newsapi.org)
# Edit .env: VITE_NEWSAPI_KEY=your_key_here
```

---

## 📦 Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, Radix UI, shadcn/ui |
| **State** | React Query, Zustand |
| **AI/NLP** | Hugging Face Transformers (optional) |
| **Data** | NewsAPI (optional), Local JSON corpus |

---

## 🏗️ Project Structure

```
NuVision-News/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Route pages
│   ├── lib/            # Utilities & services
│   ├── hooks/          # Custom React hooks
│   └── data/           # Sample article corpus
├── server/             # Optional inference proxy
├── public/             # Static assets
└── docs/               # Documentation
```

---

## 🔧 Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_NEWSAPI_KEY` | No | NewsAPI key for live headlines |
| `HF_API_KEY` | No | Hugging Face key for AI summaries |

> **Note**: The app is fully functional without API keys using the built-in sample data.

---

## 📖 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md) — System design and data flow
- [Contributing Guide](CONTRIBUTING.md) — How to contribute
- [Code of Conduct](CODE_OF_CONDUCT.md) — Community guidelines

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for news clarity**

[⬆ Back to top](#nuvision-news)

</div>