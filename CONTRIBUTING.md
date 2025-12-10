# Contributing to NuVision News

Thank you for your interest in contributing to NuVision News! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)

---

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+
- Git

### Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/NuVision-News.git
cd NuVision-News

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## Development Workflow

### Branch Naming

Use descriptive branch names:

- `feature/bias-radar-improvements`
- `fix/clustering-performance`
- `docs/update-readme`

### Commits

Write clear, concise commit messages:

```
feat: add sentiment trend visualization
fix: resolve article clustering timeout
docs: update API configuration guide
```

We follow [Conventional Commits](https://www.conventionalcommits.org/).

---

## Pull Request Process

1. **Update your fork** with the latest `main` branch
2. **Create a feature branch** from `main`
3. **Make your changes** with clear commits
4. **Test your changes** locally
5. **Push** to your fork
6. **Open a Pull Request** with a clear description

### PR Checklist

- [ ] Code follows the project style guidelines
- [ ] Changes are tested locally
- [ ] Documentation is updated if needed
- [ ] No console errors or warnings
- [ ] Commits are clean and descriptive

---

## Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define interfaces for props and data structures
- Avoid `any` types

### React

- Use functional components with hooks
- Keep components focused and reusable
- Use meaningful component names

### CSS/Tailwind

- Use Tailwind utility classes
- Keep custom CSS minimal
- Follow the existing design system

### File Structure

- Components in `src/components/`
- Pages in `src/pages/`
- Utilities in `src/lib/`
- Hooks in `src/hooks/`

---

## Questions?

Feel free to open an issue for any questions or suggestions.

Thank you for contributing! 🎉
