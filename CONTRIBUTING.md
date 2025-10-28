# Contributing to Meteo Weather App

Thank you for your interest in contributing to Meteo Weather App! We welcome contributions from the community.

## 🌟 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior** vs. what actually happened
- **Screenshots** if applicable
- **Environment details**: OS, browser, Docker version, Node.js version
- **Error messages** or logs

### Suggesting Features

Feature suggestions are welcome! Please provide:

- **Clear use case** - Why is this feature needed?
- **Proposed solution** - How should it work?
- **Alternatives considered** - Other approaches you've thought about
- **Additional context** - Screenshots, mockups, or examples

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** with clear, descriptive commits
3. **Test your changes** thoroughly
4. **Update documentation** if needed (README, comments, etc.)
5. **Follow the code style** used in the project
6. **Submit a pull request** with a clear description

## 🚀 Development Setup

### Prerequisites
- Docker (20.10+) and Docker Compose (1.29+)
- Node.js 14+ (for local development)
- Git

### Getting Started

1. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/meteo-app.git
   cd meteo-app
   ```

2. **Set up environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your API keys
   ```

3. **Start the application:**
   ```bash
   docker-compose up --build
   ```

4. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

### Running Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests (when implemented)
cd backend
npm test
```

## 📝 Code Style Guidelines

### General Principles
- Write **clear, self-documenting code**
- Add **comments for complex logic**
- Keep functions **small and focused**
- Use **meaningful variable names**

### JavaScript/React
- Use **functional components** and hooks
- Follow **ES6+ syntax**
- Use **async/await** for asynchronous operations
- Keep **JSX readable** with proper indentation

### Backend (Node.js/Express)
- Use **CommonJS modules** (require/module.exports)
- Implement **error handling** for all API endpoints
- Add **input validation** for user data
- Use **async/await** consistently

### Database
- Write **clear SQL queries** with proper formatting
- Use **prepared statements** to prevent SQL injection
- Add **indexes** for frequently queried columns

### CSS
- Use **CSS variables** for theming (defined in `src/styles/themes.css`)
- Support **both light and dark modes**
- Keep styles **component-specific** when possible
- Use **meaningful class names**

## 🔍 What We're Looking For

### High Priority Contributions
- 🐛 **Bug fixes** - Especially browser compatibility issues
- 📚 **Documentation improvements** - Better setup guides, API docs
- ♿ **Accessibility improvements** - ARIA labels, keyboard navigation
- 🌐 **Internationalization** - Multi-language support
- 🧪 **Test coverage** - Unit tests, integration tests

### Feature Ideas
- 📊 More chart types and visualizations
- 🌍 Additional location search providers
- 📱 Mobile app (React Native)
- 🔔 Push notifications for weather alerts
- 📈 Advanced climate comparison algorithms
- 🎨 More theme options
- 🔌 Plugin system for extending functionality

### Good First Issues
Look for issues tagged with `good-first-issue` - these are beginner-friendly tasks perfect for first-time contributors.

## 🤝 Code Review Process

1. Maintainers will review your PR within **2-5 business days**
2. We may request changes or ask questions
3. Once approved, your PR will be merged
4. You'll be added to the contributors list!

## 💬 Communication

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and general discussion
- **Pull Requests** - Code contributions

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

All contributors will be recognized in:
- GitHub's contributor graph
- Release notes (for significant contributions)
- Our README (coming soon!)

## ❓ Questions?

Don't hesitate to ask questions in:
- GitHub Issues (tag with `question`)
- GitHub Discussions
- Pull request comments

Thank you for contributing to Meteo Weather App! 🌦️
