# Contributing to Administrator

Thank you for your interest in contributing to Administrator! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your contribution
4. Make your changes
5. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn package manager
- Git

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/administrator.git
cd administrator

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
# Add your GITHUB_TOKEN and OPENAI_API_KEY
```

### Building the Project

```bash
# Build TypeScript to JavaScript
npm run build

# Watch mode for development
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **Bug fixes**: Fix issues reported in the issue tracker
- **Feature additions**: Implement new features
- **Documentation**: Improve or add documentation
- **Tests**: Add or improve test coverage
- **Code quality**: Refactoring and optimization

### Workflow

1. **Check existing issues**: Look for existing issues or create a new one
2. **Discuss**: Comment on the issue to discuss your approach
3. **Fork and branch**: Create a feature branch from `main`
4. **Implement**: Make your changes following our coding standards
5. **Test**: Ensure all tests pass and coverage remains above 70%
6. **Document**: Update documentation as needed
7. **Submit PR**: Create a pull request with a clear description

### Branch Naming Convention

Use descriptive branch names:

- `feature/add-new-analyzer`
- `fix/github-api-error`
- `docs/update-readme`
- `test/improve-coverage`

## Coding Standards

### TypeScript Guidelines

- Use strict TypeScript with no `any` types unless absolutely necessary
- Define proper interfaces and types for all data structures
- Use meaningful variable and function names
- Keep functions small and focused on a single responsibility
- Use async/await instead of callbacks or raw promises

### Code Style

We use ESLint and Prettier to enforce consistent code style:

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Always use semicolons
- **Line length**: Maximum 100 characters
- **Naming conventions**:
  - camelCase for variables and functions
  - PascalCase for classes and types
  - UPPER_CASE for constants

### Example

```typescript
// Good
interface RepositoryAnalysis {
  score: number;
  metrics: QualityMetrics;
  timestamp: Date;
}

async function analyzeRepository(repoUrl: string): Promise<RepositoryAnalysis> {
  const data = await fetchRepositoryData(repoUrl);
  return processAnalysis(data);
}

// Avoid
function analyze(url: any) {
  // Missing types, unclear function name
  return fetchRepositoryData(url).then((data) => processAnalysis(data));
}
```

## Testing Guidelines

### Test Requirements

- All new features must include tests
- Maintain minimum 70% code coverage
- Write both unit tests and integration tests where applicable
- Use descriptive test names

### Writing Tests

```typescript
describe('RepositoryAnalyzer', () => {
  describe('analyzeRepository', () => {
    it('should return quality score for valid repository', async () => {
      const analyzer = new RepositoryAnalyzer();
      const result = await analyzer.analyzeRepository('owner/repo');

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should throw error for invalid repository URL', async () => {
      const analyzer = new RepositoryAnalyzer();

      await expect(analyzer.analyzeRepository('invalid-url')).rejects.toThrow(
        'Invalid repository URL'
      );
    });
  });
});
```

### Test Coverage

Run coverage reports before submitting:

```bash
npm run test:coverage
```

Ensure all metrics (branches, functions, lines, statements) are above 70%.

## Pull Request Process

### Before Submitting

1. **Update your branch**: Rebase on latest `main`
2. **Run validation**: Execute `npm run validate`
3. **Update documentation**: Ensure README and docs reflect your changes
4. **Update CHANGELOG**: Add entry in CHANGELOG.md under "Unreleased"
5. **Self-review**: Review your own code for quality and completeness

### PR Description

Include in your pull request:

- **Summary**: Brief description of changes
- **Motivation**: Why this change is needed
- **Testing**: How you tested the changes
- **Screenshots**: For UI changes (if applicable)
- **Breaking changes**: List any breaking changes
- **Related issues**: Reference related issues with #issue_number

### Example PR Template

```markdown
## Summary

Add support for analyzing private repositories

## Motivation

Users need to analyze their private repositories for quality metrics

## Changes

- Added authentication handling for private repos
- Updated GitHub API client configuration
- Added tests for private repository access

## Testing

- Added unit tests for authentication
- Manually tested with private repository
- All existing tests pass

## Related Issues

Closes #42
```

### Review Process

- At least one maintainer must approve the PR
- All CI checks must pass
- Code coverage must remain above 70%
- No merge conflicts with main branch

## Reporting Bugs

### Before Reporting

1. Check existing issues for duplicates
2. Verify the bug in the latest version
3. Collect relevant information

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:

1. Run command '...'
2. With parameters '...'
3. See error

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Environment:**

- OS: [e.g., Ubuntu 22.04]
- Node version: [e.g., 18.0.0]
- Administrator version: [e.g., 1.0.0]

**Additional context**
Error messages, logs, screenshots, etc.
```

## Suggesting Features

### Feature Request Template

```markdown
**Feature Description**
Clear description of the proposed feature.

**Use Case**
Why is this feature needed? What problem does it solve?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Other approaches you've considered.

**Additional Context**
Mockups, examples, related features, etc.
```

## Questions?

If you have questions:

- Open an issue with the "question" label
- Check existing documentation in the `docs/` directory
- Review the README.md for common usage patterns

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Administrator! 🎉
