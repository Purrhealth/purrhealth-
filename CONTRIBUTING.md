# Contributing to PurrHealth 🐾

Thank you for considering contributing to PurrHealth! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/purrhealth-.git`
3. **Create** a feature branch: `git checkout -b feature/your-feature-name`
4. **Set up** the development environment (see README)

## Development Workflow

### Branches

- `main` - Production-ready code
- `develop` - Development branch (default for PRs)
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Commit Messages

Follow conventional commits:

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: format code
refactor: restructure code
test: add tests
chore: maintenance tasks
```

### Pull Request Process

1. Update documentation
2. Add tests for new features
3. Ensure all tests pass: `npm test`
4. Lint code: `npm run lint`
5. Create descriptive PR title & description
6. Link related issues
7. Request review from maintainers

## Code Style

- Use **ES6+** syntax
- Follow **ESLint** rules (configured in project)
- Use **Prettier** for formatting
- Component names should be **PascalCase**
- Utility functions should be **camelCase**
- Constants should be **UPPER_SNAKE_CASE**

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Documentation

Update relevant documentation:
- README.md - Major changes
- docs/API.md - API changes
- docs/ARCHITECTURE.md - Architecture changes
- Component comments - Implementation details

## Performance & Security

- Avoid unnecessary re-renders
- Sanitize user inputs
- Never commit secrets
- Use HTTPS for external requests
- Keep dependencies updated

## Questions?

- Check existing issues/discussions
- Open a discussion for questions
- Email: [maintainer contact]

Thank you for contributing! 🙏
