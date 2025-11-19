# Getting Started with Administrator

This guide will help you get started with Administrator, the AI-powered GitHub repository analyzer.

## Installation

### Prerequisites

Before installing Administrator, ensure you have:

- **Node.js** version 16.0.0 or higher
- **npm** or **yarn** package manager
- A **GitHub Personal Access Token**

### Install via npm

```bash
npm install -g administrator
```

### Install via yarn

```bash
yarn global add administrator
```

### Install from source

```bash
git clone https://github.com/msoutole/administrator.git
cd administrator
npm install
npm run build
npm link
```

## Configuration

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Add Your Credentials

Edit the `.env` file and add your tokens:

```env
GITHUB_TOKEN=ghp_your_token_here
OPENAI_API_KEY=sk_your_key_here
```

#### How to get a GitHub Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name
4. Select scopes: `repo`, `read:org`, `read:user`
5. Click "Generate token"
6. Copy the token and add it to your `.env` file

#### How to get an OpenAI API Key

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Copy the key and add it to your `.env` file

## First Analysis

Analyze your first repository:

```bash
administrator analyze facebook/react
```

This will:
1. Fetch repository information from GitHub
2. Analyze multiple quality dimensions
3. Generate a quality score and grade
4. Create a detailed report

## Understanding the Output

The analysis provides:

- **Overall Score**: 0-100 quality score
- **Grade**: A, B, C, D, or F
- **Score Breakdown**: Individual scores for each dimension
- **Recommendations**: Actionable suggestions for improvement

Example output:

```
📊 Analysis Results

Repository: facebook/react
Overall Score: 92/100 (Grade: A)
Duration: 8.5s

📈 Score Breakdown:

  codeQuality: 88/100
  documentation: 95/100
  testing: 90/100
  community: 94/100
  security: 91/100
  dependencies: 85/100
```

## Next Steps

- Read the [CLI Usage Guide](./cli-usage.md) for advanced commands
- Learn about [Configuration Options](./configuration.md)
- Explore the [API Documentation](../api/README.md) for programmatic usage
- Check out [Examples](../examples/) for common use cases

## Troubleshooting

### "GitHub token is required" error

Make sure you have:
1. Created a `.env` file
2. Added `GITHUB_TOKEN=your_token` to it
3. The token has proper permissions

### "Rate limit exceeded" error

GitHub API has rate limits:
- Authenticated: 5,000 requests/hour
- Unauthenticated: 60 requests/hour

Wait for the limit to reset or use a different token.

### Build errors

If you encounter build errors:

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## Getting Help

- Check the [FAQ](./faq.md)
- Read the [full documentation](../README.md)
- Open an [issue](https://github.com/msoutole/administrator/issues)
- Join [discussions](https://github.com/msoutole/administrator/discussions)
