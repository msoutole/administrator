# Administrator 🤖

<div align="center">

**AI-powered CLI tool to analyze & classify GitHub repositories automatically**

[![CI](https://github.com/msoutole/administrator/workflows/CI/badge.svg)](https://github.com/msoutole/administrator/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-%3E%3D16.0.0-green.svg)](https://nodejs.org/)
[![Coverage](https://img.shields.io/badge/coverage-70%25+-brightgreen.svg)](./coverage)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage](#usage)
  - [CLI Commands](#cli-commands)
  - [Programmatic API](#programmatic-api)
- [Analysis Features](#analysis-features)
  - [Automatic Analysis](#automatic-analysis)
  - [Quality Scoring](#quality-scoring)
  - [Documentation Generation](#documentation-generation)
- [Configuration Schema](#configuration-schema)
- [Architecture](#architecture)
- [Development](#development)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
  - [Building](#building)
  - [Testing](#testing)
  - [Linting](#linting)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)
- [Support](#support)

---

## 🌟 Overview

**Administrator** is a powerful AI-driven command-line interface (CLI) tool designed to automatically analyze, score, and classify GitHub repositories. It leverages artificial intelligence to provide comprehensive insights into repository quality, code health, documentation completeness, and best practices adherence.

### Why Administrator?

- **Automated Quality Assessment**: Get instant quality scores for any GitHub repository
- **AI-Powered Insights**: Leverage machine learning to identify patterns and issues
- **Time-Saving**: Quickly evaluate multiple repositories without manual review
- **Actionable Metrics**: Receive detailed reports with actionable recommendations
- **Customizable**: Configure analysis parameters to match your specific needs
- **Type-Safe**: Built with TypeScript for reliability and maintainability

---

## ✨ Features

### 🔍 Automatic Analysis

- **Repository Scanning**: Automatically fetch and analyze GitHub repositories
- **Multi-Metric Evaluation**: Assess code quality, documentation, testing, and more
- **Pattern Recognition**: Identify common issues and best practices
- **Batch Processing**: Analyze multiple repositories in a single run
- **Caching**: Smart caching to avoid redundant API calls

### 📊 Quality Scoring

- **Comprehensive Scoring**: Generate quality scores from 0-100
- **Multiple Dimensions**: Evaluate across various quality dimensions
  - Code quality and maintainability
  - Documentation completeness
  - Test coverage
  - Community engagement
  - Security practices
  - Dependency health
- **Historical Tracking**: Track quality improvements over time
- **Customizable Weights**: Adjust scoring criteria to your priorities

### 📝 Documentation Generation

- **Auto-Documentation**: Generate comprehensive repository documentation
- **Markdown Reports**: Create detailed analysis reports in Markdown
- **JSON Export**: Export data in JSON format for further processing
- **Template System**: Use customizable templates for reports
- **Integration Ready**: Easy integration with documentation platforms

### ⚙️ Configuration

- **JSON Schema**: Reusable configuration with JSON Schema validation
- **Environment Variables**: Support for .env configuration
- **Multiple Profiles**: Define and switch between configuration profiles
- **Validation**: Automatic configuration validation with helpful error messages

### 🛠️ Developer Experience

- **TypeScript**: Full TypeScript support with comprehensive type definitions
- **CLI & API**: Use as a CLI tool or integrate into your applications
- **Extensible**: Plugin architecture for custom analyzers
- **Well-Tested**: 70%+ test coverage with comprehensive test suite
- **Modern Tooling**: ESLint, Prettier, Jest, and more

---

## 📦 Installation

### Using npm

```bash
npm install -g administrator
```

### Using yarn

```bash
yarn global add administrator
```

### From Source

```bash
git clone https://github.com/msoutole/administrator.git
cd administrator
npm install
npm run build
npm link
```

---

## 🚀 Quick Start

### 1. Set Up Environment

Create a `.env` file with your credentials:

```bash
cp .env.example .env
```

Edit `.env` and add your tokens:

```env
GITHUB_TOKEN=your_github_token_here
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Analyze a Repository

```bash
administrator analyze https://github.com/owner/repository
```

### 3. View Results

The analysis results will be displayed in your terminal and saved to the output directory.

---

## ⚙️ Configuration

Administrator can be configured using multiple methods:

### Environment Variables

Create a `.env` file in your project root:

```env
# GitHub Personal Access Token
GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# OpenAI API Key
OPENAI_API_KEY=sk-xxxxxxxxxxxx

# Analysis Settings
MIN_QUALITY_SCORE=50
MAX_REPOS_PER_BATCH=10
VERBOSE=true
CACHE_DIR=.cache/administrator
ANALYSIS_TIMEOUT=30000
```

### Configuration File

Create an `administrator.config.json` file:

```json
{
  "github": {
    "token": "${GITHUB_TOKEN}",
    "apiVersion": "2022-11-28"
  },
  "analysis": {
    "minQualityScore": 50,
    "maxReposPerBatch": 10,
    "timeout": 30000,
    "cache": {
      "enabled": true,
      "directory": ".cache/administrator",
      "ttl": 86400
    }
  },
  "scoring": {
    "weights": {
      "codeQuality": 0.25,
      "documentation": 0.2,
      "testing": 0.2,
      "community": 0.15,
      "security": 0.15,
      "dependencies": 0.05
    }
  },
  "output": {
    "format": "markdown",
    "directory": "./reports",
    "includeJson": true
  }
}
```

### CLI Arguments

Override configuration with command-line arguments:

```bash
administrator analyze owner/repo \
  --min-score 70 \
  --format json \
  --output ./custom-reports \
  --verbose
```

---

## 📖 Usage

### CLI Commands

#### Analyze a Repository

```bash
# Basic analysis
administrator analyze owner/repository

# With full URL
administrator analyze https://github.com/owner/repository

# Multiple repositories
administrator analyze owner/repo1 owner/repo2 owner/repo3

# With options
administrator analyze owner/repo --format json --verbose
```

#### Batch Analysis

```bash
# Analyze from a file
administrator batch --file repositories.txt

# Analyze organization
administrator batch --org microsoft --limit 50
```

#### Generate Report

```bash
# Generate report from previous analysis
administrator report --input analysis.json --output report.md

# Custom template
administrator report --template ./templates/custom.md
```

#### Configuration

```bash
# Validate configuration
administrator config validate

# Show current configuration
administrator config show

# Initialize configuration
administrator config init
```

### Programmatic API

Use Administrator in your Node.js applications:

```typescript
import { RepositoryAnalyzer, Config } from 'administrator';

// Initialize analyzer
const config: Config = {
  github: {
    token: process.env.GITHUB_TOKEN,
  },
  analysis: {
    minQualityScore: 50,
  },
};

const analyzer = new RepositoryAnalyzer(config);

// Analyze a repository
async function analyzeRepo() {
  try {
    const result = await analyzer.analyze('owner/repository');

    console.log(`Quality Score: ${result.score}`);
    console.log(`Analysis Date: ${result.timestamp}`);
    console.log(`Metrics:`, result.metrics);

    // Generate report
    const report = await analyzer.generateReport(result);
    console.log(report);
  } catch (error) {
    console.error('Analysis failed:', error);
  }
}

analyzeRepo();
```

---

## 🔍 Analysis Features

### Automatic Analysis

Administrator automatically evaluates repositories across multiple dimensions:

#### Code Quality Metrics

- **Complexity Analysis**: Cyclomatic complexity, code duplication
- **Code Style**: Adherence to language-specific best practices
- **Maintainability Index**: Overall code maintainability score
- **Technical Debt**: Estimated technical debt in the codebase

#### Documentation Assessment

- **README Quality**: Completeness and clarity of README.md
- **Code Comments**: Inline documentation coverage
- **API Documentation**: Presence and quality of API docs
- **Examples**: Availability of usage examples

#### Testing Evaluation

- **Test Coverage**: Percentage of code covered by tests
- **Test Quality**: Assessment of test comprehensiveness
- **CI/CD Integration**: Presence of automated testing

#### Community Health

- **Contribution Guidelines**: CONTRIBUTING.md presence
- **Code of Conduct**: CODE_OF_CONDUCT.md presence
- **Issue Management**: Issue template and response time
- **License**: Valid open-source license

#### Security Analysis

- **Dependency Vulnerabilities**: Known CVEs in dependencies
- **Security Policies**: SECURITY.md presence
- **Secret Detection**: Potential exposed secrets
- **Best Practices**: Security best practice adherence

### Quality Scoring

Quality scores are calculated using a weighted algorithm:

```typescript
interface QualityScore {
  overall: number; // 0-100
  breakdown: {
    codeQuality: number; // 0-100
    documentation: number; // 0-100
    testing: number; // 0-100
    community: number; // 0-100
    security: number; // 0-100
    dependencies: number; // 0-100
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  recommendations: string[];
}
```

**Grading Scale:**

- **A (90-100)**: Excellent - Production-ready, best practices
- **B (80-89)**: Good - Minor improvements needed
- **C (70-79)**: Fair - Several areas need attention
- **D (60-69)**: Poor - Significant improvements required
- **F (<60)**: Failing - Major issues present

### Documentation Generation

Generate comprehensive reports:

```bash
# Markdown report
administrator analyze owner/repo --format markdown

# JSON export
administrator analyze owner/repo --format json

# Both formats
administrator analyze owner/repo --format markdown,json
```

**Report Sections:**

1. Executive Summary
2. Quality Score and Grade
3. Detailed Metrics Breakdown
4. Strengths and Weaknesses
5. Actionable Recommendations
6. Comparison with Similar Projects
7. Trend Analysis (if historical data available)

---

## 📋 Configuration Schema

Administrator uses JSON Schema for configuration validation:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["github"],
  "properties": {
    "github": {
      "type": "object",
      "required": ["token"],
      "properties": {
        "token": {
          "type": "string",
          "description": "GitHub Personal Access Token"
        },
        "apiVersion": {
          "type": "string",
          "default": "2022-11-28"
        }
      }
    },
    "analysis": {
      "type": "object",
      "properties": {
        "minQualityScore": {
          "type": "number",
          "minimum": 0,
          "maximum": 100,
          "default": 50
        },
        "maxReposPerBatch": {
          "type": "number",
          "minimum": 1,
          "maximum": 100,
          "default": 10
        },
        "timeout": {
          "type": "number",
          "minimum": 1000,
          "default": 30000
        }
      }
    }
  }
}
```

See [docs/config-schema.json](./docs/config-schema.json) for the complete schema.

---

## 🏗️ Architecture

### Project Structure

```
administrator/
├── src/                    # Source code
│   ├── analyzers/         # Analysis modules
│   ├── cli/               # CLI implementation
│   ├── config/            # Configuration handling
│   ├── reporters/         # Report generation
│   ├── schemas/           # JSON schemas
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── tests/                 # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── fixtures/         # Test fixtures
├── docs/                  # Documentation
│   ├── api/              # API documentation
│   ├── guides/           # User guides
│   └── examples/         # Example configurations
├── .github/              # GitHub configuration
│   └── workflows/        # CI/CD workflows
└── dist/                 # Compiled output
```

### Core Components

1. **RepositoryAnalyzer**: Main analysis orchestrator
2. **GitHubClient**: GitHub API interaction layer
3. **ScoringEngine**: Quality score calculation
4. **ReportGenerator**: Documentation and report creation
5. **ConfigManager**: Configuration loading and validation

---

## 🛠️ Development

### Prerequisites

- **Node.js**: >= 16.0.0
- **npm**: >= 7.0.0 or **yarn**: >= 1.22.0
- **Git**: >= 2.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/msoutole/administrator.git
cd administrator

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your tokens in .env
nano .env
```

### Building

```bash
# Build once
npm run build

# Watch mode (development)
npm run dev
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- tests/unit/analyzer.test.ts
```

### Linting

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# Check code formatting
npm run format:check

# Format code
npm run format
```

### Validation

Run all checks before committing:

```bash
npm run validate
```

This runs: lint → format:check → test:coverage → build

---

## 📚 API Reference

### RepositoryAnalyzer

Main class for repository analysis.

```typescript
class RepositoryAnalyzer {
  constructor(config: Config);

  analyze(repository: string): Promise<AnalysisResult>;

  batchAnalyze(repositories: string[]): Promise<AnalysisResult[]>;

  generateReport(result: AnalysisResult): Promise<string>;
}
```

### Types

```typescript
interface AnalysisResult {
  repository: RepositoryInfo;
  score: QualityScore;
  metrics: RepositoryMetrics;
  timestamp: Date;
  duration: number;
}

interface RepositoryInfo {
  owner: string;
  name: string;
  url: string;
  description?: string;
  language?: string;
  stars: number;
  forks: number;
}

interface RepositoryMetrics {
  codeQuality: CodeQualityMetrics;
  documentation: DocumentationMetrics;
  testing: TestingMetrics;
  community: CommunityMetrics;
  security: SecurityMetrics;
  dependencies: DependencyMetrics;
}
```

See [docs/api/types.md](./docs/api/types.md) for complete type definitions.

---

## 💡 Examples

### Example 1: Basic Analysis

```typescript
import { RepositoryAnalyzer } from 'administrator';

const analyzer = new RepositoryAnalyzer({
  github: { token: process.env.GITHUB_TOKEN },
});

const result = await analyzer.analyze('facebook/react');
console.log(`Score: ${result.score.overall}/100`);
```

### Example 2: Batch Analysis with Filtering

```typescript
import { RepositoryAnalyzer } from 'administrator';

const analyzer = new RepositoryAnalyzer({
  github: { token: process.env.GITHUB_TOKEN },
  analysis: { minQualityScore: 70 },
});

const repos = ['vuejs/vue', 'angular/angular', 'sveltejs/svelte'];

const results = await analyzer.batchAnalyze(repos);
const highQuality = results.filter((r) => r.score.overall >= 70);

console.log(`${highQuality.length} high-quality repositories found`);
```

### Example 3: Custom Scoring Weights

```typescript
const analyzer = new RepositoryAnalyzer({
  github: { token: process.env.GITHUB_TOKEN },
  scoring: {
    weights: {
      codeQuality: 0.3, // 30%
      documentation: 0.3, // 30%
      testing: 0.2, // 20%
      community: 0.1, // 10%
      security: 0.1, // 10%
      dependencies: 0.0, // 0% (ignore)
    },
  },
});

const result = await analyzer.analyze('owner/repo');
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on:

- Code of Conduct
- Development setup
- Coding standards
- Testing guidelines
- Pull request process

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a list of changes and version history.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🆘 Support

### Documentation

- **User Guides**: [docs/guides/](./docs/guides/)
- **API Documentation**: [docs/api/](./docs/api/)
- **Examples**: [docs/examples/](./docs/examples/)

### Community

- **Issues**: [GitHub Issues](https://github.com/msoutole/administrator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/msoutole/administrator/discussions)

### Getting Help

If you encounter issues:

1. Check the [documentation](./docs/)
2. Search [existing issues](https://github.com/msoutole/administrator/issues)
3. Open a new issue with details

---

## 🙏 Acknowledgments

- Built with [TypeScript](https://www.typescriptlang.org/)
- Powered by [Octokit](https://github.com/octokit/rest.js)
- Tested with [Jest](https://jestjs.io/)
- Linted with [ESLint](https://eslint.org/)
- Formatted with [Prettier](https://prettier.io/)

---

<div align="center">

**Made with ❤️ by [Matheus Souto Leal](https://github.com/msoutole)**

⭐ Star this repository if you find it helpful!

</div>
